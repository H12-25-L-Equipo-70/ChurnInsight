# 🐳 GUÍA COMPLETA DE DOCKER - ChurnInsight

**Última actualización**: 21 de Enero, 2025  
**Status**: ✅ PRODUCTION-READY

---

## ⚠️ PRERREQUISITOS

### 1. Instalar Docker Desktop

**Windows/Mac:**
- Descargar: https://www.docker.com/products/docker-desktop
- Instalar y reiniciar computadora
- Verificar: `docker --version`

**Linux:**
```bash
# Ubuntu/Debian
sudo apt-get install docker.io docker-compose

# Verificar
docker --version
docker-compose --version
```

### 2. Iniciar Docker Daemon

**Windows/Mac:**
- Abrir aplicación "Docker Desktop"
- Esperar a que muestre "Docker is running"

**Linux:**
```bash
sudo systemctl start docker
sudo docker run hello-world  # Verificar
```

---

## 🔍 DIAGNOSTICAR PROBLEMA DE CONEXIÓN

### Error: "dockerDesktopLinuxEngine: file not found"

**Solución:**
```powershell
# 1. Verificar si Docker está corriendo
docker info

# 2. Si no funciona, iniciar Docker Desktop
# Windows: Abrir la aplicación "Docker Desktop"

# 3. Esperar a que aparezca ✓ "Docker is running"

# 4. Verificar nuevamente
docker ps

# 5. Si aún no funciona, reiniciar:
docker restart
```

**Alternativa - Reiniciar completamente:**
```powershell
# Cerrar Docker Desktop (panel de control)
# Esperar 5 segundos
# Abrir Docker Desktop nuevamente
# Esperar a que muestre "Docker is running" (puede tardar 30 segundos)
```

---

## 🚀 CONSTRUIR IMÁGENES

### Opción 1: Construir Individual (desarrollo)

**AI Service:**
```bash
cd ai_service

# Build
docker build -t churninsight-ai:1.0.0 .

# Verificar
docker images | grep churninsight-ai

# Salida esperada:
# churninsight-ai  1.0.0  abc123def456  500MB
```

**Backend:**
```bash
cd backend

# Build
docker build -t churninsight-backend:1.0.0 .

# Verificar
docker images | grep churninsight-backend

# Salida esperada:
# churninsight-backend  1.0.0  xyz789abc123  800MB
```

### Opción 2: Construir Ambas (docker-compose)

```bash
# Desde raíz del proyecto
docker-compose build

# Salida esperada:
# Building churninsight-ai
# Building churninsight-backend
```

---

## ▶️ EJECUTAR CONTENEDORES

### Opción 1: Ejecutar Individualmente

**AI Service:**
```bash
docker run -d \
  --name churninsight-ai \
  -p 8000:8000 \
  -e ENVIRONMENT=docker \
  -e DEBUG=false \
  -v $(pwd)/ai_service/models:/app/models \
  -v $(pwd)/ai_service/logs:/app/logs \
  churninsight-ai:1.0.0

# Verificar
docker ps | grep churninsight-ai
```

**Backend:**
```bash
docker run -d \
  --name churninsight-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  -v $(pwd)/backend/wallet_pymer:/app/wallet_pymer:ro \
  churninsight-backend:1.0.0

# Verificar
docker ps | grep churninsight-backend
```

### Opción 2: Ejecutar Ambas (docker-compose)

**Start:**
```bash
# Desde raíz del proyecto
docker-compose up -d

# Verificar
docker-compose ps

# Salida esperada:
# NAME                 STATUS
# churninsight-ai      Up 2 seconds
# churninsight-backend Up 2 seconds
```

**Stop:**
```bash
docker-compose down
```

**Ver Logs:**
```bash
# Todos
docker-compose logs -f

# Solo AI Service
docker-compose logs -f churninsight-ai

# Solo Backend
docker-compose logs -f churninsight-backend
```

---

## 🧪 TESTING CON DOCKER

### 1. Verificar que servicios están corriendo

```bash
docker ps
```

**Salida esperada:**
```
CONTAINER ID  IMAGE                           STATUS
abc123        churninsight-ai:1.0.0           Up 10 seconds
def456        churninsight-backend:1.0.0      Up 10 seconds
```

### 2. Test AI Service

```bash
# Health check
curl http://localhost:8000/api/v1/health/check

# Predicción
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d '{
    "CUIT": "20748123114",
    "NOMBRE_EMPRESA": "Test",
    "PERIODO_FISCAL": "2024-Q4",
    "EMPLEADOS": 10,
    "INGRESOS": 1000000,
    "GASTOS": 800000,
    "DEUDA": 200000,
    "ACTIVOS": 1500000,
    "PRESTAMOS_SOLICITADOS": 1,
    "PRESTAMOS_APROBADOS": 1,
    "MONTO_SOLICITADO": 100000,
    "MONTO_APROBADO": 100000,
    "TICKET_PROMEDIO_SOLICITADO": 100000,
    "TICKET_PROMEDIO_APROBADO": 100000,
    "PRESTAMOS_CANCELADOS": 0,
    "PRESTAMOS_VIGENTES": 1,
    "TIEMPO_CANCELACION_PRESTAMO": 0,
    "SERVICIOS_UTILIZADOS": 3,
    "TRANSFERENCIAS": 10,
    "PAGOS": 5,
    "CREDITOS": 2,
    "INVERSIONES": 0,
    "TRIMESTRE_DIAS_ACTIVIDAD": 80,
    "TRIMESTRE_DIAS_INACTIVIDAD": 10,
    "PROMEDIO_LOGIN_DIA": 5,
    "TOTAL_LOGIN_DIA": 400
  }'
```

### 3. Test Backend

```bash
# Health check
curl http://localhost:8080/api/v1/companies/health

# Obtener sectores (mock)
curl http://localhost:8080/api/v1/companies/segments/sectors
```

### 4. Test Documentación

**Swagger (AI Service):**
- Abrir: http://localhost:8000/api/v1/docs
- Verificar que endpoints están listados
- Try it out con algún endpoint

**Swagger (Backend):**
- Abrir: http://localhost:8080/swagger-ui.html
- Verificar estructura

---

## 📊 GESTIONAR CONTENEDORES

### Ver Logs Detallados

```bash
# Logs de AI Service
docker logs churninsight-ai

# Logs de Backend
docker logs churninsight-backend

# Logs en tiempo real (últimas 50 líneas)
docker logs -f --tail 50 churninsight-ai
```

### Ejecutar Comandos en Contenedor

```bash
# Entrar al contenedor AI Service
docker exec -it churninsight-ai bash

# Dentro del contenedor:
ps aux          # Ver procesos
ls -la /app     # Ver archivos
exit            # Salir
```

### Monitorear Recursos

```bash
# Ver uso de CPU y memoria
docker stats

# Salida:
# CONTAINER ID  CPU %  MEM USAGE
# abc123        2.5%   250MB
# def456        5.0%   350MB
```

### Detener y Reiniciar

```bash
# Detener específico
docker stop churninsight-ai
docker stop churninsight-backend

# Reiniciar específico
docker restart churninsight-ai
docker restart churninsight-backend

# Detener y remover todos
docker-compose down
docker-compose rm
```

---

## 🗑️ LIMPIAR RECURSOS

### Remover Contenedores

```bash
# Remover específico
docker rm churninsight-ai
docker rm churninsight-backend

# Remover todos (si están stopped)
docker container prune

# Verificar
docker ps -a  # No debe haber ChurnInsight containers
```

### Remover Imágenes

```bash
# Remover específica
docker rmi churninsight-ai:1.0.0
docker rmi churninsight-backend:1.0.0

# Remover no usadas
docker image prune

# Listar todas
docker images
```

### Limpieza Completa

```bash
# Remover todo (containers, networks, volúmenes)
docker-compose down -v

# O manual:
docker stop $(docker ps -q)              # Detener todos
docker rm $(docker ps -aq)               # Remover todos
docker rmi churninsight-*                # Remover imágenes
```

---

## 🔧 TROUBLESHOOTING DOCKER

### Problema: Puerto ya en uso

**AI Service en puerto 8000:**
```bash
# Encontrar proceso
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Opción 1: Matar proceso
kill -9 <PID>

# Opción 2: Usar puerto diferente
docker run -p 8001:8000 churninsight-ai:1.0.0
```

### Problema: Contenedor sale inmediatamente

```bash
# Ver logs
docker logs churninsight-ai

# Soluciones comunes:
# 1. Revisar archivo de configuración
# 2. Verificar rutas de volúmenes
# 3. Verificar variables de entorno
```

### Problema: Sin conexión a red

```bash
# Verificar networks
docker network ls

# Ver containers en network
docker network inspect churninsight-network

# Opción: Conectar manualmente
docker network connect churninsight-network churninsight-ai
```

### Problema: Falta archivo o directorio

```bash
# Verificar volúmenes
docker volume ls

# Inspeccionar
docker volume inspect <volume_name>

# Solución: Crear directorio antes de correr
mkdir -p ./ai_service/logs ./ai_service/models
```

---

## 🌐 NETWORKING CON DOCKER

### Comunicación entre Contenedores

```bash
# Dentro de docker-compose, usan nombres de servicio:
# AI Service: http://churninsight-ai:8000
# Backend: http://churninsight-backend:8080

# Ejemplo en código del backend:
# HttpClient.get("http://churninsight-ai:8000/api/v1/predictions/predict_churn")
```

### Exponer a Red Local

```bash
# Para acceder desde otra máquina (127.0.0.1 -> 0.0.0.0):
docker run -p 0.0.0.0:8000:8000 churninsight-ai:1.0.0

# Acceder desde otra máquina:
curl http://<tu-ip>:8000/api/v1/health/check
```

---

## 📈 PRODUCCIÓN

### Optimizaciones Recomendadas

**1. Limitar recursos:**
```bash
docker run \
  --memory="512m" \
  --cpus="1" \
  churninsight-ai:1.0.0
```

**2. Restart policy:**
```bash
docker run \
  --restart always \
  churninsight-ai:1.0.0
```

**3. Logging:**
```bash
docker run \
  --log-driver json-file \
  --log-opt max-size=10m \
  --log-opt max-file=3 \
  churninsight-ai:1.0.0
```

### Docker Compose Producción

```yaml
# production.yml
version: '3.9'

services:
  churninsight-ai:
    image: churninsight-ai:1.0.0
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
        reservations:
          cpus: '0.5'
          memory: 256M
    logging:
      driver: "json-file"
      options:
        max-size: "10m"
        max-file: "3"
    environment:
      ENVIRONMENT: production
      DEBUG: "false"

  churninsight-backend:
    image: churninsight-backend:1.0.0
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1024M
```

**Correr:**
```bash
docker-compose -f docker-compose.yml -f production.yml up -d
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

```
PRE-BUILD:
✅ Docker Desktop está instalado y corriendo
✅ docker --version funciona
✅ docker ps funciona

BUILD:
✅ Dockerfile está en backend/
✅ Dockerfile está en ai_service/
✅ docker build no produce errores

RUN:
✅ docker-compose up -d funciona
✅ docker ps muestra 2 contenedores
✅ Logs no muestran errores (docker logs)

TEST:
✅ Health check AI Service: http://localhost:8000/api/v1/health/check
✅ Health check Backend: http://localhost:8080/api/v1/companies/health
✅ Predicción funciona: POST /api/v1/predictions/predict_churn
✅ Swagger accesible: http://localhost:8000/api/v1/docs

CLEANUP:
✅ docker-compose down detiene servicios
✅ Puertos 8000 y 8080 se liberan
✅ Sin contenedores corriendo (docker ps vacío)
```

---

## 📞 COMANDOS RÁPIDOS

```bash
# Build y Run
docker-compose build && docker-compose up -d

# Ver estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Test
curl http://localhost:8000/api/v1/health/check
curl http://localhost:8080/api/v1/companies/health

# Stop
docker-compose down

# Ver todo (containers, images, networks, volumes)
docker system df

# Limpiar todo (CUIDADO)
docker system prune -a
```

---

**Versión**: 1.0.0  
**Status**: ✅ PRODUCTION-READY  
**Última actualización**: 21 Enero 2025
