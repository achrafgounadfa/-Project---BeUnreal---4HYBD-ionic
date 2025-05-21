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
  IonButton,
  IonIcon,
  IonLoading,
  IonText,
  IonAvatar,
  IonSegment,
  IonSegmentButton,
  IonBadge,
  IonRefresher,
  IonRefresherContent,
  RefresherEventDetail
} from '@ionic/react';
import { personAdd, checkmark, close, people } from 'ionicons/icons';
import useAuthStore from '../stores/authStore';
import { userService } from '../services/api';
import './FindFriends.css';

interface FriendRequest {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
}

const FriendRequests: React.FC = () => {
  const { user } = useAuthStore();
  
  const [activeSegment, setActiveSegment] = useState<'received' | 'sent'>('received');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receivedRequests, setReceivedRequests] = useState<FriendRequest[]>([]);
  const [sentRequests, setSentRequests] = useState<FriendRequest[]>([]);
  
  useEffect(() => {
    loadFriendRequests();
  }, []);
  
  const loadFriendRequests = async () => {
    if (!user) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Charger les demandes reçues
      const receivedData = await userService.getReceivedFriendRequests();
      setReceivedRequests(receivedData);
      
      // Charger les demandes envoyées
      const sentData = await userService.getSentFriendRequests();
      setSentRequests(sentData);
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors du chargement des demandes d\'amis';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
    await loadFriendRequests();
    event.detail.complete();
  };
  
  const handleAcceptRequest = async (friendId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await userService.acceptFriendRequest(friendId);
      
      // Mettre à jour la liste des demandes
      setReceivedRequests(prev => prev.filter(request => request.id !== friendId));
      
      // Afficher un message de succès
      alert('Demande d\'ami acceptée avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de l\'acceptation de la demande d\'ami';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRejectRequest = async (friendId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      await userService.rejectFriendRequest(friendId);
      
      // Mettre à jour la liste des demandes
      setReceivedRequests(prev => prev.filter(request => request.id !== friendId));
      
      // Afficher un message de succès
      alert('Demande d\'ami refusée');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors du refus de la demande d\'ami';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCancelRequest = async (friendId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Dans une application réelle, nous aurions un endpoint spécifique pour annuler une demande
      // Pour l'instant, nous utilisons le même endpoint que pour refuser
      await userService.rejectFriendRequest(friendId);
      
      // Mettre à jour la liste des demandes
      setSentRequests(prev => prev.filter(request => request.id !== friendId));
      
      // Afficher un message de succès
      alert('Demande d\'ami annulée');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de l\'annulation de la demande d\'ami';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Demandes d'amis</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonLoading isOpen={isLoading} message="Chargement..." />
        
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <IonSegment value={activeSegment} onIonChange={e => setActiveSegment(e.detail.value as 'received' | 'sent')}>
          <IonSegmentButton value="received">
            <IonLabel>
              Reçues
              {receivedRequests.length > 0 && (
                <IonBadge color="danger" className="request-badge">{receivedRequests.length}</IonBadge>
              )}
            </IonLabel>
          </IonSegmentButton>
          <IonSegmentButton value="sent">
            <IonLabel>Envoyées</IonLabel>
          </IonSegmentButton>
        </IonSegment>
        
        {error && (
          <IonText color="danger" className="ion-text-center ion-padding">
            <p>{error}</p>
          </IonText>
        )}
        
        {activeSegment === 'received' && (
          <IonList>
            {receivedRequests.length === 0 ? (
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <IonIcon icon={people} className="empty-icon" />
                  <p>Aucune demande d'ami reçue</p>
                </IonLabel>
              </IonItem>
            ) : (
              receivedRequests.map(request => (
                <IonItem key={request.id}>
                  <IonAvatar slot="start">
                    <img src={request.profilePicture || 'https://i.pravatar.cc/150?u=' + request.id} alt={`Photo de ${request.username}`} />
                  </IonAvatar>
                  <IonLabel>
                    <h2>{request.username}</h2>
                    <p>{request.email}</p>
                  </IonLabel>
                  <IonButton 
                    slot="end" 
                    fill="clear" 
                    color="success"
                    onClick={() => handleAcceptRequest(request.id)}
                    aria-label={`Accepter la demande de ${request.username}`}
                  >
                    <IonIcon slot="icon-only" icon={checkmark} />
                  </IonButton>
                  <IonButton 
                    slot="end" 
                    fill="clear" 
                    color="danger"
                    onClick={() => handleRejectRequest(request.id)}
                    aria-label={`Refuser la demande de ${request.username}`}
                  >
                    <IonIcon slot="icon-only" icon={close} />
                  </IonButton>
                </IonItem>
              ))
            )}
          </IonList>
        )}
        
        {activeSegment === 'sent' && (
          <IonList>
            {sentRequests.length === 0 ? (
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <IonIcon icon={personAdd} className="empty-icon" />
                  <p>Aucune demande d'ami envoyée</p>
                </IonLabel>
              </IonItem>
            ) : (
              sentRequests.map(request => (
                <IonItem key={request.id}>
                  <IonAvatar slot="start">
                    <img src={request.profilePicture || 'https://i.pravatar.cc/150?u=' + request.id} alt={`Photo de ${request.username}`} />
                  </IonAvatar>
                  <IonLabel>
                    <h2>{request.username}</h2>
                    <p>{request.email}</p>
                  </IonLabel>
                  <IonButton 
                    slot="end" 
                    fill="clear" 
                    color="danger"
                    onClick={() => handleCancelRequest(request.id)}
                    aria-label={`Annuler la demande à ${request.username}`}
                  >
                    <IonIcon slot="icon-only" icon={close} />
                  </IonButton>
                </IonItem>
              ))
            )}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FriendRequests;
