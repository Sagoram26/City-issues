# City Issues - Suivi Collaboratif des Problèmes de la Ville

Une application web moderne pour signaler, suivre et voter sur les problèmes urbains de votre ville. Construite avec **React**, **Node.js**, **PostgreSQL** et **Chakra UI**.

## Fonctionnalités

- **Signalement d'issues** : Créez des signalements avec photos, localisation et catégorie
- **Temps réel (WebSocket)** : Mises à jour instantanées avec Socket.IO
- **Notifications UI** : Toasts, badges et animations pour les nouveaux signalements
- **Système de votes** : Votez pour les problèmes les plus importants
- **Filtrage avancé** : Par statut, catégorie et recherche texte
- **Carte interactive** : Visualisez les signalements sur une carte Leaflet
- **Rôles utilisateurs** : Citoyen, modérateur, administrateur
- **Responsive design** : Optimisé pour desktop et mobile

## Prérequis

- **Node.js** ≥ 16.x
- **npm** ou **yarn**
- **PostgreSQL** ≥ 12
- **Git**

## Installation rapide

```bash
# 1. Cloner le projet
git clone https://github.com/Sagoram26/City-issues.git
cd city-issue-tracker

# 2. Créer la base de données
createdb city_issues_db

# 3. Configurer le serveur
cd server
cp .env.example .env
# Éditer .env avec vos paramètres (voir section Variables d'environnement)
npm install

# 4. Lancer le serveur (Terminal 1)
npm run dev

# 5. Configurer le client (Terminal 2)
cd ../client
npm install
npm start
```

L'application ouvrira automatiquement sur `http://localhost:3000`

## Dépendances

### Frontend (React 18)

| Package | Version | Rôle |
|---------|---------|------|
| `@chakra-ui/react` | ^2.x | Composants UI modernes |
| `@chakra-ui/icons` | ^2.x | Icônes Chakra |
| `@emotion/react` | ^11.x | Système de styles (dépendance Chakra) |
| `framer-motion` | ^10.x | Animations fluides |
| `react-router-dom` | ^6.x | Routage SPA |
| `leaflet` | ^1.9.x | Cartographie |
| `react-leaflet` | ^4.x | Intégration Leaflet pour React |
| `socket.io-client` | ^4.x | Temps réel WebSocket |
| `axios` | ^1.x | Requêtes HTTP |

### Backend (Express + PostgreSQL)

| Package | Version | Rôle |
|---------|---------|------|
| `express` | ^4.x | Framework web |
| `sequelize` | ^6.x | ORM pour PostgreSQL |
| `pg` | ^8.x | Driver PostgreSQL |
| `jsonwebtoken` | ^9.x | Authentification JWT |
| `bcryptjs` | ^2.x | Hachage des mots de passe |
| `socket.io` | ^4.x | Temps réel côté serveur |
| `multer` | ^1.x | Upload de fichiers |
| `cors` | ^2.x | CORS middleware |
| `dotenv` | ^16.x | Variables d'environnement |

## Configuration - Variables d'environnement

### Serveur (`.env`)

```env
# Base de données
DATABASE_URL=postgresql://postgres:password@localhost:5432/city_issues_db

# Authentification
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRE=24h

# Serveur
NODE_ENV=development
PORT=5000

# CORS
CORS_ORIGIN=http://localhost:3000

# Uploads
UPLOAD_DIR=./uploads
MAX_FILE_SIZE=5242880
```

### Client (`.env` optionnel)

```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Comptes de test

### Créer les comptes de test

Pour peupler la base de données avec des comptes et signalements de test:

```bash
cd server
node scripts/seed-data.js
```

### Identifiants

| Email | Mot de passe | Rôle | ID |
|-------|--------------|------|-----|
| admin@ville.fr | admin123 | Administrateur | 1 |
| citoyen1@test.fr | test123 | Citoyen | 2 |
| citoyen2@test.fr | test123 | Citoyen | 3 |

> **Note:** Les IDs sont attribués par PostgreSQL (auto-increment). Après le seed, les IDs typiques sont 1 (admin), 2 et 3 (citoyens), mais peuvent varier si la table existe déjà.

## Temps Réel - Socket.IO

L'application utilise **Socket.IO** pour les mises à jour instantanées entre tous les clients.

### Événements WebSocket

#### Reçus (client écoute):

```javascript
// Nouveau signalement créé
socket.on('issue:new', (newIssue) => { ... })

// Vote reçu
socket.on('issue:vote', ({ issueId, voteCount }) => { ... })

// Statut mis à jour
socket.on('issue:status', ({ issueId, status }) => { ... })

// Signalement supprimé
socket.on('issue:delete', ({ issueId }) => { ... })
```

#### Envoyés (client émet):

```javascript
// Voter pour un signalement
socket.emit('issue:vote', { issueId })

// Mettre à jour le statut (admin)
socket.emit('issue:status', { issueId, status: 'resolved' })
```

## Notifications UI

### Toast Notifications (Chakra UI)

Affichent des messages temporaires en bas à droite:

```
Nouveau signalement!
"Nid de poule rue de la Paix" vient d'être signalé

Vote reçu!
Un nouveau vote a été ajouté

Statut mis à jour
Le signalement est maintenant "Résolu"

Signalement supprimé
Le signalement a été supprimé
```

### Badges & Animations

**Badge "NEW"** sur les cartes nouvelles:
- Affiche "Nouveau" en vert
- Border clignotante
- Animation de pulsation (`pulse-border`)
- S'efface après 3 secondes

**Compteur de notifications** dans la navbar:
- Affiche le nombre de nouveaux signalements
- Animation `notification-spin` au chargement
- Badge rouge clignotant

### Animations CSS disponibles

| Animation | Utilisation | Durée |
|-----------|-------------|-------|
| `pulse-border` | Pulsation de bordure pour cartes NEW | 2s |
| `badge-bounce` | Rebond de la badge NEW | 0.8s |
| `blink-notification` | Clignotement du compteur | 1s |
| `notification-spin` | Introduction du badge | 0.6s |
| `slide-in` | Entrée de nouvelles cartes | 0.3s |
| `highlight` | Surlignage de mises à jour | 1s |
| `toast-slide-in` | Animation des toasts | 0.3s |

## Structure du projet

```
city-issue-tracker/
│
├── client/                              # Application React
│   ├── public/
│   │   └── index.html                   # Avec style Inter font
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.js               # Barre de navigation (responsive)
│   │   │   ├── IssueCard.js            # Carte de signalement (avec animations)
│   │   │   ├── IssueMap.js             # Carte Leaflet interactive
│   │   │   └── ProtectedRoute.js       # Route protégée par auth
│   │   │
│   │   ├── pages/
│   │   │   ├── HomePage.js             # Accueil avec filtres et socket.io
│   │   │   ├── LoginPage.js            # Connexion JWT
│   │   │   ├── RegisterPage.js         # Inscription avec force pw
│   │   │   ├── ReportIssuePage.js      # Formulaire de signalement
│   │   │   ├── IssueDetailPage.js      # Détail + votes + comments
│   │   │   ├── DashboardPage.js        # Mes signalements
│   │   │   ├── AdminPage.js            # Gestion (users, statuts)
│   │   │   └── ProfilePage.js          # Profil utilisateur
│   │   │
│   │   ├── contexts/
│   │   │   ├── AuthContext.js          # Auth (login, register, logout)
│   │   │   └── SocketContext.js        # Socket.IO context
│   │   │
│   │   ├── services/
│   │   │   ├── api.js                  # Configuration axios
│   │   │   └── issueService.js         # Appels API pour issues
│   │   │
│   │   ├── theme.js                    # Thème personnalisé Chakra UI
│   │   ├── App.js                      # Routes principales
│   │   ├── index.js                    # Point d'entrée + provider Chakra
│   │   └── index.css                   # Animations globales (NOUVEAU!)
│   │
│   └── package.json
│
├── server/                              # API Express + Socket.IO
│   ├── config/
│   │   ├── database.js                 # Configuration Sequelize
│   │   └── env.js                      # Validation variables env
│   │
│   ├── models/
│   │   ├── User.js                     # Modèle utilisateur
│   │   ├── Issue.js                    # Modèle signalement
│   │   └── Vote.js                     # Modèle vote
│   │
│   ├── controllers/
│   │   ├── authController.js           # Login, register, JWT
│   │   ├── issueController.js          # CRUD issues
│   │   ├── voteController.js           # Votes
│   │   └── userController.js           # Gestion utilisateurs
│   │
│   ├── routes/
│   │   ├── auth.js                     # Routes authentification
│   │   ├── issues.js                   # Routes signalements
│   │   ├── users.js                    # Routes utilisateurs
│   │   └── votes.js                    # Routes votes
│   │
│   ├── middleware/
│   │   ├── auth.js                     # Vérification JWT
│   │   ├── error.js                    # Gestion d'erreurs
│   │   └── validation.js               # Validation données
│   │
│   ├── uploads/                         # Dossier des photos
│   │
│   ├── .env.example                    # Modèle variables env
│   ├── server.js                       # Point d'entrée
│   ├── package.json
│   └── README.md                       # Doc serveur
│
└── README.md                            # Cette documentation

```

## Scripts disponibles

### Frontend (`client/`)

```bash
npm start           # Démarrer en développement (port 3000)
npm run build       # Build de production
npm test            # Lancer les tests
npm run eject       # Éjecter config (irreversible)
```

### Backend (`server/`)

```bash
npm run dev         # Démarrage avec nodemon (live reload)
npm start           # Démarrage production
npm run migrate     # Migrations Sequelize
```

## API Endpoints

### Auth
- `POST /api/auth/register` - Inscription
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion

### Issues
- `GET /api/issues` - Lister (+ filtres)
- `POST /api/issues` - Créer (auth required)
- `GET /api/issues/:id` - Détail
- `PATCH /api/issues/:id` - Mettre à jour (auth)
- `DELETE /api/issues/:id` - Supprimer (auth)

### Votes
- `POST /api/votes` - Voter (auth required)
- `GET /api/issues/:id/votes` - Votes d'un issue

### Users (Admin)
- `GET /api/users` - Lister
- `PATCH /api/users/:id/role` - Changer rôle

## Dépannage

### `Error: connect ECONNREFUSED localhost:5432`
PostgreSQL n'est pas lancé.
```bash
# Démarrer PostgreSQL
brew services start postgresql  # macOS
sudo service postgresql start   # Linux
pg_ctl start                    # Manuel
```

### `Error: Port 3000 already in use`
Un autre processus utilise le port.
```bash
# Tuer le processus
lsof -i :3000
kill -9 <PID>
```

### `Module not found`
Les dépendances ne sont pas installées.
```bash
rm -rf node_modules package-lock.json
npm install
```

### `CORS Error`
Vérifier que `CORS_ORIGIN` dans `.env` serveur correspond à l'URL client.

## Déploiement

### Vercel (Frontend)
```bash
npm install -g vercel
vercel
```

### Heroku (Backend)
```bash
heroku login
git push heroku main
```

### Docker
```bash
docker-compose up -d
```

## Licence

MIT

## Auteur

Créé par **Sagora** pour le projet universitaire "Suivi Collaboratif des Problèmes de la Ville" (Université, 2024-2026).

## Liens utiles

- **Repository** : https://github.com/Sagoram26/City-issues
- **Issues** : https://github.com/Sagoram26/City-issues/issues
- **Chakra UI Docs** : https://chakra-ui.com
- **Socket.IO Docs** : https://socket.io/docs
- **Sequelize Docs** : https://sequelize.org

---

**Dernière mise à jour** : Mars 2026  
**Version** : 1.0.0
