# ChurnInsight Frontend

Aplicación web para predecir el riesgo de abandono (churn) de clientes Pyme en fintech.

**Stack:** Angular 21 + TypeScript 5.9 + Tailwind CSS + Reactive Forms + Signals

---

## 🚀 Inicio Rápido

### Opción 1: Docker (Recomendado)

```bash
# Construir la imagen
docker build -t churninsight:latest .

# Ejecutar el contenedor
docker run -d -p 3000:80 --name churninsight churninsight:latest

# Abrir en navegador
# http://localhost:3000
```

### Opción 2: Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
ng serve
# o
npm start

# Navegador: http://localhost:4200
```

### Opción 3: Build + Servidor Estático

```bash
# Compilar
npm run build

# Servir estáticamente
npm install -g http-server
http-server dist/frontend/browser -p 8080

# Navegador: http://localhost:8080
```

---

## 📝 Prueba Rápida

Cuando abras la app, verás un formulario de 3 secciones. **Copia y pega estos datos:**

| Campo | Valor |
|-------|-------|
| CUIT | `20123456789` |
| Empresa | `Fintech Saludable SA` |
| Sector | `Tecnología` |
| Provincia | `Buenos Aires` |
| Ingresos | `5000000` |
| Gastos | `2000000` |
| Deuda | `800000` |
| Activos | `7000000` |
| Préstamos Solicitados | `5` |
| Préstamos Aprobados | `5` |
| Días Activos | `75` |
| Logins | `120` |
| Servicios | ✓ Todos los 4 |

**Resultado esperado:** 🟢 **RIESGO BAJO** (5-20% churn)

---

## 📊 Arquitectura

### Componentes
- **PredictionFormComponent** - Formulario progresivo de 3 secciones
- **ResultsPanelComponent** - Visualización de resultados con exportación

### Servicios
- **PredictionService** - Lógica de predicción con algoritmo de 5 factores
- **ExportService** - Exportación a CSV/JSON y clipboard

### Models
- **churn.interface.ts** - 11 interfaces TypeScript con tipos strict

### Estilos
- **Tailwind CSS v3** - Diseño responsive, mobile-first
- **SCSS** - Variables de color fintech

---

## 🧪 Testing

### Con npm
```bash
npm test
```

### Datos de Prueba

**Escenario 1: Bajo Riesgo**
```
CUIT: 20123456789
Ingresos: 5M | Gastos: 2M | Préstamos: 100%
Actividad: 83% | Servicios: 4/4
→ Resultado: 🟢 5-20%
```

**Escenario 2: Riesgo Medio**
```
CUIT: 20987654321
Ingresos: 2.5M | Gastos: 2M | Préstamos: 33%
Actividad: 50% | Servicios: 2/4
→ Resultado: 🟡 30-70%
```

**Escenario 3: Alto Riesgo**
```
CUIT: 20111222333
Ingresos: 0.8M | Gastos: 0.9M | Préstamos: 17%
Actividad: 17% | Servicios: 0/4
→ Resultado: 🔴 70-100%
```

---

## 🐳 Docker Cheatsheet

```bash
# Listar contenedores
docker ps

# Ver logs
docker logs churninsight

# Detener
docker stop churninsight

# Eliminar
docker rm churninsight

# Reconstruir sin cache
docker build --no-cache -t churninsight:latest .
```

---

## 🛠️ Desarrollo

### Requisitos
- Node.js 20+
- Angular CLI 21+
- Docker (opcional)

### Comandos npm
```bash
npm install          # Instalar dependencias
npm start            # Servidor dev (puerto 4200)
npm run build        # Build producción
npm test             # Ejecutar tests
npm run lint         # Validar código
```

---

## 📦 Dependencias Clave
- `@angular/core@21.0.0`
- `rxjs@7.8.0`
- `tailwindcss@3.4.1`
- `typescript@5.9.0`

---

## 🔗 URLs

| Ambiente | URL | Puerto |
|----------|-----|--------|
| Docker | http://localhost:3000 | 3000 |
| Dev Local | http://localhost:4200 | 4200 |
| Build Estático | http://localhost:8080 | 8080 |

---

## ✅ Checklist

- [ ] App inicia correctamente
- [ ] Prueba Escenario 1 (Bajo riesgo)
- [ ] Prueba Escenario 2 (Medio riesgo)
- [ ] Prueba Escenario 3 (Alto riesgo)
- [ ] Descarga CSV funciona
- [ ] Descarga JSON funciona
- [ ] Copiar al portapapeles funciona
- [ ] Responsive en mobile

---

## 📝 Notas

- La predicción usa un **algoritmo mock** de 1.5s delay
- Los resultados se calculan basados en 5 factores: engagement, margen, deuda, aprobaciones de crédito, servicios
- Todos los datos son **validados** en tiempo real (CUIT 11 dígitos, rangos, etc.)
- **Sin dependencias de backend** actualmente (listo para integrar API)

---

## 🎨 Diseño Fintech

**Colores:**
- 🔵 Azul Medianoche (#1e293b) - Botones
- 🟢 Esmeralda (#10b981) - Riesgo BAJO
- 🟡 Ámbar (#f59e0b) - Riesgo MEDIO
- 🔴 Rojo (#ef4444) - Riesgo ALTO

---

**Desarrollado para Pymer - Fintech Argentina**
