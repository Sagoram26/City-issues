// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: index.js
// Point d'entrée de l'application React. Configure les providers
// (Chakra UI, Router, Auth, Socket) et monte l'app dans le DOM.
// ═══════════════════════════════════════════════════════════════════════════

import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Routing SPA
import { ChakraProvider } from '@chakra-ui/react'; // UI Framework
import App from './App';
import { AuthProvider } from './contexts/AuthContext';    // Contexte d'authentification
import { SocketProvider } from './contexts/SocketContext'; // Contexte WebSocket temps réel
import theme from './theme';  // Thème Chakra personnalisé
import './index.css';

// --- Monte l'application dans l'élément #root du HTML ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    {/* ChakraProvider : fournit le thème et les composants UI */}
    <ChakraProvider theme={theme}>
      {/* BrowserRouter : gère la navigation SPA */}
      <BrowserRouter>
        {/* AuthProvider : gère l'authentification JWT */}
        <AuthProvider>
          {/* SocketProvider : gère la connexion WebSocket */}
          <SocketProvider>
            <App />
          </SocketProvider>
        </AuthProvider>
      </BrowserRouter>
    </ChakraProvider>
  </React.StrictMode>
);
