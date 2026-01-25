# 🧪 GUÍA COMPLETA DE TESTING LOCAL - ChurnInsight

**Última actualización**: 21 de Enero, 2025  
**Versión del sistema**: 1.0.0 (Integración new_notebook.md)

---

## 📋 Requisitos Previos

### Hardware Recomendado:
- CPU: 4+ cores
- RAM: 8GB mínimo (16GB recomendado)
- Disco: 10GB libres

### Software Requerido:
```bash
# Windows / Mac / Linux
Java 17+           # Para Spring Boot
Python 3.11+       # Para FastAPI
Maven 3.8+         # Build tool Java
Git                # Control de versiones
Docker (opcional)  # Para testing de producción
```

### Verificar Instalaciones:
```bash
java -version
python --version
mvn -version
git --version
```

---

## 🚀 INICIO RÁPIDO (5 minutos)

### Opción A: Sin Oracle (Modo Development)

**Terminal 1 - AI Service:**
```bash
cd ai_service

# Setup
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Copiar env
cp .env.example .env

# Entrenar modelo con datos dummy
python train_model.py

# Ejecutar
python -m uvicorn main:app --reload --port 8000
```

**Terminal 2 - Backend (opcional):**
```bash
cd backend

# Saltamos Oracle por ahora
mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 3 - Probar:**
```bash
# Health check
curl http://localhost:8000/api/v1/health/check

# Predicción
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d '{
    "CUIT": "20748123114",
    "NOMBRE_EMPRESA": "TechStart SRL",
    "PERIODO_FISCAL": "2024-Q4",
    "EMPLEADOS": 15,
    "INGRESOS": 1500000,
    "GASTOS": 1000000,
    "DEUDA": 500000,
    "ACTIVOS": 2000000,
    "PRESTAMOS_SOLICITADOS": 3,
    "PRESTAMOS_APROBADOS": 2,
    "MONTO_SOLICITADO": 300000,
    "MONTO_APROBADO": 200000,
    "TICKET_PROMEDIO_SOLICITADO": 100000,
    "TICKET_PROMEDIO_APROBADO": 100000,
    "PRESTAMOS_CANCELADOS": 1,
    "PRESTAMOS_VIGENTES": 1,
    "TIEMPO_CANCELACION_PRESTAMO": 45,
    "SERVICIOS_UTILIZADOS": 5,
    "TRANSFERENCIAS": 45,
    "PAGOS": 30,
    "CREDITOS": 15,
    "INVERSIONES": 5,
    "TRIMESTRE_DIAS_ACTIVIDAD": 85,
    "TRIMESTRE_DIAS_INACTIVIDAD": 5,
    "PROMEDIO_LOGIN_DIA": 3.5,
    "TOTAL_LOGIN_DIA": 255
  }'
```

---

## 📊 TESTING DETALLADO - AI SERVICE

### 1. Verificar Instalación

```bash
cd ai_service

# Verificar Python
python --version  # Debe ser 3.11+

# Verificar virtual env
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Verificar dependencias
pip list | grep -E "fastapi|pydantic|scikit-learn|pandas"
```

### 2. Preparar Configuración

```bash
# Copiar .env
cp .env.example .env

# Editar .env (abrir en editor)
# Cambiar solo si es necesario, defaults funcionan en desarrollo:
# ENVIRONMENT=development
# MODEL_PATH=./models/churn_model.pkl
# SCALER_PATH=./models/scaler.pkl
```

### 3. Entrenar Modelo

```bash
# Con datos reales (si existe dataset_empresas_fintech_v2.7.csv)
python train_model.py

# Salida esperada:
# ✅ Modelo guardado: ./models/churn_model.pkl
# ✅ Scaler guardado: ./models/scaler.pkl
```

### 4. Iniciar Servidor

```bash
# Modo development (con auto-reload)
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Salida esperada:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

### 5. Documentación Interactiva

Abrir en navegador:
- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

---

## 🧬 TEST CASES - AI Service

### TEST 1: Health Check

```bash
curl -X GET http://localhost:8000/api/v1/health/check

# Respuesta esperada (200 OK):
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "model_loaded": true,
  "database_connected": null,
  "timestamp": "2024-01-21T15:30:00.123456Z"
}
```

### TEST 2: Model Info

```bash
curl -X GET http://localhost:8000/api/v1/health/model-info

# Respuesta esperada:
{
  "model_type": "RandomForestClassifier",
  "model_path": "./models/churn_model.pkl",
  "threshold": 0.5,
  "features_count": 11,
  "features": ["INGRESOS", "GASTOS", "DEUDA", "ACTIVOS", ...],
  "version": "1.0.0",
  "status": "loaded"
}
```

### TEST 3: Predicción Individual - Caso BAJO RIESGO

```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d '{
    "CUIT": "20748123114",
    "NOMBRE_EMPRESA": "Empresa Saludable",
    "PERIODO_FISCAL": "2024-Q4",
    "EMPLEADOS": 25,
    "INGRESOS": 5000000,
    "GASTOS": 3000000,
    "DEUDA": 500000,
    "ACTIVOS": 3000000,
    "PRESTAMOS_SOLICITADOS": 5,
    "PRESTAMOS_APROBADOS": 5,
    "MONTO_SOLICITADO": 500000,
    "MONTO_APROBADO": 500000,
    "TICKET_PROMEDIO_SOLICITADO": 100000,
    "TICKET_PROMEDIO_APROBADO": 100000,
    "PRESTAMOS_CANCELADOS": 3,
    "PRESTAMOS_VIGENTES": 2,
    "TIEMPO_CANCELACION_PRESTAMO": 60,
    "SERVICIOS_UTILIZADOS": 8,
    "TRANSFERENCIAS": 120,
    "PAGOS": 100,
    "CREDITOS": 50,
    "INVERSIONES": 20,
    "TRIMESTRE_DIAS_ACTIVIDAD": 90,
    "TRIMESTRE_DIAS_INACTIVIDAD": 0,
    "PROMEDIO_LOGIN_DIA": 15,
    "TOTAL_LOGIN_DIA": 1350
  }'

# Respuesta esperada (200 OK):
{
  "CUIT": "20748123114",
  "NOMBRE_EMPRESA": "Empresa Saludable",
  "PERIODO_FISCAL": "2024-Q4",
  "churn_probability": 0.0850,
  "churn_prediction": 0,
  "threshold_used": 0.500,
  "red_flags": [],
  "confidence": 0.95,
  "timestamp": "2024-01-21T15:35:00Z"
}

# Validación:
# - churn_prediction = 0 (no churn)
# - red_flags = [] (vacío, sin alertas)
# - churn_probability < threshold
```

### TEST 4: Predicción Individual - Caso ALTO RIESGO

```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d '{
    "CUIT": "20111222333",
    "NOMBRE_EMPRESA": "Empresa en Riesgo",
    "PERIODO_FISCAL": "2024-Q4",
    "EMPLEADOS": 1,
    "INGRESOS": 100000,
    "GASTOS": 150000,
    "DEUDA": 2000000,
    "ACTIVOS": 500000,
    "PRESTAMOS_SOLICITADOS": 10,
    "PRESTAMOS_APROBADOS": 2,
    "MONTO_SOLICITADO": 500000,
    "MONTO_APROBADO": 100000,
    "TICKET_PROMEDIO_SOLICITADO": 50000,
    "TICKET_PROMEDIO_APROBADO": 50000,
    "PRESTAMOS_CANCELADOS": 0,
    "PRESTAMOS_VIGENTES": 5,
    "TIEMPO_CANCELACION_PRESTAMO": 0,
    "SERVICIOS_UTILIZADOS": 1,
    "TRANSFERENCIAS": 2,
    "PAGOS": 1,
    "CREDITOS": 0,
    "INVERSIONES": 0,
    "TRIMESTRE_DIAS_ACTIVIDAD": 5,
    "TRIMESTRE_DIAS_INACTIVIDAD": 85,
    "PROMEDIO_LOGIN_DIA": 0.5,
    "TOTAL_LOGIN_DIA": 15
  }'

# Respuesta esperada (200 OK):
{
  "CUIT": "20111222333",
  "NOMBRE_EMPRESA": "Empresa en Riesgo",
  "PERIODO_FISCAL": "2024-Q4",
  "churn_probability": 0.8320,
  "churn_prediction": 1,
  "threshold_used": 0.500,
  "red_flags": [
    "Alta inactividad en la app",
    "Caída significativa en logins diarios",
    "Abandono de funcionalidades: pocos servicios usados",
    "Baja aprobación de préstamos",
    "Margen negativo persistente",
    "Alto ratio de endeudamiento (>70%)",
    "Solicitudes de crédito sin aprobación",
    "Múltiples préstamos vigentes sin historial de pago"
  ],
  "confidence": 0.95,
  "timestamp": "2024-01-21T15:40:00Z"
}

# Validación:
# - churn_prediction = 1 (churn)
# - red_flags = [8 alertas]
# - churn_probability >= threshold
```

### TEST 5: Predicción Batch

```bash
curl -X POST http://localhost:8000/api/v1/predictions/batch_predict_churn \
  -H "Content-Type: application/json" \
  -d '{
    "companies": [
      {
        "CUIT": "20748123114",
        "NOMBRE_EMPRESA": "Empresa 1",
        "PERIODO_FISCAL": "2024-Q4",
        "EMPLEADOS": 20,
        "INGRESOS": 2000000,
        "GASTOS": 1500000,
        "DEUDA": 400000,
        "ACTIVOS": 2500000,
        "PRESTAMOS_SOLICITADOS": 2,
        "PRESTAMOS_APROBADOS": 2,
        "MONTO_SOLICITADO": 200000,
        "MONTO_APROBADO": 200000,
        "TICKET_PROMEDIO_SOLICITADO": 100000,
        "TICKET_PROMEDIO_APROBADO": 100000,
        "PRESTAMOS_CANCELADOS": 1,
        "PRESTAMOS_VIGENTES": 1,
        "TIEMPO_CANCELACION_PRESTAMO": 45,
        "SERVICIOS_UTILIZADOS": 6,
        "TRANSFERENCIAS": 50,
        "PAGOS": 35,
        "CREDITOS": 20,
        "INVERSIONES": 5,
        "TRIMESTRE_DIAS_ACTIVIDAD": 88,
        "TRIMESTRE_DIAS_INACTIVIDAD": 2,
        "PROMEDIO_LOGIN_DIA": 8,
        "TOTAL_LOGIN_DIA": 720
      },
      {
        "CUIT": "20222333444",
        "NOMBRE_EMPRESA": "Empresa 2",
        "PERIODO_FISCAL": "2024-Q4",
        "EMPLEADOS": 3,
        "INGRESOS": 300000,
        "GASTOS": 250000,
        "DEUDA": 600000,
        "ACTIVOS": 800000,
        "PRESTAMOS_SOLICITADOS": 4,
        "PRESTAMOS_APROBADOS": 1,
        "MONTO_SOLICITADO": 300000,
        "MONTO_APROBADO": 50000,
        "TICKET_PROMEDIO_SOLICITADO": 75000,
        "TICKET_PROMEDIO_APROBADO": 50000,
        "PRESTAMOS_CANCELADOS": 0,
        "PRESTAMOS_VIGENTES": 2,
        "TIEMPO_CANCELACION_PRESTAMO": 0,
        "SERVICIOS_UTILIZADOS": 2,
        "TRANSFERENCIAS": 15,
        "PAGOS": 10,
        "CREDITOS": 3,
        "INVERSIONES": 0,
        "TRIMESTRE_DIAS_ACTIVIDAD": 30,
        "TRIMESTRE_DIAS_INACTIVIDAD": 60,
        "PROMEDIO_LOGIN_DIA": 2,
        "TOTAL_LOGIN_DIA": 60
      }
    ]
  }'

# Respuesta esperada (200 OK):
{
  "total_processed": 2,
  "total_errors": 0,
  "distribution": {
    "alto_riesgo": 0,
    "medio_riesgo": 1,
    "bajo_riesgo": 1
  },
  "predictions": [
    {
      "CUIT": "20748123114",
      "churn_probability": 0.2100,
      "churn_prediction": 0,
      "red_flags": [],
      "timestamp": "2024-01-21T15:45:00Z"
    },
    {
      "CUIT": "20222333444",
      "churn_probability": 0.6200,
      "churn_prediction": 1,
      "red_flags": [5 items],
      "timestamp": "2024-01-21T15:45:01Z"
    }
  ],
  "errors": null,
  "timestamp": "2024-01-21T15:45:02Z"
}
```

### TEST 6: Compatibilidad Legacy (/predict)

```bash
# Antiguo endpoint aún funciona (deprecado)
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "20748123114",
    "ingresos": 1500000,
    "gastos": 1000000,
    "margen_operativo": 33.33,
    "deuda_total": 500000,
    "activos_totales": 2000000,
    "prestamos_solicitados": 3,
    "prestamos_aprobados": 2,
    "trimestre_dias_actividad": 85,
    "trimestre_logins_promedio": 12.5,
    "transferencias_trimestre": 45,
    "pagos_trimestre": 30,
    "creditos_trimestre": 15
  }'

# Respuesta (compatible con versión anterior):
{
  "cuit": "20748123114",
  "probability": 0.2300,
  "risk_level": "bajo",
  "timestamp": "2024-01-21T15:50:00Z",
  "deprecated": "Use /predict_churn endpoint"
}
```

---

## 🏗️ TESTING BACKEND - Spring Boot

### 1. Preparar Backend

```bash
cd backend

# Copiar .env
cp .env.example .env

# Editar .env
# En desarrollo, saltamos Oracle y usamos H2:
# SPRING_DATASOURCE_URL=jdbc:h2:mem:testdb
# SPRING_DATASOURCE_DRIVER_CLASS_NAME=org.h2.Driver
```

### 2. Build & Run

```bash
# Compilar
mvn clean install

# Ejecutar en modo dev
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Salida esperada:
# o.s.b.w.e.t.TomcatWebServer: Tomcat started on port(s): 8080
```

### 3. Test Endpoints Backend

```bash
# Health
curl http://localhost:8080/api/v1/companies/health

# Obtener empresa (mock)
curl http://localhost:8080/api/v1/companies/20748123114

# Listar sectores
curl http://localhost:8080/api/v1/companies/segments/sectors
```

---

## 🔄 TESTING INTEGRACIÓN (AI + Backend)

### Flujo Completo:

**Terminal 1: AI Service**
```bash
cd ai_service
python -m uvicorn main:app --port 8000
```

**Terminal 2: Backend**
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

**Terminal 3: Test Integration**
```bash
# 1. Backend obtiene datos de empresa
curl http://localhost:8080/api/v1/companies/20748123114

# 2. Backend construye request al AI Service
# (Ver código de integración en docs/07_Integration_NewNotebook.md)

# 3. Verificar logs en ambas terminales para rastrear flujo
```

## 🐳 TESTING CON DOCKER

### ⚠️ REQUISITOS PREVIOS
- Docker Desktop instalado (Windows/Mac): https://www.docker.com/products/docker-desktop
- Docker iniciado y corriendo ✅
- Verificar: `docker --version` y `docker ps`

### PROBLEMA COMÚN: "dockerDesktopLinuxEngine file not found"

**Solución:**
```powershell
# 1. Verificar que Docker Desktop está corriendo
docker info

# 2. Si NO funciona, abrir Docker Desktop:
# Windows: Buscar y abrir aplicación "Docker Desktop"
# Esperar a que muestre ✓ "Docker is running"

# 3. Esperar ~30 segundos
# 4. Volver a intentar:
docker ps
```

### BUILD: Construir Imágenes Docker

**Opción 1: Construir Ambas (Recomendado)**
```bash
# Desde raíz del proyecto
cd c:\Repositorios\ChurnInsight

docker-compose build

# Salida esperada:
# Building churninsight-ai
# Building churninsight-backend
# Successfully built ...
```

**Opción 2: Construir Individual**

AI Service:
```bash
cd ai_service
docker build -t churninsight-ai:1.0.0 .
docker images | grep churninsight-ai  # Verificar
```

Backend:
```bash
cd backend
docker build -t churninsight-backend:1.0.0 .
docker images | grep churninsight-backend  # Verificar
```

### RUN: Ejecutar Contenedores

**Opción 1: Ejecutar Ambas (Recomendado)**
```bash
# Desde raíz del proyecto
docker-compose up -d

# Verificar que están corriendo
docker-compose ps

# Salida esperada:
# NAME                 STATUS
# churninsight-ai      Up 5 seconds
# churninsight-backend Up 5 seconds
```

**Opción 2: Ejecutar Individual**

AI Service:
```bash
docker run -d \
  --name churninsight-ai \
  -p 8000:8000 \
  -e ENVIRONMENT=docker \
  -v $(pwd)/ai_service/logs:/app/logs \
  -v $(pwd)/ai_service/models:/app/models \
  churninsight-ai:1.0.0
```

Backend:
```bash
docker run -d \
  --name churninsight-backend \
  -p 8080:8080 \
  -e SPRING_PROFILES_ACTIVE=docker \
  churninsight-backend:1.0.0
```

### TEST: Verificar Servicios

```bash
# Verificar que ambos están corriendo
docker ps

# Ver logs (en tiempo real)
docker-compose logs -f

# O específico:
docker logs -f churninsight-ai
docker logs -f churninsight-backend
```

**Esperar a que ambos muestren "startup complete" o similar**

### TEST 1: Health Check - AI Service

```bash
curl http://localhost:8000/api/v1/health/check

# Respuesta esperada (200 OK):
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "docker",
  "model_loaded": true,
  "database_connected": null,
  "timestamp": "2024-01-21T15:30:00.123456Z"
}
```

### TEST 2: Health Check - Backend

```bash
curl http://localhost:8080/api/v1/companies/health

# Respuesta esperada (200 OK):
{
  "service": "Company Service",
  "version": "1.0.0",
  "status": "UP"
}
```

### TEST 3: Predicción - AI Service

```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d '{
    "CUIT": "20748123114",
    "NOMBRE_EMPRESA": "TestCo",
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

# Respuesta esperada (200 OK)
```

### STOP: Detener Servicios

```bash
# Detener y remover
docker-compose down

# Solo detener (sin remover)
docker-compose stop

# Verificar que se detuvieron
docker ps  # Debe estar vacío
```

### CLEANUP: Limpiar Recursos

```bash
# Remover contenedores
docker-compose down -v

# Remover imágenes
docker rmi churninsight-ai:1.0.0 churninsight-backend:1.0.0

# Verificar
docker images | grep churninsight  # Debe estar vacío
```

---

## ✅ Checklist de Validación

### AI Service:
- [ ] ✅ Health check retorna status "healthy"
- [ ] ✅ Model info carga correctamente
- [ ] ✅ Predicción individual funciona (caso bajo riesgo)
- [ ] ✅ Predicción individual funciona (caso alto riesgo)
- [ ] ✅ Red flags se calculan correctamente (mínimo 2+ en caso riesgo)
- [ ] ✅ Batch prediction procesa múltiples empresas
- [ ] ✅ Endpoint legacy /predict funciona
- [ ] ✅ Swagger UI accesible en /api/v1/docs
- [ ] ✅ Tiempos de respuesta < 500ms
- [ ] ✅ Logs muestran request_id para tracking

### Backend:
- [ ] ✅ Health endpoint retorna 200 OK
- [ ] ✅ Endpoints de empresas retornan datos
- [ ] ✅ CORS habilitado para frontend
- [ ] ✅ Puede llamar a AI Service exitosamente
- [ ] ✅ Procesa respuesta del AI Service
- [ ] ✅ Guarda predicción en BD local

### Integración:
- [ ] ✅ Frontend → Backend comunica
- [ ] ✅ Backend → AI Service comunica
- [ ] ✅ Red flags se muestran en frontend (cuando esté listo)
- [ ] ✅ Flujo completo sin errores

---

## 🐛 Troubleshooting

### Problema: Port 8000 ya en uso

```bash
# Encontrar proceso
lsof -i :8000  # Mac/Linux
netstat -ano | findstr :8000  # Windows

# Usar puerto diferente
python -m uvicorn main:app --port 8001
```

### Problema: Modelo no cargado

```bash
# Entrenar modelo
cd ai_service
python train_model.py

# Verificar archivo
ls -la models/churn_model.pkl
```

### Problema: Pydantic validation error

```bash
# Revisar que campos requeridos estén presentes
# Revisar tipos de datos (int vs float)
# Ver logs detallados en Swagger UI
```

### Problema: No hay conexión a Oracle

```bash
# Normal en desarrollo - se usa mock model
# Verificar ENVIRONMENT=development en .env
# Logs mostrarán "using mock predictions"
```

---

## 📈 Métricas de Performance

### Benchmarks (esperados):
- **Health check**: < 50ms
- **Predicción individual**: < 200ms
- **Batch (100 empresas)**: < 5s
- **Swagger UI load**: < 1s

### Monitorear:
```bash
# Logs en tiempo real
tail -f ./logs/ai_service.log

# Búsqueda de errores
grep "ERROR\|❌" ./logs/ai_service.log

# Predicciones registradas
grep "✅ Predicción completada" ./logs/ai_service.log
```

---

## 🎯 Próximos Pasos (Post-Testing)

1. **Desplegar a Oracle Cloud** (Container Instance)
2. **Preparar Frontend Angular** con dashboard
3. **Configurar CI/CD** (GitHub Actions, etc.)
4. **Performance tuning** en producción
5. **Monitoreo con Prometheus/Grafana**

---

## 📞 Soporte

Si algo no funciona:

1. Revisar logs (terminal y archivos)
2. Verificar .env configuration
3. Validar que puertos (8000, 8080) estén disponibles
4. Confirmar que Python 3.11+ y Java 17+ están instalados
5. Cheque documentación en `/docs`

¡Éxito en el testing! 🚀
