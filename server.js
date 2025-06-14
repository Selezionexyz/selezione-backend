
const express = require("express");
const axios = require("axios");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 1. Infos Marque IA
app.post("/brand-info", async (req, res) => {
  const { brand } = req.body;
  if (!brand) return res.status(400).json({ error: "Marque manquante." });
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: `Donne-moi toutes les infos sur la marque de luxe suivante : ${brand}` }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 2. Stratégie Marques IA
app.post("/brand-strategy", async (req, res) => {
  const { brand } = req.body;
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: `Propose une stratégie de marque pour ${brand} dans la mode de luxe.` }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 3. Fiche Produit IA
app.post("/generate-product", async (req, res) => {
  const { keywords } = req.body;
  if (!keywords) return res.status(400).json({ error: "Mots-clés manquants." });
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: `Génère une fiche produit de luxe avec ces mots-clés : ${keywords}` }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 4. Actualité du luxe
app.post("/luxury-news", async (req, res) => {
  const { date } = req.body;
  const query = date ? `Actualités du luxe à la date du ${date}` : "Dernières actualités du luxe";
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: query }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 5. Chat IA
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ error: "Message manquant." });
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: message }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 6. Générateur de contenu IA
app.post("/generate-content", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt manquant." });
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 7. Générateur d’image IA (DALL-E)
app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ error: "Prompt manquant." });
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/images/generations",
      {
        model: "dall-e-3",
        prompt: prompt,
        n: 1,
        size: "1024x1024"
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ image: response.data.data[0].url });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// 8. Guide du Prêt-à-Porter de luxe
app.get("/guide-luxe", (req, res) => {
  const guide = {
    chapitres: [
      "La Nouvelle Collection",
      "Le Outlet",
      "Le N-1 / N-2",
      "Seconde Main Maroquinerie"
    ]
  };
  res.json(guide);
});

// 9. Marques Startups / Incubateurs
app.post("/startup-brands", async (req, res) => {
  const { secteur } = req.body;
  try {
    const prompt = `Donne une liste de jeunes marques innovantes ou issues d'incubateurs dans le secteur : ${secteur}`;
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    res.json({ response: response.data.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur IA" });
  }
});

// Lancement du serveur
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Serveur en ligne sur le port ${PORT}`);
});
