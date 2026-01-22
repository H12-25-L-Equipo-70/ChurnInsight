# ChurnInsight
Predicción de Cancelación de Clientes ONE

# Sector de negocio

**Servicios y Suscripciones (Telecomunicaciones, Fintech, Streaming, E-commerce)
Empresas que dependen de clientes recurrentes y desean reducir cancelaciones o desistencias.**

# Descripción del proyecto
El desafío de ChurnInsight es crear una solución que prediga si un cliente es propenso a cancelar un servicio (churn). El objetivo es que el equipo de Data Science desarrolle un modelo predictivo y que el equipo de Back-end construya una API para disponibilizar esa predicción a otros sistemas, permitiendo que el negocio actúe antes de que el cliente decida irse. Ejemplo: una fintech quiere saber, basándose en los hábitos de uso e historial de pago, qué clientes tienen alta probabilidad de deserción. Con esta información, el equipo de marketing puede ofrecer servicios personalizados y el equipo de soporte puede actuar preventivamente.

# Necesidad del cliente (explicación no técnica)
Toda empresa que vende por suscripción o contrato recurrente sufre con cancelaciones. Mantener clientes fieles es más barato que conquistar nuevos. El cliente (empresa) quiere predecir con anticipación quién está a punto de cancelar, para poder actuar y retener a esas personas. La solución esperada debe ayudar a:

identificar clientes con riesgo de churn (cancelación);

priorizar acciones de retención (ofertas, contactos, bonos);

medir el impacto de estas acciones a lo largo del tiempo.

# Validación de mercado
La predicción de churn es una de las aplicaciones más comunes y valiosas de la ciencia de datos en negocios modernos. Empresas de telecomunicaciones, bancos digitales, gimnasios, plataformas de streaming y proveedores de software utilizan modelos de churn para: reducir pérdidas financieras; entender patrones de comportamiento de clientes; aumentar el tiempo promedio de relación (lifetime value). Incluso modelos simples ya aportan valor, pues ayudan a las empresas a dirigir esfuerzos donde hay mayor riesgo de pérdida.

# Expectativa para este hackathon
Público: estudiantes principiantes en tecnología, sin experiencia profesional en el área, pero que ya estudiaron Back-end con Java (APIs REST, persistencia, pruebas) y Data Science (Python, Pandas, scikit-learn, ML supervisado). Objetivo: construir, en grupo, un MVP (producto mínimo viable) capaz de predecir si un cliente va a cancelar y disponibilizar esa predicción a través de una API funcional. Alcance ideal: clasificación binaria ("va a cancelar" / "va a continuar") con base en un dataset pequeño y limpio.

# Entregables deseados:
Notebook (Jupyter/Colab) del equipo de Data Science, que contenga: Exploración y limpieza de los datos (EDA); Ingeniería de features (ej.: tiempo de uso, frecuencia de login, historial de pago); Entrenamiento de modelo supervisado (ej.: Logistic Regression, Random Forest); Métricas de desempeño (Accuracy, Precision, Recall, F1-score); Serialización del modelo (joblib/pickle). Aplicación Back-End (API REST) del equipo de Java: Endpoint que recibe información de un cliente y devuelve la predicción del modelo (Ej.: "Va a cancelar" / "Va a continuar"); Integración con el modelo de DS (directa o vía microservicio Python); Logs y manejo de errores.

# Documentación mínima (README):
Cómo ejecutar el modelo y la API; Ejemplos de petición y respuesta (JSON); Dependencias y versiones de las herramientas. Demostración funcional (Presentación corta): Mostrar la API en acción (a través de Postman, cURL o interfaz simple); Explicar cómo el modelo llega a la predicción. Funcionalidades exigidas (MVP)

El servicio debe exponer un endpoint que devuelve una predicción sobre el cliente y la probabilidad asociada a esa predicción. Ejemplo: POST /predict: recibe JSON con datos del cliente y devuelve: { "prevision": "Va a cancelar", "probabilidad": 0.76 }

Carga de modelo predictivo: el back-end debe ser capaz de acceder al modelo de churn (localmente o vía servicio DS). Validación de entrada: verificar si todos los campos obligatorios están llenos. Respuesta estructurada: incluir predicción y probabilidad numérica.

Ejemplos de uso: 3 peticiones de prueba (clientes con y sin cancelación). Documentación simple: un README explicando cómo ejecutar el proyecto y reproducir las pruebas. Funcionalidades opcionales Endpoint GET /stats: devuelve estadísticas básicas, como: { "total_evaluados": 500, "tasa_churn": 0.23 } Persistencia de predicciones: almacenar clientes y resultados en base de datos (H2 o PostgreSQL). Dashboard simple (Streamlit o HTML): visualiza clientes con mayor riesgo. Explicabilidad básica: incluir en el retorno las 3 variables más relevantes para el resultado (ej.: "tiempo de contrato", "retrasos en pagos", "uso de la app"). Batch Prediction: endpoint que acepta lista de clientes (archivo CSV). Contenerización: ejecutar el sistema completo con Docker/Docker Compose. Pruebas automatizadas: unitarias y de integración simples (JUnit, pytest). Orientaciones técnicas para estudiantes Controlar el volumen de datos y el uso de OCI, teniendo en cuenta la cantidad de memoria que OCI soporta, cuidando los datos utilizados para no extrapolar el Free-Tier de OCI.

# Equipo de Data Science:
Arme o elija un dataset propio con información de clientes (ejemplo: tiempo de contrato, retrasos en pago, uso del servicio, tipo de plan, etc.). Utilizar Python, Pandas y scikit-learn para análisis y modelado. Elegir modelo simple de clasificación (LogisticRegression, RandomForest); Crear features intuitivas (ej.: tiempo de cliente, número de compras recientes, promedio de gastos); Guardar modelo y pipeline (joblib.dump) y garantizar que pueda ser cargado fuera del notebook.

# Equipo de Back-end:
Construir una API REST (Java + Spring Boot); Recibir JSON con datos de cliente y devolver la predicción; Conectarse al modelo de DS: vía microservicio Python (FastAPI/Flask), o cargando modelo exportado en formato ONNX (opción más avanzada); Validar entradas y devolver errores claros cuando falte información. Contrato de integración (JSON)

Recomendamos definir el contrato de integración justo al inicio del hackathon. Sigue un ejemplo:
Entrada: { "tiempo_contrato_meses": 12, "retrasos_pago": 2, "uso_mensual": 14.5, "plan": "Premium" }

Salida:

{ "prevision": "Va a cancelar", "probabilidad": 0.81 }


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

## � Docker (Alternativa - Testing/Producción)

**Requisitos**: Docker Desktop instalado y corriendo

```bash
# Build imágenes
docker-compose build

# Ejecutar servicios
docker-compose up -d

# Verificar
docker-compose ps

# Test
curl http://localhost:8000/api/v1/health/check
curl http://localhost:8080/api/v1/companies/health

# Detener
docker-compose down
```

**⚠️ Problema**: Si Docker no está corriendo:
- Abrir aplicación "Docker Desktop"
- Esperar a ver ✓ "Docker is running"
- Ver: [DOCKER_GUIDE.md](DOCKER_GUIDE.md) para más ayuda

---

## �📚 Documentación

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
| **[DOCKER_GUIDE.md](DOCKER_GUIDE.md)** | **✅ NUEVA: Guía completa de Docker** |

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
