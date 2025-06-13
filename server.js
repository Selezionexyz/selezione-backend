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

  try {
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
app.post("/fiche-produit", async (req, res) => {
  const { nom, matière, couleur, collection, style, publicCible } = req.body;
if (!prompt || prompt.trim() === "") {
  return res.status(400).json({ error: "Prompt vide ou invalide." });
}
console.log("Prompt envoyé à GPT :", prompt);
  if (!nom || !matière || !couleur || !collection || !style || !publicCible) {
    return res.status(400).json({ error: "Champs manquants." });
  }

  try {
    const prompt = `
Génère une fiche produit professionnelle pour un article de mode luxe avec ces infos :
- Nom : ${nom}
- Matière : ${matière}
- Couleur : ${couleur}
- Collection : ${collection}
- Style : ${style}
- Public cible : ${publicCible}

Utilise un ton élégant, vendeur, et adapté à une fiche e-commerce. 
    `;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: "Tu es un expert en rédaction e-commerce pour des produits de mode et luxe." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const fiche = response.data.choices[0].message.content;
    res.json({ fiche });
  } catch (error) {
    console.error("Erreur fiche produit :", error.message);
    res.status(500).json({ error: "Erreur lors de la génération de la fiche produit." });
  }
});
// 🔽 Ne touche pas à cette ligne, elle doit rester tout en bas
app.listen(PORT, () => {
  console.log("✅ Serveur en ligne sur le port", PORT);
});
