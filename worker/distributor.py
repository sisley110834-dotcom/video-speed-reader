"""
M1 distributor: polls jobs.status='pending' every 10 s and spawns one worker.py
process per pending job.

Each job is CLAIMED before spawning: an UPDATE ... WHERE status='pending' that flips
it to 'downloading'. Only the poll that wins the claim spawns a worker, so a slow or
crashed worker can't cause the same job to be spawned (and billed) again every 10 s.
A job whose worker crashes stays in 'downloading'; reset it to 'pending' to retry.

Reads SUPABASE_URL + SUPABASE_SECRET_KEY from AWS Secrets Manager.
Same auth model as worker.py — IAM instance profile grants
`secretsmanager:GetSecretValue` on the supabase-* secret names.
"""
import os
import sys
import time
import subprocess
from datetime import datetime, timezone
from pathlib import Path

import boto3
from supabase import create_client


def _load_secrets() -> dict[str, str]:
    sm = boto3.client("secretsmanager")
    return {
        "SUPABASE_URL": sm.get_secret_value(SecretId="supabase-url")["SecretString"],
        "SUPABASE_SECRET_KEY": sm.get_secret_value(SecretId="supabase-secret-key")["SecretString"],
    }


_secrets = _load_secrets()
db = create_client(_secrets["SUPABASE_URL"], _secrets["SUPABASE_SECRET_KEY"])

WORKER = Path(__file__).parent / "worker.py"
PYTHON = sys.executable  # use the same venv we're running in


def claim(job_id: str) -> bool:
    """Atomically move one job from pending to downloading. True if we got it."""
    now = datetime.now(timezone.utc).isoformat()
    res = (
        db.table("jobs")
        .update({"status": "downloading", "updated_at": now})
        .eq("id", job_id)
        .eq("status", "pending")
        .execute()
    )
    return bool(res.data)


def poll_once() -> None:
    rows = db.table("jobs").select("id").eq("status", "pending").execute().data
    for row in rows:
        if not claim(row["id"]):
            continue
        env = {**os.environ, "JOB_ID": row["id"]}
        subprocess.Popen([PYTHON, str(WORKER)], env=env)
        print(f"spawned worker for job {row['id']}", flush=True)


def main() -> None:
    print("distributor: polling every 10s. Ctrl+C to stop.", flush=True)
    while True:
        try:
            poll_once()
        except Exception as e:
            print(f"poll error: {e}", file=sys.stderr, flush=True)
        time.sleep(10)


if __name__ == "__main__":
    main()
