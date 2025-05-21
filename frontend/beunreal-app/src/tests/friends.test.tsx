import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ionFireEvent } from '@ionic/react-test-utils';
import { MemoryRouter } from 'react-router-dom';
import { IonApp } from '@ionic/react';
import FriendRequests from '../pages/FriendRequests';
import FindFriends from '../pages/FindFriends';
import * as userService from '../services/api/userService';

// Mock des services d'API
jest.mock('../services/api/userService', () => ({
  getReceivedFriendRequests: jest.fn(),
  getSentFriendRequests: jest.fn(),
  acceptFriendRequest: jest.fn(),
  rejectFriendRequest: jest.fn(),
  searchUsers: jest.fn(),
  sendFriendRequest: jest.fn()
}));

// Mock du store d'authentification
jest.mock('../stores/authStore', () => ({
  __esModule: true,
  default: () => ({
    user: { id: '1', username: 'testuser', email: 'test@example.com' }
  })
}));

describe('Tests de gestion des amis', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('FriendRequests - affiche les demandes reçues', async () => {
    // Mock des données de demandes d'amis
    const mockRequests = [
      { id: '101', username: 'user1', email: 'user1@example.com', profilePicture: '' },
      { id: '102', username: 'user2', email: 'user2@example.com', profilePicture: '' }
    ];
    
    (userService.getReceivedFriendRequests as jest.Mock).mockResolvedValue(mockRequests);
    (userService.getSentFriendRequests as jest.Mock).mockResolvedValue([]);

    render(
      <MemoryRouter>
        <IonApp>
          <FriendRequests />
        </IonApp>
      </MemoryRouter>
    );

    // Vérifier que les demandes sont affichées
    await waitFor(() => {
      expect(userService.getReceivedFriendRequests).toHaveBeenCalled();
    });
    
    expect(await screen.findByText('user1')).toBeInTheDocument();
    expect(await screen.findByText('user2')).toBeInTheDocument();
  });

  test('FriendRequests - accepte une demande d\'ami', async () => {
    // Mock des données de demandes d'amis
    const mockRequests = [
      { id: '101', username: 'user1', email: 'user1@example.com', profilePicture: '' }
    ];
    
    (userService.getReceivedFriendRequests as jest.Mock).mockResolvedValue(mockRequests);
    (userService.getSentFriendRequests as jest.Mock).mockResolvedValue([]);
    (userService.acceptFriendRequest as jest.Mock).mockResolvedValue({ message: 'Demande acceptée' });

    render(
      <MemoryRouter>
        <IonApp>
          <FriendRequests />
        </IonApp>
      </MemoryRouter>
    );

    // Attendre que les demandes soient chargées
    await waitFor(() => {
      expect(screen.getByText('user1')).toBeInTheDocument();
    });

    // Cliquer sur le bouton d'acceptation
    const acceptButton = screen.getByLabelText(/Accepter la demande de user1/i);
    fireEvent.click(acceptButton);

    // Vérifier que le service d'API est appelé
    await waitFor(() => {
      expect(userService.acceptFriendRequest).toHaveBeenCalledWith('101');
    });
  });

  test('FindFriends - recherche des utilisateurs', async () => {
    // Mock des résultats de recherche
    const mockResults = [
      { id: '201', username: 'sophie', email: 'sophie@example.com', profilePicture: '' },
      { id: '202', username: 'thomas', email: 'thomas@example.com', profilePicture: '' }
    ];
    
    (userService.searchUsers as jest.Mock).mockResolvedValue(mockResults);

    render(
      <MemoryRouter>
        <IonApp>
          <FindFriends />
        </IonApp>
      </MemoryRouter>
    );

    // Remplir le champ de recherche et soumettre
    const searchInput = screen.getByPlaceholderText(/Rechercher par email ou nom d'utilisateur/i);
    const searchButton = screen.getByText('Rechercher');

    fireEvent.change(searchInput, { target: { value: 'soph' } });
    fireEvent.click(searchButton);

    // Vérifier que les résultats sont affichés
    await waitFor(() => {
      expect(screen.getByText('sophie')).toBeInTheDocument();
      expect(screen.getByText('thomas')).toBeInTheDocument();
    });
  });

  test('FindFriends - envoie une demande d\'ami', async () => {
    // Mock des résultats de recherche
    const mockResults = [
      { id: '201', username: 'sophie', email: 'sophie@example.com', profilePicture: '' }
    ];
    
    (userService.searchUsers as jest.Mock).mockResolvedValue(mockResults);
    (userService.sendFriendRequest as jest.Mock).mockResolvedValue({ message: 'Demande envoyée' });

    render(
      <MemoryRouter>
        <IonApp>
          <FindFriends />
        </IonApp>
      </MemoryRouter>
    );

    // Remplir le champ de recherche et soumettre
    const searchInput = screen.getByPlaceholderText(/Rechercher par email ou nom d'utilisateur/i);
    const searchButton = screen.getByText('Rechercher');

    fireEvent.change(searchInput, { target: { value: 'sophie' } });
    fireEvent.click(searchButton);

    // Attendre que les résultats soient chargés
    await waitFor(() => {
      expect(screen.getByText('sophie')).toBeInTheDocument();
    });

    // Cliquer sur le bouton d'ajout d'ami
    const addButton = screen.getByLabelText(/Ajouter sophie comme ami/i);
    fireEvent.click(addButton);

    // Vérifier que le service d'API est appelé
    await waitFor(() => {
      expect(userService.sendFriendRequest).toHaveBeenCalledWith('201');
    });
  });
});
