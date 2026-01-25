# 🐳 ChurnInsight Docker Guide

This guide provides detailed instructions and commands for managing ChurnInsight services using Docker and Docker Compose.

---

## 🚀 Local Development with Docker Compose

Docker Compose is the recommended method for running the entire ChurnInsight application stack locally. It simplifies the setup and management of multiple services.

### Prerequisites

*   Docker Desktop installed and running.
*   Git.

### 1. Clone the Repository
If you haven't already, clone the project repository:
```bash
git clone <repository-url>
cd ChurnInsight
```

### 2. Configure Environment Variables
Before starting the services, configure the necessary environment variables. Create `.env` files in the respective service directories (e.g., `ai_service/.env`, `backend/.env`) based on the provided `.env.example` files or directly in the terminal for quick setup:

```bash
# For AI Service (example)
echo "ENVIRONMENT=development" > ai_service/.env

# For Backend (example - use secure practices for production)
echo "ORACLE_DB_PASSWORD=your_local_db_password" > backend/.env
echo "ORACLE_WALLET_PATH=./wallet_pymer" >> backend/.env
```
Ensure you set up the Oracle Wallet files as described in the OCI deployment section if needed for local Oracle DB connections.

### 3. Build Docker Images
Build the Docker images for all services defined in `docker-compose.yml`:
```bash
docker-compose build
```
This command compiles your application code and creates portable Docker images. Use `--no-cache` if you encounter issues with stale image layers:
```bash
docker-compose build --no-cache
```

### 4. Start Services
Start all services (AI Service, Backend, and potentially a database if not using external) in detached mode (running in the background):
```bash
docker-compose up -d
```

### 5. Verify Service Status
Check the status of your running containers:
```bash
docker-compose ps
```
You should see output indicating that services like `backend` and `ai_service` are running (`Up` or `healthy`).

### 6. View Logs
Monitor the real-time output and logs from all running services:
```bash
docker-compose logs -f
```
To view logs for a specific service (e.g., AI Service), use:
```bash
docker-compose logs ai_service
```

### 7. Stop Services
When you are finished, stop and remove the containers, networks, and volumes created by Docker Compose:
```bash
docker-compose down
```

---

## 🛠️ Docker Management Commands

These commands are useful for managing running Docker containers and their resources.

### View Container Status
```bash
# View the status of all services defined in docker-compose.yml
docker-compose ps
```

### Access Container Shell
Enter a running container to execute commands inside it or for debugging purposes:
```bash
# Example: Enter the ai_service container
docker exec -it churninsight-ai bash
```
*(Replace `churninsight-ai` with the actual container name if it differs)*

### View Resource Usage
Monitor the CPU and memory usage of your Docker containers:
```bash
docker stats
```

---

## 🔧 Docker Troubleshooting

*   **Port Conflicts:** If you encounter an error indicating that a port (e.g., 8000, 8080) is already in use when starting services:
    *   Identify the process using the port (e.g., using `sudo lsof -i :8000`).
    *   Stop the conflicting process or change the port mapping in the `docker-compose.yml` file for the service.
*   **Image Build Failures:** If `docker-compose build` fails, try rebuilding without using the cache:
    ```bash
    docker-compose build --no-cache
    ```
    Examine the build output for specific error messages during dependency installation or compilation.
*   **Service Not Starting:** Check the logs for the specific service using `docker-compose logs <service_name>` to identify the root cause of the failure.

---
## 📞 Support

For detailed documentation and further assistance, please refer to:
*   [README.md](README.md) - Project overview and high-level information.
*   [docs/05_Deployment_and_Commands.md](docs/05_Deployment_and_Commands.md) - OCI deployment and general command reference.
*   [docs/00_Quick_Start.md](docs/00_Quick_Start.md) - Step-by-step guide for local setup.
