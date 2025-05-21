import express from 'express';
import { 
  getUser, 
  updateUser, 
  deleteUser, 
  findUserByEmail, 
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  getFriends,
  getReceivedFriendRequests,
  getSentFriendRequests
} from '../controllers/userController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// Rechercher un utilisateur par email
router.get('/find', findUserByEmail);

// Rechercher des utilisateurs par nom d'utilisateur ou email
router.get('/search', searchUsers);

// Récupérer les demandes d'amis reçues
router.get('/friend-requests/received', getReceivedFriendRequests);

// Récupérer les demandes d'amis envoyées
router.get('/friend-requests/sent', getSentFriendRequests);

// Envoyer une demande d'ami
router.post('/friend-requests/send', sendFriendRequest);

// Accepter une demande d'ami
router.post('/friend-requests/accept', acceptFriendRequest);

// Refuser une demande d'ami
router.post('/friend-requests/reject', rejectFriendRequest);

// Récupérer un utilisateur par ID
router.get('/:id', getUser);

// Mettre à jour un utilisateur
router.put('/:id', updateUser);

// Supprimer un utilisateur
router.delete('/:id', deleteUser);

// Récupérer la liste d'amis d'un utilisateur
router.get('/:id/friends', getFriends);

// Supprimer un ami
router.delete('/:id/friends', removeFriend);

export default router;
