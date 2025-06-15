const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const NEWS_API_KEY = process.env.NEWS_API_KEY;

// MODULE 1 : Assistant Luxe IA (chat, marque, style)
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
      systemPrompt = "Tu es un assistant expert en prêt-à-porter luxe, stratégie mode et analyse tendance.";
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
    console.error("Erreur assistant luxe:", error.message);
    res.status(500).json({ error: "Erreur dans l'assistant luxe." });
  }
});

// MODULE 2 : Actualités Luxe + Générateur de contenu
app.get('/actus-luxe', async (req, res) => {
  const { marque, mois } = req.query;

  try {
    let query = 'luxe mode';
    if (marque) {
      query += ` ${marque}`;
    }

    const from = mois ? `${mois}-01` : '';
    const to = mois ? `${mois}-28` : '';

    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&language=fr&sortBy=publishedAt&apiKey=${NEWS_API_KEY}`;
    const fullUrl = mois ? `${url}&from=${from}&to=${to}` : url;

    const response = await axios.get(fullUrl);
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

// MODULE 3 : Fiche Produit IA + Assistant Style IA + Startups IA
app.post('/fiche-produit', async (req, res) => {
  const { nomProduit } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en création de fiches produit luxe optimisées SEO." },
        { role: "user", content: `Crée une fiche produit professionnelle et optimisée pour : ${nomProduit}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ fiche: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur fiche produit:", error.message);
    res.status(500).json({ error: "Erreur génération fiche produit." });
  }
});

app.post('/style-reco', async (req, res) => {
  const { preferences } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un styliste expert pour la mode de luxe." },
        { role: "user", content: `Fais-moi une recommandation de style avec ces préférences : ${preferences}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ style: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur style:", error.message);
    res.status(500).json({ error: "Erreur dans la recommandation de style." });
  }
});

app.post('/startups-marques', async (req, res) => {
  const { domaine } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en incubateurs et startups dans la mode et le luxe." },
        { role: "user", content: `Donne-moi des idées de startups et jeunes marques dans : ${domaine}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ startups: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur startups marques:", error.message);
    res.status(500).json({ error: "Erreur dans la génération des idées startups." });
  }
});

// Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Serveur Selezione lancé sur le port ${PORT}`));