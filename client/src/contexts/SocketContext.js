// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: contexts/SocketContext.js
// Contexte React pour gérer la connexion WebSocket (Socket.IO).
// Permet aux composants d'écouter les events temps réel
// (issue:new, issue:vote, issue:status, issue:delete).
// ═══════════════════════════════════════════════════════════════════════════

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client'; // Client Socket.IO

// Création du contexte
const SocketContext = createContext(null);

// --- Hook personnalisé pour utiliser le contexte Socket ---
export const useSocket = () => {
  return useContext(SocketContext);
};

// --- Provider : gère la connexion WebSocket ---
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);       // Instance Socket.IO
  const [isConnected, setIsConnected] = useState(false); // État de connexion

  useEffect(() => {
    // --- Connexion au serveur WebSocket ---
    // Retire "/api" de l'URL car le WebSocket est sur la racine
    const socketUrl = (process.env.REACT_APP_API_URL || 'http://localhost:5000/api').replace('/api', '');
    const socketInstance = io(socketUrl, {
      autoConnect: true,         // Se connecte automatiquement
      reconnection: true,        // Reconnexion automatique si déconnecté
      reconnectionAttempts: 5,   // Nombre de tentatives
      reconnectionDelay: 1000    // Délai entre les tentatives (1s)
    });

    // --- Listener : connexion réussie ---
    socketInstance.on('connect', () => {
      console.log('Socket connected:', socketInstance.id);
      setIsConnected(true);
    });

    // --- Listener : déconnexion ---
    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // --- Listener : erreur de connexion ---
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    setSocket(socketInstance);

    // --- Cleanup : déconnexion au démontage du composant ---
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  // --- Valeurs exposées via le contexte ---
  const value = {
    socket,       // Instance pour écouter/émettre des events
    isConnected   // true si connecté au serveur
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
