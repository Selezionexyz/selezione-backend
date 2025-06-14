const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// Middleware pour vérifier la clé API
const openaiHeaders = {
  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
  'Content-Type': 'application/json',
};

// 1. Infos Marque IA
app.post('/infos-marque', async (req, res) => {
  const { marque } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "Tu es un expert en histoire et actualité des marques de luxe.",
          },
          {
            role: 'user',
            content: `Donne-moi une fiche complète sur la marque : ${marque}`,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ reponse: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Infos Marque IA' });
  }
});

// 2. Stratégie Marque IA
app.post('/strategie-marque', async (req, res) => {
  const { objectif } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "Tu es un consultant stratégie pour marques de mode et luxe.",
          },
          {
            role: 'user',
            content: `Élabore une stratégie de marque pour : ${objectif}`,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ strategie: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Stratégie Marque IA' });
  }
});

// 3. Fiche Produit IA
app.post('/fiche-produit', async (req, res) => {
  const { nomProduit } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "Tu es un expert en rédaction de fiches produits pour le luxe.",
          },
          {
            role: 'user',
            content: `Rédige une fiche produit complète pour : ${nomProduit}`,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ fiche: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Fiche Produit IA' });
  }
});

// 4. Actualité du Luxe (avec GPT-4 turbo, pas API news pour l’instant)
app.post('/actualites-luxe', async (req, res) => {
  const { sujet } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "Tu es un journaliste IA expert dans les tendances et actualités du luxe.",
          },
          {
            role: 'user',
            content: `Fais-moi un résumé d'actualité sur : ${sujet}`,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ actualites: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Actus Luxe IA' });
  }
});

// 5. Chat IA Selezione
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "Tu es un assistant mode et luxe. Donne des réponses complètes, utiles et à jour.",
          },
          {
            role: 'user',
            content: message,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ reponse: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Chat IA' });
  }
});

// 6. Générateur d'image
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      },
      { headers: openaiHeaders }
    );
    res.json({ image: response.data.data[0].url });
  } catch (error) {
    res.status(500).json({ error: 'Erreur génération image' });
  }
});

// 7. Guide Prêt-à-Porter Luxe
app.post('/guide-luxe', async (req, res) => {
  const { theme } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "Tu es un expert dans le prêt-à-porter de luxe, outlet et seconde main.",
          },
          {
            role: 'user',
            content: `Explique moi en détail : ${theme}`,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ guide: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Guide Luxe' });
  }
});

// 8. Startups & Incubateurs Marques
app.post('/startups-marques', async (req, res) => {
  const { secteur } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: "Tu es un analyste IA des marques émergentes et startups.",
          },
          {
            role: 'user',
            content: `Fais une liste et analyse de startups dans : ${secteur}`,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ startups: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Startups Marques' });
  }
});

// 9. Générateur de Contenu (posts, articles, prompts visuels, etc.)
app.post('/generateur-contenu', async (req, res) => {
  const { type, sujet } = req.body;
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [
          {
            role: 'system',
            content: `Tu es un créateur de contenu IA spécialisé en luxe.`,
          },
          {
            role: 'user',
            content: `Crée un ${type} sur : ${sujet}`,
          },
        ],
      },
      { headers: openaiHeaders }
    );
    res.json({ contenu: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Générateur de contenu IA' });
  }
});

// Test de disponibilité
app.get('/', (req, res) => {
  res.send('✅ API Selezione opérationnelle avec GPT-4 Turbo');
});

// Lancer le serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`🚀 Serveur actif sur le port ${PORT}`));
