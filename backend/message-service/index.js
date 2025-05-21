import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import messageRoutes from './routes/message.js';
import { v2 as cloudinary } from 'cloudinary';

// Configuration des variables d'environnement
dotenv.config();

// Configuration de Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3003;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté pour message-service'))
  .catch(err => {
    console.error('Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/messages', messageRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('Message Service API fonctionne correctement');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Message Service démarré sur le port ${PORT}`);
});
