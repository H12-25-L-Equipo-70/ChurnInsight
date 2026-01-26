# 🚀 Guía de inicio rápido para el desarrollo local

Esta guía proporciona instrucciones paso a paso para configurar y ejecutar ChurnInsight localmente, y cubre métodos de ejecución nativos y basados en Docker.

---

## 🎯 Objetivo del proyecto

Esta guía tiene como objetivo ponerlo en funcionamiento con ChurnInsight lo más rápido posible, permitiéndole desarrollar, probar y explorar la aplicación en su máquina local.

---

## 📋 Requisitos previos

Antes de comenzar, asegúrese de tener lo siguiente instalado en su sistema:

* **Docker Desktop:** Requerido para ejecutar servicios usando Docker Compose. (Descargar desde [docker.com](https://www.docker.com/products/docker-desktop/))
* **Git:** Para clonar el repositorio. (Descargar desde [git-scm.com](https://git-scm.com/downloads))
* **Python 3.12+:** Requerido para el Servicio de IA.
* **Java Development Kit (JDK) 17+:** Requerido para el servicio Backend.
* **Maven:** Una herramienta de automatización de compilación para proyectos Java.
* **Node.js LTS:** Requerido para el servidor de desarrollo Frontend.

---

## 📂 Configuración del proyecto

1. **Clonar el repositorio:**
    ```golpecito
    git clone <repositorio-url>
    cd ChurnInsight
    ```

2. **Configurar variables de entorno:**
    Configure las variables de entorno necesarias. Para el desarrollo local, puede crear archivos `.env` en los directorios de servicios respectivos o configurarlos directamente en su terminal. Consulte `README.md` y la documentación de servicio específica para conocer las variables requeridas.

    * **Ejemplo de servicio de IA:**
        ```golpecito
        echo "MEDIOAMBIENTE=desarrollo" > ai_service/.env
        ```
    * **Ejemplo de backend:**
        ```golpecito
        echo "ORACLE_DB_PASSWORD=su_contraseña_db_local" > backend/.env
        echo "ORACLE_WALLET_PATH=./wallet_pymer" >> backend/.env
        ```
    * *(Nota: para credenciales confidenciales, como contraseñas de bases de datos, considere utilizar métodos más seguros que los archivos de texto sin formato, especialmente en entornos compartidos).*

---

## ▶️ Iniciando la aplicación

Tiene dos opciones principales para iniciar ChurnInsight localmente:

### Opción 1: usar Docker Compose (recomendado)

Este método utiliza Docker para contenerizar y orquestar todos los servicios, garantizando un entorno coherente y aislado. Para obtener instrucciones detalladas sobre cómo crear y ejecutar servicios con Docker Compose, consulte:
* **[Guía de Docker](DOCKER_GUIDE.md)**

### Opción 2: Ejecución local nativa (sin Docker)

Esta opción implica ejecutar cada servicio directamente en su máquina local utilizando sus respectivos tiempos de ejecución.

#### Servicio backend (Java/Spring Boot)

1. Navegue hasta el directorio de backend:
    ```golpecito
    parte trasera del cd
    ```
2. Compile la aplicación y empaquetela:
    ```golpecito
    Paquete limpio mvn -DskipTests
    ```
3. Ejecute la aplicación:
    ```golpecito
    java -jar objetivo/churninsight-*.jar
    ```
    Alternativamente, puedes ejecutarlo directamente con Maven:
    ```golpecito
    mvn arranque de primavera: ejecutar
    ```
    * **Acceso:** La API de backend normalmente estará disponible en `http://localhost:8080`. Consulte `docs/03_Backend_Quick_Start.md` para obtener detalles.

#### Servicio de IA (Python/FastAPI)

1. Navegue hasta el directorio de servicios de AI:
    ```golpecito
    cd ai_servicio
    ```
2. Cree un entorno virtual Python (recomendado, haga esto solo una vez):
    ```golpecito
    pitón -m venv venv
    fuente venv/bin/activate # En Windows: venv\Scripts\activate
    ```
3. Instale las dependencias requeridas:
    ```golpecito
    instalación de pip -r requisitos.txt
    ```
4. Entrene el modelo de aprendizaje automático (requerido antes de la primera ejecución):
    ```golpecito
    Python train_model.py
    ```
5. Inicie el servidor FastAPI:
    ```golpecito
    python -m uvicorn principal: aplicación --reload --port 8000
    ```
    * **Acceso:** La documentación de la API del servicio AI (Swagger UI) estará disponible en `http://localhost:8000/docs`. Consulte `docs/02_AI_Service_Quick_Start.md` para obtener detalles.

#### Interfaz (angular)

1. Navegue hasta el directorio de interfaz:
    ```golpecito
    interfaz de CD
    ```
2. Instale las dependencias del frontend:
    ```golpecito
    instalación npm
    ```
3. Inicie el servidor de desarrollo Angular:
    ```golpecito
    servir
    ```
    * **Acceso:** La aplicación estará disponible en `http://localhost:4200`. Consulte `09_Frontend_Guide.md` para obtener detalles.

---

## 🔗 Documentación relacionada

* **[Guía de Docker](DOCKER_GUIDE.md):** Instrucciones detalladas sobre el uso de Docker y Docker Compose.
* **[Guía de implementación](05_Deployment.md):** Información sobre la implementación en OCI.
* **[Inicio rápido del servicio AI](02_AI_Service_Quick_Start.md):** Configuración del servicio AI.
* **[Inicio rápido de backend](03_Backend_Quick_Start.md):** Configuración del servicio backend.
* **[Guía de Frontend](09_Frontend_Guide.md):** Detalles sobre la configuración e integración de Frontend.