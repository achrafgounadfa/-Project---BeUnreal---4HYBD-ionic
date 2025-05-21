import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { z } from 'zod';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Configuration du transporteur d'emails
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USERNAME || 'beunreal.app@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'app_password_here'
  }
});

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  username: z.string().min(3, { message: "Le nom d'utilisateur doit contenir au moins 3 caractères" }),
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" })
});

// Schéma de validation pour la connexion
const loginSchema = z.object({
  email: z.string().email({ message: "Email invalide" }),
  password: z.string().min(1, { message: "Mot de passe requis" })
});

// Schéma de validation pour la réinitialisation du mot de passe
const forgotPasswordSchema = z.object({
  email: z.string().email({ message: "Email invalide" })
});

// Schéma de validation pour la mise à jour du mot de passe
const resetPasswordSchema = z.object({
  password: z.string().min(6, { message: "Le mot de passe doit contenir au moins 6 caractères" }),
  token: z.string()
});

// Contrôleur pour l'inscription
export const register = async (req, res) => {
  try {
    // Validation des données
    const validationResult = registerSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données d'inscription invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { email, username, password } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });

    if (existingUser) {
      return res.status(400).json({ 
        message: "Cet email ou nom d'utilisateur est déjà utilisé" 
      });
    }

    // Créer un nouvel utilisateur
    const newUser = new User({
      email,
      username,
      password
    });

    // Générer un token de vérification d'email
    const emailVerificationToken = newUser.generateEmailVerificationToken();

    // Enregistrer l'utilisateur
    await newUser.save();

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'BeUnreal <beunreal.app@gmail.com>',
      to: email,
      subject: 'Vérification de votre adresse email - BeUnreal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Bienvenue sur BeUnreal !</h2>
          <p>Merci de vous être inscrit. Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
          <p><a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a></p>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte sur BeUnreal, veuillez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe BeUnreal</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    // Générer un token JWT
    const token = jwt.sign(
      { id: newUser._id, email: newUser.email, username: newUser.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Réponse avec token et données utilisateur (sans mot de passe)
    res.status(201).json({
      message: "Inscription réussie. Veuillez vérifier votre email pour activer votre compte.",
      token,
      user: {
        id: newUser._id,
        email: newUser.email,
        username: newUser.username,
        profilePicture: newUser.profilePicture,
        isEmailVerified: newUser.isEmailVerified,
        createdAt: newUser.createdAt
      }
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    res.status(500).json({ message: "Erreur serveur lors de l'inscription" });
  }
};

// Contrôleur pour la connexion
export const login = async (req, res) => {
  try {
    // Validation des données
    const validationResult = loginSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données de connexion invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { email, password } = req.body;

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // Vérifier si l'email est vérifié
    if (!user.isEmailVerified) {
      return res.status(403).json({ 
        message: "Veuillez vérifier votre adresse email avant de vous connecter",
        needsVerification: true
      });
    }

    // Générer un token JWT
    const token = jwt.sign(
      { id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Réponse avec token et données utilisateur (sans mot de passe)
    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        profilePicture: user.profilePicture,
        isEmailVerified: user.isEmailVerified,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    console.error("Erreur lors de la connexion:", error);
    res.status(500).json({ message: "Erreur serveur lors de la connexion" });
  }
};

// Contrôleur pour la vérification d'email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;
    
    if (!token) {
      return res.status(400).json({ message: "Token de vérification manquant" });
    }

    // Hasher le token pour le comparer avec celui stocké en base
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Rechercher l'utilisateur par token de vérification
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token de vérification invalide ou expiré" 
      });
    }

    // Mettre à jour l'utilisateur
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: "Email vérifié avec succès. Vous pouvez maintenant vous connecter." 
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'email:", error);
    res.status(500).json({ message: "Erreur serveur lors de la vérification de l'email" });
  }
};

// Contrôleur pour renvoyer l'email de vérification
export const resendVerificationEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email requis" });
    }

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: "Cet email est déjà vérifié" });
    }

    // Générer un nouveau token de vérification
    const emailVerificationToken = user.generateEmailVerificationToken();
    await user.save();

    // Envoyer l'email de vérification
    const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${emailVerificationToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'BeUnreal <beunreal.app@gmail.com>',
      to: email,
      subject: 'Vérification de votre adresse email - BeUnreal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Vérification de votre adresse email</h2>
          <p>Pour activer votre compte, veuillez vérifier votre adresse email en cliquant sur le lien ci-dessous :</p>
          <p><a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Vérifier mon email</a></p>
          <p>Ce lien expirera dans 24 heures.</p>
          <p>Si vous n'avez pas créé de compte sur BeUnreal, veuillez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe BeUnreal</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Email de vérification renvoyé avec succès" 
    });
  } catch (error) {
    console.error("Erreur lors du renvoi de l'email de vérification:", error);
    res.status(500).json({ message: "Erreur serveur lors du renvoi de l'email de vérification" });
  }
};

// Contrôleur pour demander la réinitialisation du mot de passe
export const forgotPassword = async (req, res) => {
  try {
    // Validation des données
    const validationResult = forgotPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Email invalide", 
        errors: validationResult.error.errors 
      });
    }

    const { email } = req.body;

    // Rechercher l'utilisateur par email
    const user = await User.findOne({ email });
    if (!user) {
      // Pour des raisons de sécurité, ne pas indiquer si l'email existe ou non
      return res.status(200).json({ 
        message: "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation" 
      });
    }

    // Générer un token de réinitialisation
    const resetToken = user.generatePasswordResetToken();
    await user.save();

    // Envoyer l'email de réinitialisation
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'BeUnreal <beunreal.app@gmail.com>',
      to: email,
      subject: 'Réinitialisation de votre mot de passe - BeUnreal',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Réinitialisation de votre mot de passe</h2>
          <p>Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
          <p><a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
          <p>Ce lien expirera dans 1 heure.</p>
          <p>Si vous n'avez pas demandé cette réinitialisation, veuillez ignorer cet email.</p>
          <p>Cordialement,<br>L'équipe BeUnreal</p>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ 
      message: "Si cet email est associé à un compte, vous recevrez un lien de réinitialisation" 
    });
  } catch (error) {
    console.error("Erreur lors de la demande de réinitialisation du mot de passe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la demande de réinitialisation" });
  }
};

// Contrôleur pour réinitialiser le mot de passe
export const resetPassword = async (req, res) => {
  try {
    // Validation des données
    const validationResult = resetPasswordSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ 
        message: "Données invalides", 
        errors: validationResult.error.errors 
      });
    }

    const { token, password } = req.body;

    // Hasher le token pour le comparer avec celui stocké en base
    const hashedToken = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    // Rechercher l'utilisateur par token de réinitialisation
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ 
        message: "Token de réinitialisation invalide ou expiré" 
      });
    }

    // Mettre à jour le mot de passe
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ 
      message: "Mot de passe réinitialisé avec succès. Vous pouvez maintenant vous connecter." 
    });
  } catch (error) {
    console.error("Erreur lors de la réinitialisation du mot de passe:", error);
    res.status(500).json({ message: "Erreur serveur lors de la réinitialisation du mot de passe" });
  }
};
