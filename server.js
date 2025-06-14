// server.js

const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// 🔹 MODULE 1 : Assistant Luxe IA (chat, marque, style)
app.post('/assistant-luxe', async (req, res) => {
  const { message, mode } = req.body;

  let systemPrompt = "Tu es un assistant luxe intelligent, expert en marques, style et stratégie luxe.";

  switch (mode) {
    case 'marque':
      systemPrompt = "Tu es un analyste expert des marques de luxe. Donne une présentation détaillée, incluant l'histoire, le style, le positionnement et la réputation.";
      break;
    case 'style':
      systemPrompt = "Tu es un conseiller en style luxe. Tu aides selon les tendances actuelles, l’occasion, le budget et la morphologie.";
      break;
    case 'chat':
    default:
      systemPrompt = "Tu es un assistant IA spécialisé dans le luxe. Réponds à toute question sur les marques, les tendances, les produits, et le business luxe.";
      break;
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ reponse: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur Assistant Luxe:", error.message);
    res.status(500).json({ error: "Erreur Assistant Luxe IA." });
  }
});

// 🔹 MODULE 2 : Actus Luxe + Générateur de contenu
app.get('/actus-luxe', async (req, res) => {
  try {
    const response = await axios.get(
      `https://newsapi.org/v2/everything?q=luxe%20mode&language=fr&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`
    );

    const actualites = response.data.articles.map(article => ({
      title: article.title,
      url: article.url,
      image: article.urlToImage,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));

    res.json({ actualites });
  } catch (error) {
    console.error("Erreur actu luxe:", error.message);
    res.status(500).json({ error: "Erreur récupération actualités." });
  }
});

app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: "dall-e-3",
        prompt,
        n: 1,
        size: "1024x1024"
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ image: response.data.data[0].url });
  } catch (error) {
    console.error("Erreur image:", error.message);
    res.status(500).json({ error: "Erreur génération d'image." });
  }
});

// (Optionnel futur : générateur texte contenu IA)
// app.post('/generate-content', async (req, res) => { ... })

// 🔹 MODULE 3 : Style & Produit IA (fiche produit, stratégie, personal shopper)
app.post('/fiche-produit', async (req, res) => {
  const { nomProduit } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Tu es un expert en rédaction de fiches produit pour le e-commerce de luxe. Rédige un texte vendeur, optimisé SEO." },
          { role: "user", content: `Crée une fiche produit complète pour : ${nomProduit}` }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ fiche: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur fiche produit:", error.message);
    res.status(500).json({ error: "Erreur création fiche produit." });
  }
});

app.post('/strategie-marque', async (req, res) => {
  const { objectif } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Tu es un expert en stratégie business pour les marques de luxe. Propose des plans marketing." },
          { role: "user", content: `Propose une stratégie pour : ${objectif}` }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ strategie: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur stratégie:", error.message);
    res.status(500).json({ error: "Erreur génération stratégie." });
  }
});

app.post('/personal-shopper', async (req, res) => {
  const { preference } = req.body;

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Tu es un personal shopper IA spécialisé dans le luxe. Propose des idées de looks ou de pièces selon les goûts, budget, occasion." },
          { role: "user", content: `Voici les préférences : ${preference}` }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      }
    );

    res.json({ suggestions: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur personal shopper:", error.message);
    res.status(500).json({ error: "Erreur personal shopper IA." });
  }
});

// 🔄 Route de test
app.get('/', (req, res) => {
  res.send('🚀 API SELEZIONE active – IA Luxe prête !');
});

// 🔊 Lancement serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Serveur Selezione lancé sur http://localhost:${PORT}`);
});
