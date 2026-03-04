// ═══════════════════════════════════════════════════════════════════════════
// FICHIER: server.js
// Point d'entrée principal du serveur backend. Configure Express, Socket.IO,
// les middlewares, les routes API, et lance la connexion à la base de données.
// ═══════════════════════════════════════════════════════════════════════════

// --- Chargement des variables d'environnement (.env) ---
require('dotenv').config();

// --- Import des dépendances principales ---
const express = require('express');      // Framework web
const cors = require('cors');            // Cross-Origin Resource Sharing
const http = require('http');            // Serveur HTTP natif Node.js
const { Server } = require('socket.io'); // WebSocket temps réel
const path = require('path');            // Gestion des chemins de fichiers

// --- Import des modules internes ---
const { sequelize } = require('./models');           // Connexion Sequelize à la DB
const authRoutes = require('./routes/auth.routes');  // Routes d'authentification
const issueRoutes = require('./routes/issue.routes');// Routes des signalements
const userRoutes = require('./routes/user.routes');  // Routes utilisateurs

// --- Création de l'application Express et du serveur HTTP ---
const app = express();
const server = http.createServer(app);

// --- Configuration de Socket.IO (temps réel) avec CORS ---
// Permet aux clients du frontend de se connecter via WebSocket
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'DELETE']
  }
});

// Rend `io` accessible dans les routes via req.app.get('io')
app.set('io', io);

// --- Middlewares globaux ---
// CORS : autorise les requêtes cross-origin depuis le frontend
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
// Parse le JSON dans le body des requêtes
app.use(express.json());
// Parse les données URL-encoded (formulaires)
app.use(express.urlencoded({ extended: true }));

// --- Fichiers statiques : images uploadées ---
// Les images sont accessibles via /uploads/nom-fichier.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ═══════════════════════════════════════════════════════════════════════════
// ROUTES API
// ═══════════════════════════════════════════════════════════════════════════
app.use('/api/auth', authRoutes);   // /api/auth/login, /api/auth/register, etc.
app.use('/api/issues', issueRoutes);// /api/issues, /api/issues/:id, etc.
app.use('/api/users', userRoutes);  // /api/users/:id, etc.

// Health check : vérifie que le serveur est en ligne
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ═══════════════════════════════════════════════════════════════════════════
// GESTION DES CONNEXIONS WEBSOCKET (TEMPS RÉEL)
// ═══════════════════════════════════════════════════════════════════════════
// Écoute les nouvelles connexions WebSocket
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  // Quand un client se déconnecte
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// MIDDLEWARE DE GESTION DES ERREURS
// ═══════════════════════════════════════════════════════════════════════════
// Attrape toutes les erreurs non gérées et renvoie une réponse JSON propre
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  
  // Erreur de validation (ex: champs manquants)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ message: err.message });
  }
  
  // Token JWT invalide
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ message: 'Invalid token' });
  }

  // Erreur générique (500 Internal Server Error)
  res.status(err.status || 500).json({
    message: err.message || 'Internal server error'
  });
});

// Route non trouvée (404)
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Port du serveur (défaut: 5000)
const PORT = process.env.PORT || 5000;

// ═══════════════════════════════════════════════════════════════════════════
// DÉMARRAGE DU SERVEUR
// ═══════════════════════════════════════════════════════════════════════════
// Connecte à la base de données puis lance le serveur HTTP + WebSocket
const startServer = async () => {
  try {
    // Test de connexion à la base de données
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Synchronise les modèles avec la base (alter: modifie les tables si besoin)
    // ⚠️ En production, utiliser des migrations plutôt que sync
    await sequelize.sync({ alter: true });
    console.log('Database synchronized.');

    // Lancement du serveur sur le port configuré
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`WebSocket server ready for connections`);
    });
  } catch (error) {
    console.error('Unable to connect to the database:', error);
    process.exit(1); // Arrête le process si la DB est inaccessible
  }
};

startServer();

// Export pour les tests ou usage externe
module.exports = { app, io };
