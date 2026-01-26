# Detalles del Servicio de IA

Este documento proporciona una descripción detallada de las funcionalidades del servicio de IA, incluyendo esquemas de datos, análisis de “red flags” y endpoints de la API.

---

## 📄 Esquemas de Datos

### Esquema de Entrada (`EmpresaInput`)

El servicio de IA espera un esquema de entrada detallado con más de 30 campos estructurados por empresa, que cubren identificación, estructura financiera, comportamiento crediticio y nivel de uso de la plataforma.

```python
class EmpresaInput(BaseModel):
    # Identificación
    CUIT: str
    NOMBRE_EMPRESA: str
    PERIODO_FISCAL: str
    
    # Estructura Financiera (5 campos)
    EMPLEADOS: int
    INGRESOS: float
    GASTOS: float
    DEUDA: float
    ACTIVOS: float
    
    # Comportamiento Crediticio (8 campos)
    PRESTAMOS_SOLICITADOS: int
    PRESTAMOS_APROBADOS: int
    MONTO_SOLICITADO: float
    MONTO_APROBADO: float
    # ... y 4 campos más
    
    # Gestión de Créditos (1 campo)
    TIEMPO_CANCELACION_PRESTAMO: int
    
    # Transaccionalidad (5 campos)
    SERVICIOS_UTILIZADOS: int
    TRANSFERENCIAS: int
    PAGOS: int
    CREDITOS: int
    INVERSIONES: int
    
    # Interacción / Actividad (4 campos)
    TRIMESTRE_DIAS_ACTIVIDAD: int
    TRIMESTRE_DIAS_INACTIVIDAD: int
    PROMEDIO_LOGIN_DIA: float
    TOTAL_LOGIN_DIA: int

```

### Esquema de Salida (`PredictionResponse`)

La respuesta de la predicción incluye la probabilidad de churn, una predicción binaria, el umbral utilizado, una lista de “red flags” detectadas y un puntaje de confianza.

```python
class PredictionResponse(BaseModel):
    CUIT: str
    NOMBRE_EMPRESA: str
    PERIODO_FISCAL: str
    churn_probability: float  # 0-1
    churn_prediction: int     # 0 o 1 (binario)
    threshold_used: float
    red_flags: List[str]      # Señales de alerta detectadas
    confidence: float
    timestamp: datetime

```

---

## 🚩 Análisis de Red Flags

Una funcionalidad clave del servicio de IA es el módulo `RedFlagAnalyzer`, que identifica riesgos potenciales basándose en un conjunto de reglas predefinidas. Este análisis complementa la predicción del modelo de machine learning.

**14 Tipos de Red Flags Detectadas:**
1.  Alta inactividad en la app (>50% de inactividad)
2.  Caída significativa en los logins diarios (<3 logins/día)
3.  Abandono de funcionalidades (≤1 servicio utilizado)
4.  Baja tasa de aprobación de préstamos (<30%)
5.  Margen negativo persistente
6.  Rentabilidad muy baja (<10%)
7.  Cancelación temprana de préstamos (<30 días)
8.  Disminución del volumen transaccional (<5 operaciones)
9.  Alto ratio de endeudamiento (>70%)
10. Solicitudes de crédito no aprobadas
11. Microempresa con muy pocos empleados
12. Empresa completamente inactiva en el trimestre
13. Sin movimiento transaccional
14. Múltiples préstamos activos sin pago

---
## ⚙️ Endpoints de la API

### Endpoint Principal de Predicción
`POST /api/v1/predictions/predict_churn`
- **Entrada:** `EmpresaInput` (más de 30 campos)
- **Salida:** `PredictionResponse` con `red_flags`
- **Nota:** Registra automáticamente en Oracle en producción.

### Predicción por Lotes (Batch)
`POST /api/v1/predictions/batch_predict_churn`
- **Entrada:** Lista de `EmpresaInput`
- **Salida:** Resumen + lista de predicciones
- **Nota:** Optimizado para análisis masivo.

### Endpoint Legacy
`POST /api/v1/predictions/predict`
- **Nota:** Obsoleto, pero funcional para compatibilidad hacia atrás.

---
## 🔗 Integración Backend – Servicio de IA

El backend en Spring Boot consume el endpoint `predict_churn` del servicio de IA, enviando los datos `EmpresaInput` y recibiendo la `PredictionResponse`.

**Flujo Completo de Predicción:**
1. El **Frontend** envía una solicitud al **Backend**.
2. El **Backend** construye el `EmpresaInput` y llama al **Servicio de IA**.
3. El **Servicio de IA** calcula las “red flags”, realiza la predicción y guarda el resultado en la base de datos Oracle.
4. El **Servicio de IA** devuelve la `PredictionResponse` al **Backend**.
5. El **Backend** procesa la respuesta y la retorna al **Frontend**.
6. El **Frontend** muestra el dashboard de análisis.

---

## ✨ Funcionalidades Clave

- **Esquema Unificado:** Un único esquema completo con más de 30 campos.
- **Red Flags:** Las “red flags” son una funcionalidad central que aporta contexto a la predicción.
- **Procesamiento por Lotes:** Soporte para análisis masivo de empresas.
- **Compatibilidad Retroactiva:** Se mantienen endpoints legacy.
- **Integración con Base de Datos:** Registro automático de predicciones en Oracle DB en producción.
- **Configuración:** El umbral del modelo es ajustable mediante variables de entorno.
- **Mapeo de Features:** El servicio soporta nombres de features en mayúsculas y minúsculas para mayor flexibilidad.
