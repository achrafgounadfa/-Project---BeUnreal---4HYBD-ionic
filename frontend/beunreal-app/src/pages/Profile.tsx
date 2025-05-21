import React, { useState, useEffect } from 'react';
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
  IonLoading,
  IonCard,
  IonCardContent,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonItemDivider
} from '@ionic/react';
import { camera, pencil, logOut } from 'ionicons/icons';
import { cameraService } from '../services/native';
import useAuthStore from '../stores/authStore';
import './Profile.css';

const Profile: React.FC = () => {
  const { user, logout } = useAuthStore();
  
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [username, setUsername] = useState('');
  const [profilePicture, setProfilePicture] = useState('');
  
  useEffect(() => {
    if (user) {
      setUsername(user.username);
      setProfilePicture(user.profilePicture || 'https://i.pravatar.cc/150?u=' + user.id);
    }
  }, [user]);
  
  const handleLogout = () => {
    logout();
  };
  
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    if (!isEditing && user) {
      // Réinitialiser les valeurs en mode édition
      setUsername(user.username);
    }
  };
  
  const handleUpdateProfile = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Dans une application réelle, nous mettrions à jour le profil via l'API
      // Pour l'instant, nous simulons une mise à jour réussie
      console.log('Mise à jour du profil:', { username, profilePicture });
      
      // Simuler un délai de mise à jour
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Désactiver le mode édition
      setIsEditing(false);
      
      // Afficher un message de succès
      alert('Profil mis à jour avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de la mise à jour du profil';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangeProfilePicture = async () => {
    try {
      const image = await cameraService.selectFromGallery();
      // Dans une application réelle, nous téléchargerions l'image
      // Pour l'instant, nous simulons un changement
      console.log('Image sélectionnée:', image);
      setProfilePicture(image.webPath || profilePicture);
    } catch (err) {
      console.error('Erreur lors de la sélection de l\'image:', err);
    }
  };
  
  if (!user) {
    return (
      <IonPage>
        <IonContent>
          <IonText color="danger" className="ion-padding ion-text-center">
            <p>Vous devez être connecté pour accéder à cette page.</p>
          </IonText>
        </IonContent>
      </IonPage>
    );
  }
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Profil</IonTitle>
          <IonButton slot="end" fill="clear" onClick={handleLogout} aria-label="Se déconnecter">
            <IonIcon slot="icon-only" icon={logOut} />
          </IonButton>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Mise à jour du profil..." />
        
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <div className="profile-header">
                <div className="profile-picture-container">
                  <img 
                    src={profilePicture} 
                    alt={`Profil de ${username}`} 
                    className="profile-picture" 
                  />
                  {isEditing && (
                    <IonButton 
                      className="change-picture-button" 
                      size="small" 
                      onClick={handleChangeProfilePicture}
                      aria-label="Changer la photo de profil"
                    >
                      <IonIcon icon={camera} />
                    </IonButton>
                  )}
                </div>
                
                <IonButton 
                  fill="clear" 
                  className="edit-button"
                  onClick={handleEditToggle}
                  aria-label={isEditing ? "Annuler les modifications" : "Modifier le profil"}
                >
                  <IonIcon icon={pencil} />
                  {isEditing ? 'Annuler' : 'Modifier'}
                </IonButton>
              </div>
              
              {error && (
                <IonText color="danger">
                  <p className="error-message">{error}</p>
                </IonText>
              )}
              
              <IonCard>
                <IonCardContent>
                  {isEditing ? (
                    <IonList>
                      <IonItem>
                        <IonLabel position="stacked">Nom d&apos;utilisateur</IonLabel>
                        <IonInput
                          value={username}
                          onIonChange={e => setUsername(e.detail.value || '')}
                        />
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel position="stacked">Email</IonLabel>
                        <IonInput value={user.email} disabled />
                        <IonText color="medium" slot="helper">
                          L&apos;email ne peut pas être modifié
                        </IonText>
                      </IonItem>
                      
                      <IonButton 
                        expand="block" 
                        className="ion-margin-top"
                        onClick={handleUpdateProfile}
                        aria-label="Enregistrer les modifications du profil"
                      >
                        Enregistrer les modifications
                      </IonButton>
                    </IonList>
                  ) : (
                    <IonList>
                      <IonItem>
                        <IonLabel>
                          <h2>Nom d&apos;utilisateur</h2>
                          <p>{user.username}</p>
                        </IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel>
                          <h2>Email</h2>
                          <p>{user.email}</p>
                        </IonLabel>
                      </IonItem>
                      
                      <IonItem>
                        <IonLabel>
                          <h2>Membre depuis</h2>
                          <p>{new Date(user.createdAt).toLocaleDateString()}</p>
                        </IonLabel>
                      </IonItem>
                    </IonList>
                  )}
                </IonCardContent>
              </IonCard>
              
              <IonItemDivider>Statistiques</IonItemDivider>
              
              <IonCard>
                <IonCardContent>
                  <IonGrid>
                    <IonRow>
                      <IonCol>
                        <div className="stat-item">
                          <div className="stat-value">0</div>
                          <div className="stat-label">Stories</div>
                        </div>
                      </IonCol>
                      <IonCol>
                        <div className="stat-item">
                          <div className="stat-value">0</div>
                          <div className="stat-label">Amis</div>
                        </div>
                      </IonCol>
                      <IonCol>
                        <div className="stat-item">
                          <div className="stat-value">0</div>
                          <div className="stat-label">Messages</div>
                        </div>
                      </IonCol>
                    </IonRow>
                  </IonGrid>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Profile;
