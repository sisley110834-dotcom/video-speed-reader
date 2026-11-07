-- Add an AI summary of the transcript, written by the worker after Whisper finishes.
alter table public.job_sessions add column summary text;
