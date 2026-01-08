# ⚡ QUICK START - ChurnInsight Backend

## 🚀 Setup en 5 minutos

### 1. Configurar Variables de Entorno
```bash
# Linux/Mac
export ORACLE_DB_PASSWORD="tu_contraseña"
export ORACLE_WALLET_PATH="$(pwd)/backend/wallet_pymer"
export ORACLE_NET_TNS_ADMIN="$(pwd)/backend/wallet_pymer"

# Windows PowerShell
$env:ORACLE_DB_PASSWORD = "tu_contraseña"
$env:ORACLE_WALLET_PATH = "C:\Repositorios\ChurnInsight\backend\wallet_pymer"
$env:ORACLE_NET_TNS_ADMIN = "C:\Repositorios\ChurnInsight\backend\wallet_pymer"
```

### 2. Copiar .env.example
```bash
cp backend/.env.example backend/.env
# Editar backend/.env con tus valores
```

### 3. Compilar
```bash
cd backend/
mvn clean install
```

### 4. Ejecutar
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### 5. Validar
```bash
curl http://localhost:8080/api/v1/companies/health
```

---

## 📚 Comandos Rápidos

```bash
# Limpiar y compilar
mvn clean install

# Ejecutar en modo debug
mvn -X spring-boot:run

# Ejecutar tests
mvn test

# Generar JAR
mvn package

# Ejecutar JAR
java -jar target/churninsight-backend-1.0.0-RELEASE.jar

# Revisar dependencias
mvn dependency:tree
```

---

## 🔌 API Endpoints Rápidos

```bash
# Health
curl http://localhost:8080/api/v1/companies/health

# Sectores
curl http://localhost:8080/api/v1/companies/segments/sectors

# Empresas activas
curl http://localhost:8080/api/v1/companies/churn/active

# Empresas abandonadas
curl http://localhost:8080/api/v1/companies/churn/churned

# Empresa por CUIT
curl http://localhost:8080/api/v1/companies/20748123114

# Estadísticas por sector
curl http://localhost:8080/api/v1/companies/churn/statistics/Tecnología

# Empresas de alto riesgo
curl http://localhost:8080/api/v1/companies/churn/high-risk?periodoFiscal=2024-Q4
```

---

## 🏗️ Estructura de Carpetas

```
backend/
├── src/main/java/com/pymer/churninsight/
│   ├── ChurnInsightApplication.java
│   ├── config/
│   │   └── OracleDataSourceConfig.java
│   ├── domain/
│   │   ├── entity/
│   │   │   └── Company.java
│   │   └── repository/
│   │       └── CompanyRepository.java
│   ├── application/
│   │   ├── service/
│   │   │   └── CompanyService.java
│   │   └── dto/
│   │       └── CompanyResponseDTO.java
│   └── presentation/
│       └── controller/
│           └── CompanyController.java
├── src/main/resources/
│   ├── application.properties
│   └── logback-spring.xml
├── src/test/java/...
├── pom.xml
├── .env.example
├── .gitignore
└── QUICK_START.md (este archivo)
```

---

## 🔐 Archivos Críticos

| Archivo | Propósito |
|---------|-----------|
| `pom.xml` | Dependencias Maven (OJDBC, Spring Boot, etc.) |
| `OracleDataSourceConfig.java` | Configuración del DataSource con Wallet |
| `Company.java` | Entidad JPA que mapea tabla EMPRESAS |
| `CompanyRepository.java` | Acceso a datos (JPA) |
| `CompanyService.java` | Lógica de negocio |
| `CompanyController.java` | REST API endpoints |
| `application.properties` | Configuración de la aplicación |
| `.env.example` | Variables de entorno requeridas |

---

## 🛠️ Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "tnsnames.ora no encontrado" | Verificar `oracle.wallet.tns-admin-path` en application.properties |
| "Connection Pool Timeout" | Aumentar `CONNECTION_POOL_MAX_SIZE` en OracleDataSourceConfig |
| Maven BUILD FAILURE | Ejecutar `mvn clean install -U` para actualizar dependencias |
| Puerto 8080 en uso | `lsof -i :8080` (Linux/Mac) o cambiar `server.port` en application.properties |
| Acceso denegado a Wallet | `chmod 644 backend/wallet_pymer/*` |

---

## 🎯 Arquitectura (Clean Architecture)

```
Presentation (REST)
    ↓
Application (Business Logic)
    ↓
Domain (Entities & Rules)
    ↓
Infrastructure (Database)
```

---

## 🔄 Flujo de Datos

```
HTTP Request
    ↓
CompanyController (Presentation)
    ↓
CompanyService (Application)
    ↓
CompanyRepository (Domain → Infrastructure)
    ↓
Oracle Database (via Wallet)
    ↓
DTO Response
    ↓
HTTP Response (JSON)
```

---

## 📖 Convenciones de Código

- **Packages**: `com.pymer.churninsight.*`
- **Entity names**: `Company` (singular)
- **DTOs**: `CompanyResponseDTO`
- **Repositories**: `CompanyRepository`
- **Services**: `CompanyService`
- **Controllers**: `CompanyController`
- **Database schema**: UPPERCASE (EMPRESAS)

---

## ✨ Características Implementadas

✅ Spring Boot 3.2.1  
✅ Java 17  
✅ Oracle Autonomous Database con Wallet  
✅ Oracle UCP (Connection Pooling)  
✅ Hibernate JPA  
✅ REST API con Spring Web  
✅ DTO Pattern (Clean Architecture)  
✅ Transaction Management  
✅ Comprehensive Logging  
✅ Health Checks  
✅ Paginación  
✅ Búsquedas avanzadas  

---

## 📊 Base de Datos

**Tabla**: EMPRESAS  
**Esquema**: PYMERDB  
**PK**: CUIT (VARCHAR2)  
**Registros esperados**: ~1000 Pymes argentinas  
**Período**: 2022-Q1 a 2025-Q4 (datos históricos)

---

## 🚀 Próximas Misiones

1. **Misión 2**: FastAPI Service (Python) para AI predictions
2. **Misión 3**: Frontend Angular 19 con Signals
3. **Misión 4**: Docker Compose + Deployment

---

## 📞 Contacto

**Rol**: Senior Full-Stack Cloud Architect & DevOps Engineer  
**Especialidad**: Oracle + Fintech + DevOps  
**Proyecto**: ChurnInsight v1.0.0  
**Stack**: Spring Boot 3.x | Oracle ADB | Docker | Kubernetes (futuro)

---

**¡Listo para desarrollar! 🎉**
