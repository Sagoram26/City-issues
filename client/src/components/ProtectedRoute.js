// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: components/ProtectedRoute.js
// Composant de protection des routes. Vérifie que l'utilisateur
// est connecté (et optionnellement a le bon rôle) avant d'afficher
// le contenu. Sinon redirige vers /login ou affiche "Accès refusé".
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, user, loading } = useAuth();
  const location = useLocation();

  // --- Pendant le chargement de l'auth, affiche un spinner ---
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  // --- Si non connecté, redirige vers /login ---
  // Sauvegarde l'URL actuelle pour y revenir après connexion
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // --- Si un rôle spécifique est requis, vérifie que l'utilisateur l'a ---
  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="container">
        <div className="alert alert-error">
          <strong>Accès refusé</strong>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  // --- Tout est ok, affiche le contenu protégé ---
  return children;
};

export default ProtectedRoute;
