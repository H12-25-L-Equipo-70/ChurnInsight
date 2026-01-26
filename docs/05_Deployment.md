# 🚀 Guía de Despliegue

Esta guía proporciona una visión general del despliegue de ChurnInsight en Oracle Cloud Infrastructure (OCI).

---

## ☁️ Despliegue en Oracle Cloud Infrastructure (OCI)

ChurnInsight se despliega en una instancia de OCI, con los servicios ejecutándose como contenedores Docker.

### Arquitectura de Despliegue

La aplicación está contenerizada usando Docker y orquestada con Docker Compose. Esta configuración incluye:
- **Servicio de IA:** Una aplicación FastAPI para predicciones.
- **Servicio Backend:** Una aplicación Spring Boot para la lógica de negocio y la persistencia de datos.
- **Servicio Frontend:** Una aplicación Angular servida por Nginx.

Todos los servicios están configurados para comunicarse entre sí y con la base de datos Oracle Autonomous Database.

### Acceso a la Aplicación Desplegada

La aplicación es accesible públicamente en las siguientes direcciones:

* **Aplicación Web:** [http://152.67.34.202/dashboard](http://152.67.34.202/dashboard)
* **Documentación de la API (Swagger):** [http://152.67.34.202:8000/api/v1/docs](http://152.67.34.202:8000/api/v1/docs)

### Resumen del Proceso de Despliegue

El proceso de despliegue en la instancia de OCI incluye los siguientes pasos generales:

1. **Configuración del Entorno:**
   * El proyecto se clona desde el repositorio.
   * Se configuran las variables de entorno para producción, incluyendo credenciales de base de datos y configuraciones específicas de cada servicio.
   * Se configura el Oracle Wallet para un acceso seguro a la base de datos.

2. **Construcción y Ejecución con Docker:**
   * Se construyen las imágenes Docker de cada servicio utilizando `docker-compose build`.
   * Los servicios se inician usando `docker-compose up -d`.

3. **Verificación:**
   * Se verifica el estado de los servicios con `docker-compose ps`.
   * Se prueban los endpoints de la API para asegurar que responden correctamente.

Para instrucciones detalladas sobre cómo ejecutar la aplicación de forma local, consulta la [Guía de Inicio Rápido](00_Quick_Start.md) y la [Guía de Docker](DOCKER_GUIDE.md).

---

## 🛠️ Gestión y Resolución de Problemas

### Gestión de Servicios

Los servicios de la aplicación se gestionan utilizando comandos de Docker Compose:

* **Verificar estado de los servicios:** `docker-compose ps`
* **Ver logs:** `docker-compose logs -f <service_name>`
* **Detener servicios:** `docker-compose down`

### Resolución de Problemas

* **Problemas de Conexión:** Si los servicios no pueden conectarse a la base de datos, verifica las variables de entorno y la configuración del Oracle Wallet.
* **Servicio No Saludable:** Si un servicio no se está ejecutando correctamente, revisa sus logs para identificar errores.

Para pasos de troubleshooting más detallados, consulta la [Guía de Pruebas](08_Testing_Guide.md).
