# API Documentation - ChurnInsight AI Service

## 📚 Resumen de Endpoints

### Base URL
```
http://localhost:8000/api/v1
```

### Documentación Interactiva
```
Swagger UI: http://localhost:8000/api/v1/docs
ReDoc: http://localhost:8000/api/v1/redoc
OpenAPI JSON: http://localhost:8000/api/v1/openapi.json
```

---

## 🏥 Health & Status Endpoints

### 1. Health Check
**GET** `/health/check`

Verifica el estado completo de la aplicación.

**Response (200 OK)**:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "model_loaded": true,
  "database_connected": true,
  "timestamp": "2024-01-07T15:30:45.123456Z"
}
```

**Status Values**:
- `healthy`: Todo funciona correctamente
- `degraded`: Al menos un componente sin funcionar
- `unhealthy`: Aplicación no funcional

---

### 2. Readiness Check (Kubernetes)
**GET** `/health/ready`

Verifica si la aplicación está lista para recibir tráfico (para probes de Kubernetes).

**Response (200 OK)**:
```json
{
  "ready": true,
  "message": "Application is ready to receive traffic"
}
```

**Response (503 Service Unavailable)**:
```json
{
  "ready": false,
  "message": "Application is not ready",
  "details": {
    "model_loaded": false,
    "database_connected": false
  }
}
```

---

### 3. Liveness Check (Kubernetes)
**GET** `/health/live`

Verifica si la aplicación está viva.

**Response (200 OK)**:
```json
{
  "alive": true,
  "timestamp": "2024-01-07T15:30:45.123456Z"
}
```

---

### 4. Model Information
**GET** `/health/model-info`

Retorna información técnica del modelo de predicción.

**Response (200 OK)**:
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
    "activos_totales",
    "prestamos_solicitados",
    "prestamos_aprobados",
    "trimestre_dias_actividad",
    "trimestre_logins_promedio",
    "transferencias_trimestre",
    "pagos_trimestre",
    "creditos_trimestre"
  ],
  "version": "1.0.0",
  "status": "loaded"
}
```

---

## 🔮 Prediction Endpoints

### 1. Individual Prediction
**POST** `/predictions/predict`

Realiza predicción de churn para una empresa individual.

**Request Body**:
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

**Response (200 OK)**:
```json
{
  "cuit": "20748123114",
  "probability": 0.23,
  "risk_level": "bajo",
  "confidence": 0.95,
  "timestamp": "2024-01-07T15:30:45.123456Z",
  "features_used": 13
}
```

**Status Codes**:
- `200 OK`: Predicción exitosa
- `400 Bad Request`: Request inválido
- `500 Internal Server Error`: Error en el servidor

**Campos de Response**:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `cuit` | string | CUIT de la empresa |
| `probability` | float | Probabilidad de churn (0.0 a 1.0) |
| `risk_level` | string | Nivel de riesgo: "bajo", "medio", "alto" |
| `confidence` | float | Confianza del modelo |
| `timestamp` | datetime | Marca de tiempo de la predicción |
| `features_used` | int | Cantidad de features utilizadas |

**Interpretación de `risk_level`**:
- `bajo`: probability < 0.4 → Empresa estable
- `medio`: 0.4 ≤ probability < 0.7 → Empresa con riesgo moderado
- `alto`: probability ≥ 0.7 → Empresa con alto riesgo de abandono

---

### 2. Batch Prediction
**POST** `/predictions/batch`

Realiza predicciones para múltiples empresas en un solo request.

**Request Body**:
```json
{
  "companies": [
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
    },
    {
      "cuit": "20987654321",
      "ingresos": 800000.00,
      "gastos": 900000.00,
      "margen_operativo": -12.50,
      "deuda_total": 1200000.00,
      "activos_totales": 1000000.00,
      "prestamos_solicitados": 5,
      "prestamos_aprobados": 1,
      "trimestre_dias_actividad": 20,
      "trimestre_logins_promedio": 2.0,
      "transferencias_trimestre": 5,
      "pagos_trimestre": 3,
      "creditos_trimestre": 1
    }
  ]
}
```

**Response (200 OK)**:
```json
{
  "total_processed": 2,
  "total_high_risk": 1,
  "total_medium_risk": 0,
  "total_low_risk": 1,
  "predictions": [
    {
      "cuit": "20748123114",
      "probability": 0.23,
      "risk_level": "bajo",
      "confidence": 0.95,
      "timestamp": "2024-01-07T15:30:45.123456Z",
      "features_used": 13
    },
    {
      "cuit": "20987654321",
      "probability": 0.78,
      "risk_level": "alto",
      "confidence": 0.95,
      "timestamp": "2024-01-07T15:30:45.123456Z",
      "features_used": 13
    }
  ],
  "timestamp": "2024-01-07T15:30:45.123456Z"
}
```

**Campos Adicionales**:

| Campo | Tipo | Descripción |
|-------|------|-------------|
| `total_processed` | int | Total de empresas procesadas |
| `total_high_risk` | int | Empresas con riesgo alto |
| `total_medium_risk` | int | Empresas con riesgo medio |
| `total_low_risk` | int | Empresas con riesgo bajo |

---

## 📋 Request Field Descriptions

### Campos Obligatorios

| Campo | Tipo | Rango | Descripción |
|-------|------|-------|-------------|
| `cuit` | string | - | Identificador único de la empresa (11-13 dígitos) |
| `ingresos` | float | 0 a ∞ | Ingresos trimestrales en pesos |
| `gastos` | float | 0 a ∞ | Gastos trimestrales en pesos |

### Campos Opcionales (con defaults)

| Campo | Tipo | Default | Descripción |
|-------|------|---------|-------------|
| `margen_operativo` | float | 0.0 | Margen operativo (%) |
| `deuda_total` | float | 0.0 | Deuda total en pesos |
| `activos_totales` | float | 0.0 | Activos totales en pesos |
| `prestamos_solicitados` | int | 0 | Cantidad de préstamos solicitados |
| `prestamos_aprobados` | int | 0 | Cantidad de préstamos aprobados |
| `trimestre_dias_actividad` | int | 90 | Días activos en el trimestre (0-90) |
| `trimestre_logins_promedio` | float | 0.0 | Logins promedio del trimestre |
| `transferencias_trimestre` | int | 0 | Cantidad de transferencias |
| `pagos_trimestre` | int | 0 | Cantidad de pagos |
| `creditos_trimestre` | int | 0 | Cantidad de créditos |

---

## 🔗 Integration Examples

### Python (requests)
```python
import requests

# Individual prediction
response = requests.post(
    'http://localhost:8000/api/v1/predictions/predict',
    json={
        'cuit': '20748123114',
        'ingresos': 1500000.00,
        'gastos': 1000000.00,
        'margen_operativo': 33.33,
        'deuda_total': 500000.00,
        'activos_totales': 2000000.00,
        'prestamos_solicitados': 3,
        'prestamos_aprobados': 2,
        'trimestre_dias_actividad': 85,
        'trimestre_logins_promedio': 12.5,
        'transferencias_trimestre': 45,
        'pagos_trimestre': 30,
        'creditos_trimestre': 15
    }
)

prediction = response.json()
print(f"Risk Level: {prediction['risk_level']}")
print(f"Probability: {prediction['probability']:.2%}")
```

### JavaScript (fetch)
```javascript
const prediction = await fetch(
  'http://localhost:8000/api/v1/predictions/predict',
  {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      cuit: '20748123114',
      ingresos: 1500000.00,
      gastos: 1000000.00,
      // ... más campos
    })
  }
).then(r => r.json());

console.log(`Risk: ${prediction.risk_level}`);
console.log(`Probability: ${(prediction.probability * 100).toFixed(2)}%`);
```

### Java (RestTemplate)
```java
RestTemplate restTemplate = new RestTemplate();

PredictionRequest request = new PredictionRequest(
    "20748123114",
    1500000.00,
    1000000.00,
    33.33,
    500000.00,
    2000000.00,
    3,
    2,
    85,
    12.5,
    45,
    30,
    15
);

PredictionResponse response = restTemplate.postForObject(
    "http://localhost:8000/api/v1/predictions/predict",
    request,
    PredictionResponse.class
);

System.out.println("Risk: " + response.getRiskLevel());
```

### cURL
```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d 
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

---

## 🚨 Error Responses

### 400 Bad Request
```json
{
  "error": "Invalid request",
  "detail": "Field 'ingresos' is required",
  "timestamp": "2024-01-07T15:30:45.123456Z",
  "path": "/api/v1/predictions/predict"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "detail": "An error occurred during prediction",
  "timestamp": "2024-01-07T15:30:45.123456Z",
  "path": "/api/v1/predictions/predict"
}
```

---

## 📊 Rate Limiting & Performance

**Recomendaciones**:
- Individual predictions: Max 100 req/segundo
- Batch predictions: Max 10 requests/segundo con max 1000 empresas por batch
- Respuesta típica: 50-200ms por predicción

---

## 🔐 Security Notes

- ✅ No se almacenan datos sensibles
- ✅ Oracle Wallet para autenticación
- ✅ HTTPS recomendado en producción
- ✅ Validación de inputs en todos los endpoints

---

## 📞 Versioning

**API Version**: v1  
**Last Updated**: 2024-01-07  
**Maintainer**: PyMer Data Science Team
