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
// --------------------- MODULE 2 – ACTUALITÉ IA PERSONNALISÉE + IMAGE ---------------------
app.post('/actus-luxe-ia', async (req, res) => {
  const { sujet, type } = req.body;

  let prompt;

  switch (type) {
    case 'anecdote':
      prompt = `Raconte une anecdote authentique, rare ou étonnante sur le luxe ou la haute couture liée à ce sujet : ${sujet || 'au monde du luxe'}`;
      break;
    case 'tendance':
      prompt = `Analyse les tendances actuelles dans la mode ou le prêt-à-porter de luxe concernant : ${sujet || 'le secteur global du luxe'}`;
      break;
    default:
      prompt = sujet && sujet.length > 3
        ? `Fais une actualité détaillée, élégante et à jour dans le domaine du luxe ou prêt-à-porter sur ce sujet : ${sujet}.`
        : "Rédige une actualité du jour dans l’univers du luxe ou prêt-à-porter (créateurs, ventes, tendances, etc).";
  }

  try {
    const completion = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un journaliste expert en luxe et prêt-à-porter. Tu rédiges des contenus captivants." },
        { role: "user", content: prompt }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    const imagePrompt = sujet || "actualité du luxe prêt-à-porter";
    const image = await axios.post("https://api.openai.com/v1/images/generations", {
      model: "dall-e-3",
      prompt: imagePrompt,
      n: 1,
      size: "1024x1024"
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({
      type,
      contenu: completion.data.choices[0].message.content,
      imageUrl: image.data.data[0].url
    });

  } catch (error) {
    console.error("Erreur actu IA :", error.message);
    res.status(500).json({ error: "Erreur génération contenu IA." });
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
