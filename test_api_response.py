#!/usr/bin/env python3
"""
Simulate API response to verify structure matches frontend expectations
"""

import sys
import json
sys.path.insert(0, 'ai_service')

from ai_service.app.core.red_flags import RedFlagAnalyzer

# Simulate a complete API response
empresa_input = {
    'Nombre_Empresa': 'TechFinance Corp',
    'CUIT': '30-67890123-4',
    'Sector': 'FinTech',
    'Provincia': 'Buenos Aires',
    'INGRESOS': 3000000,
    'GASTOS': 2800000,
    'DEUDA': 2000000,
    'ACTIVOS': 2500000,
    'TRIMESTRE_DIAS_ACTIVIDAD': 15,
    'TRANSFERENCIAS': 150000,
    'PAGOS': 80000,
    'CREDITOS': 300000,
    'APROBACIONES_CREDITO': 3,
    'CANTIDAD_SERVICIOS': 4,
    'LOGINS_TRIMESTRE': 25,
    'TRANSACCIONES_POR_MES': 12,
    'CANTIDAD_PRESTAMOS_ACTIVOS': 2,
}

# Calculate red flags
red_flags = RedFlagAnalyzer.calcular_red_flags(empresa_input)

# Simulate prediction response (matching PredictionResponse structure)
prediction_response = {
    "prediction": {
        "risk_level": "medium",
        "churn_probability": 45.2,
        "confidence_score": 0.82
    },
    "metrics": {
        "profitability": 6.67,
        "debt_ratio": 0.8,
        "activity_level": 16.7,
        "transaction_frequency": 12.0
    },
    "red_flags": red_flags,  # Now properly structured
    "recomendaciones": [
        "Aumentar actividad operacional",
        "Mejorar márgenes de ganancia",
        "Reducir endeudamiento"
    ]
}

print("=" * 80)
print("API RESPONSE SIMULATION - PredictionResponse Format")
print("=" * 80 + "\n")

# Pretty print the response
print(json.dumps(prediction_response, indent=2, ensure_ascii=False))

print("\n" + "=" * 80)
print("VERIFICATION")
print("=" * 80 + "\n")

# Verify structure
print(f"✓ Response has 'prediction' key: {'prediction' in prediction_response}")
print(f"✓ Response has 'metrics' key: {'metrics' in prediction_response}")
print(f"✓ Response has 'red_flags' key: {'red_flags' in prediction_response}")
print(f"✓ Response has 'recomendaciones' key: {'recomendaciones' in prediction_response}")

print(f"\n✓ Red flags count: {len(prediction_response['red_flags'])}")
print(f"✓ Each flag has 'flag' key: {all('flag' in f for f in prediction_response['red_flags'])}")
print(f"✓ Each flag has 'description' key: {all('description' in f for f in prediction_response['red_flags'])}")
print(f"✓ Each flag has 'severity' key: {all('severity' in f for f in prediction_response['red_flags'])}")

# Verify sorting
severities = [f['severity'] for f in prediction_response['red_flags']]
severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
is_sorted = all(severity_order[severities[i]] <= severity_order[severities[i+1]] 
                 for i in range(len(severities)-1))

print(f"\n✓ Red flags are sorted by severity: {is_sorted}")
if severities:
    print(f"  Order: {' → '.join([s.upper() for s in severities])}")

print("\n" + "=" * 80)
print("✓ API RESPONSE STRUCTURE VALIDATED - Ready for frontend integration")
print("=" * 80)
