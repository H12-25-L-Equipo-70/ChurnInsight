# 🚀 Deployment and Commands Guide

This guide provides instructions for deploying ChurnInsight to Oracle Cloud Infrastructure (OCI) and general commands for managing and testing the application.

---

## ☁️ Oracle Cloud Infrastructure (OCI) Deployment

This project is designed for deployment on an OCI instance. The deployment process involves setting up the instance, configuring credentials, and running the application using Docker.

### Step 1: Prepare the OCI Instance

1.  **SSH into your OCI instance:**
    ```bash
    ssh -i your-key.pem ubuntu@your-instance-ip
    ```
    *(Replace `your-key.pem` and `your-instance-ip` with your actual SSH key and instance IP address.)*

2.  **Clone the Project Repository:**
    ```bash
    git clone https://github.com/YOUR-REPO/ChurnInsight.git
    cd ChurnInsight
    ```
    *(Replace `https://github.com/YOUR-REPO/ChurnInsight.git` with the actual repository URL.)*

3.  **Set up the Oracle Wallet:**
    Ensure your Oracle Wallet files are placed in the `backend/wallet_pymer/` directory. If the wallet is provided as a zip file, unzip it:
    ```bash
    cd backend/wallet_pymer
    unzip wallet_pymer.zip # If needed
    cd ../..
    ```

4.  **Configure Environment Variables for Production:**
    Create a `.env` file in the project root or relevant service directories from the provided `.env.example` files. Edit this file to include your production credentials and configurations.
    ```bash
    # Example for AI Service
    echo "ENVIRONMENT=production" > ai_service/.env

    # Example for Backend (ensure secure handling of passwords)
    echo "ORACLE_DB_PASSWORD=your_production_db_password" > backend/.env
    echo "ORACLE_WALLET_PATH=./wallet_pymer" >> backend/.env
    ```
    *(Refer to specific service documentation for all required environment variables.)*

### Step 2: Build and Deploy Services

1.  **Build Docker Images:** On the OCI instance, build the Docker images for all services:
    ```bash
    docker-compose build
    ```
    *(Use `docker-compose build --no-cache` if you encounter issues with stale image layers.)*

2.  **Start Services in Detached Mode:**
    ```bash
    docker-compose up -d
    ```

### Step 3: Verify Deployment and Test

1.  **Check Service Status:**
    ```bash
    docker-compose ps
    ```
    Verify that all services (e.g., `backend`, `ai_service`) are running (`Up` or `healthy`).

2.  **Test API Endpoints:** Use `curl` to test the health and basic functionality of the services.

    *   **Backend API (typically port 8080):**
        ```bash
        curl -s http://localhost:8080/api/v1/companies/health | jq
        ```

    *   **AI Service API (typically port 8000):**
        ```bash
        curl -s http://localhost:8000/api/v1/health/check | jq
        ```

    *   **Run a Test Prediction:**
        ```bash
        curl -X POST http://localhost:8000/api/v1/predictions/predict \
          -H "Content-Type: application/json" \
          -d 
          {
            "cuit": "20123456789",
            "ingresos": 150000,
            "gastos": 100000,
            "margen_operacional": 0.30,
            "deuda": 50000
            // ... add other required features based on the API schema
          }
           | jq
        ```

---

## 🛠️ Management, Debugging, and Testing Commands

This section covers general commands for managing the application, debugging issues, and testing APIs.

### API Testing

*   **Backend API (Port 8080):**
    ```bash
    # Health check endpoint
    curl http://localhost:8080/api/v1/companies/health

    # Example: Get all companies (replace with actual endpoint if different)
    curl http://localhost:8080/api/v1/companies
    ```

*   **AI Service API (Port 8000):**
    ```bash
    # Health check endpoint
    curl http://localhost:8000/api/v1/health/check

    # Get model information
    curl http://localhost:8000/api/v1/health/model-info

    # Access interactive API documentation (Swagger UI)
    # http://localhost:8000/api/v1/docs

    # Access ReDoc documentation
    # http://localhost:8000/api/v1/redoc
    ```

### Troubleshooting

*   **Oracle DB Connection Issues:**
    *   Verify your `.env` file for correct database credentials (username, password, connection string/SID).
    *   Ensure the Oracle Wallet path in your environment variables is correct and the wallet files are accessible.
    *   Confirm that the OCI instance has network connectivity to the Oracle Database.

*   **Health Check Failing:**
    *   Check the logs for the specific service using `docker-compose logs <service_name>` (e.g., `docker-compose logs ai_service`) to identify the root cause of the failure.
    *   Verify that the service is running and accessible on its expected port.

---

## 📞 Support

For detailed documentation and further assistance, please refer to:
*   [README.md](README.md) - Project overview and high-level information.
*   [docs/00_Quick_Start.md](docs/00_Quick_Start.md) - Step-by-step guide for local setup.
*   [docs/DOCKER_GUIDE.md](docs/DOCKER_GUIDE.md) - Detailed instructions for Docker management.
*   [docs/08_Testing_Local_Complete.md](docs/08_Testing_Local_Complete.md) - Comprehensive testing guide.
*   [docs/04_AI_Service_API.md](docs/04_AI_Service_API.md) - AI Service API documentation.
*   [docs/06_Backend_Architecture.md](docs/06_Backend_Architecture.md) - Backend architecture details.