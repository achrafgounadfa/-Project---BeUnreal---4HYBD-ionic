import React from 'react';
import { render, screen } from '@testing-library/react';
import App from '../App';
import useAuthStore from '../stores/authStore';

// Mock des hooks et des composants
jest.mock('../stores/authStore');
jest.mock('@ionic/react-router', () => ({
  IonReactRouter: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
jest.mock('@ionic/react', () => ({
  IonApp: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-app">{children}</div>,
  IonRouterOutlet: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-router-outlet">{children}</div>,
  IonTabs: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-tabs">{children}</div>,
  IonTabBar: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-tab-bar">{children}</div>,
  IonTabButton: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-tab-button">{children}</div>,
  IonIcon: () => <div data-testid="ion-icon"></div>,
  IonLabel: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-label">{children}</div>,
  IonFab: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-fab">{children}</div>,
  IonFabButton: ({ children }: { children: React.ReactNode }) => <div data-testid="ion-fab-button">{children}</div>,
  setupIonicReact: jest.fn(),
}));
jest.mock('react-router-dom', () => ({
  Redirect: () => <div data-testid="redirect"></div>,
  Route: ({ component: Component, ...rest }: any) => (
    <div data-testid="route">
      {Component && <Component />}
    </div>
  ),
}));

describe('App Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders login route when user is not authenticated', () => {
    // Mock du hook d'authentification pour simuler un utilisateur non connecté
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: false,
    });

    render(<App />);
    
    // Vérifie que l'application est rendue
    expect(screen.getByTestId('ion-app')).toBeInTheDocument();
    
    // Vérifie que le routeur est rendu
    expect(screen.getByTestId('ion-router-outlet')).toBeInTheDocument();
    
    // Vérifie que les onglets ne sont pas rendus
    expect(screen.queryByTestId('ion-tabs')).not.toBeInTheDocument();
  });

  test('renders tabs when user is authenticated', () => {
    // Mock du hook d'authentification pour simuler un utilisateur connecté
    (useAuthStore as jest.Mock).mockReturnValue({
      isAuthenticated: true,
    });

    render(<App />);
    
    // Vérifie que l'application est rendue
    expect(screen.getByTestId('ion-app')).toBeInTheDocument();
    
    // Vérifie que les onglets sont rendus
    expect(screen.getByTestId('ion-tabs')).toBeInTheDocument();
    expect(screen.getByTestId('ion-tab-bar')).toBeInTheDocument();
    
    // Vérifie que les boutons d'onglet sont rendus
    const tabButtons = screen.getAllByTestId('ion-tab-button');
    expect(tabButtons.length).toBeGreaterThan(0);
    
    // Vérifie que le bouton de caméra flottant est rendu
    expect(screen.getByTestId('ion-fab')).toBeInTheDocument();
    expect(screen.getByTestId('ion-fab-button')).toBeInTheDocument();
  });
});
