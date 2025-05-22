import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  IonFab,
  IonFabButton,
  setupIonicReact
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { home, chatbubble, camera, person, search } from 'ionicons/icons';
import Login from './pages/Login';
import Messages from './pages/Messages';
import Stories from './pages/Stories';
import Profile from './pages/Profile';
import Chat from './pages/Chat';
import FindFriends from './pages/FindFriends';
import useAuthStore from './stores/authStore';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';
import './theme/global.css';
import 'leaflet/dist/leaflet.css';
import './utils/leaflet-fixes';


setupIonicReact();

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  
  return (
    <IonApp>
      <IonReactRouter>
        {!isAuthenticated ? (
          <IonRouterOutlet>
            <Route exact path="/login" component={Login} />
            <Route exact path="/">
              <Redirect to="/login" />
            </Route>
          </IonRouterOutlet>
        ) : (
          <IonTabs>
            <IonRouterOutlet>
              <Route exact path="/home" component={Stories} />
              <Route exact path="/messages" component={Messages} />
              <Route exact path="/chat/:id" component={Chat} />
              <Route exact path="/discover" component={FindFriends} />
              <Route exact path="/profile" component={Profile} />
              <Route exact path="/">
                <Redirect to="/home" />
              </Route>
            </IonRouterOutlet>
            
            <IonTabBar slot="bottom">
              <IonTabButton tab="home" href="/home">
                <IonIcon icon={home} />
                <IonLabel>Home</IonLabel>
              </IonTabButton>
              
              <IonTabButton tab="messages" href="/messages">
                <IonIcon icon={chatbubble} />
                <IonLabel>Messages</IonLabel>
              </IonTabButton>
              
              {/* Bouton central pour la caméra - sera masqué visuellement mais garde l'espace */}
              <IonTabButton tab="camera" disabled>
                <div style={{ width: '1em', height: '1em' }}></div>
              </IonTabButton>
              
              <IonTabButton tab="discover" href="/discover">
                <IonIcon icon={search} />
                <IonLabel>Discover</IonLabel>
              </IonTabButton>
              
              <IonTabButton tab="profile" href="/profile">
                <IonIcon icon={person} />
                <IonLabel>Profil</IonLabel>
              </IonTabButton>
            </IonTabBar>
            
            {/* Bouton central flottant pour la caméra */}
            <IonFab vertical="bottom" horizontal="center" slot="fixed" className="camera-fab">
              <IonFabButton routerLink="/stories">
                <IonIcon icon={camera} />
              </IonFabButton>
            </IonFab>
          </IonTabs>
        )}
      </IonReactRouter>
    </IonApp>
  );
};

export default App;
