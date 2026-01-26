# 🐳 Guía Docker de ChurnInsight

Esta guía proporciona instrucciones y comandos detallados para gestionar los servicios de ChurnInsight utilizando Docker y Docker Compose.

---

## 🚀 Desarrollo Local con Docker Compose

Docker Compose es el método recomendado para ejecutar toda la pila de la aplicación ChurnInsight de forma local. Simplifica la configuración y la gestión de múltiples servicios.

### Prerrequisitos

*   Docker Desktop instalado y en ejecución.
*   Git.

### 1. Clonar el Repositorio
Si aún no lo hiciste, clona el repositorio del proyecto:
```bash
git clone <repository-url>
cd ChurnInsight

```

### 2. Configurar Variables de Entorno
Antes de iniciar los servicios, configura las variables de entorno necesarias. Crea archivos `.env` en los directorios correspondientes de cada servicio (por ejemplo, `ai_service/.env`, `backend/.env`) basándote en los archivos `.env.example` provistos o directamente desde la terminal para una configuración rápida:

```bash
# For AI Service (example)
echo "ENVIRONMENT=development" > ai_service/.env

# For Backend (example - use secure practices for production)
echo "ORACLE_DB_PASSWORD=your_local_db_password" > backend/.env
echo "ORACLE_WALLET_PATH=./wallet_pymer" >> backend/.env
```
Asegúrate de configurar los archivos de **Oracle Wallet** como se describe en la sección de despliegue en **OCI** si es necesario para las conexiones locales a la base de datos Oracle.

### 3. Construir Imágenes Docker
Construye las imágenes Docker para todos los servicios definidos en `docker-compose.yml`:

```bash
docker-compose build
```
Este comando compila el código de la aplicación y crea imágenes Docker portables. Usa la opción `--no-cache` si encuentras problemas con capas de imágenes obsoletas:

```bash
docker-compose build --no-cache
```

### 4. Iniciar Servicios
Inicia todos los servicios (Servicio de IA, Backend y, potencialmente, una base de datos si no se utiliza una externa) en modo desacoplado (ejecutándose en segundo plano):

```bash
docker-compose up -d
```
### 5. Verificar el Estado de los Servicios
Comprueba el estado de los contenedores que se están ejecutando:

```bash
docker-compose ps
```
Deberías ver una salida que indique que servicios como `backend` y `ai_service` están en ejecución (`Up` o `healthy`).

### 6. Ver Logs
Monitorea la salida en tiempo real y los logs de todos los servicios en ejecución:

```bash
docker-compose logs -f
```
Para ver los logs de un servicio específico (por ejemplo, el Servicio de IA), utiliza:

```bash
docker-compose logs ai_service
```

### 7. Detener Servicios
Cuando hayas terminado, detén y elimina los contenedores, redes y volúmenes creados por Docker Compose:

```bash
docker-compose down
```

---

## 🛠️ Comandos de Gestión de Docker

Estos comandos son útiles para administrar los contenedores Docker en ejecución y sus recursos.

### Ver el Estado de los Contenedores

```bash
# View the status of all services defined in docker-compose.yml
docker-compose ps
```

### Acceder a la Shell del Contenedor
Ingresa a un contenedor en ejecución para ejecutar comandos dentro de él o con fines de depuración:

```bash
# Example: Enter the ai_service container
docker exec -it churninsight-ai bash
```
*(Reemplaza `churninsight-ai` por el nombre real del contenedor si es diferente)*

### Ver Uso de Recursos
Monitorea el uso de CPU y memoria de tus contenedores Docker:

```bash
docker stats
```

---

## 🔧 Solución de Problemas con Docker

*   **Conflictos de Puertos:** Si encuentras un error que indica que un puerto (por ejemplo, 8000, 8080) ya está en uso al iniciar los servicios:
    *   Identifica el proceso que está usando el puerto (por ejemplo, usando `sudo lsof -i :8000`).
    *   Detén el proceso en conflicto o cambia el mapeo de puertos en el archivo `docker-compose.yml` del servicio.
*   **Fallas al Construir Imágenes:** Si `docker-compose build` falla, intenta reconstruir sin usar la caché:
    ```bash
    docker-compose build --no-cache
    ```
    Examina la salida de la construcción para identificar mensajes de error específicos durante la instalación de dependencias o la compilación.
*   **Servicio No Inicia:** Revisa los logs del servicio específico usando `docker-compose logs <service_name>` para identificar la causa raíz del fallo.

---
## 📞 Soporte

Para documentación detallada y asistencia adicional, consulta:
*   [README.md](../README.md) – Descripción general del proyecto e información de alto nivel.
*   [05_Deployment.md](05_Deployment.md) – Despliegue en OCI y referencia general de comandos.
*   [00_Quick_Start.md](00_Quick_Start.md) – Guía paso a paso para la configuración local.
