import axios from 'axios';
import { Photo } from '@capacitor/camera';

// Configuration de base pour Axios
// Modification de l'URL de base pour correspondre au backend
const API_URL = 'http://localhost:3001/api';

// Création d'une instance Axios avec configuration par défaut
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  // Ajout d'un timeout pour éviter les attentes infinies
  timeout: 10000,
});

// Intercepteur pour ajouter le token d'authentification aux requêtes
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log des erreurs pour faciliter le débogage
    console.error('API Error:', error.response || error.message);
    return Promise.reject(error);
  }
);

// Types pour les requêtes
interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

// Services d'authentification
export const authService = {
  // Inscription d'un nouvel utilisateur
  register: (userData: RegisterData) => {
    return api.post('/auth/signup', userData);
  },
  
  // Connexion d'un utilisateur
  login: (credentials: LoginData) => {
    return api.post('/auth/login', credentials);
  },
};

// Services utilisateur
export const userService = {
  // Obtenir le profil de l'utilisateur courant
  getCurrentUser: () => {
    return api.get('/users/me');
  },
  
  // Mettre à jour le profil utilisateur
  updateProfile: (userData: Partial<{ username: string, profilePicture: string }>) => {
    return api.put('/users/me', userData);
  },
  
  // Rechercher des utilisateurs
  searchUsers: (query: string) => {
    return api.get(`/users/search?q=${query}`);
  },
  
  // Ajouter un ami
  addFriend: (userId: string) => {
    return api.post(`/users/friends/${userId}`);
  },
  
  // Obtenir la liste d'amis
  getFriends: () => {
    return api.get('/users/friends');
  },
};

// Services de messagerie
export const messageService = {
  // Obtenir les conversations
  getConversations: () => {
    return api.get('/messages/conversations');
  },
  
  // Obtenir les messages d'une conversation
  getMessages: (conversationId: string) => {
    return api.get(`/messages/conversations/${conversationId}`);
  },
  
  // Envoyer un message
  sendMessage: (receiverId: string, content: string, mediaFile: File | null = null) => {
    const formData = new FormData();
    formData.append('receiverId', receiverId);
    formData.append('content', content);
    
    if (mediaFile) {
      formData.append('media', mediaFile);
    }
    
    return api.post('/messages/send', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Créer un groupe
  createGroup: (name: string, memberIds: string[]) => {
    return api.post('/messages/groups', { name, memberIds });
  },
};

// Services de stories
export const storyService = {
  // Obtenir les stories à proximité
  getNearbyStories: (latitude: number, longitude: number, radius = 5) => {
    return api.get(`/stories/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
  },
  
  // Créer une story
  createStory: (mediaFile: File, latitude: number, longitude: number, caption?: string, location?: string) => {
    const formData = new FormData();
    formData.append('media', mediaFile);
    formData.append('latitude', latitude.toString());
    formData.append('longitude', longitude.toString());
    
    if (caption) {
      formData.append('caption', caption);
    }
    
    if (location) {
      formData.append('location', location);
    }
    
    return api.post('/stories', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  },
  
  // Obtenir les stories d'un utilisateur
  getUserStories: (userId: string) => {
    return api.get(`/stories/user/${userId}`);
  },
};

export default api;
