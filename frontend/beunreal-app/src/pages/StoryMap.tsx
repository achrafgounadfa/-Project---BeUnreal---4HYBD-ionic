import React, { useState, useEffect, useRef } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonFab,
  IonFabButton,
  IonCard,
  IonCardContent,
  IonText,
  IonLoading,
  IonModal,
  IonButtons,
  IonBackButton,
  IonFooter,
  IonTextarea,
  IonGrid,
  IonRow,
  IonCol,
  IonAvatar,
  IonBadge,
  IonActionSheet
} from '@ionic/react';
import { 
  camera, 
  locationOutline, 
  happyOutline, 
  chatbubbleOutline, 
  timeOutline,
  closeCircle,
  heart,
  thumbsUp,
  happy,
  sad,
  flame,
  ellipsisHorizontal
} from 'ionicons/icons';
import { GoogleMap } from '@capacitor/google-maps';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import useAuthStore from '../stores/authStore';
import { storyService } from '../services/api';
import './StoryMap.css';

interface Story {
  id: string;
  userId: {
    id: string;
    username: string;
    profilePicture: string;
  };
  mediaUrl: string;
  mediaType: 'image' | 'video';
  caption: string;
  location: {
    latitude: number;
    longitude: number;
  };
  reactions: Array<{
    userId: string;
    emoji: string;
  }>;
  comments: Array<{
    userId: {
      id: string;
      username: string;
      profilePicture: string;
    };
    content: string;
    createdAt: string;
  }>;
  createdAt: string;
  expiresAt: string;
}

const EMOJI_OPTIONS = [
  { text: 'J\'aime', icon: heart, value: '❤️' },
  { text: 'Pouce', icon: thumbsUp, value: '👍' },
  { text: 'Haha', icon: happy, value: '😂' },
  { text: 'Triste', icon: sad, value: '😢' },
  { text: 'Feu', icon: flame, value: '🔥' }
];

const StoryMap: React.FC = () => {
  const { user } = useAuthStore();
  const mapRef = useRef<HTMLElement>();
  const googleMapRef = useRef<any>(null);
  
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stories, setStories] = useState<Story[]>([]);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [showReactionSheet, setShowReactionSheet] = useState(false);
  const [timeLeft, setTimeLeft] = useState<string>('');
  
  useEffect(() => {
    initMap();
  }, []);
  
  useEffect(() => {
    if (selectedStory) {
      updateTimeLeft();
      const timer = setInterval(updateTimeLeft, 60000); // Mettre à jour chaque minute
      return () => clearInterval(timer);
    }
  }, [selectedStory]);
  
  const updateTimeLeft = () => {
    if (!selectedStory) return;
    
    const now = new Date();
    const expiresAt = new Date(selectedStory.expiresAt);
    const diffMs = expiresAt.getTime() - now.getTime();
    
    if (diffMs <= 0) {
      setTimeLeft('Expiré');
      return;
    }
    
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs > 0) {
      setTimeLeft(`${diffHrs}h ${diffMins}m restantes`);
    } else {
      setTimeLeft(`${diffMins} minutes restantes`);
    }
  };
  
  const initMap = async () => {
    try {
      setIsLoading(true);
      
      // Obtenir la position actuelle
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      setCurrentLocation({ lat: latitude, lng: longitude });
      
      // Initialiser la carte Google Maps
      if (mapRef.current) {
        googleMapRef.current = await GoogleMap.create({
          id: 'story-map',
          element: mapRef.current,
          apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY',
          config: {
            center: { lat: latitude, lng: longitude },
            zoom: 13
          }
        });
        
        // Ajouter un marqueur pour la position actuelle
        await googleMapRef.current.addMarker({
          coordinate: { lat: latitude, lng: longitude },
          title: 'Votre position',
          snippet: 'Vous êtes ici'
        });
        
        // Charger les stories à proximité
        await loadNearbyStories(latitude, longitude);
        
        // Ajouter un écouteur d'événements pour les clics sur les marqueurs
        await googleMapRef.current.setOnMarkerClickListener((marker) => {
          const story = stories.find(s => 
            s.location.latitude === marker.latitude && 
            s.location.longitude === marker.longitude
          );
          
          if (story) {
            setSelectedStory(story);
            setShowStoryModal(true);
          }
        });
      }
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de la carte:', err);
      setError('Impossible d\'initialiser la carte. Veuillez vérifier vos permissions de localisation.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadNearbyStories = async (latitude: number, longitude: number) => {
    try {
      // Récupérer les stories à proximité
      const nearbyStories = await storyService.getNearbyStories(latitude, longitude, 5000);
      setStories(nearbyStories);
      
      // Ajouter des marqueurs pour chaque story
      if (googleMapRef.current) {
        for (const story of nearbyStories) {
          await googleMapRef.current.addMarker({
            coordinate: { 
              lat: story.location.latitude, 
              lng: story.location.longitude 
            },
            title: story.userId.username,
            iconUrl: 'assets/story-marker.png'
          });
        }
      }
    } catch (err) {
      console.error('Erreur lors du chargement des stories:', err);
      setError('Impossible de charger les stories à proximité.');
    }
  };
  
  const handleCameraCapture = async () => {
    try {
      // Capturer une photo ou vidéo
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });
      
      // Rediriger vers la page de création de story avec l'image capturée
      // Dans une application réelle, nous passerions l'image à la page de création
      console.log('Image capturée:', image);
      
      // Simuler une redirection
      alert('Fonctionnalité de création de story à implémenter');
    } catch (err) {
      console.error('Erreur lors de la capture:', err);
    }
  };
  
  const handleAddReaction = async (emoji: string) => {
    if (!selectedStory || !user) return;
    
    try {
      await storyService.addReaction(selectedStory.id, emoji);
      
      // Mettre à jour l'état local
      const updatedStory = { 
        ...selectedStory,
        reactions: [
          ...selectedStory.reactions.filter(r => r.userId !== user.id),
          { userId: user.id, emoji }
        ]
      };
      
      setSelectedStory(updatedStory);
      setShowReactionSheet(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout de la réaction:', err);
      alert('Impossible d\'ajouter la réaction');
    }
  };
  
  const handleAddComment = async () => {
    if (!selectedStory || !user || !comment.trim()) return;
    
    try {
      const newComment = await storyService.addComment(selectedStory.id, comment);
      
      // Mettre à jour l'état local
      const updatedStory = { 
        ...selectedStory,
        comments: [...selectedStory.comments, newComment]
      };
      
      setSelectedStory(updatedStory);
      setComment('');
      setShowCommentModal(false);
    } catch (err) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      alert('Impossible d\'ajouter le commentaire');
    }
  };
  
  const getUserReaction = () => {
    if (!selectedStory || !user) return null;
    
    const userReaction = selectedStory.reactions.find(r => r.userId === user.id);
    return userReaction ? userReaction.emoji : null;
  };
  
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Carte des stories</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonLoading isOpen={isLoading} message="Chargement de la carte..." />
        
        {error && (
          <IonText color="danger" className="ion-text-center ion-padding">
            <p>{error}</p>
          </IonText>
        )}
        
        <div className="map-container">
          <capacitor-google-map ref={mapRef} style={{ 
            display: 'block',
            width: '100%',
            height: '100%'
          }}></capacitor-google-map>
        </div>
        
        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={handleCameraCapture} aria-label="Prendre une photo ou vidéo">
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>
        
        {/* Modal pour afficher une story */}
        <IonModal isOpen={showStoryModal} onDidDismiss={() => setShowStoryModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowStoryModal(false)}>
                  <IonIcon icon={closeCircle} />
                </IonButton>
              </IonButtons>
              <IonTitle>Story</IonTitle>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            {selectedStory && (
              <div className="story-container">
                <div className="story-header">
                  <IonAvatar>
                    <img 
                      src={selectedStory.userId.profilePicture || 'https://i.pravatar.cc/150?u=' + selectedStory.userId.id} 
                      alt={`Photo de ${selectedStory.userId.username}`} 
                    />
                  </IonAvatar>
                  <div className="story-user-info">
                    <h2>{selectedStory.userId.username}</h2>
                    <p className="story-time">
                      <IonIcon icon={timeOutline} />
                      <span>{timeLeft}</span>
                    </p>
                  </div>
                  <div className="story-location">
                    <IonIcon icon={locationOutline} />
                  </div>
                </div>
                
                <div className="story-media">
                  {selectedStory.mediaType === 'image' ? (
                    <img src={selectedStory.mediaUrl} alt="Story" />
                  ) : (
                    <video src={selectedStory.mediaUrl} controls />
                  )}
                </div>
                
                {selectedStory.caption && (
                  <div className="story-caption">
                    <p>{selectedStory.caption}</p>
                  </div>
                )}
                
                <div className="story-actions">
                  <IonButton 
                    fill="clear" 
                    onClick={() => setShowReactionSheet(true)}
                    aria-label="Réagir à la story"
                  >
                    <IonIcon slot="start" icon={happyOutline} />
                    {getUserReaction() ? getUserReaction() : 'Réagir'}
                  </IonButton>
                  
                  <IonButton 
                    fill="clear" 
                    onClick={() => setShowCommentModal(true)}
                    aria-label="Commenter la story"
                  >
                    <IonIcon slot="start" icon={chatbubbleOutline} />
                    Commenter
                  </IonButton>
                </div>
                
                <div className="story-stats">
                  {selectedStory.reactions.length > 0 && (
                    <div className="reactions-summary">
                      <p>
                        {selectedStory.reactions.slice(0, 3).map(r => r.emoji).join(' ')}
                        {selectedStory.reactions.length > 3 && ` +${selectedStory.reactions.length - 3}`}
                      </p>
                    </div>
                  )}
                  
                  {selectedStory.comments.length > 0 && (
                    <div className="comments-count">
                      <IonBadge color="light">{selectedStory.comments.length} commentaires</IonBadge>
                    </div>
                  )}
                </div>
                
                <div className="story-comments">
                  <h3>Commentaires</h3>
                  {selectedStory.comments.length === 0 ? (
                    <p className="no-comments">Aucun commentaire pour le moment</p>
                  ) : (
                    selectedStory.comments.map((comment, index) => (
                      <div className="comment" key={index}>
                        <IonAvatar>
                          <img 
                            src={comment.userId.profilePicture || 'https://i.pravatar.cc/150?u=' + comment.userId.id} 
                            alt={`Photo de ${comment.userId.username}`} 
                          />
                        </IonAvatar>
                        <div className="comment-content">
                          <div className="comment-header">
                            <h4>{comment.userId.username}</h4>
                            <span className="comment-time">{formatDate(comment.createdAt)}</span>
                          </div>
                          <p>{comment.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </IonContent>
        </IonModal>
        
        {/* Modal pour ajouter un commentaire */}
        <IonModal isOpen={showCommentModal} onDidDismiss={() => setShowCommentModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonButton onClick={() => setShowCommentModal(false)}>
                  Annuler
                </IonButton>
              </IonButtons>
              <IonTitle>Ajouter un commentaire</IonTitle>
              <IonButtons slot="end">
                <IonButton 
                  onClick={handleAddComment}
                  disabled={!comment.trim()}
                  strong={true}
                >
                  Publier
                </IonButton>
              </IonButtons>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="comment-form">
              <IonTextarea
                placeholder="Écrivez un commentaire..."
                value={comment}
                onIonChange={e => setComment(e.detail.value || '')}
                autoGrow={true}
                rows={4}
                className="comment-textarea"
              />
            </div>
          </IonContent>
        </IonModal>
        
        {/* Action sheet pour les réactions */}
        <IonActionSheet
          isOpen={showReactionSheet}
          onDidDismiss={() => setShowReactionSheet(false)}
          header="Réagir à la story"
          buttons={[
            ...EMOJI_OPTIONS.map(option => ({
              text: `${option.value} ${option.text}`,
              icon: option.icon,
              handler: () => handleAddReaction(option.value)
            })),
            {
              text: 'Annuler',
              role: 'cancel'
            }
          ]}
        />
      </IonContent>
    </IonPage>
  );
};

export default StoryMap;
