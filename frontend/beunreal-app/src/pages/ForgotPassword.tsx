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
import { mailOutline, checkmarkCircle } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const history = useHistory();
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      setError('Veuillez entrer votre adresse email');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Appel à l'API pour demander la réinitialisation du mot de passe
      await authService.forgotPassword(email);
      
      // Afficher le message de succès
      setSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de la demande de réinitialisation du mot de passe';
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
          <IonTitle>Mot de passe oublié</IonTitle>
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
                    <h2>Email envoyé</h2>
                    <p>
                      Si l'adresse email que vous avez saisie est associée à un compte,
                      vous recevrez un lien pour réinitialiser votre mot de passe.
                    </p>
                    <p>
                      Veuillez vérifier votre boîte de réception et vos spams.
                    </p>
                  </IonText>
                  <IonButton 
                    expand="block" 
                    className="ion-margin-top"
                    onClick={() => history.push('/login')}
                  >
                    Retour à la connexion
                  </IonButton>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="logo-container ion-text-center">
                    <IonIcon 
                      icon={mailOutline} 
                      color="primary" 
                      style={{ fontSize: '64px', marginBottom: '16px' }}
                    />
                    <IonText>
                      <h2>Réinitialisation du mot de passe</h2>
                      <p>
                        Entrez l'adresse email associée à votre compte pour recevoir
                        un lien de réinitialisation de mot de passe.
                      </p>
                    </IonText>
                  </div>
                  
                  {error && (
                    <IonText color="danger" className="ion-text-center">
                      <p className="error-message">{error}</p>
                    </IonText>
                  )}
                  
                  <IonItem className="ion-margin-top">
                    <IonLabel position="floating">Email</IonLabel>
                    <IonInput
                      type="email"
                      value={email}
                      onIonChange={e => setEmail(e.detail.value || '')}
                      required
                      aria-label="Email"
                    />
                  </IonItem>
                  
                  <IonButton 
                    expand="block" 
                    type="submit" 
                    className="ion-margin-top"
                    aria-label="Envoyer le lien de réinitialisation"
                  >
                    Envoyer le lien de réinitialisation
                  </IonButton>
                  
                  <div className="ion-text-center ion-margin-top">
                    <IonButton 
                      fill="clear" 
                      routerLink="/login"
                      aria-label="Retour à la connexion"
                    >
                      Retour à la connexion
                    </IonButton>
                  </div>
                </form>
              )}
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default ForgotPassword;
