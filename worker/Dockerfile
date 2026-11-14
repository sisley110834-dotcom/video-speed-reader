FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY worker.py .
# JOB_ID arrives from the Lambda's RunTask override. OPENAI_API_KEY, SUPABASE_URL and
# SUPABASE_SECRET_KEY are injected by ECS from Secrets Manager (task definition `secrets`).
CMD ["python", "worker.py"]
