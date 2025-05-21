# Documentation API BeUnreal

## Introduction

Cette documentation décrit les API RESTful du projet BeUnreal, une plateforme sociale moderne de communication. Les API sont organisées en microservices pour une meilleure scalabilité et maintenance.

## Base URL

Tous les endpoints API sont relatifs aux URLs de base suivantes :

- **Auth Service**: `http://localhost:3001/api`
- **User Service**: `http://localhost:3002/api`
- **Message Service**: `http://localhost:3003/api`
- **Story Service**: `http://localhost:3004/api`

## Authentification

La plupart des endpoints nécessitent une authentification via JWT (JSON Web Token). Pour ces endpoints, incluez le token dans l'en-tête HTTP comme suit :

```
Authorization: Bearer <votre_token_jwt>
```

## Format des réponses

Toutes les réponses sont au format JSON avec la structure suivante :

```json
{
  "success": true|false,
  "data": {}, // Les données demandées (si success est true)
  "message": "Description du résultat ou de l'erreur"
}
```

## Codes d'état HTTP

- `200 OK` : Requête traitée avec succès
- `201 Created` : Ressource créée avec succès
- `400 Bad Request` : Requête invalide
- `401 Unauthorized` : Authentification requise
- `403 Forbidden` : Accès refusé
- `404 Not Found` : Ressource non trouvée
- `500 Internal Server Error` : Erreur serveur

## Auth Service API

### Inscription

**POST** `/auth/register`

Crée un nouveau compte utilisateur.

**Corps de la requête :**

```json
{
  "email": "utilisateur@exemple.com",
  "username": "utilisateur",
  "password": "motdepasse"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "utilisateur@exemple.com",
      "username": "utilisateur"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Inscription réussie"
}
```

### Connexion

**POST** `/auth/login`

Authentifie un utilisateur existant.

**Corps de la requête :**

```json
{
  "email": "utilisateur@exemple.com",
  "password": "motdepasse"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "utilisateur@exemple.com",
      "username": "utilisateur"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Connexion réussie"
}
```

### Vérifier le token

**GET** `/auth/verify`

Vérifie la validité du token JWT.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "utilisateur@exemple.com",
      "username": "utilisateur"
    }
  },
  "message": "Token valide"
}
```

## User Service API

### Obtenir le profil utilisateur

**GET** `/users/profile`

Récupère le profil de l'utilisateur connecté.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "utilisateur@exemple.com",
      "username": "utilisateur",
      "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user123.jpg",
      "friends": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
    }
  },
  "message": "Profil récupéré avec succès"
}
```

### Mettre à jour le profil

**PUT** `/users/profile`

Met à jour le profil de l'utilisateur connecté.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Corps de la requête :**

```json
{
  "username": "nouveau_nom",
  "profilePicture": "base64_encoded_image_data"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "user": {
      "id": "60d21b4667d0d8992e610c85",
      "email": "utilisateur@exemple.com",
      "username": "nouveau_nom",
      "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456999/profiles/user123_updated.jpg"
    }
  },
  "message": "Profil mis à jour avec succès"
}
```

### Rechercher des utilisateurs

**GET** `/users/search?query=<terme_recherche>`

Recherche des utilisateurs par nom d'utilisateur ou email.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "60d21b4667d0d8992e610c86",
        "username": "utilisateur2",
        "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user456.jpg"
      },
      {
        "id": "60d21b4667d0d8992e610c87",
        "username": "utilisateur3",
        "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user789.jpg"
      }
    ]
  },
  "message": "Recherche effectuée avec succès"
}
```

### Ajouter un ami

**POST** `/users/friends`

Ajoute un utilisateur à la liste d'amis.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Corps de la requête :**

```json
{
  "friendId": "60d21b4667d0d8992e610c86"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "friends": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
  },
  "message": "Ami ajouté avec succès"
}
```

### Obtenir la liste d'amis

**GET** `/users/friends`

Récupère la liste d'amis de l'utilisateur connecté.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "friends": [
      {
        "id": "60d21b4667d0d8992e610c86",
        "username": "utilisateur2",
        "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user456.jpg"
      },
      {
        "id": "60d21b4667d0d8992e610c87",
        "username": "utilisateur3",
        "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user789.jpg"
      }
    ]
  },
  "message": "Liste d'amis récupérée avec succès"
}
```

## Message Service API

### Obtenir les conversations

**GET** `/messages/conversations`

Récupère toutes les conversations de l'utilisateur connecté.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "conversations": [
      {
        "id": "60d21b4667d0d8992e610c90",
        "participants": [
          {
            "id": "60d21b4667d0d8992e610c85",
            "username": "utilisateur",
            "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user123.jpg"
          },
          {
            "id": "60d21b4667d0d8992e610c86",
            "username": "utilisateur2",
            "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user456.jpg"
          }
        ],
        "lastMessage": {
          "id": "60d21b4667d0d8992e610c95",
          "sender": "60d21b4667d0d8992e610c86",
          "content": "Salut, comment ça va ?",
          "timestamp": "2023-06-23T12:34:56.789Z",
          "read": false
        },
        "isGroup": false
      },
      {
        "id": "60d21b4667d0d8992e610c91",
        "name": "Groupe Amis",
        "participants": [
          {
            "id": "60d21b4667d0d8992e610c85",
            "username": "utilisateur",
            "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user123.jpg"
          },
          {
            "id": "60d21b4667d0d8992e610c86",
            "username": "utilisateur2",
            "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user456.jpg"
          },
          {
            "id": "60d21b4667d0d8992e610c87",
            "username": "utilisateur3",
            "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user789.jpg"
          }
        ],
        "lastMessage": {
          "id": "60d21b4667d0d8992e610c96",
          "sender": "60d21b4667d0d8992e610c87",
          "content": "On se retrouve où ?",
          "timestamp": "2023-06-23T10:12:34.567Z",
          "read": false
        },
        "isGroup": true
      }
    ]
  },
  "message": "Conversations récupérées avec succès"
}
```

### Obtenir les messages d'une conversation

**GET** `/messages/conversations/:conversationId`

Récupère tous les messages d'une conversation spécifique.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "60d21b4667d0d8992e610c90",
      "participants": [
        {
          "id": "60d21b4667d0d8992e610c85",
          "username": "utilisateur",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user123.jpg"
        },
        {
          "id": "60d21b4667d0d8992e610c86",
          "username": "utilisateur2",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user456.jpg"
        }
      ],
      "isGroup": false
    },
    "messages": [
      {
        "id": "60d21b4667d0d8992e610c95",
        "sender": {
          "id": "60d21b4667d0d8992e610c86",
          "username": "utilisateur2",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user456.jpg"
        },
        "content": "Salut, comment ça va ?",
        "timestamp": "2023-06-23T12:34:56.789Z",
        "read": true,
        "type": "text"
      },
      {
        "id": "60d21b4667d0d8992e610c97",
        "sender": {
          "id": "60d21b4667d0d8992e610c85",
          "username": "utilisateur",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user123.jpg"
        },
        "content": "Ça va bien, merci !",
        "timestamp": "2023-06-23T12:36:12.345Z",
        "read": true,
        "type": "text"
      }
    ]
  },
  "message": "Messages récupérés avec succès"
}
```

### Envoyer un message texte

**POST** `/messages/conversations/:conversationId`

Envoie un message texte dans une conversation.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Corps de la requête :**

```json
{
  "content": "Bonjour, comment ça va ?",
  "type": "text"
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "60d21b4667d0d8992e610c98",
      "sender": "60d21b4667d0d8992e610c85",
      "content": "Bonjour, comment ça va ?",
      "timestamp": "2023-06-23T14:25:36.789Z",
      "read": false,
      "type": "text"
    }
  },
  "message": "Message envoyé avec succès"
}
```

### Envoyer un message média (image/vidéo)

**POST** `/messages/conversations/:conversationId/media`

Envoie une image ou une vidéo dans une conversation.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Corps de la requête (multipart/form-data) :**

```
media: [fichier binaire]
type: "image" ou "video"
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "message": {
      "id": "60d21b4667d0d8992e610c99",
      "sender": "60d21b4667d0d8992e610c85",
      "content": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456999/messages/img123.jpg",
      "timestamp": "2023-06-23T14:30:45.678Z",
      "read": false,
      "type": "image"
    }
  },
  "message": "Message média envoyé avec succès"
}
```

### Créer un groupe de discussion

**POST** `/messages/groups`

Crée un nouveau groupe de discussion.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Corps de la requête :**

```json
{
  "name": "Groupe Projet",
  "participants": ["60d21b4667d0d8992e610c86", "60d21b4667d0d8992e610c87"]
}
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "conversation": {
      "id": "60d21b4667d0d8992e610c92",
      "name": "Groupe Projet",
      "participants": [
        "60d21b4667d0d8992e610c85",
        "60d21b4667d0d8992e610c86",
        "60d21b4667d0d8992e610c87"
      ],
      "isGroup": true,
      "createdAt": "2023-06-23T15:00:00.000Z"
    }
  },
  "message": "Groupe créé avec succès"
}
```

## Story Service API

### Publier une story

**POST** `/stories`

Publie une nouvelle story avec géolocalisation.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Corps de la requête (multipart/form-data) :**

```
media: [fichier binaire]
type: "image" ou "video"
caption: "Ma nouvelle story"
latitude: 48.8566
longitude: 2.3522
location: "Paris, France"
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "story": {
      "id": "60d21b4667d0d8992e610d00",
      "userId": "60d21b4667d0d8992e610c85",
      "mediaUrl": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456999/stories/story123.jpg",
      "type": "image",
      "caption": "Ma nouvelle story",
      "location": {
        "type": "Point",
        "coordinates": [2.3522, 48.8566],
        "name": "Paris, France"
      },
      "createdAt": "2023-06-23T16:00:00.000Z",
      "expiresAt": "2023-06-24T16:00:00.000Z"
    }
  },
  "message": "Story publiée avec succès"
}
```

### Obtenir les stories

**GET** `/stories`

Récupère toutes les stories des amis de l'utilisateur connecté.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "stories": [
      {
        "id": "60d21b4667d0d8992e610d00",
        "user": {
          "id": "60d21b4667d0d8992e610c85",
          "username": "utilisateur",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user123.jpg"
        },
        "mediaUrl": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456999/stories/story123.jpg",
        "type": "image",
        "caption": "Ma nouvelle story",
        "location": {
          "type": "Point",
          "coordinates": [2.3522, 48.8566],
          "name": "Paris, France"
        },
        "createdAt": "2023-06-23T16:00:00.000Z",
        "expiresAt": "2023-06-24T16:00:00.000Z"
      },
      {
        "id": "60d21b4667d0d8992e610d01",
        "user": {
          "id": "60d21b4667d0d8992e610c86",
          "username": "utilisateur2",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user456.jpg"
        },
        "mediaUrl": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456999/stories/story456.jpg",
        "type": "image",
        "caption": "Belle journée !",
        "location": {
          "type": "Point",
          "coordinates": [4.8357, 45.7640],
          "name": "Lyon, France"
        },
        "createdAt": "2023-06-23T15:30:00.000Z",
        "expiresAt": "2023-06-24T15:30:00.000Z"
      }
    ]
  },
  "message": "Stories récupérées avec succès"
}
```

### Obtenir les stories à proximité

**GET** `/stories/nearby?latitude=48.8566&longitude=2.3522&radius=5000`

Récupère les stories publiées à proximité de la position spécifiée.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Paramètres de requête :**
- `latitude` : Latitude de la position actuelle
- `longitude` : Longitude de la position actuelle
- `radius` : Rayon de recherche en mètres (optionnel, défaut: 5000)

**Réponse :**

```json
{
  "success": true,
  "data": {
    "stories": [
      {
        "id": "60d21b4667d0d8992e610d00",
        "user": {
          "id": "60d21b4667d0d8992e610c85",
          "username": "utilisateur",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user123.jpg"
        },
        "mediaUrl": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456999/stories/story123.jpg",
        "type": "image",
        "caption": "Ma nouvelle story",
        "location": {
          "type": "Point",
          "coordinates": [2.3522, 48.8566],
          "name": "Paris, France"
        },
        "createdAt": "2023-06-23T16:00:00.000Z",
        "expiresAt": "2023-06-24T16:00:00.000Z",
        "distance": 0
      },
      {
        "id": "60d21b4667d0d8992e610d02",
        "user": {
          "id": "60d21b4667d0d8992e610c87",
          "username": "utilisateur3",
          "profilePicture": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456789/profiles/user789.jpg"
        },
        "mediaUrl": "https://res.cloudinary.com/dvusswt2u/image/upload/v1624456999/stories/story789.jpg",
        "type": "image",
        "caption": "Tour Eiffel",
        "location": {
          "type": "Point",
          "coordinates": [2.2945, 48.8584],
          "name": "Tour Eiffel, Paris"
        },
        "createdAt": "2023-06-23T14:45:00.000Z",
        "expiresAt": "2023-06-24T14:45:00.000Z",
        "distance": 3200
      }
    ]
  },
  "message": "Stories à proximité récupérées avec succès"
}
```

### Marquer une story comme vue

**POST** `/stories/:storyId/view`

Marque une story comme vue par l'utilisateur connecté.

**En-têtes :**

```
Authorization: Bearer <votre_token_jwt>
```

**Réponse :**

```json
{
  "success": true,
  "data": {
    "viewed": true
  },
  "message": "Story marquée comme vue"
}
```

## Erreurs courantes

### Erreur d'authentification

```json
{
  "success": false,
  "message": "Non authentifié. Veuillez vous connecter."
}
```

### Ressource non trouvée

```json
{
  "success": false,
  "message": "Ressource non trouvée."
}
```

### Erreur de validation

```json
{
  "success": false,
  "message": "Erreur de validation",
  "errors": [
    {
      "field": "email",
      "message": "Email invalide"
    },
    {
      "field": "password",
      "message": "Le mot de passe doit contenir au moins 8 caractères"
    }
  ]
}
```

## Limites et quotas

- Taille maximale des fichiers média : 10 Mo
- Durée maximale des vidéos : 10 secondes
- Nombre maximum de requêtes par minute : 100
- Nombre maximum d'amis par utilisateur : 5000
- Durée de validité des stories : 24 heures
