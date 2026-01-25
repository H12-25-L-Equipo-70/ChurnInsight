# ⚡ Quick Start - FastAPI AI Service

This guide provides essential steps to get the AI service running locally. For detailed setup and deployment, refer to the main documentation.

---

## 🚀 Local Setup

### 1. Navigate and Install Dependencies

```bash
# Navigate to the AI service directory
cd ai_service/

# Create and activate a Python virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install project dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

Copy the example environment file and edit it with your specific configurations.
```bash
cp .env.example .env
# Edit the .env file, e.g., with your Oracle DB password
# nano .env
```

### 3. Train the Model

Before running the service, ensure the ML model is trained and saved.
```bash
python train_model.py
```
This command trains the model and saves it to the `./models/` directory.

### 4. Start the AI Service

Run the FastAPI application using Uvicorn.
```bash
python -m uvicorn main:app --reload --port 8000
```
The service will be accessible at `http://localhost:8000`.

---

## 🧪 Quick Testing

### Health Check

```bash
curl http://localhost:8000/api/v1/health/check
```
*Expected Output: A JSON response indicating the service is "healthy".*

### Single Prediction

```bash
curl -X POST http://localhost:8000/api/v1/predictions/predict \
  -H "Content-Type: application/json" \
  -d 
  {
    "cuit": "20748123114",
    "ingresos": 1500000.00,
    "gastos": 1000000.00,
    "margen_operativo": 33.33,
    "deuda_total": 500000.00,
    "activos_totales": 2000000.00,
    "prestamos_solicitados": 3,
    "prestamos_aprobados": 2,
    "trimestre_dias_actividad": 85,
    "trimestre_logins_promedio": 12.5,
    "transferencias_trimestre": 45,
    "pagos_trimestre": 30,
    "creditos_trimestre": 15
  }
```
*Expected Output: A JSON response with prediction details.*

---

## 📚 Related Documentation

*   **[AI Service API Reference](04_AI_Service_API.md):** Detailed information on all API endpoints.
*   **[Project Overview](01_Project_Overview.md):** General project information and architecture.
*   **[Docker Guide](DOCKER_GUIDE.md):** Instructions for running the AI service with Docker.
*   **[Quick Start Guide](00_Quick_Start.md):** Comprehensive local setup guide for the entire project.

---

**Note:** For production deployment and advanced configurations, please consult the main deployment documentation.