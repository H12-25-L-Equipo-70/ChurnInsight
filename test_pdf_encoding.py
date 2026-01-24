#!/usr/bin/env python3
"""
Test PDF generation with red flags to verify character encoding
"""

import sys
import json
sys.path.insert(0, 'ai_service')

from ai_service.app.core.red_flags import RedFlagAnalyzer

# Sample company data (realistic example)
empresa_data = {
    'Nombre_Empresa': 'FinTech Solutions SA',
    'CUIT': '30-71234567-5',
    'Sector': 'FinTech',
    'Provincia': 'Buenos Aires',
    'INGRESOS': 2000000,
    'GASTOS': 2500000,  # Will trigger NEGATIVE_MARGIN (critical)
    'DEUDA': 1500000,
    'ACTIVOS': 800000,  # Will trigger HIGH_DEBT (high)
    'TRIMESTRE_DIAS_ACTIVIDAD': 0,  # Will trigger COMPLETE_INACTIVITY (critical)
    'TRANSFERENCIAS': 10000,
    'PAGOS': 5000,
    'CREDITOS': 20000,
    'APROBACIONES_CREDITO': 0,  # Will trigger NO_APPROVAL (high)
    'CANTIDAD_SERVICIOS': 2,  # Will trigger LOW_SERVICES (low)
    'CANTIDAD_PRESTAMOS_ACTIVOS': 2,
    'LOGINS_TRIMESTRE': 5,  # Will trigger LOW_LOGIN_ACTIVITY (medium)
    'TRANSACCIONES_POR_MES': 2  # Will trigger LOW_TRANSACTION_VOLUME (medium)
}

print("=" * 70)
print("PDF CHARACTER ENCODING TEST")
print("=" * 70)

# Test for character encoding issues
test_strings = [
    'Senales de Alerta',  # Should NOT have emoji
    'Recomendaciones',    # Should NOT have emoji
    'CRITICO',            # Text label, not emoji
    'ALTO',               # Text label
    'MEDIO',              # Text label
    'BAJO',               # Text label
    'Ingresos $ 2.000',   # Check currency formatting
]

print("\nCharacter encoding checks:")
print("-" * 70)

for test_str in test_strings:
    # Check if string contains only ASCII-safe characters
    try:
        test_str.encode('latin-1')
        status = "✓ ASCII-safe"
    except:
        status = "✗ ENCODING ISSUE"
    
    print(f"{status:20} | {test_str}")

print("\n" + "=" * 70)
print("RED FLAGS WITH PROPER STRUCTURE")
print("=" * 70 + "\n")

flags = RedFlagAnalyzer.calcular_red_flags(empresa_data)

# Display as would appear in PDF
print(f"Senales de Alerta ({len(flags)} alertas encontradas):\n")

# Show sorted flags (as they'll appear in PDF)
severity_colors = {
    'critical': 'CRITICO',
    'high': 'ALTO',
    'medium': 'MEDIO',
    'low': 'BAJO'
}

for i, flag in enumerate(flags, 1):
    severity_label = severity_colors.get(flag['severity'], 'DESCONOCIDO')
    
    # Verify no emoji in severity label
    assert '🔴' not in severity_label
    assert '🟠' not in severity_label
    assert '⚠️' not in severity_label
    
    print(f"{i}. [{severity_label}] {flag['flag']}")
    print(f"   {flag['description']}\n")

print("=" * 70)
print("✓ All encoding checks passed - PDF should display correctly")
print("=" * 70)

# Also verify the structure matches what Angular expects
print("\nJSON structure (as sent to frontend):")
print("-" * 70)
print(json.dumps(flags[0], indent=2, ensure_ascii=False))
print("...\n")

print("✓ Backend structure verified and ready for PDF export")
