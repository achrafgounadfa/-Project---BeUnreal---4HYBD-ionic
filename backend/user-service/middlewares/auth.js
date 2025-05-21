import jwt from 'jsonwebtoken';

const authMiddleware = (req, res, next) => {
  try {
    // Récupération du token depuis le header Authorization
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Accès non autorisé. Token manquant.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Vérification du token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Ajout des informations utilisateur à la requête
    req.user = decoded;
    
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error.message);
    return res.status(401).json({ message: 'Accès non autorisé. Token invalide.' });
  }
};

export default authMiddleware;
