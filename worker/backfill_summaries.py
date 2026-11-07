"""
One-off: write a summary for every done job whose current session has a
transcript but no summary yet (jobs finished before summaries existed).

    cd /home/ubuntu/app/worker && AWS_DEFAULT_REGION=us-east-1 venv/bin/python backfill_summaries.py
"""
import os

os.environ.setdefault("JOB_ID", "backfill")  # worker.py only reads JOB_ID inside main()

from worker import db, write_summary  # noqa: E402


def main() -> None:
    jobs = db.table("jobs").select("id, language, current_session_id").eq("status", "done").execute().data
    for job in jobs:
        sid = job["current_session_id"]
        if not sid:
            continue
        sess = db.table("job_sessions").select("subtitle_txt_content, summary").eq("id", sid).single().execute().data
        if sess["summary"] or not sess["subtitle_txt_content"]:
            continue
        write_summary(job["id"], sid, sess["subtitle_txt_content"], job["language"])


if __name__ == "__main__":
    main()
