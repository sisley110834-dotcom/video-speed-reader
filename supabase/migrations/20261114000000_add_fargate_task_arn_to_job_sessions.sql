-- M4: the Lambda distributor is stateless, so the "already spawned" marker lives in
-- the DB. The Lambda writes the Fargate task ARN right after ecs:RunTask.
ALTER TABLE job_sessions ADD COLUMN IF NOT EXISTS fargate_task_arn TEXT;
CREATE INDEX IF NOT EXISTS idx_job_sessions_unspawned
  ON job_sessions (id) WHERE fargate_task_arn IS NULL;
