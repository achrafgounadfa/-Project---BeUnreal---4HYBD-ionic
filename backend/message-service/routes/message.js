import express from 'express';
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { sendMessage, sendGroupMessage, getMessages } from '../controllers/messageController.js';
import authMiddleware from '../middlewares/auth.js';

const router = express.Router();

// Configuration du stockage Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'beunreal/messages',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif']
  }
});

// Configuration de multer avec Cloudinary
const upload = multer({ storage: storage });

// Middleware d'authentification pour toutes les routes
router.use(authMiddleware);

// Envoyer un message individuel (texte + image optionnelle)
router.post('/send', upload.single('image'), sendMessage);

// Envoyer un message de groupe (texte + image optionnelle)
router.post('/send-group', upload.single('image'), sendGroupMessage);

// Récupérer les messages d'un utilisateur
router.get('/:userId', getMessages);

export default router;
