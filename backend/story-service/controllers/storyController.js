import Story from '../models/Story.js';
import { z } from 'zod';

// Schéma de validation pour la création de story
const storySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  mediaType: z.enum(['image', 'video']),
  caption: z.string().optional()
});

// Schéma de validation pour la recherche de stories à proximité
const nearbySchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  radius: z.number().positive().default(5000) // Rayon en mètres, par défaut 5km
});

// Schéma de validation pour les réactions
const reactionSchema = z.object({
  storyId: z.string().min(1, { message: "ID de la story requis" }),
  emoji: z.string().min(1, { message: "Emoji requis" })
});

// Schéma de validation pour les commentaires
const commentSchema = z.object({
  storyId: z.string().min(1, { message: "ID de la story requis" }),
  content: z.string().min(1, { message: "Contenu du commentaire requis" })
});

// Créer une story
export const createStory = async (req, res) => {
  try {
    // Vérifier si un fichier média a été uploadé
    if (!req.file) {
      return res.status(400).json({ message: "Aucun fichier média n'a été fourni" });
    }

    // Validation des données
    const { latitude, longitude, mediaType, caption } = req.body;
    const validationResult = storySchema.safeParse({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      mediaType,
      caption
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    // Calculer la date d'expiration (24 heures après la création)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    // Créer une nouvelle story
    const newStory = new Story({
      userId: req.user.id,
      mediaUrl: req.file.path,
      mediaType: mediaType,
      caption: caption || '',
      location: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      expiresAt: expiresAt
    });
    
    // Enregistrer la story
    await newStory.save();
    
    res.status(201).json({
      message: "Story créée avec succès",
      data: newStory
    });
  } catch (error) {
    console.error("Erreur lors de la création de la story:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les stories à proximité
export const getNearbyStories = async (req, res) => {
  try {
    // Validation des données
    const { latitude, longitude, radius = 5000 } = req.query;
    const validationResult = nearbySchema.safeParse({
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      radius: parseFloat(radius)
    });

    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données de géolocalisation invalides", 
        errors: validationResult.error.errors 
      });
    }

    // Calculer la distance en degrés (approximation simple)
    // 1 degré de latitude ≈ 111 km
    // 1 degré de longitude ≈ 111 km * cos(latitude)
    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    const radiusInKm = parseFloat(radius) / 1000;
    
    // Conversion en degrés (approximation)
    const latDelta = radiusInKm / 111;
    const lngDelta = radiusInKm / (111 * Math.cos(lat * Math.PI / 180));
    
    // Rechercher les stories dans la zone
    const stories = await Story.find({
      'location.latitude': { $gte: lat - latDelta, $lte: lat + latDelta },
      'location.longitude': { $gte: lng - lngDelta, $lte: lng + lngDelta },
      // Ne pas afficher les stories expirées
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 }).populate('userId', 'username profilePicture');
    
    res.status(200).json(stories);
  } catch (error) {
    console.error("Erreur lors de la récupération des stories:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Ajouter une réaction à une story
export const addReaction = async (req, res) => {
  try {
    // Validation des données
    const validationResult = reactionSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { storyId, emoji } = req.body;
    const userId = req.user.id;
    
    // Vérifier si la story existe et n'est pas expirée
    const story = await Story.findOne({
      _id: storyId,
      expiresAt: { $gt: new Date() }
    });
    
    if (!story) {
      return res.status(404).json({ message: "Story non trouvée ou expirée" });
    }
    
    // Vérifier si l'utilisateur a déjà réagi avec cet emoji
    const existingReaction = story.reactions.find(
      reaction => reaction.userId.toString() === userId && reaction.emoji === emoji
    );
    
    if (existingReaction) {
      // Supprimer la réaction existante (toggle)
      await Story.updateOne(
        { _id: storyId },
        { $pull: { reactions: { userId, emoji } } }
      );
      
      res.status(200).json({ message: "Réaction supprimée avec succès" });
    } else {
      // Ajouter la nouvelle réaction
      await Story.updateOne(
        { _id: storyId },
        { 
          $push: { 
            reactions: { 
              userId, 
              emoji,
              createdAt: new Date()
            } 
          } 
        }
      );
      
      res.status(201).json({ message: "Réaction ajoutée avec succès" });
    }
  } catch (error) {
    console.error("Erreur lors de l'ajout de la réaction:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Ajouter un commentaire à une story
export const addComment = async (req, res) => {
  try {
    // Validation des données
    const validationResult = commentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { storyId, content } = req.body;
    const userId = req.user.id;
    
    // Vérifier si la story existe et n'est pas expirée
    const story = await Story.findOne({
      _id: storyId,
      expiresAt: { $gt: new Date() }
    });
    
    if (!story) {
      return res.status(404).json({ message: "Story non trouvée ou expirée" });
    }
    
    // Ajouter le commentaire
    const updatedStory = await Story.findByIdAndUpdate(
      storyId,
      { 
        $push: { 
          comments: { 
            userId, 
            content,
            createdAt: new Date()
          } 
        } 
      },
      { new: true }
    ).populate('comments.userId', 'username profilePicture');
    
    res.status(201).json({ 
      message: "Commentaire ajouté avec succès",
      comment: updatedStory.comments[updatedStory.comments.length - 1]
    });
  } catch (error) {
    console.error("Erreur lors de l'ajout du commentaire:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les réactions d'une story
export const getStoryReactions = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    // Vérifier si la story existe
    const story = await Story.findById(storyId)
      .populate('reactions.userId', 'username profilePicture');
    
    if (!story) {
      return res.status(404).json({ message: "Story non trouvée" });
    }
    
    res.status(200).json(story.reactions);
  } catch (error) {
    console.error("Erreur lors de la récupération des réactions:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les commentaires d'une story
export const getStoryComments = async (req, res) => {
  try {
    const { storyId } = req.params;
    
    // Vérifier si la story existe
    const story = await Story.findById(storyId)
      .populate('comments.userId', 'username profilePicture');
    
    if (!story) {
      return res.status(404).json({ message: "Story non trouvée" });
    }
    
    res.status(200).json(story.comments);
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Récupérer les stories d'un utilisateur
export const getUserStories = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Récupérer les stories de l'utilisateur qui ne sont pas expirées
    const stories = await Story.find({
      userId,
      expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
    
    res.status(200).json(stories);
  } catch (error) {
    console.error("Erreur lors de la récupération des stories de l'utilisateur:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// Supprimer une story
export const deleteStory = async (req, res) => {
  try {
    const { storyId } = req.params;
    const userId = req.user.id;
    
    // Vérifier si la story existe
    const story = await Story.findById(storyId);
    
    if (!story) {
      return res.status(404).json({ message: "Story non trouvée" });
    }
    
    // Vérifier si l'utilisateur est le propriétaire de la story
    if (story.userId.toString() !== userId) {
      return res.status(403).json({ message: "Vous n'êtes pas autorisé à supprimer cette story" });
    }
    
    // Supprimer la story
    await Story.findByIdAndDelete(storyId);
    
    res.status(200).json({ message: "Story supprimée avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de la story:", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
