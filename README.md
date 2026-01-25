📉 Predicción de Churn en PYMER (APP FINTECH)

Objetivo - Modelo de Machine Learning para una Fintech

1. Introducción

El churn de clientes representa una de las principales problemáticas para empresas fintech que ofrecen soluciones financieras a PYMES. La pérdida de clientes no solo impacta en los ingresos recurrentes, sino también en los costos de adquisición y en la estabilidad del negocio.

El objetivo de este proyecto es desarrollar un modelo de Machine Learning capaz de predecir churn de clientes, permitiendo una detección temprana y la implementación de estrategias de retención más eficientes.

El modelo se integra en una API de predicción, pensada para ser consumida por una aplicación productiva.

2. Descripción del Dataset

El dataset contiene información histórica de PYMES argentinas, incluyendo:

Identificación fiscal (CUIT)

Períodos fiscales (PERIODO_FISCAL)

Variables financieras (ingresos, gastos)

Uso del producto financiero

Historial crediticio

Variable objetivo CHURN (1 = abandono, 0 = activo)

Cada empresa puede aparecer en múltiples períodos, lo que introduce una estructura temporal y jerárquica que debe ser considerada durante el entrenamiento del modelo.

3. Exploración y Limpieza de Datos (EDA)

Durante el análisis exploratorio se realizaron las siguientes tareas:

3.1 Distribución del Churn

Se observó una distribución relativamente balanceada entre clientes que churnean y los que no, lo cual es favorable para el entrenamiento de modelos supervisados.
<img width="471" height="393" alt="image" src="https://github.com/user-attachments/assets/9c62ace6-ad24-4de2-bc97-9eb392cc11dd" />


3.2 Análisis temporal

Se analizaron los períodos fiscales (20**Q*) para detectar:

Picos de churn en determinados trimestres

Tendencias temporales

Estacionalidad

3.3 Detección de valores faltantes

Variables numéricas: imputación por mediana

Variables categóricas: manejo mediante OneHotEncoder con handle_unknown='ignore'

4. Ingeniería de Features

Se construyeron nuevas variables con alto valor explicativo:

4.1 Salud financiera
SALUD_FINANCIERA = INGRESOS − GASTOS


Permite identificar empresas con márgenes negativos o positivos al momento del churn.

4.2 Comportamiento crediticio
ratio_crediticio = préstamos_aprobados / préstamos_solicitados


Mide la calidad crediticia de la PYME.

4.3 Features temporales y de uso

Frecuencia de interacción

Persistencia en el tiempo

Historial acumulado por empresa

Se respetó la integridad por CUIT, evitando fugas de información entre train y test.

5. Modelo Supervisado
5.1 Algoritmo seleccionado

Se utilizó LightGBM (Gradient Boosting) por:

Buen desempeño en datasets tabulares

Manejo eficiente de no-linealidades

Capacidad de early stopping

Interpretabilidad razonable

5.2 Configuración del modelo
LGBMClassifier(
    n_estimators=1200,
    learning_rate=0.03,
    num_leaves=31,
    min_child_samples=40,
    subsample=0.8,
    colsample_bytree=0.8,
    random_state=42
)


El número de árboles se ajusta automáticamente mediante early stopping, evitando overfitting.

6. Validación Cruzada con GroupKFold

Dado que una empresa puede aparecer en múltiples períodos, se utilizó:

GroupKFold con CUIT como grupo

Esto garantiza que:

Un mismo cliente no aparezca en train y test

La evaluación sea realista y robusta

En cada fold:

Se entrenó el modelo con early stopping

Se calculó un umbral óptimo por F1-score

Se evaluaron métricas clave

7. Métricas de Desempeño
7.1 Resultados promedio (5 folds)
Métrica	Valor
ROC-AUC	0.93
F1-score	0.87
Recall	Alto y estable
7.2 Enfoque en Recall y F1-score

Recall alto → minimiza falsos negativos (clientes que churnean sin ser detectados)

F1-score alto → equilibrio entre precisión y recall

Estas métricas son críticas para detección temprana de churn, donde perder un cliente es más costoso que alertar falsamente.

8. Análisis de Negocio
8.1 Impacto económico

Se construyó una tabla de impacto considerando:

Clientes churn detectados

Clientes salvados

Costo de acciones de retención

Beneficio neto

El análisis muestra que optimizar recall genera un impacto económico positivo, incluso asumiendo costos operativos de retención.

8.2 Gráfico de impacto

El gráfico de impacto económico permite visualizar claramente:

Beneficios vs costos

Retorno neto del modelo

Justificación financiera de su implementación

9. Serialización del Modelo

El modelo final se entrenó sobre el dataset completo y se exportó junto con:

Pipeline completo de features + modelo

Umbral promedio óptimo

joblib.dump(
    {"pipeline": pipeline, "threshold": final_threshold},
    "pymer_churn_pipeline.pkl"
)


Este artefacto está listo para:

Despliegue en API

Inferencia en tiempo real

Reentrenamiento futuro

10. Conclusiones

El modelo logra alto desempeño predictivo

La validación con GroupKFold evita leakage

El foco en recall y F1 es adecuado para el negocio

El análisis económico demuestra viabilidad real

El pipeline está listo para producción
11. Enlace al notebook. 
https://colab.research.google.com/drive/1NhPcf8Kc87TWgIsbQ3KmMblop_XDIcVm#scrollTo=bccf71c6

