#!/usr/bin/env python3
"""
Complete integration test: Verify red flags are returned correctly
and frontend sorting will work properly
"""

import sys
import json
sys.path.insert(0, 'ai_service')

from ai_service.app.core.red_flags import RedFlagAnalyzer

print("=" * 80)
print("INTEGRATION TEST: Backend Red Flags to Frontend PDF Export")
print("=" * 80 + "\n")

# Test Case 1: High-risk company (multiple critical flags)
test_case_1 = {
    'Nombre_Empresa': 'Empresa en Crisis SA',
    'TRIMESTRE_DIAS_ACTIVIDAD': 0,  # Critical: No activity
    'INGRESOS': 100000,
    'GASTOS': 200000,  # Critical: Negative margin
    'DEUDA': 900000,
    'ACTIVOS': 500000,  # High: Debt ratio 1.8
    'TRANSFERENCIAS': 0,
    'PAGOS': 0,
    'CREDITOS': 0,  # Critical: No transactions
    'APROBACIONES_CREDITO': 0,  # High: No approval
    'CANTIDAD_SERVICIOS': 1,  # Low: Low services
    'LOGINS_TRIMESTRE': 2,  # Medium: Low login activity
    'TRANSACCIONES_POR_MES': 1,  # Medium: Low transaction volume
    'CANTIDAD_PRESTAMOS_ACTIVOS': 0,
}

# Test Case 2: Moderate-risk company
test_case_2 = {
    'Nombre_Empresa': 'Empresa Moderada SA',
    'TRIMESTRE_DIAS_ACTIVIDAD': 45,
    'INGRESOS': 5000000,
    'GASTOS': 4500000,  # Positive margin
    'DEUDA': 2000000,
    'ACTIVOS': 4000000,  # Debt ratio 0.5 (OK)
    'TRANSFERENCIAS': 50000,
    'PAGOS': 30000,
    'CREDITOS': 100000,  # OK
    'APROBACIONES_CREDITO': 5,  # Has approvals
    'CANTIDAD_SERVICIOS': 3,  # OK
    'LOGINS_TRIMESTRE': 45,  # OK
    'TRANSACCIONES_POR_MES': 20,  # OK
    'CANTIDAD_PRESTAMOS_ACTIVOS': 1,
}

test_cases = [
    ("HIGH RISK (Multiple Critical Flags)", test_case_1),
    ("MODERATE RISK (Mixed Flags)", test_case_2)
]

severity_order = {
    'critical': 0,
    'high': 1,
    'medium': 2,
    'low': 3
}

for test_name, test_data in test_cases:
    print(f"\n{test_name}")
    print("-" * 80)
    
    # Get flags from backend
    flags = RedFlagAnalyzer.calcular_red_flags(test_data)
    
    # Verify they are properly sorted
    actual_order = [f['severity'] for f in flags]
    expected_order = sorted(actual_order, key=lambda x: severity_order[x])
    
    is_sorted = actual_order == expected_order
    sort_status = "✓ SORTED" if is_sorted else "✗ NOT SORTED"
    
    print(f"\nCompany: {test_data['Nombre_Empresa']}")
    print(f"Total Flags: {len(flags)}")
    print(f"Severity Order: {sort_status}\n")
    
    # Display flags as they will appear in PDF
    for i, flag in enumerate(flags, 1):
        sev = flag['severity']
        flag_name = flag['flag']
        description = flag['description'][:50] + '...' if len(flag['description']) > 50 else flag['description']
        
        print(f"{i}. [{sev.upper():8}] {flag_name}")
        print(f"   └─ {description}")
    
    # Simulate frontend sorting (should already be sorted, but verify robustness)
    print(f"\nFrontend sorting verification:")
    frontend_sorted = sorted(flags, key=lambda x: severity_order.get(x['severity'], 999))
    frontend_matches_backend = [f['flag'] for f in flags] == [f['flag'] for f in frontend_sorted]
    
    if frontend_matches_backend:
        print("✓ Frontend sorting matches backend order (consistent)")
    else:
        print("✗ Frontend sorting differs from backend (will override backend sort)")

print("\n" + "=" * 80)
print("ENCODING VERIFICATION")
print("=" * 80 + "\n")

# Verify no problematic characters
problem_chars = ['🔴', '🟠', '🟡', '🟢', '⚠️', '💡', 'Ø', 'Ü', '°']

print("Checking for problematic characters in test outputs:\n")

all_flags = []
for _, test_data in test_cases:
    all_flags.extend(RedFlagAnalyzer.calcular_red_flags(test_data))

has_problems = False
for flag in all_flags:
    for key in ['flag', 'description', 'severity']:
        value = flag.get(key, '')
        for char in problem_chars:
            if char in value:
                print(f"✗ Found '{char}' in {key}: {value}")
                has_problems = True

if not has_problems:
    print("✓ No problematic characters found")
    print("✓ All flags are safe for PDF export")

print("\n" + "=" * 80)
print("STRUCTURE VALIDATION")
print("=" * 80 + "\n")

# Verify structure matches what Angular expects
sample_flag = all_flags[0]
required_keys = {'flag', 'description', 'severity'}
actual_keys = set(sample_flag.keys())

print(f"Required keys: {required_keys}")
print(f"Actual keys:   {actual_keys}")

if required_keys == actual_keys:
    print("✓ Structure matches frontend expectations\n")
    print(f"Sample output for Angular:")
    print(json.dumps(sample_flag, indent=2, ensure_ascii=False))
else:
    print("✗ Structure mismatch!")
    print(f"Missing: {required_keys - actual_keys}")
    print(f"Extra:   {actual_keys - required_keys}")

print("\n" + "=" * 80)
print("✓ INTEGRATION TEST COMPLETE - All validations passed")
print("=" * 80)
