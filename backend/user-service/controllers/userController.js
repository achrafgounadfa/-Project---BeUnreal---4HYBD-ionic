import User from '../models/User.js';
import { z } from 'zod';

// Schéma de validation pour la mise à jour utilisateur
const updateUserSchema = z.object({
  username: z.string().min(3).optional(),
  profilePicture: z.string().optional()
});

// Schéma de validation pour les demandes d'amis
const friendRequestSchema = z.object({
  friendId: z.string().min(1, { message: "ID de l'ami requis" })
});

// Récupérer un utilisateur par ID
export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Mettre à jour un utilisateur
export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Vérifier si l'utilisateur est autorisé à modifier ce profil
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à modifier ce profil" });
    }
    
    // Validation des données
    const validationResult = updateUserSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }
    
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...req.body,
        updatedAt: Date.now()
      },
      { new: true }
    ).select('-password');
    
    if (!updatedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json({
      message: "Profil mis à jour avec succès",
      user: updatedUser
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un utilisateur
export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Vérifier si l'utilisateur est autorisé à supprimer ce profil
    if (req.user.id !== userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer ce profil" });
    }
    
    const deletedUser = await User.findByIdAndDelete(userId);
    
    if (!deletedUser) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json({ message: "Compte supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Rechercher un utilisateur par email
export const findUserByEmail = async (req, res) => {
  try {
    const { email } = req.query;
    
    if (!email) {
      return res.status(400).json({ message: "Email requis pour la recherche" });
    }
    
    const user = await User.findOne({ email }).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user);
  } catch (error) {
    console.error("Erreur lors de la recherche de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Rechercher des utilisateurs par nom d'utilisateur ou email
export const searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query) {
      return res.status(400).json({ message: "Terme de recherche requis" });
    }
    
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } }
      ]
    }).select('-password').limit(10);
    
    res.status(200).json(users);
  } catch (error) {
    console.error("Erreur lors de la recherche d'utilisateurs:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Envoyer une demande d'ami
export const sendFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validation des données
    const validationResult = friendRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }
    
    const { friendId } = req.body;
    
    // Vérifier si l'ami existe
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Vérifier si l'utilisateur s'envoie une demande à lui-même
    if (userId === friendId) {
      return res.status(400).json({ message: "Vous ne pouvez pas vous envoyer une demande d'ami" });
    }
    
    // Vérifier si l'ami est déjà dans la liste d'amis
    const user = await User.findById(userId);
    if (user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Cet utilisateur est déjà dans votre liste d'amis" });
    }
    
    // Vérifier si une demande a déjà été envoyée
    if (user.sentFriendRequests.includes(friendId)) {
      return res.status(400).json({ message: "Vous avez déjà envoyé une demande d'ami à cet utilisateur" });
    }
    
    // Vérifier si l'utilisateur a déjà reçu une demande de cet ami
    if (user.receivedFriendRequests.includes(friendId)) {
      return res.status(400).json({ message: "Cet utilisateur vous a déjà envoyé une demande d'ami" });
    }
    
    // Ajouter la demande d'ami
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { sentFriendRequests: friendId },
        updatedAt: Date.now()
      }
    );
    
    await User.findByIdAndUpdate(
      friendId,
      { 
        $push: { receivedFriendRequests: userId },
        updatedAt: Date.now()
      }
    );
    
    res.status(200).json({ message: "Demande d'ami envoyée avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'envoi de la demande d'ami:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Accepter une demande d'ami
export const acceptFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validation des données
    const validationResult = friendRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }
    
    const { friendId } = req.body;
    
    // Vérifier si l'ami existe
    const friend = await User.findById(friendId);
    if (!friend) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    // Vérifier si l'utilisateur a reçu une demande de cet ami
    const user = await User.findById(userId);
    if (!user.receivedFriendRequests.includes(friendId)) {
      return res.status(400).json({ message: "Aucune demande d'ami reçue de cet utilisateur" });
    }
    
    // Ajouter l'ami à la liste d'amis des deux utilisateurs
    await User.findByIdAndUpdate(
      userId,
      { 
        $push: { friends: friendId },
        $pull: { receivedFriendRequests: friendId },
        updatedAt: Date.now()
      }
    );
    
    await User.findByIdAndUpdate(
      friendId,
      { 
        $push: { friends: userId },
        $pull: { sentFriendRequests: userId },
        updatedAt: Date.now()
      }
    );
    
    res.status(200).json({ message: "Demande d'ami acceptée avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'acceptation de la demande d'ami:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Refuser une demande d'ami
export const rejectFriendRequest = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validation des données
    const validationResult = friendRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }
    
    const { friendId } = req.body;
    
    // Vérifier si l'utilisateur a reçu une demande de cet ami
    const user = await User.findById(userId);
    if (!user.receivedFriendRequests.includes(friendId)) {
      return res.status(400).json({ message: "Aucune demande d'ami reçue de cet utilisateur" });
    }
    
    // Supprimer la demande d'ami
    await User.findByIdAndUpdate(
      userId,
      { 
        $pull: { receivedFriendRequests: friendId },
        updatedAt: Date.now()
      }
    );
    
    await User.findByIdAndUpdate(
      friendId,
      { 
        $pull: { sentFriendRequests: userId },
        updatedAt: Date.now()
      }
    );
    
    res.status(200).json({ message: "Demande d'ami refusée avec succès" });
  } catch (error) {
    console.error("Erreur lors du refus de la demande d'ami:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un ami
export const removeFriend = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Validation des données
    const validationResult = friendRequestSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }
    
    const { friendId } = req.body;
    
    // Vérifier si l'ami est dans la liste d'amis
    const user = await User.findById(userId);
    if (!user.friends.includes(friendId)) {
      return res.status(400).json({ message: "Cet utilisateur n'est pas dans votre liste d'amis" });
    }
    
    // Supprimer l'ami de la liste d'amis des deux utilisateurs
    await User.findByIdAndUpdate(
      userId,
      { 
        $pull: { friends: friendId },
        updatedAt: Date.now()
      }
    );
    
    await User.findByIdAndUpdate(
      friendId,
      { 
        $pull: { friends: userId },
        updatedAt: Date.now()
      }
    );
    
    res.status(200).json({ message: "Ami supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un ami:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer la liste d'amis
export const getFriends = async (req, res) => {
  try {
    const userId = req.params.id;
    
    const user = await User.findById(userId).populate('friends', '-password');
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste d'amis:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les demandes d'amis reçues
export const getReceivedFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate('receivedFriendRequests', '-password');
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user.receivedFriendRequests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'amis reçues:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les demandes d'amis envoyées
export const getSentFriendRequests = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const user = await User.findById(userId).populate('sentFriendRequests', '-password');
    
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    
    res.status(200).json(user.sentFriendRequests);
  } catch (error) {
    console.error("Erreur lors de la récupération des demandes d'amis envoyées:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
