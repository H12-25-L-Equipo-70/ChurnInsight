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
│  ├── Dashboard               ├── REST API                      │
│  ├── Analysis Views          ├── Business Logic                │
│  └── Real-time Signals       └── Data Integration              │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              AI Service (FastAPI/Python)                 │  │
│  │              • Churn Prediction Model                    │  │
│  │              • Real-time Scoring                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           ▲                                    │
│                           │                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │   Oracle Autonomous Database (OCI - São Paulo)           │  │
│  │   • Datos de 1,000+ Pymes                               │  │
│  │   • Histórico 2022-2025 (trimestral)                    │  │
│  │   • Wallet Authentication (X.509)                        │  │
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

## ⏳ Misiones Próximas

### 🔄 Misión 2: FastAPI AI Service (Python) - PRÓXIMA

**Objetivo**: Crear servicio de predicción de churn usando ML en tiempo real.

**Entregables Esperados**:
- Servicio FastAPI (Python 3.10+)
- Endpoint `POST /predict` para predicciones
- Integración con modelo ML (.pkl)
- Conexión a Oracle Database (oracledb driver)
- Docker container
- Documentación

**Tecnologías**:
- Python 3.10+
- FastAPI
- scikit-learn / TensorFlow
- Oracle Python Driver (oracledb)
- Pydantic (validation)

**Timeline**: ~2-3 días

---

### 🎨 Misión 3: Frontend Angular 19 - FUTURO

**Objetivo**: Crear interfaz moderna con Signals y Tailwind CSS.

**Entregables Esperados**:
- Componentes Angular 19 (Standalone)
- Signals para state management
- HTTP Client para comunicación con Backend
- Tailwind CSS (diseño fintech moderno)
- Dashboard de análisis
- Responsive design

**Tecnologías**:
- Angular 19
- TypeScript
- Tailwind CSS
- Standalone Components
- RxJS/Signals

**Timeline**: ~3-5 días

---

### 🐳 Misión 4: Dockerización & DevOps - FUTURO

**Objetivo**: Conteneurizar todo y crear pipeline de despliegue.

**Entregables Esperados**:
- `Dockerfile` para Backend (Java)
- `Dockerfile` para AI Service (Python)
- `Dockerfile` para Frontend (Node.js build)
- `docker-compose.yml` para dev local
- Kubernetes manifests (futuro)
- GitHub Actions / CI/CD

**Tecnologías**:
- Docker
- Docker Compose
- Kubernetes (optional)
- GitHub Actions

**Timeline**: ~2-3 días

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

### 2️⃣ Base de Datos (Importar datos)
```bash
# Los datos ya están en Oracle ADB
# Verificar con el backend
curl http://localhost:8080/api/v1/companies/segments/sectors
```

### 3️⃣ AI Service (Próxima - Misión 2)
```bash
cd ai-service/
python -m pip install -r requirements.txt
python main.py
# Server en: http://localhost:8000
```

### 4️⃣ Frontend (Próxima - Misión 3)
```bash
cd frontend/
npm install
npm start
# App en: http://localhost:3000
```

### 5️⃣ Docker Compose (Toda la pila)
```bash
docker-compose up -d
# Services:
# - Frontend: http://localhost:3000
# - Backend: http://localhost:8080
# - AI: http://localhost:8000
```

---

## 📚 Documentación

### Backend
- 📖 [Backend README](backend/BACKEND_README.md) - Guía completa de configuración
- ⚡ [Quick Start](backend/QUICK_START.md) - Setup rápido
- ✔️ [Validation](backend/VALIDATION.md) - Checklist de validación
- 🏗️ [Architecture](backend/ARCHITECTURE.md) - Diagramas de arquitectura
- 📋 [Implementation](backend/IMPLEMENTATION_SUMMARY.md) - Resumen de implementación

### API Reference
```
Base URL: http://localhost:8080/api/v1/companies

Endpoints Principales:
GET    /companies/{cuit}                    → Empresa por CUIT
GET    /companies/sector/{sector}           → Empresas por sector
GET    /companies/churn/churned             → Empresas abandonadas
GET    /companies/churn/statistics/{sector} → Estadísticas
GET    /companies/churn/high-risk           → Alto riesgo
GET    /companies/health                    → Health check
```

[Ver API Completa →](backend/BACKEND_README.md#-api-endpoints)

---

## 🔒 Seguridad

✅ **Implementado**:
- Oracle Wallet (X.509 authentication)
- TCPS 1.2+ encryption
- Environment variables (NO hardcoding)
- Connection pool management
- SQL injection prevention (parameterized queries)
- Transaction management
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
**Especialidad**: Oracle Ecosystem + Fintech + Kubernetes  

**Proyecto**: ChurnInsight v1.0.0  
**Inicio**: 2024-01-07  
**Estado**: En Desarrollo (Misión 1 ✅, Misión 2-4 ⏳)

---

## 📄 Licencia

Privado - Solo para Pymer S.A.

---

## ✨ Resumen del Estado Actual

```
┌─────────────────────────────────────────┐
│      ChurnInsight - Estado Actual       │
├─────────────────────────────────────────┤
│                                         │
│  Misión 1 (Backend):      ✅ 100%       │
│  Misión 2 (AI Service):   ⏳ Próxima    │
│  Misión 3 (Frontend):     ⏳ Próxima    │
│  Misión 4 (DevOps):       ⏳ Próxima    │
│                                         │
│  Total Avance:            ✅ 25%        │
│                                         │
│  🚀 LISTO PARA PRODUCCIÓN (Backend)    │
│                                         │
└─────────────────────────────────────────┘
```

---

**Última Actualización**: 2024-01-07  
**Versión**: 1.0.0-M1 (Misión 1 Completada)

**¡Adelante con Misión 2! 🚀**
