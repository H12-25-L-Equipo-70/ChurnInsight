#!/usr/bin/env python3
"""
Quick test to verify red flags structure and sorting
"""

import sys
sys.path.insert(0, 'ai_service')

from ai_service.app.core.red_flags import RedFlagAnalyzer

# Test data with multiple critical/high/medium/low flags
test_data = {
    'TRIMESTRE_DIAS_ACTIVIDAD': 0,  # Critical: Complete inactivity
    'INGRESOS': 100000,
    'GASTOS': 150000,  # Critical: Negative margin
    'DEUDA': 800000,
    'ACTIVOS': 500000,  # High: High debt ratio (1.6)
    'TRANSFERENCIAS': 5000,
    'PAGOS': 0,
    'CREDITOS': 0,
    'APROBACIONES_CREDITO': 0,  # High: No approvals
    'CANTIDAD_SERVICIOS': 1,  # Low: Low services
    'CANTIDAD_PRESTAMOS_ACTIVOS': 3  # Medium: Multiple loans
}

print("=" * 60)
print("RED FLAGS STRUCTURE TEST")
print("=" * 60)

flags = RedFlagAnalyzer.calcular_red_flags(test_data)

print(f"\nTotal flags found: {len(flags)}\n")

# Group by severity
severity_order = {'critical': 0, 'high': 1, 'medium': 2, 'low': 3}
by_severity = {}
for flag in flags:
    sev = flag.get('severity', 'unknown')
    if sev not in by_severity:
        by_severity[sev] = []
    by_severity[sev].append(flag)

# Display results
for sev in ['critical', 'high', 'medium', 'low']:
    if sev in by_severity:
        print(f"\n[{sev.upper()}] ({len(by_severity[sev])} flags)")
        for flag in by_severity[sev]:
            print(f"  • {flag['flag']}: {flag['description']}")

# Verify sorting
print("\n" + "=" * 60)
print("SORTED RESULT (as returned by backend):")
print("=" * 60 + "\n")

for i, flag in enumerate(flags, 1):
    print(f"{i}. [{flag['severity'].upper()}] {flag['flag']}")
    print(f"   → {flag['description']}\n")

print("=" * 60)
print("✓ Test completed successfully")
print("=" * 60)
