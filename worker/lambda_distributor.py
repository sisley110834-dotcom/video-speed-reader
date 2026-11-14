"""
M4 distributor: replaces worker/distributor.py on the EC2.

EventBridge fires this Lambda every minute. For each pending job it:
  1. claims the job (UPDATE ... WHERE status='pending' -> 'downloading', same claim
     the M1 distributor used, so two ticks can never spawn the same job),
  2. makes sure jobs.current_session_id points at a job_sessions row,
  3. launches one ECS Fargate task (the worker image) with JOB_ID set,
  4. stamps job_sessions.fargate_task_arn with the task ARN.
If RunTask fails, the job goes back to 'pending' so the next tick retries it.

Talks to Supabase's REST API with the standard library only, so the function needs
no dependency layer. SUPABASE_URL / SUPABASE_SECRET_KEY are read from Secrets
Manager (the secret *names* come from env); the worker task gets its own secrets
injected by ECS, so no key is ever passed through RunTask overrides.
"""
import json
import os
import urllib.parse
import urllib.request
from datetime import datetime, timezone

import boto3

ECS_CLUSTER = os.environ["ECS_CLUSTER"]
TASK_DEFINITION = os.environ["TASK_DEFINITION"]
SUBNETS = [s for s in os.environ["SUBNETS"].split(",") if s]
SECURITY_GROUPS = [s for s in os.environ.get("SECURITY_GROUPS", "").split(",") if s]
CONTAINER_NAME = os.environ.get("CONTAINER_NAME", "worker")
MAX_SPAWNS_PER_TICK = int(os.environ.get("MAX_SPAWNS_PER_TICK", "10"))

_sm = boto3.client("secretsmanager")
_ecs = boto3.client("ecs")
SUPABASE_URL = _sm.get_secret_value(SecretId=os.environ.get("SUPABASE_URL_SECRET", "supabase-url"))["SecretString"].rstrip("/")
SUPABASE_KEY = _sm.get_secret_value(SecretId=os.environ.get("SUPABASE_KEY_SECRET", "supabase-secret-key"))["SecretString"]


def _rest(method: str, table: str, query: dict, body=None, prefer: str = "return=representation"):
    url = f"{SUPABASE_URL}/rest/v1/{table}?{urllib.parse.urlencode(query)}"
    req = urllib.request.Request(
        url,
        method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={
            "apikey": SUPABASE_KEY,
            "Authorization": f"Bearer {SUPABASE_KEY}",
            "Content-Type": "application/json",
            "Prefer": prefer,
        },
    )
    with urllib.request.urlopen(req, timeout=20) as resp:
        raw = resp.read()
        return json.loads(raw) if raw else []


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _claim(job_id: str) -> bool:
    rows = _rest("PATCH", "jobs", {"id": f"eq.{job_id}", "status": "eq.pending"},
                 {"status": "downloading", "updated_at": _now()})
    return bool(rows)


def _release(job_id: str) -> None:
    _rest("PATCH", "jobs", {"id": f"eq.{job_id}", "status": "eq.downloading"},
          {"status": "pending", "updated_at": _now()})


def _ensure_session(job: dict) -> str:
    """Reuse the linked session, or create one AND link it (a null
    current_session_id would crash worker.py at its first update_session)."""
    if job.get("current_session_id"):
        return job["current_session_id"]
    row = _rest("POST", "job_sessions", {}, {"job_id": job["id"], "session_number": 1})[0]
    _rest("PATCH", "jobs", {"id": f"eq.{job['id']}"}, {"current_session_id": row["id"]})
    return row["id"]


def _run_task(job_id: str) -> str:
    net = {"subnets": SUBNETS, "assignPublicIp": "ENABLED"}
    if SECURITY_GROUPS:
        net["securityGroups"] = SECURITY_GROUPS
    resp = _ecs.run_task(
        cluster=ECS_CLUSTER,
        taskDefinition=TASK_DEFINITION,
        launchType="FARGATE",
        count=1,
        networkConfiguration={"awsvpcConfiguration": net},
        overrides={"containerOverrides": [
            {"name": CONTAINER_NAME, "environment": [{"name": "JOB_ID", "value": job_id}]}
        ]},
        startedBy="subtitle-distributor",
    )
    if resp.get("failures") or not resp.get("tasks"):
        raise RuntimeError(f"RunTask failed: {resp.get('failures')}")
    return resp["tasks"][0]["taskArn"]


def handler(event, context):
    pending = _rest("GET", "jobs", {
        "select": "id,current_session_id",
        "status": "eq.pending",
        "order": "created_at.asc",
        "limit": str(MAX_SPAWNS_PER_TICK),
    })
    spawned, errors = [], []
    for job in pending:
        if not _claim(job["id"]):
            continue  # another tick got it
        try:
            session_id = _ensure_session(job)
            task_arn = _run_task(job["id"])
        except Exception as e:  # noqa: BLE001
            print(f"[{job['id']}] spawn failed, released back to pending: {e}", flush=True)
            _release(job["id"])
            errors.append(job["id"])
            continue
        _rest("PATCH", "job_sessions", {"id": f"eq.{session_id}"}, {"fargate_task_arn": task_arn})
        print(f"[{job['id']}] spawned {task_arn}", flush=True)
        spawned.append(job["id"])
    print(f"tick: {len(pending)} pending, {len(spawned)} spawned, {len(errors)} errors", flush=True)
    return {"pending": len(pending), "spawned": spawned, "errors": errors}
