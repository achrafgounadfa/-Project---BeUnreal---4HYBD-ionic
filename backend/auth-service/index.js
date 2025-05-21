import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';

// Configuration des variables d'environnement
dotenv.config();

// Initialisation de l'application Express
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connecté pour auth-service'))
  .catch(err => {
    console.error('Erreur de connexion MongoDB:', err.message);
    process.exit(1);
  });

// Routes
app.use('/api/auth', authRoutes);

// Route de test
app.get('/', (req, res) => {
  res.send('Auth Service API fonctionne correctement');
});

// Démarrage du serveur
app.listen(PORT, () => {
  console.log(`Auth Service démarré sur le port ${PORT}`);
});
