
const express = require('express');
const axios = require('axios');
require('dotenv').config();
const app = express();
app.use(express.json());

// 1. Infos Marque IA
app.post('/infos-marque', async (req, res) => {
  const { marque } = req.body;
  res.json({ info: `Voici les informations pour la marque ${marque} (exemple IA).` });
});

// 2. Stratégie Marque IA
app.post('/strategie-marque', async (req, res) => {
  const { objectif } = req.body;
  res.json({ strategie: `Stratégie personnalisée pour l’objectif : ${objectif}` });
});

// 3. Fiche Produit IA
app.post('/fiche-produit', async (req, res) => {
  const { nomProduit } = req.body;
  res.json({ fiche: `Fiche produit générée pour : ${nomProduit}` });
});

// 4. Actualité du Luxe
app.get('/actualites-luxe', async (req, res) => {
  res.json({ actualites: ["Actu 1", "Actu 2", "Actu 3"] });
});

// 5. Chat IA Selezione
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  res.json({ reponse: `Réponse IA à : ${message}` });
});

// 6. Générateur d'image
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  res.json({ image: `https://fakeimage.com/${prompt.replace(" ", "_")}.png` });
});

// 7. Guide Prêt-à-Porter Luxe
app.get('/guide-luxe', async (req, res) => {
  res.json({ guide: ["Nouvelle Collection", "Outlet", "Seconde Main"] });
});

// 8. Incubateur / Startup Marques
app.get('/startups-marques', async (req, res) => {
  res.json({ startups: ["Marque A", "Marque B", "Marque C"] });
});

app.get('/', (req, res) => {
  res.send('API Selezione OK');
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
