# 📋 Guía de Validación de Préstamos - ChurnInsight

**Última actualización**: 24 de Enero, 2026  
**Versión**: 2.0 - Corregida lógica de auto-cálculo

---

## 🎯 Estructura de Validación

### Fórmula Base
```
SOLICITADOS >= APROBADOS >= VIGENTES + CANCELADOS
```

### Campos: ¿Cuál ingresa el usuario? ¿Cuál se auto-calcula?

| Campo | Tipo | Descripción |
|-------|------|-------------|
| **Préstamos Solicitados** | 👤 **Usuario ingresa** | Cantidad total solicitada (clave principal) |
| **Préstamos Aprobados** | 👤 **Usuario ingresa** | Cantidad aprobada por el banco |
| **Préstamos Vigentes** | 👤 **Usuario ingresa** | Préstamos actualmente activos (no cancelados) |
| **Préstamos Cancelados** | 🤖 **Auto-calculado** | Se calcula: `APROBADOS - VIGENTES` |

---

## ✅ Reglas de Validación

### Regla 1: Aprobados ≤ Solicitados
```typescript
if (APROBADOS > SOLICITADOS) {
  ❌ ERROR: "No puede ser mayor a Solicitados (X)"
}
```
**Ejemplo:**
- Solicitados: 5
- Aprobados: 7 ← ❌ INVÁLIDO (aprobaron más de lo que pidió)

### Regla 2: Vigentes ≤ Aprobados
```typescript
if (VIGENTES > APROBADOS) {
  ❌ ERROR: "No puede ser mayor a Aprobados (X)"
}
```
**Ejemplo:**
- Aprobados: 3
- Vigentes: 5 ← ❌ INVÁLIDO (hay más vigentes que aprobados)

### Regla 3: Cancelados = Aprobados - Vigentes
```typescript
CANCELADOS_CALCULADO = APROBADOS - VIGENTES

// Si el resultado es diferente al ingresado, se auto-ajusta
```
**Ejemplo:**
- Aprobados: 5
- Vigentes: 2
- Cancelados auto-calculado: `5 - 2 = 3`
- Si ingresó 3: ✅ Correcto (se mantiene)
- Si ingresó 2: 🔄 Se auto-ajusta a 3

### Regla 4: Cancelados ≤ Aprobados
```typescript
if (CANCELADOS > APROBADOS) {
  ❌ ERROR: "No puede ser mayor a Aprobados (X)"
}
```
**Ejemplo:**
- Aprobados: 4
- Cancelados: 6 ← ❌ INVÁLIDO (no puede haber más cancelados que aprobados)

---

## 📝 Casos de Uso Válidos

### Caso 1: Empresa Sana (Todo Cancelado)
```
Solicitados:  5
Aprobados:    5
Vigentes:     0
Cancelados:   5 (auto-calculado: 5 - 0 = 5) ✅
```

### Caso 2: Empresa con Crédito Vigente
```
Solicitados:  10
Aprobados:    6
Vigentes:     2
Cancelados:   4 (auto-calculado: 6 - 2 = 4) ✅
```

### Caso 3: Empresa Rechazada (Pocos Aprobados)
```
Solicitados:  8
Aprobados:    2
Vigentes:     1
Cancelados:   1 (auto-calculado: 2 - 1 = 1) ✅
```

### Caso 4: Empresa Sin Préstamos
```
Solicitados:  0
Aprobados:    0
Vigentes:     0
Cancelados:   0 (auto-calculado: 0 - 0 = 0) ✅
```

---

## ❌ Casos de Uso Inválidos

### Caso 1: Aprobados > Solicitados
```
Solicitados:  5
Aprobados:    7  ← ERROR: "No puede ser mayor a Solicitados (5)"
Vigentes:     2
Cancelados:   ? (no se procesa)
```

### Caso 2: Vigentes > Aprobados
```
Solicitados:  10
Aprobados:    3
Vigentes:     5  ← ERROR: "No puede ser mayor a Aprobados (3)"
Cancelados:   ? (no se procesa)
```

### Caso 3: Inconsistencia Total
```
Solicitados:  5
Aprobados:    8  ← ERROR: "No puede ser mayor a Solicitados (5)"
Vigentes:     3  (No se valida hasta que APROBADOS sea correcto)
Cancelados:   ?  (No se procesa)
```

---

## 🔧 Flujo de Ingreso Recomendado

### Paso 1: Ingresa Solicitados
```
Ingresa: Préstamos Solicitados = 6
```

### Paso 2: Ingresa Aprobados (≤ Solicitados)
```
Ingresa: Préstamos Aprobados = 4
Validación: 4 ≤ 6 ✅
```

### Paso 3: Ingresa Vigentes (≤ Aprobados)
```
Ingresa: Préstamos Vigentes = 1
Validación: 1 ≤ 4 ✅
```

### Paso 4: Sistema Calcula Cancelados
```
Sistema calcula: Cancelados = 4 - 1 = 3
El campo se rellena automáticamente: 3 ✅
```

---

## 💡 Tips de Uso

### ✅ Ingresa Primero
1. **Solicitados** (el número que pidió)
2. **Aprobados** (el que le aprobaron, máximo = Solicitados)
3. **Vigentes** (cuántos sigue activos, máximo = Aprobados)
4. **Cancelados** se rellena solo automáticamente

### 🚫 No Hagas
- ❌ Ingresar APROBADOS > SOLICITADOS
- ❌ Ingresar VIGENTES > APROBADOS
- ❌ Ingresar CANCELADOS > APROBADOS
- ❌ Editar el campo CANCELADOS (está deshabilitado, se auto-calcula)

### 🔄 Si Necesitas Cambiar
- Si cambias **Aprobados** o **Vigentes**: **CANCELADOS** se recalcula automáticamente
- Si quieres cambiar **Cancelados**: primero cambia **Vigentes** (la diferencia)
  - Ejemplo: Si quieres CANCELADOS=2 pero tienes APROBADOS=5:
    - Ajusta VIGENTES a 3 (porque 5-3=2)
    - CANCELADOS se auto-ajusta a 2

---

## 🛠️ Mensajes de Error (Nuevos)

| Error | Significado | Solución |
|-------|-------------|----------|
| "No puede ser mayor a Solicitados (X)" | Aprobados > Solicitados | Reduce Aprobados ≤ Solicitados |
| "No puede ser mayor a Aprobados (X)" | Vigentes > Aprobados | Reduce Vigentes ≤ Aprobados |
| "Este campo es obligatorio" | Campo vacío | Completa todos los campos |

---

## 📊 Ejemplos Reales

### Empresa Fintech 1: FinStart SRL
```
Contexto: Startup con créditos vigentes
Solicitados:  3 préstamos
Aprobados:    2 préstamos
Vigentes:     1 préstamo (activo en pago)
Cancelados:   1 préstamo (completado)
```
**Validación**: 3 ≥ 2 ✓, 2 ≥ 1 ✓, 2 = 1+1 ✓ → ✅ VÁLIDO

### Empresa Fintech 2: CreditCorp
```
Contexto: Empresa rechazada por banco
Solicitados:  10 préstamos
Aprobados:    2 préstamos
Vigentes:     0 préstamos
Cancelados:   2 préstamos
```
**Validación**: 10 ≥ 2 ✓, 2 ≥ 0 ✓, 2 = 0+2 ✓ → ✅ VÁLIDO

### Empresa Fintech 3: LoanFail
```
Contexto: Datos inconsistentes
Solicitados:  5 préstamos
Aprobados:    7 préstamos ← Más de lo que pidió
Vigentes:     2 préstamos
Cancelados:   ?
```
**Validación**: 5 ≥ 7 ✗ → ❌ ERROR: "No puede ser mayor a Solicitados (5)"

---

## 🔍 Debugging: Cómo Saber Qué Está Mal

### Si No Puedes Avanzar a Siguiente Sección:

1. **Abre la consola del navegador** (F12)
2. **Busca el warning**: `Validación fallida para la sección: 2`
3. **Identifica qué campo tiene error** (ver borde rojo)
4. **Lee el mensaje de error debajo del campo**
5. **Sigue la solución sugerida**

### Ejemplo de Diagnóstico:
```
❌ Veo borde rojo en "Préstamos Aprobados"
❌ Mensaje dice: "No puede ser mayor a Solicitados (5)"
✅ Solución: Cambio Aprobados de 7 a 5
✅ El borde se pone verde
✅ Ahora puedo avanzar
```

---

## 🎓 Resumen Rápido

```
┌─────────────────────────────────────────────────┐
│  ESTRUCTURA: SOLICITADOS ≥ APROBADOS ≥ VIGENTES │
│                                                 │
│  Usuario ingresa (3):                           │
│  ✓ Solicitados (cantidad pedida)                │
│  ✓ Aprobados (cantidad aprobada ≤ Solicitados)  │
│  ✓ Vigentes (cantidad activa ≤ Aprobados)       │
│                                                 │
│  Sistema calcula (1):                           │
│  ✓ Cancelados = Aprobados - Vigentes            │
│                                                 │
│  Resultado esperado:                            │
│  ✓ Cancelados + Vigentes = Aprobados            │
└─────────────────────────────────────────────────┘
```

---

## 🚀 Versiones

| Versión | Cambio |
|---------|--------|
| 1.0 | Versión inicial (con error: vigentes era auto-calculado) |
| **2.0** | ✅ **CORREGIDA**: Vigentes ahora es manual, Cancelados es auto-calculado |

---

**¿Preguntas?** Consulta los ejemplos o abre la consola (F12) para ver logs detallados.
