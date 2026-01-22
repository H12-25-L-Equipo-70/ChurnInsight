#!/bin/bash

# Script de prueba de endpoints del AI Service
# Ejecutar: bash test_endpoints.sh

BASE_URL="http://localhost:8000/api/v1"
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ChurnInsight AI Service - Test Suite${NC}"
echo -e "${BLUE}========================================${NC}\n"

# Test 1: Health Check
echo -e "${YELLOW}[TEST 1] Health Check${NC}"
curl -s "$BASE_URL/health/check" | python -m json.tool
echo -e "\n"

# Test 2: Model Info
echo -e "${YELLOW}[TEST 2] Model Info${NC}"
curl -s "$BASE_URL/health/model-info" | python -m json.tool
echo -e "\n"

# Test 3: Predicción Individual
echo -e "${YELLOW}[TEST 3] Predicción Individual${NC}"
curl -s -X POST "$BASE_URL/predictions/predict" \
  -H "Content-Type: application/json" \
  -d '{
    "cuit": "20748123114",
    "ingresos": 1500000.00,
    "gastos": 1000000.00,
    "margen_operativo": 33.33,
    "deuda_total": 500000.00,
    "activos_totales": 2000000.00,
    "prestamos_solicitados": 3,
    "prestamos_aprobados": 2,
    "trimestre_dias_actividad": 85,
    "trimestre_logins_promedio": 12.5,
    "transferencias_trimestre": 45,
    "pagos_trimestre": 30,
    "creditos_trimestre": 15
  }' | python -m json.tool
echo -e "\n"

# Test 4: Predicción Batch
echo -e "${YELLOW}[TEST 4] Predicción Batch (2 empresas)${NC}"
curl -s -X POST "$BASE_URL/predictions/batch" \
  -H "Content-Type: application/json" \
  -d '{
    "companies": [
      {
        "cuit": "20748123114",
        "ingresos": 1500000.00,
        "gastos": 1000000.00,
        "margen_operativo": 33.33,
        "deuda_total": 500000.00,
        "activos_totales": 2000000.00,
        "prestamos_solicitados": 3,
        "prestamos_aprobados": 2,
        "trimestre_dias_actividad": 85,
        "trimestre_logins_promedio": 12.5,
        "transferencias_trimestre": 45,
        "pagos_trimestre": 30,
        "creditos_trimestre": 15
      },
      {
        "cuit": "20987654321",
        "ingresos": 800000.00,
        "gastos": 900000.00,
        "margen_operativo": -12.50,
        "deuda_total": 1200000.00,
        "activos_totales": 1000000.00,
        "prestamos_solicitados": 5,
        "prestamos_aprobados": 1,
        "trimestre_dias_actividad": 20,
        "trimestre_logins_promedio": 2.0,
        "transferencias_trimestre": 5,
        "pagos_trimestre": 3,
        "creditos_trimestre": 1
      }
    ]
  }' | python -m json.tool
echo -e "\n"

# Test 5: Readiness Check (Kubernetes)
echo -e "${YELLOW}[TEST 5] Readiness Check (Kubernetes)${NC}"
curl -s "$BASE_URL/health/ready" | python -m json.tool
echo -e "\n"

# Test 6: Liveness Check (Kubernetes)
echo -e "${YELLOW}[TEST 6] Liveness Check (Kubernetes)${NC}"
curl -s "$BASE_URL/health/live" | python -m json.tool
echo -e "\n"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Test Suite Completed${NC}"
echo -e "${GREEN}========================================${NC}"
