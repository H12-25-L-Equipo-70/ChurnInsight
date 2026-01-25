FROM node:20-alpine AS build
WORKDIR /app
COPY frontend/package*.json ./
RUN npm install
COPY frontend/src ./src
COPY frontend/angular.json ./
COPY frontend/tsconfig.app.json ./
COPY frontend/tsconfig.json ./
COPY frontend/tsconfig.spec.json ./
COPY frontend/postcss.config.js ./
COPY frontend/tailwind.config.js ./
COPY frontend/.editorconfig ./
COPY frontend/.gitignore ./
RUN npm run build -- --configuration production

# --- ETAPA 2: SERVIDOR FINAL ---
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]