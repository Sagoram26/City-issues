// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: services/issueService.js
// Service pour toutes les opérations sur les signalements (issues).
// Encapsule les appels API et gère le FormData pour l'upload de photos.
// ═══════════════════════════════════════════════════════════════════════════

import api from './api';

const issueService = {
  // --- Liste tous les signalements avec filtres optionnels ---
  // params: { status, category, search, page, limit, sortBy, order }
  getIssues: async (params = {}) => {
    const response = await api.get('/issues', { params });
    return response.data;
  },

  // --- Récupère un signalement par son ID ---
  getIssueById: async (id) => {
    const response = await api.get(`/issues/${id}`);
    return response.data;
  },

  // --- Crée un nouveau signalement (avec upload de photo) ---
  createIssue: async (issueData) => {
    // Utilise FormData car on envoie un fichier
    const formData = new FormData();
    
    formData.append('title', issueData.title);
    formData.append('description', issueData.description);
    formData.append('latitude', issueData.latitude);
    formData.append('longitude', issueData.longitude);
    
    if (issueData.address) {
      formData.append('address', issueData.address);
    }
    
    if (issueData.category) {
      formData.append('category', issueData.category);
    }
    
    // Ajoute la photo si présente
    if (issueData.photo) {
      formData.append('photo', issueData.photo);
    }

    const response = await api.post('/issues', formData, {
      headers: {
        'Content-Type': 'multipart/form-data' // Important pour l'upload
      }
    });
    
    return response.data;
  },

  // --- Vote pour un signalement ---
  voteIssue: async (id) => {
    const response = await api.post(`/issues/${id}/vote`);
    return response.data;
  },

  // --- Change le statut d'un signalement (admin) ---
  updateIssueStatus: async (id, status) => {
    const response = await api.patch(`/issues/${id}/status`, { status });
    return response.data;
  },

  // --- Supprime un signalement ---
  deleteIssue: async (id) => {
    const response = await api.delete(`/issues/${id}`);
    return response.data;
  }
};

export default issueService;
