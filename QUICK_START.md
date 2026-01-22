# ⚡ ChurnInsight - Quick Start (Todo en Uno)

## 🚀 Ejecutar Todo (4 Terminales)

### Terminal 1: AI Service
```bash
cd c:\Repositorios\ChurnInsight\ai_service
python -m venv venv
# Windows:
venv\Scripts\activate
# MacOS/Linux:
source venv/bin/activate

pip install -r requirements.txt
python train_model.py
python -m uvicorn main:app --reload --port 8000
```
✅ **Esperado**: `Application startup complete` + http://localhost:8000/api/v1/docs

---

### Terminal 2: Backend
```bash
cd c:\Repositorios\ChurnInsight\backend
mvn clean install
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```
✅ **Esperado**: `Started ChurnInsightApplication` + http://localhost:8080/actuator/health

---

### Terminal 3: Frontend
```bash
cd c:\Repositorios\ChurnInsight\frontend
npm install  # Solo primera vez
ng serve
```
✅ **Esperado**: `Application bundle generated` + http://localhost:4200

---

### Terminal 4: Test (Optional)
```bash
# Verificar AI Service
curl http://localhost:8000/api/v1/health/check

# Verificar Backend
curl http://localhost:8080/api/v1/companies/health

# Test Predicción
curl -X POST http://localhost:8000/api/v1/predictions/predict_churn \
  -H "Content-Type: application/json" \
  -d "{\"CUIT\":\"20123456789\",\"NOMBRE_EMPRESA\":\"Test\",\"INGRESOS\":500000,\"GASTOS\":300000,\"MARGEN\":200000,\"DEUDA\":100000,\"ACTIVOS\":600000,\"PRESTAMOS_SOLICITADOS\":5,\"PRESTAMOS_APROBADOS\":3,\"PRESTAMOS_CANCELADOS\":2,\"PRESTAMOS_VIGENTES\":1,\"TICKET_PROMEDIO_SOLICITADO\":50000,\"TICKET_PROMEDIO_APROBADO\":40000,\"MONTO_SOLICITADO\":250000,\"MONTO_APROBADO\":120000,\"TIEMPO_CANCELACION_PRESTAMO\":60,\"TRIMESTRE_DIAS_ACTIVIDAD\":45,\"TRIMESTRE_DIAS_INACTIVIDAD\":45,\"PROMEDIO_LOGIN_DIA\":2.5,\"TOTAL_LOGIN_DIA\":112,\"PROVINCIA\":\"Buenos Aires\",\"SECTOR\":\"Fintech\",\"TRANSFERENCIAS\":true,\"PAGOS\":true,\"CREDITOS\":true,\"INVERSIONES\":false,\"SERVICIOS_UTILIZADOS\":3}"
```

---

## 🧪 Test en Browser

1. Abrir: **http://localhost:4200**
2. Ingresar datos:
   - **CUIT**: 20123456789
   - **Nombre**: Test Company
   - **Sector**: Fintech
   - **Provincia**: Buenos Aires
   - **Ingresos**: 500000
   - **Gastos**: 300000
   - **Deuda**: 100000
   - **Activos**: 600000
   - (Llenar resto de campos con valores test)
3. Click: "Obtener Predicción"
4. ✅ Ver resultado con probabilidad y red flags

---

## 📋 Checklist

- [ ] Terminal 1: AI Service corriendo (puerto 8000)
- [ ] Terminal 2: Backend corriendo (puerto 8080)
- [ ] Terminal 3: Frontend corriendo (puerto 4200)
- [ ] Acceso a http://localhost:4200
- [ ] Test predicción exitosa
- [ ] Red flags mostrados

---

## 🐛 Quick Troubleshooting

| Error | Fix |
|-------|-----|
| `venv\Scripts\activate` no funciona | Reinstalar: `python -m venv venv` |
| Puerto 8000 en uso | Cambiar en main.py: `--port 8001` |
| Maven no encontrado | Agregar a PATH: `C:\Program Files\Apache\maven\bin` |
| npm no encontrado | Instalar Node.js |
| Backend 404 | Verificar `@RequestMapping("/api/v1/companies")` |
| AI Service timeout | Aumentar delay en profile/test |
| Angular "Module not found" | `npm install` nuevamente |
| CORS error | Backend debe tener `@CrossOrigin` |

---

## 📍 URLs Importantes

| Servicio | URL | Status |
|----------|-----|--------|
| Frontend | http://localhost:4200 | ✅ Angular App |
| Backend API | http://localhost:8080/api/v1 | ✅ Spring Boot |
| Backend Actuator | http://localhost:8080/actuator | ✅ Health checks |
| AI Service | http://localhost:8000 | ✅ FastAPI |
| AI Service Docs | http://localhost:8000/api/v1/docs | ✅ Swagger |

---

## 📚 Documentación Relacionada

- [09_Frontend_Integration_Guide.md](../docs/09_Frontend_Integration_Guide.md) - Guía completa de integración
- [08_Testing_Local_Complete.md](../docs/08_Testing_Local_Complete.md) - Testing detallado
- [05_Deployment_and_Commands.md](../docs/05_Deployment_and_Commands.md) - Deployment
- [04_AI_Service_API.md](../docs/04_AI_Service_API.md) - API AI Service

---

**Version**: 1.1.0 | 🚀 Listo para Testing
