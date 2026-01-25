# ⚡ Quick Start - ChurnInsight Backend

This guide provides the essential steps to get the Backend service running locally. For detailed setup and deployment instructions, refer to the main documentation.

---

## 🚀 Local Setup

### 1. Set Environment Variables

Configure necessary environment variables. For local development, you can set them directly in your terminal or use a `.env` file.

*   **Linux/Mac:**
    ```bash
    export ORACLE_DB_PASSWORD="your_local_db_password"
    export ORACLE_WALLET_PATH="$(pwd)/backend/wallet_pymer"
    export ORACLE_NET_TNS_ADMIN="$(pwd)/backend/wallet_pymer"
    ```

*   **Windows PowerShell:**
    ```powershell
    $env:ORACLE_DB_PASSWORD = "your_local_db_password"
    $env:ORACLE_WALLET_PATH = "C:\path\to\your\project\backend\wallet_pymer"
    $env:ORACLE_NET_TNS_ADMIN = "C:\path\to\your\project\backend\wallet_pymer"
    ```
    *(Ensure the `ORACLE_WALLET_PATH` correctly points to your wallet directory.)*

### 2. Copy Environment File

Copy the example environment file and edit it with your specific configurations.
```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your values
```

### 3. Compile the Backend

Navigate to the backend directory and compile the project.
```bash
cd backend/
mvn clean install
```

### 4. Run the Backend Service

Start the Spring Boot application. Using the `dev` profile is recommended for local development.
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"
```
The backend service will typically be available at `http://localhost:8080`.

---

## 🧪 Quick Testing

### Health Check

```bash
curl http://localhost:8080/api/v1/companies/health
```
*Expected Output: A JSON response indicating the service is healthy.*

---

## 📚 Related Documentation

*   **[Backend Architecture](06_Backend_Architecture.md):** Detailed explanation of the backend's design and components.
*   **[Deployment and Commands Guide](05_Deployment_and_Commands.md):** Instructions for OCI deployment and general commands.
*   **[Project Overview](01_Project_Overview.md):** General project information.
*   **[Quick Start Guide](00_Quick_Start.md):** Comprehensive local setup guide for the entire project.

---

**Note:** For production deployment and advanced configurations, please consult the main deployment documentation.