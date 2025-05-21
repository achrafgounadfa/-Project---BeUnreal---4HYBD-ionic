import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonIcon,
  IonAvatar,
  IonFooter,
  IonLoading,
  IonBackButton,
  IonButtons,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  InputCustomEvent
} from '@ionic/react';
import { send, camera } from 'ionicons/icons';
import { cameraService } from '../services/native';
import useAuthStore from '../stores/authStore';
import useMessageStore, { Message } from '../stores/messageStore';
import './Chat.css';
import { Photo } from '@capacitor/camera';

interface ContactInfo {
  id: string;
  username: string;
  profilePicture: string;
}

const Chat: React.FC = () => {
  const { user } = useAuthStore();
  const { messages, currentChat, setMessages, addMessage, setLoading, setError } = useMessageStore();
  
  const [newMessage, setNewMessage] = useState('');
  const [selectedImage, setSelectedImage] = useState<Photo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [contactInfo, setContactInfo] = useState<ContactInfo | null>(null);
  
  const contentRef = useRef<HTMLIonContentElement>(null);
  
  const loadMessages = async (): Promise<void> => {
    if (!user || !currentChat) return;
    
    setLoading(true);
    
    try {
      // Dans une application réelle, nous chargerions les messages depuis l'API
      // Pour l'instant, nous utilisons des données fictives
      const mockMessages: Message[] = [
        {
          id: '1',
          senderId: user.id,
          receiverId: currentChat.id,
          content: 'Salut, comment ça va ?',
          isGroupMessage: false,
          createdAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: '2',
          senderId: currentChat.id,
          receiverId: user.id,
          content: 'Très bien et toi ?',
          isGroupMessage: false,
          createdAt: new Date(Date.now() - 3500000).toISOString()
        },
        {
          id: '3',
          senderId: user.id,
          receiverId: currentChat.id,
          content: 'Ça va bien ! Tu as vu ma dernière story ?',
          isGroupMessage: false,
          createdAt: new Date(Date.now() - 3400000).toISOString()
        }
      ];
      
      setMessages(mockMessages);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors du chargement des messages';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const loadContactInfo = async (): Promise<void> => {
    if (!currentChat) return;
    
    // Dans une application réelle, nous chargerions les infos du contact depuis l'API
    // Pour l'instant, nous utilisons des données fictives
    setContactInfo({
      id: currentChat.id,
      username: currentChat.id === '1' ? 'Alice' : (currentChat.id === '2' ? 'Bob' : 'Charlie'),
      profilePicture: `https://i.pravatar.cc/150?u=${currentChat.id}`
    });
  };
  
  useEffect(() => {
    if (user && currentChat) {
      loadMessages();
      loadContactInfo();
    }
  }, [user, currentChat, setError, setLoading, setMessages]);
  
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const handleSendMessage = async (): Promise<void> => {
    if (!user || !currentChat || (!newMessage.trim() && !selectedImage)) return;
    
    setIsLoading(true);
    
    try {
      // Dans une application réelle, nous enverrions le message via l'API
      // Pour l'instant, nous simulons l'envoi
      
      const newMsg: Message = {
        id: Date.now().toString(),
        senderId: user.id,
        receiverId: currentChat.id,
        content: newMessage,
        mediaUrl: selectedImage ? selectedImage.webPath : undefined,
        isGroupMessage: currentChat.isGroup,
        createdAt: new Date().toISOString()
      };
      
      addMessage(newMsg);
      setNewMessage('');
      setSelectedImage(null);
      
      // Simuler un délai d'envoi
      await new Promise(resolve => setTimeout(resolve, 500));
    } catch (err) {
      console.error('Erreur lors de l\'envoi du message:', err);
      alert('Erreur lors de l\'envoi du message');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSelectImage = async (): Promise<void> => {
    try {
      const image = await cameraService.selectFromGallery();
      setSelectedImage(image);
    } catch (err) {
      console.error('Erreur lors de la sélection de l\'image:', err);
    }
  };
  
  const scrollToBottom = (): void => {
    if (contentRef.current) {
      contentRef.current.scrollToBottom(300);
    }
  };
  
  const handleInputChange = (e: InputCustomEvent): void => {
    setNewMessage(e.detail.value || '');
  };
  
  if (!user || !currentChat || !contactInfo) {
    return (
      <IonPage>
        <IonContent>
          <IonText color="medium" className="ion-padding ion-text-center">
            <p>Sélectionnez une conversation</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/messages" />
          </IonButtons>
          <IonItem lines="none" className="chat-header">
            <IonAvatar slot="start">
              <img src={contactInfo.profilePicture} alt={contactInfo.username} />
            </IonAvatar>
            <IonLabel>{contactInfo.username}</IonLabel>
          </IonItem>
        </IonToolbar>
      </IonHeader>
      <IonContent ref={contentRef} className="ion-padding">
        <IonLoading isOpen={isLoading} message="Envoi du message..." />
        
        <div className="chat-container">
          {messages.map(message => (
            <div 
              key={message.id} 
              className={`message-bubble ${message.senderId === user.id ? 'sent' : 'received'}`}
            >
              {message.mediaUrl && (
                <div className="message-image-container">
                  <img src={message.mediaUrl} alt="Contenu du message" className="message-image" />
                </div>
              )}
              <div className="message-content">{message.content}</div>
              <div className="message-time">
                {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          ))}
        </div>
      </IonContent>
      <IonFooter>
        <div className="message-input-container">
          {selectedImage && (
            <div className="selected-image-preview">
              <img src={selectedImage.webPath} alt="Image sélectionnée" />
              <IonButton 
                fill="clear" 
                size="small" 
                onClick={() => setSelectedImage(null)}
                aria-label="Supprimer l'image"
              >
                &times;
              </IonButton>
            </div>
          )}
          
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="2">
                <IonButton 
                  fill="clear" 
                  onClick={handleSelectImage}
                  aria-label="Sélectionner une image"
                >
                  <IonIcon slot="icon-only" icon={camera} />
                </IonButton>
              </IonCol>
              <IonCol size="8">
                <IonInput
                  placeholder="Tapez un message..."
                  value={newMessage}
                  onIonChange={handleInputChange}
                  className="message-input"
                />
              </IonCol>
              <IonCol size="2">
                <IonButton 
                  fill="clear" 
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim() && !selectedImage}
                  aria-label="Envoyer le message"
                >
                  <IonIcon slot="icon-only" icon={send} />
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
      </IonFooter>
    </IonPage>
  );
};

export default Chat;
