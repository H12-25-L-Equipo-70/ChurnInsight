# 🎯 ChurnInsight - Predicción de Churn para Pymes Argentinas

Plataforma B2B de **predicción inteligente de abandono de clientes** para Pymes argentinas usando **IA, Machine Learning y análisis financiero**.

---

## ⚡ Quick Start (5 minutos)

### Terminal 1: AI Service
```bash
cd ai_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python train_model.py
python -m uvicorn main:app --reload --port 8000
# ✅ http://localhost:8000/api/v1/docs
```

### Terminal 2: Backend
```bash
cd backend
mvn clean install
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
# ✅ http://localhost:8080/api/v1/companies/health
```

### Terminal 3: Test
```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d '{
    "CUIT": "20748123114",
    "NOMBRE_EMPRESA": "TechStart SRL",
    "PERIODO_FISCAL": "2024-Q4",
    "EMPLEADOS": 15,
    "INGRESOS": 1500000,
    "GASTOS": 1000000,
    "DEUDA": 500000,
    "ACTIVOS": 2000000,
    "PRESTAMOS_SOLICITADOS": 3,
    "PRESTAMOS_APROBADOS": 2,
    "MONTO_SOLICITADO": 300000,
    "MONTO_APROBADO": 200000,
    "TICKET_PROMEDIO_SOLICITADO": 100000,
    "TICKET_PROMEDIO_APROBADO": 100000,
    "PRESTAMOS_CANCELADOS": 1,
    "PRESTAMOS_VIGENTES": 1,
    "TIEMPO_CANCELACION_PRESTAMO": 45,
    "SERVICIOS_UTILIZADOS": 5,
    "TRANSFERENCIAS": 45,
    "PAGOS": 30,
    "CREDITOS": 15,
    "INVERSIONES": 5,
    "TRIMESTRE_DIAS_ACTIVIDAD": 85,
    "TRIMESTRE_DIAS_INACTIVIDAD": 5,
    "PROMEDIO_LOGIN_DIA": 3.5,
    "TOTAL_LOGIN_DIA": 255
  }'
```

---

## 📚 Documentación

| Documento | Descripción |
|-----------|------------|
| [01_Project_Overview.md](docs/01_Project_Overview.md) | Visión general y arquitectura |
| [02_AI_Service_Quick_Start.md](docs/02_AI_Service_Quick_Start.md) | Setup rápido del AI Service |
| [03_Backend_Quick_Start.md](docs/03_Backend_Quick_Start.md) | Setup rápido del Backend |
| [04_AI_Service_API.md](docs/04_AI_Service_API.md) | Documentación de endpoints |
| [05_Deployment_and_Commands.md](docs/05_Deployment_and_Commands.md) | Despliegue y comandos útiles |
| [06_Backend_Architecture.md](docs/06_Backend_Architecture.md) | Arquitectura técnica backend |
| **[07_Integration_NewNotebook.md](docs/07_Integration_NewNotebook.md)** | **✅ NUEVA: Integración new_notebook.md** |
| **[08_Testing_Local_Complete.md](docs/08_Testing_Local_Complete.md)** | **✅ NUEVA: Guía completa de testing** |

---

## 🏗️ Arquitectura

```
┌─────────────┐      ┌──────────────┐      ┌─────────────────┐
│   Frontend  │      │   Backend    │      │   AI Service    │
│  (Angular)  │◄────►│(Spring Boot) │◄────►│   (FastAPI)     │
│             │      │              │      │                 │
└─────────────┘      └──────────────┘      └────────┬────────┘
                            ▲                        │
                            │                        ▼
                            │           ┌─────────────────────┐
                            └──────────►│  Oracle Database    │
                                        │  (Predictions)      │
                                        └─────────────────────┘
```

---

## 🎯 Características Principales

### ✅ AI Service (FastAPI)
- 🔮 **Predicción de Churn**: ML model con Random Forest
- 🚩 **Red Flags**: 14 tipos de señales de alerta
- 📊 **Análisis Financiero**: 30+ campos de entrada
- 🏃 **Batch Processing**: Predicciones masivas
- 🏥 **Health Checks**: Liveness, readiness, model info
- 📖 **Swagger UI**: Documentación automática

### ✅ Backend (Spring Boot 3.x)
- 🔐 **Seguridad**: Wallet Oracle, environment vars
- 💾 **Persistencia**: JPA + Oracle Autonomous DB
- 🏘️ **Clean Architecture**: Layers bien separadas
- 🔗 **12+ Endpoints**: Consultas avanzadas
- ⚙️ **Configuration**: Properties-based setup

### ✅ Integración
- 🔄 **Sincronización**: AI ↔ Backend ↔ Oracle
- 🎪 **Endpoint Principal**: `/api/v1/predictions/predict_churn`
- 📝 **Esquema Unificado**: `EmpresaInput` (30 campos)
- 🔙 **Backwards Compatible**: Legacy endpoints funcionales

---

## 📋 Cambios Recientes (v1.0.0)

### 🆕 Integración del new_notebook.md

```python
# ANTES: Esquema simple
@router.post("/predict")
async def predict(cuit, ingresos, gastos, ...):
    ...

# AHORA: Esquema completo con red flags
@router.post("/predict_churn")
async def predict_churn(empresa_input: EmpresaInput):
    - Calcula 14 tipos de red flags
    - Retorna probabilidad + predicción binaria
    - Registra en Oracle automáticamente
    - Respuesta enriquecida con análisis
```

### Mejoras:
1. ✅ Schema `EmpresaInput` con 30+ campos
2. ✅ Módulo `RedFlagAnalyzer` con 14 tipos de alertas
3. ✅ Endpoint `/predict_churn` mejorado
4. ✅ Endpoint `/batch_predict_churn` para análisis masivos
5. ✅ Compatibilidad backwards con `/predict`
6. ✅ Documentación técnica completa
7. ✅ Guía de testing local paso a paso

---

## 🧪 Testing

### Test Rápido (30 segundos):
```bash
# Terminal dedicada
cd ai_service
python -m uvicorn main:app --port 8000

# En otra terminal
curl http://localhost:8000/api/v1/health/check
```

### Testing Completo:
Ver: [docs/08_Testing_Local_Complete.md](docs/08_Testing_Local_Complete.md)

Incluye:
- ✅ 6 test cases del AI Service
- ✅ Testing de red flags
- ✅ Batch predictions
- ✅ Integración Backend
- ✅ Docker testing
- ✅ Troubleshooting

---

## 🚀 Despliegue

### Desarrollo:
```bash
# AI Service
cd ai_service && python -m uvicorn main:app --reload

# Backend
cd backend && mvn spring-boot:run
```

### Producción (Oracle Cloud):
```bash
# Ver documentación en docs/05_Deployment_and_Commands.md
docker build -t churninsight-ai:1.0.0 ai_service/
docker push <registry>/churninsight-ai:1.0.0
```

---

## 📁 Estructura del Proyecto

```
ChurnInsight/
├── README.md                    # Este archivo
├── docker-compose.yml          # Stack completo (futuro)
├── docs/                       # Documentación
│   ├── 01_Project_Overview.md
│   ├── 02_AI_Service_Quick_Start.md
│   ├── 03_Backend_Quick_Start.md
│   ├── 04_AI_Service_API.md
│   ├── 05_Deployment_and_Commands.md
│   ├── 06_Backend_Architecture.md
│   ├── 07_Integration_NewNotebook.md      # ✅ NUEVO
│   └── 08_Testing_Local_Complete.md       # ✅ NUEVO
├── ai_service/                 # FastAPI + ML
│   ├── main.py
│   ├── requirements.txt
│   ├── app/
│   │   ├── core/
│   │   │   ├── model_manager.py
│   │   │   ├── oracle_connection.py
│   │   │   └── red_flags.py                # ✅ NUEVO
│   │   ├── routes/
│   │   │   ├── health.py
│   │   │   └── predictions.py              # ✅ ACTUALIZADO
│   │   └── schemas/
│   │       └── prediction.py               # ✅ ACTUALIZADO
│   └── config/settings.py                 # ✅ ACTUALIZADO
├── backend/                    # Spring Boot 3.x
│   ├── pom.xml
│   ├── src/main/java/...
│   └── wallet_pymer/          # Oracle Wallet
└── data/
    └── dataset_empresas_fintech_v2.7.csv
```

---

## 🔑 Variables de Entorno

### AI Service (.env)
```bash
ENVIRONMENT=development
MODEL_PATH=./models/churn_model.pkl
MODEL_THRESHOLD=0.5
LOG_LEVEL=INFO
```

### Backend (.env)
```bash
ORACLE_DB_PASSWORD=tu_password
ORACLE_WALLET_PATH=./backend/wallet_pymer
SPRING_JPA_HIBERNATE_DDL_AUTO=validate
```

---

## 🎓 Ejemplos de Uso

### Predicción Individual:
Ver: [docs/08_Testing_Local_Complete.md#test-3-predicción-individual---caso-bajo-riesgo](docs/08_Testing_Local_Complete.md)

### Predicción Batch:
Ver: [docs/08_Testing_Local_Complete.md#test-5-predicción-batch](docs/08_Testing_Local_Complete.md)

### Desde Frontend (futuro):
```javascript
// Llamar a Backend
const response = await fetch('/api/v1/companies/20748123114/predict', {
  method: 'POST',
  body: JSON.stringify(empresaData)
});

// Backend internamente llama a AI Service
// AI Service retorna red_flags + probabilidad
// Frontend muestra dashboard con análisis
```

---

## 🤝 Flujo de Integración

```
1. Frontend (Angular)
   ↓ POST /api/v1/companies/{cuit}/predict
   
2. Backend (Spring Boot)
   ├─ Obtener datos de empresa de Oracle
   ├─ Construir EmpresaInput (30 campos)
   └─ ↓ POST /api/v1/predictions/predict_churn
   
3. AI Service (FastAPI)
   ├─ Calcular 14 red flags
   ├─ Ejecutar modelo ML
   ├─ Retornar probabilidad + prediction + red_flags
   └─ Guardar en Oracle PREDICCIONES table
   
4. Backend recibe respuesta
   ├─ Procesar red_flags
   ├─ Guardar localmente
   └─ Retornar al Frontend
   
5. Frontend
   └─ Mostrar dashboard con análisis
```

---

## 📊 Monitoreo

### Health Status:
```bash
curl http://localhost:8000/api/v1/health/check
curl http://localhost:8080/api/v1/companies/health
```

### Logs:
```bash
# AI Service
tail -f ai_service/logs/ai_service.log

# Backend
tail -f backend/target/*.log
```

---

## 🐛 Troubleshooting

| Problema | Solución |
|----------|----------|
| Puerto 8000 en uso | Cambiar: `--port 8001` |
| Modelo no cargado | Ejecutar: `python train_model.py` |
| Error Oracle | Normal en dev. Verificar ENVIRONMENT=development |
| 404 Not Found | Revisar path: `/api/v1/...` (no `/api/...`) |

Ver troubleshooting completo: [docs/08_Testing_Local_Complete.md#-troubleshooting](docs/08_Testing_Local_Complete.md#-troubleshooting)

---

## 📞 Soporte

- 📖 **Documentación**: Ver carpeta `docs/`
- 🧪 **Testing**: [docs/08_Testing_Local_Complete.md](docs/08_Testing_Local_Complete.md)
- 🏗️ **Integración**: [docs/07_Integration_NewNotebook.md](docs/07_Integration_NewNotebook.md)
- ⚙️ **API**: [docs/04_AI_Service_API.md](docs/04_AI_Service_API.md)

---

## 📝 Licencia

Propiedad de Pymer - ChurnInsight Project

---

## 🎯 Roadmap

- ✅ v1.0.0: Integración new_notebook.md
- 🔲 v1.1.0: Frontend Angular (dashboard)
- 🔲 v1.2.0: Métricas de performance
- 🔲 v2.0.0: CI/CD automatizado
- 🔲 v2.1.0: Monitoring con Prometheus/Grafana

---

**Última actualización**: 21 de Enero, 2025  
**Versión**: 1.0.0 - Integración new_notebook.md completa ✅
