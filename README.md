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

Nuevo Schematics propuesto por Agustin...

<img width="604" height="737" alt="Screen Shot 2025-12-18 at 11 20 57 PM" src="https://github.com/user-attachments/assets/4f28f8c1-cbe9-4bbe-882a-67fe232444a2" />

Esta data tiene una particularidad muy importante: es una Serie Temporal (Time Series).
A diferencia de los ejemplos anteriores donde cada bloque JSON era una empresa distinta, aquí estás viendo la historia de una misma empresa (Godoy Tech) a lo largo del tiempo (2022-Q1, Q2, Q3, etc.) hasta que finalmente hace Churn (abandona) en el 2023-Q1.
Para diseñar este Schematic, debemos separar los Datos Estáticos (lo que no cambia) de los Datos Dinámicos (lo que cambia cada trimestre).
Aquí tienes el diseño optimizado para un análisis de evolución temporal:
<img width="512" height="788" alt="Screen Shot 2025-12-20 at 1 27 26 AM" src="https://github.com/user-attachments/assets/c28805f9-6f0b-4ce6-bd7b-9f8639408588" />

Análisis del Diseño (Por qué estructurarlo así)
Deduplicación de Datos:
En tu JSON original, el nombre "Godoy Tech", la dirección y el teléfono se repiten 5 veces. En una base de datos bien diseñada (incluso en NoSQL), esto se extrae al encabezado (Static_Profile) para ahorrar espacio y facilitar actualizaciones.
Agrupación Temporal (Quarterly_Evolution):
Esta es la parte más valiosa. Al tener los trimestres dentro de un Array/Lista, tu equipo de Data Science puede aplicar algoritmos de Ventana Deslizante (Rolling Windows) o redes neuronales recurrentes (LSTM).
Ejemplo de pregunta al dato: "¿Cómo cambió el margin de Q1 a Q2?" -> Es fácil de responder si están en el mismo documento.
Detección de Patrones de Fuga (Churn):
Si observas tu data:
2022-Q1 a Q3: Inversiones activas, Ingresos altos.
2022-Q4: Creditos pasa a False, Monto_Aprobado cae a 0.0.
2023-Q1: Pagos pasa a False, Churn se vuelve True.
Este esquema permite visualizar la "degradación" del cliente trimestre a trimestre dentro del bloque app_engagement.
La variable bcraIndex (Ausente):
Nota que en este dataset no incluiste el índice del BCRA que estaba en el ejemplo anterior. Si la tuvieras, iría dentro de financials o credit_behavior de cada trimestre, ya que esa calificación puede cambiar con el tiempo.
