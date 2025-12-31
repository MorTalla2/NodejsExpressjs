// ========================================
// PROJET : GESTION DES TÂCHES AVEC EXPRESS
// ========================================

// 1. IMPORTATION DES MODULES NÉCESSAIRES
// Express est le framework pour créer le serveur web
const express = require('express');

// Création de l'application Express
const app = express();

// Définition du port sur lequel le serveur va écouter
const PORT = 3000;

// ========================================
// 2. CONFIGURATION DU SERVEUR
// ========================================

// Middleware pour parser le JSON dans les requêtes
// Cela permet de lire les données envoyées au format JSON
app.use(express.json());

// ========================================
// 3. BASE DE DONNÉES (Tableau de tâches)
// ========================================

// Notre "base de données" est un simple tableau en mémoire
// Chaque tâche a : id, nom, description, statut
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

// Variable pour générer des IDs uniques automatiquement
let prochainId = 3;

// ========================================
// 4. ROUTES DE L'API
// ========================================

// ----- ROUTE 1 : PAGE D'ACCUEIL -----
// GET / - Affiche un message de bienvenue
app.get('/', (req, res) => {
  res.json({
    message: "Bienvenue sur l'API de Gestion des Tâches !",
    routes: {
      "GET /taches": "Lister toutes les tâches",
      "POST /taches": "Ajouter une nouvelle tâche",
      "PUT /taches/:id": "Modifier une tâche existante",
      "DELETE /taches/:id": "Supprimer une tâche"
    }
  });
});

// ----- ROUTE 2 : LISTER TOUTES LES TÂCHES -----
// GET /taches - Retourne la liste complète des tâches
app.get('/taches', (req, res) => {
  // On retourne le tableau de tâches avec un code 200 (succès)
  res.status(200).json({
    message: "Liste des tâches",
    nombre: taches.length,
    taches: taches
  });
});

// ----- ROUTE 3 : AJOUTER UNE NOUVELLE TÂCHE -----
// POST /taches - Crée une nouvelle tâche
// Exemple de données à envoyer : {"nom": "Ma tâche", "description": "Description"}
app.post('/taches', (req, res) => {
  try {
    // On affiche ce qui est reçu dans la console pour déboguer
    console.log("📥 Données reçues :", req.body);
    
    // On récupère les données envoyées dans le corps de la requête
    const { nom, description } = req.body;
    
    // VALIDATION : On vérifie que le nom est fourni
    if (!nom) {
      return res.status(400).json({
        erreur: "Le nom de la tâche est obligatoire"
      });
    }
    
    // Création de la nouvelle tâche
    const nouvelleTache = {
      id: prochainId++,  // On attribue un ID unique et on l'incrémente
      nom: nom,
      description: description || "Aucune description",  // Valeur par défaut
      statut: "en cours"  // Par défaut, une nouvelle tâche est "en cours"
    };
    
    // On ajoute la tâche au tableau
    taches.push(nouvelleTache);
    
    // On retourne la tâche créée avec le code 201 (créé)
    res.status(201).json({
      message: "Tâche créée avec succès",
      tache: nouvelleTache
    });
  } catch (error) {
    // En cas d'erreur, on l'affiche et on retourne une erreur 500
    console.error("❌ Erreur :", error);
    res.status(500).json({
      erreur: "Erreur serveur",
      details: error.message
    });
  }
});

// ----- ROUTE 4 : MODIFIER UNE TÂCHE EXISTANTE -----
// PUT /taches/:id - Modifie une tâche selon son ID
// :id est un paramètre dynamique dans l'URL
app.put('/taches/:id', (req, res) => {
  // On récupère l'ID depuis l'URL et on le convertit en nombre
  const id = parseInt(req.params.id);
  
  // On récupère les nouvelles données du corps de la requête
  const { nom, description, statut } = req.body;
  
  // On cherche la tâche dans le tableau
  const tache = taches.find(t => t.id === id);
  
  // Si la tâche n'existe pas, on retourne une erreur 404
  if (!tache) {
    return res.status(404).json({
      erreur: "Tâche non trouvée"
    });
  }
  
  // VALIDATION : Le statut doit être "en cours" ou "terminé"
  if (statut && statut !== "en cours" && statut !== "terminé") {
    return res.status(400).json({
      erreur: "Le statut doit être 'en cours' ou 'terminé'"
    });
  }
  
  // On met à jour les champs fournis (si ils existent)
  if (nom) tache.nom = nom;
  if (description) tache.description = description;
  if (statut) tache.statut = statut;
  
  // On retourne la tâche modifiée
  res.status(200).json({
    message: "Tâche modifiée avec succès",
    tache: tache
  });
});

// ----- ROUTE 5 : SUPPRIMER UNE TÂCHE -----
// DELETE /taches/:id - Supprime une tâche selon son ID
app.delete('/taches/:id', (req, res) => {
  // On récupère l'ID depuis l'URL
  const id = parseInt(req.params.id);
  
  // On cherche l'index de la tâche dans le tableau
  const index = taches.findIndex(t => t.id === id);
  
  // Si la tâche n'existe pas, on retourne une erreur 404
  if (index === -1) {
    return res.status(404).json({
      erreur: "Tâche non trouvée"
    });
  }
  
  // On supprime la tâche du tableau avec splice
  const tacheSupprimee = taches.splice(index, 1)[0];
  
  // On retourne un message de confirmation
  res.status(200).json({
    message: "Tâche supprimée avec succès",
    tache: tacheSupprimee
  });
});

// ========================================
// 5. DÉMARRAGE DU SERVEUR
// ========================================

app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
  console.log(`📝 Testez l'API avec un outil comme Postman ou Thunder Client`);
});

// ========================================
// 6. INSTRUCTIONS POUR TESTER L'API
// ========================================

/*
COMMENT UTILISER CETTE API :

1. Installation :
   - Créez un dossier pour votre projet
   - Exécutez : npm init -y
   - Installez Express : npm install express
   - Copiez ce code dans un fichier nommé "app.js"

2. Démarrage :
   - Exécutez : node app.js
   - Le serveur démarre sur http://localhost:3000

3. Tester les routes (avec Postman, Thunder Client ou curl) :

   A) LISTER LES TÂCHES :
      GET http://localhost:3000/taches
   
   B) AJOUTER UNE TÂCHE :
      POST http://localhost:3000/taches
      Body (JSON) : 
      {
        "nom": "Réviser Node.js",
        "description": "Revoir les concepts de base"
      }
   
   C) MODIFIER UNE TÂCHE :
      PUT http://localhost:3000/taches/1
      Body (JSON) :
      {
        "statut": "terminé"
      }
   
   D) SUPPRIMER UNE TÂCHE :
      DELETE http://localhost:3000/taches/1

4. Codes de réponse HTTP :
   - 200 : Succès
   - 201 : Créé
   - 400 : Mauvaise requête (données invalides)
   - 404 : Non trouvé
*/