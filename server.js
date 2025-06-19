// --------------------- IMPORTS ---------------------
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const cors = require('cors');
const cheerio = require('cheerio');
const OpenAI = require('openai');
const RSSParser = require('rss-parser');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// --------------------- INIT ---------------------
const app = express();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
app.use(cors());
app.use(bodyParser.json());

// Supabase Client
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

// Nodemailer Transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_PASS,
  },
});

// --------------------- MODULE 1 : Assistant Luxe IA ---------------------
app.post('/assistant-luxe', async (req, res) => {
  const { message, mode } = req.body;
  let systemPrompt = "Tu es un assistant IA expert en luxe, prêt-à-porter, tendances et marques.";
  if (mode === 'marque') systemPrompt = "Tu es un expert des marques de luxe.";
  else if (mode === 'style') systemPrompt = "Tu es un conseiller de style luxe, spécialisé en prêt-à-porter.";

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ]
    });
    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur Assistant Luxe' });
  }
});

// --------------------- MODULE 2 : Actu IA + Image ---------------------
app.post('/actus-luxe-ia', async (req, res) => {
  const { sujet, type } = req.body;
  let prompt;

  switch (type) {
    case 'anecdote':
      prompt = `Raconte une anecdote rare sur : ${sujet}`;
      break;
    case 'tendance':
      prompt = `Analyse les tendances du luxe : ${sujet}`;
      break;
    default:
      prompt = sujet ? `Fais une actualité détaillée sur : ${sujet}` : "Fais une actu du jour dans le luxe.";
  }

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: "system", content: "Tu es un journaliste luxe." },
        { role: "user", content: prompt }
      ]
    });
    res.json({ contenu: completion.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: "Erreur actu IA." });
  }
});

// --------------------- MODULE 3 : Style + Fiche produit ---------------------
app.post('/assistant-style', async (req, res) => {
  const { message } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: 'system', content: "Tu es un assistant style luxe." },
        { role: 'user', content: message }
      ]
    });
    res.json({ response: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur assistant style.' });
  }
});

app.post('/fiche-produit', async (req, res) => {
  const { produit } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        { role: 'system', content: "Tu es expert fiche produit SEO pour mode luxe." },
        { role: 'user', content: `Fiche produit pour : ${produit}` }
      ]
    });
    res.json({ fiche: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur fiche produit.' });
  }
});

// --------------------- MODULE 4 : Estimation & Comparateur ---------------------
app.post('/estimation-luxe', async (req, res) => {
  const { description } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es expert en estimation mode luxe.' },
        { role: 'user', content: `Estime ce produit : ${description}` }
      ]
    });
    res.json({ estimation: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur estimation.' });
  }
});

app.post('/comparateur-luxe', async (req, res) => {
  const { produit } = req.body;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu compares Vinted, VC, etc.' },
        { role: 'user', content: `Compare pour : ${produit}` }
      ]
    });
    res.json({ comparaison: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur comparateur.' });
  }
});

// --------------------- MODULE 5 : Actu par date + RSS ---------------------
app.post('/rss-luxe', async (req, res) => {
  const { sujet, date } = req.body;
  const parser = new RSSParser();
  const feeds = [
    'https://www.vogue.fr/rss.xml',
    'https://www.gqmagazine.fr/rss.xml',
    'https://www.lofficiel.com/feed'
  ];

  try {
    const allItems = [];
    for (let url of feeds) {
      const feed = await parser.parseURL(url);
      feed.items.forEach(item => {
        const match = (!date || item.pubDate.includes(date)) && (!sujet || item.title.toLowerCase().includes(sujet.toLowerCase()));
        if (match) allItems.push({ title: item.title, link: item.link });
      });
    }

    if (allItems.length) return res.json({ contenu: allItems });

    const fallback = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Journaliste luxe' },
        { role: 'user', content: `Donne-moi les actus sur : ${sujet || 'mode luxe'}` }
      ]
    });

    res.json({ contenu: fallback.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: 'Erreur actus RSS.' });
  }
});

// --------------------- MODULE 6 : Scraper Vestiaire Collective ---------------------
function cleanPrice(priceStr) {
  return parseFloat(priceStr.replace(/[€,\s]/g, '').replace(',', '.'));
}

app.post("/scrape-vestiaire", async (req, res) => {
  const { query } = req.body;
  if (!query) return res.status(400).json({ error: "Requête invalide." });

  try {
    const url = `https://www.vestiairecollective.com/search/?q=${encodeURIComponent(query)}`;
    const html = await axios.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });

    const $ = cheerio.load(html.data);
    const produits = [];

    $('article').each((_, el) => {
      const title = $(el).find('.product-title').text().trim();
      const price = cleanPrice($(el).find('.product-price').text());
      const link = "https://www.vestiairecollective.com" + $(el).find("a").attr("href");
      if (title && price && link) produits.push({ title, price, link });
    });

    if (!produits.length) return res.json({ produits: [], resume: "Aucune donnée trouvée." });

    const stats = {
      min: Math.min(...produits.map(p => p.price)),
      max: Math.max(...produits.map(p => p.price)),
      avg: (produits.reduce((a, b) => a + b.price, 0) / produits.length).toFixed(2)
    };

    const prompt = `Vestiaire Collective - ${query}\nMin: ${stats.min}€\nMax: ${stats.max}€\nMoyenne: ${stats.avg}€. Fais une analyse rapide.`;

    const ia = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es analyste luxe.' },
        { role: 'user', content: prompt }
      ]
    });

    res.json({ produits, stats, resume: ia.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: "Erreur scraping." });
  }
});

// --------------------- MODULE 7 : Commandes sur Fichier (Supabase) ---------------------
app.post('/api/commande', async (req, res) => {
  const { user, fichier, selections } = req.body;

  try {
    const { error } = await supabase.from('commandes').insert({
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
      html: `Fichier: ${fichier}<br><br>Commande:<br><pre>${JSON.stringify(selections, null, 2)}</pre>`
    });

    res.status(200).json({ message: 'Commande enregistrée.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur enregistrement commande.' });
  }
});

// --------------------- MODULE 8 : Quiz & Progression ---------------------
const DB_PATH = path.join(__dirname, 'db.json');
function loadDB() {
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));
  } catch (err) {
    return { users: [] };
  }
}
function saveDB(db) {
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2));
}

app.post('/api/quiz/submit', (req, res) => {
  const { userId, moduleId, score } = req.body;
  if (!userId || !moduleId || typeof score !== 'number') return res.status(400).json({ error: 'Requête invalide.' });

  const validated = score >= 80;
  const db = loadDB();
  let user = db.users.find(u => u.id === userId);
  if (!user) {
    user = { id: userId, modules: {} };
    db.users.push(user);
  }
  user.modules[moduleId] = { score, validated };
  saveDB(db);
  res.json({ validated });
});

app.get('/api/module/status/:userId/:moduleId', (req, res) => {
  const { userId, moduleId } = req.params;
  const db = loadDB();
  const user = db.users.find(u => u.id === userId);
  const validated = user?.modules?.[moduleId]?.validated || false;
  res.json({ validated });
});

// --------------------- ROOT + SERVER ---------------------
app.get('/', (req, res) => {
  res.send("Bienvenue sur l'API SELEZIONE ✨");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur SELEZIONE en ligne sur le port ${PORT}`);
});
          
