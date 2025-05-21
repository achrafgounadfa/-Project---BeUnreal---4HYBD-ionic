import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonPage,
  IonImg,
  IonText,
  IonIcon,
  IonSpinner
} from '@ionic/react';
import { logoIonic } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import './SplashScreen.css';

const SplashScreen: React.FC = () => {
  const [animationComplete, setAnimationComplete] = useState(false);
  const history = useHistory();
  
  useEffect(() => {
    // Simuler un chargement initial
    const timer = setTimeout(() => {
      setAnimationComplete(true);
      
      // Rediriger vers la page de connexion après l'animation
      setTimeout(() => {
        history.replace('/login');
      }, 1000); // Attendre 1 seconde après la fin de l'animation
    }, 3000); // Animation de 3 secondes
    
    return () => clearTimeout(timer);
  }, [history]);
  
  return (
    <IonPage>
      <IonContent fullscreen className="splash-container">
        <div className={`splash-content ${animationComplete ? 'fade-out' : ''}`}>
          <div className="logo-container">
            <div className="logo-wrapper">
              <IonImg 
                src="/assets/logo.png" 
                alt="BeUnreal Logo" 
                className={`splash-logo ${animationComplete ? 'scale-up' : ''}`}
              />
            </div>
            <IonText className={`app-name ${animationComplete ? 'slide-up' : ''}`}>
              <h1>Be.unreal</h1>
            </IonText>
          </div>
          
          <div className="loading-indicator">
            <IonSpinner name="dots" />
          </div>
          
          <div className="footer">
            <IonText color="medium">
              <p>Partagez des moments authentiques</p>
            </IonText>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default SplashScreen;
