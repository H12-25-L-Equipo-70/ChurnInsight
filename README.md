# ChurnInsight
Predicción de Cancelación de Clientes ONE

## Esta es una propuesta de Schematic para una Fintech.
A diferencia de la empresa de telecomunicaciones (donde el foco es la duración del contrato y el consumo de servicios), en una Fintech el foco está en tres pilares: Riesgo (Scoring), Cumplimiento (KYC/AML) y Comportamiento Transaccional (Fraude/Uso).

Aquí tienes la estructura jerárquica diseñada para un caso de uso de Crédito Digital / Neobanco:

Fintech_Lending_DB/           <-- Colección Principal
│
├── User_Profile/             <-- Documento por Cliente
│   │
│   ├── user_id               <-- [String] UUID único
│   ├── created_at            <-- [Timestamp] Fecha de registro
│   │
│   ├── identity_kyc/         <-- (Know Your Customer) Vital para regulación
│   │   ├── full_name         <-- [String]
│   │   ├── tax_id            <-- [String] (RFC, DNI, SSN) - Encriptado
│   │   ├── dob               <-- [Date] Fecha nacimiento (para calcular edad exacta)
│   │   ├── status            <-- [Enum] "Verified", "Pending", "Rejected"
│   │   └── biometric_check   <-- [Boolean] ¿Pasó la prueba de vida?
│   │
│   ├── financial_health/     <-- Variables para Modelo de Riesgo (Credit Scoring)
│   │   ├── reported_income   <-- [Float] Ingreso declarado
│   │   ├── external_score    <-- [Int] Buró de crédito (ej. 650, 720)
│   │   ├── debt_to_income    <-- [Float] Capacidad de pago (Deuda/Ingreso)
│   │   └── active_loans      <-- [Int] Número de créditos abiertos en otros lados
│   │
│   ├── app_behavior/         <-- Datos conductuales (Huella digital)
│   │   ├── device_os         <-- [String] "iOS", "Android" (Relevante para poder adquisitivo)
│   │   ├── geoloc_home       <-- [GeoJSON] Coordenadas frecuentes
│   │   ├── avg_session_time  <-- [Float] Segundos promedio en la app
│   │   └── device_id         <-- [String] Huella única del celular (Anti-fraude)
│   │
│   ├── wallet/               <-- Estado actual de la cuenta
│   │   ├── current_balance   <-- [Float] Dinero disponible
│   │   ├── currency          <-- [String] "MXN", "USD", "COP"
│   │   └── is_blocked        <-- [Boolean] Por seguridad o falta de pago
│   │
│   └── transaction_stats/    <-- Agregados (Resumen transaccional)
│       ├── last_30d_inflow   <-- [Float] Cuánto dinero ingresó
│       ├── last_30d_outflow  <-- [Float] Cuánto gastó
│       ├── top_category      <-- [String] "Food", "Travel", "Gambling" (Riesgo alto)
│       └── velocity_check    <-- [Int] Nro de transacciones en la última hora (Alerta fraude)

### Análisis de las Variables Propuestas

Para que este diseño tenga sentido en tu proyecto (Notebooks/API), aquí te explico por qué elegí estas variables:

1. identity_kyc (El filtro de entrada):
En Telco, cualquiera puede comprar un chip. En Fintech, si no validas la identidad (status: Verified), no puedes operar por ley (Lavado de dinero).
Uso en modelo: Si la edad (dob) es < 18 o > 80, el riesgo cambia drásticamente.

2. financial_health (El corazón del modelo):
Aquí es donde vive tu Modelo Predictivo.
debt_to_income: Es la variable reina. Si alguien gana 100 y debe 90, su riesgo de default (impago) es altísimo.

3. app_behavior (Datos alternativos):
Las Fintech modernas usan esto cuando el cliente no tiene historial crediticio.
Ejemplo: Un usuario con iPhone 15 (device_os) suele tener mayor capacidad de pago que uno con un Android de gama baja antiguo.
device_id: Si un mismo celular intenta entrar a 5 cuentas diferentes, es Fraude.

4. transaction_stats (Ingeniería de Características):
En lugar de guardar todas las transacciones en este documento (que lo haría muy pesado), guardamos resúmenes.
top_category: Si la categoría principal es "Apuestas/Gambling", el modelo de riesgo penaliza al usuario.

### ¿Cómo cambia tu carpeta notebooks/ con esto?
Si usaras este schematic, tus notebooks tendrían tareas diferentes al de telecomunicaciones:

01_analisis_fraude.ipynb: Buscar anomalías en transaction_stats y device_id.
02_scoring_crediticio.ipynb: Usar Regresión Logística o XGBoost para predecir la probabilidad de impago usando financial_health.



