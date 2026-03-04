# Personne 3 – Temps réel & Intégrations externes

Ce fichier t’explique **tout ce que tu dois maîtriser** pour ta partie : WebSocket, notifications temps réel, emails, upload images, dashboard admin, tests et préparation de la démo.

---

## 1. Vue d’ensemble de ton rôle

Tu es responsable de toute la **couche temps réel et des integrations externes**.

- **WebSocket** : diffuser en direct les nouveaux signalements, votes, commentaires, changements de statut.
- **Notifications UI** : les utilisateurs voient les changements sans rafraîchir la page.
- **Email à la résolution** : quand un signalement est marqué comme résolu, envoi d’un email.
- **Upload d’images** : réception côté backend, stockage (local ou cloud), exposition via URL.
- **Dashboard admin** : interface pour trier les signalements, changer les statuts, voir l’effet temps réel.
- **Tests / cohérence** : vérifier que tout fonctionne de bout en bout (backend + frontend + temps réel).

Pendant la présentation, tu dois être capable de :

- Ouvrir **2 navigateurs** et montrer les updates en temps réel.
- Expliquer comment tu as implémenté le temps réel.
- Expliquer l’**intégration email** (ou autre service externe).
- Ajouter **un nouvel event WebSocket en live** (ou modifier un existant).

---

## 2. WebSocket & Temps réel

### 2.1. Concepts de base

- **HTTP** : requête/réponse ponctuelle (le client doit rafraîchir ou refetch pour voir les changements).
- **WebSocket** : connexion persistante entre client et serveur, bi-directionnelle.
- Souvent on utilise une librairie haut niveau comme **Socket.IO** côté serveur (Node) + client (React).

Vocabulaire Socket.IO (si utilisé) :

- `io` : serveur WebSocket.
- `socket` : connexion d’un client.
- `socket.emit(event, data)` : envoi d’un message au client courant.
- `io.emit(event, data)` : broadcast à **tous** les clients.
- `io.to(room).emit(event, data)` : broadcast seulement à une **room** (ex : pour un signalement spécifique).

### 2.2. Événements temps réel à connaître

Pour l’app “Suivi collaboratif des problèmes de la ville”, les events importants sont :

- `issue:new` : quand un nouvel incident est créé.
- `issue:update` (ou `issue:statusChanged`) : quand le statut change (ex : en cours → résolu).
- `vote:new` : quand un utilisateur vote pour un signalement.
- `comment:new` : quand un commentaire est ajouté.

Tu dois savoir :

- **Où** dans le backend tu émets ces events (ex : dans les controllers après la sauvegarde en DB).
- **Où** dans le frontend tu les écoutes (ex : dans un `SocketContext` React ou directement dans une page).

### 2.3. Schéma type backend

1. Dans le serveur Node (souvent dans `server/server.js`), tu :
   - Crées le serveur HTTP + attaches Socket.IO.
   - Ecoutes `connection` pour logguer les nouveaux clients.
2. Dans les **controllers** (ex : `issue.controller.js`) :
   - Après `Issue.create(...)`, tu fais `io.emit('issue:new', createdIssue)`.
   - Après mise à jour du statut, tu fais `io.emit('issue:update', updatedIssue)`.

Idée clé : après **chaque action importante** en base de données, tu peux déclencher un event WebSocket.

### 2.4. Schéma type frontend

1. Créer un **contexte Socket** (par ex. `client/src/contexts/SocketContext.js`) :
   - Initialise la connexion vers le serveur WebSocket.
   - Fournit `socket` via un `Context.Provider` à toute l’app.
2. Dans tes pages / composants :
   - Tu fais `socket.on('issue:new', callback)` pour mettre à jour la liste.
   - Tu gères le `cleanup` avec `socket.off(...)` quand le composant se démonte.

Pendant la démo :

- Navigateur A : ouvre la liste des signalements.
- Navigateur B : crée un nouveau signalement.
- Tu montres que Navigateur A voit **instantanément** le nouveau signalement sans refresh.

---

## 3. Notifications temps réel côté UI

Le temps réel ne sert à rien si l’utilisateur ne **voit pas** que quelque chose s’est passé.

Quelques patterns utiles :

- **Toasts / alertes** : par ex. "Un nouveau signalement a été créé près de chez vous".
- **Badges / compteurs** : nombre de signalements non lus ou récemment mis à jour.
- **Animation légère** (bordure qui clignote, surlignage) sur les nouvelles cartes de signalement.

En pratique :

- Quand tu reçois `issue:new` dans le frontend, tu :
  - Ajoutes le nouvel objet dans le state (issues).
  - Affiches une notification (`setNotification({ type: 'info', message: 'Nouveau signalement créé' })`).

---

## 4. Email à la résolution (Intégration externe)

### 4.1. Choix technique

Le plus simple dans un projet Node :

- **Nodemailer** avec une vraie SMTP (Gmail, Outlook, fournisseur d’email, etc.).
- Ou un service dédié (SendGrid, Mailgun, etc.) avec leur SDK ou via SMTP.

Ce que tu dois savoir expliquer :

- Comment tu as configuré **le transporteur email** (host, port, auth).
- Où tu utilises ce transporteur dans ton code (ex : un service `emailService.js`).
- À quel moment tu envoies l’email (trigger : issue résolue).

### 4.2. Flow typique

1. L’admin passe un signalement au statut `resolved` (via l’API backend).
2. Dans le controller de mise à jour de signalement, après la mise à jour en DB :
   - Tu récupères l’email de l’auteur.
   - Tu appelles une fonction `sendIssueResolvedEmail(userEmail, issue)`.
3. `sendIssueResolvedEmail` construit un **sujet** et un **corps d’email** clairs.
4. Option bonus : envoyer aussi un **event WebSocket** `issue:resolved` à tous les clients connectés.

### 4.3. Points à présenter

- Tu montres le code de configuration (sans exposer les secrets, qui doivent être dans des **variables d’environnement**).
- Tu montres la fonction appelée depuis le controller.
- Tu démystifies l’API d’envoi d’emails : c’est juste une **fonction Node** appelée au bon moment.

---

## 5. Upload & gestion des images

### 5.1. Pipeline général

1. Le frontend envoie un formulaire avec une image (`<input type="file" />`).
2. Côté backend, tu utilises un **middleware d’upload** (ex : Multer) pour :
   - Limiter la taille,
   - Valider le type MIME (jpeg, png),
   - Sauvegarder l’image (disque local ou cloud).
3. Tu stockes seulement le **chemin / URL de l’image** dans la base de données.
4. Le frontend affiche l’image en utilisant cette URL.

### 5.2. Stockage local vs cloud

- **Local** (simple pour le projet) :
  - Dossier `server/uploads/`.
  - Exposer ce dossier en statique via Express (`app.use('/uploads', express.static('uploads'))`).
  - L’URL devient par ex. `http://localhost:5000/uploads/nom-fichier.jpg`.

- **Cloud** (bonus) :
  - Utiliser un service comme **Cloudinary** ou **AWS S3**.
  - Le middleware envoie le fichier au service et ne garde que l’URL finale dans la DB.

### 5.3. Sécurité minimale

- Limiter la **taille max** des fichiers.
- Vérifier l’**extension & le MIME type**.
- Ne jamais exécuter un fichier uploadé, seulement le servir comme **contenu statique**.
- Nettoyer les fichiers si un signalement est supprimé (bonus).

Pendant la démo, tu peux montrer :

- Upload d’une image sur un signalement.
- Affichage de la miniature sur la carte / liste.

---

## 6. Dashboard Admin

Ton rôle n’est pas de faire **tout** le frontend, mais une partie importante pour l’admin :

- Voir la **liste des signalements** avec plusieurs infos : statut, votes, date, localisation.
- Appliquer des **filtres** (par statut : ouvert, en cours, résolu; par date; par nombre de votes).
- Permettre à l’admin de :
  - Changer le statut (ex : "En cours", "Résolu"),
  - Eventuellement fusionner des doublons (s’il y a une logique de "duplicate").

Lien avec le temps réel :

- Quand un admin change le statut, tu :
  - Mets à jour en base de données.
  - Envoies un event WebSocket `issue:update` ou `issue:statusChanged`.
- Le reste des clients (liste publique, carte, page détail) se mettent à jour automatiquement.

Pendant la démo, tu peux :

- Ouvrir la page admin dans un onglet.
- Ouvrir la page publique dans un autre.
- Changer le statut côté admin et montrer la mise à jour instantanée côté public.

---

## 7. Tests & cohérence globale

Tu n’es pas obligé de couvrir 100% des tests automatisés, mais tu dois garantir la **cohérence globale**.

### 7.1. Scénarios manuels à tester

- Création d’un signalement avec image.
- Apparition du signalement en temps réel sur un autre navigateur.
- Vote sur un signalement → la carte / la liste est mise à jour en live.
- Ajout d’un commentaire.
- Changement de statut par un admin.
- Envoi d’email à la résolution (si configuré) ou au moins log clair dans le serveur.

### 7.2. Cohérence des events

- Vérifie que les noms d’events WebSocket sont :
  - Documentés,
  - Utilisés de façon cohérente (`issue:new`, `issue:update`, etc.),
  - Gérés côté client (listeners définis, state mis à jour, pas de fuite de listeners).

### 7.3. Erreurs & résilience

- Que se passe-t-il si le serveur WebSocket est indisponible ?
- Gérer les erreurs de connexion (message simple pour l’utilisateur : "La connexion temps réel est interrompue").
- Gérer les erreurs d’envoi d’email (log + ne pas casser la requête principale si possible).

---

## 8. Préparation de la présentation (15 minutes)

### 8.1. Setup technique

- Vérifie les commandes pour lancer le projet :
  - Backend : `cd server` puis `npm run dev` (ou la commande définie).
  - Frontend : `cd client` puis `npm start`.
- Assure-toi que :
  - Les ports ne sont pas déjà utilisés.
  - Les variables d’environnement (clé email, URL DB, etc.) sont configurées.

### 8.2. Démo temps réel (ta partie clé)

Plan type pour ton passage :

1. **Montrer deux navigateurs** : A (utilisateur), B (admin ou autre utilisateur).
2. Sur A : affichage des signalements + carte.
3. Sur B :
   - Créer un nouveau signalement.
   - Montrer que A se met à jour instantanément (`issue:new`).
4. Sur B :
   - Changer le statut en "Résolu".
   - Montrer la mise à jour temps réel sur A (`issue:update`).
5. Montrer dans la console serveur / mailbox :
   - L’email envoyé ou au moins le log de la fonction d’envoi.

### 8.3. Live coding simple

Tu dois pouvoir faire **une petite modif en live**, par exemple :

- Ajouter un nouvel event `issue:commentCountUpdated` quand un commentaire est ajouté.
- Ou ajouter un petit toast "Nouveau vote reçu".

Exemple de séquence :

1. Dans le controller de commentaire, juste après la création :
   - Ajouter l’appel à `io.emit('comment:new', comment)`.
2. Dans le frontend :
   - Ajouter `socket.on('comment:new', ...)` pour afficher un message.
3. Recharger la page, refaire le scénario → montrer que ça marche.

Le but : montrer que tu maîtrises la **chaîne de bout en bout** (backend → WebSocket → frontend).

---

## 9. Résumé rapide (checklist)

Avant la soutenance, vérifie que tu sais expliquer et/ou montrer :

- [ ] Ce qu’est un **WebSocket** et comment tu l’utilises.
- [ ] Quels sont les **events** temps réel principaux (`issue:new`, `issue:update`, `vote:new`, `comment:new`).
- [ ] Comment le frontend écoute ces events et met à jour l’UI.
- [ ] Comment tu as intégré un **service externe d’email** (Nodemailer ou autre).
- [ ] Comment fonctionne l’**upload d’images** (middleware, stockage, URL).
- [ ] Comment le **dashboard admin** interagit avec le temps réel.
- [ ] Les principaux **scénarios de test** que tu as validés.
- [ ] Un exemple de **live coding** simple (ajout/modif d’un event ou d’une notification).

Si tu maîtrises ces points, tu seras très à l’aise pour la partie "Personne 3 – Temps réel & Intégrations externes" pendant la présentation.