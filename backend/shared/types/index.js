/**
 * Types partagés pour l'application BeUnreal
 */

// Type utilisateur
const UserType = {
  id: String,
  email: String,
  username: String,
  password: String, // Hashé en base de données
  profilePicture: String,
  friends: [String], // IDs des amis
  createdAt: Date,
  updatedAt: Date
};

// Type message
const MessageType = {
  id: String,
  senderId: String,
  receiverId: String, // Peut être un ID utilisateur ou un ID de groupe
  content: String,
  mediaUrl: String, // URL de l'image si présente
  isGroupMessage: Boolean,
  createdAt: Date
};

// Type story
const StoryType = {
  id: String,
  userId: String,
  mediaUrl: String, // URL de l'image ou vidéo
  mediaType: String, // 'image' ou 'video'
  location: {
    latitude: Number,
    longitude: Number
  },
  createdAt: Date,
  expiresAt: Date // 24h après création
};

// Type groupe
const GroupType = {
  id: String,
  name: String,
  members: [String], // IDs des membres
  createdBy: String, // ID du créateur
  createdAt: Date,
  updatedAt: Date
};

module.exports = {
  UserType,
  MessageType,
  StoryType,
  GroupType
};
