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
  IonModal,
  IonText,
  IonLoading,
  IonToast,
  IonTextarea,
  IonList,
  IonItem,
  IonLabel,
  IonAvatar,
  IonCardTitle
} from '@ionic/react';
import {
  locate,
  camera,
  heart,
  chatbubble,
  share
} from 'ionicons/icons';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { Geolocation } from '@capacitor/geolocation';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import useAuthStore from '../stores/authStore';
import { storyService } from '../services/api';
import { Story } from '../services/api/storyService';
import './StoryMap.css';

// Composant pour centrer la carte sur la position actuelle
const LocationMarker: React.FC<{
  onLocationFound: (lat: number, lng: number) => void
}> = ({ onLocationFound }) => {
  const [position, setPosition] = useState<L.LatLng | null>(null);
  const map = useMap();

  useEffect(() => {
    map.locate({ setView: true, maxZoom: 16 });
  }, [map]);

  useMapEvents({
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
      onLocationFound(e.latlng.lat, e.latlng.lng);
    }
  });

  return position === null ? null : (
    <Marker 
      position={position}
      icon={new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      } )}
    >
      <Popup>Vous êtes ici</Popup>
    </Marker>
  );
};

const StoryMap: React.FC = () => {
  const { user } = useAuthStore();
  const [stories, setStories] = useState<Story[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStoryModal, setShowStoryModal] = useState(false);
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [showReactionModal, setShowReactionModal] = useState(false);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [comment, setComment] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastColor, setToastColor] = useState<'success' | 'danger'>('success');
  const [showCameraModal, setShowCameraModal] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [storyCaption, setStoryCaption] = useState('');
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([48.8566, 2.3522]); // Paris par défaut
  const [mapZoom, setMapZoom] = useState(13);
  const mapRef = useRef<L.Map | null>(null);

  const handleLocationFound = async (latitude: number, longitude: number) => {
    setMapCenter([latitude, longitude]);
    await loadNearbyStories(latitude, longitude);
  };

  const loadNearbyStories = async (latitude: number, longitude: number): Promise<void> => {
    try {
      setIsLoading(true);
      // Récupérer les stories à proximité
      const nearbyStories = await storyService.getNearbyStories(latitude, longitude, 5000);
      setStories(nearbyStories);
    } catch (err: any) {
      console.error('Erreur lors du chargement des stories:', err);
      setError(err.message || 'Erreur lors du chargement des stories');
      setToastMessage(`Erreur: ${err.message || 'Impossible de charger les stories'}`);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStoryMarkerClick = (story: Story) => {
    setSelectedStory(story);
    setShowStoryModal(true);
  };

  const handleAddReaction = async (emoji: string): Promise<void> => {
    if (!selectedStory) return;
    setShowReactionModal(false);

    try {
      await storyService.addReaction(selectedStory.id, emoji);

      // Mettre à jour l'état local
      const updatedStory = {
        ...selectedStory,
        reactions: [
          ...selectedStory.reactions,
          {
            userId: user!.id,
            emoji,
            createdAt: new Date().toISOString()
          }
        ]
      };

      setSelectedStory(updatedStory);
      setToastMessage('Réaction ajoutée');
      setToastColor('success');
      setShowToast(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout de la réaction:', err);
      setToastMessage(`Erreur: ${err.message || 'Impossible d\'ajouter la réaction'}`);
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleAddComment = async (): Promise<void> => {
    if (!selectedStory || !comment.trim()) return;
    setShowCommentModal(false);

    try {
      const newComment = await storyService.addComment(selectedStory.id, comment);

      // Mettre à jour l'état local
      const updatedStory = {
        ...selectedStory,
        comments: [
          ...selectedStory.comments,
          {
            userId: {
              id: user!.id,
              username: user!.username,
              profilePicture: user!.profilePicture
            },
            content: comment,
            createdAt: new Date().toISOString()
          }
        ]
      };

      setSelectedStory(updatedStory);
      setComment('');
      setToastMessage('Commentaire ajouté');
      setToastColor('success');
      setShowToast(true);
    } catch (err: any) {
      console.error('Erreur lors de l\'ajout du commentaire:', err);
      setToastMessage(`Erreur: ${err.message || 'Impossible d\'ajouter le commentaire'}`);
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleTakePhoto = async (): Promise<void> => {
    try {
      const photo = await Camera.getPhoto({
        quality: 90,
        allowEditing: true,
        resultType: CameraResultType.Uri,
        source: CameraSource.Camera
      });

      if (photo.webPath) {
        setCapturedImage(photo.webPath);
      }
    } catch (err: any) {
      console.error('Erreur lors de la prise de photo:', err);
      setToastMessage(`Erreur: ${err.message || 'Impossible de prendre une photo'}`);
      setToastColor('danger');
      setShowToast(true);
    }
  };

  const handleCreateStory = async (): Promise<void> => {
    if (!capturedImage) return;
    setIsCreatingStory(true);

    try {
      // Obtenir la position actuelle
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;

      // Convertir l'image en fichier
      const response = await fetch(capturedImage);
      const blob = await response.blob();
      const file = new File([blob], 'story-image.jpg', { type: 'image/jpeg' });

      // Télécharger le média
      const uploadResult = await storyService.uploadStoryMedia(file);

      // Créer la story
      const storyData = {
        mediaUrl: uploadResult.mediaUrl,
        mediaType: uploadResult.mediaType,
        latitude,
        longitude,
        caption: storyCaption
      };
      
      // Appel à l'API pour créer la story
      const newStory = await storyService.createStory(storyData);
      
      // Réinitialiser les états
      setCapturedImage(null);
      setStoryCaption('');
      setShowCameraModal(false);
      
      // Ajouter la story à la liste
      setStories([newStory, ...stories]);
      
      setToastMessage('Story créée avec succès');
      setToastColor('success');
      setShowToast(true);
    } catch (err: any) {
      console.error('Erreur lors de la création de la story:', err);
      setToastMessage(`Erreur: ${err.message || 'Impossible de créer la story'}`);
      setToastColor('danger');
      setShowToast(true);
    } finally {
      setIsCreatingStory(false);
    }
  };

  const handleLocateMe = async () => {
    try {
      const position = await Geolocation.getCurrentPosition();
      const { latitude, longitude } = position.coords;
      
      if (mapRef.current) {
        mapRef.current.setView([latitude, longitude], 15);
      }
    } catch (err: any) {
      console.error('Erreur lors de la géolocalisation:', err);
      setToastMessage(`Erreur: ${err.message || 'Impossible d\'obtenir votre position'}`);
      setToastColor('danger');
      setShowToast(true);
    }
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
        
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={toastColor}
        />

        <div className="map-container">
          <MapContainer 
            center={mapCenter} 
            zoom={mapZoom} 
            style={{ height: '100%', width: '100%' }}
            whenCreated={(map) => { mapRef.current = map; }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationMarker onLocationFound={handleLocationFound} />
            
            {stories.map((story ) => (
              <Marker 
                key={story.id}
                position={[story.location.latitude, story.location.longitude]}
                eventHandlers={{
                  click: () => handleStoryMarkerClick(story)
                }}
                icon={new L.Icon({
                  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                  popupAnchor: [1, -34],
                  shadowSize: [41, 41]
                } )}
              >
                <Popup>
                  <strong>{story.userId.username}</strong>
                  <p>{story.caption || 'Story'}</p>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>

        <IonFab vertical="bottom" horizontal="center" slot="fixed">
          <IonFabButton onClick={() => setShowCameraModal(true)}>
            <IonIcon icon={camera} />
          </IonFabButton>
        </IonFab>

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={handleLocateMe}>
            <IonIcon icon={locate} />
          </IonFabButton>
        </IonFab>

        {/* Modal pour afficher une story */}
        <IonModal isOpen={showStoryModal} onDidDismiss={() => setShowStoryModal(false)}>
          {selectedStory && (
            <>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>{selectedStory.userId.username}</IonTitle>
                  <IonButton slot="end" fill="clear" onClick={() => setShowStoryModal(false)}>
                    Fermer
                  </IonButton>
                </IonToolbar>
              </IonHeader>
              <IonContent className="ion-padding">
                <img 
                  src={selectedStory.mediaUrl} 
                  alt="Story" 
                  className="story-image"
                  loading="lazy"
                />
                
                {selectedStory.caption && (
                  <IonText>
                    <p className="story-caption">{selectedStory.caption}</p>
                  </IonText>
                )}
                
                <div className="story-actions">
                  <IonButton fill="clear" onClick={() => setShowReactionModal(true)}>
                    <IonIcon slot="start" icon={heart} />
                    {selectedStory.reactions.length > 0 && (
                      <span>{selectedStory.reactions.length}</span>
                    )}
                  </IonButton>
                  
                  <IonButton fill="clear" onClick={() => setShowCommentModal(true)}>
                    <IonIcon slot="start" icon={chatbubble} />
                    {selectedStory.comments.length > 0 && (
                      <span>{selectedStory.comments.length}</span>
                    )}
                  </IonButton>
                  
                  <IonButton fill="clear">
                    <IonIcon slot="start" icon={share} />
                  </IonButton>
                </div>
                
                {selectedStory.comments.length > 0 && (
                  <div className="story-comments">
                    <IonCardTitle className="section-title">Commentaires</IonCardTitle>
                    <IonList>
                      {selectedStory.comments.map((comment, index) => (
                        <IonItem key={index}>
                          <IonAvatar slot="start">
                            <img 
                              src={comment.userId.profilePicture || `https://i.pravatar.cc/150?u=${comment.userId.id}`} 
                              alt={comment.userId.username}
                              loading="lazy"
                            />
                          </IonAvatar>
                          <IonLabel>
                            <h3>{comment.userId.username}</h3>
                            <p>{comment.content}</p>
                            <p className="comment-time">
                              {new Date(comment.createdAt ).toLocaleString()}
                            </p>
                          </IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                  </div>
                )}
              </IonContent>
            </>
          )}
        </IonModal>

        {/* Modal pour ajouter une réaction */}
        <IonModal isOpen={showReactionModal} onDidDismiss={() => setShowReactionModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Ajouter une réaction</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowReactionModal(false)}>
                Annuler
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <div className="emoji-grid">
              {['❤️', '👍', '😂', '😮', '😢', '😡'].map((emoji) => (
                <IonButton 
                  key={emoji} 
                  fill="clear" 
                  className="emoji-button"
                  onClick={() => handleAddReaction(emoji)}
                >
                  {emoji}
                </IonButton>
              ))}
            </div>
          </IonContent>
        </IonModal>

        {/* Modal pour ajouter un commentaire */}
        <IonModal isOpen={showCommentModal} onDidDismiss={() => setShowCommentModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Ajouter un commentaire</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowCommentModal(false)}>
                Annuler
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            <IonTextarea
              placeholder="Écrivez votre commentaire..."
              value={comment}
              onIonChange={e => setComment(e.detail.value || '')}
              rows={6}
              className="comment-textarea"
            />
            <IonButton 
              expand="block" 
              onClick={handleAddComment}
              disabled={!comment.trim()}
            >
              Publier
            </IonButton>
          </IonContent>
        </IonModal>

        {/* Modal pour créer une story */}
        <IonModal isOpen={showCameraModal} onDidDismiss={() => {
          setShowCameraModal(false);
          setCapturedImage(null);
          setStoryCaption('');
        }}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Créer une story</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => {
                setShowCameraModal(false);
                setCapturedImage(null);
                setStoryCaption('');
              }}>
                Annuler
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent className="ion-padding">
            {!capturedImage ? (
              <IonButton expand="block" onClick={handleTakePhoto}>
                <IonIcon slot="start" icon={camera} />
                Prendre une photo
              </IonButton>
            ) : (
              <>
                <div className="captured-image-container">
                  <img 
                    src={capturedImage} 
                    alt="Captured" 
                    className="captured-image"
                    loading="lazy"
                  />
                  <IonButton 
                    fill="clear" 
                    className="retake-button"
                    onClick={() => setCapturedImage(null)}
                  >
                    Reprendre
                  </IonButton>
                </div>
                
                <IonTextarea
                  placeholder="Ajouter une légende..."
                  value={storyCaption}
                  onIonChange={e => setStoryCaption(e.detail.value || '')}
                  rows={4}
                  className="caption-textarea"
                />
                
                <IonButton 
                  expand="block" 
                  onClick={handleCreateStory}
                  disabled={isCreatingStory}
                >
                  {isCreatingStory ? 'Création en cours...' : 'Publier la story'}
                </IonButton>
              </>
            )}
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default StoryMap;
