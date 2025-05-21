import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { createStory, getNearbyStories } from '../controllers/storyController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'beunreal/stories',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'mp4'],
    resource_type: 'auto'
  }
});

// Configuration de multer avec Cloudinary
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max pour les vidéos
  }
});

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// Créer une story (photo/vidéo + géolocalisation)
router.post('/', upload.single('media'), createStory);

// Récupérer les stories à proximité
router.get('/nearby', getNearbyStories);

export default router;
