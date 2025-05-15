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

# Copier la configuration Nginx personnalisée si nécessaire
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copier les fichiers de build depuis l'étape de build
COPY --from=build /app/build /usr/share/nginx/html

# Exposer le port Nginx
EXPOSE 80

# Commande de démarrage pour Nginx
CMD ["nginx", "-g", "daemon off;"] 