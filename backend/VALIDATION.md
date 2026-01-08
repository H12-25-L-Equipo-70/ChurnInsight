# 🔍 VALIDACIÓN DE CONFIGURACIÓN - ChurnInsight Backend

## ✅ Checklist de Validación Pre-Ejecución

### 1️⃣ Verificación del Wallet
```bash
# Verificar que todos los archivos están presentes
ls -la backend/wallet_pymer/

# Debe contener:
# ✓ cwallet.sso
# ✓ ewallet.p12  (o similar)
# ✓ tnsnames.ora
# ✓ sqlnet.ora
# ✓ ojdbc.properties
```

**Esperado:**
```
total XX
-rw-r--r-- 1 user user XXXX tnsnames.ora
-rw-r--r-- 1 user user XXXX sqlnet.ora
-rw-r--r-- 1 user user XXXX cwallet.sso
-rw-r--r-- 1 user user XXXX ojdbc.properties
```

### 2️⃣ Verificación de tnsnames.ora
```bash
# Contenido debe incluir la entrada para pymerdb_high
grep -i "pymerdb_high" backend/wallet_pymer/tnsnames.ora

# Debe ver algo como:
# pymerdb_high = (description= (retry_count=20)...
```

**Esperado:** El alias `pymerdb_high` debe estar definido

### 3️⃣ Verificación de Java 17+
```bash
java -version
javac -version

# Esperado:
# openjdk version "17.0.x" ...
# javac 17.0.x
```

### 4️⃣ Verificación de Maven
```bash
mvn --version

# Esperado:
# Apache Maven 3.8.9 o superior
```

### 5️⃣ Verificación de Variables de Entorno (Linux/Mac)
```bash
# Validar que existen
echo $ORACLE_DB_PASSWORD
echo $ORACLE_WALLET_PATH
echo $ORACLE_NET_TNS_ADMIN

# Deben retornar valores no vacíos
```

**Para Windows PowerShell:**
```powershell
$env:ORACLE_DB_PASSWORD
$env:ORACLE_WALLET_PATH
$env:ORACLE_NET_TNS_ADMIN
```

### 6️⃣ Compilación Maven
```bash
cd backend/
mvn clean install

# Esperado:
# [INFO] BUILD SUCCESS
# [INFO] Total time: XX.XXX s
```

**Si falla:**
```bash
# Revisar errores de compilación
mvn clean install -X  # Modo debug

# Comprobar conectividad a repositorios Maven
mvn help:describe
```

---

## 🚀 Ejecución y Validación

### Paso 1: Iniciar Aplicación
```bash
cd backend/

# Opción 1: Con Maven
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Opción 2: Con JAR
mvn package
java -jar target/churninsight-backend-1.0.0-RELEASE.jar --spring.profiles.active=dev
```

### Paso 2: Monitorear Logs
```bash
# En otra terminal, seguir los logs
tail -f logs/churninsight.log

# O revisar en tiempo real
less +F logs/churninsight.log
```

### Esperado en Logs:
```
[main] INFO com.pymer.churninsight.ChurnInsightApplication
   - Starting ChurnInsightApplication...

[main] DEBUG com.pymer.churninsight.config.OracleDataSourceConfig
   - === Inicializando Oracle DataSource con Wallet ===
   - Wallet Path: ../wallet_pymer
   - TNS Admin: ../wallet_pymer
   - ✓ Oracle DataSource configurado correctamente con UCP

[main] INFO org.springframework.boot.web.embedded.tomcat.TomcatWebServer
   - Tomcat started on port(s): 8080 (http)

[main] INFO com.pymer.churninsight.ChurnInsightApplication
   - Started ChurnInsightApplication in X.XXX seconds
```

---

## 🔌 Validación de Endpoints

### 1️⃣ Health Check
```bash
curl -s http://localhost:8080/api/v1/companies/health | jq .

# Esperado:
{
  "status": "UP",
  "service": "Company Service",
  "version": "1.0.0"
}
```

### 2️⃣ Obtener Sectores (si hay datos)
```bash
curl -s http://localhost:8080/api/v1/companies/segments/sectors | jq .

# Esperado:
[
  "Tecnología",
  "Industria",
  "Agricultura",
  "Construcción",
  "Restaurantes"
]
```

### 3️⃣ Obtener Empresa por CUIT
```bash
curl -s http://localhost:8080/api/v1/companies/20748123114 | jq .

# Esperado (si existen datos):
{
  "cuit": "20748123114",
  "nombreEmpresa": "Godoy Tech",
  "sector": "Tecnología",
  "provincia": "Río Negro",
  ...
}
```

### 4️⃣ Estadísticas de Churn
```bash
curl -s http://localhost:8080/api/v1/companies/churn/statistics/Tecnología | jq .

# Esperado:
{
  "sector": "Tecnología",
  "totalCompanies": 5,
  "churnedCompanies": 1,
  "activeCompanies": 4,
  "churnRate": 20.0
}
```

---

## 🐛 Validación de Errores Comunes

### Error 1: "ORA-28759: Falló la conexión al Wallet"

**Cause:**
- Wallet no encontrado
- Variables de entorno no configuradas
- Permisos insuficientes en archivos del wallet

**Solución:**
```bash
# 1. Verificar ruta
ls -la backend/wallet_pymer/tnsnames.ora

# 2. Verificar permisos
chmod 644 backend/wallet_pymer/*

# 3. Verificar variable de entorno
export ORACLE_NET_TNS_ADMIN=`pwd`/backend/wallet_pymer
echo $ORACLE_NET_TNS_ADMIN
```

### Error 2: "Connection Pool Timeout"

**Cause:**
- Oracle Database no accesible
- Firewall bloqueando puerto 1522
- Wallet incorrecto

**Solución:**
```bash
# 1. Probar conectividad de red
telnet adb.sa-saopaulo-1.oraclecloud.com 1522

# 2. Verificar tnsnames.ora
cat backend/wallet_pymer/tnsnames.ora | grep -A 2 pymerdb_high

# 3. Aumentar timeout en application.properties
spring.datasource.hikari.connection-timeout=60000
```

### Error 3: "No columns found in tnsnames.ora"

**Cause:**
- Encoding incorrecto del archivo tnsnames.ora
- Archivo corrupto

**Solución:**
```bash
# Verificar encoding
file backend/wallet_pymer/tnsnames.ora

# Convertir a UTF-8 si es necesario
iconv -f ISO-8859-1 -t UTF-8 tnsnames.ora > tnsnames.ora.utf8
mv tnsnames.ora.utf8 tnsnames.ora
```

### Error 4: "ClassNotFoundException: ojdbc driver"

**Cause:**
- OJDBC no descargado correctamente
- Problema con repositorio Maven

**Solución:**
```bash
# Limpiar cache de Maven
rm -rf ~/.m2/repository/com/oracle/database/jdbc/

# Descargar nuevamente
mvn clean install -U
```

---

## 🧪 Test de Integración Rápido

### Script de Prueba Completa
```bash
#!/bin/bash

echo "=== ChurnInsight Backend Validation ==="

# 1. Verificar Java
echo "✓ Verificando Java..."
java -version 2>&1 | grep -i "openjdk\|oracle"

# 2. Verificar Maven
echo "✓ Verificando Maven..."
mvn --version | head -n 1

# 3. Verificar Wallet
echo "✓ Verificando Wallet..."
[ -f backend/wallet_pymer/tnsnames.ora ] && echo "  ✓ tnsnames.ora encontrado" || echo "  ✗ tnsnames.ora NO encontrado"
[ -f backend/wallet_pymer/sqlnet.ora ] && echo "  ✓ sqlnet.ora encontrado" || echo "  ✗ sqlnet.ora NO encontrado"

# 4. Compilar
echo "✓ Compilando..."
cd backend/
mvn clean install -q
if [ $? -eq 0 ]; then
    echo "  ✓ Compilación exitosa"
else
    echo "  ✗ Error en compilación"
    exit 1
fi

# 5. Health Check
echo "✓ Iniciando servidor (timeout 30s)..."
timeout 30 mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev" &
SERVER_PID=$!

sleep 10

echo "✓ Pruebas de API..."
curl -s http://localhost:8080/api/v1/companies/health | jq . && echo "  ✓ Health Check OK" || echo "  ✗ Health Check FAILED"

kill $SERVER_PID 2>/dev/null
wait $SERVER_PID 2>/dev/null

echo ""
echo "=== Validación Completada ==="
```

**Ejecutar:**
```bash
chmod +x validate.sh
./validate.sh
```

---

## 📊 Validación de Métrica de Éxito

| Métrica | Esperado | Estado |
|---------|----------|--------|
| Compilación Maven | BUILD SUCCESS | ✅ |
| Logs: DataSource cargado | ✓ Oracle DataSource configurado | ✅ |
| Health endpoint | HTTP 200 + JSON | ✅ |
| Conexión a BD | Sin excepciones en logs | ✅ |
| JPA Initialization | Hibernate dialect loading | ✅ |

---

## 📝 Logs Esperados para Validación

### ✅ CORRECTO
```
2024-01-07 10:15:23.456 [main] DEBUG c.p.c.config.OracleDataSourceConfig - === Inicializando Oracle DataSource con Wallet ===
2024-01-07 10:15:23.789 [main] DEBUG c.p.c.config.OracleDataSourceConfig - ✓ Oracle DataSource configurado correctamente con UCP
2024-01-07 10:15:24.123 [main] INFO  o.h.d.Dialect - Using dialect: org.hibernate.dialect.OracleDialect
2024-01-07 10:15:25.456 [main] INFO  t.w.e.TomcatWebServer - Tomcat started on port(s): 8080 (http)
2024-01-07 10:15:25.789 [main] INFO  c.p.c.ChurnInsightApplication - Started ChurnInsightApplication in 2.345 seconds
```

### ❌ INCORRECTO
```
Exception in thread "main" java.sql.SQLException: ORA-28759: Falló la conexión al Wallet
```

---

## 🎯 Próximos Pasos

Una vez validado todo:

1. ✅ **Misión 2**: Crear FastAPI Service (Python)
2. ✅ **Misión 3**: Crear Frontend Angular 19
3. ✅ **Misión 4**: Dockerizar todo con Docker Compose

---

## 📞 Soporte

**Si algo falla:**
1. Revisar logs completos: `less logs/churninsight.log`
2. Validar sección corresponde en este documento
3. Ejecutar con `-X` (debug mode): `mvn -X spring-boot:run`
4. Verificar conectividad de red a Oracle en OCI

**Arquitecto Senior**: Cloud & DevOps  
**Última Actualización**: 2024-01-07
