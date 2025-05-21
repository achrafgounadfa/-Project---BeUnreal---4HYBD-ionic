import React, { useState, useEffect } from 'react';
import { 
  IonContent, 
  IonHeader, 
  IonPage, 
  IonTitle, 
  IonToolbar,
  IonRefresher,
  IonRefresherContent,
  IonSkeletonText,
  IonButton,
  IonIcon,
  IonAvatar,
  IonCard,
  IonCardContent,
  IonCardHeader,
  RefresherEventDetail,
  IonFab,
  IonFabButton
} from '@ionic/react';
import { location, heart, chatbubble, share, add } from 'ionicons/icons';
import { geolocationService } from '../services/native';
import useAuthStore from '../stores/authStore';
import useStoryStore, { Story } from '../stores/storyStore';
import './Stories.css';

const Stories: React.FC = () => {
  const { user } = useAuthStore();
  const { stories, setStories, isLoading, setLoading, setError } = useStoryStore();
  const [viewedStories, setViewedStories] = useState<Set<string>>(new Set());
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [friendStories, setFriendStories] = useState<{[key: string]: Story[]}>({});

  const loadStories = async (): Promise<void> => {
    if (!user) return;
    setLoading(true);

    try {
      const position = await geolocationService.getCurrentPosition();

      setTimeout(() => {
        const mockStories: Story[] = [
          {
            id: '1',
            userId: '2',
            username: 'Alice',
            userAvatar: 'https://i.pravatar.cc/150?u=2',
            mediaUrl: 'https://picsum.photos/id/1/800/1000',
            type: 'image',
            caption: 'Belle journée au parc !',
            location: 'Parc des Buttes-Chaumont',
            latitude: position.coords.latitude + 0.01,
            longitude: position.coords.longitude - 0.01,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: '2',
            userId: '3',
            username: 'Bob',
            userAvatar: 'https://i.pravatar.cc/150?u=3',
            mediaUrl: 'https://picsum.photos/id/20/800/1000',
            type: 'image',
            caption: 'Déjeuner avec des amis',
            location: 'Restaurant Le Petit Bistro',
            latitude: position.coords.latitude - 0.01,
            longitude: position.coords.longitude + 0.02,
            createdAt: new Date(Date.now() - 7200000).toISOString()
          },
          {
            id: '3',
            userId: '4',
            username: 'Charlie',
            userAvatar: 'https://i.pravatar.cc/150?u=4',
            mediaUrl: 'https://picsum.photos/id/30/800/1000',
            type: 'image',
            caption: 'Soirée cinéma',
            location: 'Cinéma Pathé',
            latitude: position.coords.latitude + 0.02,
            longitude: position.coords.longitude + 0.01,
            createdAt: new Date(Date.now() - 10800000).toISOString()
          }
        ];

        setStories(mockStories);

        const storiesByUser: {[key: string]: Story[]} = {};
        mockStories.forEach(story => {
          if (!storiesByUser[story.userId]) {
            storiesByUser[story.userId] = [];
          }
          storiesByUser[story.userId].push(story);
        });

        setFriendStories(storiesByUser);
        setLoading(false);
      }, 1000);
    } catch (err) {
      const errorMessage = err instanceof Error
        ? err.message
        : 'Erreur lors du chargement des stories';
      setError(errorMessage);
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
  }, [user, setError, setLoading, setStories]);

  const handleRefresh = (event: CustomEvent<RefresherEventDetail>): void => {
    loadStories().then(() => event.detail.complete());
  };

  const openStory = (userId: string, index = 0): void => {
    setCurrentStoryIndex(index);
    setShowFullscreen(true);

    const userStories = friendStories[userId] || [];
    if (userStories.length > 0) {
      setViewedStories(prev => new Set(prev).add(userStories[index].id));
    }
  };

  const closeStory = (): void => setShowFullscreen(false);

  const nextStory = (): void => {
    const userIds = Object.keys(friendStories);
    if (currentStoryIndex < userIds.length - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);

      // Marquer comme vue la première story du prochain user
      const nextUserId = userIds[currentStoryIndex + 1];
      const nextUserStories = friendStories[nextUserId] || [];
      if (nextUserStories.length > 0) {
        setViewedStories(prev => new Set(prev).add(nextUserStories[0].id));
      }
    } else {
      closeStory();
    }
  };

  const prevStory = (): void => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
    }
  };

  const createStory = async (): Promise<void> => {
    // À implémenter pour utiliser caméra et géolocalisation
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Stories</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {/* Cercles stories style Instagram */}
        <div className="story-circles">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <div className="story-circle" key={`skeleton-${idx}`}>
                <div className="story-avatar-border">
                  <IonAvatar className="story-avatar">
                    <IonSkeletonText animated />
                  </IonAvatar>
                </div>
                <IonSkeletonText animated style={{ width: '60px', height: '12px' }} />
              </div>
            ))
          ) : (
            Object.entries(friendStories).map(([userId, userStories]) => {
              const isViewed = userStories.every(story => viewedStories.has(story.id));
              return (
                <div
                  className="story-circle"
                  key={userId}
                  onClick={() => openStory(userId)}
                  role="button"
                  tabIndex={0}
                  onKeyPress={e => e.key === 'Enter' && openStory(userId)}
                >
                  <div className={`story-avatar-border ${isViewed ? 'viewed' : ''}`}>
                    <img
                      src={userStories[0].userAvatar}
                      alt={userStories[0].username}
                      className="story-avatar"
                      loading="lazy"
                    />
                  </div>
                  <div className="story-username">{userStories[0].username}</div>
                </div>
              );
            })
          )}
        </div>

        {/* Cartes stories style BeReal */}
        <div className="stories-container">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, idx) => (
              <IonCard key={`card-skeleton-${idx}`}>
                <IonSkeletonText animated style={{ width: '100%', height: 200 }} />
                <IonCardHeader>
                  <IonSkeletonText animated style={{ width: '50%' }} />
                </IonCardHeader>
                <IonCardContent>
                  <IonSkeletonText animated style={{ width: '80%' }} />
                </IonCardContent>
              </IonCard>
            ))
          ) : (
            stories.map(story => (
              <IonCard key={story.id} className="story-card">
                <div className="story-card-header">
                  <img
                    src={story.userAvatar}
                    alt={story.username}
                    className="story-card-avatar"
                    loading="lazy"
                  />
                  <div className="story-card-info">
                    <h3 className="story-card-username">{story.username}</h3>
                    <p className="story-card-location">
                      <IonIcon icon={location} /> {typeof story.location === 'string' ? story.location : 'Location'}
                    </p>
                  </div>
                </div>

                <img
                  src={story.mediaUrl}
                  alt={story.caption || 'Photo de story'}
                  className="story-card-media"
                  onClick={() => openStory(story.userId)}
                  loading="lazy"
                  style={{ cursor: 'pointer' }}
                />

                <div className="story-card-actions">
                  <IonButton fill="clear" className="story-card-action" aria-label="J'aime">
                    <IonIcon icon={heart} />
                  </IonButton>
                  <IonButton fill="clear" className="story-card-action" aria-label="Commenter">
                    <IonIcon icon={chatbubble} />
                  </IonButton>
                  <IonButton fill="clear" className="story-card-action" aria-label="Partager">
                    <IonIcon icon={share} />
                  </IonButton>
                </div>

                {story.caption && <p className="story-caption">{story.caption}</p>}
              </IonCard>
            ))
          )}
        </div>

        {/* Story fullscreen */}
        {showFullscreen && (
          <div className="story-fullscreen" role="dialog" aria-modal="true">
            <IonButton
              fill="clear"
              onClick={closeStory}
              className="story-close-button"
              aria-label="Fermer la story"
            >
              ✕
            </IonButton>
            <img
              src={stories[currentStoryIndex]?.mediaUrl}
              alt={stories[currentStoryIndex]?.caption || 'Story en plein écran'}
              className="story-fullscreen-image"
              loading="lazy"
            />
            <div className="story-fullscreen-caption">{stories[currentStoryIndex]?.caption}</div>
            <div className="story-fullscreen-navigation">
              <IonButton
                fill="clear"
                onClick={prevStory}
                disabled={currentStoryIndex === 0}
                aria-label="Story précédente"
              >
                ←
              </IonButton>
              <IonButton
                fill="clear"
                onClick={nextStory}
                aria-label="Story suivante"
              >
                →
              </IonButton>
            </div>
          </div>
        )}

        <IonFab vertical="bottom" horizontal="end" slot="fixed">
          <IonFabButton onClick={createStory} aria-label="Créer une nouvelle story">
            <IonIcon icon={add} />
          </IonFabButton>
        </IonFab>
      </IonContent>
    </IonPage>
  );
};

export default Stories;
