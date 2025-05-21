# Guide d'installation BeUnreal

Ce guide vous explique comment installer et exécuter le projet BeUnreal, une plateforme sociale moderne de communication.

## Prérequis

Avant de commencer, assurez-vous d'avoir installé les éléments suivants sur votre machine :

- [Node.js](https://nodejs.org/) (v16 ou supérieur)
- [npm](https://www.npmjs.com/) (v8 ou supérieur)
- [Docker](https://www.docker.com/) et [Docker Compose](https://docs.docker.com/compose/) (pour l'exécution conteneurisée)
- [Ionic CLI](https://ionicframework.com/docs/cli) (pour le développement frontend)
- [Android Studio](https://developer.android.com/studio) (pour la génération de l'APK Android)

## Configuration des variables d'environnement

1. Créez un compte [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) si vous n'en avez pas déjà un.
2. Créez un cluster et obtenez votre chaîne de connexion.
3. Créez un compte [Cloudinary](https://cloudinary.com/) pour le stockage des médias.
4. Obtenez vos identifiants Cloudinary (Cloud name, API Key, API Secret).

## Installation et démarrage

### Option 1 : Utilisation de Docker (recommandé)

1. Clonez le dépôt :
   ```bash
   git clone <url-du-depot>
   cd Projet-BeUnreal-4HYBD-master
   ```

2. Le fichier `docker-compose.yml` est déjà configuré avec les variables d'environnement nécessaires. Si vous souhaitez utiliser vos propres identifiants, modifiez ce fichier.

3. Lancez les services avec Docker Compose :
   ```bash
   docker-compose up -d
   ```

4. Les services seront disponibles aux adresses suivantes :
   - Auth Service : http://localhost:3001
   - User Service : http://localhost:3002
   - Message Service : http://localhost:3003
   - Story Service : http://localhost:3004
   - Frontend : http://localhost:8100

### Option 2 : Installation manuelle

#### Backend

1. Clonez le dépôt :
   ```bash
   git clone <url-du-depot>
   cd Projet-BeUnreal-4HYBD-master
   ```

2. Pour chaque microservice (auth-service, user-service, message-service, story-service) :
   ```bash
   cd backend/<service-name>
   npm install
   ```

3. Créez un fichier `.env` dans chaque dossier de microservice en vous basant sur le fichier `.env.example` :
   ```
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<database>?retryWrites=true&w=majority
   PORT=300X
   JWT_SECRET=votre_secret_jwt
   CLOUDINARY_CLOUD_NAME=votre_cloud_name
   CLOUDINARY_API_KEY=votre_api_key
   CLOUDINARY_API_SECRET=votre_api_secret
   ```

4. Démarrez chaque microservice :
   ```bash
   npm start
   ```

#### Frontend

1. Accédez au dossier frontend :
   ```bash
   cd frontend/beunreal-app
   ```

2. Installez les dépendances :
   ```bash
   npm install
   ```

3. Créez un fichier `.env` à la racine du projet frontend :
   ```
   REACT_APP_API_URL_AUTH=http://localhost:3001/api
   REACT_APP_API_URL_USER=http://localhost:3002/api
   REACT_APP_API_URL_MESSAGE=http://localhost:3003/api
   REACT_APP_API_URL_STORY=http://localhost:3004/api
   ```

4. Démarrez l'application en mode développement :
   ```bash
   ionic serve
   ```

## Génération de l'APK Android

1. Assurez-vous d'avoir installé Android Studio et configuré les variables d'environnement nécessaires.

2. Accédez au dossier frontend :
   ```bash
   cd frontend/beunreal-app
   ```

3. Ajoutez la plateforme Android :
   ```bash
   ionic capacitor add android
   ```

4. Construisez l'application :
   ```bash
   ionic capacitor build android
   ```

5. Cette commande ouvrira Android Studio. Utilisez l'option "Build > Build Bundle(s) / APK(s) > Build APK(s)" pour générer l'APK.

6. L'APK sera disponible dans le dossier `android/app/build/outputs/apk/debug/`.

## Utilisation de l'application

### Identifiants de test

Vous pouvez utiliser les identifiants suivants pour tester l'application :

- Email : test@beunreal.com
- Mot de passe : Test123!

### Fonctionnalités principales

- **Authentification** : Inscription et connexion
- **Profil utilisateur** : Modification du profil et de la photo
- **Amis** : Recherche et ajout d'amis
- **Messagerie** : Envoi de messages texte, image et vidéo en privé ou en groupe
- **Stories** : Publication de stories géolocalisées et découverte des stories à proximité

## Dépannage

### Problèmes de connexion à MongoDB Atlas

- Vérifiez que votre adresse IP est autorisée dans les paramètres de sécurité de MongoDB Atlas.
- Assurez-vous que les identifiants dans la chaîne de connexion sont corrects.

### Problèmes avec Cloudinary

- Vérifiez que vos identifiants Cloudinary sont corrects.
- Assurez-vous que votre compte Cloudinary est actif.

### Problèmes de démarrage des microservices

- Vérifiez que les ports ne sont pas déjà utilisés par d'autres applications.
- Assurez-vous que les variables d'environnement sont correctement configurées.

### Problèmes avec l'application mobile

- Vérifiez que les URL des API sont correctes dans le fichier `.env`.
- Assurez-vous que tous les microservices sont en cours d'exécution.

## Ressources supplémentaires

- [Documentation API](./api-documentation.md)
- [Collection Postman](./postman_collection.json)
