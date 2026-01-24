# 🧪 Testing Interactivo - Validación de Préstamos

**Fecha**: 24 de Enero, 2026  
**Objetivo**: Verificar que la lógica de préstamos funciona correctamente

---

## 📋 Instrucciones Pre-Testing

### 1. Inicia el Backend (Terminal 1)
```bash
cd backend
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```
**Espera**: Hasta ver `Tomcat started on port(s): 8080`

### 2. Inicia el AI Service (Terminal 2)
```bash
cd ai_service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python train_model.py
python -m uvicorn main:app --port 8000 --reload
```
**Espera**: Hasta ver `Application startup complete`

### 3. Inicia el Frontend (Terminal 3)
```bash
cd frontend
ng serve --port 4200
```
**Espera**: Hasta ver `✔ Compiled successfully`

### 4. Abre la Aplicación
- URL: http://localhost:4200
- Usuario/Contraseña: cualquier cosa (modo desarrollo)
- Ve a: **Nueva Predicción** → **Predictor**

---

## ✅ TEST 1: Caso Válido Básico

### Objetivo
Verificar que un caso simple funciona sin errores

### Pasos
1. Completa **Sección 1** (Perfil):
   - CUIT: `20123456789`
   - Empresa: `TestCorp`
   - Sector: `Fintech`
   - Provincia: `Buenos Aires`
   - ✅ Click en **Siguiente**

2. Completa **Sección 2** (Financiero):
   - Ingresos: `1000000`
   - Gastos: `800000`
   - Deuda: `200000`
   - Activos: `1500000`

3. Campos de Crédito (CASO SIMPLE):
   ```
   Solicitados:  3
   Aprobados:    2
   Vigentes:     1
   Cancelados:   (se auto-llena con 1)
   ```

4. Rest de Financiero:
   - Ticket Prom. Solicitado: `100000`
   - Ticket Prom. Aprobado: `100000`
   - Monto Solicitado: `300000`
   - Monto Aprobado: `200000`
   - Tiempo Cancelación: `30`

5. ✅ Click en **Siguiente**

### Resultado Esperado
- ✅ Sin errores en rojo
- ✅ Borde de campos verde/gris
- ✅ Avanza a Sección 3

---

## ❌ TEST 2: Aprobados > Solicitados

### Objetivo
Verificar que se rechaza cuando APROBADOS > SOLICITADOS

### Pasos
1. Llena Sección 1 ✅
2. En Sección 2, Crédito:
   ```
   Solicitados:  5
   Aprobados:    7  ← MÁS DE LO SOLICITADO
   Vigentes:     2
   Cancelados:   (auto)
   ```

3. Intenta avanzar con **Siguiente**

### Resultado Esperado
- ❌ **Campo "Préstamos Aprobados" en rojo**
- ❌ **Error**: "No puede ser mayor a Solicitados (5)"
- ❌ **NO avanza** a siguiente sección
- ✅ Console muestra: `Validación fallida para la sección: 2`

### Corrección
1. Cambia Aprobados a `5` (≤ Solicitados)
2. Ver que Cancelados se recalcula automáticamente
3. ✅ Ahora puedes avanzar

---

## ❌ TEST 3: Vigentes > Aprobados

### Objetivo
Verificar que se rechaza cuando VIGENTES > APROBADOS

### Pasos
1. Llena Sección 1 ✅
2. En Sección 2, Crédito:
   ```
   Solicitados:  10
   Aprobados:    4
   Vigentes:     6  ← MÁS DE LO APROBADO
   Cancelados:   (auto)
   ```

3. Intenta avanzar

### Resultado Esperado
- ❌ **Campo "Préstamos Vigentes" en rojo**
- ❌ **Error**: "No puede ser mayor a Aprobados (4)"
- ❌ **NO avanza**
- ✅ Console muestra: `Validación fallida para la sección: 2`

### Corrección
1. Cambia Vigentes a `3` (< Aprobados)
2. Ver que Cancelados se recalcula a `1` (4-3)
3. ✅ Ahora puedes avanzar

---

## 🔄 TEST 4: Auto-Cálculo de Cancelados

### Objetivo
Verificar que CANCELADOS se auto-calcula correctamente

### Pasos
1. Llena Sección 1 ✅
2. En Sección 2, Crédito:
   ```
   Solicitados:  6
   Aprobados:    5
   Vigentes:     2
   ```

3. **ANTES** de tocar el campo Cancelados, observa:

### Resultado Esperado
- ✅ Campo "Cancelados" se llena automáticamente con `3` (5-2)
- ✅ Campo está deshabilitado (gris, con badge "Auto-calculado")
- ✅ No puedes editarlo

### Cambios Dinámicos
1. Cambia Vigentes a `1`:
   - ✅ Cancelados se recalcula a `4` (5-1)

2. Cambia Aprobados a `4`:
   - ✅ Cancelados se recalcula a `3` (4-1)

3. Cambia Vigentes a `3`:
   - ✅ Cancelados se recalcula a `1` (4-3)

---

## ✅ TEST 5: Casos Extremos

### Caso A: Sin Préstamos
```
Solicitados:  0
Aprobados:    0
Vigentes:     0
Cancelados:   0 (auto)
```
**Esperado**: ✅ Válido, sin errores

### Caso B: Todo Cancelado
```
Solicitados:  5
Aprobados:    5
Vigentes:     0
Cancelados:   5 (auto)
```
**Esperado**: ✅ Válido, sin errores

### Caso C: Ninguno Aprobado
```
Solicitados:  10
Aprobados:    0
Vigentes:     0
Cancelados:   0 (auto)
```
**Esperado**: ✅ Válido, sin errores

---

## 🎯 TEST 6: Flujo Completo (Final)

### Objetivo
Completar una predicción exitosa

### Pasos

**Sección 1: Perfil**
```
CUIT:         20748123114
Empresa:      ChurnInsight Fintech
Sector:       Fintech
Provincia:    Buenos Aires
```

**Sección 2: Financiero**
```
Ingresos:     2500000
Gastos:       1500000
Deuda:        500000
Activos:      3000000

Solicitados:  4
Aprobados:    3
Vigentes:     1
Cancelados:   2 (auto-calculado)

Ticket Prom Solicitado: 150000
Ticket Prom Aprobado:   150000
Monto Solicitado:       600000
Monto Aprobado:         450000
Tiempo Cancelación:     45
```

**Sección 3: Engagement**
```
Días Actividad:  85
Días Inactividad: 5 (auto-calculado)

Total Logins:    765
Promedio Logins: 8.5 (auto-calculado)
```

**Servicios** (toggle todos ON):
- ✓ Transferencias
- ✓ Pagos
- ✓ Créditos
- ✓ Inversiones

### Resultado Esperado
- ✅ Todas las secciones válidas
- ✅ Click en **"Enviar Predicción"**
- ✅ Carga ~ 2-3 segundos
- ✅ Se abre modal con resultados
- ✅ Modal muestra:
  - Datos de empresa
  - Probabilidad de churn
  - Red flags (si aplica)
  - 3 gráficos (riesgo, crédito, financiero)
- ✅ Botones en modal: Cerrar, Nueva Predicción

---

## 🔧 Debugging: Si Algo Sale Mal

### Paso 1: Abre Console (F12)
```
Presiona: F12
Tab: Console
```

### Paso 2: Busca Errores
```javascript
// Deberías ver:
✅ "Validación fallida para la sección: X" (si hay error de validación)
✅ "Predicción completada" (si fue exitoso)
❌ "Error en predicción:" (si falló)
```

### Paso 3: Verifica Network
```
Tab: Network
Busca: POST /api/v1/predictions/predict_churn
Estado: 200 OK (si fue exitoso)
```

### Paso 4: Si Falla Backend
```
Error: "Cannot POST /api/v1/predictions/predict_churn"
Solución: Verifica que AI Service está corriendo en puerto 8000
Terminal 2: Ver que dice "Application startup complete"
```

---

## ✨ Checklist Final

Marca cada test como completado:

- [ ] TEST 1: Caso Válido Básico ✅
- [ ] TEST 2: Aprobados > Solicitados ❌
- [ ] TEST 3: Vigentes > Aprobados ❌
- [ ] TEST 4: Auto-Cálculo ✅
- [ ] TEST 5: Casos Extremos ✅
- [ ] TEST 6: Flujo Completo ✅

**Resultado Final**:
- [ ] Todos los tests pasaron ✅
- [ ] Documentación actualizada ✅
- [ ] Listo para producción 🚀

---

## 📞 Notas

- Si hay errores, consulta la consola (F12)
- Si no está claro qué cambió, revisa `LOAN_VALIDATION_GUIDE.md`
- Los errores se muestran en **rojo debajo del campo**
- Los auto-cálculos se muestran en **azul** con badge "Auto-calculado"

¡Éxito en el testing! 🎉
