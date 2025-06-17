// --------------------- IMPORTS ---------------------
const express = require('express');
const bodyParser = require('body-parser');
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
// ✅ MODULE : Actus luxe par date + RSS
app.post('/actus-luxe-date-rss', async (req, res) => {
  const { date, sujet } = req.body;
  const prompt = `Donne-moi un résumé des actualités du ${date} liées au luxe ou à la mode, avec focus : ${sujet || 'global'}.`;

  try {
    // 1️⃣ Génération GPT-4
    const gpt = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Journaliste mode & luxe." },
        { role: "user", content: prompt }
      ]
    }, { headers: { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } });

    const text = gpt.data.choices[0].message.content;

    // 2️⃣ Ajout des flux RSS
    const parser = require('rss-parser');
    const feedurls = [
      'https://www.vogue.com/feed/rss', // Vogue
      'https://www.gq.com/rss/fashion',  // GQ
      'https://www.vogue.co.uk/rss/fashion' // British Vogue
    ];
    const allItems = [];
    const parserInstance = new parser();
    for (let url of feedurls) {
      const feed = await parserInstance.parseURL(url);
      feed.items.forEach(item => {
        const pub = item.pubDate;
        if (pub && pub.startsWith(date)) {
          allItems.push({ title: item.title, link: item.link });
        }
      });
    }

    res.json({ text, rss: allItems });

  } catch(err) {
    console.error("Erreur actus-date-rss :", err.message);
    res.status(500).json({ error: "Erreur actus-mode-date." });
  }
});
app.post('/rss-luxe', async (req, res) => {
  const { sujet, date } = req.body;
  const formattedDate = date ? new Date(date).toISOString().split('T')[0] : null;
  let feedContent = '';

  try {
    const parser = new RSSParser();
    const feeds = await Promise.all([
      parser.parseURL("https://www.vogue.fr/rss.xml"),
      parser.parseURL("https://www.gqmagazine.fr/rss.xml"),
      parser.parseURL("https://www.lofficiel.com/feed")
    ]);

    const allItems = feeds.flatMap(feed => feed.items || []);
    const filtered = allItems.filter(item => {
      const pubDate = item.pubDate ? new Date(item.pubDate).toISOString().split('T')[0] : '';
      const matchesDate = !formattedDate || pubDate === formattedDate;
      const matchesSujet = !sujet || item.title.toLowerCase().includes(sujet.toLowerCase());
      return matchesDate && matchesSujet;
    });

    if (filtered.length > 0) {
      const articles = filtered.map(a => `📰 ${a.title}\n🔗 ${a.link}`).join('\n\n');
      return res.json({ contenu: articles });
    }

    // Fallback GPT-4 si aucun article RSS
    const aiResponse = await axios.post("https://api.openai.com/v1/chat/completions", {
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un journaliste expert en luxe et prêt-à-porter." },
        { role: "user", content: sujet 
            ? `Donne-moi les actualités récentes ou du jour concernant : ${sujet}`
            : "Génère un résumé des actualités du jour dans le secteur du luxe, mode et prêt-à-porter." }
      ]
    }, {
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    res.json({ contenu: aiResponse.data.choices[0].message.content });

  } catch (error) {
    console.error("Erreur RSS luxe :", error.message || error);
    res.status(500).json({ error: "Erreur génération d’actualités." });
  }
});
// ------------------------- MODULE 6 : Scraper Vestiaire Collective -------------------------

const cheerio = require("cheerio");
const OpenAI = require("openai");
require("dotenv").config();


const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 📊 Utilitaire pour convertir les prix : "1 490 €" -> 1490
function cleanPrice(priceStr) {
  return parseFloat(priceStr.replace(/[\u20ac,\s]/g, "").replace(",", "."));
}

// 🚀 Scraper Vestiaire Collective
app.post("/scrape-vestiaire", async (req, res) => {
  const { query } = req.body;

  if (!query || query.length < 2) {
    return res.status(400).json({ error: "Requête invalide." });
  }

  try {
    const response = await axios.get(url, {
  headers: {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
    "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
    "Upgrade-Insecure-Requests": "1",
  },
});

    const $ = cheerio.load(response.data);
    const produits = [];

    $("article").each((_, el) => {
      const title = $(el).find(".product-title").text().trim();
      const price = cleanPrice($(el).find(".product-price").text());
      const link =
        "https://www.vestiairecollective.com" + $(el).find("a").attr("href");

      if (title && price && link) {
        produits.push({ title, price, link });
      }
    });

    if (produits.length === 0) {
      return res.json({
        produits: [],
        resume: "Aucune donnée trouvée.",
      });
    }

    // 🔢 Calcul des statistiques
    const prices = produits.map((p) => p.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = (prices.reduce((a, b) => a + b, 0) / prices.length).toFixed(2);

    // 🧠 Appel à l'IA pour un résumé
    const prompt = `Voici les données réelles de Vestiaire Collective pour le produit : ${query}\nPrix minimum : ${min}€\nPrix maximum : ${max}€\nPrix moyen : ${avg}€.\nFais une synthèse utile pour vendre intelligemment ce produit.`;

    const ia = await openai.createChatCompletion({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content:
            "Tu es un expert du marché de la mode de luxe en ligne. Donne une analyse concise, utile, pour optimiser l'achat ou la revente du produit.",
        },
        { role: "user", content: prompt },
      ],
    });

    res.json({
      produits,
      stats: { min, max, avg },
      resume: ia.data.choices[0].message.content,
    });
  } catch (err) {
    console.error("Erreur scraping Vestiaire:", err.message);
    res.status(500).json({ error: "Erreur lors du scraping." });
  }
});
// ... tes imports & config (express, cors, supabase, nodemailer, etc.)

// Middleware
app.use(cors());
app.use(bodyParser.json());

// 💾 Enregistrement commande (juste avant app.listen)
app.post('/api/commande', async (req, res) => {
  const { user, fichier, selections } = req.body;

  try {
    const { error } = await supabase
      .from('commandes')
      .insert({
        user,
        fichier,
        selections,
        created_at: new Date().toISOString(),
      });

    if (error) throw error;

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: process.env.ADMIN_EMAIL,
      subject: `Nouvelle commande SELEZIONE de ${user}`,
      html: `Fichier: ${fichier}<br><br>Commande:<br><pre>${JSON.stringify(selections, null, 2)}</pre>`,
    });

    res.status(200).json({ message: 'Commande enregistrée et notifiée avec succès.' });
  } catch (err) {
    console.error('Erreur commande :', err);
    res.status(500).json({ error: 'Erreur lors de l’enregistrement de la commande.' });
  }
});

// ✅ Fin du fichier

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur scraping lancé sur le port ${PORT}`);
});



