# Etapa 1: Builder (construcción)
FROM python:3.11-slim as builder

WORKDIR /build

# Instalar dependencias del sistema
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copiar requirements
COPY requirements.txt .

# Instalar dependencias Python
RUN pip install --no-cache-dir --user -r requirements.txt


# Etapa 2: Runtime (imagen final)
FROM python:3.11-slim

WORKDIR /app

# Instalar dependencias runtime necesarias
RUN apt-get update && apt-get install -y \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copiar instalación de Python desde builder
COPY --from=builder /root/.local /root/.local

# Actualizar PATH
ENV PATH=/root/.local/bin:$PATH
ENV PYTHONUNBUFFERED=1

# Copiar código de la aplicación
COPY . /app

# Crear directorios necesarios
RUN mkdir -p /app/logs /app/models /app/data

# Labels para metadata
LABEL maintainer="PyMer Data Science Team"
LABEL description="ChurnInsight AI Service - FastAPI Microservice"
LABEL version="1.0.0"

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/api/v1/health/live || exit 1

# Puerto
EXPOSE 8000

# Comando para iniciar la aplicación
CMD ["python", "-m", "uvicorn", "main:app", \
     "--host", "0.0.0.0", \
     "--port", "8000", \
     "--workers", "4"]
