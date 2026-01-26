# 🏗️ ARQUITECTURA VISUAL - ChurnInsight Backend

## Diagrama de Capas (Clean Architecture)

```
┌─────────────────────────────────────────────────────────────────┐
│                      CLIENT (Angular Frontend)                   │
│                       via HTTP/REST API                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ HTTP Requests (JSON)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER (Port 8080)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CompanyController                                       │  │
│  │  ├── GET    /companies/{cuit}                           │  │
│  │  ├── GET    /companies/sector/{sector}                 │  │
│  │  ├── GET    /companies/churn/high-risk                 │  │
│  │  ├── GET    /companies/segments/sectors                │  │
│  │  └── GET    /companies/health                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ▲                                        │
│              @RestController, @CrossOrigin                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ DTOs (CompanyResponseDTO)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│              APPLICATION LAYER (Business Logic)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CompanyService                                          │  │
│  │  ├── getCompanyByCuit(cuit): CompanyResponseDTO         │  │
│  │  ├── getCompaniesBySector(sector): List<DTO>           │  │
│  │  ├── getChurnedCompanies(): List<DTO>                  │  │
│  │  ├── getHighRiskCompanies(): List<DTO>                 │  │
│  │  ├── getChurnStatisticsBySector(): Stats               │  │
│  │  └── getAllSectors(): List<String>                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ▲                                        │
│              @Service, @Transactional                            │
│              Lógica de negocio de dominio                       │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ Query/Filter Operations
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                 DOMAIN LAYER (Entities & Rules)                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Company (JPA Entity)                                    │  │
│  │  ├── CUIT: String (PK)                                  │  │
│  │  ├── nombreEmpresa: String                              │  │
│  │  ├── sector, provincia, periodoFiscal                   │  │
│  │  ├── ingresos, gastos, margen, deuda, activos           │  │
│  │  ├── churn: Integer (0/1) [TARGET]                      │  │
│  │  └── Métodos: getDebtRatio(), getMarginPercent(), etc. │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  CompanyRepository (JPA Interface)                       │  │
│  │  ├── findById(cuit)                                     │  │
│  │  ├── findBySector(sector, Pageable)                    │  │
│  │  ├── findByChurn(churn)                                │  │
│  │  ├── findHighDebtCompanies(ratio)                      │  │
│  │  ├── findAllSectors()                                  │  │
│  │  └── Custom @Query for advanced searches               │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ▲                                        │
│              @Entity, @Repository                               │
│              No conoce DetallesdeImplementación                │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ JPA Queries (HQL → SQL)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│            INFRASTRUCTURE LAYER (Persistence)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  OracleDataSourceConfig                                  │  │
│  │  ├── PoolDataSource (Oracle UCP)                        │  │
│  │  ├── Connection Pool (Min=5, Max=30)                    │  │
│  │  ├── Wallet Integration (tnsnames.ora)                  │  │
│  │  ├── SSL/TLS Configuration                             │  │
│  │  ├── EntityManagerFactory (Hibernate)                   │  │
│  │  └── TransactionManager                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                         ▲                                        │
│              @Configuration, @EnableJpaRepositories              │
│              Hiberate Dialect: OracleDialect                    │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         │ JDBC (OJDBC 11)
                         │ Oracle Wallet (X.509)
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│          ORACLE AUTONOMOUS DATABASE (OCI)                        │
│          Region: São Paulo (sa-saopaulo-1)                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Connection (TCPS/1522)                                 │  │
│  │  ├── Host: adb.sa-saopaulo-1.oraclecloud.com            │  │
│  │  ├── Service: pymerdb_high.adb.oraclecloud.com          │  │
│  │  └── Auth: Oracle Wallet (cwallet.sso + keystore.jks)   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  TABLE: EMPRESAS (PYMERDB Schema)                        │  │
│  │  ├── CUIT (PK, VARCHAR2)                                │  │
│  │  ├── Datos Básicos (nombre, sector, provincia)          │  │
│  │  ├── Datos Financieros (ingresos, gastos, margen)       │  │
│  │  ├── Datos de Riesgo (deuda, activos, préstamos)        │  │
│  │  ├── Estado (churn, churn_date)                         │  │
│  │  ├── Auditoría (created_at, updated_at)                 │  │
│  │  └── ~1000 registros (2022-Q1 a 2025-Q4)               │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Flujo de Datos - Ejemplo: Obtener Empresa por CUIT

```
1. HTTP Request
   ┌─────────────────────────────────────────┐
   │ GET /api/v1/companies/20748123114       │
   │ Host: localhost:8080                    │
   └─────────────────────────────────────────┘
                    │
                    ▼
2. Presentation Layer (CompanyController)
   ┌─────────────────────────────────────────┐
   │ @GetMapping("/{cuit}")                  │
   │ → getCompanyByCuit("20748123114")       │
   └─────────────────────────────────────────┘
                    │
                    ▼
3. Application Layer (CompanyService)
   ┌─────────────────────────────────────────┐
   │ @Service                                │
   │ → companyRepository.findById("...")     │
   │ → Optional<Company>                     │
   │ → mapToDTO(company)                     │
   └─────────────────────────────────────────┘
                    │
                    ▼
4. Domain Layer (CompanyRepository)
   ┌─────────────────────────────────────────┐
   │ JpaRepository.findById(id)              │
   │ → Hibernate generates SQL               │
   └─────────────────────────────────────────┘
                    │
                    ▼
5. Infrastructure Layer (Hibernate + JDBC)
   ┌─────────────────────────────────────────┐
   │ SELECT * FROM EMPRESAS WHERE CUIT = ?   │
   │ (Prepare statement with wallet auth)    │
   └─────────────────────────────────────────┘
                    │
                    ▼
6. Oracle Database (via Wallet)
   ┌─────────────────────────────────────────┐
   │ Execute SQL                             │
   │ ← Return ResultSet (1 row)              │
   └─────────────────────────────────────────┘
                    │
                    ▼
7. Back to Application (Hibernate Mapping)
   ┌─────────────────────────────────────────┐
   │ ResultSet → Company Entity              │
   │ Populate all attributes                 │
   └─────────────────────────────────────────┘
                    │
                    ▼
8. Conversion to DTO (CompanyService)
   ┌─────────────────────────────────────────┐
   │ Company → CompanyResponseDTO            │
   │ Calculate derived fields:               │
   │ - debtToEquityRatio                     │
   │ - operatingMarginPercent                │
   │ - companyAgeRange                       │
   └─────────────────────────────────────────┘
                    │
                    ▼
9. HTTP Response
   ┌─────────────────────────────────────────┐
   │ HTTP 200 OK                             │
   │ Content-Type: application/json          │
   │ {                                       │
   │   "cuit": "20748123114",                │
   │   "nombreEmpresa": "Godoy Tech",        │
   │   "sector": "Tecnología",               │
   │   "ingresos": 83320313.96,              │
   │   "churn": 0,                           │
   │   "debtToEquityRatio": 0.0728,          │
   │   ...                                   │
   │ }                                       │
   └─────────────────────────────────────────┘
```

---

## Configuración del Wallet - Seguridad

```
┌─────────────────────────────────────────────────────────┐
│         Oracle Wallet (Descomprimido Localmente)        │
│                                                         │
│  backend/wallet_pymer/                                  │
│  ├── cwallet.sso                                        │
│  │   └── Wallet de credenciales encriptado             │
│  ├── ewallet.p12 (o equivalente)                        │
│  │   └── Certificado PKCS12                            │
│  ├── keystore.jks                                       │
│  │   └── Java KeyStore (si está convertido)            │
│  ├── truststore.jks                                     │
│  │   └── TrustStore para validar CA de Oracle          │
│  ├── tnsnames.ora                                       │
│  │   └── Oracle Net Services Configuration             │
│  │       pymerdb_high = (description= ...)             │
│  │       pymerdb_medium = (description= ...)           │
│  │       pymerdb_low = (description= ...)              │
│  ├── sqlnet.ora                                         │
│  │   └── SQL Net Configuration                         │
│  └── ojdbc.properties                                   │
│      └── JDBC Properties                               │
│                                                         │
└─────────────────────────────────────────────────────────┘
                        │
                        │ Referenciado por:
                        │ ORACLE_NET_TNS_ADMIN env var
                        │
                        ▼
    ┌─────────────────────────────────────────┐
    │     OracleDataSourceConfig              │
    │                                         │
    │  poolDataSource.setURL(                 │
    │    "jdbc:oracle:thin:@pymerdb_high"    │
    │  )                                      │
    │                                         │
    │  Properties:                            │
    │  - javax.net.ssl.trustStore             │
    │  - javax.net.ssl.keyStore               │
    │  - oracle.net.tns_admin                 │
    └─────────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────────┐
    │     TCPS Connection (Port 1522)         │
    │     Encrypted + Authenticated           │
    │     X.509 Certificate Validation        │
    └─────────────────────────────────────────┘
                        │
                        ▼
    ┌─────────────────────────────────────────┐
    │  Oracle ADB (OCI)                       │
    │  Región: sa-saopaulo-1                  │
    │  Host: adb.sa-saopaulo-1.oraclecloud.com
    │  SSL/TLS Encrypted Connection           │
    └─────────────────────────────────────────┘
```

---

## Pool de Conexiones (Oracle UCP)

```
┌───────────────────────────────────────────────────────────┐
│           Oracle UCP (Universal Connection Pool)          │
│                                                           │
│  Configuration:                                           │
│  ├── Initial Pool Size: 5 connections                    │
│  ├── Min Pool Size: 5 connections                        │
│  ├── Max Pool Size: 30 connections                       │
│  ├── Connection Increment: 5                             │
│  ├── Connection Wait Timeout: 30 seconds                 │
│  ├── Inactivity Timeout: 900 seconds (15 min)            │
│  └── Validation Interval: 60 seconds                     │
│                                                           │
│  Disponibles:  ●●●●●  (5 activas)                       │
│  En Uso:       ◔◔ (2 en uso)                             │
│  Esperando:    ○ (1 esperando)                           │
│                                                           │
│  Si request requiere conexión:                           │
│  ├── ✓ Si hay disponible: reutilizar                    │
│  ├── ✓ Si no pero Max < 30: crear nueva                 │
│  └── ✓ Si Max alcanzado: esperar con timeout            │
└───────────────────────────────────────────────────────────┘
```

---

## Request/Response Flow - Análisis de Churn

```
Frontend (Angular)
    │
    │ HTTP GET /api/v1/companies/churn/high-risk?periodoFiscal=2024-Q4
    │
    ▼
┌───────────────────────────────────────┐
│  CompanyController                     │
│  @GetMapping("/churn/high-risk")      │
│  public ResponseEntity<List>() {      │
│    companyService.getHighRiskCompanies()
│  }                                     │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│  CompanyService                        │
│  getHighRiskCompanies(periodo) {      │
│    1. Load companies for period       │
│    2. Filter by debt ratio > 30%      │
│    3. Filter by low activity < 30 days│
│    4. Convert to DTO list             │
│    5. Return List<CompanyResponseDTO> │
│  }                                     │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│  CompanyRepository                     │
│  findByPeriodoFiscal(periodo)         │
│  → Hibernate Query                     │
│  → SQL: SELECT * FROM EMPRESAS        │
│         WHERE PERIODO_FISCAL = ?      │
│  → ResultSet (multiple rows)          │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│  Oracle Database                       │
│  Execute SQL                           │
│  ← Return 50 companies (ejemplo)      │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│  Post-Processing (Java Streams)       │
│  List<Company> → Stream → Filter:     │
│  - DEUDA / ACTIVOS > 0.30             │
│  - TRIMESTRE_DIAS_ACTIVIDAD < 30      │
│  ← 5 high-risk companies              │
└───────────────────────────────────────┘
    │
    ▼
┌───────────────────────────────────────┐
│  DTO Mapping & Response                │
│  List<Company> → List<DTO>            │
│  + Calculate: debtRatio, margin%, etc │
│  Return HTTP 200 + JSON Array         │
└───────────────────────────────────────┘
    │
    ▼
Frontend (Angular)
    [
      {
        "cuit": "...",
        "nombreEmpresa": "...",
        "debtToEquityRatio": 0.45,
        "churn": 1
      },
      ...
    ]
```

---

## Capas de Seguridad

```
Layer 1: Network Security
    ├── TCPS (TLS 1.2+)
    ├── Port 1522 (Oracle ADB)
    └── Firewall rules in OCI

Layer 2: Authentication
    ├── Oracle Wallet (X.509 certificates)
    ├── KeyStore + TrustStore
    └── No username/password in code

Layer 3: Application Security
    ├── No hardcoded credentials
    ├── Environment variables only
    ├── @Transactional for data integrity
    └── @CrossOrigin CORS control

Layer 4: Data Layer Security
    ├── Parameterized queries (SQL Injection prevention)
    ├── Connection pooling (resource control)
    ├── Connection validation
    └── Timeout management
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────┐
│       Docker Compose (Local Dev)                │
├─────────────────────────────────────────────────┤
│                                                 │
│  ┌──────────────┐  ┌──────────────┐             │
│  │   Frontend   │  │   Backend    │             │
│  │  Angular 19  │  │ Spring Boot  │             │
│  │   :3000      │  │   :8080      │             │
│  └──────────────┘  └──────────────┘             │
│         │                  │                    │
│         │                  │                    │
│         └──────┬───────────┘                    │
│                │                                │
│  ┌──────────────────────────────┐               │
│  │  AI Service (FastAPI)        │               │
│  │  :8000                       │               │
│  └──────────────────────────────┘               │
│                │                                │
│                │ (through VPN/SSH)             │
│                ▼                                │
│  ┌──────────────────────────────────────┐      │
│  │  Oracle ADB (OCI - Sa Paulo)         │      │
│  │  TCPS://adb.sa-saopaulo-1:1522       │      │
│  │  Wallet Auth (X.509)                 │      │
│  └──────────────────────────────────────┘      │
│                                                 │
└─────────────────────────────────────────────────┘
```

---

## Tecnologías Utilizadas

```
┌──────────────────────────────────────────────┐
│  Spring Boot Ecosystem                       │
│  ├── spring-boot-starter-web (REST API)      │
│  ├── spring-boot-starter-data-jpa (ORM)      │
│  ├── spring-cloud-starter-openfeign (RPC)    │
│  ├── spring-boot-starter-actuator (Monitoring)
│  └── spring-boot-starter-validation         │
├──────────────────────────────────────────────┤
│  Persistence Layer                           │
│  ├── Hibernate 6.x (JPA Implementation)      │
│  ├── OJDBC 11 (Oracle JDBC Driver)           │
│  └── Oracle UCP (Connection Pooling)         │
├──────────────────────────────────────────────┤
│  Utilities & Libraries                       │
│  ├── Lombok (Boilerplate reduction)          │
│  ├── Mapstruct (DTO mapping)                 │
│  ├── Jackson (JSON serialization)            │
│  └── SLF4J + Logback (Logging)               │
│  ├── JUnit 5 (Testing)                       │
├──────────────────────────────────────────────┤
│  Build & Deployment                          │
│  ├── Maven 3.9.x                             │
│  ├── Docker                                  │
│  └── Docker Compose                          │
└──────────────────────────────────────────────┘
```

---

**Este diagrama representa la arquitectura completa lista para producción.**
