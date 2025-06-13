const express = require("express");
const cors = require("cors");
const axios = require("axios");
require("dotenv").config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.post("/ask", async (req, res) => {
  const { question } = req.body;
  if (!question) {
    return res.status(400).json({ error: "Question manquante." });
  }
  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: "Tu es un assistant e-commerce de luxe. Propose les dernières tendances mode en analysant les tops marques comme Gucci, Louis Vuitton, Dior, etc., à partir de sources fiables comme Vogue, Farfetch, Google Shopping, Vestiaire Collective."
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );
    const answer = response.data.choices[0].message.content;
    res.json({ response: answer });
  } catch (error) {
    console.error("Erreur:", error.message);
    res.status(500).json({ error: "Erreur lors de la requête à OpenAI." });
  }
});
app.get("/", (req, res) => {
  res.send("✅ Backend Selezione est opérationnel !");
});
app.get("/test", (req, res) => {
  res.send("✅ Route /test en ligne !");
});
// ... ici tout ton code déjà en place : require, app.post("/ask"), app.get("/", etc.)

// 🔽 Ajoute ici le nouveau endpoint pour générer des images
app.post("/generate-image", async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt manquant." });
  }

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
console.log("Données reçues :", response.data);
res.json(response.data);
  } catch (error) {
    console.error("Erreur génération image :", error.message);
    res.status(500).json({ error: "Erreur lors de la génération d'image." });
  }
});
// ... autres routes comme /ask ou /generate-image

app.post("/assistant-personnel", async (req, res) => {
  const { profil, question } = req.body;
  if (!profil || !question) {
    return res.status(400).json({ error: "Profil ou question manquant." });
  }

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          {
            role: "system",
            content: `Tu es un assistant personnel expert en stratégie de marque et mode. Voici le profil de l'utilisateur : ${profil}. Réponds toujours en fonction de ce contexte.`
          },
          {
            role: "user",
            content: question
          }
        ],
        temperature: 0.8
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const answer = response.data.choices[0].message.content;
    res.json({ response: answer });
  } catch (error) {
    console.error("Erreur assistant IA :", error.message);
    res.status(500).json({ error: "Erreur assistant IA." });
  }
});

// 🔻 TOUJOURS EN DERNIER :
app.listen(PORT, () => {
  console.log("✅ Serveur en ligne sur le port", PORT);
});
// 🔽 Ne touche pas à cette ligne, elle doit rester tout en bas
app.listen(PORT, () => {
  console.log("✅ Serveur en ligne sur le port", PORT);
});
