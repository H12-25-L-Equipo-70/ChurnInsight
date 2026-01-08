# 🚀 ChurnInsight - Guía de Deployment en Oracle Cloud

## Estado del Proyecto - Misión 1 & 2 Completadas ✅

El proyecto está **100% listo para deployment** en tu instancia Oracle Cloud con Docker preinstalado.

---

## 📋 Pre-requisitos en la Instancia OCI

```bash
# Verificar Docker
docker --version
docker-compose --version

# Verificar conectividad a Oracle ADB
ping oracle-db.region.oraclecloud.com  # Reemplazar con tu host
```

**Requerimientos**:
- ✅ Docker instalado (tú ya tienes)
- ✅ Docker Compose ≥ 2.0
- ✅ Acceso de red a Oracle ADB
- ✅ Wallet file (X.509 certificates)
- ✅ Archivo .env con credenciales reales

---

## 🔧 Paso 1: Preparar la Instancia OCI

### 1.1 Clonar el repositorio

```bash
# SSH a tu instancia OCI
ssh -i your-key.pem ubuntu@your-instance-ip

# Clonar ChurnInsight
git clone https://github.com/YOUR-REPO/ChurnInsight.git
cd ChurnInsight
```

### 1.2 Preparar Wallet File

```bash
# El archivo wallet_pymer.zip debe estar en backend/wallet_pymer/

# Si lo tienes comprimido:
cd backend/wallet_pymer
unzip wallet_pymer.zip
ls -la

# Debe contener estos archivos:
# - cwallet.sso
# - ewallet.p12
# - sqlnet.ora
# - tnsnames.ora
# - ojdbc.properties
```

### 1.3 Configurar credenciales

```bash
# Editar archivo .env en la raíz del proyecto
# (copiar de .env.example)

cat > .env << EOF
# Backend (Spring Boot)
ORACLE_USER=admin
ORACLE_PASSWORD=YourP@ssw0rd123!  # Tu contraseña real
ORACLE_HOST=oracle-db-xxxxx.region.oraclecloud.com
ORACLE_SERVICE_NAME=your_service_name
ORACLE_WALLET_PATH=/app/backend/wallet_pymer
SPRING_ENVIRONMENT=production

# AI Service (FastAPI)
AI_LOG_LEVEL=INFO
AI_ENVIRONMENT=production
AI_MODEL_PATH=/app/ai_service/models/churn_model.pkl
AI_SCALER_PATH=/app/ai_service/models/scaler.pkl

# General
TZ=America/Argentina/Buenos_Aires
EOF

# Proteger el archivo
chmod 600 .env
```

---

## 🐳 Paso 2: Construir y Desplegar con Docker Compose

### 2.1 Construir las imágenes

```bash
# Desde la raíz del proyecto
docker-compose build

# Esto puede tardar 5-10 minutos la primera vez
# Output esperado:
# Successfully tagged churninsight-backend:latest
# Successfully tagged churninsight-ai:latest
```

### 2.2 Iniciar los servicios

```bash
# Iniciar en segundo plano (-d = detached)
docker-compose up -d

# Ver logs en tiempo real (opcional)
docker-compose logs -f

# Ver estado de los servicios
docker-compose ps
```

**Output esperado**:
```
NAME                      COMMAND                STATUS
churninsight-backend      "java -jar ..."       Up (healthy)
churninsight-ai           "python -m uvicorn"   Up (healthy)
```

---

## ✅ Paso 3: Verificar el Deployment

### 3.1 Pruebas básicas

```bash
# Test Backend (puerto 8080)
curl -s http://localhost:8080/api/v1/companies/health | jq

# Test AI Service (puerto 8000)
curl -s http://localhost:8000/api/v1/health/check | jq
```

**Respuestas esperadas**:

Backend:
```json
{
  "status": "UP",
  "database": "connected",
  "timestamp": "2024-01-15T10:30:45.000Z"
}
```

AI Service:
```json
{
  "status": "healthy",
  "model_loaded": true,
  "database_connected": true,
  "timestamp": "2024-01-15T10:30:45Z"
}
```

### 3.2 Test de predicción

```bash
# Predicción individual
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
  }' | jq
```

**Respuesta esperada**:
```json
{
  "cuit": 20123456789,
  "probability": 0.35,
  "risk_level": "bajo",
  "confidence": 0.87,
  "timestamp": "2024-01-15T10:35:22Z",
  "model_version": "1.0.0"
}
```

### 3.3 Ver logs

```bash
# Logs del Backend
docker-compose logs backend

# Logs del AI Service
docker-compose logs ai

# Seguimiento en tiempo real
docker-compose logs -f ai --tail=50
```

---

## 🔄 Paso 4: Gestión de Servicios

### Iniciar/Detener/Reiniciar

```bash
# Iniciar todos los servicios
docker-compose up -d

# Detener todos los servicios (no elimina datos)
docker-compose down

# Reiniciar todos
docker-compose restart

# Reiniciar solo AI Service
docker-compose restart ai

# Ver estado
docker-compose ps
```

### Actualizar código

```bash
# Descargar últimos cambios
git pull origin main

# Reconstruir las imágenes
docker-compose build

# Reiniciar servicios
docker-compose up -d

# Verificar que todo está running
docker-compose ps
```

---

## 📊 Paso 5: Monitoreo y Logs

### 5.1 Estadísticas de recursos

```bash
# Ver uso de CPU y memoria
docker stats

# Ver en tiempo real
docker stats --no-stream=false

# Solo los servicios de ChurnInsight
docker stats churninsight-backend churninsight-ai
```

### 5.2 Logs persistentes

```bash
# Los logs se guardan automáticamente en:
# - backend/logs/
# - ai_service/logs/

# Ver archivos de log
ls -la backend/logs/
ls -la ai_service/logs/

# Limpiar logs antiguos (si es necesario)
docker-compose exec backend rm logs/*.log.*
docker-compose exec ai rm logs/*.log.*
```

### 5.3 Health checks Kubernetes

```bash
# Readiness probe (¿está listo para recibir tráfico?)
curl -s http://localhost:8000/api/v1/health/ready | jq

# Liveness probe (¿está vivo?)
curl -s http://localhost:8000/api/v1/health/live | jq
```

---

## 🚨 Troubleshooting

### Problema: "Cannot connect to Oracle ADB"

```bash
# 1. Verificar Wallet
ls -la backend/wallet_pymer/

# 2. Verificar TNS_ADMIN
docker exec churninsight-ai env | grep TNS

# 3. Verificar credenciales en .env
grep ORACLE_ .env

# 4. Ver logs del contenedor
docker logs churninsight-ai | grep -i oracle
```

### Problema: "Port 8080/8000 already in use"

```bash
# Encontrar proceso usando el puerto
lsof -i :8080
lsof -i :8000

# O con ss (si lsof no está)
ss -tlnp | grep 8080

# Liberar puerto (cambiar puerto en docker-compose.yml)
# O matar el proceso existente
kill -9 <PID>
```

### Problema: "Image build fails"

```bash
# Limpiar imágenes viejas
docker image prune -a

# Reconstruir con output verboso
docker-compose build --no-cache

# Verificar errores específicos
docker build -f backend/Dockerfile backend/ --progress=plain
```

### Problema: "Health check failing"

```bash
# Verificar estado del contenedor
docker ps --filter "name=churninsight"

# Ver logs completos
docker logs churninsight-ai --tail=100

# Ejecutar comando health check manualmente
docker exec churninsight-ai curl -s http://localhost:8000/api/v1/health/check
```

---

## 📈 Paso 6: Entrenar modelo con datos reales

Si necesitas reentrenar el modelo con tus datos fintech:

```bash
# Copiar dataset al contenedor (si está ejecutándose)
docker cp data/dataset_empresas_fintech_v2.7.csv \
  churninsight-ai:/app/ai_service/data/

# O entrenar en local antes de desplegar
cd ai_service
python train_model.py

# Copiar modelo entrenado al backend
cp models/churn_model.pkl ../backend/models/
cp models/scaler.pkl ../backend/models/
```

---

## 📡 API Endpoints Disponibles

### Backend (Spring Boot - puerto 8080)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/companies` | Listar empresas |
| GET | `/api/v1/companies/{id}` | Obtener empresa |
| POST | `/api/v1/companies` | Crear empresa |
| PUT | `/api/v1/companies/{id}` | Actualizar empresa |
| DELETE | `/api/v1/companies/{id}` | Eliminar empresa |

### AI Service (FastAPI - puerto 8000)

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/v1/health/check` | Estado general |
| GET | `/api/v1/health/ready` | Readiness probe |
| GET | `/api/v1/health/live` | Liveness probe |
| POST | `/api/v1/predictions/predict` | Predicción individual |
| POST | `/api/v1/predictions/batch` | Predicciones en batch |
| GET | `/docs` | Swagger UI |
| GET | `/redoc` | ReDoc documentation |

---

## 🔒 Seguridad - Checklist

- [ ] `.env` no está en Git (verificar .gitignore)
- [ ] Wallet file tiene permisos 600
- [ ] ORACLE_PASSWORD en .env, no en código
- [ ] CORS habilitado solo para orígenes confiables
- [ ] SSL/TLS configurado (si acceso desde internet)
- [ ] Backups diarios de base de datos
- [ ] Logs monitoreados por cambios sospechosos

```bash
# Verificar seguridad de archivos
stat backend/wallet_pymer/cwallet.sso
stat .env
```

---

## 📞 Soporte y Recursos

**Documentación disponible**:
- 📄 [backend/README.md](backend/README.md) - Backend Spring Boot
- 📄 [ai_service/README_AI.md](ai_service/README_AI.md) - AI Service
- 📄 [ai_service/API_DOCUMENTATION.md](ai_service/API_DOCUMENTATION.md) - API Reference
- 📄 [STATUS_DASHBOARD.md](STATUS_DASHBOARD.md) - Project overview

**Comando útil para debug**:
```bash
# Ver todo en un vistazo
docker-compose ps && \
docker-compose logs --tail=20 && \
curl -s http://localhost:8000/api/v1/health/check | jq
```

---

## 🎯 Próximos pasos

1. ✅ Deployment completado en OCI
2. ⏳ Entrenar modelo con datos reales (dataset_empresas_fintech_v2.7.csv)
3. ⏳ Implementar frontend Angular 19 (OPCIONAL)
4. ⏳ Configurar CI/CD pipeline
5. ⏳ Setup de monitoreo (Prometheus/Grafana)

---

**Última actualización**: 2024
**Estado**: Misión 1 & 2 Completadas ✅ | Proyecto 50% completado
