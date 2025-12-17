# ChurnInsight
Predicción de Cancelación de Clientes ONE

## Esta es una propuesta de Schematic para una Fintech.
A diferencia de la empresa de telecomunicaciones (donde el foco es la duración del contrato y el consumo de servicios), en una Fintech el foco está en tres pilares: Riesgo (Scoring), Cumplimiento (KYC/AML) y Comportamiento Transaccional (Fraude/Uso).

Aquí tienes la estructura jerárquica diseñada para un caso de uso de Crédito Digital / Neobanco:

<img width="630" height="476" alt="Screen Shot 2025-12-17 at 12 53 26 AM" src="https://github.com/user-attachments/assets/cd5c7d47-04d7-4ff7-88a1-df6ff06b6303" />

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



