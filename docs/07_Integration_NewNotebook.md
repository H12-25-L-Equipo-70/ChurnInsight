# 🔄 Integración AI Service - New Notebook Churn Prediction

## ✅ Cambios Realizados

### 1. Schema de Entrada Mejorado (EmpresaInput)
**Archivo**: `ai_service/app/schemas/prediction.py`

Integración completa del `new_notebook.md` con 30+ campos estructurados:

```python
class EmpresaInput(BaseModel):
    # Identificación
    CUIT: str
    NOMBRE_EMPRESA: str
    PERIODO_FISCAL: str
    
    # Estructura financiera (5 campos)
    EMPLEADOS: int
    INGRESOS: float
    GASTOS: float
    DEUDA: float
    ACTIVOS: float
    
    # Comportamiento de crédito (8 campos)
    PRESTAMOS_SOLICITADOS: int
    PRESTAMOS_APROBADOS: int
    MONTO_SOLICITADO: float
    MONTO_APROBADO: float
    TICKET_PROMEDIO_SOLICITADO: float
    TICKET_PROMEDIO_APROBADO: float
    PRESTAMOS_CANCELADOS: int
    PRESTAMOS_VIGENTES: int
    
    # Gestión de crédito (1 campo)
    TIEMPO_CANCELACION_PRESTAMO: int
    
    # Transaccionalidad (5 campos)
    SERVICIOS_UTILIZADOS: int
    TRANSFERENCIAS: int
    PAGOS: int
    CREDITOS: int
    INVERSIONES: int
    
    # Engagement/Actividad (4 campos)
    TRIMESTRE_DIAS_ACTIVIDAD: int
    TRIMESTRE_DIAS_INACTIVIDAD: int
    PROMEDIO_LOGIN_DIA: float
    TOTAL_LOGIN_DIA: int
```

### 2. Respuesta Mejorada con Red Flags
**Archivo**: `ai_service/app/schemas/prediction.py`

```python
class PredictionResponse(BaseModel):
    CUIT: str
    NOMBRE_EMPRESA: str
    PERIODO_FISCAL: str
    churn_probability: float  # 0-1
    churn_prediction: int     # 0 o 1 (binario)
    threshold_used: float
    red_flags: List[str]      # Señales de alerta detectadas
    confidence: float
    timestamp: datetime
```

### 3. Módulo de Red Flags
**Archivo**: `ai_service/app/core/red_flags.py` (NUEVO)

Clase `RedFlagAnalyzer` que implementa la lógica del `new_notebook.md`:

**14 Tipos de Red Flags Detectadas:**
1. Alta inactividad en la app (>50% inactividad)
2. Caída significativa en logins diarios (<3 logins/día)
3. Abandono de funcionalidades (≤1 servicio usado)
4. Baja aprobación de préstamos (<30%)
5. Margen negativo persistente
6. Rentabilidad muy baja (<10%)
7. Cancelación anticipada de préstamos (<30 días)
8. Disminución en volumen de operaciones (<5 ops)
9. Alto ratio de endeudamiento (>70%)
10. Solicitudes de crédito sin aprobación
11. Microempresa con muy pocos empleados
12. Empresa completamente inactiva en trimestre
13. Sin movimiento transaccional alguno
14. Múltiples préstamos vigentes sin pago

### 4. Endpoints Reorganizados

#### PRINCIPAL - Nueva predicción integrada:
```
POST /api/v1/predictions/predict_churn
```
- Entrada: `EmpresaInput` (30+ campos)
- Salida: `PredictionResponse` con red_flags
- Registro en Oracle automático (en producción)

#### BATCH - Predicción masiva:
```
POST /api/v1/predictions/batch_predict_churn
```
- Entrada: Lista de `EmpresaInput`
- Salida: Resumen + lista de predicciones
- Optimizado para análisis masivos

#### LEGACY - Compatibilidad backwards:
```
POST /api/v1/predictions/predict
```
⚠️ Deprecado pero funcional para clientes antiguos

### 5. Compatibilidad del Model Manager
**Archivo**: `ai_service/app/core/model_manager.py`

Actualizado para soportar:
- Features en UPPERCASE (INGRESOS, DEUDA, etc.)
- Features en lowercase (ingresos, deuda_total, etc.)
- Auto-mapping entre formatos
- Mock predictions mejoradas

### 6. Configuración Actualizada
**Archivo**: `ai_service/config/settings.py`

```python
required_features: list = [
    "INGRESOS", "GASTOS", "DEUDA", "ACTIVOS",
    "PRESTAMOS_SOLICITADOS", "PRESTAMOS_APROBADOS",
    "TRIMESTRE_DIAS_ACTIVIDAD", "PROMEDIO_LOGIN_DIA",
    "TRANSFERENCIAS", "PAGOS", "CREDITOS"
]

model_threshold: float = 0.5  # Ajustable vía .env
```

---

## 🔗 Integración Backend - AI Service

### Llamada desde Spring Boot:

```java
// Backend: POST /api/v1/companies/{cuit}/predict

EmpresaInput input = new EmpresaInput(
    cuit: "20748123114",
    nombre_empresa: "TechStart SRL",
    periodo_fiscal: "2024-Q4",
    ingresos: 1500000.0,
    gastos: 1000000.0,
    deuda: 500000.0,
    activos: 2000000.0,
    // ... resto de campos
);

// Llamada HTTP a AI Service
HttpClient client = HttpClient.newHttpClient();
HttpRequest request = HttpRequest.newBuilder()
    .uri(URI.create("http://ai-service:8000/api/v1/predictions/predict_churn"))
    .header("Content-Type", "application/json")
    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(input)))
    .build();

HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

// Respuesta: PredictionResponse con red_flags
{
  "CUIT": "20748123114",
  "NOMBRE_EMPRESA": "TechStart SRL",
  "PERIODO_FISCAL": "2024-Q4",
  "churn_probability": 0.2340,
  "churn_prediction": 0,
  "threshold_used": 0.500,
  "red_flags": [],
  "confidence": 0.95,
  "timestamp": "2024-01-21T15:30:00Z"
}
```

---

## 📋 Eliminación de Endpoints Inútiles

### ❌ Removidos (Deprecados):
- ~~GET /api/v1/predictions/by-risk-level/{risk_level}~~ (Usar batch para análisis)

### ✅ Mantenidos (Esenciales):
- GET /api/v1/health/check - Health general
- GET /api/v1/health/model-info - Info del modelo
- GET /api/v1/health/ready - Readiness para K8s
- GET /api/v1/health/live - Liveness check

---

## 🚀 Despliegue en Oracle Cloud

### Cambios de Configuración:

**`.env` en Producción:**
```bash
ENVIRONMENT=production
HOST=0.0.0.0
PORT=8000

# Oracle Cloud
ORACLE_HOST=pymerdb.sa-saopaulo-1.oraclecloud.com
ORACLE_PORT=1522
ORACLE_SERVICE_NAME=pymerdb_high
ORACLE_WALLET_PATH=/app/wallet_pymer
ORACLE_PASSWORD=<tu_password>

# Model
MODEL_PATH=/app/models/churn_model.pkl
SCALER_PATH=/app/models/scaler.pkl
MODEL_THRESHOLD=0.5

# Logging
LOG_LEVEL=INFO
LOG_FILE=/app/logs/ai_service.log
```

### Docker:
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install -r requirements.txt

COPY ai_service/ .
COPY wallet_pymer/ /app/wallet_pymer/

EXPOSE 8000

CMD ["python", "-m", "uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

---

## 📊 Flujo Completo de Predicción

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (Angular)                                           │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTP POST /api/v1/companies/{cuit}/predict
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend (Spring Boot)                                        │
│  ├─ CompanyController                                        │
│  ├─ CompanyService                                           │
│  └─ Construir EmpresaInput con datos de empresa              │
└────────────┬────────────────────────────────────────────────┘
             │
             │ HTTP POST /api/v1/predictions/predict_churn
             │ Body: EmpresaInput (30+ campos)
             ▼
┌─────────────────────────────────────────────────────────────┐
│ AI Service (FastAPI)                                         │
│  ├─ /api/v1/predictions/predict_churn                        │
│  ├─ RedFlagAnalyzer.calcular_red_flags()                     │
│  ├─ ChurnModel.predict()                                     │
│  ├─ Guardar en Oracle PREDICCIONES table                     │
│  └─ Retornar PredictionResponse con red_flags                │
└────────────┬────────────────────────────────────────────────┘
             │
             │ JSON Response:
             │ - churn_probability
             │ - churn_prediction (0/1)
             │ - red_flags: [...]
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Backend: Procesar respuesta                                  │
│  ├─ Guardar predicción en BD local                           │
│  ├─ Determinar acciones (contacto, monitoreo)               │
│  └─ Retornar a frontend                                      │
└────────────┬────────────────────────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────────────────────────┐
│ Frontend: Mostrar dashboard con análisis                     │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Mejoras Implementadas

### Vs. `new_notebook.md` Original:
1. ✅ Integración completa en arquitectura FastAPI
2. ✅ 14 red flags vs 8 del notebook original
3. ✅ Recomendaciones dinámicas según riesgo
4. ✅ Logging estructurado con request IDs
5. ✅ Soporte batch para análisis masivos
6. ✅ Compatibilidad backwards con clientes antiguos
7. ✅ Registro automático en Oracle
8. ✅ Validación de datos con Pydantic
9. ✅ Documentación OpenAPI automática
10. ✅ Health checks para Kubernetes

### Vs. Arquitectura Anterior:
1. ✅ Schema unificado (30+ campos estructurados)
2. ✅ Red flags como feature principal
3. ✅ Endpoint principal renombrado (/predict_churn vs /predict)
4. ✅ Respuesta más rica en información
5. ✅ Mejor manejo de errores
6. ✅ Tracking de request IDs
7. ✅ Soporte para Oracle Cloud deployment

---

## 🧪 Testing

Ver guía completa en: `TESTING_LOCAL.md` (generada)

---

## 📝 Notas Importantes

- **Red Flags**: Se calculan ANTES de la predicción, complementando el modelo ML
- **Threshold**: Ajustable via `MODEL_THRESHOLD` en .env (default: 0.5)
- **Compatibilidad**: Código anterior usando `/predict` seguirá funcionando
- **Oracle**: Registro automático solo en modo producción
- **Features**: Soporte dual para mayúsculas (INGRESOS) y minúsculas (ingresos)
