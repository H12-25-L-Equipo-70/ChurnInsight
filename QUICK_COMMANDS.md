# ⚡ QUICK COMMANDS - ChurnInsight

## 🚀 Inicio Rápido (Local)

### Opción 1: Con Docker (Recomendado)
```bash
# Ir a raíz del proyecto
cd ChurnInsight

# Construir imágenes
docker-compose build

# Iniciar servicios
docker-compose up -d

# Verificar estado
docker-compose ps

# Ver logs
docker-compose logs -f

# Detener
docker-compose down
```

### Opción 2: Ejecución Local (Sin Docker)

#### Backend (Spring Boot)
```bash
cd backend

# Compilar
mvn clean package -DskipTests

# Ejecutar
java -jar target/churninsight-*.jar

# O con Maven directo
mvn spring-boot:run
```

#### AI Service (FastAPI)
```bash
cd ai_service

# Crear venv (primera vez)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
pip install -r requirements.txt

# Entrenar modelo
python train_model.py

# Ejecutar servidor
python -m uvicorn main:app --reload --port 8000
```

---

## 📡 API Testing Quick Reference

### Backend (Puerto 8080)

```bash
# Health check
curl http://localhost:8080/api/v1/companies/health

# Listar empresas
curl http://localhost:8080/api/v1/companies

# Crear empresa
curl -X POST http://localhost:8080/api/v1/companies \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "20123456789",
    "razonSocial": "Tech Company",
    "ingresos": 150000,
    "gastos": 100000,
    "margenOperacional": 0.30,
    "deuda": 50000,
    "deudaBancaria": 20000,
    "tasaEndeudamiento": 0.40,
    "diasVentaPendiente": 45,
    "diasPagoPromedio": 60,
    "margenNeto": 0.20,
    "actividadTransaccional": 25,
    "edadEmpresa": 5,
    "numeroProductos": 3
  }'
```

### AI Service (Puerto 8000)

```bash
# Health check
curl http://localhost:8000/api/v1/health/check

# Model info
curl http://localhost:8000/api/v1/health/model-info

# Predicción individual
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": 20123456789,
    "ingresos": 150000,
    "gastos": 100000,
    "margen_operacional": 0.30,
    "deuda": 50000,
    "deuda_bancaria": 20000,
    "tasa_endeudamiento": 0.40,
    "dias_venta_pendiente": 45,
    "dias_pago_promedio": 60,
    "margen_neto": 0.20,
    "actividad_transaccional": 25,
    "edad_empresa": 5,
    "numero_productos": 3
  }'

# Predicción en batch
curl -X POST http://localhost:8000/api/v1/predictions/batch \
  -H "Content-Type: application/json" \
  -d '{
    "predictions": [
      {
        "cuit": 20111111111,
        "ingresos": 100000,
        "gastos": 80000,
        "margen_operacional": 0.25,
        "deuda": 30000,
        "deuda_bancaria": 15000,
        "tasa_endeudamiento": 0.30,
        "dias_venta_pendiente": 30,
        "dias_pago_promedio": 45,
        "margen_neto": 0.15,
        "actividad_transaccional": 20,
        "edad_empresa": 3,
        "numero_productos": 2
      },
      {
        "cuit": 20222222222,
        "ingresos": 200000,
        "gastos": 120000,
        "margen_operacional": 0.40,
        "deuda": 80000,
        "deuda_bancaria": 40000,
        "tasa_endeudamiento": 0.40,
        "dias_venta_pendiente": 60,
        "dias_pago_promedio": 75,
        "margen_neto": 0.25,
        "actividad_transaccional": 30,
        "edad_empresa": 7,
        "numero_productos": 5
      }
    ]
  }'

# Por nivel de riesgo
curl http://localhost:8000/api/v1/predictions/by-risk-level/alto
curl http://localhost:8000/api/v1/predictions/by-risk-level/medio
curl http://localhost:8000/api/v1/predictions/by-risk-level/bajo
```

### Documentación Interactiva

```bash
# Swagger Backend (si está habilitado)
# http://localhost:8080/swagger-ui.html

# Swagger AI
# http://localhost:8000/docs

# ReDoc AI
# http://localhost:8000/redoc

# OpenAPI JSON
# http://localhost:8000/openapi.json
```

---

## 🐳 Docker Commands

```bash
# Ver estado de servicios
docker-compose ps

# Ver logs de todos
docker-compose logs

# Ver logs de un servicio
docker-compose logs backend
docker-compose logs ai

# Seguimiento en tiempo real
docker-compose logs -f

# Solo últimas N líneas
docker-compose logs --tail=50

# Logs de una línea de tiempo
docker-compose logs --since=10m

# Entrar a contenedor (bash)
docker exec -it churninsight-backend bash
docker exec -it churninsight-ai bash

# Ejecutar comando en contenedor
docker exec churninsight-ai python --version
docker exec churninsight-backend java -version

# Ver estadísticas
docker stats

# Ver detalles de un contenedor
docker inspect churninsight-ai

# Reiniciar servicio
docker-compose restart backend
docker-compose restart ai

# Rebuild y reiniciar
docker-compose up -d --build

# Limpiar todo
docker-compose down -v
docker system prune -a
```

---

## 📊 Monitoreo y Debug

```bash
# Verificación completa
echo "=== Backend ===" && \
curl -s http://localhost:8080/api/v1/companies/health | jq . && \
echo "=== AI Service ===" && \
curl -s http://localhost:8000/api/v1/health/check | jq .

# Test de conectividad a BD (desde AI)
docker exec churninsight-ai python -c "
import oracledb
try:
    conn = oracledb.connect(os.getenv('ORACLE_USER'),
                           os.getenv('ORACLE_PASSWORD'),
                           os.getenv('ORACLE_HOST'))
    print('✅ Conectado a Oracle')
except Exception as e:
    print(f'❌ Error: {e}')
"

# Ver estadísticas de recursos
docker stats --no-stream

# Benchmark de predicciones
# Pequeño script Python
cat > test_perf.py << 'EOF'
import requests
import time

url = "http://localhost:8000/api/v1/predictions/predict"
payload = {
    "cuit": 20123456789,
    "ingresos": 150000,
    "gastos": 100000,
    "margen_operacional": 0.30,
    "deuda": 50000,
    "deuda_bancaria": 20000,
    "tasa_endeudamiento": 0.40,
    "dias_venta_pendiente": 45,
    "dias_pago_promedio": 60,
    "margen_neto": 0.20,
    "actividad_transaccional": 25,
    "edad_empresa": 5,
    "numero_productos": 3
}

start = time.time()
for i in range(100):
    r = requests.post(url, json=payload)
    assert r.status_code == 200
end = time.time()

print(f"100 predicciones en {end-start:.2f}s")
print(f"Promedio: {(end-start)/100*1000:.2f}ms por predicción")
EOF

python test_perf.py
```

---

## 🔧 Configuración Rápida

### Variables de Entorno

```bash
# Crear archivo .env desde ejemplo
cp .env.example .env

# Editar con credenciales reales
nano .env

# Verificar variables críticas
grep ORACLE_ .env
grep ENVIRONMENT .env
```

### Entrenar Modelo Localmente

```bash
cd ai_service

# Asegurarse que dataset existe
ls data/dataset_empresas_fintech_v2.7.csv

# Entrenar
python train_model.py

# Verificar modelo
ls -la models/
# Debe mostrar:
# - churn_model.pkl
# - scaler.pkl
```

---

## 🚀 Deploy a Oracle Cloud

### Comandos de Setup OCI

```bash
# SSH a instancia
ssh -i your-key.pem ubuntu@your-instance-ip

# Clonar repo
git clone https://github.com/YOUR-ORG/ChurnInsight.git
cd ChurnInsight

# Configurar credenciales
nano .env  # Editar con datos reales

# Build
docker-compose build

# Run
docker-compose up -d

# Verificar
docker-compose ps
curl http://localhost:8000/api/v1/health/check
```

---

## 🧪 Testing Rápido

### Test Script Bash

```bash
#!/bin/bash

echo "🧪 Testing ChurnInsight..."

# Test Backend
echo -n "Backend: "
if curl -s http://localhost:8080/api/v1/companies/health | grep -q "UP"; then
    echo "✅"
else
    echo "❌"
fi

# Test AI
echo -n "AI Service: "
if curl -s http://localhost:8000/api/v1/health/check | grep -q "healthy"; then
    echo "✅"
else
    echo "❌"
fi

# Test Predicción
echo -n "Predicción: "
result=$(curl -s -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d '{"cuit":20123456789,"ingresos":150000,"gastos":100000,"margen_operacional":0.30,"deuda":50000,"deuda_bancaria":20000,"tasa_endeudamiento":0.40,"dias_venta_pendiente":45,"dias_pago_promedio":60,"margen_neto":0.20,"actividad_transaccional":25,"edad_empresa":5,"numero_productos":3}')
if echo $result | grep -q "probability"; then
    echo "✅"
else
    echo "❌"
fi

echo "Done!"
```

### Test con Python

```python
import requests
import json

base_url = "http://localhost:8000/api/v1"

# Health check
print("Testing health...")
r = requests.get(f"{base_url}/health/check")
print(f"Status: {r.status_code}")
print(json.dumps(r.json(), indent=2))

# Model info
print("\nTesting model info...")
r = requests.get(f"{base_url}/health/model-info")
print(f"Status: {r.status_code}")
print(json.dumps(r.json(), indent=2))

# Prediction
print("\nTesting prediction...")
payload = {
    "cuit": 20123456789,
    "ingresos": 150000,
    "gastos": 100000,
    "margen_operacional": 0.30,
    "deuda": 50000,
    "deuda_bancaria": 20000,
    "tasa_endeudamiento": 0.40,
    "dias_venta_pendiente": 45,
    "dias_pago_promedio": 60,
    "margen_neto": 0.20,
    "actividad_transaccional": 25,
    "edad_empresa": 5,
    "numero_productos": 3
}
r = requests.post(f"{base_url}/predictions/predict", json=payload)
print(f"Status: {r.status_code}")
print(json.dumps(r.json(), indent=2))
```

---

## 📝 Logs y Debugging

```bash
# Ver todos los logs
docker-compose logs

# Ver logs en tiempo real
docker-compose logs -f

# Filtrar por servicio
docker-compose logs backend
docker-compose logs ai

# Filtrar por palabra clave
docker-compose logs | grep -i error
docker-compose logs | grep -i oracle

# Exportar logs a archivo
docker-compose logs > all_logs.txt
docker logs churninsight-ai > ai_logs.txt

# Ver logs de aplicación (si están en volúmenes)
ls -la backend/logs/
ls -la ai_service/logs/

cat backend/logs/application.log | tail -100
cat ai_service/logs/churn_service.log | tail -100
```

---

## 🚨 Troubleshooting Rápido

```bash
# ¿Puertos en uso?
lsof -i :8080
lsof -i :8000

# ¿Docker no responde?
sudo systemctl restart docker

# ¿Conexión a Oracle fallida?
docker logs churninsight-ai | grep -i oracle

# ¿Modelo no cargado?
docker exec churninsight-ai ls -la models/

# ¿Wallet no encontrado?
docker exec churninsight-ai ls -la /app/backend/wallet_pymer/

# Limpiar todo y reiniciar
docker-compose down -v
rm -rf ai_service/models/*.pkl
docker-compose build --no-cache
docker-compose up -d
```

---

## 📚 Documentación

- 📄 README_PROJECT.md - Overview
- 📄 EXECUTIVE_SUMMARY.md - Resumen ejecutivo
- 📄 ORACLE_CLOUD_DEPLOYMENT.md - Guía deployment
- 📄 DEPLOYMENT_CHECKLIST.md - Checklist pre-deployment
- 📄 backend/README.md - Backend details
- 📄 ai_service/README_AI.md - AI Service details
- 📄 ai_service/API_DOCUMENTATION.md - API reference

---

## ✨ Alias Útiles (Guardar en ~/.bashrc o ~/.zshrc)

```bash
alias churn-start="cd ~/ChurnInsight && docker-compose up -d"
alias churn-stop="cd ~/ChurnInsight && docker-compose down"
alias churn-logs="cd ~/ChurnInsight && docker-compose logs -f"
alias churn-status="cd ~/ChurnInsight && docker-compose ps"
alias churn-health="curl -s http://localhost:8000/api/v1/health/check | jq"
alias churn-test="bash ~/ChurnInsight/test_endpoints.sh"
```

---

**Última actualización**: 2024
**Versión**: 1.0
