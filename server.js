const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 1. Infos Marque IA (GPT-4 Turbo)
app.post('/infos-marque', async (req, res) => {
  const { marque } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en histoire des marques de luxe." },
        { role: "user", content: `Donne-moi une présentation complète de la marque ${marque}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ info: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur Infos Marque:", error.message);
    res.status(500).json({ error: "Erreur lors de la récupération des infos marque." });
  }
});

// 2. Stratégie Marque IA (GPT-4 Turbo)
app.post('/strategie-marque', async (req, res) => {
  const { objectif } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en stratégie marketing pour le secteur du luxe." },
        { role: "user", content: `Propose-moi une stratégie complète pour : ${objectif}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ strategie: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur stratégie:", error.message);
    res.status(500).json({ error: "Erreur lors de la génération de la stratégie." });
  }
});

// 3. Fiche Produit IA (GPT-4 Turbo)
app.post('/fiche-produit', async (req, res) => {
  const { nomProduit } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en création de fiche produit pour le luxe." },
        { role: "user", content: `Crée une fiche produit complète pour : ${nomProduit}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ fiche: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur fiche produit:", error.message);
    res.status(500).json({ error: "Erreur lors de la création de la fiche produit." });
  }
});

// 4. Actualité du Luxe (API réelle)
app.get('/actualites-luxe', async (req, res) => {
  try {
    const response = await axios.get(`https://newsapi.org/v2/everything?q=luxe%20mode&apiKey=${process.env.NEWS_API_KEY}&language=fr`);
    const titres = response.data.articles.map(article => ({
      title: article.title,
      url: article.url,
      image: article.urlToImage
    }));
    res.json({ actualites: titres });
  } catch (error) {
    console.error("Erreur actu luxe:", error.message);
    res.status(500).json({ error: "Erreur actualités luxe." });
  }
});

// 5. Chat IA Selezione (GPT-4 Turbo)
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un assistant mode de luxe très compétent." },
        { role: "user", content: message }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ reponse: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur chat:", error.message);
    res.status(500).json({ error: "Erreur du chat IA." });
  }
});

// 6. Générateur d’image (DALL·E 3)
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/images/generations', {
      model: "dall-e-3",
      prompt,
      n: 1,
      size: "1024x1024"
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ image: response.data.data[0].url });
  } catch (error) {
    console.error("Erreur image:", error.message);
    res.status(500).json({ error: "Erreur génération image." });
  }
});

// 7. Guide Prêt-à-Porter Luxe (GPT-4 Turbo)
app.post('/guide-luxe', async (req, res) => {
  const { theme } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert du prêt-à-porter de luxe." },
        { role: "user", content: `Donne un guide complet pour : ${theme}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ guide: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur guide luxe:", error.message);
    res.status(500).json({ error: "Erreur lors de la génération du guide." });
  }
});

// 8. Startups Marques (GPT-4 Turbo)
app.post('/startups-marques', async (req, res) => {
  const { domaine } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un expert en incubateurs et startups du luxe." },
        { role: "user", content: `Donne des idées ou marques dans le domaine : ${domaine}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ startups: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur startup:", error.message);
    res.status(500).json({ error: "Erreur lors de la génération des marques." });
  }
});

// 9. Personal Shopper / Sélectionneur IA (GPT-4 Turbo)
app.post('/personal-shopper', async (req, res) => {
  const { preference } = req.body;
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un personal shopper spécialisé dans le luxe et le digital fashion." },
        { role: "user", content: `Trouve des suggestions selon cette préférence : ${preference}` }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ suggestions: response.data.choices[0].message.content });
  } catch (error) {
    console.error("Erreur personal shopper:", error.message);
    res.status(500).json({ error: "Erreur dans le service personal shopper." });
  }
});

// Route de base
app.get('/', (req, res) => {
  res.send('API Selezione active et prête 🖤');
});

// Port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`✅ Serveur Selezione lancé sur le port ${PORT}`));
