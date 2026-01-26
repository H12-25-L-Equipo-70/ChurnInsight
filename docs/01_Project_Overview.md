# ChurnInsight - Descripción general del proyecto

## 🎯 Visión

**ChurnInsight** es una innovadora plataforma B2B que utiliza **IA y datos financieros** para predecir la deserción de las pymes argentinas que utilizan servicios fintech. Permite a las instituciones financieras identificar empresas en riesgo y aplicar estrategias de retención proactivas.

---

## 🏗️Arquitectura General

```
┌──────────────────────────────── ─────────────────────────────────┐
│ Plataforma ChurnInsight │
├──────────────────────────────── ─────────────────────────────────┤
│ │
│ Frontend (Angular) Backend (Spring Boot 3.x) │
│ ├── Panel de control ├── API REST (/api/v1/companies) │
│ ├── Vistas de análisis ├── Más de 12 puntos finales │
│ └── Señales en tiempo real └── Integración de datos │
│ │
│ ┌───────────────────────────── ─────────────────────────────┐ │
│ │ Servicio de IA (FastAPI/Python) │ │
│ │ • Modelo de predicción de abandono (bosque aleatorio) │ │
│ │ • Puntuación en tiempo real (/api/v1/predictions/predict) │ │
│ │ • Procesamiento por lotes (/api/v1/predicciones/batch) │ │
│ │ • Comprobaciones de estado (/api/v1/health/*) │ │
│ └───────────────────────────── ─────────────────────────────┘ │
│ ▲ │
│ │ │
│ ┌───────────────────────────── ─────────────────────────────┐ │
│ │ Base de datos autónoma Oracle (OCI - São Paulo) │ │
│ │ • Datos de más de 1.000 PYMES (tabla EMPRESAS) │ │
│ │ • Datos históricos 2022-2025 (trimestral) │ │
│ │ • Autenticación de billetera (X.509) │ │
│ │ • Registro de predicciones (tabla PREDICCIONES) │ │
│ └───────────────────────────── ─────────────────────────────┘ │
│ │
└──────────────────────────────── ─────────────────────────────────┘
```

---

## 📂 Estructura del repositorio

```
Perspectiva de abandono/
├── LÉAME.md
├── documentos/
│ ├── 01_Project_Overview.md
│ ├── 02_AI_Service_Quick_Start.md
│ ├── 03_Backend_Quick_Start.md
│ ├── 04_AI_Service_API.md
│ ├── 05_Deployment.md
│ └── 06_Backend_Architecture.md
├── backend/
│ ├── pom.xml
│ ├── src/
│ ├── billetera_pymer/
│ └── .env.ejemplo
├── ai_servicio/
│ ├── principal.py
│ ├── requisitos.txt
│ ├── aplicación/
│ └── .env.ejemplo
└── datos/
    └── conjunto de datos_empresas_fintech_v2.7.csv
```

---

## ✅ Componentes principales

### Backend: Persistencia de arranque de primavera

**Objetivo**: Persistencia segura con Spring Boot 3.x y Oracle ADB con Wallet.

**Características**:
- `pom.xml` con Oracle JDBC (OJDBC 11) + dependencias UCP
- `OracleDataSourceConfig` con integración de Wallet
- Entidad JPA `Compañía` asignada a la tabla EMPRESAS
- `CompanyRepository` con más de 15 consultas avanzadas
- `CompanyService` con lógica de negocio (análisis de abandono)
- `CompanyController` con más de 12 puntos finales REST
- `CompanyResponseDTO` para encapsulación de datos
- Configuración completa (`application.properties` + `logback-spring.xml`)
- Prácticas de seguridad (Wallet + env vars)

**Cómo empezar**:
```golpecito
respaldo del cd/
cp .env.ejemplo .env
# Edite .env con sus credenciales
instalación limpia de mvn
mvn arranque de primavera: ejecutar
# Servidor en: http://localhost:8080/api/v1/companies
```

### Servicio de IA: FastAPI (Python)

**Objetivo**: Servicio de predicción de abandono en tiempo real mediante ML.

**Características**:
- Servicio FastAPI con estructura profesional.
- Punto final `POST /api/v1/predictions/predict` para predicción individual
- Punto final `POST /api/v1/predictions/batch` para predicción por lotes
- Modelo de bosque aleatorio entrenado (train_model.py)
- Conexión a la base de datos Oracle (controlador oracledb + Wallet)
- Comprobaciones de estado (`/health/check`, `/health/ready`, `/health/live`)
- Punto final de información del modelo (`/health/model-info`)
- Dockerfile de varias etapas optimizado
- `docker-compose.yml` con 2 servicios (Backend + AI)
- Documentación completa (3 guías)
- Scripts de prueba (test_endpoints.sh)

**Cómo empezar**:
```golpecito
cd ai_servicio/
pitón -m venv venv
fuente venv/bin/activar
instalación de pip -r requisitos.txt
cp .env.ejemplo .env
# Edite .env con sus credenciales
Python train_model.py
python -m uvicorn principal: aplicación --reload --port 8000
# API en: http://localhost:8000/api/v1
# Documentos en: http://localhost:8000/api/v1/docs
```

### Dockerización y DevOps

**Objetivo**: Contener la aplicación y crear una canalización de implementación.

**Características**:
- `Dockerfile` para Backend (Java multietapa)
- `Dockerfile` para servicio AI (Python multietapa)
- `docker-compose.yml` para desarrollo/producción local
- Controles de salud en ambos servicios.
- Volumen para Wallet (seguridad)
- Registro centralizado

**Cómo implementar**:
```golpecito
# Construir localmente
compilación de composición acoplable

# Ejecutar localmente
docker-componer -d

# Verificar
docker-componer ps
curl http://localhost:8080/api/v1/companies/health
rizo http://localhost:8000/api/v1/health/check
```

---

## 📊 Conjunto de datos

**Fuente**: `data/dataset_empresas_fintech_v2.7.csv`

**Características**:
- 🏢 **~1.000 Pymes Argentinas**
- 📊 **35+ atributos** (financieros, operativos, transaccionales)
- 📅 **Historial**: 2022-T1 a 2025-T4 (trimestral)
- 🎯 **Objetivo**: `Churn` (0=activo, 1=abandonado)

---

## 🔧 Pila de tecnología

### Servidor (Java)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Marco | Bota de primavera | 3.2.1 |
| Java | AbiertoJDK | 17 litros |
| ORM | Hibernar JPA | 6.x |
| Base de datos | Oracle BAsD | JSON autónomo |
| Grupo de conexiones | OracleUCP | 23.4 |
| Autenticación | Cartera Oráculo | X.509 |
| Herramienta de construcción | experto | 3.9.x |

### Servicio de IA (Python)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Marco | API rápida | 0,104+ |
| Biblioteca de aprendizaje automático | aprendizaje de ciencias | 1.3+ |
| Base de datos | oracledb | 1.3+ |
| Validación | Pydantico | 2.0+ |
| Asíncrono | Uvicornio | 0,24+ |

### Interfaz (JavaScript)
| Componente | Tecnología | Versión |
|-----------|-----------|---------|
| Marco | angulares | 19+ |
| Idioma | Mecanografiado | 5.x |
| CSS | CSS de viento de cola | 3.x |
| Estado | Señales | Nativo (Angular 19+) |
| Cliente HTTP | RxJS | 7.x |

### DevOps
| Herramienta | Propósito | Versión |
|-----------|----------|---------|
| acoplador | Contenedorización | 24.x |
| Docker componer | Desarrollo Local | 2.x |

---

## 🔒 Seguridad

**Implementado**:
- Oracle Wallet (autenticación X.509)
- Cifrado TCPS 1.2+
- Variables de entorno (SIN codificación)
- Gestión del grupo de conexiones.
- Prevención de inyección SQL (consultas parametrizadas)
- Gestión de transacciones
- CORS con validación
- Solicitar registro y seguimiento
- .gitignore (monedero + secretos excluidos)

---

## 📄 Licencia

Privado - Sólo para Pymer S.A.