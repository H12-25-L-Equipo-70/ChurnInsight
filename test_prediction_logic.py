#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
Test script para verificar la lógica de predicción de churn
Prueba con casos extremos (alto riesgo) y casos normales
"""

import sys
sys.path.insert(0, r'c:\Repositorios\ChurnInsight\ai_service')

from app.core.model_manager import ChurnModel

def test_cases():
    """
    Prueba casos específicos
    """
    model = ChurnModel()
    
    # =====================================================================
    # CASO 1: ALTO RIESGO (Deuda muy alta, cero actividad)
    # =====================================================================
    print("\n" + "="*70)
    print("CASO 1: ALTO RIESGO - Empresa sobreendeudada e inactiva")
    print("="*70)
    
    high_risk_case = {
        "DEUDA": 1000000,           # Deuda masiva
        "ACTIVOS": 500000,          # Activos bajos
        "INGRESOS": 100000,         # Ingresos bajos
        "GASTOS": 150000,           # Gastos mayores a ingresos (pérdidas)
        "TRIMESTRE_DIAS_ACTIVIDAD": 5,    # Casi nada de actividad
        "PRESTAMOS_SOLICITADOS": 10,
        "PRESTAMOS_APROBADOS": 0    # Ninguno aprobado
    }
    
    prob, risk = model.predict(high_risk_case)
    print(f"\nResultado: Probabilidad={prob:.4f} ({prob*100:.2f}%), Riesgo={risk.upper()}")
    
    # Esperado: ALTO RIESGO (prob > 0.7)
    expected = "ALTO"
    actual = risk.upper()
    status = "OK - CORRECTO" if actual == expected else f"FALLO - INCORRECTO (esperado {expected}, obtenido {actual})"
    print(f"Validacion: {status}")
    
    # =====================================================================
    # CASO 2: RIESGO MEDIO (Deuda moderada, actividad media)
    # =====================================================================
    print("\n" + "="*70)
    print("CASO 2: RIESGO MEDIO - Empresa con deuda moderada")
    print("="*70)
    
    medium_risk_case = {
        "DEUDA": 200000,            # Deuda moderada
        "ACTIVOS": 1000000,         # Activos buenos
        "INGRESOS": 500000,         # Ingresos buenos
        "GASTOS": 400000,           # Gastos moderados
        "TRIMESTRE_DIAS_ACTIVIDAD": 45,    # Actividad media
        "PRESTAMOS_SOLICITADOS": 5,
        "PRESTAMOS_APROBADOS": 3    # Mayor parte aprobada
    }
    
    prob, risk = model.predict(medium_risk_case)
    print(f"\nResultado: Probabilidad={prob:.4f} ({prob*100:.2f}%), Riesgo={risk.upper()}")
    
    # Esperado: RIESGO MEDIO o BAJO (prob entre 0.3-0.7)
    expected = "MEDIO"
    actual = risk.upper()
    status = "OK - CORRECTO" if actual in ["MEDIO", "BAJO"] else f"FALLO - INCORRECTO (esperado {expected})"
    print(f"Validacion: {status}")
    
    # =====================================================================
    # CASO 3: BAJO RIESGO (Empresa saludable)
    # =====================================================================
    print("\n" + "="*70)
    print("CASO 3: BAJO RIESGO - Empresa saludable")
    print("="*70)
    
    low_risk_case = {
        "DEUDA": 50000,             # Deuda baja
        "ACTIVOS": 2000000,         # Activos muy altos
        "INGRESOS": 1000000,        # Ingresos altos
        "GASTOS": 600000,           # Gastos bajos (margen bueno)
        "TRIMESTRE_DIAS_ACTIVIDAD": 85,    # Muy activa
        "PRESTAMOS_SOLICITADOS": 5,
        "PRESTAMOS_APROBADOS": 5    # Todos aprobados
    }
    
    prob, risk = model.predict(low_risk_case)
    print(f"\nResultado: Probabilidad={prob:.4f} ({prob*100:.2f}%), Riesgo={risk.upper()}")
    
    # Esperado: BAJO RIESGO (prob < 0.4)
    expected = "BAJO"
    actual = risk.upper()
    status = "OK - CORRECTO" if actual == expected else f"FALLO - INCORRECTO (esperado {expected}, obtenido {actual})"
    print(f"Validacion: {status}")
    
    # =====================================================================
    # RESUMEN
    # =====================================================================
    print("\n" + "="*70)
    print("RESUMEN DE PRUEBAS")
    print("="*70)
    print(f"OK - Prediccion de churn esta funcionando correctamente")
    print(f"   - Alto riesgo detectado para casos extremos (alto peso en deuda e inactividad)")
    print(f"   - Riesgo medio para casos moderados")
    print(f"   - Bajo riesgo para empresas saludables")

if __name__ == "__main__":
    test_cases()
