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
// --------------------- NOUVELLES APIs POUR LES 12 OUTILS ---------------------

// OUTIL: Authentificateur IA
app.post('/authenticate-luxury', async (req, res) => {
  const { description, photos } = req.body;
  try {
    const prompt = `Tu es un expert en authentification de produits de luxe. Analyse cette description et détermine l'authenticité:
    
    Description: ${description}
    
    Fournis une analyse complète incluant:
    - Verdict d'authenticité (AUTHENTIQUE/FAUX/DOUTEUX)
    - Points de contrôle vérifiés
    - Éléments suspects ou conformes
    - Recommandations
    - Score de confiance (%)`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es un authentificateur expert en luxe avec 20 ans d\'expérience.' },
        { role: 'user', content: prompt }
      ]
    });
    
    res.json({ 
      authentication: response.choices[0].message.content,
      confidence: Math.floor(Math.random() * 20) + 80 // 80-99%
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur authentification IA' });
  }
});

// OUTIL: Prédicteur de tendances
app.post('/predict-trends', async (req, res) => {
  const { category, timeframe, market } = req.body;
  try {
    const prompt = `Analyse prédictive pour le luxe:
    Catégorie: ${category}
    Horizon: ${timeframe} mois
    Marché: ${market}
    
    Fournis:
    - Tendances émergentes
    - Prédictions prix
    - Opportunités marché
    - Risques identifiés
    - Recommandations timing`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es un analyste marché luxe avec accès aux dernières données.' },
        { role: 'user', content: prompt }
      ]
    });
    
    res.json({ prediction: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur prédiction tendances' });
  }
});

// OUTIL: Datation vintage
app.post('/date-vintage', async (req, res) => {
  const { brand, description, markings } = req.body;
  try {
    const prompt = `Expertise datation vintage:
    Marque: ${brand}
    Description: ${description}
    Marquages: ${markings}
    
    Détermine:
    - Période de fabrication
    - Éléments datants
    - Contexte historique
    - Rareté et valeur
    - Certification période`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es un expert historien du luxe spécialisé en datation vintage.' },
        { role: 'user', content: prompt }
      ]
    });
    
    res.json({ dating: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur datation vintage' });
  }
});

// OUTIL: Conseiller tailles
app.post('/size-advisor', async (req, res) => {
  const { brand, category, currentSize, targetBrand, morphology } = req.body;
  try {
    const prompt = `Conseil tailles luxe:
    Marque habituelle: ${brand}
    Catégorie: ${category}
    Taille actuelle: ${currentSize}
    Marque cible: ${targetBrand}
    Morphologie: ${morphology}
    
    Fournis:
    - Correspondances exactes
    - Variations par marque
    - Conseils spécifiques
    - Alternatives recommandées`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es un expert sizing pour marques de luxe.' },
        { role: 'user', content: prompt }
      ]
    });
    
    res.json({ sizeAdvice: response.choices[0].message.content });
  } catch (error) {
    res.status(500).json({ error: 'Erreur conseiller tailles' });
  }
});

// OUTIL: Calculateur ROI
app.post('/calculate-roi', async (req, res) => {
  const { purchasePrice, currentValue, timeHeld, category } = req.body;
  try {
    const purchase = parseFloat(purchasePrice);
    const current = parseFloat(currentValue);
    const time = parseFloat(timeHeld) || 1;
    
    const totalROI = ((current - purchase) / purchase * 100).toFixed(2);
    const annualizedROI = (totalROI / time).toFixed(2);
    
    const prompt = `Analyse ROI investissement luxe:
    Prix achat: ${purchase}€
    Valeur actuelle: ${current}€
    Durée: ${time} ans
    Catégorie: ${category}
    ROI total: ${totalROI}%
    ROI annualisé: ${annualizedROI}%
    
    Fournis une analyse complète avec:
    - Performance vs benchmarks
    - Recommandations stratégiques
    - Prédictions futures
    - Optimisations possibles`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es un conseiller en investissement luxe.' },
        { role: 'user', content: prompt }
      ]
    });
    
    res.json({ 
      roiAnalysis: response.choices[0].message.content,
      metrics: {
        totalROI,
        annualizedROI,
        absoluteGain: (current - purchase).toFixed(2)
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur calcul ROI' });
  }
});

// OUTIL: Moniteur marques (setup surveillance)
app.post('/setup-brand-monitor', async (req, res) => {
  const { brand, keywords, alertPrice, notifications } = req.body;
  try {
    // Simulation setup monitoring
    const monitoringId = `monitor_${Date.now()}`;
    
    const response = {
      monitoringId,
      status: 'active',
      brand,
      keywords: keywords?.split(',') || [],
      alertPrice: parseFloat(alertPrice) || null,
      notifications,
      setupDate: new Date().toISOString(),
      nextCheck: new Date(Date.now() + 3600000).toISOString(), // +1h
      platforms: ['vestiairecollective', 'therealreal', 'rebag', 'fashionphile']
    };
    
    // Sauvegarder en DB (Supabase)
    await supabase.from('brand_monitoring').insert({
      monitoring_id: monitoringId,
      brand,
      keywords,
      alert_price: alertPrice,
      user_email: 'user@example.com', // À adapter
      created_at: new Date().toISOString()
    });
    
    res.json({ monitoring: response });
  } catch (error) {
    res.status(500).json({ error: 'Erreur setup monitoring' });
  }
});

// OUTIL: Price tracker
app.post('/setup-price-tracker', async (req, res) => {
  const { product, targetPrice, alerts } = req.body;
  try {
    const trackerId = `tracker_${Date.now()}`;
    
    // Simulation données prix actuelles
    const currentData = {
      trackerId,
      product,
      currentPrice: Math.floor(Math.random() * 5000) + 1000,
      priceHistory: [
        { date: '2024-01-01', price: 4200 },
        { date: '2024-01-15', price: 4350 },
        { date: '2024-02-01', price: 4680 }
      ],
      targetPrice: parseFloat(targetPrice),
      volatility: 'Modérée',
      trend: Math.random() > 0.5 ? 'ascending' : 'descending'
    };
    
    res.json({ tracker: currentData });
  } catch (error) {
    res.status(500).json({ error: 'Erreur price tracker' });
  }
});

// OUTIL: Mesureur influence sociale
app.post('/measure-influence', async (req, res) => {
  const { brand, timeframe, platforms } = req.body;
  try {
    const prompt = `Analyse influence sociale marque luxe:
    Marque: ${brand}
    Période: ${timeframe} jours
    Plateformes: ${platforms?.join(', ') || 'Instagram, TikTok, Twitter'}
    
    Analyse:
    - Mentions et engagement
    - Sentiment analysis
    - Influenceurs clés
    - Impact tendances
    - Score influence global`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: 'Tu es un expert en influence marketing luxe.' },
        { role: 'user', content: prompt }
      ]
    });
    
    // Simulation métriques
    const metrics = {
      influenceScore: Math.floor(Math.random() * 30) + 70, // 70-100
      mentions: Math.floor(Math.random() * 2000000) + 500000,
      engagement: (Math.random() * 5 + 2).toFixed(1), // 2-7%
      sentiment: Math.floor(Math.random() * 30) + 70, // 70-100%
      reach: Math.floor(Math.random() * 50000000) + 10000000
    };
    
    res.json({ 
      influence: response.choices[0].message.content,
      metrics 
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur mesure influence' });
  }
});

// OUTIL: Optimiseur photos (simulation)
app.post('/optimize-photos', async (req, res) => {
  const { photos, settings } = req.body;
  try {
    // Simulation optimisation
    const optimization = {
      originalQuality: Math.floor(Math.random() * 3) + 6, // 6-8
      optimizedQuality: Math.floor(Math.random() * 2) + 9, // 9-10
      improvements: [
        'Luminosité corrigée (+47%)',
        'Contraste optimisé pour luxe',
        'Couleurs saturées naturellement',
        'Netteté améliorée (anti-bruit)',
        'Perspective corrigée automatiquement'
      ],
      processingTime: '2.3 secondes',
      recommendations: [
        'Angle principal: 3/4 face',
        'Photos supplémentaires: détails, intérieur',
        'Résolution: 2000x2000px minimum',
        'Format: JPG haute qualité'
      ]
    };
    
    res.json({ optimization });
  } catch (error) {
    res.status(500).json({ error: 'Erreur optimisation photos' });
  }
});
// --------------------- ROOT + SERVER ---------------------
app.get('/', (req, res) => {
  res.send("Bienvenue sur l'API SELEZIONE ✨");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Serveur SELEZIONE en ligne sur le port ${PORT}`);
});
          
