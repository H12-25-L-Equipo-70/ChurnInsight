# 🚀 Deployment and Commands Guide

This guide provides a consolidated overview of commands for local development, deployment to Oracle Cloud Infrastructure (OCI), and general project management.

---

## ⚡ Quick Start (Local Development)

### Option 1: With Docker (Recommended)
This is the fastest and most reliable way to run the entire application stack locally.

```bash
# 1. Build the Docker images for both services
docker-compose build

# 2. Start all services in the background
docker-compose up -d

# 3. Verify that the services are running
docker-compose ps
# Expected output should show 'backend' and 'ai_service' with status 'Up' or 'healthy'

# 4. View real-time logs from all services
docker-compose logs -f

# 5. Stop all services when you are finished
docker-compose down
```

### Option 2: Native Local Execution (Without Docker)

#### Backend (Java/Spring Boot)
```bash
# Navigate to the backend directory
cd backend

# Compile the application and package it
mvn clean package -DskipTests

# Run the application
java -jar target/churninsight-*.jar

# Alternatively, run directly with Maven
mvn spring-boot:run
```

#### AI Service (Python/FastAPI)
```bash
# Navigate to the AI service directory
cd ai_service

# Create a Python virtual environment (only the first time)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install required dependencies
pip install -r requirements.txt

# Train the machine learning model (required before first run)
python train_model.py

# Start the FastAPI server
python -m uvicorn main:app --reload --port 8000
```

---

## ☁️ Oracle Cloud Infrastructure (OCI) Deployment

This project is ready for deployment on an OCI instance with Docker pre-installed.

### Step 1: Prepare the OCI Instance

```bash
# 1. SSH into your OCI instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 2. Clone the project repository
git clone https://github.com/YOUR-REPO/ChurnInsight.git
cd ChurnInsight

# 3. Set up the Oracle Wallet
# Ensure your wallet files are in `backend/wallet_pymer/`.
# If it's a zip file, unzip it.
cd backend/wallet_pymer
unzip wallet_pymer.zip # If needed
cd ../..

# 4. Configure environment variables for production
# Create a .env file from the example
cp .env.example .env

# Edit the .env file with your production credentials
# Make sure to set passwords and correct paths.
nano .env
```

### Step 2: Build and Deploy

```bash
# 1. Build the Docker images on the OCI instance
docker-compose build

# 2. Start the services in detached mode
docker-compose up -d

# 3. Verify the deployment
docker-compose ps
```

### Step 3: Verify and Test

```bash
# Test Backend Health (port 8080)
curl -s http://localhost:8080/api/v1/companies/health | jq

# Test AI Service Health (port 8000)
curl -s http://localhost:8000/api/v1/health/check | jq

# Run a test prediction
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d {
    "cuit": "20123456789",
    "ingresos": 150000,
    "gastos": 100000,
    "margen_operacional": 0.30,
    "deuda": 50000
    # ... add other features as required
  \}
 | jq
```

---

## 🛠️ Management, Debugging, and Testing Commands

### Docker Commands
```bash
# View status of all services
docker-compose ps

# View logs for all services in real-time
docker-compose logs -f

# View logs for a specific service (e.g., ai_service)
docker-compose logs ai

# Restart a specific service
docker-compose restart backend

# Enter a running container for debugging
docker exec -it churninsight-ai bash

# View resource usage (CPU, Memory)
docker stats
```

### API Testing
```bash
# ---- Backend API (Port 8080) ----

# Health check
curl http://localhost:8080/api/v1/companies/health

# Get all companies
curl http://localhost:8080/api/v1/companies


# ---- AI Service API (Port 8000) ----

# Health check
curl http://localhost:8000/api/v1/health/check

# Get model information
curl http://localhost:8000/api/v1/health/model-info

# Interactive API documentation
# Swagger UI: http://localhost:8000/api/v1/docs
# ReDoc: http://localhost:8000/api/v1/redoc
```

### Troubleshooting
*   **Port in use:** If you get an error that port 8080 or 8000 is already in use, stop the process using it or change the port mapping in the `docker-compose.yml` file.
*   **Oracle DB connection issues:** Double-check your `.env` file for correct credentials. Verify the wallet path and ensure the OCI instance has network access to the database.
*   **Image build fails:** Run `docker-compose build --no-cache` to force a clean build. Check for any errors during the dependency installation steps.
*   **Health check failing:** Use `docker-compose logs <service_name>` to inspect the logs of the failing service for specific error messages.
```