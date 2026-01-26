# ⚡ Inicio Rápido - Backend de ChurnInsight

Esta guía proporciona los pasos esenciales para ejecutar el servicio Backend localmente. Para instrucciones detalladas de configuración y despliegue, consulta la documentación principal.

---

## 🚀 Configuración Local

### 1. Configurar Variables de Entorno

Configura las variables de entorno necesarias. Para el desarrollo local, puedes configurarlas directamente en tu terminal o usar un archivo `.env`.

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
    *(Asegúrate de que `ORACLE_WALLET_PATH` apunte correctamente al directorio de tu wallet.)*

### 2. Copiar Archivo de Entorno

Copia el archivo de entorno de ejemplo y edítalo con tus configuraciones específicas.
```bash
cp backend/.env.example backend/.env
# Edita backend/.env con tus valores
```

### 3. Compilar el Backend

Navega al directorio del backend y compila el proyecto.
```bash
cd backend/
mvn clean install

```
### 4. Ejecutar el Servicio Backend

Inicia la aplicación Spring Boot. Se recomienda utilizar el perfil `dev` para el desarrollo local.
```bash
mvn spring-boot:run -Dspring-boot.run.arguments="--spring.profiles.active=dev"

```
El servicio backend normalmente estará disponible en `http://localhost:8080`.

---

## 🧪 Pruebas Rápidas

### Verificación de Salud (Health Check)

```bash
curl http://localhost:8080/api/v1/companies/health

```
*Salida esperada: una respuesta JSON que indique que el servicio está funcionando correctamente.*

---

## 📚 Documentación Relacionada

* **[Arquitectura del Backend](06_Backend_Architecture.md):** Explicación detallada del diseño y los componentes del backend.
* **[Guía de Despliegue](05_Deployment.md):** Instrucciones para el despliegue en OCI.
* **[Descripción General del Proyecto](01_Project_Overview.md):** Información general del proyecto.
* **[Guía de Inicio Rápido](00_Quick_Start.md):** Guía completa de configuración local para todo el proyecto.

---

**Nota:** Para despliegues en producción y configuraciones avanzadas, consulta la documentación principal de despliegue.
