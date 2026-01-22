# 🚨 SOLUCIONAR PROBLEMA DOCKER - Windows PowerShell

## Problema
```
ERROR: error during connect: Head "http://%2F%2F.%2Fpipe%2FdockerDesktopLinuxEngine/_ping": 
open //./pipe/dockerDesktopLinuxEngine: The system cannot find the file specified.
```

---

## ✅ SOLUCIÓN RÁPIDA (3 pasos)

### Paso 1: Verificar que Docker está corriendo
```powershell
# En PowerShell, ejecuta:
docker ps

# Si ves error "Cannot connect", continúa al paso 2
```

### Paso 2: Iniciar Docker Desktop
```
1. Presiona Windows + S
2. Escribe "Docker"
3. Abre "Docker Desktop"
4. Espera a ver el mensaje: ✓ "Docker is running"
5. Esto puede tardar 30-60 segundos
```

### Paso 3: Verificar nuevamente
```powershell
# En PowerShell, espera 30 segundos después de ver "Docker is running", luego:
docker ps

# Debe retornar:
# CONTAINER ID   IMAGE     COMMAND
# (vacío - está bien)
```

---

## 🔄 AHORA SÍ: Usar Docker

```powershell
# Desde raíz del proyecto
cd c:\Repositorios\ChurnInsight

# Build imágenes (primera vez, puede tardar 5-10 min)
docker-compose build

# Ejecutar servicios
docker-compose up -d

# Verificar que están corriendo
docker-compose ps

# Resultado esperado:
# NAME                 STATUS
# churninsight-ai      Up 10 seconds (healthy)
# churninsight-backend Up 8 seconds (healthy)
```

---

## 🧪 TESTING (verificar que funciona)

### Test AI Service
```powershell
curl http://localhost:8000/api/v1/health/check
# Respuesta esperada: {"status":"healthy",...}
```

### Test Backend
```powershell
curl http://localhost:8080/api/v1/companies/health
# Respuesta esperada: {"service":"Company Service",...}
```

---

## 🛑 DETENER SERVICIOS

```powershell
docker-compose down

# Verificar que se detuvo
docker ps
# Debe estar vacío
```

---

## ❓ SI AÚN NO FUNCIONA

### Reiniciar Docker completamente
```powershell
# 1. Cerrar Docker Desktop completamente
# 2. Esperar 10 segundos
# 3. Abrir Docker Desktop de nuevo
# 4. Esperar a ver "Docker is running"
# 5. Intentar de nuevo:
docker ps
```

### Limpiar todo y empezar de cero
```powershell
# CUIDADO: Esto elimina imágenes y contenedores
docker-compose down -v
docker system prune -a

# Luego:
docker-compose build
docker-compose up -d
```

---

## 📞 REFERENCIAS

- **Guía completa**: [DOCKER_GUIDE.md](DOCKER_GUIDE.md)
- **Testing completo**: [docs/08_Testing_Local_Complete.md](docs/08_Testing_Local_Complete.md)
- **Docker Desktop**: https://www.docker.com/products/docker-desktop

---

**¿Funciona ahora?** ✅  
Si sí → Continúa con merger de ramas frontend  
Si no → Revisar DOCKER_GUIDE.md sección "Troubleshooting"
