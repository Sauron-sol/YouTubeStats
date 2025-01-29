# YouTube Stats Application

Cette application permet d'analyser les statistiques de chaînes YouTube en utilisant l'API YouTube Data v3.

## Prérequis

- Docker et Docker Compose installés sur votre machine
- Une clé API YouTube Data v3

## Obtenir une clé API YouTube

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Activez l'API YouTube Data v3 pour votre projet
4. Créez des identifiants (clé API)
5. Notez votre clé API, vous en aurez besoin pour la configuration

## Installation

1. Clonez le repository :
```bash
git clone https://github.com/votre-username/youtube-stats.git
cd youtube-stats
```

2. Créez un fichier `.env.docker` à la racine du projet :
```bash
NEXT_PUBLIC_YOUTUBE_API_KEY=your_youtube_api_key_here
```
Remplacez `your_youtube_api_key_here` par votre clé API YouTube.

3. Construisez et démarrez l'application :
```bash
# Construire l'image Docker
docker-compose build

# Démarrer l'application
docker-compose up -d
```

4. L'application sera disponible sur `http://localhost:3000`

## Utilisation

1. Accédez à l'application via votre navigateur sur `http://localhost:3000`
2. Entrez l'URL d'une chaîne YouTube ou son identifiant
3. Visualisez les statistiques et analyses

## Commandes Docker utiles

```bash
# Voir les logs de l'application
docker-compose logs -f

# Arrêter l'application
docker-compose down

# Reconstruire l'application (après modifications)
docker-compose build --no-cache
docker-compose up -d

# Nettoyer le cache Docker
docker system prune -af
```

## Structure du projet

```
youtube-stats/
├── .next/              # Fichiers build Next.js
├── components/         # Composants React réutilisables
├── pages/             # Pages de l'application
├── public/            # Fichiers statiques
├── styles/            # Fichiers de style
├── .env.docker        # Configuration Docker
├── Dockerfile         # Configuration de l'image Docker
├── docker-compose.yml # Configuration Docker Compose
└── package.json       # Dépendances et scripts
```

## Technologies utilisées

- Next.js
- React
- TypeScript
- TailwindCSS
- Docker
- YouTube Data API v3
