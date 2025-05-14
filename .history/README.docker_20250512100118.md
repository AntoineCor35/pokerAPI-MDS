# Intégration Docker pour Frontend et Backend

Ce document explique comment configurer et exécuter l'API Poker avec un frontend dans un environnement Docker.

## Structure des conteneurs

La configuration utilise Docker Compose pour orchestrer les services suivants:

1. **API (Backend)**

   - Service NestJS exposé sur le port 3001
   - Disponible en version développement et production

2. **Frontend**
   - Application web (React, Angular, Vue, etc.)
   - Exposée sur le port 3000 (dev) ou 80 (prod)
   - Communique avec l'API via le réseau Docker

## Utilisation

### Préparation

1. Assurez-vous d'avoir un dossier `frontend` à la racine du projet (si vous utilisez le docker-compose.full.yml)

   ```bash
   mkdir -p frontend
   # Initialisez votre projet frontend ici (React, Vue, Angular, etc.)
   ```

2. Copiez les fichiers de configuration
   ```bash
   # Utilisez les fichiers préparés comme références
   cp frontend.Dockerfile frontend/Dockerfile
   cp nginx.conf frontend/nginx.conf  # Optionnel pour la production
   ```

### Développement

Pour démarrer l'environnement de développement complet:

```bash
# Utiliser le docker-compose modifié qui inclut le frontend et le backend
docker-compose -f docker-compose.full.yml up
```

### Production

Pour démarrer l'environnement de production:

```bash
# Démarrer uniquement les services de production
docker-compose -f docker-compose.full.yml --profile prod up
```

## Communication entre les services

### En développement

- Le frontend peut accéder à l'API via `http://localhost:3001`
- L'API accepte les requêtes CORS du frontend

### En production

- Le frontend peut accéder à l'API via un proxy Nginx
- Les utilisateurs accèdent à tout via un seul point d'entrée (port 80)

## Configuration CORS

L'API est configurée pour accepter les requêtes CORS des origines suivantes:

- `http://localhost:3000` (frontend en développement local)
- `http://frontend:3000` (frontend en conteneur Docker)
- `http://localhost` (frontend en production)

## Réseaux Docker

Tous les services sont connectés via le réseau `poker-network`, ce qui leur permet de communiquer entre eux en utilisant leurs noms de conteneur comme noms d'hôtes.

## Volumes

- Les données SQLite sont persistées via un volume Docker
- Le code source est monté en volume pour le développement hot-reload

## Notes sur la sécurité

Pour un environnement de production réel:

1. Utilisez des secrets Docker ou des variables d'environnement sécurisées pour les identifiants
2. Configurez CORS pour accepter uniquement les origines spécifiques (pas de wildcard '\*')
3. Utilisez HTTPS avec des certificats SSL
4. Considérez l'utilisation d'un reverse proxy comme Traefik ou NGINX Proxy Manager
