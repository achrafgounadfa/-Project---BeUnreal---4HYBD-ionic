import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  content: {
    type: String
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  mediaType: {
    type: String,
    enum: ['image', 'video', ''],
    default: ''
  },
  isGroupMessage: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Validation pour s'assurer qu'un message a soit du contenu, soit un média
messageSchema.pre('validate', function(next) {
  if (!this.content && !this.mediaUrl) {
    this.invalidate('content', 'Un message doit contenir du texte ou un média');
  }
  next();
});

const Message = mongoose.model('Message', messageSchema);

export default Message;
