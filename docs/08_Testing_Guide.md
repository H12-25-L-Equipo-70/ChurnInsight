# 🧪 Guía de Pruebas Locales - ChurnInsight

Esta guía proporciona instrucciones para probar la aplicación ChurnInsight de forma local.

---

## 📋 Requisitos Previos

### Hardware Recomendado:
- CPU: 4+ núcleos
- RAM: 8GB mínimo (16GB recomendado)
- Disco: 10GB libres

### Software Requerido:
- Java 17+
- Python 3.11+
- Maven 3.8+
- Git
- Docker (opcional, para pruebas similares a producción)

---

## 🚀 Inicio Rápido de Pruebas

### Opción A: Sin Oracle (Modo Desarrollo)

**Terminal 1 - Servicio de IA:**
```bash
cd ai_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
python train_model.py
python -m uvicorn main:app --reload --port 8000

```

**Terminal 2 - Backend (optional):**
```bash
cd backend
 הראש mvn spring-boot:run -Dspring-boot.run.profiles=local
```

**Terminal 3 - Test:**
```bash
# Health check
curl http://localhost:8000/api/v1/health/check

# Prediction
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d 
'''{
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
  }'''
```

---\n
## 📊 Pruebas Detalladas - Servicio de IA

### 1. Configuración
- Navega al directorio `ai_service`.
- Configura el entorno virtual de Python e instala las dependencias.
- Configura el archivo `.env`.
- Entrena el modelo con `python train_model.py`.

### 2. Iniciar el Servidor

```bash
python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### 3. Documentación Interactiva
-   **Swagger UI**: http://localhost:8000/api/v1/docs
-   **ReDoc**: http://localhost:8000/api/v1/redoc

---\n
## 🧬 AI Service Casos de prueba

### Health Check
```bash
curl -X GET http://localhost:8000/api/v1/health/check
```

### Model Info
```bash
curl -X GET http://localhost:8000/api/v1/health/model-info
```
### Predicción Individual
- Probar con datos de una empresa de bajo riesgo.
- Probar con datos de una empresa de alto riesgo.

### Predicción por Lotes
- Probar el endpoint batch con una lista de empresas.

---\n
## 🏗️ Pruebas del Backend - Spring Boot

### 1. Configuración
- Navega al directorio `backend`.
- Configura el archivo `.env`. Para pruebas locales sin Oracle, puedes usar una base de datos en memoria H2.

### 2. Construir y Ejecutar

```bash
 הראש mvn clean install
 הראש mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### 3. Test Backend Endpoints
```bash
# Health
curl http://localhost:8080/api/v1/companies/health

# Get company data
curl http://localhost:8080/api/v1/companies/20748123114

# Get sectors
curl http://localhost:8080/api/v1/companies/segments/sectors
```

---\n
## 🔄 Pruebas de Integración (IA + Backend)

- Ejecuta tanto el servicio de IA como el servicio backend.
- Realiza una solicitud a un endpoint del backend que dispare una llamada al servicio de IA.
- Revisa los logs de ambos servicios para seguir el flujo de la solicitud.

---\n
## 🐳 Pruebas con Docker

Para un entorno similar a producción, utiliza Docker para ejecutar los servicios.

### Construir y Ejecutar

```bash
# From the project root
docker-compose build
docker-compose up -d
```

### Verifica servicios
```bash
docker-compose ps
```

### Probar Endpoints
- Probar los endpoints de health check de ambos servicios.
- Probar el endpoint de predicción del servicio de IA.

### Detener Servicios

```bash
docker-compose down
```

Para más detalles en el uso de docker, ver la guia [Docker Guide](DOCKER_GUIDE.md).

---\n
## 🐛 Resolución de Problemas

- **Puerto en uso:** Si un puerto ya está en uso, detén el proceso que lo esté utilizando o cambia el puerto en la configuración del servicio.
- **Modelo no cargado:** Asegúrate de que el modelo haya sido entrenado y que la variable `MODEL_PATH` en el archivo `.env` sea correcta.
- **Error de validación Pydantic:** Verifica que todos los campos requeridos estén presentes en la solicitud y que los tipos de datos sean correctos.

---\n