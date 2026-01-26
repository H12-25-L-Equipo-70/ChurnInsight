# 🚀 Guía de Frontend - ChurnInsight

Esta guía se centra en la integración del frontend con los servicios de backend e IA, detallando las estructuras de datos, las interacciones con la API y los procedimientos de prueba.

---

## 🔌 Endpoints de API Integrados

El frontend interactúa tanto con el servicio Backend como con el servicio de IA para proporcionar predicciones y datos de empresas.

### Servicio Backend (localhost:8080)

*   **Health Check:** `GET /api/v1/companies/health`
*   **Obtener datos de empresa:** `GET /api/v1/companies/{cuit}`
*   **Obtener sectores:** `GET /api/v1/companies/segments/sectors`
*   **Obtener provincias:** `GET /api/v1/companies/segments/provincias`

### Servicio de IA (localhost:8000)

*   **Endpoint de predicción:** `POST /api/v1/predictions/predict_churn`
*   **Endpoint de predicción en batch:** `POST /api/v1/predictions/batch_predict_churn`
*   **Health Check:** `GET /api/v1/health/check`

---

## 🧪 Procedimientos de Prueba del Frontend

Seguí estos pasos para probar la integración del frontend:

### Paso 1: Verificar que los servicios estén en ejecución

Antes de probar el frontend, asegurate de que los servicios de Backend e IA estén corriendo. Para instrucciones de configuración local, consultá la [Guía de Inicio Rápido](00_Quick_Start.md).

### Paso 2: Verificar el estado de los servicios

Chequeá el estado del backend y del servicio de IA usando `curl`:

```bash
# Health Check Backend
curl http://localhost:8080/api/v1/companies/health

# Health Check Servicio de IA
curl http://localhost:8000/api/v1/health/check

```
### Paso 3: Pruebas completas desde el navegador

Accedé a la aplicación frontend desde tu navegador en `http://localhost:4200`.

1.  **Probar envío manual del formulario:**
    *   Completá todos los campos del formulario de predicción.
    *   Hacé clic en "Get Prediction".
    *   *Resultado esperado:* Se muestra un indicador de carga y luego los resultados de la predicción.

2.  **Probar funcionalidad de exportación:**
    *   Luego de recibir una predicción, probá los botones "Download CSV", "Download JSON" y "Copy to Clipboard".

3.  **Probar manejo de errores:**
    *   Simulá condiciones de error, como servicios no disponibles, para verificar que el frontend muestre mensajes de error claros y amigables para el usuario.

---
## 📡 Resumen del Flujo de Datos

El frontend orquesta las interacciones del usuario y el flujo de datos:

1.  El usuario completa el formulario de predicción.
2.  El frontend envía una solicitud al backend.
3.  El backend llama al servicio de IA para obtener una predicción.
4.  La predicción es devuelta al frontend y mostrada al usuario.

---
## 🔧 Configuración

Los endpoints de la API y los puertos se configuran dentro de los servicios de Angular en `src/app/core/services`.

---

## 📦 Estructuras de Datos

Consulta `src/app/core/models/churn.interface.ts` para ver las interfaces TypeScript detalladas que se utilizan en el frontend.

---

## ✨ Funcionalidades Clave del Frontend

*   **Cliente HTTP:** Para la comunicación con los servicios del backend.
*   **Mapeo de Datos:** Los servicios gestionan la transformación de los datos de la UI para la API y procesan las respuestas.
*   **Manejo de Errores:** Mecanismos para informar al usuario sobre problemas de conexión y errores de la API.
*   **Feedback de UI:** Indicadores de carga y visualización clara de los resultados de predicción.
*   **Funcionalidad de Exportación:** Exporta los resultados de las predicciones a CSV, JSON o al portapapeles.
