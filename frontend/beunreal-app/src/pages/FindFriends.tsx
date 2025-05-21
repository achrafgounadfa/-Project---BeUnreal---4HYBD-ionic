import React, { useState } from 'react';
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
  IonSearchbar,
  IonLoading,
  IonText,
  IonAvatar
} from '@ionic/react';
import { personAdd } from 'ionicons/icons';
import useAuthStore from '../stores/authStore';
import './FindFriends.css';

interface SearchResult {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
  isAdded?: boolean;
}

const FindFriends: React.FC = () => {
  const { user } = useAuthStore();
  
  const [searchText, setSearchText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  
  const handleSearch = async () => {
    if (!searchText.trim()) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Dans une application réelle, nous rechercherions les utilisateurs via l'API
      // Pour l'instant, nous utilisons des données fictives
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResults: SearchResult[] = [
        { id: '101', username: 'Sophie', email: 'sophie@example.com', profilePicture: 'https://i.pravatar.cc/150?u=101' },
        { id: '102', username: 'Thomas', email: 'thomas@example.com', profilePicture: 'https://i.pravatar.cc/150?u=102' },
        { id: '103', username: 'Julie', email: 'julie@example.com', profilePicture: 'https://i.pravatar.cc/150?u=103' }
      ].filter(u => 
        u.username.toLowerCase().includes(searchText.toLowerCase()) || 
        u.email.toLowerCase().includes(searchText.toLowerCase())
      );
      
      setSearchResults(mockResults);
      
      if (mockResults.length === 0) {
        setError('Aucun utilisateur trouvé');
      }
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de la recherche';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddFriend = async (friendId: string) => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Dans une application réelle, nous ajouterions l'ami via l'API
      // Pour l'instant, nous simulons l'ajout
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mettre à jour l'interface utilisateur
      setSearchResults(prev => 
        prev.map(result => 
          result.id === friendId 
            ? { ...result, isAdded: true } 
            : result
        )
      );
      
      // Afficher un message de succès
      alert('Ami ajouté avec succès');
    } catch (err) {
      const errorMessage = err instanceof Error 
        ? err.message 
        : 'Erreur lors de l\'ajout de l\'ami';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Rechercher des amis</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonLoading isOpen={isLoading} message="Recherche en cours..." />
        
        <div className="search-container">
          <IonSearchbar
            value={searchText}
            onIonChange={e => setSearchText(e.detail.value || '')}
            placeholder="Rechercher par email ou nom d'utilisateur"
            debounce={500}
          />
          
          <IonButton expand="block" onClick={handleSearch} aria-label="Rechercher des utilisateurs">
            Rechercher
          </IonButton>
        </div>
        
        {error && (
          <IonText color="danger" className="ion-text-center">
            <p>{error}</p>
          </IonText>
        )}
        
        {searchResults.length > 0 && (
          <IonList>
            {searchResults.map(result => (
              <IonItem key={result.id}>
                <IonAvatar slot="start">
                  <img src={result.profilePicture} alt={`Photo de ${result.username}`} />
                </IonAvatar>
                <IonLabel>
                  <h2>{result.username}</h2>
                  <p>{result.email}</p>
                </IonLabel>
                {!result.isAdded ? (
                  <IonButton 
                    slot="end" 
                    fill="outline" 
                    onClick={() => handleAddFriend(result.id)}
                    aria-label={`Ajouter ${result.username} comme ami`}
                  >
                    <IonIcon slot="icon-only" icon={personAdd} />
                  </IonButton>
                ) : (
                  <IonButton 
                    slot="end" 
                    fill="clear" 
                    disabled
                  >
                    Ajouté
                  </IonButton>
                )}
              </IonItem>
            ))}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default FindFriends;
