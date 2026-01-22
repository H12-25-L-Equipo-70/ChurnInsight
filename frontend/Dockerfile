# --- ETAPA 1: COMPILACIÓN ---
# Usamos una imagen de Node.js ligera para transformar tu código TS en JS puro.
FROM node:20-alpine AS build

# Nos situamos dentro de una carpeta de trabajo en el contenedor
WORKDIR /app

# Copiamos los archivos que dicen qué librerías necesitas
COPY package*.json ./

# Instalamos las librerías (esto crea la carpeta node_modules dentro del contenedor)
RUN npm install

# Copiamos todo el resto de tu código de la carpeta frontend
COPY . .

# Ejecutamos el comando de Angular para construir la versión de producción
# Esto creará una carpeta llamada /dist
RUN npm run build -- --configuration production

# --- ETAPA 2: SERVIDOR FINAL ---
# Ahora que tenemos los archivos listos, no necesitamos Node.js, 
# solo un servidor web liviano como Nginx.
FROM nginx:alpine

# Copiamos el archivo de configuración que creaste en el Paso 1
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiamos los archivos compilados desde la etapa anterior al servidor Nginx.
# IMPORTANTE: Revisa que en 'angular.json' el nombre del proyecto sea 'frontend'
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html

# Exponemos el puerto 80 (el estándar para web)
EXPOSE 80

# Arrancamos Nginx
CMD ["nginx", "-g", "daemon off;"]