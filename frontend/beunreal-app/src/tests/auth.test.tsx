import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ionFireEvent } from '@ionic/react-test-utils';
import { MemoryRouter } from 'react-router-dom';
import { IonReactRouter } from '@ionic/react-router';
import { IonApp } from '@ionic/react';
import Login from '../pages/Login';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import * as authService from '../services/api/authService';

// Mock des services d'API
jest.mock('../services/api/authService', () => ({
  login: jest.fn(),
  forgotPassword: jest.fn(),
  resetPassword: jest.fn()
}));

// Mock du hook de routage
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useHistory: () => ({
    push: jest.fn(),
    replace: jest.fn()
  }),
  useParams: () => ({
    token: 'test-token'
  })
}));

describe('Tests d\'authentification', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('Login - affiche un message d\'erreur pour email invalide', async () => {
    render(
      <MemoryRouter>
        <IonApp>
          <Login />
        </IonApp>
      </MemoryRouter>
    );

    // Remplir le formulaire avec un email invalide
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'email-invalide' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Vérifier que le message d'erreur s'affiche
    expect(await screen.findByText(/email invalide/i)).toBeInTheDocument();
    expect(authService.login).not.toHaveBeenCalled();
  });

  test('Login - appelle le service d\'API avec les bonnes données', async () => {
    // Mock d'une réponse réussie
    (authService.login as jest.Mock).mockResolvedValue({
      token: 'test-token',
      user: { id: '1', email: 'test@example.com', username: 'testuser' }
    });

    render(
      <MemoryRouter>
        <IonApp>
          <Login />
        </IonApp>
      </MemoryRouter>
    );

    // Remplir le formulaire avec des données valides
    const emailInput = screen.getByLabelText(/Email/i);
    const passwordInput = screen.getByLabelText(/Mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Se connecter/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.click(submitButton);

    // Vérifier que le service d'API est appelé avec les bonnes données
    await waitFor(() => {
      expect(authService.login).toHaveBeenCalledWith('test@example.com', 'password123');
    });
  });

  test('ForgotPassword - envoie une demande de réinitialisation', async () => {
    // Mock d'une réponse réussie
    (authService.forgotPassword as jest.Mock).mockResolvedValue({
      message: 'Email envoyé avec succès'
    });

    render(
      <MemoryRouter>
        <IonApp>
          <ForgotPassword />
        </IonApp>
      </MemoryRouter>
    );

    // Remplir le formulaire
    const emailInput = screen.getByLabelText(/Email/i);
    const submitButton = screen.getByRole('button', { name: /Envoyer le lien de réinitialisation/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.click(submitButton);

    // Vérifier que le service d'API est appelé
    await waitFor(() => {
      expect(authService.forgotPassword).toHaveBeenCalledWith('test@example.com');
    });

    // Vérifier que le message de succès s'affiche
    expect(await screen.findByText(/Email envoyé/i)).toBeInTheDocument();
  });

  test('ResetPassword - vérifie la correspondance des mots de passe', async () => {
    render(
      <MemoryRouter>
        <IonApp>
          <ResetPassword />
        </IonApp>
      </MemoryRouter>
    );

    // Remplir le formulaire avec des mots de passe qui ne correspondent pas
    const passwordInput = screen.getByLabelText(/Nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/Confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Réinitialiser le mot de passe/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'differentpassword' } });
    fireEvent.click(submitButton);

    // Vérifier que le message d'erreur s'affiche
    expect(await screen.findByText(/Les mots de passe ne correspondent pas/i)).toBeInTheDocument();
    expect(authService.resetPassword).not.toHaveBeenCalled();
  });

  test('ResetPassword - réinitialise le mot de passe avec succès', async () => {
    // Mock d'une réponse réussie
    (authService.resetPassword as jest.Mock).mockResolvedValue({
      message: 'Mot de passe réinitialisé avec succès'
    });

    render(
      <MemoryRouter>
        <IonApp>
          <ResetPassword />
        </IonApp>
      </MemoryRouter>
    );

    // Remplir le formulaire avec des données valides
    const passwordInput = screen.getByLabelText(/Nouveau mot de passe/i);
    const confirmInput = screen.getByLabelText(/Confirmer le mot de passe/i);
    const submitButton = screen.getByRole('button', { name: /Réinitialiser le mot de passe/i });

    fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    fireEvent.click(submitButton);

    // Vérifier que le service d'API est appelé avec les bonnes données
    await waitFor(() => {
      expect(authService.resetPassword).toHaveBeenCalledWith('test-token', 'newpassword123');
    });

    // Vérifier que le message de succès s'affiche
    expect(await screen.findByText(/Mot de passe réinitialisé/i)).toBeInTheDocument();
  });
});
