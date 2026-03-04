// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: contexts/AuthContext.js
// Contexte React pour gérer l'authentification dans toute l'app.
// Stocke le token JWT, l'utilisateur connecté, et expose les fonctions
// login, register, logout, updateProfile.
// ═══════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

// Création du contexte
const AuthContext = createContext(null);

// --- Hook personnalisé pour utiliser le contexte d'auth ---
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// --- Provider : enveloppe l'app et fournit l'état d'authentification ---
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);                    // Utilisateur connecté
  const [token, setToken] = useState(localStorage.getItem('token')); // Token JWT
  const [loading, setLoading] = useState(true);              // Chargement initial

  // --- Au montage : vérifie si un token existe et charge le profil ---
  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const response = await api.get('/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user profile:', error);
          // Token invalide : on le supprime
          localStorage.removeItem('token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  // --- Connexion : appelle l'API, stocke le token, met à jour l'état ---
  const login = useCallback(async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { token: newToken, user: userData } = response.data;
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(userData);
    
    return userData;
  }, []);

  // --- Inscription : crée un compte et connecte automatiquement ---
  const register = useCallback(async (userData) => {
    const response = await api.post('/auth/register', userData);
    const { token: newToken, user: newUser } = response.data;
    
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setUser(newUser);
    
    return newUser;
  }, []);

  // --- Déconnexion : supprime le token et réinitialise l'état ---
  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  }, []);

  // --- Mise à jour du profil ---
  const updateProfile = useCallback(async (profileData) => {
    const response = await api.patch('/auth/profile', profileData);
    setUser(response.data);
    return response.data;
  }, []);

  // --- Valeurs exposées via le contexte ---
  const value = {
    user,                              // Utilisateur connecté (ou null)
    token,                             // Token JWT (ou null)
    loading,                           // true pendant le chargement initial
    isAuthenticated: !!user,           // true si connecté
    isAdmin: user?.role === 'admin',   // true si admin
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
