# 🚀 Quick Start Guide for Local Development

This guide provides step-by-step instructions to set up and run ChurnInsight locally, covering both Docker-based and native execution methods.

---

## 🎯 Project Goal

This guide aims to get you up and running with ChurnInsight as quickly as possible, allowing you to develop, test, and explore the application on your local machine.

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

*   **Docker Desktop:** Required for running services using Docker Compose. (Download from [docker.com](https://www.docker.com/products/docker-desktop/))
*   **Git:** For cloning the repository. (Download from [git-scm.com](https://git-scm.com/downloads))
*   **Python 3.12+:** Required for the AI Service.
*   **Java Development Kit (JDK) 17+:** Required for the Backend service.
*   **Maven:** A build automation tool for Java projects.
*   **Node.js LTS:** Required for the Frontend development server.

---

## 📂 Project Setup

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd ChurnInsight
    ```

2.  **Configure Environment Variables:**
    Set up necessary environment variables. For local development, you can create `.env` files in the respective service directories or set them directly in your terminal. Refer to the `README.md` and specific service documentation for required variables.

    *   **Example for AI Service:**
        ```bash
        echo "ENVIRONMENT=development" > ai_service/.env
        ```
    *   **Example for Backend:**
        ```bash
        echo "ORACLE_DB_PASSWORD=your_local_db_password" > backend/.env
        echo "ORACLE_WALLET_PATH=./wallet_pymer" >> backend/.env
        ```
    *   *(Note: For sensitive credentials like database passwords, consider using more secure methods than plain text files, especially in shared environments.)*

---

## ▶️ Starting the Application

You have two primary options for starting ChurnInsight locally:

### Option 1: Using Docker Compose (Recommended)

This method uses Docker to containerize and orchestrate all services, ensuring a consistent and isolated environment. For detailed instructions on building and running services with Docker Compose, please refer to the:
*   **[Docker Guide](DOCKER_GUIDE.md)**

### Option 2: Native Local Execution (Without Docker)

This option involves running each service directly on your local machine using their respective runtimes.

#### Backend Service (Java/Spring Boot)

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Compile the application and package it:
    ```bash
    mvn clean package -DskipTests
    ```
3.  Run the application:
    ```bash
    java -jar target/churninsight-*.jar
    ```
    Alternatively, you can run it directly with Maven:
    ```bash
    mvn spring-boot:run
    ```
    *   **Access:** The Backend API will typically be available at `http://localhost:8080`. Refer to `docs/03_Backend_Quick_Start.md` for specifics.

#### AI Service (Python/FastAPI)

1.  Navigate to the AI service directory:
    ```bash
    cd ai_service
    ```
2.  Create a Python virtual environment (recommended, do this only once):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  Install required dependencies:
    ```bash
    pip install -r requirements.txt
    ```
4.  Train the machine learning model (required before the first run):
    ```bash
    python train_model.py
    ```
5.  Start the FastAPI server:
    ```bash
    python -m uvicorn main:app --reload --port 8000
    ```
    *   **Access:** The AI Service API documentation (Swagger UI) will be available at `http://localhost:8000/docs`. Refer to `docs/02_AI_Service_Quick_Start.md` for specifics.

#### Frontend (Angular)

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install frontend dependencies:
    ```bash
    npm install
    ```
3.  Start the Angular development server:
    ```bash
    ng serve
    ```
    *   **Access:** The application will be available at `http://localhost:4200`. Refer to `docs/09_Frontend_Integration_Guide.md` for specifics.

---

## 🔗 Related Documentation

*   **[Docker Guide](DOCKER_GUIDE.md):** Detailed instructions on using Docker and Docker Compose.
*   **[Deployment and Commands Guide](05_Deployment_and_Commands.md):** Information on deploying to OCI and general management commands.
*   **[AI Service Quick Start](docs/02_AI_Service_Quick_Start.md):** Setup for the AI Service.
*   **[Backend Quick Start](docs/03_Backend_Quick_Start.md):** Setup for the Backend Service.
*   **[Frontend Integration Guide](docs/09_Frontend_Integration_Guide.md):** Details on Frontend setup and integration.
