import { create } from 'zustand';

// Types
export interface Story {
  id: string;
  userId: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  type?: 'image' | 'video'; // Pour compatibilité avec le code existant
  location: string | {
    latitude: number;
    longitude: number;
  };
  latitude?: number; // Pour compatibilité avec le code existant
  longitude?: number; // Pour compatibilité avec le code existant
  createdAt: string;
  expiresAt?: string;
  // Propriétés ajoutées pour résoudre les erreurs TypeScript
  username?: string;
  userAvatar?: string;
  caption?: string;
  // Conserver la structure imbriquée pour compatibilité avec le backend
  user?: {
    username: string;
    profilePicture: string;
  };
}

export interface StoryState {
  stories: Story[];
  userLocation: {
    latitude: number;
    longitude: number;
  } | null;
  isLoading: boolean;
  error: string | null;
  
  setStories: (stories: Story[]) => void;
  addStory: (story: Story) => void;
  setUserLocation: (latitude: number, longitude: number) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Store
const useStoryStore = create<StoryState>((set) => ({
  stories: [],
  userLocation: null,
  isLoading: false,
  error: null,
  
  setStories: (stories) => set({ stories }),
  
  addStory: (story) => set((state) => ({ 
    stories: [story, ...state.stories] 
  })),
  
  setUserLocation: (latitude, longitude) => set({ 
    userLocation: { latitude, longitude } 
  }),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error })
}));

export default useStoryStore;
