# ⚡ Quick Start - FastAPI AI Service

## 5 Minutos de Setup

### Paso 1: Instalación (2 minutos)

```bash
cd ai_service/

# Virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Dependencias
pip install -r requirements.txt
```

### Paso 2: Configuración (1 minuto)

```bash
# Copiar variables de entorno
cp .env.example .env

# Editar .env (cambiar ORACLE_PASSWORD)
nano .env
```

### Paso 3: Entrenar Modelo (1 minuto)

```bash
# Crear modelo (con datos reales o de demostración)
python train_model.py

# Salida esperada:
# ✅ Modelo guardado: ./models/churn_model.pkl
# ✅ Scaler guardado: ./models/scaler.pkl
```

### Paso 4: Ejecutar (1 minuto)

```bash
# Iniciar servidor
python -m uvicorn main:app --reload --port 8000

# Output:
# INFO:     Uvicorn running on http://0.0.0.0:8000
```

### Paso 5: Verificar

```bash
# En otra terminal
curl http://localhost:8000/api/v1/health/check
```

**✅ App corriendo si ves un JSON con status "healthy"**

---

## 🧪 Test Rápido

### Health Check
```bash
curl http://localhost:8000/api/v1/health/check
```

### Predicción Individual
```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "20748123114",
    "ingresos": 1500000,
    "gastos": 1000000,
    "deuda_total": 500000,
    "activos_totales": 2000000,
    "trimestre_dias_actividad": 85
  }'
```

### Documentación
```
http://localhost:8000/api/v1/docs
```

---

## 🐳 Docker Quick Start

```bash
# Build
docker build -t churninsight-ai:1.0.0 .

# Run
docker run -d \
  --name churninsight-ai \
  -p 8000:8000 \
  -e ORACLE_PASSWORD=tu_password \
  churninsight-ai:1.0.0

# Verificar
docker logs churninsight-ai
docker exec churninsight-ai curl http://localhost:8000/api/v1/health/check
```

---

## 📁 Estructura de Carpetas

```
ai_service/
├── main.py                 # Aplicación principal
├── train_model.py         # Entrenar modelo
├── requirements.txt       # Dependencias Python
├── Dockerfile            # Para Docker
├── .env.example          # Variables de entorno
├── README_AI.md          # Documentación completa
├── API_DOCUMENTATION.md  # API Reference
├── test_endpoints.sh     # Tests
│
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── health.py     # Health endpoints
│   │   └── predictions.py # Prediction endpoints
│   ├── core/
│   │   ├── oracle_connection.py  # DB connection
│   │   └── model_manager.py      # Model handling
│   └── schemas/
│       └── prediction.py  # Request/Response models
│
├── config/
│   ├── __init__.py
│   └── settings.py        # Configuration
│
├── models/
│   ├── churn_model.pkl   # Trained model
│   └── scaler.pkl        # Feature scaler
│
├── logs/
│   └── ai_service.log    # Application logs
│
└── data/
    └── dataset_empresas_fintech_v2.7.csv
```

---

## 🚀 Próximos Pasos

1. **Entrenar con datos reales**
   ```bash
   # Copiar dataset real a ./data/
   cp /path/to/dataset.csv ./data/dataset_empresas_fintech_v2.7.csv
   python train_model.py
   ```

2. **Integrar con Backend Spring Boot**
   - Backend llama a `/api/v1/predictions/predict`
   - Ambos servicios en Docker
   - `docker-compose.yml` ya está configurado

3. **Deploy a Oracle Cloud**
   ```bash
   docker-compose up -d
   ```

---

## 🆘 Troubleshooting

| Problema | Solución |
|----------|----------|
| Port 8000 ocupado | Cambiar a otro puerto: `--port 8001` |
| Oracle no conecta | Verificar `ORACLE_PASSWORD` en `.env` |
| Modelo no existe | Ejecutar `python train_model.py` |
| Import error | Reinstalar: `pip install -r requirements.txt` |

---

## 📊 Endpoints Disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `GET` | `/api/v1/health/check` | Health status |
| `GET` | `/api/v1/health/model-info` | Model info |
| `POST` | `/api/v1/predictions/predict` | Single prediction |
| `POST` | `/api/v1/predictions/batch` | Batch predictions |
| `GET` | `/api/v1/docs` | Swagger UI |

---

## 📞 Contacto

Preguntas? Ver:
- 📖 [README_AI.md](README_AI.md) - Documentación completa
- 📚 [API_DOCUMENTATION.md](API_DOCUMENTATION.md) - API Reference
- 🐛 [test_endpoints.sh](test_endpoints.sh) - Ejemplos de requests

---

**¡Listo! Ahora tienes un servicio de predicción de churn completamente funcional. 🚀**
