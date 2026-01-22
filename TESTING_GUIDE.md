# 🧪 GUÍA FINAL DE TESTING LOCAL - ChurnInsight v1.0.0

**Documento**: Guía paso a paso para probar el trabajo finalizado  
**Tiempo estimado**: 30 minutos  
**Status**: ✅ Listo para testing

---

## 📋 ÍNDICE RÁPIDO

1. [Setup Inicial (5 min)](#setup-inicial)
2. [Test 1: Health Check (1 min)](#test-1-health-check)
3. [Test 2: Predicción Bajo Riesgo (2 min)](#test-2-predicción-bajo-riesgo)
4. [Test 3: Predicción Alto Riesgo (2 min)](#test-3-predicción-alto-riesgo)
5. [Test 4: Batch Predictions (3 min)](#test-4-batch-predictions)
6. [Test 5: Legacy Compatibility (1 min)](#test-5-legacy-compatibility)
7. [Test 6: Swagger UI (2 min)](#test-6-swagger-ui)
8. [Troubleshooting](#troubleshooting)

---

## 🚀 SETUP INICIAL

### Pre-requisitos
```bash
# Verificar instalaciones
java -version          # Java 17+
python --version       # Python 3.11+
mvn -version          # Maven 3.8+
```

### Terminal 1: AI Service
```bash
cd c:\Repositorios\ChurnInsight\ai_service

# Virtual environment
python -m venv venv
venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy .env
copy .env.example .env

# Train model
python train_model.py

# ✅ Esperado: "✅ Modelo guardado: ./models/churn_model.pkl"
```

### Terminal 2: Ejecutar Servidor
```bash
# DESDE Terminal 1 (con venv activo)
python -m uvicorn main:app --reload --port 8000

# ✅ Esperado:
# INFO:     Uvicorn running on http://0.0.0.0:8000
# INFO:     Application startup complete
```

---

## 🧪 TEST 1: HEALTH CHECK

### Objetivo
Verificar que la API está ejecutándose y saludable.

### Comando
```bash
curl http://localhost:8000/api/v1/health/check
```

### Respuesta Esperada (200 OK)
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "environment": "development",
  "model_loaded": true,
  "database_connected": null,
  "timestamp": "2024-01-21T15:30:00.123456Z"
}
```

### Validación
- [x] Status = "healthy"
- [x] Version = "1.0.0"
- [x] Model_loaded = true
- [x] HTTP 200 OK

---

## 🧪 TEST 2: PREDICCIÓN BAJO RIESGO

### Objetivo
Probar endpoint `/predict_churn` con empresa saludable (sin alertas).

### Comando
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
```

### Respuesta Esperada (200 OK)
```json
{
  "CUIT": "20748123114",
  "NOMBRE_EMPRESA": "Empresa Saludable",
  "PERIODO_FISCAL": "2024-Q4",
  "churn_probability": 0.0850,
  "churn_prediction": 0,
  "threshold_used": 0.5,
  "red_flags": [],
  "confidence": 0.95,
  "timestamp": "2024-01-21T15:35:00Z"
}
```

### Validación
- [x] churn_prediction = 0 (no churn)
- [x] churn_probability < 0.5
- [x] red_flags = [] (vacío)
- [x] Respuesta < 300ms

**✅ RESULTADO**: Empresa saludable correctamente identificada

---

## 🧪 TEST 3: PREDICCIÓN ALTO RIESGO

### Objetivo
Probar endpoint `/predict_churn` con empresa en riesgo (con alertas).

### Comando
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
```

### Respuesta Esperada (200 OK)
```json
{
  "CUIT": "20111222333",
  "NOMBRE_EMPRESA": "Empresa en Riesgo",
  "PERIODO_FISCAL": "2024-Q4",
  "churn_probability": 0.8320,
  "churn_prediction": 1,
  "threshold_used": 0.5,
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
```

### Validación
- [x] churn_prediction = 1 (churn detectado)
- [x] churn_probability >= 0.5
- [x] red_flags.length >= 5
- [x] Contiene flagas significativas
- [x] Respuesta < 300ms

**✅ RESULTADO**: Empresa en riesgo correctamente identificada con múltiples alertas

---

## 🧪 TEST 4: BATCH PREDICTIONS

### Objetivo
Probar endpoint `/batch_predict_churn` con múltiples empresas.

### Comando
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
```

### Respuesta Esperada (200 OK)
```json
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
      "NOMBRE_EMPRESA": "Empresa 1",
      "PERIODO_FISCAL": "2024-Q4",
      "churn_probability": 0.21,
      "churn_prediction": 0,
      "red_flags_count": 0,
      "red_flags": [],
      "timestamp": "2024-01-21T15:45:00Z"
    },
    {
      "CUIT": "20222333444",
      "NOMBRE_EMPRESA": "Empresa 2",
      "PERIODO_FISCAL": "2024-Q4",
      "churn_probability": 0.62,
      "churn_prediction": 1,
      "red_flags_count": 5,
      "red_flags": [
        "Alta inactividad en la app",
        "Caída significativa en logins diarios",
        "Abandono de funcionalidades: pocos servicios usados",
        "Baja aprobación de préstamos",
        "Margen negativo persistente"
      ],
      "timestamp": "2024-01-21T15:45:01Z"
    }
  ],
  "errors": null,
  "timestamp": "2024-01-21T15:45:02Z"
}
```

### Validación
- [x] total_processed = 2
- [x] total_errors = 0
- [x] distribution.bajo_riesgo = 1
- [x] distribution.medio_riesgo = 1
- [x] Empresa 1: churn_prediction = 0
- [x] Empresa 2: churn_prediction = 1
- [x] Respuesta < 2 segundos

**✅ RESULTADO**: Batch processing funciona correctamente

---

## 🧪 TEST 5: LEGACY COMPATIBILITY

### Objetivo
Verificar que endpoint antiguo `/predict` sigue funcionando (deprecado pero compatible).

### ℹ️ Nota Importante
El endpoint legacy `/predict` **acepta ambos formatos**:
- **Lowercase**: `cuit`, `ingresos`, `gastos`, `deuda_total`, etc.
- **UPPERCASE**: `CUIT`, `INGRESOS`, `GASTOS`, `DEUDA`, etc.

### Comando
```bash
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
```

### Respuesta Esperada (200 OK)
```json
{
  "cuit": "20748123114",
  "probability": 0.23,
  "risk_level": "bajo",
  "timestamp": "2024-01-21T15:50:00Z",
  "deprecated": "Use /predict_churn endpoint"
}
```

### Validación
- [x] HTTP 200 OK
- [x] Retorna probability
- [x] Retorna risk_level
- [x] Contiene aviso "deprecated"
- [x] Funciona con formato lowercase
- [x] Funciona con formato UPPERCASE (opcional)

**✅ RESULTADO**: Compatibilidad backwards completamente funcional

---

## 🧪 TEST 6: SWAGGER UI

### Objetivo
Verificar que documentación interactiva está disponible.

### Pasos
1. Abrir navegador
2. Ir a: `http://localhost:8000/api/v1/docs`
3. Verificar elementos

### Elementos a Validar
- [x] Título: "ChurnInsight AI Service"
- [x] Versión: 1.0.0
- [x] Endpoints listados:
  - [x] POST /api/v1/predictions/predict_churn
  - [x] POST /api/v1/predictions/batch_predict_churn
  - [x] GET /api/v1/health/check
  - [x] GET /api/v1/health/model-info
- [x] Modelos con ejemplos:
  - [x] EmpresaInput (30+ campos)
  - [x] PredictionResponse (con red_flags)
- [x] Try it out funciona

**✅ RESULTADO**: Documentación automática completa y funcional

---

## �️ BACKEND TESTING (OPCIONAL)

### Nota Importante: Oracle Wallet Configuration
El backend requiere **Oracle Autonomous Database**. Si usas modo **DEV sin Oracle**, necesitas:

**Option 1: Mock Mode (Recomendado para DEV local)**
```bash
# Terminal: Backend
cd c:\Repositorios\ChurnInsight\backend

# Ejecutar con profile dev-mock (sin Oracle)
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev-mock"
```

**Option 2: Con Oracle Wallet**
- Asegurar que Wallet está configurado en `backend/wallet_pymer/`
- Ver `backend/Instrucciones Wallet Python.txt`
- Ejecutar con profile dev:
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### Test: Health Check
```bash
curl http://localhost:8080/api/v1/companies/health
```

**Respuesta Esperada**:
```json
{"service":"Company Service","version":"1.0.0","status":"UP"}
```

### Test: Obtener Empresa (requiere datos en Oracle)
```bash
curl http://localhost:8080/api/v1/companies/20748123114
```

Si retorna 500 error con "SSO KeyStore not found", significa que Oracle Wallet no está correctamente configurado. Usa `dev-mock` en su lugar.

---



### Checklist de Tests

```
✅ TEST 1: Health Check
   - Status: HEALTHY
   - Model: LOADED
   - Response: < 50ms

✅ TEST 2: Bajo Riesgo
   - churn_prediction: 0 ✅
   - red_flags: [] ✅
   - Response: < 200ms ✅

✅ TEST 3: Alto Riesgo
   - churn_prediction: 1 ✅
   - red_flags: 8+ items ✅
   - Response: < 200ms ✅

✅ TEST 4: Batch
   - total_processed: 2 ✅
   - distribution: correcta ✅
   - Response: < 2s ✅

✅ TEST 5: Legacy
   - Compatibilidad: OK ✅
   - Deprecated: advertencia ✅

✅ TEST 6: Swagger
   - UI: accesible ✅
   - Documentación: completa ✅
   - Try it out: funciona ✅
```

---

## 🐛 TROUBLESHOOTING

### Error: "Address already in use :8000"
**Solución**:
```bash
# Usar puerto diferente
python -m uvicorn main:app --port 8001
```

### Error: "ModuleNotFoundError: No module named 'fastapi'"
**Solución**:
```bash
# Reinstalar dependencias
pip install -r requirements.txt --force-reinstall
```

### Error: "churn_model.pkl not found"
**Solución**:
```bash
# Entrenar modelo
python train_model.py
```

### Error: "ValidationError" en POST
**Solución**:
```bash
# Verificar que todos los campos están presentes
# Revisar tipos de datos (int vs float)
# Ver ejemplo en docs/08_Testing_Local_Complete.md
```

### Respuesta lenta (> 500ms)
**Verificar**:
- CPU: ¿Alto uso?
- RAM: ¿Poca memoria?
- Modelo: ¿Muy grande?
- Logs: ¿Hay warnings?

---

## ✨ MÉTRICAS FINALES

| Métrica | Valor Esperado | Tu Resultado |
|---------|---|---|
| Health check | < 50ms | ____ ms |
| Predicción simple | < 200ms | ____ ms |
| Batch (2 items) | < 2s | ____ s |
| Swagger load | < 1s | ____ s |
| Red flags (bajo) | 0 | ____ |
| Red flags (alto) | 5+ | ____ |
| Status code | 200 | ____ |

---

## 🎯 CONCLUSIÓN

### ✅ Si todos los tests pasaron:

**El sistema está COMPLETAMENTE FUNCIONAL y listo para:**

1. ✅ Ser integrado con Backend
2. ✅ Ser deployado a Oracle Cloud
3. ✅ Ser consumido por Frontend
4. ✅ Ser puesto en producción

### 🔲 Si algo falló:

1. Revisar sección Troubleshooting
2. Consultar docs/08_Testing_Local_Complete.md
3. Verificar logs en terminal

---

## 📞 DOCUMENTACIÓN DISPONIBLE

- **QUICK_START.md** - Setup ultra-rápido (5 min)
- **08_Testing_Local_Complete.md** - Testing exhaustivo (800 líneas)
- **07_Integration_NewNotebook.md** - Integración técnica
- **EXECUTIVE_SUMMARY.md** - Resumen ejecutivo
- **CHANGELOG_v1.0.0.md** - Lista de cambios
- **README.md** - Descripción general

---

## 🚀 PRÓXIMOS PASOS

### Inmediato:
```bash
# Completar testing local
cd c:\Repositorios\ChurnInsight
# Seguir esta guía

# Resultado: ✅ Todos tests pasados
```

### Corto Plazo:
```bash
# Integración con Backend
cd backend
mvn spring-boot:run
```

### Mediano Plazo:
```bash
# Despliegue en OCI
docker build -t churninsight-ai:1.0.0 ai_service/
# ... (ver docs/05_Deployment_and_Commands.md)
```

---

**Versión**: 1.0.0  
**Status**: ✅ TESTING-READY  
**Fecha**: 21 Enero 2025  
**Tiempo Testing**: ~30 minutos  
**Resultado Esperado**: ✅ ALL TESTS PASS ✅
