FROM python:3.13-slim

WORKDIR /app

# System deps for Pillow (avatar processing) — keep the image lean.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libjpeg62-turbo \
    zlib1g \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

# Cloudflare Containers routes to this port (see src/index.js defaultPort).
ENV PORT=8080
EXPOSE 8080

CMD ["gunicorn", "-w", "1", "--threads", "4", "-b", "0.0.0.0:8080", "run:app"]
