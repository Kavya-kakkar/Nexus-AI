FROM python:3.11-slim

WORKDIR /app

# Install system dependencies (required for some packages)
RUN apt-get update && apt-get install -y gcc g++ ffmpeg libsm6 libxext6 && \
    rm -rf /var/lib/apt/lists/*

# Install heavy AI dependencies (CPU-only versions) first to optimize cache and size
RUN pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu

COPY requirements.txt .
# Filter out standard torch from requirements if it exists to avoid double installation
RUN sed -i '/torch/d' requirements.txt && \
    pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
