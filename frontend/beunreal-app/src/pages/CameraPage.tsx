import React, { useState, useRef } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonButton,
  IonIcon,
  IonGrid,
  IonRow,
  IonCol,
  IonLoading,
  IonText,
  IonActionSheet,
  IonFab,
  IonFabButton,
  IonButtons,
  IonBackButton
} from '@ionic/react';
import { 
  camera, 
  images, 
  videocam, 
  flash, 
  flashOff, 
  swapHorizontal,
  closeCircle,
  checkmarkCircle
} from 'ionicons/icons';
import { Camera, CameraResultType, CameraSource, CameraDirection } from '@capacitor/camera';
import { storyService } from '../services/api';
import { Geolocation } from '@capacitor/geolocation';
import './CameraPage.css';

const CameraPage: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const frontVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [capturedVideo, setCapturedVideo] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [flashEnabled, setFlashEnabled] = useState(false);
  const [dualCameraEnabled, setDualCameraEnabled] = useState(false);
  const [showActionSheet, setShowActionSheet] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<{latitude: number; longitude: number} | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const recordedChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialiser la caméra
  const initCamera = async (dual = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Réinitialiser les états
      setCapturedImage(null);
      setCapturedVideo(null);
      
      // Obtenir la position actuelle
      const position = await Geolocation.getCurrentPosition();
      setCurrentLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
      
      // Configurer les contraintes de la caméra
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: mediaType === 'video'
      };
      
      // Obtenir le flux vidéo principal
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      // Si la double caméra est activée, obtenir le flux de la caméra frontale
      if (dual && frontVideoRef.current) {
        const frontConstraints: MediaStreamConstraints = {
          video: {
            facingMode: 'user',
            width: { ideal: 640 },
            height: { ideal: 480 }
          },
          audio: false
        };
        
        const frontStream = await navigator.mediaDevices.getUserMedia(frontConstraints);
        frontVideoRef.current.srcObject = frontStream;
        frontVideoRef.current.play();
      }
      
      setDualCameraEnabled(dual);
    } catch (err) {
      console.error('Erreur lors de l\'initialisation de la caméra:', err);
      setError('Impossible d\'accéder à la caméra. Veuillez vérifier vos permissions.');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Capturer une image
  const captureImage = () => {
    if (!videoRef.current || !canvasRef.current) return;
    
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    // Définir les dimensions du canvas
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Dessiner l'image principale
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Si la double caméra est activée, ajouter l'image de la caméra frontale
    if (dualCameraEnabled && frontVideoRef.current) {
      const frontVideo = frontVideoRef.current;
      
      // Dessiner l'image de la caméra frontale dans un coin
      const frontWidth = canvas.width * 0.3;
      const frontHeight = (frontVideo.videoHeight / frontVideo.videoWidth) * frontWidth;
      const frontX = canvas.width - frontWidth - 20;
      const frontY = 20;
      
      ctx.drawImage(frontVideo, frontX, frontY, frontWidth, frontHeight);
      
      // Ajouter une bordure
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 3;
      ctx.strokeRect(frontX, frontY, frontWidth, frontHeight);
    }
    
    // Convertir le canvas en image
    const imageDataUrl = canvas.toDataURL('image/jpeg');
    setCapturedImage(imageDataUrl);
  };
  
  // Démarrer l'enregistrement vidéo
  const startVideoRecording = () => {
    if (!videoRef.current || isRecording) return;
    
    try {
      const video = videoRef.current;
      const stream = video.srcObject as MediaStream;
      
      if (!stream) {
        setError('Flux vidéo non disponible');
        return;
      }
      
      // Créer un MediaRecorder
      mediaRecorderRef.current = new MediaRecorder(stream, { mimeType: 'video/webm' });
      
      // Configurer les gestionnaires d'événements
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          recordedChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorderRef.current.onstop = () => {
        // Créer un blob à partir des chunks enregistrés
        const blob = new Blob(recordedChunksRef.current, { type: 'video/webm' });
        const videoUrl = URL.createObjectURL(blob);
        setCapturedVideo(videoUrl);
        recordedChunksRef.current = [];
      };
      
      // Démarrer l'enregistrement
      mediaRecorderRef.current.start();
      setIsRecording(true);
      
      // Démarrer le timer
      setRecordingTime(0);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          // Arrêter automatiquement après 10 secondes
          if (prev >= 10) {
            stopVideoRecording();
            return 10;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error('Erreur lors du démarrage de l\'enregistrement:', err);
      setError('Impossible de démarrer l\'enregistrement vidéo');
    }
  };
  
  // Arrêter l'enregistrement vidéo
  const stopVideoRecording = () => {
    if (!isRecording || !mediaRecorderRef.current) return;
    
    try {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Arrêter le timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    } catch (err) {
      console.error('Erreur lors de l\'arrêt de l\'enregistrement:', err);
      setError('Impossible d\'arrêter l\'enregistrement vidéo');
    }
  };
  
  // Publier la story
  const publishStory = async () => {
    if (!capturedImage && !capturedVideo) return;
    if (!currentLocation) {
      setError('Position non disponible. Impossible de publier la story.');
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Dans une application réelle, nous téléchargerions l'image/vidéo vers le serveur
      // et nous utiliserions l'URL retournée
      
      // Simuler la publication d'une story
      const storyData = {
        mediaUrl: capturedImage || capturedVideo || '',
        mediaType: capturedImage ? 'image' : 'video',
        latitude: currentLocation.latitude,
        longitude: currentLocation.longitude,
        caption: 'Ma story BeUnreal'
      };
      
      // Appel à l'API pour créer la story
      await storyService.createStory(storyData);
      
      // Réinitialiser les états
      setCapturedImage(null);
      setCapturedVideo(null);
      
      // Afficher un message de succès
      alert('Story publiée avec succès !');
      
      // Rediriger vers la carte des stories
      window.history.back();
    } catch (err) {
      console.error('Erreur lors de la publication de la story:', err);
      setError('Impossible de publier la story');
    } finally {
      setIsLoading(false);
    }
  };
  
  // Annuler la capture
  const cancelCapture = () => {
    setCapturedImage(null);
    setCapturedVideo(null);
  };
  
  // Basculer entre photo et vidéo
  const toggleMediaType = () => {
    setMediaType(prev => prev === 'image' ? 'video' : 'image');
  };
  
  // Basculer le flash
  const toggleFlash = () => {
    setFlashEnabled(prev => !prev);
    // Dans une application réelle, nous activerions/désactiverions le flash de la caméra
  };
  
  // Ouvrir l'action sheet pour les options de caméra
  const openCameraOptions = () => {
    setShowActionSheet(true);
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/tabs/stories" />
          </IonButtons>
          <IonTitle>Caméra</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen className="camera-content">
        <IonLoading isOpen={isLoading} message="Chargement..." />
        
        {error && (
          <IonText color="danger" className="ion-text-center ion-padding">
            <p>{error}</p>
          </IonText>
        )}
        
        <div className="camera-container">
          {/* Vidéo principale */}
          <video 
            ref={videoRef} 
            className={`main-video ${capturedImage || capturedVideo ? 'hidden' : ''} ${flashEnabled ? 'flash-enabled' : ''}`}
            playsInline
            muted
          />
          
          {/* Vidéo frontale (pour la double caméra) */}
          {dualCameraEnabled && (
            <video 
              ref={frontVideoRef} 
              className={`front-video ${capturedImage || capturedVideo ? 'hidden' : ''}`}
              playsInline
              muted
            />
          )}
          
          {/* Canvas pour la capture d'image */}
          <canvas ref={canvasRef} className="hidden-canvas" />
          
          {/* Affichage de l'image capturée */}
          {capturedImage && (
            <div className="captured-media">
              <img src={capturedImage} alt="Captured" />
            </div>
          )}
          
          {/* Affichage de la vidéo capturée */}
          {capturedVideo && (
            <div className="captured-media">
              <video src={capturedVideo} controls />
            </div>
          )}
          
          {/* Indicateur de temps d'enregistrement */}
          {isRecording && (
            <div className="recording-indicator">
              <div className="recording-dot"></div>
              <span>{recordingTime}s</span>
            </div>
          )}
        </div>
        
        {/* Contrôles de la caméra */}
        <div className={`camera-controls ${capturedImage || capturedVideo ? 'hidden' : ''}`}>
          <IonGrid>
            <IonRow className="ion-align-items-center">
              <IonCol size="4" className="ion-text-center">
                <IonButton 
                  fill="clear" 
                  onClick={toggleFlash}
                  aria-label={flashEnabled ? "Désactiver le flash" : "Activer le flash"}
                >
                  <IonIcon icon={flashEnabled ? flashOff : flash} />
                </IonButton>
              </IonCol>
              <IonCol size="4" className="ion-text-center">
                {mediaType === 'image' ? (
                  <IonButton 
                    className="capture-button"
                    onClick={captureImage}
                    aria-label="Prendre une photo"
                  >
                    <IonIcon icon={camera} />
                  </IonButton>
                ) : (
                  <IonButton 
                    className={`capture-button ${isRecording ? 'recording' : ''}`}
                    onClick={isRecording ? stopVideoRecording : startVideoRecording}
                    aria-label={isRecording ? "Arrêter l'enregistrement" : "Démarrer l'enregistrement"}
                  >
                    <IonIcon icon={videocam} />
                  </IonButton>
                )}
              </IonCol>
              <IonCol size="4" className="ion-text-center">
                <IonButton 
                  fill="clear" 
                  onClick={openCameraOptions}
                  aria-label="Options de caméra"
                >
                  <IonIcon icon={swapHorizontal} />
                </IonButton>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol className="ion-text-center">
                <IonButton 
                  fill="clear" 
                  onClick={toggleMediaType}
                  aria-label={mediaType === 'image' ? "Passer en mode vidéo" : "Passer en mode photo"}
                >
                  <IonIcon icon={mediaType === 'image' ? videocam : camera} />
                  <IonText>{mediaType === 'image' ? 'Vidéo' : 'Photo'}</IonText>
                </IonButton>
              </IonCol>
            </IonRow>
          </IonGrid>
        </div>
        
        {/* Contrôles après capture */}
        {(capturedImage || capturedVideo) && (
          <div className="capture-actions">
            <IonButton 
              fill="clear" 
              color="danger"
              onClick={cancelCapture}
              aria-label="Annuler"
            >
              <IonIcon icon={closeCircle} />
            </IonButton>
            <IonButton 
              fill="clear" 
              color="success"
              onClick={publishStory}
              aria-label="Publier"
            >
              <IonIcon icon={checkmarkCircle} />
            </IonButton>
          </div>
        )}
        
        {/* Action sheet pour les options de caméra */}
        <IonActionSheet
          isOpen={showActionSheet}
          onDidDismiss={() => setShowActionSheet(false)}
          header="Options de caméra"
          buttons={[
            {
              text: 'Caméra standard',
              handler: () => initCamera(false)
            },
            {
              text: 'Double caméra',
              handler: () => initCamera(true)
            },
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

export default CameraPage;
