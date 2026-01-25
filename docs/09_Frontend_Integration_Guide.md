# 🚀 Frontend Integration Guide - ChurnInsight

This guide focuses on the frontend's integration with the backend and AI services, detailing data structures, API interactions, and testing procedures.

---

## 🔌 API Endpoints Integrated

The frontend interacts with both the Backend service and the AI Service to provide predictions and company data.

### Backend Service (localhost:8080)

*   **Health Check:**
    ```bash
    GET /api/v1/companies/health
    ```
*   **Fetch Company Data:**
    ```bash
    GET /api/v1/companies/{cuit}
    ```
*   **Fetch Sectors:**
    ```bash
    GET /api/v1/companies/segments/sectors
    ```
*   **Fetch Provinces:**
    ```bash
    GET /api/v1/companies/segments/provincias
    ```

### AI Service (localhost:8000)

*   **Prediction Endpoint:**
    ```bash
    POST /api/v1/predictions/predict_churn
    ```
    *   *(This endpoint accepts detailed company input and returns prediction results including red flags.)*
*   **Batch Prediction Endpoint:**
    ```bash
    POST /api/v1/predictions/batch_predict_churn
    ```
*   **Health Check:**
    ```bash
    GET /api/v1/health/check
    ```

---

## 🧪 Frontend Testing Procedures

Follow these steps to test the frontend integration:

### Step 1: Ensure Services are Running

Before testing the frontend, ensure that the Backend and AI services are running. For local setup instructions, refer to the [Quick Start Guide](00_Quick_Start.md).

```bash
# Example: Starting services if not already running
# (Ensure you are in the project root directory)
docker-compose up -d
# Or run them natively as per the Quick Start guide.
```

### Step 2: Verify Service Health

Check the health of the backend and AI services using `curl`:

```bash
# Backend Health Check
curl http://localhost:8080/api/v1/companies/health

# AI Service Health Check
curl http://localhost:8000/api/v1/health/check
```
*Both checks should return a `healthy` status.*

### Step 3: Comprehensive Browser Testing

Access the frontend application in your browser at `http://localhost:4200`.

1.  **Test Company Search (Optional):**
    *   Enter a CUIT (e.g., `20123456789`) in the search field.
    *   Click the "Search Company" button (if available).
    *   *Expected:* Company details should populate the form if the CUIT exists.

2.  **Test Manual Form Submission:**
    *   Fill out all fields across the form sections (Profile, Financials, Engagement).
    *   Click "Next" through the sections.
    *   Click "Get Prediction".
    *   *Expected:* A loading indicator appears, followed by the prediction results, including probability, risk level, red flags, timestamp, and recommendations.

3.  **Test Export Functionality:**
    *   After receiving a prediction, click the "Download CSV" and "Download JSON" buttons.
    *   *Expected:* Corresponding files should be downloaded.
    *   Click "Copy to Clipboard".
    *   *Expected:* A success notification should appear.

### Step 4: Test Error Handling

Simulate error conditions to verify the frontend's robustness:

*   **AI Service Timeout:** If the AI service is intentionally slowed down or unresponsive, the backend should return a timeout error.
    *   *Expected:* A user-friendly message like "⏱️ Timeout" or "Error: AI service took too long to respond."
*   **Backend Service Unavailable:** Stop the backend service.
    *   *Expected:* A message like "❌ Cannot connect to the Backend."
*   **AI Service Unavailable:** Stop the AI service.
    *   *Expected:* A message like "❌ Cannot connect to the AI Service."
*   **Invalid CUIT:** Enter an invalid or empty CUIT.
    *   *Expected:* Validation errors should be displayed near the CUIT field.

---

## 📡 Data Flow Summary

The frontend orchestrates user interactions and data flow:

```
┌─────────────────────┐       ┌───────────────────────┐       ┌──────────────────────┐
│  Frontend (Angular) │       │  Backend Service      │       │   AI Service         │
└──────────┬──────────┘       └──────────┬────────────┘       └──────────┬───────────┘
           │                           │                           │
(1) User fills form/searches CUIT        │                           │
           │                           │ (2) Request Company Data    │
           └───────────►◄───────────────┘                           │
                       (3) Send prediction request (30+ fields)      │
                                       │                           │
                                       ├──────────────────────────►│ (4) POST /predict_churn
                                       │                           │
                                       │ (5) Receive prediction    │
                                       ├───────────────────────────┘
                                       │
(6) Display results, red flags, recs.  │
(7) Handle exports (CSV, JSON, Copy)   │
                                       │ (8) Handle errors/timeouts
                                       │
┌─────────────────────┐       ┌───────────────────────┐       ┌──────────────────────┐
│  Frontend (Angular) │       │  Backend Service      │       │   AI Service         │
└─────────────────────┘       └───────────────────────┘       └──────────────────────┘
```

---

## 🔧 Configuration Notes

API endpoints and ports can be configured within the frontend services:

*   **AI Service URL:** `prediction.service.ts`
    ```typescript
    private readonly AI_SERVICE_URL = 'http://localhost:8000/api/v1/predictions/predict_churn';
    ```
*   **Backend Service URL:** `company.service.ts`
    ```typescript
    private readonly BACKEND_URL = 'http://localhost:8080/api/v1/companies';
    ```

---

## 📦 Data Structures

Refer to the `src/app/core/models/churn.interface.ts` file for detailed TypeScript interfaces:

*   **`EmpresaInput`**: Represents the 30+ fields sent to the AI Service.
*   **`RedFlag`**: Details about identified risks (flag type, description, severity).
*   **`PredictionResponse`**: The complete response from the AI Service, including probability, prediction, red flags, timestamp, and recommendations.

---

## ✨ Key Frontend Integrations

*   **HTTP Client**: Configured via `app.config.ts` for service communication.
*   **Data Mapping**: Services handle transformation of UI data into the `EmpresaInput` format and processing of `PredictionResponse`.
*   **Error Handling**: Robust mechanisms to inform the user about connection issues, timeouts, and API errors.
*   **UI Feedback**: Loading indicators and clear display of prediction results, flags, and recommendations.
*   **Export Functionality**: CSV, JSON export, and copy-to-clipboard for prediction results.

---

## 🎯 Next Steps (Deferred)

*   Advanced styling and animations.
*   User documentation (video tutorials, guides).
*   Client-side prediction caching.
*   Multi-user dashboard features.
*   OCI deployment integration.

---

**Frontend Integration Complete - Ready for enhanced UI and production deployment.**
