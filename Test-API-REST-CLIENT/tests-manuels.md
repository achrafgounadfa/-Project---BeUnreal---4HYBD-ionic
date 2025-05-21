# Tests manuels pour BeUnreal

Ce document décrit les procédures de test manuel pour vérifier le bon fonctionnement des fonctionnalités principales de l'application BeUnreal.

## 1. Test d'authentification

### 1.1 Inscription
1. Ouvrir l'application
2. Cliquer sur "S'inscrire"
3. Remplir le formulaire avec des informations valides :
   - Email : test@example.com
   - Nom d'utilisateur : testuser
   - Mot de passe : Test123!
4. Cliquer sur "S'inscrire"
5. **Résultat attendu** : Redirection vers la page d'accueil de l'application

### 1.2 Connexion
1. Ouvrir l'application
2. Entrer les identifiants :
   - Email : test@beunreal.com
   - Mot de passe : Test123!
3. Cliquer sur "Se connecter"
4. **Résultat attendu** : Redirection vers la page d'accueil de l'application

### 1.3 Déconnexion
1. Se connecter à l'application
2. Aller dans l'onglet "Profil"
3. Cliquer sur "Déconnexion"
4. **Résultat attendu** : Redirection vers la page de connexion

## 2. Test de messagerie

### 2.1 Envoi de message texte
1. Se connecter à l'application
2. Aller dans l'onglet "Messages"
3. Sélectionner une conversation existante
4. Entrer un message dans le champ de texte
5. Cliquer sur le bouton d'envoi
6. **Résultat attendu** : Le message apparaît dans la conversation

### 2.2 Envoi d'image
1. Se connecter à l'application
2. Aller dans l'onglet "Messages"
3. Sélectionner une conversation existante
4. Cliquer sur le bouton d'ajout de média
5. Sélectionner "Photo"
6. Prendre une photo ou sélectionner une image de la galerie
7. **Résultat attendu** : L'image apparaît dans la conversation

### 2.3 Envoi de vidéo courte
1. Se connecter à l'application
2. Aller dans l'onglet "Messages"
3. Sélectionner une conversation existante
4. Cliquer sur le bouton d'ajout de média
5. Sélectionner "Vidéo"
6. Enregistrer une vidéo courte (≤10s)
7. **Résultat attendu** : La vidéo apparaît dans la conversation

### 2.4 Création de groupe
1. Se connecter à l'application
2. Aller dans l'onglet "Messages"
3. Cliquer sur le bouton de création de groupe
4. Entrer un nom pour le groupe
5. Sélectionner plusieurs amis
6. Cliquer sur "Créer le groupe"
7. **Résultat attendu** : Le nouveau groupe apparaît dans la liste des conversations

### 2.5 Envoi de message dans un groupe
1. Se connecter à l'application
2. Aller dans l'onglet "Messages"
3. Sélectionner une conversation de groupe existante
4. Envoyer un message texte, une image ou une vidéo
5. **Résultat attendu** : Le message apparaît dans la conversation de groupe

## 3. Test de stories

### 3.1 Publication d'une story avec photo
1. Se connecter à l'application
2. Cliquer sur le bouton central de caméra
3. Prendre une photo
4. Ajouter une légende (optionnel)
5. Cliquer sur "Publier"
6. **Résultat attendu** : La story apparaît dans la section "Stories" en haut de l'écran

### 3.2 Publication d'une story avec vidéo
1. Se connecter à l'application
2. Cliquer sur le bouton central de caméra
3. Basculer en mode vidéo
4. Enregistrer une vidéo courte (≤10s)
5. Ajouter une légende (optionnel)
6. Cliquer sur "Publier"
7. **Résultat attendu** : La story apparaît dans la section "Stories" en haut de l'écran

### 3.3 Visualisation des stories
1. Se connecter à l'application
2. Cliquer sur une story dans la section "Stories" en haut de l'écran
3. **Résultat attendu** : La story s'affiche en plein écran
4. Cliquer pour passer à la story suivante
5. **Résultat attendu** : La story suivante s'affiche

### 3.4 Découverte de stories à proximité
1. Se connecter à l'application
2. Aller dans l'onglet "Home"
3. Vérifier que la carte affiche des marqueurs pour les stories à proximité
4. Cliquer sur un marqueur
5. **Résultat attendu** : Un aperçu de la story s'affiche
6. Cliquer sur l'aperçu
7. **Résultat attendu** : La story s'affiche en plein écran

## 4. Test de recherche d'amis

### 4.1 Recherche d'utilisateurs
1. Se connecter à l'application
2. Aller dans l'onglet "Discover"
3. Entrer un terme de recherche dans la barre de recherche
4. **Résultat attendu** : Les utilisateurs correspondants s'affichent dans les résultats

### 4.2 Ajout d'un ami
1. Se connecter à l'application
2. Aller dans l'onglet "Discover"
3. Rechercher un utilisateur
4. Cliquer sur le bouton "Ajouter" à côté d'un utilisateur
5. **Résultat attendu** : L'utilisateur est ajouté à la liste d'amis

## 5. Test de profil

### 5.1 Visualisation du profil
1. Se connecter à l'application
2. Aller dans l'onglet "Profil"
3. **Résultat attendu** : Les informations du profil s'affichent correctement

### 5.2 Modification du profil
1. Se connecter à l'application
2. Aller dans l'onglet "Profil"
3. Cliquer sur "Modifier le profil"
4. Modifier le nom d'utilisateur
5. Cliquer sur "Enregistrer"
6. **Résultat attendu** : Le profil est mis à jour avec le nouveau nom d'utilisateur

### 5.3 Changement de photo de profil
1. Se connecter à l'application
2. Aller dans l'onglet "Profil"
3. Cliquer sur la photo de profil
4. Sélectionner "Changer la photo"
5. Prendre une photo ou sélectionner une image de la galerie
6. **Résultat attendu** : La photo de profil est mise à jour

## 6. Test de géolocalisation

### 6.1 Autorisation de géolocalisation
1. Se connecter à l'application
2. Aller dans l'onglet "Home"
3. Si demandé, autoriser l'accès à la localisation
4. **Résultat attendu** : La carte se centre sur la position actuelle

### 6.2 Affichage des stories sur la carte
1. Se connecter à l'application
2. Aller dans l'onglet "Home"
3. **Résultat attendu** : Des marqueurs pour les stories à proximité s'affichent sur la carte

## 7. Test de l'interface utilisateur

### 7.1 Navigation entre les onglets
1. Se connecter à l'application
2. Cliquer sur chaque onglet de la barre de navigation (Home, Messages, Discover, Profil)
3. **Résultat attendu** : L'application navigue correctement entre les différentes sections

### 7.2 Bouton central de caméra
1. Se connecter à l'application
2. Cliquer sur le bouton central de caméra
3. **Résultat attendu** : L'interface de capture photo/vidéo s'ouvre

### 7.3 Responsive design
1. Tester l'application sur différents appareils (ou en redimensionnant la fenêtre du navigateur)
2. **Résultat attendu** : L'interface s'adapte correctement à différentes tailles d'écran

## 8. Test de performance

### 8.1 Chargement initial
1. Ouvrir l'application
2. **Résultat attendu** : L'application se charge en moins de 5 secondes

### 8.2 Navigation fluide
1. Se connecter à l'application
2. Naviguer rapidement entre différentes sections
3. **Résultat attendu** : La navigation est fluide, sans délais perceptibles

### 8.3 Chargement des médias
1. Se connecter à l'application
2. Ouvrir une conversation contenant des images ou des vidéos
3. **Résultat attendu** : Les médias se chargent rapidement et s'affichent correctement
