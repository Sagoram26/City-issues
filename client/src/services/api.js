// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: services/api.js
// Configure Axios pour toutes les requêtes API vers le backend.
// Ajoute automatiquement le token JWT à chaque requête.
// Gère les erreurs 401 (token expiré/invalide).
// ═══════════════════════════════════════════════════════════════════════════

import axios from 'axios';

// URL de base de l'API (configurable via variable d'environnement)
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// --- Création de l'instance Axios avec configuration par défaut ---
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// --- INTERCEPTEUR DE REQUÊTE : ajoute le token JWT à chaque requête ---
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// --- INTERCEPTEUR DE RÉPONSE : gère les erreurs globalement ---
api.interceptors.response.use(
  (response) => response, // Succès : retourne la réponse telle quelle
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    
    // --- Gestion de l'erreur 401 (non autorisé) ---
    // Le token est expiré ou invalide : on le supprime et redirige vers login
    if (error.response?.status === 401) {
      if (localStorage.getItem('token')) {
        localStorage.removeItem('token');
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject({ ...error, message });
  }
);

export default api;
