# Configuration Docker pour l'API Poker (Backend)

Ce document explique comment configurer et exécuter l'API Poker backend dans un environnement Docker.

## Structure

La configuration utilise Docker Compose pour orchestrer le service d'API:

**API (Backend)**

- Service NestJS exposé sur le port 3001
- Disponible en version développement et production
- Configuré pour accepter les requêtes CORS du frontend séparé

## Utilisation

### Développement

Pour démarrer l'environnement de développement:

```bash
# Démarrer l'API en mode développement
docker-compose up
```

Pour démarrer en arrière-plan:

```bash
docker-compose up -d
```

### Production

Pour démarrer l'environnement de production:

```bash
# Démarrer l'API en mode production
docker-compose --profile prod up
```

## Communication avec le Frontend

L'API est configurée pour être accessible:

- En local via `http://localhost:3001`
- À l'intérieur d'un réseau Docker via le nom d'hôte `api` ou `api-prod` (port 3000)

## Configuration CORS

L'API est configurée pour accepter les requêtes CORS des origines suivantes:

- `http://localhost:3000` (frontend en développement)
- `http://localhost` (frontend en production)

Vous pouvez modifier ces origines dans le fichier `docker-compose.yml` via la variable d'environnement `CORS_ORIGIN`.

## Réseau Docker

Le service API est connecté au réseau `poker-network`, ce qui permet de le connecter facilement à d'autres services comme le frontend.

## Volumes

- Les données SQLite sont persistées via un volume Docker
- Le code source est monté en volume pour le développement hot-reload

## Intégration avec le Frontend

Pour connecter un frontend conteneurisé séparément:

1. Assurez-vous que le frontend se connecte à l'API via l'URL `http://localhost:3001`
2. Si le frontend est dans un conteneur Docker, connectez-le au réseau `poker-network`
3. Dans le conteneur frontend, utilisez l'URL `http://api:3000` ou `http://api-prod:3000` pour accéder à l'API

## Notes sur la Sécurité

Pour un environnement de production réel:

1. Utilisez des secrets Docker ou des variables d'environnement sécurisées
2. Configurez CORS pour accepter uniquement les origines spécifiques
3. Utilisez HTTPS avec des certificats SSL
4. Considérez l'utilisation d'un reverse proxy comme Traefik ou NGINX
