import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonAvatar,
  IonLabel,
  IonSearchbar,
  IonButton,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonFab,
  IonFabButton,
  IonSegment,
  IonSegmentButton,
  RefresherEventDetail,
  IonModal,
  IonInput,
  IonChip
} from '@ionic/react';
import { add, personAdd, people, chatbubble, checkmark } from 'ionicons/icons';
import './Messages.css';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  avatar: string;
  isGroup: boolean;
}

interface User {
  id: string;
  username: string;
  email: string;
  profilePicture: string;
}

const Messages: React.FC = () => {
  const [searchText, setSearchText] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [segment, setSegment] = useState<'all' | 'direct' | 'groups'>('all');
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [searchFriends, setSearchFriends] = useState('');
  const [friends, setFriends] = useState<User[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<User[]>([]);
  const [isCreatingGroup, setIsCreatingGroup] = useState(false);
  
  const loadConversations = async (): Promise<void> => {
    setIsLoading(true);
    
    try {
      // Dans une application réelle, nous chargerions les conversations depuis l'API
      // Pour l'instant, nous utilisons des données fictives
      setTimeout(() => {
        const mockConversations: Conversation[] = [
          {
            id: '1',
            name: 'Alice',
            lastMessage: 'Salut, comment ça va ?',
            timestamp: '10:30',
            unread: 2,
            avatar: 'https://i.pravatar.cc/150?u=1',
            isGroup: false
          },
          {
            id: '2',
            name: 'Bob',
            lastMessage: 'Tu as vu ma dernière story ?',
            timestamp: '09:15',
            unread: 0,
            avatar: 'https://i.pravatar.cc/150?u=2',
            isGroup: false
          },
          {
            id: '3',
            name: 'Groupe Amis',
            lastMessage: 'Charlie: On se retrouve où ?',
            timestamp: 'Hier',
            unread: 5,
            avatar: 'https://i.pravatar.cc/150?u=3',
            isGroup: true
          },
          {
            id: '4',
            name: 'Projet BeUnreal',
            lastMessage: 'David: J\'ai terminé la maquette',
            timestamp: 'Hier',
            unread: 0,
            avatar: 'https://i.pravatar.cc/150?u=4',
            isGroup: true
          },
          {
            id: '5',
            name: 'Eva',
            lastMessage: 'À demain !',
            timestamp: 'Lun',
            unread: 0,
            avatar: 'https://i.pravatar.cc/150?u=5',
            isGroup: false
          }
        ];
        
        setConversations(mockConversations);
        setIsLoading(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors du chargement des conversations:', err);
      setIsLoading(false);
    }
  };

  const loadFriends = async (): Promise<void> => {
    try {
      // Dans une application réelle, nous chargerions les amis depuis l'API
      // Pour l'instant, nous utilisons des données fictives
      setTimeout(() => {
        const mockFriends: User[] = [
          {
            id: '1',
            username: 'Alice',
            email: 'alice@example.com',
            profilePicture: 'https://i.pravatar.cc/150?u=1'
          },
          {
            id: '2',
            username: 'Bob',
            email: 'bob@example.com',
            profilePicture: 'https://i.pravatar.cc/150?u=2'
          },
          {
            id: '5',
            username: 'Eva',
            email: 'eva@example.com',
            profilePicture: 'https://i.pravatar.cc/150?u=5'
          },
          {
            id: '6',
            username: 'Frank',
            email: 'frank@example.com',
            profilePicture: 'https://i.pravatar.cc/150?u=6'
          },
          {
            id: '7',
            username: 'Grace',
            email: 'grace@example.com',
            profilePicture: 'https://i.pravatar.cc/150?u=7'
          }
        ];
        
        setFriends(mockFriends);
      }, 500);
    } catch (err) {
      console.error('Erreur lors du chargement des amis:', err);
    }
  };
  
  useEffect(() => {
    loadConversations();
    loadFriends();
  }, []);
  
  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    loadConversations().then(() => {
      event.detail.complete();
    });
  };

  const toggleFriendSelection = (friend: User): void => {
    if (selectedFriends.some(f => f.id === friend.id)) {
      setSelectedFriends(selectedFriends.filter(f => f.id !== friend.id));
    } else {
      setSelectedFriends([...selectedFriends, friend]);
    }
  };

  const createGroup = async (): Promise<void> => {
    if (groupName.trim() === '' || selectedFriends.length === 0) {
      return;
    }

    setIsCreatingGroup(true);

    try {
      // Dans une application réelle, nous enverrions une requête à l'API
      // Pour l'instant, nous simulons la création
      setTimeout(() => {
        // Ajouter le nouveau groupe aux conversations
        const newGroup: Conversation = {
          id: `group-${Date.now()}`,
          name: groupName,
          lastMessage: 'Groupe créé',
          timestamp: 'Maintenant',
          unread: 0,
          avatar: 'https://i.pravatar.cc/150?u=group',
          isGroup: true
        };

        setConversations([newGroup, ...conversations]);
        
        // Réinitialiser le formulaire
        setGroupName('');
        setSelectedFriends([]);
        setShowNewGroupModal(false);
        setIsCreatingGroup(false);
      }, 1000);
    } catch (err) {
      console.error('Erreur lors de la création du groupe:', err);
      setIsCreatingGroup(false);
    }
  };
  
  const filteredConversations = conversations.filter(conversation => {
    // Filtrer par segment
    if (segment === 'direct' && conversation.isGroup) return false;
    if (segment === 'groups' && !conversation.isGroup) return false;
    
    // Filtrer par texte de recherche
    return conversation.name.toLowerCase().includes(searchText.toLowerCase());
  });

  const filteredFriends = friends.filter(friend => 
    friend.username.toLowerCase().includes(searchFriends.toLowerCase()) ||
    friend.email.toLowerCase().includes(searchFriends.toLowerCase())
  );
  
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Messages</IonTitle>
          <IonButton slot="end" fill="clear" onClick={() => setShowNewGroupModal(true)}>
            <IonIcon icon={people} />
          </IonButton>
        </IonToolbar>
        <IonToolbar>
          <IonSegment value={segment} onIonChange={e => setSegment(e.detail.value as 'all' | 'direct' | 'groups')}>
            <IonSegmentButton value="all">
              <IonLabel>Tous</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="direct">
              <IonLabel>Directs</IonLabel>
            </IonSegmentButton>
            <IonSegmentButton value="groups">
              <IonLabel>Groupes</IonLabel>
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent></IonRefresherContent>
        </IonRefresher>
        
        <IonSearchbar
          value={searchText}
          onIonChange={e => setSearchText(e.detail.value || '')}
          placeholder="Rechercher des conversations"
        />
        
        <IonList className="conversation-list">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, index) => (
              <IonItem key={index}>
                <IonAvatar slot="start">
                  <IonSkeletonText animated />
                </IonAvatar>
                <IonLabel>
                  <h2><IonSkeletonText animated style={{ width: '50%' }} /></h2>
                  <p><IonSkeletonText animated style={{ width: '80%' }} /></p>
                </IonLabel>
              </IonItem>
            ))
          ) : (
            filteredConversations.map(conversation => (
              <IonItem 
                key={conversation.id} 
                routerLink={`/chat/${conversation.id}`}
                className="conversation-item"
                detail={false}
              >
                <div className="conversation-avatar-container">
                  <IonAvatar className="conversation-avatar">
                    <img src={conversation.avatar} alt={conversation.name} />
                  </IonAvatar>
                  {conversation.unread > 0 && (
                    <div className="unread-badge">{conversation.unread}</div>
                  )}
                </div>
                <IonLabel>
                  <div className="conversation-header">
                    <h2 className="conversation-name">
                      {conversation.name}
                      {conversation.isGroup && (
                        <IonIcon icon={people} style={{ marginLeft: '5px', fontSize: '14px' }} />
                      )}
                    </h2>
                    <span className="conversation-time">{conversation.timestamp}</span>
                  </div>
                  <p className="conversation-message">{conversation.lastMessage}</p>
                </IonLabel>
              </IonItem>
            ))
          )}
        </IonList>
        
        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton routerLink="/find-friends">
            <IonIcon icon={personAdd} />
          </IonFabButton>
        </IonFab>

        {/* Modal pour créer un nouveau groupe */}
        <IonModal isOpen={showNewGroupModal} onDidDismiss={() => setShowNewGroupModal(false)}>
          <IonHeader>
            <IonToolbar>
              <IonTitle>Nouveau groupe</IonTitle>
              <IonButton slot="end" fill="clear" onClick={() => setShowNewGroupModal(false)}>
                Annuler
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonContent>
            <div className="ion-padding">
              <IonInput
                label="Nom du groupe"
                labelPlacement="floating"
                placeholder="Entrez un nom pour le groupe"
                value={groupName}
                onIonChange={e => setGroupName(e.detail.value || '')}
              />

              <div className="selected-friends-container ion-margin-vertical">
                <IonLabel>Membres sélectionnés ({selectedFriends.length})</IonLabel>
                <div className="selected-friends-chips">
                  {selectedFriends.map(friend => (
                    <IonChip key={friend.id} onClick={() => toggleFriendSelection(friend)}>
                      <IonAvatar>
                        <img src={friend.profilePicture} alt={friend.username} />
                      </IonAvatar>
                      <IonLabel>{friend.username}</IonLabel>
                    </IonChip>
                  ))}
                </div>
              </div>

              <IonSearchbar
                value={searchFriends}
                onIonChange={e => setSearchFriends(e.detail.value || '')}
                placeholder="Rechercher des amis"
              />

              <IonList>
                {filteredFriends.map(friend => (
                  <IonItem key={friend.id} onClick={() => toggleFriendSelection(friend)} button>
                    <IonAvatar slot="start">
                      <img src={friend.profilePicture} alt={friend.username} />
                    </IonAvatar>
                    <IonLabel>
                      <h2>{friend.username}</h2>
                      <p>{friend.email}</p>
                    </IonLabel>
                    {selectedFriends.some(f => f.id === friend.id) && (
                      <IonIcon icon={checkmark} slot="end" color="primary" />
                    )}
                  </IonItem>
                ))}
              </IonList>

              <IonButton
                expand="block"
                onClick={createGroup}
                disabled={groupName.trim() === '' || selectedFriends.length === 0 || isCreatingGroup}
                className="ion-margin-top"
              >
                {isCreatingGroup ? 'Création en cours...' : 'Créer le groupe'}
              </IonButton>
            </div>
          </IonContent>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Messages;
