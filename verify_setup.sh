#!/bin/bash

# ChurnInsight - Quick Verification Script
# Verifica que todos los archivos estén en su lugar

echo "╔════════════════════════════════════════════════════════════╗"
echo "║  ChurnInsight - Project Verification                      ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

ERRORS=0

# Verificar estructura de directorios
echo "📁 Verificando estructura de directorios..."

required_dirs=(
  "backend"
  "ai_service"
  "data"
  "backend/wallet_pymer"
  "backend/src/main/java/com/pymer/churninsight"
  "ai_service/app/routes"
  "ai_service/app/core"
  "ai_service/app/schemas"
  "ai_service/config"
  "ai_service/models"
  "ai_service/logs"
)

for dir in "${required_dirs[@]}"; do
  if [ -d "$dir" ]; then
    echo "  ✅ $dir"
  else
    echo "  ❌ $dir (FALTA)"
    ((ERRORS++))
  fi
done

echo ""
echo "📄 Verificando archivos críticos..."

required_files=(
  "backend/pom.xml"
  "backend/Dockerfile"
  "backend/docker-compose.yml"
  "ai_service/main.py"
  "ai_service/requirements.txt"
  "ai_service/Dockerfile"
  "ai_service/train_model.py"
  "docker-compose.yml"
  "README_PROJECT.md"
  "MISSION_1_COMPLETE.md"
  "MISSION_2_COMPLETE.md"
  "STATUS_DASHBOARD.md"
)

for file in "${required_files[@]}"; do
  if [ -f "$file" ]; then
    size=$(wc -c < "$file")
    size_kb=$((size / 1024))
    echo "  ✅ $file (${size_kb}KB)"
  else
    echo "  ❌ $file (FALTA)"
    ((ERRORS++))
  fi
done

echo ""
echo "🔧 Verificando configuración..."

configs=(
  "backend/.env.example"
  "ai_service/.env.example"
  "backend/.gitignore"
  "ai_service/.gitignore"
)

for config in "${configs[@]}"; do
  if [ -f "$config" ]; then
    echo "  ✅ $config"
  else
    echo "  ❌ $config (FALTA)"
    ((ERRORS++))
  fi
done

echo ""
echo "📚 Verificando documentación..."

docs=(
  "backend/README_AI.md:ai_service/README_AI.md"
  "backend/QUICK_START.md:ai_service/QUICK_START.md"
  "ai_service/API_DOCUMENTATION.md"
)

for doc in "${docs[@]}"; do
  # Handle multiple paths separated by :
  IFS=':' read -ra PATHS <<< "$doc"
  found=false
  for path in "${PATHS[@]}"; do
    if [ -f "$path" ]; then
      echo "  ✅ $path"
      found=true
      break
    fi
  done
  if [ "$found" = false ]; then
    echo "  ❌ None of {${PATHS[*]}} found"
    ((ERRORS++))
  fi
done

echo ""
echo "════════════════════════════════════════════════════════════"

if [ $ERRORS -eq 0 ]; then
  echo "✅ VERIFICACIÓN EXITOSA - Todos los archivos están en su lugar"
  echo ""
  echo "🚀 Próximos pasos:"
  echo "  1. Backend:"
  echo "     cd backend/ && mvn spring-boot:run"
  echo ""
  echo "  2. AI Service:"
  echo "     cd ai_service/ && python -m uvicorn main:app --reload"
  echo ""
  echo "  3. O ejecutar todo con Docker:"
  echo "     docker-compose up -d"
  echo ""
else
  echo "❌ VERIFICACIÓN CON ERRORES - $ERRORS archivos faltan"
  echo "Por favor ejecutar el setup nuevamente"
  exit 1
fi

echo "════════════════════════════════════════════════════════════"
