# ✅ DEPLOYMENT CHECKLIST - ChurnInsight

## Pre-Deployment Checklist (Local Dev)

### 1. Ambiente Local
- [ ] Git repositorio clonado
- [ ] Docker instalado y funcionando (`docker --version`)
- [ ] Docker-compose instalado (`docker-compose --version`)
- [ ] Python 3.11+ instalado (para entrenar modelo localmente)
- [ ] Java 21 LTS instalado (para backend)
- [ ] Maven instalado (para compilar backend)

### 2. Estructura de Carpetas
- [ ] `backend/` existe con estructura completa
- [ ] `ai_service/` existe con estructura completa
- [ ] `data/` contiene `dataset_empresas_fintech_v2.7.csv`
- [ ] `backend/wallet_pymer/` tiene archivos de Wallet
  - [ ] `cwallet.sso`
  - [ ] `sqlnet.ora`
  - [ ] `tnsnames.ora`
  - [ ] `ojdbc.properties`

### 3. Archivos de Configuración
- [ ] `.env.example` existe en raíz
- [ ] `docker-compose.yml` existe y está completo
- [ ] `backend/.env.example` existe
- [ ] `ai_service/.env.example` existe
- [ ] `.gitignore` existe y excluye:
  - [ ] `.env` (no *.example)
  - [ ] `*.pkl` (modelos)
  - [ ] `wallet_pymer/` (credenciales)
  - [ ] `logs/`
  - [ ] `venv/`, `__pycache__`, `target/`

### 4. Backend (Spring Boot)
- [ ] `backend/pom.xml` existe y tiene dependencias correctas
- [ ] `backend/src/main/java/com/pymer/churninsight/` existe
- [ ] Archivos Java compilables:
  - [ ] `Application.java`
  - [ ] Controllers (5 archivos)
  - [ ] Services (3 archivos)
  - [ ] Repositories (2 archivos)
  - [ ] Entities (2 archivos)
- [ ] `backend/Dockerfile` existe
- [ ] `backend/README.md` existe
- [ ] Compilación local exitosa: `mvn clean compile`

### 5. AI Service (FastAPI)
- [ ] `ai_service/main.py` existe
- [ ] `ai_service/requirements.txt` tiene todas las dependencias:
  - [ ] fastapi, uvicorn
  - [ ] scikit-learn, pandas, numpy
  - [ ] oracledb, sqlalchemy
  - [ ] pydantic, python-dotenv
- [ ] `ai_service/train_model.py` existe
- [ ] `ai_service/app/routes/` tiene:
  - [ ] `health.py`
  - [ ] `predictions.py`
- [ ] `ai_service/app/core/` tiene:
  - [ ] `model_manager.py`
  - [ ] `oracle_connection.py`
- [ ] `ai_service/app/schemas/` tiene:
  - [ ] `prediction.py`
- [ ] `ai_service/config/settings.py` existe
- [ ] `ai_service/Dockerfile` existe
- [ ] `ai_service/README_AI.md` existe

### 6. Documentación
- [ ] `README_PROJECT.md` actualizado con estado actual
- [ ] `STATUS_DASHBOARD.md` con progreso al 50%
- [ ] `EXECUTIVE_SUMMARY.md` con entregables
- [ ] `ORACLE_CLOUD_DEPLOYMENT.md` con guía paso a paso
- [ ] `MISSION_1_COMPLETE.md` documento de cierre
- [ ] `MISSION_2_COMPLETE.md` documento de cierre
- [ ] `ai_service/API_DOCUMENTATION.md` con todos los endpoints
- [ ] `ai_service/QUICK_START.md` con setup rápido

---

## Validación Local

### Test Backend Spring Boot
```bash
# En carpeta backend/
mvn clean package -DskipTests

# Esperado: BUILD SUCCESS

# Iniciar localmente
java -jar target/churninsight-*.jar

# Probar endpoint
curl -s http://localhost:8080/api/v1/companies/health | jq

# Debe retornar:
# {
#   "status": "UP",
#   "database": "connected",
#   "timestamp": "..."
# }
```
- [ ] Backend compila sin errores
- [ ] Backend inicia correctamente
- [ ] Health endpoint responde
- [ ] Database conectado

### Test AI Service FastAPI
```bash
# En carpeta ai_service/
pip install -r requirements.txt

# Entrenar modelo
python train_model.py

# Debe generar:
# - models/churn_model.pkl
# - models/scaler.pkl

# Iniciar servicio
python -m uvicorn main:app --reload --port 8000

# Probar endpoint
curl -s http://localhost:8000/api/v1/health/check | jq

# Debe retornar:
# {
#   "status": "healthy",
#   "model_loaded": true,
#   "database_connected": true,
#   "timestamp": "..."
# }
```
- [ ] Python venv funciona
- [ ] Dependencias instalan sin errores
- [ ] train_model.py ejecuta correctamente
- [ ] Modelo se entrena (pkl generado)
- [ ] FastAPI inicia sin errores
- [ ] Health endpoint responde
- [ ] Swagger en /docs funciona

### Test Docker Local
```bash
# Construir imágenes
docker-compose build

# Debe completar sin errores para ambos servicios

# Iniciar servicios
docker-compose up -d

# Ver estado
docker-compose ps

# Ambos servicios deben estar "Up (healthy)"

# Probar endpoints
curl -s http://localhost:8080/api/v1/companies/health | jq
curl -s http://localhost:8000/api/v1/health/check | jq

# Detener
docker-compose down
```
- [ ] docker-compose build exitosa
- [ ] Ambos servicios inician correctamente
- [ ] Backend accesible en puerto 8080
- [ ] AI Service accesible en puerto 8000
- [ ] Health checks responden OK
- [ ] Logs sin errores críticos

---

## Pre-Deployment a Oracle Cloud

### 1. Credenciales y Wallet
- [ ] Tienes credenciales válidas de Oracle ADB
  - [ ] Username (admin o usuario autorizado)
  - [ ] Password (nueva contraseña para producción)
  - [ ] Service name (de la instancia OCI)
- [ ] Wallet file descargado desde OCI Console
  - [ ] Archivo ZIP descomprimido
  - [ ] Archivos en estructura correcta
- [ ] Wallet protegido (chmod 600 en Linux/Mac)

### 2. Preparación de Imágenes Docker
- [ ] `docker-compose build` exitosa localmente
- [ ] Imágenes creadas sin errores
  - [ ] `churninsight-backend:latest`
  - [ ] `churninsight-ai:latest`
- [ ] Tamaño de imágenes razonable (< 1GB cada una)
- [ ] Sin warnings de seguridad en build

### 3. Instancia OCI Preparada
- [ ] Instancia VM creada y ejecutándose
- [ ] SSH accesible
- [ ] Docker instalado en instancia (`docker --version`)
- [ ] Docker-compose instalado (`docker-compose --version`)
- [ ] Conectividad a Oracle ADB verificada
- [ ] Espacio en disco disponible (mínimo 10GB)

### 4. Repositorio Git Actualizado
- [ ] Todos los archivos pusheados a main
- [ ] `.env` y archivos sensibles NO están en git
- [ ] `.gitignore` correctamente configurado
- [ ] README_PROJECT.md actualizado
- [ ] ORACLE_CLOUD_DEPLOYMENT.md presente

### 5. Archivo .env para Producción
```
# Crear en raíz del proyecto
ORACLE_USER=admin
ORACLE_PASSWORD=<REAL_PASSWORD>
ORACLE_HOST=<YOUR_ADB_HOST>.oraclecloud.com
ORACLE_SERVICE_NAME=<YOUR_SERVICE_NAME>
ORACLE_WALLET_PATH=/app/backend/wallet_pymer
ENVIRONMENT=production
TZ=America/Argentina/Buenos_Aires
```
- [ ] .env tiene todas las variables reales
- [ ] Credenciales verificadas (probadas localmente)
- [ ] Ruta del Wallet correcta
- [ ] Archivo NO está en git

---

## Deployment a Oracle Cloud - Checklist Ejecución

### Fase 1: Setup de Instancia (30 minutos)
```bash
# 1. SSH a instancia
ssh -i your-key.pem ubuntu@your-instance-ip

# 2. Actualizar sistema
sudo apt update && sudo apt upgrade -y

# 3. Instalar dependencias
sudo apt install -y git curl wget

# 4. Verificar Docker
docker --version
docker-compose --version

# 5. Clonar repositorio
git clone https://github.com/YOUR-ORG/ChurnInsight.git
cd ChurnInsight
```
- [ ] SSH conecta exitosamente
- [ ] Sistema actualizado
- [ ] Git clonado
- [ ] Docker verificado

### Fase 2: Configuración (15 minutos)
```bash
# 6. Copiar archivo .env con credenciales reales
# (NO usar la versión .example)
scp .env ubuntu@your-instance:/home/ubuntu/ChurnInsight/

# 7. Verificar archivo
cat .env | grep ORACLE

# 8. Verificar Wallet
ls -la backend/wallet_pymer/
```
- [ ] .env copiado correctamente
- [ ] Credenciales verificadas
- [ ] Wallet archivos presentes

### Fase 3: Build de Imágenes (15-20 minutos)
```bash
# 9. Construir imágenes
docker-compose build

# Seguimiento:
# [+] Building backend ... done
# [+] Building ai ... done
```
- [ ] Build de Backend exitosa
- [ ] Build de AI exitosa
- [ ] Sin errores en logs

### Fase 4: Inicio de Servicios (5 minutos)
```bash
# 10. Iniciar servicios
docker-compose up -d

# 11. Verificar estado
docker-compose ps

# Esperado:
# NAME            STATUS
# backend         Up (healthy)
# ai              Up (healthy)
```
- [ ] Ambos servicios en estado "Up"
- [ ] Ambos pasos "healthy"
- [ ] Sin errores en docker logs

---

## Validación Post-Deployment

### Health Checks
```bash
# Backend
curl -s http://localhost:8080/api/v1/companies/health | jq .

# Esperado: status "UP", database "connected"
curl -s http://localhost:8000/api/v1/health/check | jq .

# Esperado: status "healthy", model_loaded true, database_connected true
```
- [ ] Backend health OK
- [ ] AI health OK
- [ ] Database conectado desde Backend
- [ ] Database conectado desde AI
- [ ] Modelo cargado en AI

### Test de Predicción
```bash
# Obtener empresa de ejemplo
curl -s http://localhost:8080/api/v1/companies | jq '.content[0]'

# Hacer predicción
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": 20123456789,
    "ingresos": 150000,
    "gastos": 100000,
    "margen_operacional": 0.30,
    "deuda": 50000,
    "deuda_bancaria": 20000,
    "tasa_endeudamiento": 0.40,
    "dias_venta_pendiente": 45,
    "dias_pago_promedio": 60,
    "margen_neto": 0.20,
    "actividad_transaccional": 25,
    "edad_empresa": 5,
    "numero_productos": 3
  }' | jq .
```
- [ ] Obtiene datos de empresas correctamente
- [ ] Predicción retorna probability y risk_level
- [ ] Response incluye timestamp
- [ ] Sin errores en logs

### Logs y Monitoreo
```bash
# Ver logs en tiempo real
docker-compose logs -f

# Backend logs
docker logs churninsight-backend | tail -20

# AI logs
docker logs churninsight-ai | tail -20

# Estadísticas de recursos
docker stats
```
- [ ] Logs sin errores críticos
- [ ] CPU < 50%
- [ ] Memoria < 2GB por servicio
- [ ] Conexiones a BD estables

### Prueba de Batch
```bash
curl -X POST http://localhost:8000/api/v1/predictions/batch \
  -H "Content-Type: application/json" \
  -d '{
    "predictions": [
      {"cuit": 20111111111, "ingresos": 100000, ...},
      {"cuit": 20222222222, "ingresos": 200000, ...}
    ]
  }' | jq .
```
- [ ] Batch prediction funciona
- [ ] Retorna múltiples predicciones
- [ ] Estadísticas agregadas correctas

---

## Post-Deployment

### Configuración de Acceso
- [ ] Grupo de seguridad abierto para puerto 8080 (o reverse proxy)
- [ ] Grupo de seguridad abierto para puerto 8000 (o solo tráfico interno)
- [ ] DNS configurado (si aplica)
- [ ] SSL/TLS certificado (si acceso desde internet)

### Backups
- [ ] Estrategia de backup de BD definida
- [ ] Wallet file tiene backup fuera de la instancia
- [ ] Configuración (.env) tiene backup
- [ ] Modelo ML tiene backup

### Monitoreo
- [ ] Logs siendo guardados
- [ ] Alertas configuradas (si aplica)
- [ ] Comando de health check documentado
- [ ] Escalada de problemas definida

### Documentación
- [ ] Runbook de operación actualizado
- [ ] Credenciales guardadas en lugar seguro
- [ ] Acceso SSH documentado
- [ ] Contactos de soporte definidos

---

## Rollback Plan (Si algo falla)

```bash
# 1. Detener servicios sin perder datos
docker-compose stop

# 2. Ver logs para diagnosticar
docker-compose logs

# 3. Verificar connectivity a BD
docker exec churninsight-ai \
  python -c "import oracledb; oracledb.connect(...)"

# 4. Reintentar
docker-compose up -d

# 5. Si no funciona, deshacer cambios
git revert <commit>
docker-compose build
docker-compose up -d
```

### Troubleshooting Rápido

| Problema | Solución |
|----------|----------|
| "Cannot connect to Oracle" | Verificar .env, Wallet, conectividad de red |
| "Port already in use" | Cambiar puertos en docker-compose.yml |
| "Image build fails" | `docker-compose build --no-cache` |
| "Health check failing" | Ver `docker logs <service>` |
| "Out of disk space" | `docker system prune -a` |

---

## Verificación Final

- [ ] ✅ Proyecto compila sin errores
- [ ] ✅ Docker builds sin warnings
- [ ] ✅ Servicios inician correctamente
- [ ] ✅ Health endpoints responden
- [ ] ✅ Predicciones funcionan
- [ ] ✅ Batch predictions funcionan
- [ ] ✅ Logs sin errores críticos
- [ ] ✅ Documentación completa
- [ ] ✅ Credenciales guardadas seguramente
- [ ] ✅ Backups configurados

---

**Si todo está checkeado ✅ = LISTO PARA PRODUCCIÓN**

**Fecha de validación**: ____________
**Realizado por**: ____________
**Aprobación**: ____________

