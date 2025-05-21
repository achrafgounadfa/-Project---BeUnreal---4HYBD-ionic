# Documentation Technique - BeUnreal

## Introduction

BeUnreal est une application mobile hybride de type réseau social développée avec Ionic (React) et une architecture backend en microservices Node.js. L'application permet aux utilisateurs de partager des moments authentiques via des stories géolocalisées et éphémères, d'échanger des messages (texte, images, vidéos) et de gérer un réseau d'amis.

## Architecture

### Frontend
- **Framework** : Ionic React
- **Langage** : TypeScript
- **Gestion d'état** : Zustand
- **Navigation** : React Router
- **Composants UI** : Ionic Components

### Backend
L'architecture backend est basée sur des microservices indépendants :

1. **auth-service** : Gestion de l'authentification, inscription, connexion, vérification d'email et réinitialisation de mot de passe
2. **user-service** : Gestion des profils utilisateurs et des relations d'amitié
3. **message-service** : Gestion des messages privés et des groupes de discussion
4. **story-service** : Gestion des stories géolocalisées, des réactions et des commentaires

### Base de données
- MongoDB pour le stockage des données
- Modèles de données distincts pour chaque microservice

### Stockage de médias
- Cloudinary pour le stockage et la gestion des images et vidéos

## Configuration et Installation

### Prérequis
- Node.js v16+
- MongoDB v5+
- Compte Cloudinary (pour le stockage des médias)
- Compte Google Maps API (pour la géolocalisation)

### Installation du Backend

Pour chaque microservice (auth-service, user-service, message-service, story-service) :

1. Installer les dépendances :
```bash
cd backend/<service-name>
npm install
```

2. Configurer les variables d'environnement dans un fichier `.env` :
```
PORT=<port_number>
MONGODB_URI=mongodb://<username>:<password>@<host>:<port>/<database>
JWT_SECRET=<your_jwt_secret>
JWT_EXPIRES_IN=7d
EMAIL_USERNAME=<your_email>
EMAIL_PASSWORD=<your_email_password>
EMAIL_FROM=BeUnreal <noreply@beunreal.com>
FRONTEND_URL=http://localhost:8100
CLOUDINARY_CLOUD_NAME=<your_cloudinary_cloud_name>
CLOUDINARY_API_KEY=<your_cloudinary_api_key>
CLOUDINARY_API_SECRET=<your_cloudinary_api_secret>
```

3. Démarrer le service :
```bash
npm start
```

### Installation du Frontend

1. Installer les dépendances :
```bash
cd frontend/beunreal-app
npm install
```

2. Configurer les variables d'environnement dans un fichier `.env` :
```
REACT_APP_API_URL=http://localhost:3000
REACT_APP_GOOGLE_MAPS_API_KEY=<your_google_maps_api_key>
```

3. Démarrer l'application en mode développement :
```bash
ionic serve
```

4. Pour générer une version de production :
```bash
ionic build --prod
```

## Structure des API

### Auth Service

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/auth/signup` | POST | Inscription d'un nouvel utilisateur |
| `/api/auth/login` | POST | Connexion d'un utilisateur |
| `/api/auth/verify-email/:token` | GET | Vérification de l'adresse email |
| `/api/auth/resend-verification` | POST | Renvoi de l'email de vérification |
| `/api/auth/forgot-password` | POST | Demande de réinitialisation de mot de passe |
| `/api/auth/reset-password` | POST | Réinitialisation du mot de passe |

### User Service

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/users/:id` | GET | Récupération d'un profil utilisateur |
| `/api/users/:id` | PUT | Mise à jour d'un profil utilisateur |
| `/api/users/:id` | DELETE | Suppression d'un compte utilisateur |
| `/api/users/find` | GET | Recherche d'un utilisateur par email |
| `/api/users/search` | GET | Recherche d'utilisateurs par nom ou email |
| `/api/users/friend-requests/received` | GET | Récupération des demandes d'amis reçues |
| `/api/users/friend-requests/sent` | GET | Récupération des demandes d'amis envoyées |
| `/api/users/friend-requests/send` | POST | Envoi d'une demande d'ami |
| `/api/users/friend-requests/accept` | POST | Acceptation d'une demande d'ami |
| `/api/users/friend-requests/reject` | POST | Refus d'une demande d'ami |
| `/api/users/:id/friends` | GET | Récupération de la liste d'amis |
| `/api/users/:id/friends` | DELETE | Suppression d'un ami |

### Message Service

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/messages/:userId` | GET | Récupération des messages avec un utilisateur |
| `/api/messages` | POST | Envoi d'un message à un utilisateur |
| `/api/messages/groups/:groupId` | GET | Récupération des messages d'un groupe |
| `/api/messages/groups` | POST | Envoi d'un message à un groupe |
| `/api/messages/groups` | GET | Récupération des groupes de l'utilisateur |
| `/api/messages/groups` | POST | Création d'un groupe |
| `/api/messages/groups/:groupId/members` | POST | Ajout d'un membre à un groupe |
| `/api/messages/groups/:groupId/members` | DELETE | Suppression d'un membre d'un groupe |

### Story Service

| Endpoint | Méthode | Description |
|----------|---------|-------------|
| `/api/stories` | POST | Création d'une story |
| `/api/stories/nearby` | GET | Récupération des stories à proximité |
| `/api/stories/:storyId/reactions` | POST | Ajout d'une réaction à une story |
| `/api/stories/:storyId/comments` | POST | Ajout d'un commentaire à une story |
| `/api/stories/:storyId/reactions` | GET | Récupération des réactions d'une story |
| `/api/stories/:storyId/comments` | GET | Récupération des commentaires d'une story |
| `/api/stories/user/:userId` | GET | Récupération des stories d'un utilisateur |
| `/api/stories/:storyId` | DELETE | Suppression d'une story |

## Modèles de données

### User
```javascript
{
  email: String,
  username: String,
  password: String (hashed),
  profilePicture: String (URL),
  friends: [ObjectId],
  sentFriendRequests: [ObjectId],
  receivedFriendRequests: [ObjectId],
  isEmailVerified: Boolean,
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  createdAt: Date,
  updatedAt: Date
}
```

### Message
```javascript
{
  senderId: ObjectId,
  receiverId: ObjectId,
  content: String,
  mediaUrl: String,
  mediaType: String (enum: ['image', 'video', '']),
  isGroupMessage: Boolean,
  createdAt: Date
}
```

### Group
```javascript
{
  name: String,
  creator: ObjectId,
  members: [ObjectId],
  admins: [ObjectId],
  createdAt: Date,
  updatedAt: Date
}
```

### Story
```javascript
{
  userId: ObjectId,
  mediaUrl: String,
  mediaType: String (enum: ['image', 'video']),
  caption: String,
  location: {
    latitude: Number,
    longitude: Number
  },
  reactions: [{
    userId: ObjectId,
    emoji: String,
    createdAt: Date
  }],
  comments: [{
    userId: ObjectId,
    content: String,
    createdAt: Date
  }],
  createdAt: Date,
  expiresAt: Date
}
```

## Fonctionnalités principales

### Authentification et gestion de compte
- Inscription avec vérification d'email obligatoire
- Connexion sécurisée
- Réinitialisation de mot de passe
- Modification du profil utilisateur
- Suppression de compte

### Gestion des amis
- Recherche d'utilisateurs
- Envoi de demandes d'amis
- Acceptation/refus des demandes
- Suppression d'amis
- Visualisation de la liste d'amis

### Messagerie
- Conversations privées
- Envoi de messages texte
- Envoi d'images
- Envoi de vidéos courtes (≤ 10s)
- Groupes de discussion

### Stories
- Création de stories géolocalisées
- Support d'images et vidéos
- Durée de vie limitée (24h)
- Réactions avec emojis
- Commentaires
- Carte interactive pour visualiser les stories à proximité

### Caméra
- Capture d'images
- Enregistrement de vidéos courtes
- Support de la double caméra (avant/arrière simultanément)
- Limitation automatique de la durée des vidéos

## Sécurité

- Authentification par JWT (JSON Web Tokens)
- Hachage des mots de passe avec bcrypt
- Validation des données avec Zod
- Protection CSRF
- Vérification des autorisations pour chaque action
- Expiration automatique des tokens de réinitialisation et de vérification

## Performance

- Optimisation des requêtes MongoDB avec indexation
- Mise en cache des données fréquemment accédées
- Limitation de la taille des médias
- Pagination des résultats pour les listes longues
- Chargement différé des médias

## Déploiement

### Backend
Les microservices peuvent être déployés individuellement sur des plateformes comme :
- Heroku
- AWS Elastic Beanstalk
- Google Cloud Run
- Digital Ocean App Platform

### Frontend
L'application Ionic peut être déployée comme :
- Application web progressive (PWA)
- Application native Android via Capacitor/Cordova
- Application native iOS via Capacitor/Cordova

## Maintenance et évolution

### Monitoring
- Utilisation de Winston pour la journalisation
- Intégration possible avec Sentry pour le suivi des erreurs

### Évolutions futures
- Implémentation de WebSockets pour les messages en temps réel
- Ajout de filtres pour les photos et vidéos
- Système de notifications push
- Amélioration de la recherche géographique avec clustering
- Support de stories collaboratives

## Conclusion

BeUnreal est une application complète qui combine les fonctionnalités de messagerie et de partage de stories éphémères, avec une attention particulière portée à l'authenticité des moments partagés grâce à la double caméra. L'architecture en microservices permet une évolution et une maintenance facilitées, ainsi qu'une bonne scalabilité.
