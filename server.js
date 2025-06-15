// --------------------- IMPORTS ---------------------
const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

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

// --------------------- MODULE 2 : ACTUALITÉ IA + IMAGE ---------------------
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
    case 'marque':
      prompt = `Rédige une actualité captivante sur la marque de luxe suivante : ${sujet}`;
      break;
    case 'createur':
      prompt = `Écris un article de fond sur le créateur ou designer : ${sujet}, son influence dans la mode de luxe.`;
      break;
    case 'evenement':
      prompt = `Fais une couverture journalistique d'un événement de mode ou luxe : ${sujet}`;
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
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    let imageUrl = null;

    try {
      const image = await axios.post("https://api.openai.com/v1/images/generations", {
        model: "dall-e-3",
        prompt: sujet || "actualité du luxe prêt-à-porter",
        n: 1,
        size: "1024x1024"
      }, {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });

      imageUrl = image.data.data[0].url;
    } catch (imgErr) {
      console.warn("⚠️ Erreur génération image :", imgErr.message);
    }

    res.json({
      type,
      contenu: completion.data.choices[0].message.content,
      imageUrl: imageUrl
    });

  } catch (error) {
    console.error("❌ Erreur actu IA :", error.message);
    res.status(500).json({ error: "Erreur génération contenu IA." });
  }
});

// --------------------- MODULE 3 : STYLE & FICHE PRODUIT ---------------------
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

// --------------------- MODULE 4 : ESTIMATION & COMPARATEUR ---------------------
app.post('/estimation-luxe', async (req, res) => {
  const { description } = req.body;

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un expert en estimation de prix pour les vêtements et accessoires de luxe (Vinted, Vestiaire Collective, etc)."
        },
        {
          role: "user",
          content: `Donne une estimation de prix réaliste pour : ${description}`
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ estimation: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur estimation :", error.message);
    res.status(500).json({ error: "Erreur lors de l'estimation." });
  }
});

app.post('/comparateur-luxe', async (req, res) => {
  const { produit } = req.body;

  try {
    const response = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "Tu es un comparateur de plateformes e-commerce luxe. Tu analyses les différences entre Vinted, Vestiaire Collective, etc."
        },
        {
          role: "user",
          content: `Compare les plateformes de revente pour : ${produit}`
        }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ comparaison: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur comparateur :", error.message);
    res.status(500).json({ error: "Erreur lors de la comparaison." });
  }
});

// --------------------- ROOT + SERVER ---------------------
app.get('/', (req, res) => {
  res.send("Bienvenue sur l'API SELEZIONE ✨");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur SELEZIONE lancé sur le port ${PORT}`);
});
