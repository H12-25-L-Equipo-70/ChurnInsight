# ChurnInsight AI Service - FastAPI Microservice

## 📋 Descripción

Servicio de predicción de **Churn (abandono)** para SMEs fintech basado en **FastAPI**. Proporciona endpoints robustos para:

- **Predicción Individual**: `/api/v1/predictions/predict` - Predice churn para una empresa
- **Predicción Batch**: `/api/v1/predictions/batch` - Predice para múltiples empresas
- **Health Checks**: `/api/v1/health/check` - Verifica estado de la aplicación
- **Model Info**: `/api/v1/health/model-info` - Detalles técnicos del modelo
- **Documentación Interactiva**: `/api/v1/docs` - Swagger UI

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────┐
│    FastAPI Application (main.py)        │
│  - CORS middleware                      │
│  - Error handling                       │
│  - Request logging                      │
└────────────┬────────────────────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼                 ▼
┌──────────────────┐  ┌──────────────────┐
│  Predictions     │  │  Health & Info   │
│  Routes          │  │  Routes          │
│  - /predict      │  │  - /check        │
│  - /batch        │  │  - /model-info   │
│  - /statistics   │  │  - /ready        │
└────────┬─────────┘  └──────┬───────────┘
         │                   │
    ┌────┴───────────────────┴────┐
    │                             │
    ▼                             ▼
┌──────────────────────┐  ┌──────────────────────┐
│  Model Manager       │  │  Oracle Connection   │
│  - load_model()      │  │  - get_connection()  │
│  - predict()         │  │  - insert_prediction │
│  - batch_predict()   │  │  - get_company_data  │
└──────────────────────┘  └──────────────────────┘
         │                             │
    ┌────┴─────────────────────────────┴────┐
    │                                       │
    ▼                                       ▼
┌────────────────────────┐  ┌──────────────────────────────┐
│  SKlearn Model         │  │  Oracle Database             │
│  - RandomForest        │  │  - EMPRESAS table            │
│  - Predictions         │  │  - PREDICCIONES table        │
│  - Feature scaling     │  │  - Wallet authentication     │
└────────────────────────┘  └──────────────────────────────┘
```

---

## 🚀 Quick Start

### 1. Instalación de dependencias

```bash
cd ai_service/

# Crear virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt
```

### 2. Configuración

```bash
# Copiar template de variables de entorno
cp .env.example .env

# Editar .env con tus credenciales de Oracle
nano .env
```

**Campos obligatorios en .env**:
```
ORACLE_PASSWORD=tu_contraseña
ORACLE_WALLET_PATH=../backend/wallet_pymer
```

### 3. Entrenar modelo

```bash
# Entrenar con dataset existente o datos de demostración
python train_model.py

# Output esperado:
# ✅ Modelo guardado: ./models/churn_model.pkl
# ✅ Scaler guardado: ./models/scaler.pkl
```

### 4. Ejecutar aplicación

```bash
# Desarrollo (con auto-reload)
python -m uvicorn main:app --reload --port 8000

# Producción (con workers)
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

**Verificar que la app está corriendo**:
```bash
curl http://localhost:8000/api/v1/health/check
```

---

## 📡 Endpoints Principales

### Health Checks

#### GET `/api/v1/health/check`
Verifica estado general de la aplicación.

**Response**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "model_loaded": true,
  "database_connected": true,
  "timestamp": "2024-01-07T15:30:00Z"
}
```

#### GET `/api/v1/health/ready`
Para Kubernetes/Docker - verifica si la app está lista para tráfico.

#### GET `/api/v1/health/live`
Para Kubernetes/Docker - verifica si la app está viva.

#### GET `/api/v1/health/model-info`
Información detallada del modelo ML.

**Response**:
```json
{
  "model_type": "RandomForestClassifier",
  "model_path": "./models/churn_model.pkl",
  "threshold": 0.5,
  "features_count": 13,
  "features": [
    "ingresos",
    "gastos",
    "margen_operativo",
    "deuda_total",
    ...
  ],
  "version": "1.0.0",
  "status": "loaded"
}
```

---

### Predicción Individual

#### POST `/api/v1/predictions/predict`
Realiza predicción de churn para una empresa.

**Request**:
```json
{
  "cuit": "20748123114",
  "ingresos": 1500000.00,
  "gastos": 1000000.00,
  "margen_operativo": 33.33,
  "deuda_total": 500000.00,
  "activos_totales": 2000000.00,
  "prestamos_solicitados": 3,
  "prestamos_aprobados": 2,
  "trimestre_dias_actividad": 85,
  "trimestre_logins_promedio": 12.5,
  "transferencias_trimestre": 45,
  "pagos_trimestre": 30,
  "creditos_trimestre": 15
}
```

**Response**:
```json
{
  "cuit": "20748123114",
  "probability": 0.23,
  "risk_level": "bajo",
  "confidence": 0.95,
  "timestamp": "2024-01-07T15:30:00Z",
  "features_used": 13
}
```

**Interpretación**:
- `probability`: Valor entre 0-1, probabilidad de churn
  - 0.0 = Muy bajo riesgo
  - 0.5 = Riesgo medio
  - 1.0 = Muy alto riesgo
- `risk_level`: 
  - `bajo`: probability < 0.4
  - `medio`: 0.4 ≤ probability < 0.7
  - `alto`: probability ≥ 0.7

---

### Predicción Batch

#### POST `/api/v1/predictions/batch`
Realiza predicciones para múltiples empresas en un solo request.

**Request**:
```json
{
  "companies": [
    {
      "cuit": "20748123114",
      "ingresos": 1500000.00,
      "gastos": 1000000.00,
      ...
    },
    {
      "cuit": "20987654321",
      "ingresos": 2000000.00,
      "gastos": 1500000.00,
      ...
    }
  ]
}
```

**Response**:
```json
{
  "total_processed": 2,
  "total_high_risk": 0,
  "total_medium_risk": 1,
  "total_low_risk": 1,
  "predictions": [
    {
      "cuit": "20748123114",
      "probability": 0.23,
      "risk_level": "bajo",
      ...
    },
    {
      "cuit": "20987654321",
      "probability": 0.56,
      "risk_level": "medio",
      ...
    }
  ],
  "timestamp": "2024-01-07T15:30:00Z"
}
```

---

## 🐳 Docker Deployment

### Construir imagen

```bash
docker build -t churninsight-ai:1.0.0 .
```

### Ejecutar contenedor

```bash
docker run -d \
  --name churninsight-ai \
  -p 8000:8000 \
  -e ORACLE_PASSWORD=tu_contraseña \
  -e ENVIRONMENT=production \
  -v /path/to/wallet_pymer:/app/wallet_pymer:ro \
  churninsight-ai:1.0.0
```

### Health check en Docker

```bash
docker exec churninsight-ai curl http://localhost:8000/api/v1/health/check
```

---

## 🔧 Configuración de Features

El modelo utiliza las siguientes features para predicción:

| Feature | Tipo | Descripción |
|---------|------|-------------|
| `ingresos` | float | Ingresos trimestrales |
| `gastos` | float | Gastos trimestrales |
| `margen_operativo` | float | Margen operativo (%) |
| `deuda_total` | float | Deuda total |
| `activos_totales` | float | Activos totales |
| `prestamos_solicitados` | int | Préstamos solicitados |
| `prestamos_aprobados` | int | Préstamos aprobados |
| `trimestre_dias_actividad` | int | Días activos (0-90) |
| `trimestre_logins_promedio` | float | Logins promedio |
| `transferencias_trimestre` | int | Transferencias |
| `pagos_trimestre` | int | Pagos |
| `creditos_trimestre` | int | Créditos |

**Nota**: Si alguna feature falta, el modelo usa 0 como placeholder. Esto puede afectar la precisión.

---

## 📊 Integración con Spring Boot Backend

### Llamar desde Spring Boot

```java
// RestTemplate
RestTemplate restTemplate = new RestTemplate();

String url = "http://localhost:8000/api/v1/predictions/predict";

PredictionRequest request = new PredictionRequest(
    "20748123114",
    1500000.00,
    1000000.00,
    ...
);

PredictionResponse response = restTemplate.postForObject(
    url,
    request,
    PredictionResponse.class
);

System.out.println("Churn probability: " + response.getProbability());
System.out.println("Risk level: " + response.getRiskLevel());
```

### Con OpenFeign

```java
@FeignClient(name = "churninsight-ai", url = "http://localhost:8000")
public interface ChurnAIClient {
    
    @PostMapping("/api/v1/predictions/predict")
    PredictionResponse predict(@RequestBody PredictionRequest request);
    
    @PostMapping("/api/v1/predictions/batch")
    BatchPredictionResponse batchPredict(@RequestBody BatchPredictionRequest request);
    
    @GetMapping("/api/v1/health/check")
    HealthResponse healthCheck();
}
```

---

## 🔍 Debugging

### Logs

Los logs se guardan en `./logs/ai_service.log` y se muestran en consola.

```bash
# Ver logs en tiempo real
tail -f ./logs/ai_service.log

# Cambiar nivel de log
export LOG_LEVEL=DEBUG
python -m uvicorn main:app --reload
```

### Verificar conexión a Oracle

```bash
# Health check
curl http://localhost:8000/api/v1/health/check

# En logs debería ver:
# ✅ Oracle Database connection successful
# ✅ Model loaded
```

### Swagger UI

Acceder a documentación interactiva:
```
http://localhost:8000/api/v1/docs
```

---

## ⚙️ Variables de Entorno

| Variable | Obligatoria | Default | Descripción |
|----------|-----------|---------|-------------|
| `ENVIRONMENT` | No | development | environment o production |
| `HOST` | No | 0.0.0.0 | Host para la app |
| `PORT` | No | 8000 | Puerto |
| `DEBUG` | No | true | Debug mode |
| `ORACLE_USER` | Sí | pymerdb | Usuario Oracle |
| `ORACLE_PASSWORD` | **Sí** | - | Contraseña Oracle |
| `ORACLE_HOST` | No | pymerdb.sa-saopaulo-1.oraclecloud.com | Host Oracle |
| `ORACLE_PORT` | No | 1522 | Puerto Oracle |
| `ORACLE_SERVICE_NAME` | No | pymerdb_high | TNS service name |
| `ORACLE_WALLET_PATH` | No | ../backend/wallet_pymer | Ruta del wallet |
| `MODEL_PATH` | No | ./models/churn_model.pkl | Ruta del modelo |
| `LOG_LEVEL` | No | INFO | Nivel de logging |
| `LOG_FILE` | No | ./logs/ai_service.log | Archivo de logs |

---

## 🚨 Troubleshooting

### Error: "Oracle Database connection failed"
- ✅ Verificar que `ORACLE_PASSWORD` está configurada
- ✅ Verificar que wallet está en `ORACLE_WALLET_PATH`
- ✅ Verificar conexión a internet
- ✅ Ver logs: `tail -f ./logs/ai_service.log`

### Error: "Model not found"
```bash
# Entrenar el modelo
python train_model.py

# Verificar que existen:
# - ./models/churn_model.pkl
# - ./models/scaler.pkl
```

### Port 8000 already in use
```bash
# Cambiar puerto
python -m uvicorn main:app --port 8001
```

### CORS errors
El servicio ya tiene CORS habilitado para todos los orígenes. Si aún hay problemas, verificar headers en request.

---

## 📈 Monitoreo en Producción

### Kubernetes Probes

El servicio incluye endpoints para Kubernetes:

```yaml
livenessProbe:
  httpGet:
    path: /api/v1/health/live
    port: 8000
  initialDelaySeconds: 40
  periodSeconds: 10

readinessProbe:
  httpGet:
    path: /api/v1/health/ready
    port: 8000
  initialDelaySeconds: 20
  periodSeconds: 5
```

### Prometheus Metrics (Opcional)

Agregar en futuro para monitoreo:
```python
from prometheus_client import Counter, Histogram
predictions_total = Counter('predictions_total', 'Total predictions')
prediction_latency = Histogram('prediction_latency', 'Prediction latency')
```

---

## 📝 Notas Importantes

1. **Modelo de Demostración**: Si no existe el archivo de modelo, se usa un modelo simulado basado en heurísticas
2. **Wallet Security**: El wallet debe estar protegido y nunca commitearse a git
3. **Production Ready**: El código está listo para producción con:
   - Error handling completo
   - Logging detallado
   - Health checks
   - CORS configurado
   - Docker support

---

## 🔗 URLs Importantes

| Endpoint | URL |
|----------|-----|
| **Swagger Docs** | http://localhost:8000/api/v1/docs |
| **ReDoc** | http://localhost:8000/api/v1/redoc |
| **OpenAPI JSON** | http://localhost:8000/api/v1/openapi.json |
| **Health Check** | http://localhost:8000/api/v1/health/check |
| **Predicción** | http://localhost:8000/api/v1/predictions/predict |

---

## 📞 Contacto

**Desarrollado por**: PyMer Data Science Team  
**Versión**: 1.0.0  
**Fecha**: 2024-01-07  

Para preguntas o issues, contactar al equipo de DevOps.
