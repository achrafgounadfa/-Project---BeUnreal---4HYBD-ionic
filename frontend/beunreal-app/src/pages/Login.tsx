import React, { useState } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCard,
  IonCardContent,
  IonText,
  IonLoading,
  IonGrid,
  IonRow,
  IonCol,
  IonToast
} from '@ionic/react';
import { authService } from '../services/api';
import useAuthStore from '../stores/authStore';
import './Login.css';

interface LoginResponse {
  user: any;
  token: string;
}

interface RegisterData {
  email: string;
  username: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const { login, isLoading, error, setLoading, setError } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isRegister) {
        // Inscription
        console.log('Tentative d\'inscription avec:', { email, username, password });
        const response = await authService.register({ email, username, password } as RegisterData);
        console.log('Réponse d\'inscription:', response.data);
        login(response.data.user, response.data.token);
        setToastMessage('Inscription réussie !');
        setShowToast(true);
      } else {
        // Connexion
        console.log('Tentative de connexion avec:', { email, password });
        const response = await authService.login({ email, password } as LoginData);
        console.log('Réponse de connexion:', response.data);
        login(response.data.user, response.data.token);
        setToastMessage('Connexion réussie !');
        setShowToast(true);
      }
    } catch (err: any) {
      console.error('Erreur d\'authentification:', err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          'Une erreur est survenue lors de la communication avec le serveur';
      setError(errorMessage);
      setToastMessage(`Erreur: ${errorMessage}`);
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsRegister(!isRegister);
    setError(null);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>{isRegister ? 'Inscription' : 'Connexion'}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Veuillez patienter..." />
        <IonToast
          isOpen={showToast}
          onDidDismiss={() => setShowToast(false)}
          message={toastMessage}
          duration={3000}
          position="bottom"
          color={error ? "danger" : "success"}
        />
        
        <IonGrid>
          <IonRow className="ion-justify-content-center">
            <IonCol size="12" sizeMd="8" sizeLg="6">
              <IonCard>
                <IonCardContent>
                  <h1 className="app-title">BeUnreal</h1>
                  <p className="app-subtitle">Partagez vos moments authentiques</p>
                  
                  {error && (
                    <IonText color="danger">
                      <p className="error-message">{error}</p>
                    </IonText>
                  )}
                  
                  <form onSubmit={handleSubmit}>
                    {isRegister && (
                      <IonItem>
                        <IonLabel position="floating">Nom d&apos;utilisateur</IonLabel>
                        <IonInput
                          value={username}
                          onIonChange={e => setUsername(e.detail.value || '')}
                          required
                        />
                      </IonItem>
                    )}
                    
                    <IonItem>
                      <IonLabel position="floating">Email</IonLabel>
                      <IonInput
                        type="email"
                        value={email}
                        onIonChange={e => setEmail(e.detail.value || '')}
                        required
                      />
                    </IonItem>
                    
                    <IonItem>
                      <IonLabel position="floating">Mot de passe</IonLabel>
                      <IonInput
                        type="password"
                        value={password}
                        onIonChange={e => setPassword(e.detail.value || '')}
                        required
                      />
                    </IonItem>
                    
                    <IonButton 
                      expand="block" 
                      type="submit" 
                      className="ion-margin-top"
                    >
                      {isRegister ? 'S\'inscrire' : 'Se connecter'}
                    </IonButton>
                  </form>
                  
                  <div className="toggle-container">
                    <IonButton 
                      fill="clear" 
                      onClick={toggleMode}
                    >
                      {isRegister ? 'Déjà un compte ? Se connecter' : 'Pas de compte ? S\'inscrire'}
                    </IonButton>
                    
                    <IonButton
                      fill="clear"
                      className="forgot-password"
                      routerLink="/forgot-password"
                    >
                      Mot de passe oublié ?
                    </IonButton>
                  </div>
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>
      </IonContent>
    </IonPage>
  );
};

export default Login;
