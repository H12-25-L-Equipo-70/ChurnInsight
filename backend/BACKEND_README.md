# ChurnInsight Backend - Configuración Spring Boot

## 📋 Descripción General

Backend de **ChurnInsight**: Plataforma B2B para predicción de abandono (Churn) de Pymes argentinas usando IA e **Oracle Autonomous Database** en OCI.

### Stack Tecnológico
- **Framework**: Spring Boot 3.2.1
- **Java**: 17+
- **Base de Datos**: Oracle Autonomous JSON Database (PYMERDB) en OCI
- **Seguridad**: Oracle Wallet (Autenticación X.509)
- **Pool de Conexiones**: Oracle UCP (Universal Connection Pool)
- **ORM**: Hibernate JPA
- **Build Tool**: Maven 3.9.x

---

## 🏗️ Arquitectura (Clean Architecture)

```
src/main/java/com/pymer/churninsight/
├── ChurnInsightApplication.java          # Main App
├── config/
│   └── OracleDataSourceConfig.java      # ✅ DataSource con Wallet
├── domain/
│   ├── entity/
│   │   └── Company.java                  # ✅ Entidad JPA
│   └── repository/
│       └── CompanyRepository.java        # ✅ JPA Repository
├── application/
│   ├── service/
│   │   └── CompanyService.java           # ✅ Lógica de Negocio
│   └── dto/
│       └── CompanyResponseDTO.java       # ✅ DTO
└── presentation/
    └── controller/
        └── CompanyController.java        # ✅ REST API
```

---

## 🔐 Configuración del Oracle Wallet

### Paso 1: Ubicación del Wallet

El wallet debe estar descomprimido en:
```
backend/wallet_pymer/
├── cwallet.sso          # Cartera de credenciales encriptada
├── ewallet.p12          # Certificado PKCS12
├── keystore.jks         # Java KeyStore (si está convertido)
├── truststore.jks       # TrustStore para SSL
├── tnsnames.ora         # Aliases de conexión TNS
├── sqlnet.ora           # Configuración SQL*Net
└── ojdbc.properties     # Propiedades JDBC
```

### Paso 2: Configurar `application.properties`

```properties
# Propiedades del Wallet Oracle
oracle.wallet.wallet-path=../wallet_pymer
oracle.wallet.tns-admin-path=../wallet_pymer
oracle.wallet.database-name=pymerdb_high
oracle.wallet.username=admin
oracle.wallet.password=${ORACLE_DB_PASSWORD}  # Desde variable de entorno
oracle.wallet.trust-store-password=wallet_password
oracle.wallet.key-store-password=wallet_password

# Sistema propiedad (CRÍTICA para JDBC Thin)
oracle.net.tns_admin=../wallet_pymer
```

### Paso 3: Variables de Entorno

```bash
# En Linux/Mac
export ORACLE_DB_PASSWORD="tu_contraseña"
export ORACLE_WALLET_PATH="/home/ronaldorv/Repositorios/ChurnInsight/backend/wallet_pymer"
export ORACLE_NET_TNS_ADMIN="/home/ronaldorv/Repositorios/ChurnInsight/backend/wallet_pymer"

# En Windows PowerShell
$env:ORACLE_DB_PASSWORD = "tu_contraseña"
$env:ORACLE_WALLET_PATH = "C:\Repositorios\ChurnInsight\backend\wallet_pymer"
```

### Paso 4: Convertir Wallet a KeyStore (si es necesario)

Si necesitas convertir el wallet a formato Java KeyStore:

```bash
# Instalar orapki si no lo tienes
# Convertir EOWallet.p12 a Java KeyStore
keytool -importkeystore \
  -srckeystore ewallet.p12 \
  -srcstoretype PKCS12 \
  -srcstorepass wallet_password \
  -destkeystore keystore.jks \
  -deststoretype JKS \
  -deststorepass wallet_password

# Crear TrustStore desde certificados
keytool -importcert \
  -file ca_certificate.crt \
  -alias oracle_ca \
  -keystore truststore.jks \
  -storepass wallet_password \
  -noprompt
```

---

## 📦 Dependencias Maven (pom.xml)

### Dependencias de Oracle JDBC
```xml
<!-- OJDBC 11 - Driver JDBC de Oracle -->
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ojdbc11</artifactId>
    <version>23.4.0.24.05</version>
</dependency>

<!-- UCP - Universal Connection Pool -->
<dependency>
    <groupId>com.oracle.database.jdbc</groupId>
    <artifactId>ucp</artifactId>
    <version>23.4.0.24.05</version>
</dependency>
```

### Spring Boot Starters
```xml
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-web</artifactId>
</dependency>

<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```

---

## ▶️ Ejecución

### Compilación
```bash
cd backend/
mvn clean install
```

### Ejecución Local
```bash
# Con perfil development
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# O como archivo JAR
mvn package
java -jar target/churninsight-backend-1.0.0-RELEASE.jar --spring.profiles.active=dev
```

### Verificación de Conectividad
```bash
# Revisar logs
tail -f logs/churninsight.log

# Health Check
curl -s http://localhost:8080/api/v1/companies/health | jq .

# Obtener sectores (requiere datos en BD)
curl -s http://localhost:8080/api/v1/companies/segments/sectors | jq .
```

---

## 🛠️ Configuración de IDE (VS Code / IntelliJ)

### VS Code - Extension Pack for Java
```json
{
  "java.jdt.ls.vmargs": "-XX:+UseG1GC -XX:+UseStringDeduplication -Xmx1G -Xms100m"
}
```

### IntelliJ IDEA
1. File → Project Structure → Project
2. SDK: Java 17
3. Language Level: 17
4. Compiler: 17

---

## 📊 Entidad Company (Mapeo ORM)

### Tabla Oracle: EMPRESAS
```sql
CREATE TABLE EMPRESAS (
    CUIT VARCHAR2(20) PRIMARY KEY,
    NOMBRE_EMPRESA VARCHAR2(255) NOT NULL,
    TIPO_SOCIEDAD VARCHAR2(50),
    SECTOR VARCHAR2(100),
    PROVINCIA VARCHAR2(100),
    AÑO_FUNDACION NUMBER,
    EMPLEADOS NUMBER,
    PERIODO_FISCAL VARCHAR2(10) NOT NULL,
    INGRESOS NUMBER(18,2),
    GASTOS NUMBER(18,2),
    MARGEN NUMBER(18,2),
    DEUDA NUMBER(18,2),
    ACTIVOS NUMBER(18,2),
    -- ... más columnas ...
    CHURN NUMBER(1),
    CHURN_DATE DATE,
    CREATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    UPDATED_AT TIMESTAMP DEFAULT SYSTIMESTAMP,
    TELEFONO VARCHAR2(30),
    DIRECCION VARCHAR2(500)
);
```

### Atributos de la Entidad Java
- **ID**: CUIT (identificador único)
- **Financieros**: ingresos, gastos, margen, deuda, activos
- **Préstamos**: prestamos_solicitados, prestamos_aprobados, etc.
- **Actividad**: trimestreDiasActividad, promedioLoginDia, totalLoginDia
- **Transacciones**: transferencias, pagos, créditos, inversiones
- **Churn**: churn (0/1), churnDate

---

## 🔌 API Endpoints

### Base URL
```
http://localhost:8080/api/v1/companies
```

### Endpoints Principales

#### 1. Obtener Empresa
```
GET /companies/{cuit}
```

#### 2. Listar Empresas por Sector
```
GET /companies/sector/{sector}
GET /companies/sector/{sector}/paginated?page=0&size=20&sort=nombreEmpresa,asc
```

#### 3. Análisis de Churn
```
GET /companies/churn/churned              # Empresas abandonadas
GET /companies/churn/active               # Empresas activas
GET /companies/churn/statistics/{sector}  # Estadísticas por sector
GET /companies/churn/high-risk?periodoFiscal=2024-Q4  # Alto riesgo
GET /companies/churn/by-date-range?startDate=2024-01-01&endDate=2024-12-31
```

#### 4. Segmentación
```
GET /companies/segments/sectors           # Sectores únicos
GET /companies/segments/provincias        # Provincias únicas
GET /companies/count/sector/{sector}      # Contar por sector
GET /companies/count/churn/{churn}        # Contar por estado
GET /companies/latest-periodo             # Período más reciente
```

---

## 🧪 Testing

### Unit Tests (JUnit 5)
```bash
mvn test
```

### Integración Tests (Oracle ADB)
```bash
mvn -Dtest=*IntegrationTest test
```

### API REST Testing
```bash
# Usar REST Client extension en VS Code
# O Postman con colección incluida
```

---

## 🚀 Deployment (Docker)

### Dockerfile
```dockerfile
FROM openjdk:17-slim
COPY target/churninsight-backend-1.0.0-RELEASE.jar app.jar
COPY wallet_pymer/ /app/wallet_pymer/
ENV ORACLE_NET_TNS_ADMIN=/app/wallet_pymer
ENTRYPOINT ["java","-jar","/app/app.jar"]
EXPOSE 8080
```

### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: .
    ports:
      - "8080:8080"
    environment:
      ORACLE_DB_PASSWORD: ${ORACLE_DB_PASSWORD}
      SPRING_PROFILES_ACTIVE: prod
    volumes:
      - ./wallet_pymer:/app/wallet_pymer:ro
```

---

## 📝 Logging

### Niveles de Log
- **DEBUG**: Detalles de operaciones CRUD, SQL generado
- **INFO**: Eventos importantes (inicio, fin de procesos)
- **WARN**: Advertencias (conexiones lentas, validaciones)
- **ERROR**: Errores de negocio y excepciones

### Configuración
```properties
logging.level.com.pymer.churninsight=DEBUG
logging.level.org.hibernate.SQL=DEBUG
```

---

## 🔒 Seguridad

### Wallet Security
- ✅ Credenciales encriptadas en wallet.sso
- ✅ SSL/TLS para comunicación con BD
- ✅ No exonerar contraseñas en código (usar env vars)

### Spring Security (Futuro)
```java
// A implementar en próxima fase
@Configuration
@EnableWebSecurity
public class SecurityConfig { ... }
```

---

## 🐛 Troubleshooting

### Error: "tnsnames.ora no encontrado"
```
Solución: Verificar oracle.wallet.tns-admin-path en application.properties
          Asegurar que el archivo existe en esa ruta
```

### Error: "ORA-28759: Falló la conexión al Wallet"
```
Solución: Verificar que ewallet.p12 tiene permisos de lectura
          Convertir a KeyStore JKS si es necesario
```

### Error: "Connection Pool timeout"
```
Solución: Aumentar CONNECTION_POOL_MAX_SIZE en OracleDataSourceConfig
          Verificar disponibilidad de la instancia Oracle en OCI
```

---

## 📞 Soporte

**Arquitecto Senior**: Cloud & DevOps  
**Proyecto**: ChurnInsight v1.0.0  
**Última Actualización**: 2024

---

## 📚 Referencias

- [Oracle JDBC Documentation](https://docs.oracle.com/en/database/oracle/oracle-database/23/jajdb/)
- [Spring Data JPA](https://spring.io/projects/spring-data-jpa)
- [Oracle Autonomous Database](https://www.oracle.com/mx/autonomous-database/)
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html)
