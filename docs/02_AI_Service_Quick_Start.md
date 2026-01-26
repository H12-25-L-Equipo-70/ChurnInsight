# ⚡ Quick Start - FastAPI AI Service

Esta guía proporciona pasos esenciales para que el servicio de IA se ejecute localmente. Para obtener información detallada sobre la configuración e implementación, consulte la documentación principal.

---
## 🚀 Configuración local

### 1. Navegar e instalar dependencias
# Crear y activar un entorno virtual Python (recomendado)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Instalar dependencias del proyecto
pip install -r requirements.txt
```

### 2. Configurar variables de entorno

Copie el archivo de entorno de ejemplo y edítelo con sus configuraciones específicas.
```bash
cp .env.example .env
# Edite el archivo .env, por ejemplo, con su contraseña de base de datos de Oracle
# nano .env
```

### 3. Entrenar el modelo

Antes de ejecutar el servicio, asegúrese de que el modelo de ML esté entrenado y guardado.
```bash
python train_model.py
```
Este comando entrena el modelo y lo guarda en el directorio `./models/`.

### 4. Inicie el servicio de IA

Ejecute la aplicación FastAPI usando Uvicorn.
```bash
python -m uvicorn main:app --reload --port 8000
```
Se podrá acceder al servicio en `http://localhost:8000`.

---
## 🧪 Prueba rápida

### Control de salud

```bash
curl http://localhost:8000/api/v1/health/check
```
*Resultado esperado: una respuesta JSON que indica que el servicio está "en buen estado".*

### Predicción única

```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d 
  {
    "cuit": "20748123114",
    "ingresos": 1500000.00,
    "gastos": 1000000.00,
    "margen_operativo": 33.33,
    "deuda_total": 500000.00,
    "activos_totales": 2000000.00,
    "prestamos_solicitados": 3,
    "prestamos_aprobados": 2,
    "trimestre_dias_actividad": 85,
    "trimestre_logins_promedio": 12.5,
    "transferencias_trimestre": 45,
    "pagos_trimestre": 30,
    "creditos_trimestre": 15
  }
```
*Resultado esperado: una respuesta JSON con detalles de predicción.*

---

## 📚 Documentación relacionada

* **[Referencia de API de servicio AI](04_AI_Service_API.md):** Información detallada sobre todos los puntos finales de API.
* **[Descripción general del proyecto](01_Project_Overview.md):** Información general y arquitectura del proyecto.
* **[Guía de Docker](DOCKER_GUIDE.md):** Instrucciones para ejecutar el servicio de IA con Docker.
* **[Guía de inicio rápido](00_Quick_Start.md):** Guía de configuración local completa para todo el proyecto.

---

**Nota:** Para implementación de producción y configuraciones avanzadas, consulte la documentación principal de implementación.