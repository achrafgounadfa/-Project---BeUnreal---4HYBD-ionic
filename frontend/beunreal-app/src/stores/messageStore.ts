import { create } from 'zustand';
import { User } from './authStore';

// Types
export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  mediaUrl?: string;
  isGroupMessage: boolean;
  createdAt: string;
}

export interface Group {
  id: string;
  name: string;
  members: string[];
  createdBy: string;
  createdAt: string;
}

export interface MessageState {
  messages: Message[];
  currentChat: {
    id: string;
    isGroup: boolean;
  } | null;
  isLoading: boolean;
  error: string | null;
  
  setCurrentChat: (id: string, isGroup: boolean) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}

// Store
const useMessageStore = create<MessageState>((set) => ({
  messages: [],
  currentChat: null,
  isLoading: false,
  error: null,
  
  setCurrentChat: (id, isGroup) => set({ 
    currentChat: { id, isGroup },
    messages: [] 
  }),
  
  setMessages: (messages) => set({ messages }),
  
  addMessage: (message) => set((state) => ({ 
    messages: [...state.messages, message] 
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
  
  setError: (error) => set({ error })
}));

export default useMessageStore;
