import express from 'express';
import { register, login, verifyEmail, resendVerificationEmail, forgotPassword, resetPassword } from '../controllers/authController.js';

const router = express.Router();

// Route d'inscription
router.post('/signup', register);

// Route de connexion
router.post('/login', login);

// Route de vérification d'email
router.get('/verify-email/:token', verifyEmail);

// Route pour renvoyer l'email de vérification
router.post('/resend-verification', resendVerificationEmail);

// Route pour demander la réinitialisation du mot de passe
router.post('/forgot-password', forgotPassword);

// Route pour réinitialiser le mot de passe
router.post('/reset-password', resetPassword);

export default router;
