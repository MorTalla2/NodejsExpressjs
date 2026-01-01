// ==========================================
// ÉTAPE 1 : IMPORTER LES MODULES NÉCESSAIRES
// ==========================================
const express = require('express')      // Framework web pour créer le serveur
const bodyparser = require('body-parser') // Pour lire les données du formulaire
const QRCode = require('qrcode')        // Pour générer des QR codes
const fs = require('fs')                // Pour manipuler les fichiers
const path = require('path')            // Pour gérer les chemins de fichiers

// ==========================================
// ÉTAPE 2 : CRÉER L'APPLICATION EXPRESS
// ==========================================
const app = express()

// ==========================================
// ÉTAPE 3 : CRÉER LE DOSSIER "image"
// ==========================================
// Vérifier si le dossier "image" existe
if (!fs.existsSync('image')) {
    // Si non, le créer
    fs.mkdirSync('image')
    console.log('Dossier "image" créé')
}

// ==========================================
// ÉTAPE 4 : CONFIGURER BODY-PARSER
// ==========================================
// Ce middleware permet de lire les données envoyées par le formulaire
app.use(bodyparser.urlencoded({ extended: false }))

// Servir les images du dossier "image" comme fichiers statiques
app.use('/image', express.static(path.join(__dirname, 'image')))

// ==========================================
// ÉTAPE 5 : ROUTE GET "/" - AFFICHER LE FORMULAIRE
// ==========================================
// Quand l'utilisateur visite http://localhost:3500
app.get('/', (req, res) => {
    // Envoyer le fichier test.html
    res.sendFile(path.join(__dirname, 'test.html'))
})

// ==========================================
// ÉTAPE 6 : ROUTE POST "/generer" - GÉNÉRER LE QR CODE
// ==========================================
app.post('/generer', async (req, res) => {
    // 6.1 - Récupérer les données depuis le formulaire
    const nomSite = req.body.nom_site
    let urlSaisi = req.body.url
    
    // Ajouter https:// si l'URL ne commence pas par http:// ou https://
    if (!urlSaisi.startsWith('http://') && !urlSaisi.startsWith('https://')) {
        urlSaisi = 'https://' + urlSaisi
    }
    
    console.log('Nom du site:', nomSite)
    console.log('URL finale:', urlSaisi)
    
    // 6.2 - Créer un nom unique pour l'image
    // Exemple: qr_MonSite.png
    const nomImage = `qr_${nomSite}.png`
    console.log('Nom de l\'image:', nomImage)
    
    // 6.3 - Créer le chemin complet vers l'image
    const cheminComplet = path.join(__dirname, 'image', nomImage)
    console.log('Chemin complet:', cheminComplet)
    
    // 6.4 - Générer le QR code et l'enregistrer
    try {
        // CORRECTION: Utiliser urlSaisi pour générer le QR code
        await QRCode.toFile(cheminComplet, urlSaisi)
        console.log('QR code généré avec succès!')
        
        // 6.5 - Vérifier si le nom du site existe déjà dans BD.txt
        let contenuBD = ''
        if (fs.existsSync('BD.txt')) {
            contenuBD = fs.readFileSync('BD.txt', 'utf8')
        }
        
        // 6.6 - Supprimer l'ancienne ligne avec le même nom de site si elle existe
        const lignes = contenuBD.split('\n').filter(ligne => {
            // Garder seulement les lignes qui ne commencent pas par ce nom de site
            return ligne.trim() !== '' && !ligne.startsWith(nomSite + ' /')
        })
        
        // 6.7 - Préparer la nouvelle ligne pour le fichier BD.txt
        // Format: nomDuSite / URL / nomDeLimage
        const nouvelleLigne = `${nomSite} / ${urlSaisi} / ${nomImage}`
        
        // 6.8 - Ajouter la nouvelle ligne
        lignes.push(nouvelleLigne)
        
        // 6.9 - Réécrire le fichier BD.txt avec les lignes mises à jour
        fs.writeFileSync('BD.txt', lignes.join('\n') + '\n')
        console.log('BD.txt mis à jour!')
        
        // 6.7 - Envoyer une page HTML avec le QR code affiché
         res.send(`
            <!DOCTYPE html>
            <html lang="fr">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>QR Code Généré</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        max-width: 600px;
                        margin: 50px auto;
                        padding: 20px;
                        text-align: center;
                    }
                    .qr-container {
                        border: 2px solid #ddd;
                        padding: 20px;
                        border-radius: 10px;
                        margin: 20px 0;
                    }
                    img {
                        max-width: 300px;
                        margin: 20px 0;
                    }
                    .info {
                        background: #f0f0f0;
                        padding: 15px;
                        border-radius: 5px;
                        margin: 20px 0;
                    }
                    button {
                        background: #007bff;
                        color: white;
                        border: none;
                        padding: 10px 20px;
                        border-radius: 5px;
                        cursor: pointer;
                        font-size: 16px;
                        margin: 10px;
                    }
                    button:hover {
                        background: #0056b3;
                    }
                    a {
                        text-decoration: none;
                    }
                </style>
            </head>
            <body>
                <h1>✅ QR Code généré avec succès !</h1>
                <div class="qr-container">
                    <img src="/image/${encodeURIComponent(nomImage)}" alt="QR Code">
                </div>
                <div class="info">
                    <p><strong>Nom du site:</strong> ${nomSite}</p>
                    <p><strong>URL:</strong> ${urlSaisi}</p>
                </div>
                <button onclick="window.location.href='/'">Générer un nouveau QR Code</button>
                <a href="/image/${encodeURIComponent(nomImage)}" download="${nomImage}">
                    <button>Télécharger l'image</button>
                </a>
            </body>
            </html>
        `)
    } catch (error) {
        console.error('Erreur:', error)
        res.send('Erreur lors de la génération du QR code')
    }
})

// ==========================================
// ÉTAPE 7 : DÉMARRER LE SERVEUR
// ==========================================
app.listen(3500, () => {
    console.log('=====================================')
    console.log('Serveur démarré sur le port 3500')
    console.log('Ouvrez: http://localhost:3500')
    console.log('=====================================')
})