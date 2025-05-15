# Configuration Docker pour le Frontend

Ce document fournit un exemple de configuration Docker pour un frontend qui se connecte à l'API Poker.

## Exemple de Dockerfile pour le Frontend

```dockerfile
# Stage de développement
FROM node:20-alpine AS development

WORKDIR /app

# Copier et installer les dépendances
COPY package*.json ./
RUN npm install

# Copier le reste du code
COPY . .

# Exposer le port standard pour React
EXPOSE 3000

# Commande de démarrage pour le développement
CMD ["npm", "start"]

# Stage de build
FROM development AS build

# Générer le build de production
RUN npm run build

# Stage de production avec Nginx
FROM nginx:alpine AS production

# Copier la configuration Nginx personnalisée
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers de build depuis l'étape de build
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port Nginx
EXPOSE 80

# Commande de démarrage pour Nginx
CMD ["nginx", "-g", "daemon off;"]
```

## Exemple de docker-compose.yml pour le Frontend

```yaml
version: '3.8'

networks:
  # Utiliser le même nom de réseau que l'API pour permettre la communication
  poker-network:
    external: true # Indique que ce réseau est défini ailleurs

services:
  # Frontend en développement
  frontend:
    build:
      context: .
      target: development
    volumes:
      - .:/app # Pour le hot-reload
      - /app/node_modules
    ports:
      - '3000:3000'
    environment:
      - REACT_APP_API_URL=http://localhost:3001 # URL locale de l'API
    networks:
      - poker-network
    container_name: poker-frontend-dev

  # Frontend en production
  frontend-prod:
    build:
      context: .
      target: production
    ports:
      - '80:80'
    environment:
      - API_URL=http://api-prod:3000 # URL de l'API en interne dans le réseau Docker
    networks:
      - poker-network
    container_name: poker-frontend-prod
    profiles: ['prod']
```

## Exemple de Nginx configuration (nginx.conf)

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # SPA configuration
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy pour l'API
    location /api/ {
        proxy_pass http://api-prod:3000/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Connexion à l'API

### En développement

Dans votre application React, vous pouvez définir l'URL de l'API dans un fichier .env:

```
# .env.development
REACT_APP_API_URL=http://localhost:3001
```

Puis l'utiliser dans votre code:

```javascript
// services/api.js
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const fetchData = async (endpoint) => {
  const response = await fetch(`${API_URL}/${endpoint}`);
  return response.json();
};
```

### En production avec Docker

Quand vous utilisez Docker, à l'intérieur du réseau Docker, vous pouvez accéder à l'API via:

```
http://api:3000      # Version développement
http://api-prod:3000 # Version production
```

## Démarrage

### Développement

```bash
# Assurez-vous que l'API est démarrée d'abord
docker-compose -f ../poker-api-mds/docker-compose.yml up -d

# Puis démarrez le frontend
docker-compose up
```

### Production

```bash
# Démarrer l'API en production
docker-compose -f ../poker-api-mds/docker-compose.yml --profile prod up -d

# Puis démarrez le frontend en production
docker-compose --profile prod up -d
```
