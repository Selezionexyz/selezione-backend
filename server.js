const express = require('express');
const axios = require('axios');
require('dotenv').config();

const app = express();
app.use(express.json());

// 1. Infos Marques IA
app.post('/infos-marque', async (req, res) => {
  const { marque } = req.body;
  if (!marque) return res.status(400).json({ error: 'Champ "marque" requis.' });

  try {
    const prompt = `Donne-moi l'histoire, les fondateurs, la vision, les produits iconiques, les collaborations et l'ADN de la marque de luxe ${marque}. Ajoute des anecdotes intéressantes.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ result: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur OpenAI.' });
  }
});

// 2. Stratégie de Marque IA
app.post('/strategie-marque', async (req, res) => {
  const { objectif } = req.body;
  if (!objectif) return res.status(400).json({ error: 'Champ "objectif" requis.' });

  try {
    const prompt = `Élabore une stratégie marketing pour une marque de mode ou de luxe avec l’objectif suivant : ${objectif}. Inclure branding, réseaux sociaux, influence, storytelling, visuels et marché cible.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ strategie: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur OpenAI.' });
  }
});

// 3. Fiche Produit IA
app.post('/fiche-produit', async (req, res) => {
  const { nomProduit } = req.body;
  if (!nomProduit) return res.status(400).json({ error: 'Champ "nomProduit" requis.' });

  try {
    const prompt = `Crée une fiche produit pour un article de luxe nommé "${nomProduit}". Inclure : description détaillée, matière, fabrication, inspiration, style, occasions idéales, mots-clés SEO.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ fiche: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur OpenAI.' });
  }
});

// 4. Actualité du Luxe
app.get('/actualites-luxe', async (req, res) => {
  try {
    const prompt = `Donne-moi un résumé des dernières actualités et tendances du secteur du luxe (mode, maroquinerie, joaillerie, digital, innovation).`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ actualites: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur serveur OpenAI.' });
  }
});

// 5. Chat IA Selezione
app.post('/chat', async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: 'Message requis.' });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: message }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ reponse: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur OpenAI Chat.' });
  }
});

// 6. Générateur d'image IA (DALL·E 3)
app.post('/generate-image', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: 'Prompt manquant.' });

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/images/generations',
      {
        model: 'dall-e-3',
        prompt: prompt,
        n: 1,
        size: '1024x1024',
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ image: response.data.data[0].url });
  } catch (error) {
    console.error('Erreur génération image :', error.message);
    res.status(500).json({ error: 'Erreur lors de la génération d\'image.' });
  }
});

// 7. Guide Prêt-à-Porter Luxe
app.get('/guide-luxe', async (req, res) => {
  try {
    const prompt = `Rédige un guide structuré sur le prêt-à-porter de luxe : collections actuelles, outlet, saisons passées, seconde main, tendances actuelles, conseils d'achat, pièges à éviter.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ guide: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur guide luxe.' });
  }
});

// 8. Marques Incubateurs / Startups
app.get('/startups-marques', async (req, res) => {
  try {
    const prompt = `Donne une liste de marques émergentes dans la mode et le luxe créées par des incubateurs, startups ou créateurs innovants.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ marques: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur incubateurs.' });
  }
});

// 9. Générateur de contenu réseaux sociaux
app.post('/contenu-reseaux', async (req, res) => {
  const { sujet } = req.body;
  if (!sujet) return res.status(400).json({ error: 'Sujet requis.' });

  try {
    const prompt = `Génère un contenu pour les réseaux sociaux (Instagram, TikTok, Pinterest, LinkedIn, Twitter, Facebook) sur le sujet suivant : ${sujet}. Inclure image suggérée, hashtags, ton luxe.`;
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4-turbo',
        messages: [{ role: 'user', content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    res.json({ contenu: response.data.choices[0].message.content });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: 'Erreur contenu social.' });
  }
});

// Test de santé
app.get('/', (req, res) => {
  res.send('✅ API Selezione Luxe active.');
});

// Lancement du serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
});
