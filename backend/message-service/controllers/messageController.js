import Message from '../models/Message.js';
import Group from '../models/Group.js';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'beunreal',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Schéma de validation pour l'envoi de message
const messageSchema = z.object({
  receiverId: z.string().min(1, { message: "ID du destinataire requis" }),
  content: z.string().optional(),
  mediaType: z.enum(['image', 'video']).optional()
}).refine(data => data.content || data.mediaType, {
  message: "Le message doit contenir du texte ou un média"
});

// Schéma de validation pour l'envoi de message de groupe
const groupMessageSchema = z.object({
  groupId: z.string().min(1, { message: "ID du groupe requis" }),
  content: z.string().optional(),
  mediaType: z.enum(['image', 'video']).optional()
}).refine(data => data.content || data.mediaType, {
  message: "Le message doit contenir du texte ou un média"
});

// Schéma de validation pour la création de groupe
const createGroupSchema = z.object({
  name: z.string().min(1, { message: "Nom du groupe requis" }),
  members: z.array(z.string()).min(1, { message: "Au moins un membre requis" })
});

// Schéma de validation pour l'ajout/suppression de membres
const groupMemberSchema = z.object({
  groupId: z.string().min(1, { message: "ID du groupe requis" }),
  userId: z.string().min(1, { message: "ID de l'utilisateur requis" })
});

// Envoyer un message individuel
export const sendMessage = async (req, res) => {
  try {
    // Validation des données
    const validationResult = messageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { receiverId, content, mediaType } = req.body;
    const senderId = req.user.id;
    
    // Créer un nouveau message
    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      isGroupMessage: false,
      mediaType
    });
    
    // Si un média est fourni, traiter et ajouter son URL
    if (req.file) {
      // Pour les vidéos, vérifier la durée (≤ 10s)
      if (mediaType === 'video') {
        // Dans une implémentation réelle, on vérifierait la durée de la vidéo
        // Pour l'instant, on suppose que la validation est faite côté client
        
        // Upload vers Cloudinary avec limite de durée
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "beunreal/videos",
          transformation: [
            { duration: "10" } // Limite à 10 secondes
          ]
        });
        
        newMessage.mediaUrl = result.secure_url;
      } else {
        // Pour les images
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "beunreal/images"
        });
        
        newMessage.mediaUrl = result.secure_url;
      }
    }
    
    // Enregistrer le message
    await newMessage.save();
    
    res.status(201).json({
      message: "Message envoyé avec succès",
      data: newMessage
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Envoyer un message de groupe
export const sendGroupMessage = async (req, res) => {
  try {
    // Validation des données
    const validationResult = groupMessageSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { groupId, content, mediaType } = req.body;
    const senderId = req.user.id;
    
    // Vérifier si le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }
    
    // Vérifier si l'utilisateur est membre du groupe
    if (!group.members.includes(senderId)) {
      return res.status(403).json({ message: "Vous n'êtes pas membre de ce groupe" });
    }
    
    // Créer un nouveau message
    const newMessage = new Message({
      senderId,
      receiverId: groupId,
      content,
      isGroupMessage: true,
      mediaType
    });
    
    // Si un média est fourni, traiter et ajouter son URL
    if (req.file) {
      // Pour les vidéos, vérifier la durée (≤ 10s)
      if (mediaType === 'video') {
        // Upload vers Cloudinary avec limite de durée
        const result = await cloudinary.uploader.upload(req.file.path, {
          resource_type: "video",
          folder: "beunreal/videos",
          transformation: [
            { duration: "10" } // Limite à 10 secondes
          ]
        });
        
        newMessage.mediaUrl = result.secure_url;
      } else {
        // Pour les images
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "beunreal/images"
        });
        
        newMessage.mediaUrl = result.secure_url;
      }
    }
    
    // Enregistrer le message
    await newMessage.save();
    
    res.status(201).json({
      message: "Message de groupe envoyé avec succès",
      data: newMessage
    });
  } catch (error) {
    console.error("Erreur lors de l'envoi du message de groupe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les messages d'un utilisateur
export const getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const currentUserId = req.user.id;
    
    // Récupérer les messages individuels entre les deux utilisateurs
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, receiverId: userId, isGroupMessage: false },
        { senderId: userId, receiverId: currentUserId, isGroupMessage: false }
      ]
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les messages d'un groupe
export const getGroupMessages = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const currentUserId = req.user.id;
    
    // Vérifier si le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }
    
    // Vérifier si l'utilisateur est membre du groupe
    if (!group.members.includes(currentUserId)) {
      return res.status(403).json({ message: "Vous n'êtes pas membre de ce groupe" });
    }
    
    // Récupérer les messages du groupe
    const messages = await Message.find({
      receiverId: groupId,
      isGroupMessage: true
    }).sort({ createdAt: 1 });
    
    res.status(200).json(messages);
  } catch (error) {
    console.error("Erreur lors de la récupération des messages du groupe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Créer un groupe
export const createGroup = async (req, res) => {
  try {
    // Validation des données
    const validationResult = createGroupSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { name, members } = req.body;
    const creatorId = req.user.id;
    
    // S'assurer que le créateur est inclus dans les membres
    if (!members.includes(creatorId)) {
      members.push(creatorId);
    }
    
    // Créer un nouveau groupe
    const newGroup = new Group({
      name,
      creator: creatorId,
      members,
      admins: [creatorId] // Le créateur est automatiquement admin
    });
    
    // Enregistrer le groupe
    await newGroup.save();
    
    res.status(201).json({
      message: "Groupe créé avec succès",
      data: newGroup
    });
  } catch (error) {
    console.error("Erreur lors de la création du groupe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Ajouter un membre à un groupe
export const addGroupMember = async (req, res) => {
  try {
    // Validation des données
    const validationResult = groupMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { groupId, userId } = req.body;
    const currentUserId = req.user.id;
    
    // Vérifier si le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }
    
    // Vérifier si l'utilisateur actuel est admin du groupe
    if (!group.admins.includes(currentUserId)) {
      return res.status(403).json({ message: "Vous n'êtes pas administrateur de ce groupe" });
    }
    
    // Vérifier si l'utilisateur à ajouter est déjà membre
    if (group.members.includes(userId)) {
      return res.status(400).json({ message: "Cet utilisateur est déjà membre du groupe" });
    }
    
    // Ajouter le membre au groupe
    await Group.findByIdAndUpdate(
      groupId,
      { 
        $push: { members: userId },
        updatedAt: Date.now()
      }
    );
    
    res.status(200).json({ message: "Membre ajouté au groupe avec succès" });
  } catch (error) {
    console.error("Erreur lors de l'ajout d'un membre au groupe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer un membre d'un groupe
export const removeGroupMember = async (req, res) => {
  try {
    // Validation des données
    const validationResult = groupMemberSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { groupId, userId } = req.body;
    const currentUserId = req.user.id;
    
    // Vérifier si le groupe existe
    const group = await Group.findById(groupId);
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }
    
    // Vérifier si l'utilisateur actuel est admin du groupe ou s'il s'agit de lui-même
    if (!group.admins.includes(currentUserId) && currentUserId !== userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à effectuer cette action" });
    }
    
    // Vérifier si l'utilisateur à supprimer est membre
    if (!group.members.includes(userId)) {
      return res.status(400).json({ message: "Cet utilisateur n'est pas membre du groupe" });
    }
    
    // Supprimer le membre du groupe
    await Group.findByIdAndUpdate(
      groupId,
      { 
        $pull: { members: userId, admins: userId },
        updatedAt: Date.now()
      }
    );
    
    res.status(200).json({ message: "Membre supprimé du groupe avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression d'un membre du groupe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les groupes d'un utilisateur
export const getUserGroups = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Récupérer les groupes dont l'utilisateur est membre
    const groups = await Group.find({
      members: userId
    });
    
    res.status(200).json(groups);
  } catch (error) {
    console.error("Erreur lors de la récupération des groupes:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les détails d'un groupe
export const getGroupDetails = async (req, res) => {
  try {
    const groupId = req.params.groupId;
    const userId = req.user.id;
    
    // Récupérer le groupe
    const group = await Group.findById(groupId);
    
    if (!group) {
      return res.status(404).json({ message: "Groupe non trouvé" });
    }
    
    // Vérifier si l'utilisateur est membre du groupe
    if (!group.members.includes(userId)) {
      return res.status(403).json({ message: "Vous n'êtes pas membre de ce groupe" });
    }
    
    res.status(200).json(group);
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du groupe:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
