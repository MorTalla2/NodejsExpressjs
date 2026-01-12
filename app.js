// ========================================
// PROJET : GESTION DES TÂCHES AVEC EXPRESS
// ========================================

const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// ========================================
// CONFIGURATION DU SERVEUR
// ========================================

// Middleware pour parser le JSON
app.use(express.json());

// Middleware pour parser les formulaires HTML
app.use(express.urlencoded({ extended: true }));

// Servir les fichiers statiques (HTML, CSS)
app.use(express.static('public'));

// ========================================
// BASE DE DONNÉES (Tableau de tâches)
// ========================================

let taches = [
  {
    id: 1,
    nom: "Apprendre Express",
    description: "Suivre un tutoriel sur Express.js",
    statut: "en cours"
  },
  {
    id: 2,
    nom: "Faire les courses",
    description: "Acheter du pain et du lait",
    statut: "terminé"
  }
];

let prochainId = 3;

// ========================================
// ROUTES DE L'API
// ========================================

// ----- ROUTE : PAGE D'ACCUEIL -----
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ----- ROUTE : LISTER TOUTES LES TÂCHES -----
app.get('/taches', (req, res) => {
  res.status(200).json({
    message: "Liste des tâches",
    nombre: taches.length,
    taches: taches
  });
});

// ----- ROUTE : AJOUTER UNE NOUVELLE TÂCHE -----
app.post('/taches', (req, res) => {
  try {
    console.log("📥 Données reçues :", req.body);
    
    const { nom, description, statut } = req.body;
    
    // VALIDATION
    if (!nom) {
      return res.status(400).json({
        erreur: "Le nom de la tâche est obligatoire"
      });
    }
    
    // Création de la nouvelle tâche
    const nouvelleTache = {
      id: prochainId++,
      nom: nom,
      description: description || "Aucune description",
      statut: statut || "en cours"
    };
    
    taches.push(nouvelleTache);
    
    // Redirection vers la page d'accueil après ajout
    res.redirect('/');
    
  } catch (error) {
    console.error("❌ Erreur :", error);
    res.status(500).json({
      erreur: "Erreur serveur",
      details: error.message
    });
  }
});

// ----- ROUTE : MODIFIER UNE TÂCHE -----
app.post('/taches/:id/modifier', (req, res) => {
  const id = parseInt(req.params.id);
  const { nom, description, statut } = req.body;
  
  const tache = taches.find(t => t.id === id);
  
  if (!tache) {
    return res.status(404).json({
      erreur: "Tâche non trouvée"
    });
  }
  
  // VALIDATION du statut
  if (statut && statut !== "en cours" && statut !== "terminé") {
    return res.status(400).json({
      erreur: "Le statut doit être 'en cours' ou 'terminé'"
    });
  }
  
  // Mise à jour
  if (nom) tache.nom = nom;
  if (description) tache.description = description;
  if (statut) tache.statut = statut;
  
  // Redirection après modification
  res.redirect('/');
});

// ----- ROUTE : SUPPRIMER UNE TÂCHE -----
app.post('/taches/:id/supprimer', (req, res) => {
  const id = parseInt(req.params.id);
  const index = taches.findIndex(t => t.id === id);
  
  if (index === -1) {
    return res.status(404).json({
      erreur: "Tâche non trouvée"
    });
  }
  
  taches.splice(index, 1);
  
  // Redirection après suppression
  res.redirect('/');
});

// ========================================
// DÉMARRAGE DU SERVEUR
// ========================================

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 Ouvrez votre navigateur sur http://localhost:${PORT}`);


  // Ouvrir automatiquement le navigateur
  const url = `http://localhost:${PORT}`;
  const start = process.platform === 'darwin' ? 'open' : 
                process.platform === 'win32' ? 'start' : 'xdg-open';
  require('child_process').exec(`${start} ${url}`);
});

// ========================================
// INSTRUCTIONS
// ========================================

/*
STRUCTURE DU PROJET :

projet/
├── server.js (ce fichier)
└── public/
    └── index.html (interface utilisateur)

INSTALLATION :
1. npm init -y
2. npm install express
3. Créez le dossier "public"
4. Placez index.html dans le dossier "public"
5. node server.js
*/