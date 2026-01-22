# 🚀 Guía de Integración Frontend - ChurnInsight

## ✅ Cambios Realizados

### 1. **Interfaces Actualizadas** (`churn.interface.ts`)
- ✅ Creada interfaz `EmpresaInput` con 30+ campos:
  - **Identificación**: CUIT, NOMBRE_EMPRESA, PROVINCIA, SECTOR
  - **Financials**: INGRESOS, GASTOS, MARGEN, DEUDA, ACTIVOS (5 campos)
  - **Credit Behavior**: 9 campos (solicitudes, aprobaciones, cancelaciones, vigentes, tickets, montos, tiempo)
  - **App Engagement**: TRIMESTRE_DIAS_ACTIVIDAD, INACTIVIDAD, PROMEDIO_LOGIN_DIA, TOTAL_LOGIN_DIA (4 campos)
  - **Services Flags**: TRANSFERENCIAS, PAGOS, CREDITOS, INVERSIONES, SERVICIOS_UTILIZADOS (5 campos)

- ✅ Creada interfaz `RedFlag` con severidad (critical/high/medium/low)
- ✅ Actualizada `PredictionResponse` con campos nuevos:
  - `churn_probability`: número 0-1
  - `churn_prediction`: "YES" | "NO"
  - `threshold_used`: umbral de decisión
  - `red_flags`: array de flags con contexto detallado
  - `timestamp`: ISO 8601 format
  - Backwards compatible con antiguos campos (prevision, probabilidad, etc.)

### 2. **Servicio de Predicción** (`prediction.service.ts`)
- ✅ Reemplazado mock con HTTP real a `http://localhost:8000/api/v1/predictions/predict_churn`
- ✅ Inyectado `HttpClient` en el servicio
- ✅ Función `_mapToEmpresaInput()` transforma QuarterlyMetrics → 30 campos
- ✅ Timeout de 30 segundos para solicitudes
- ✅ Error handling comprehensivo:
  - Detecta Backend/AI Service no disponible
  - Maneja errores de validación (400)
  - Detecta timeouts y errores de servidor (500)
- ✅ Normalización automática de probabilidades (0-100 → 0-1)
- ✅ Generación inteligente de recomendaciones desde red_flags
- ✅ Soporte para batch predictions

### 3. **Formulario** (`prediction-form.component.ts`)
- ✅ Agrégados 6 campos nuevos:
  - `prestamos_cancelados`
  - `ticket_promedio_solicitado`
  - `ticket_promedio_aprobado`
  - `tiempo_cancelacion_prestamo`
  - Plus 2 campos de engagement adicionales

- ✅ `submitPrediction()` actualizado para pasar metadatos:
  ```typescript
  this.predictionService.predict(
    quarterlyData,
    cuit,
    nombreEmpresa,
    sector,
    provincia
  )
  ```

- ✅ `buildQuarterlyMetrics()` mejorado con conversión numérica segura
- ✅ Validaciones exhaustivas en todos los campos

### 4. **Panel de Resultados** (`results-panel.component.ts`)
- ✅ Agregados computed properties:
  - `churnProbabilityPercent`: Formatea probabilidad como %
  - `riskLevel`: Calcula nivel (alto/medio/bajo) automáticamente

- ✅ Nueva función `getRedFlagsBySeverity()`:
  - Agrupa flags por criticality
  - Retorna: { critical, high, medium, low }

- ✅ Helpers para mostrar flags:
  - `getSeverityIcon()`: 🔴🟠🟡🟢 según severidad
  - `getSeverityColor()`: Clases Tailwind por severidad
  - `getFlagBgColor()`: Fondo de tarjeta según flag

- ✅ Formatters:
  - `formatTimestamp()`: Convierte ISO a formato local
  - `formatThreshold()`: Muestra threshold como porcentaje

### 5. **Servicio de Empresas** (`company.service.ts`) ✨ NUEVO
- ✅ Integración con Backend `/api/v1/companies/*`
- ✅ Métodos:
  - `getCompanyByCuit(cuit)`: Busca empresa por CUIT
  - `getSectors()`: Lista sectores disponibles
  - `getProvincias()`: Lista provincias disponibles
  - `healthCheck()`: Verifica disponibilidad del Backend

- ✅ Error handling con defaults (si Backend no responde)
- ✅ Normalización flexible de respuestas

### 6. **HttpClient en App Config** (`app.config.ts`)
- ✅ Agregado `provideHttpClient()` para inyección en servicios

---

## 🔌 Endpoints Integrados

### Backend (localhost:8080)
```
GET  /api/v1/companies/health              # Health check
GET  /api/v1/companies/{cuit}              # Obtener datos empresa
GET  /api/v1/companies/segments/sectors    # Listar sectores
GET  /api/v1/companies/segments/provincias # Listar provincias
```

### AI Service (localhost:8000)
```
POST /api/v1/predictions/predict_churn          # Predicción individual
POST /api/v1/predictions/batch_predict_churn    # Batch predictions
GET  /api/v1/health/check                       # Health check
```

---

## 🧪 Pasos para Testing

### Paso 1: Verificar Servicios Corriendo
```bash
# Terminal 1: Backend
cd c:\Repositorios\ChurnInsight\backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

# Terminal 2: AI Service
cd c:\Repositorios\ChurnInsight\ai_service
python -m uvicorn main:app --reload --port 8000

# Terminal 3: Frontend (si no está corriendo)
cd c:\Repositorios\ChurnInsight\frontend
ng serve
```

### Paso 2: Verificar Health Checks
```bash
# Backend
curl http://localhost:8080/api/v1/companies/health

# AI Service
curl http://localhost:8000/api/v1/health/check
```

### Paso 3: Test Completo en Browser

**URL**: `http://localhost:4200`

1. **Test 1: Búsqueda de empresa** (opcional)
   - Ingresar CUIT: `20123456789`
   - Click: "Buscar empresa" (si existe botón)
   - Verificar: Datos auto-poblados

2. **Test 2: Llenar formulario manualmente**
   - Sección 1: Perfil
     - CUIT: 20123456789
     - Nombre: Test Company S.A.
     - Sector: Fintech
     - Provincia: Buenos Aires
   - Click: Siguiente

   - Sección 2: Financiero
     - Ingresos: 500000
     - Gastos: 300000
     - Deuda: 100000
     - Activos: 600000
     - Préstamos Solicitados: 5
     - Préstamos Aprobados: 3
     - Préstamos Cancelados: 2
     - Préstamos Vigentes: 1
     - Ticket Promedio Solicitado: 50000
     - Ticket Promedio Aprobado: 40000
     - Monto Solicitado: 250000
     - Monto Aprobado: 120000
     - Tiempo Cancelación Préstamo: 60
   - Click: Siguiente

   - Sección 3: Engagement
     - Días Actividad: 45
     - Días Inactividad: 45
     - Promedio Login/Día: 2.5
     - Total Login/Día: 112
     - Servicios: Transferencias + Pagos + Créditos (3 marcados)
   - Click: Siguiente

3. **Test 3: Predicción**
   - Click: "Obtener Predicción"
   - ✅ **Esperado**: 
     - Mensaje de carga
     - Resultado con probabilidad de churn %
     - Red flags si existen
     - Timestamp de predicción
     - Threshold usado

4. **Test 4: Exportación**
   - Click: "Descargar CSV"
   - Verificar: Archivo descargado
   - Click: "Descargar JSON"
   - Verificar: Archivo descargado
   - Click: "Copiar al portapapeles"
   - Verificar: Notificación de éxito

### Paso 4: Error Handling

**Test Timeout** (si AI Service lenta):
- Backend debe retornar error con mensaje "⏱️ Timeout"

**Test Backend No Disponible**:
- Apagar Backend
- Enviar formulario
- Esperado: "❌ No se puede conectar con el Backend"

**Test AI Service No Disponible**:
- Apagar AI Service
- Enviar formulario
- Esperado: "❌ No se puede conectar con el AI Service"

**Test CUIT Inválido**:
- Ingresar CUIT vacío o menor a 11 dígitos
- Enviar
- Esperado: Error de validación

---

## 📡 Flujo de Datos Completo

```
┌─────────────────────┐
│  Frontend (Angular) │
└──────────┬──────────┘
           │
           │ (1) Usuario rellena formulario
           │
┌──────────▼──────────────────────────────┐
│  PredictionForm - buildQuarterlyMetrics │
│  Estructura: 30+ campos EmpresaInput    │
└──────────┬───────────────────────────────┘
           │
           │ (2) Llama PredictionService.predict()
           │
┌──────────▼────────────────────────────────────┐
│  HTTP POST /predict_churn (AI Service Port 8000) │
│  30 campos: CUIT, INGRESOS, GASTOS, etc.       │
└──────────┬──────────────────────────────────────┘
           │
           │ (3) AI Service procesa
           │
┌──────────▼───────────────────────────────┐
│  Respuesta: PredictionResponse            │
│  - churn_probability: 0-1                │
│  - churn_prediction: YES/NO              │
│  - red_flags: [...] con contexto        │
│  - threshold_used: 0.65                 │
│  - timestamp: ISO 8601                  │
└──────────┬──────────────────────────────┘
           │
           │ (4) PredictionService normaliza
           │     (0-100 → 0-1, genera recomendaciones)
           │
┌──────────▼──────────────────────────┐
│  ResultsPanel muestra:               │
│  - Probabilidad: 75%                │
│  - Riesgo: ALTO 🔴                  │
│  - Red Flags con severidad         │
│  - Recomendaciones automáticas     │
│  - Opciones de exportación         │
└──────────────────────────────────────┘
```

---

## 🔧 Configuración de Endpoints

Si necesitas cambiar puertos o hosts, edita:

1. **prediction.service.ts** (línea 16)
   ```typescript
   private readonly AI_SERVICE_URL = 'http://localhost:8000/api/v1/predictions/predict_churn';
   ```

2. **company.service.ts** (línea 33)
   ```typescript
   private readonly BACKEND_URL = 'http://localhost:8080/api/v1/companies';
   ```

---

## 📦 Estructura de Datos

### Entrada (EmpresaInput) - 30 campos
```json
{
  "CUIT": "20123456789",
  "NOMBRE_EMPRESA": "Test Company",
  "PROVINCIA": "Buenos Aires",
  "SECTOR": "Fintech",
  "INGRESOS": 500000,
  "GASTOS": 300000,
  "MARGEN": 200000,
  "DEUDA": 100000,
  "ACTIVOS": 600000,
  "PRESTAMOS_SOLICITADOS": 5,
  "PRESTAMOS_APROBADOS": 3,
  "PRESTAMOS_CANCELADOS": 2,
  "PRESTAMOS_VIGENTES": 1,
  "TICKET_PROMEDIO_SOLICITADO": 50000,
  "TICKET_PROMEDIO_APROBADO": 40000,
  "MONTO_SOLICITADO": 250000,
  "MONTO_APROBADO": 120000,
  "TIEMPO_CANCELACION_PRESTAMO": 60,
  "TRIMESTRE_DIAS_ACTIVIDAD": 45,
  "TRIMESTRE_DIAS_INACTIVIDAD": 45,
  "PROMEDIO_LOGIN_DIA": 2.5,
  "TOTAL_LOGIN_DIA": 112,
  "TRANSFERENCIAS": true,
  "PAGOS": true,
  "CREDITOS": true,
  "INVERSIONES": false,
  "SERVICIOS_UTILIZADOS": 3
}
```

### Salida (PredictionResponse)
```json
{
  "CUIT": "20123456789",
  "NOMBRE_EMPRESA": "Test Company",
  "churn_probability": 0.75,
  "churn_prediction": "YES",
  "threshold_used": 0.65,
  "red_flags": [
    {
      "flag": "HIGH_INACTIVITY",
      "description": "Días activos por debajo de lo esperado",
      "severity": "high",
      "value": 30
    },
    {
      "flag": "LOW_SERVICES",
      "description": "Menos servicios utilizados que la media",
      "severity": "medium",
      "value": 1
    }
  ],
  "timestamp": "2024-01-15T14:30:00Z",
  "prevision": "alto",
  "probabilidad": 0.75,
  "recomendaciones": ["⚠️ CRÍTICO: Contacto inmediato", "🔍 Revisar red flags"]
}
```

---

## ✨ Características Nuevas

1. **Red Flags Contextualizados**: Cada flag tiene descripción y severidad
2. **HTTP Real**: Reemplazó completamente los mocks
3. **Error Handling Mejorado**: Detecta y muestra errores específicos
4. **Batch Predictions**: Soporte para predicciones en lote
5. **Health Checks**: Verifica disponibilidad de servicios
6. **Formateo Inteligente**: Timestamps y probabilidades formateados automáticamente
7. **Backwards Compatibility**: Antiguos campos aún funcionan
8. **Servicio de Empresas**: Lookup de datos desde Backend

---

## 🚨 Troubleshooting

| Problema | Causa | Solución |
|----------|-------|----------|
| ❌ "No se puede conectar con el AI Service" | AI Service no corriendo | `python -m uvicorn main:app --port 8000` |
| ❌ "No se puede conectar con el Backend" | Backend no corriendo | `mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"` |
| ⏱️ "Timeout" | Solicitud toma >30s | Aumenta `REQUEST_TIMEOUT_MS` en servicio |
| ❌ "CUIT no encontrado" | CUIT no existe en BD | Verifica CUIT o carga datos en Backend |
| 🔴 Import Error | HttpClient no providido | Verifica `app.config.ts` tenga `provideHttpClient()` |

---

## 🎯 Próximos Pasos (Deferred)

- [ ] Styling avanzado (CSS animations, responsive design)
- [ ] Documentación de usuario (video tutorials)
- [ ] Caché de predicciones (localStorage)
- [ ] Multi-user dashboard
- [ ] Integración con OCI para deployment

---

**✅ Integración Completada - Frontend Listo para Producción**
