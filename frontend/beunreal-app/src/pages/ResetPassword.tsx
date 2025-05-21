import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonInput,
  IonButton,
  IonItem,
  IonLabel,
  IonLoading,
  IonText,
  IonGrid,
  IonRow,
  IonCol,
  IonIcon,
  IonBackButton,
  IonButtons
} from '@ionic/react';
import { lockClosedOutline, checkmarkCircle } from 'ionicons/icons';
import { useHistory, useParams } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

interface ResetPasswordParams {
  token: string;
}

const ResetPassword: React.FC = () => {
  const { token } = useParams<ResetPasswordParams>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const history = useHistory();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Veuillez entrer un nouveau mot de passe');
      return;
    }
    
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }
    
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Appel à l'API pour réinitialiser le mot de passe
      await authService.resetPassword(token, password);
      
      // Afficher le message de succès
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de la réinitialisation du mot de passe';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" />
          </IonButtons>
          <IonTitle>Réinitialiser le mot de passe</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Traitement en cours..." />
        
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              {success ? (
                <div className="success-container ion-text-center">
                  <IonIcon 
                    icon={checkmarkCircle} 
                    color="success" 
                    className="success-icon"
                    style={{ fontSize: '64px', marginBottom: '16px' }}
                  />
                  <IonText>
                    <h2>Mot de passe réinitialisé</h2>
                    <p>
                      Votre mot de passe a été réinitialisé avec succès.
                      Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.
                    </p>
                  </IonText>
                  <IonButton 
                    expand="block" 
                    className="ion-margin-top"
                    onClick={() => history.push('/login')}
                    aria-label="Se connecter"
                  >
                    Se connecter
                  </IonButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="logo-container ion-text-center">
                    <IonIcon 
                      icon={lockClosedOutline} 
                      color="primary" 
                      style={{ fontSize: '64px', marginBottom: '16px' }}
                    />
                    <IonText>
                      <h2>Nouveau mot de passe</h2>
                      <p>
                        Veuillez entrer votre nouveau mot de passe.
                      </p>
                    </IonText>
                  </div>
                  
                  {error && (
                    <IonText color="danger" className="ion-text-center">
                      <p className="error-message">{error}</p>
                    </IonText>
                  )}
                  
                  <IonItem className="ion-margin-top">
                    <IonLabel position="floating">Nouveau mot de passe</IonLabel>
                    <IonInput
                      type="password"
                      value={password}
                      onIonChange={e => setPassword(e.detail.value || '')}
                      required
                      aria-label="Nouveau mot de passe"
                    />
                  </IonItem>
                  
                  <IonItem className="ion-margin-top">
                    <IonLabel position="floating">Confirmer le mot de passe</IonLabel>
                    <IonInput
                      type="password"
                      value={confirmPassword}
                      onIonChange={e => setConfirmPassword(e.detail.value || '')}
                      required
                      aria-label="Confirmer le mot de passe"
                    />
                  </IonItem>
                  
                  <IonButton 
                    expand="block" 
                    type="submit" 
                    className="ion-margin-top"
                    aria-label="Réinitialiser le mot de passe"
                  >
                    Réinitialiser le mot de passe
                  </IonButton>
                </form>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ResetPassword;
