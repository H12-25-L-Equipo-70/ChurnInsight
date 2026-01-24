# ⚡ Quick Start Testing - Correcciones v3.0

**Objetivo**: Verificar los 3 fixes en 5 minutos

---

## 🚀 Startup Rápido

### Terminal 1: AI Service
```bash
cd ai_service
python -m uvicorn main:app --port 8000 --reload
```

### Terminal 2: Backend
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```

### Terminal 3: Frontend
```bash
cd frontend
ng serve --port 4200
```

**⏱️ Espera**: ~30 segundos hasta que todos muestren "ready" o "startup complete"

---

## ✅ TEST RÁPIDO 1: Validación de Préstamos (2 min)

### Abre http://localhost:4200
Ve a **Nueva Predicción** → **Predictor**

### Llena Sección 1 (Rápido)
```
CUIT: 20123456789
Empresa: TestCorp
Sector: Fintech
Provincia: Buenos Aires
→ SIGUIENTE
```

### Llena Sección 2 - Crédito: CASO INVÁLIDO
```
Solicitados:  5
Aprobados:    8  ← INVÁLIDO (más que solicitados)
Vigentes:     2
Cancelados:   3
```

### Resultado Esperado
✅ Campo "Aprobados" en **ROJO**  
✅ Mensaje: "❌ No puede ser mayor a Solicitados (5)"  
✅ **NO puedes avanzar**  

### Corrige y Prueba Válido
```
Solicitados:  5
Aprobados:    4  ← VÁLIDO
Vigentes:     2
Cancelados:   2
→ SIGUIENTE
```

✅ Verde, puedes avanzar

---

## ✅ TEST RÁPIDO 2: Gráficas Visibles (2 min)

### Completa Sección 3 Rápido
```
Días Actividad: 85
Total Logins: 765
(Cancelados y Promedio se auto-rellenan)
→ SIGUIENTE
```

### Llena Servicios (checkbox todos)
```
✓ Transferencias
✓ Pagos
✓ Créditos
✓ Inversiones
```

### Envía Predicción
```
→ ENVIAR PREDICCIÓN
```

### Resultado Esperado
⏳ Modal se abre en ~2-3 segundos

✅ **DEBES VER 3 GRÁFICAS**:
1. **Riesgo** (Doughnut) - 40/35/25
2. **Crédito** (Radar) - 4 puntos
3. **Financiero** (Bar) - 5 barras

Si ves **espacios en blanco**: hay un problema

---

## ✅ TEST RÁPIDO 3: UX Compacto (1 min)

### En el Modal Abierto

**Observa**:
- ✅ 3 gráficas lado a lado (no vertical)
- ✅ Modal NO es súper largo
- ✅ Botones al pie

**En mobile** (redimensiona a 480px):
- ✅ Gráficas se apilan verticalmente
- ✅ Texto se ajusta
- ✅ Sigue siendo usable

---

## 🎯 Resumen: Status

| Fix | Status | Verificado |
|-----|--------|-----------|
| Lógica de Préstamos | ✅ Reparado | TEST 1 |
| Gráficas | ✅ Reparado | TEST 2 |
| UX | ✅ Mejorado | TEST 3 |

**Si todos los tests pasaron ✅**:
→ Sistema está listo para producción

---

## 🐛 Si Algo Sale Mal

### Síntoma: "Port 4200 already in use"
```bash
# Terminal: Check what's using port
netstat -ano | findstr :4200

# Kill and restart
ng serve --port 4201
```

### Síntoma: Gráficas siguen en blanco
```bash
# Check browser console (F12)
# Ver si hay errores de ng2-charts
# Verificar que BaseChartDirective esté importado
```

### Síntoma: Validación de préstamos no funciona
```bash
# F12 → Network → POST /api/v1/predictions/predict_churn
# Ver response status: 200 OK = backend correctamente
```

---

## 🚀 Próximos Pasos

- [ ] Todos los tests pasan ✅
- [ ] Documentar resultados
- [ ] Integración con PDF (futuro)
- [ ] Deploy a producción

**¡Éxito! 🎉**
