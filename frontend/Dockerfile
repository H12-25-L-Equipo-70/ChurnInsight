FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY src ./src
COPY angular.json ./
COPY tsconfig.app.json ./
COPY tsconfig.json ./
COPY tsconfig.spec.json ./
COPY postcss.config.js ./
COPY tailwind.config.js ./
COPY .editorconfig ./
COPY .gitignore ./
RUN npm run build -- --configuration production

# --- ETAPA 2: SERVIDOR FINAL ---
FROM nginx:alpine
COPY ./nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/frontend/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]