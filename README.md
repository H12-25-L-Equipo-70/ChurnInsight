
# ChurnInsight: Predicción Inteligente de Abandono para Pymer (Fintech)

**ChurnInsight** es una plataforma avanzada que utiliza Inteligencia Artificial y análisis financiero para predecir proactivamente el riesgo de abandono (churn) de clientes Pymes en el sector Fintech. Diseñado para optimizar las estrategias de retención y maximizar el valor del cliente por parte de la plataforma Pymer, una app dedicada a proveer soluciones financieras a Pymes.

---

## 🎯 El Problema: El Costo del Abandono en Fintech

En el dinámico sector Fintech, la **retención de clientes Pymes** es crítica. Las altas tasas de abandono no solo representan una pérdida directa de ingresos, sino que también implican un costo mayor en la adquisición de nuevos clientes. Las empresas necesitan identificar de antemano qué Pymes están en riesgo de abandonar la plataforma para poder implementar acciones de retención efectivas y rentables.

*   **Impacto Financiero:** Pérdida directa de ingresos recurrentes y aumento de costos de adquisición.
*   **Desafío Operativo:** Dificultad para predecir el comportamiento del cliente y asignar recursos de retención de manera eficiente.
*   **Oportunidad:** Empresas que implementan estrategias de retención basadas en datos pueden reducir significativamente sus tasas de abandono y mejorar la lealtad del cliente.

---

## 💡 Nuestra Solución: ChurnInsight

ChurnInsight proporciona una **solución integral y basada en datos** para predecir y mitigar el abandono de clientes. A través de un análisis inteligente de variables financieras y de comportamiento, ChurnInsight:

*   **Predice la probabilidad de abandono** para cada Pyme cliente.
*   **Identifica las "Red Flags"** críticas que indican un riesgo inminente.
*   **Genera recomendaciones personalizadas** para acciones de retención.
*   **Ofrece reportes claros y ejecutivos** que facilitan la toma de decisiones estratégicas.

Construido con tecnologías de vanguardia, ChurnInsight actúa como un **sistema de alerta temprana y un motor de inteligencia de negocio**, permitiendo a las empresas Fintech enfocarse en retener a sus clientes más valiosos.

---

## ⚙️ Arquitectura del Sistema

ChurnInsight se compone de tres servicios principales interconectados, respaldados por una base de datos robusta:

```mermaid
graph LR
    A[Frontend: Angular] -->|HTTP REST| B(Backend: Spring Boot)
    B -->|JDBC SQL| C[(Oracle Cloud DB)]
    B -->|HTTP REST| D[AI Service: FastAPI]
    D -.->|Optional Access| C

    style C fill:#f9f,stroke:#333,stroke-width:2px
    style D fill:#bbf,stroke:#333,stroke-width:2px
```

*   **Frontend (Angular):** La interfaz de usuario intuitiva donde los analistas y gerentes visualizan las predicciones, red flags y generan reportes.
*   **Backend (Spring Boot):** Orquesta la lógica de negocio, gestiona las interacciones con la base de datos y se comunica con el AI Service para obtener predicciones.
*   **AI Service (FastAPI):** El motor de predicción que utiliza modelos de Machine Learning y análisis heurístico para calcular el riesgo de churn y generar alertas.
*   **Oracle Database:** Almacena los datos de las empresas, métricas financieras, predicciones y otra información relevante.

**Para una comprensión detallada de la arquitectura, consulte:**
[docs/01_Project_Overview.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/01_Project_Overview.md) y [docs/06_Backend_Architecture.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/06_Backend_Architecture.md)

---

## 🚀 Componentes Clave

### 🤖 AI Service (FastAPI)
El cerebro analítico de ChurnInsight. Se encarga de:
*   **Modelado Predictivo:** Implementa modelos de Machine Learning y análisis heurístico (basado en datos financieros y de comportamiento) para predecir la probabilidad de churn.
*   **Generación de Red Flags:** Identifica y clasifica hasta 14 tipos de señales de alerta (ej. baja actividad, endeudamiento, historial crediticio) según su severidad.
*   **Procesamiento Batch:** Permite realizar predicciones masivas sobre grandes volúmenes de datos.
*   **API de Predicción:** Expone endpoints REST para recibir datos de empresas y devolver predicciones, probabilidades y alertas.

*   **Tecnologías:** Python, FastAPI, Pydantic, Scikit-learn, Pandas.
*   **Documentación Detallada:** [AI Service Quick Start](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/02_AI_Service_Quick_Start.md) y [docs/04_AI_Service_API.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/04_AI_Service_API.md)

### ⚙️ Backend Service (Spring Boot)
El orquestador de ChurnInsight. Sus funciones incluyen:
*   **Orquestación y Lógica de Negocio:** Gestiona el flujo de datos entre el Frontend, la Base de Datos y el AI Service.
*   **Persistencia de Datos:** Se comunica con Oracle Database para almacenar y recuperar información de clientes, métricas y predicciones.
*   **Exposición de API:** Proporciona endpoints REST para que el Frontend acceda a datos y funcionalidades.
*   **Gestión de Seguridad:** Implementa mecanismos de seguridad robustos, incluyendo el uso de Oracle Wallet para credenciales.

*   **Tecnologías:** Java, Spring Boot 3.x, JPA, Oracle Database.
*   **Documentación Detallada:** [Backend Quick Start](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/03_Backend_Quick_Start.md) y [docs/06_Backend_Architecture.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/06_Backend_Architecture.md)

### 🖥️ Frontend (Angular)
La interfaz de usuario que permite la interacción:
*   **Dashboard Interactivo:** Visualiza el estado de riesgo de las Pymes, alertas y métricas clave.
*   **Formulario de Entrada:** Permite ingresar o consultar datos detallados de las empresas para predicción individual.
*   **Visualización de Resultados:** Muestra la probabilidad de churn, red flags contextualizadas, recomendaciones y reportes.
*   **Integración con Backend:** Consume los endpoints del Backend para obtener y enviar datos.

*   **Tecnologías:** Angular 21, Tailwind CSS, jsPDF.
*   **Documentación Detallada:** [docs/09_Frontend_Integration_Guide.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/09_Frontend_Guide.md)

---

## 📊 Cómo Funciona la Predicción (Simplificado)

ChurnInsight se basa en un modelo analítico que evalúa una combinación de factores críticos de cada Pyme:

1.  **Indicadores Financieros:** Rentabilidad (margen operativo), endeudamiento (ratio deuda/activos).
2.  **Comportamiento Crediticio:** Historial de préstamos solicitados, aprobados y cancelados.
3.  **Patrones de Uso:** Nivel de actividad en la plataforma, número de transacciones, días de inactividad.

Estos indicadores se procesan para calcular una **puntuación de riesgo** y generar alertas específicas, indicando no solo la probabilidad de abandono, sino también las razones subyacentes.

📊 Validación del Modelo y Resultados Clave

Para garantizar la robustez del motor de predicción, se realizaron pruebas con un dataset histórico de PYMES argentinas:

Dataset: Incluye CUIT, períodos fiscales, variables financieras (ingresos, gastos, deuda, activos), historial crediticio y uso de la plataforma.

Estructura temporal: Cada empresa aparece en múltiples períodos, lo que introduce una jerarquía temporal que se respetó en el entrenamiento.

Ingeniería de Features:

Salud financiera = ingresos − gastos.

Ratio crediticio = préstamos aprobados / préstamos solicitados.

Variables de actividad: logins, días activos/inactivos, uso de servicios.

🔎 Validación Cruzada

Se utilizó GroupKFold con CUIT como grupo, evitando fuga de información entre train y test.

En cada fold se aplicó early stopping y se ajustó un umbral óptimo por F1-score.

📈 Métricas de Desempeño

ROC-AUC promedio: 0.93

F1-score promedio: 0.87

Recall alto y estable: minimiza falsos negativos (clientes que churnean sin ser detectados).

F1-score alto: equilibrio entre precisión y recall.

💰 Impacto de Negocio

El análisis económico demuestra que optimizar el recall genera un impacto positivo:

Clientes churn detectados → mayor retención.

Costo de acciones de retención → asumido en el modelo.

Beneficio neto → positivo incluso considerando costos operativos.

Un gráfico de impacto económico mostró claramente el retorno neto del modelo, justificando su implementación en producción.

🛠️ Serialización y Despliegue

El modelo final se entrenó sobre el dataset completo y se exportó junto con:

Pipeline completo (features + modelo).

Umbral promedio óptimo.

Artefacto serializado con joblib.dump, listo para:

Despliegue en la API de predicción.

Inferencia en tiempo real.

Reentrenamiento futuro.

✅ Conclusiones Técnicas

El modelo logra alto desempeño predictivo en datos reales.

La validación con GroupKFold evita leakage y asegura realismo.

El foco en recall y F1-score es adecuado para el negocio fintech.

El pipeline está listo para producción e integrado en ChurnInsight.

**Para detalles técnicos sobre el modelo y las variables de entrada, consulte:**
[docs/01_Project_Overview.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/01_Project_Overview.md) y [docs/04_AI_Service_API.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/04_AI_Service_API.md)

---

## 🌐 Despliegue y Acceso

### Entorno de Producción: Oracle Cloud Infrastructure (OCI)
ChurnInsight se encuentra desplegado y operativo en una instancia de **Oracle Cloud Infrastructure (OCI)**, garantizando alta disponibilidad, escalabilidad y un entorno de producción seguro. La aplicación está completamente contenerizada utilizando Docker y orquestada a través de Docker Compose.

### Acceso a la Aplicación
La plataforma es accesible públicamente a través de las siguientes URLs:

*   **Aplicación Web (Dashboard):** [**http://152.67.34.202/dashboard**](http://152.67.34.202/dashboard)
*   **Documentación de la API (Swagger):** [**http://152.67.34.202:8000/api/v1/docs**](http://152.67.34.202:8000/api/v1/docs)

Para detalles técnicos sobre el proceso de despliegue y la gestión de los servicios, consulte la [Guía de Despliegue](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/05_Deployment.md).
---

## ⚡ Inicio Rápido (Desarrollo Local)

Para configurar y ejecutar ChurnInsight localmente, consulte la guía detallada:
[docs/00_Quick_Start.md](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/00_Quick_Start.md)

Esta guía cubre los requisitos previos, configuración del entorno y las diferentes opciones para iniciar los servicios (Docker Compose o ejecución nativa).

---

## 📖 Documentación Técnica Detallada

Acceda a la documentación completa de ChurnInsight a través de los siguientes enlaces:

| Documento                                    | Descripción                                                                                                |
| :------------------------------------------- | :--------------------------------------------------------------------------------------------------------- |
| [Project Overview](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/01_Project_Overview.md) | Visión general del proyecto, sus objetivos y la arquitectura general.                                        |
| [AI Service Quick Start](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/02_AI_Service_Quick_Start.md) | Guía rápida para configurar y ejecutar el servicio de IA.                                                  |
| [Backend Quick Start](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/03_Backend_Quick_Start.md)   | Guía rápida para configurar y ejecutar el servicio de Backend.                                             |
| [AI Service API Reference](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/04_AI_Service_API.md)     | Documentación detallada de los endpoints del AI Service, incluyendo esquemas de solicitud y respuesta.      |
| [Guía de Despliegue](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/05_Deployment.md) | Instrucciones para el despliegue en OCI y comandos de gestión.                                              |
| [Backend Architecture](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/06_Backend_Architecture.md) | Descripción detallada de la arquitectura del Backend, patrones de diseño y tecnologías empleadas.         |
| [New Notebook Integration](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/07_AI_Service_Details.md) | Guía específica sobre la integración de nuevos modelos o notebooks de Data Science en el AI Service.        |
| [Comprehensive Local Testing](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/08_Testing_Guide.md) | Guía exhaustiva para la ejecución de pruebas unitarias, de integración y de extremo a extremo localmente. |
| [Frontend Integration Guide](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/09_Frontend_Guide.md) | Explica la integración del Frontend Angular con el Backend y el AI Service.                               |
| [Docker Guide](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/DOCKER_GUIDE.md)             | Guía detallada sobre el uso de Docker y Docker Compose para gestionar los servicios de ChurnInsight.        |
| [Quick Start Guide](https://github.com/H12-25-L-Equipo-70/ChurnInsight/blob/main/docs/00_Quick_Start.md)       | Guía rápida para configurar y ejecutar ChurnInsight localmente (Docker y nativo).                           |

---

## 🤝 Contribuciones

Invitamos a la comunidad a contribuir con mejoras y nuevas funcionalidades.
1.  Haga un "fork" del repositorio.
2.  Cree una nueva rama para sus cambios (`git checkout -b feature/su-feature`).
3.  Realice sus modificaciones y haga "commit" (`git commit -m 'Add some feature'`).
4.  Envíe sus cambios a la rama (`git push origin feature/su-feature`).
5.  Abra un "Pull Request" para que podamos revisar sus contribuciones.

---

## 📝 Licencia

Este proyecto está licenciado bajo la Licencia Pymer - ChurnInsight Project.

---

## 👥 Equipo

Desarrollado como parte del **Hackathon Team 70**.

*   **Frontend:** Angular 21 + Tailwind CSS
*   **Backend:** Java Spring Boot 3.1.8 + Oracle DB Autonomus Database
*   **AI Service:** Python FastAPI + ML Model
*   **Orquestación:** Docker & Docker Compose
*   **Machine Learning:** LightGBM model + Pipeline (Notebook Google Colab)

---

## 📞 Soporte y Comunidad

Para obtener ayuda o discutir el proyecto:
*   **Documentación Completa:** Diríjase a la carpeta `docs/`.
*   **Reporte de Problemas:** Abra un "Issue" en el repositorio de GitHub.
*   **Preguntas Técnicas:** Consulte la documentación detallada o cree un "Issue" para discutir.

---

## 🗺️ Historial de Versiones

*   ✅ **v1.0.0:** Funcionalidad principal, integración de AI Service y Backend, y configuración local con Docker.
*   ✅ **v1.1.0:** Integración del Dashboard de Frontend (Angular) y generación de reportes.
*   ✅ **v1.2.0:** Estrategia de despliegue y puesta en producción en Oracle Cloud Infrastructure (OCI).
*   ✅ **v1.3.0:** Configuración de monitoreo y logging avanzado.
*   ✅ **v2.0.0:** Automatización del pipeline CI/CD y lanzamiento de la versión estable.

---

**Última Actualización:** 26 de Enero, 2026
**Versión:** 2.0.0 - Estable (En Producción) ✅
