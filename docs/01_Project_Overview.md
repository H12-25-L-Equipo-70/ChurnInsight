# ChurnInsight - Predicción de Churn para Pymes Argentinas

## 🎯 Visión

**ChurnInsight** es una plataforma B2B innovadora que utiliza **IA y datos financieros** para predecir el abandono (Churn) de Pymes argentinas que utilizan servicios fintech. Permite a instituciones financieras identificar empresas en riesgo y aplicar estrategias de retención proactivas.

---

## 🏗️ Arquitectura General

```
┌─────────────────────────────────────────────────────────────────┐
│                   ChurnInsight Platform                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Frontend (Angular 19)        Backend (Spring Boot 3.x)        │
│  ├── Dashboard               ├── REST API (/api/v1/companies)  │
│  ├── Analysis Views          ├── 12+ Endpoints                 │
│  └── Real-time Signals       └── Data Integration              │
│          (FUTURE)                 (✅ COMPLETADO)              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │     AI Service (FastAPI/Python) ✅ COMPLETADO (v1.0)    │  │
│  │     • Churn Prediction Model (Random Forest)             │  │
│  │     • Real-time Scoring (/api/v1/predictions/predict)   │  │
│  │     • Batch Processing (/api/v1/predictions/batch)      │  │
│  │     • Health Checks (/api/v1/health/*)                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▲                                    │
│                           │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Oracle Autonomous Database (OCI - São Paulo)           │  │
│  │   • Datos de 1,000+ Pymes (EMPRESAS table)              │  │
│  │   • Histórico 2022-2025 (trimestral)                    │  │
│  │   • Wallet Authentication (X.509)                        │  │
│  │   • Predicciones log (PREDICCIONES table)               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura del Repositorio

```
ChurnInsight/
├── README.md                           # Este archivo
├── backend/                            # ✅ COMPLETADO (Misión 1)
│   ├── pom.xml                         # Maven configuration
│   ├── src/
│   │   ├── main/java/com/pymer/churninsight/
│   │   │   ├── ChurnInsightApplication.java
│   │   │   ├── config/
│   │   │   │   └── OracleDataSourceConfig.java
│   │   │   ├── domain/
│   │   │   │   ├── entity/
│   │   │   │   │   └── Company.java
│   │   │   │   └── repository/
│   │   │   │       └── CompanyRepository.java
│   │   │   ├── application/
│   │   │   │   ├── service/
│   │   │   │   │   └── CompanyService.java
│   │   │   │   └── dto/
│   │   │   │       └── CompanyResponseDTO.java
│   │   │   └── presentation/
│   │   │       └── controller/
│   │   │           └── CompanyController.java
│   │   └── resources/
│   │       ├── application.properties
│   │       └── logback-spring.xml
│   ├── wallet_pymer/
│   │   ├── tnsnames.ora               # TNS aliases
│   │   ├── sqlnet.ora
│   │   ├── cwallet.sso                # Wallet credentials
│   │   ├── ewallet.p12
│   │   └── ojdbc.properties
│   ├── .env.example
│   ├── .gitignore
│   ├── BACKEND_README.md              # Full configuration guide
│   ├── QUICK_START.md                 # 5-minute setup
│   ├── VALIDATION.md                  # Validation checklist
│   ├── ARCHITECTURE.md                # Architecture diagrams
│   ├── IMPLEMENTATION_SUMMARY.md      # What was built
│   └── CONSTRUCTION_CHECKLIST.md      # This checklist
│
├── frontend/                          # ⏳ Misión 3 (Próxima)
│   ├── src/
│   │   ├── app/
│   │   ├── assets/
│   │   └── index.html
│   └── angular.json
│
├── ai-service/                        # ⏳ Misión 2 (Próxima)
│   ├── main.py
│   ├── requirements.txt
│   └── models/
│       └── churn_model.pkl
│
└── data/
    └── dataset_empresas_fintech_v2.7.csv  # Raw data
```

---

## 🚀 Misiones Completadas

### ✅ Misión 1: Persistencia en Spring Boot (COMPLETADA)

**Objetivo**: Configurar Spring Boot 3.x con Oracle ADB y Wallet para persistencia segura.

**Entregables**:
- ✅ `pom.xml` con dependencias Oracle JDBC (OJDBC 11) + UCP
- ✅ `OracleDataSourceConfig` con Wallet integration
- ✅ Entidad JPA `Company` mapeada a tabla EMPRESAS
- ✅ `CompanyRepository` con 15+ queries avanzadas
- ✅ `CompanyService` con lógica de negocio (análisis de churn)
- ✅ `CompanyController` con 12+ REST endpoints
- ✅ DTO `CompanyResponseDTO` para encapsulación de datos
- ✅ Configuración completa (`application.properties` + `logback-spring.xml`)
- ✅ Documentación exhaustiva (5 guías)
- ✅ Security practices (Wallet + env vars)

**Status**: ✅ **READY FOR PRODUCTION**

**Cómo comenzar**:
```bash
cd backend/
cp .env.example .env
# Editar .env con tus credenciales
mvn clean install
mvn spring-boot:run
# Server en: http://localhost:8080/api/v1/companies
```

**Documentación**:
- 📖 [Backend README](backend/BACKEND_README.md) - Guía completa
- ⚡ [Quick Start](backend/QUICK_START.md) - 5 minutos
- ✔️ [Validation](backend/VALIDATION.md) - Checklist
- 🏗️ [Architecture](backend/ARCHITECTURE.md) - Diagramas
- 📋 [Implementation Summary](backend/IMPLEMENTATION_SUMMARY.md) - Qué se construyó
- ✅ [Construction Checklist](backend/CONSTRUCTION_CHECKLIST.md) - Verificación

---

## ✅ Misión 2: FastAPI AI Service (Python) - COMPLETADA

**Objetivo**: Crear servicio de predicción de churn usando ML en tiempo real.

**Entregables**:
- ✅ Servicio FastAPI con estructura profesional
- ✅ Endpoint `POST /api/v1/predictions/predict` - Predicción individual
- ✅ Endpoint `POST /api/v1/predictions/batch` - Predicción batch
- ✅ Modelo Random Forest entrenado (train_model.py)
- ✅ Conexión a Oracle Database (oracledb driver + Wallet)
- ✅ Health checks (`/health/check`, `/health/ready`, `/health/live`)
- ✅ Model info endpoint (`/health/model-info`)
- ✅ Dockerfile multi-stage optimizado
- ✅ docker-compose.yml con 2 servicios (Backend + AI)
- ✅ Documentación exhaustiva (3 guías)
- ✅ Testing scripts (test_endpoints.sh)

**Características**:
- Random Forest Classifier con 100 estimadores
- 13 features de datos financieros
- Escalado automático (StandardScaler)
- Predicción de probabilidad + nivel de riesgo
- Batch processing optimizado (hasta 1000 empresas/request)
- Logging detallado y structured
- CORS enabled para todos los orígenes
- Middleware de request logging
- Error handling completo

**Status**: ✅ **READY FOR PRODUCTION**

**Cómo comenzar**:
```bash
cd ai_service/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con tus credenciales
python train_model.py
python -m uvicorn main:app --reload --port 8000
# API en: http://localhost:8000/api/v1
# Docs en: http://localhost:8000/api/v1/docs
```

**Documentación**:
- 📖 [AI README](ai_service/README_AI.md) - Guía completa
- ⚡ [Quick Start](ai_service/QUICK_START.md) - 5 minutos
- 📚 [API Documentation](ai_service/API_DOCUMENTATION.md) - Referencia completa
- 🧪 [Test Script](ai_service/test_endpoints.sh) - Ejemplos de requests

**Endpoints Principales**:

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/v1/health/check` | GET | Health status |
| `/api/v1/health/model-info` | GET | Detalles del modelo |
| `/api/v1/predictions/predict` | POST | Predicción individual |
| `/api/v1/predictions/batch` | POST | Predicción batch |
| `/api/v1/docs` | GET | Swagger UI |

**Ejemplo de Predicción**:
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

**Response**:
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

**Integración con Backend**:
- Spring Boot llama a FastAPI automáticamente
- Request/Response completo tipado
- Manejo de errores bidireccional
- Logging centralizado

### 🐳 Misión 4: Dockerización & DevOps - COMPLETADA PARCIAL

**Objetivo**: Conteneurizar todo y crear pipeline de despliegue.

**Entregables Completados**:
- ✅ `Dockerfile` para Backend (Java multi-stage)
- ✅ `Dockerfile` para AI Service (Python multi-stage)
- ✅ `docker-compose.yml` para dev/prod local
- ✅ Health checks en ambos servicios
- ✅ Volumen para Wallet (seguridad)
- ✅ Logging centralizado

**Documentación**:
- 📖 [docker-compose.yml](docker-compose.yml) - 3 servicios

**Status**: ✅ **READY FOR ORACLE CLOUD DEPLOYMENT**

**Cómo desplegar**:
```bash
# Build local
docker-compose build

# Run local
docker-compose up -d

# Verificar
docker-compose ps
curl http://localhost:8080/api/v1/companies/health
curl http://localhost:8000/api/v1/health/check
```

**Deploy a Oracle Cloud**:
```bash
# Subir imágenes a Oracle Container Registry
docker tag churninsight-backend:1.0.0 ocir.sa-saopaulo-1.oraclecloud.com/...
docker tag churninsight-ai:1.0.0 ocir.sa-saopaulo-1.oraclecloud.com/...
docker push ...

# Ejecutar en instancia OCI con Docker
docker-compose up -d
```

**Pendiente**:
- GitHub Actions CI/CD (opcional)
- Kubernetes manifests (opcional)

---

## 📊 Dataset

**Fuente**: `data/dataset_empresas_fintech_v2.7.csv`

**Características**:
- 🏢 **~1,000 Pymes Argentinas**
- 📊 **35+ atributos** (financieros, operacionales, transaccionales)
- 📅 **Histórico**: 2022-Q1 a 2025-Q4 (trimestral)
- 🎯 **Target**: `Churn` (0=activa, 1=abandonada)

**Campos Principales**:
```
CUIT, Nombre_Empresa, Tipo_Sociedad, Sector, Provincia
Año_Fundacion, Empleados, Periodo_Fiscal
Ingresos, Gastos, Margen, Deuda, Activos
Prestamos_Solicitados, Prestamos_Aprobados, Prestamos_Vigentes
Ticket_Promedio, Monto_Solicitado, Monto_Aprobado
Trimestre_Dias_Actividad, Promedio_Login_Dia, Total_Login_Dia
Transferencias, Pagos, Creditos, Inversiones, Servicios_Utilizados
Churn, Churn_Date
```

**Sectores Incluidos**:
- Tecnología
- Industria
- Agricultura
- Construcción
- Restaurantes
- Comercio
- Logística

---

## 🔧 Stack Tecnológico

### Backend (Java)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Spring Boot | 3.2.1 |
| Java | OpenJDK | 17 LTS |
| ORM | Hibernate JPA | 6.x |
| Database | Oracle ADB | Autonomous JSON |
| Connection Pool | Oracle UCP | 23.4 |
| Authentication | Oracle Wallet | X.509 |
| Build Tool | Maven | 3.9.x |

### AI Service (Python)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | FastAPI | 0.104+ |
| ML Library | scikit-learn | 1.3+ |
| Database | oracledb | 1.3+ |
| Validation | Pydantic | 2.0+ |
| Async | Uvicorn | 0.24+ |

### Frontend (JavaScript)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Framework | Angular | 19 |
| Language | TypeScript | 5.x |
| CSS | Tailwind CSS | 3.x |
| State | Signals | Native (Angular 19) |
| HTTP Client | RxJS | 7.x |

### DevOps
| Herramienta | Propósito | Versión |
|-----------|----------|---------|
| Docker | Containerization | 24.x |
| Docker Compose | Local Development | 2.x |
| Kubernetes | Orchestration | 1.28+ (futuro) |
| GitHub Actions | CI/CD | Built-in |

---

## 🚀 Cómo Comenzar

### Requisitos Previos
```
✅ Docker Desktop (para dev local)
✅ Java 17 LTS
✅ Python 3.10+
✅ Node.js 18+
✅ Oracle Wallet (proporcionado)
✅ Credenciales Oracle ADB
```

### 1️⃣ Backend Setup (5 minutos)
```bash
cd backend/
cp .env.example .env
# Editar .env con ORACLE_DB_PASSWORD
mvn clean install
mvn spring-boot:run
```

**Verificar**: `curl http://localhost:8080/api/v1/companies/health`

### 2️⃣ AI Service Setup (5 minutos)
```bash
cd ai_service/
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
# Editar .env con ORACLE_PASSWORD
python train_model.py
python -m uvicorn main:app --reload --port 8000
```

**Verificar**: `curl http://localhost:8000/api/v1/health/check`

### 3️⃣ Docker Compose (Toda la pila)
```bash
docker-compose up -d
# Services:
# - Backend: http://localhost:8080/api/v1/companies
# - AI Service: http://localhost:8000/api/v1/predictions
```

### 4️⃣ Frontend (Próxima - Misión 3 - OPCIONAL)
```bash
cd frontend/
npm install
npm start
# App en: http://localhost:3000
```

---

## 📚 Documentación

### Backend (✅ Completado)
- 📖 [Backend README](backend/BACKEND_README.md) - Guía completa
- ⚡ [Quick Start](backend/QUICK_START.md) - Setup rápido (5 min)
- ✔️ [Validation](backend/VALIDATION.md) - Checklist de validación
- 🏗️ [Architecture](backend/ARCHITECTURE.md) - Diagramas de arquitectura
- 📋 [Implementation](backend/IMPLEMENTATION_SUMMARY.md) - Qué se construyó

### AI Service (✅ Completado)
- 📖 [AI README](ai_service/README_AI.md) - Guía completa
- ⚡ [Quick Start](ai_service/QUICK_START.md) - Setup rápido (5 min)
- 📚 [API Documentation](ai_service/API_DOCUMENTATION.md) - Referencia completa
- 🧪 [Test Script](ai_service/test_endpoints.sh) - Ejemplos de requests

### API Reference

**Backend**:
```
Base URL: http://localhost:8080/api/v1/companies

GET    /companies/{cuit}                    → Empresa por CUIT
GET    /companies/sector/{sector}           → Empresas por sector
GET    /companies/churn/churned             → Empresas abandonadas
GET    /companies/churn/high-risk           → Alto riesgo
GET    /companies/health                    → Health check
```

**AI Service**:
```
Base URL: http://localhost:8000/api/v1

POST   /predictions/predict                 → Predicción individual
POST   /predictions/batch                   → Batch predictions
GET    /health/check                        → Health status
GET    /health/model-info                   → Detalles del modelo
GET    /docs                                → Swagger UI
```

[Ver APIs Completas →](ai_service/API_DOCUMENTATION.md)

---

## 🔒 Seguridad

✅ **Implementado**:
- Oracle Wallet (X.509 authentication)
- TCPS 1.2+ encryption
- Environment variables (NO hardcoding)
- Connection pool management
- SQL injection prevention (parameterized queries)
- Transaction management
- CORS con validación
- Request logging y monitoring
- .gitignore (wallet + secrets excluded)

---

## 🤝 Contribución

Este proyecto es privado para **Pymer**. 

Para cambios:
1. Crear rama: `git checkout -b feature/xxx`
2. Commit: `git commit -m "Add: descripción"`
3. Push: `git push origin feature/xxx`
4. PR para review

---

## 📞 Contacto

**Arquitecto Senior**: Cloud & DevOps Engineer  
**Especialidad**: Oracle Ecosystem + Fintech + Kubernetes + Python + Java  

**Proyecto**: ChurnInsight v1.0.0  
**Inicio**: 2024-01-07  
**Estado**: 50% Completado (Misiones 1-2 ✅)

---

## 📄 Licencia

Privado - Solo para Pymer S.A.

---

## ✨ Resumen del Estado Actual

```
┌──────────────────────────────────────────┐
│     ChurnInsight - Estado Actual        │
├──────────────────────────────────────────┤
│                                          │
│  Misión 1 (Backend):    ✅ 100% LISTO   │
│  Misión 2 (AI Service): ✅ 100% LISTO   │
│  Misión 3 (Frontend):   ⏳ Próxima       │
│  Misión 4 (DevOps):     ✅ 60% (Docker) │
│                                          │
│  Total Avance:          ✅ 50%           │
│                                          │
│  🚀 READY FOR DOCKER IN ORACLE CLOUD    │
│                                          │
└──────────────────────────────────────────┘
```

**Próxima Acción**: Desplegar en Oracle Cloud con docker-compose

---

**Última Actualización**: 2024-01-07  
**Versión**: 1.0.0-M2 (Misiones 1-2 Completadas)

**¡Sistema de predicción de Churn completamente funcional! 🚀**

