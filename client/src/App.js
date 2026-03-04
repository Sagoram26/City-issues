// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: App.js
// Composant racine de l'application. Définit la structure générale
// (Navbar + Routes) et configure le routage vers les différentes pages.
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Box } from '@chakra-ui/react';

// --- Composants ---
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// --- Pages ---
import HomePage from './pages/HomePage';           // Carte + liste des signalements
import LoginPage from './pages/LoginPage';         // Connexion
import RegisterPage from './pages/RegisterPage';   // Inscription
import ReportIssuePage from './pages/ReportIssuePage'; // Créer un signalement
import IssueDetailPage from './pages/IssueDetailPage'; // Détail d'un signalement
import DashboardPage from './pages/DashboardPage'; // Mes signalements
import AdminPage from './pages/AdminPage';         // Dashboard admin
import ProfilePage from './pages/ProfilePage';     // Mon profil

function App() {
  return (
    <Box minH="100vh" bg="gray.50">
      {/* Barre de navigation (toujours visible) */}
      <Navbar />
      
      {/* Contenu principal */}
      <Box as="main" minH="calc(100vh - 64px)">
        <Routes>
          {/* --- Routes publiques (accessibles sans connexion) --- */}
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/issues/:id" element={<IssueDetailPage />} />
          
          {/* --- Routes protégées (nécessitent une connexion) --- */}
          <Route 
            path="/report" 
            element={
              <ProtectedRoute>
                <ReportIssuePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            } 
          />
          
          {/* --- Route admin uniquement --- */}
          <Route 
            path="/admin" 
            element={
              <ProtectedRoute requiredRole="admin">
                <AdminPage />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;
