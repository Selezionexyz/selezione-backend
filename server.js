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
        model: "gpt-4",
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

app.listen(PORT, () => {
  console.log("✅ Serveur en ligne sur le port", PORT);
});
