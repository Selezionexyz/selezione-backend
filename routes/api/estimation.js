const express = require('express');
const router = express.Router();
const { OpenAI } = require('openai');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

router.post('/', async (req, res) => {
  const { query, etat, marque } = req.body;

  if (!query) return res.status(400).json({ error: 'Requête manquante.' });

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: `Tu es un expert du marché du luxe et de la revente en 2025. À partir d'une description de produit (chaussures, vêtements, accessoires...), tu donnes :
1. Le prix boutique estimé (2025)
2. Le prix de revente estimé (fourchette)
3. Le prix d’achat recommandé pour un revendeur (en fonction de l’état : neuf ou très bon état)`
        },
        {
          role: 'user',
          content: `Produit : ${query}
Marque : ${marque}
État : ${etat === 'neuf' ? 'Neuf avec boîte' : 'Très bon état'}
Format de réponse : JSON avec name, prixBoutique, revente, achat`
        }
      ],
      temperature: 0.7
    });

    const raw = completion.choices[0].message.content;
    const estimation = JSON.parse(raw);
    res.json(estimation);
  } catch (error) {
    console.error('Erreur OpenAI estimation :', error);
    res.status(500).json({ error: 'Erreur lors de la génération IA.' });
  }
});

module.exports = router;
