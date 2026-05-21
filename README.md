# Meet & Move 🏃‍♂️

Une application mobile moderne pour créer et rejoindre des événements sportifs, inspirée du design de BeReal.

## 🚀 Fonctionnalités

- **Authentification** : Inscription et connexion sécurisées
- **Création d'événements** : Créer des sorties sportives avec photos
- **Rejoindre des événements** : Participer aux événements d'autres utilisateurs
- **Profil utilisateur** : Gérer son profil et voir ses statistiques
- **Design moderne** : Interface inspirée de BeReal avec gradients et animations

## 🛠️ Technologies utilisées

### Backend
- **Node.js** avec Express
- **MongoDB** avec Mongoose
- **JWT** pour l'authentification
- **bcryptjs** pour le hachage des mots de passe

### Frontend
- **React Native** avec Expo
- **React Navigation** pour la navigation
- **Expo Linear Gradient** pour les effets visuels
- **Expo Image Picker** pour la sélection d'images
- **Axios** pour les appels API

## 📱 Installation

### Prérequis
- Node.js (v16 ou supérieur)
- npm ou yarn
- Expo CLI
- MongoDB (local ou Atlas)

### Backend

1. **Installer les dépendances**
```bash
cd backend
npm install
```

2. **Configurer les variables d'environnement**
```bash
# Créer un fichier .env dans le dossier backend
PORT=3000
MONGODB_URI=mongodb://localhost:27017/meet-and-move
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

3. **Démarrer le serveur**
```bash
npm run dev
```

### Frontend

1. **Installer les dépendances**
```bash
cd frontend
npm install
```

2. **Démarrer l'application**
```bash
npm start
```

3. **Tester sur iPhone**
- Installer l'app Expo Go sur ton iPhone
- Scanner le QR code affiché dans le terminal
- L'app se lancera automatiquement

## 🗄️ Structure de la base de données

### Collection Users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  password: String (hashé),
  profilePicture: String (URL),
  eventsCreated: [ObjectId],
  eventsJoined: [ObjectId]
}
```

### Collection Events
```javascript
{
  _id: ObjectId,
  title: String,
  description: String,
  location: String,
  date: Date,
  sport: String,
  creator: ObjectId (ref: User),
  participants: [ObjectId] (ref: User),
  image: String (URL)
}
```

## 🔧 API Endpoints

### Authentification
- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/login` - Se connecter
- `GET /api/auth/me` - Récupérer le profil (protégé)

### Événements
- `GET /api/events` - Liste des événements
- `GET /api/events/:id` - Détails d'un événement
- `POST /api/events` - Créer un événement (protégé)
- `POST /api/events/:id/join` - Rejoindre un événement (protégé)
- `POST /api/events/:id/leave` - Quitter un événement (protégé)

## 🎨 Design

L'application utilise un design moderne inspiré de BeReal :
- **Palette de couleurs** : Noir, blanc, bleu accent (#007AFF)
- **Gradients** : Effets visuels avec LinearGradient
- **Typographie** : Police moderne et lisible
- **Animations** : Transitions fluides entre les écrans

## 📱 Écrans principaux

1. **Login/Signup** : Authentification avec design moderne
2. **Événements** : Liste des événements avec cartes stylisées
3. **Créer un événement** : Formulaire complet avec sélection d'image
4. **Profil** : Informations utilisateur et statistiques

## 🚀 Déploiement

### Backend
- Déployer sur Heroku, Vercel ou Railway
- Configurer MongoDB Atlas
- Mettre à jour les variables d'environnement

### Frontend
- Build avec Expo EAS
- Publier sur App Store et Google Play
- Configurer les notifications push

## 🤝 Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## 👨‍💻 Auteur

Créé avec ❤️ pour la communauté sportive

---

**Note** : Cette application est conçue pour être testée sur iPhone avec Expo Go. Assure-toi d'avoir installé l'application Expo Go sur ton iPhone pour tester l'application.
