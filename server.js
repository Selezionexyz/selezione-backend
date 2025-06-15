const express = require('express');
const axios = require('axios');
const cors = require('cors');
const xlsx = require('xlsx');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// --------------------- MODULE 1 : ASSISTANT LUXE IA ---------------------
app.post('/assistant-luxe', async (req, res) => {
  const { message, mode } = req.body;
  let systemPrompt;

  switch (mode) {
    case 'marque':
      systemPrompt = "Tu es un expert des marques de luxe. Analyse l'histoire, l'image, les produits phares et la stratégie de cette marque.";
      break;
    case 'style':
      systemPrompt = "Tu es un conseiller de style luxe, spécialisé en prêt-à-porter. Donne des conseils selon la saison, budget, morphologie et événement.";
      break;
    default:
      systemPrompt = "Tu es un assistant IA général expert dans le luxe, prêt-à-porter, tendances et marques.";
  }

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur Assistant Luxe" });
  }
});

// --------------------- MODULE 2 : ACTUALITÉS + IMAGE IA ---------------------
app.get('/actus-luxe', async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=luxe%20mode&language=fr&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`);
    const actualites = response.data.articles.map(article => ({
      title: article.title,
      url: article.url,
      image: article.urlToImage,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));
    res.json({ actualites });
  } catch (error) {
    res.status(500).json({ error: "Erreur récupération actualités." });
  }
});

app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: 'dall-e-3',
      prompt,
      n: 1,
      size: "1024x1024"
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    res.json({ imageUrl: response.data.data[0].url });
  } catch (error) {
    res.status(500).json({ error: "Erreur image IA" });
  }
});

// --------------------- MODULE 3 : ASSISTANT STYLE + FICHE PRODUIT ---------------------
app.post('/assistant-style', async (req, res) => {
  const { message } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant de style luxe, spécialisé en revente de prêt-à-porter sur Vinted, Vestiaire Collective et e-commerce." },
        { role: "user", content: message }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur assistant style." });
  }
});

app.post('/fiche-produit', async (req, res) => {
  const { produit } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en création de fiches produit SEO-friendly pour des vêtements ou accessoires de luxe." },
        { role: "user", content: `Crée une fiche produit pour : ${produit}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ fiche: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur fiche produit." });
  }
});

// --------------------- MODULE 5 : EXPLORATEUR LUXE / STARTUPS INNOVATION ---------------------
app.post('/explorateur-luxe', async (req, res) => {
  const { secteur } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un moteur d'exploration d'idées business et d'innovations dans le luxe." },
        { role: "user", content: `Inspire-moi des concepts dans : ${secteur}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ idee: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur explorateur luxe." });
  }
});

// --------------------- MODULE 6 : DETECTEUR OPPORTUNITÉS E-COMMERCE LUXE ---------------------
app.post('/opportunites-luxe', async (req, res) => {
  const { niche } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un détecteur d'opportunités e-commerce dans le luxe." },
        { role: "user", content: `Analyse les tendances et propose des idées pour : ${niche}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ opportunite: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur opportunités luxe." });
  }
});

// --------------------- MODULE 7 : CREATEUR DE LOOKBOOK IA ---------------------
app.post('/lookbook', async (req, res) => {
  const { theme } = req.body;

  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un créateur de lookbook numérique haut de gamme pour marques de luxe." },
        { role: "user", content: `Crée un lookbook pour le thème : ${theme}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ lookbook: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur création lookbook." });
  }
});

// --------------------- MODULE 8 : TABLEAU DE BORD ANALYTIQUE ---------------------
app.get('/dashboard-data', async (req, res) => {
  try {
    const stats = {
      utilisateurs: 1492,
      requetesIA: 26481,
      fichiersAnalyser: 237,
      marquesPopulaires: ['Gucci', 'Balenciaga', 'Dior', 'Jacquemus']
    };
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: "Erreur dashboard." });
  }
});

// --------------------- MODULE 9 : SCRAPER DE PRIX LUXE (statique) ---------------------
app.get('/scraper-vinted', async (req, res) => {
  try {
    const donnees = [
      { marque: "Balenciaga", article: "Hoodie noir", prix: "380€", site: "Vinted" },
      { marque: "Off-White", article: "Sneakers", prix: "520€", site: "Vestiaire Collective" },
      { marque: "Gucci", article: "Ceinture GG", prix: "210€", site: "Vinted" }
    ];

    res.json({ produits: donnees });
  } catch (error) {
    res.status(500).json({ error: "Erreur scraper." });
  }
});

// --------------------- LANCEMENT DU SERVEUR ---------------------
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur SELEZIONE lancé sur le port ${PORT}`);
});
