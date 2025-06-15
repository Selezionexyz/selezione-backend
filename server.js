// server.js optimisé et complet pour SELEZIONE const express = require('express'); const axios = require('axios'); const cors = require('cors'); require('dotenv').config();

const app = express(); app.use(cors()); app.use(express.json());

const OPENAI_API_KEY = process.env.OPENAI_API_KEY; const NEWS_API_KEY = process.env.NEWS_API_KEY;

// ★ MODULE 1 : Assistant Luxe IA (chat, marque, style) app.post('/assistant-luxe', async (req, res) => { const { message, mode } = req.body;

let systemPrompt = "Tu es un assistant luxe intelligent, expert en marques, style et stratégie luxe."; switch (mode) { case 'marque': systemPrompt = "Tu es un analyste expert des marques de luxe. Donne une présentation détaillée, incluant l'histoire, le style, le positionnement et la réputation."; break; case 'style': systemPrompt = "Tu es un conseiller en style luxe. Tu aides selon les tendances actuelles, l'occasion, le budget et la morphologie."; break; case 'chat': default: systemPrompt = "Tu es un assistant général dans le domaine du luxe."; }

try { const response = await axios.post( 'https://api.openai.com/v1/chat/completions', { model: 'gpt-4-turbo', messages: [ { role: 'system', content: systemPrompt }, { role: 'user', content: message } ] }, { headers: { Authorization: Bearer ${OPENAI_API_KEY}, 'Content-Type': 'application/json' } } );

res.json({ reponse: response.data.choices[0].message.content });

} catch (error) { console.error('Erreur Assistant Luxe IA:', error.message); res.status(500).json({ error: 'Erreur Assistant Luxe IA.' }); } });

// ★ MODULE 2 : Actualités Luxe + Générateur IA app.get('/actus-luxe', async (req, res) => { try { const response = await axios.get( https://newsapi.org/v2/everything?q=luxe%20mode%20fashion&language=fr&sortBy=publishedAt&apiKey=${NEWS_API_KEY} ); const actualites = response.data.articles.map(article => ({ title: article.title, url: article.url, image: article.urlToImage, source: article.source.name, publishedAt: article.publishedAt })); res.json({ actualites }); } catch (error) { console.error("Erreur actu luxe:", error.message); res.status(500).json({ error: "Erreur récupération actualités." }); } });

app.post('/generate-image', async (req, res) => { const { prompt } = req.body; try { const response = await axios.post( 'https://api.openai.com/v1/images/generations', { model: "dall-e-3", prompt, n: 1, size: "1024x1024" }, { headers: { Authorization: Bearer ${OPENAI_API_KEY}, 'Content-Type': 'application/json' } } ); res.json({ image: response.data.data[0].url }); } catch (error) { console.error("Erreur image IA:", error.message); res.status(500).json({ error: "Erreur génération image." }); } });

// ★ MODULE 3 : Fiche Produit + Assistant Style app.post('/fiche-produit', async (req, res) => { const { nomProduit } = req.body; try { const response = await axios.post( 'https://api.openai.com/v1/chat/completions', { model: "gpt-4-turbo", messages: [ { role: "system", content: "Tu es un expert en création de fiches produits de luxe optimisées pour l'e-commerce." }, { role: "user", content: Crée une fiche produit pour : ${nomProduit} } ] }, { headers: { Authorization: Bearer ${OPENAI_API_KEY}, 'Content-Type': 'application/json' } } ); res.json({ fiche: response.data.choices[0].message.content }); } catch (error) { console.error("Erreur fiche produit:", error.message); res.status(500).json({ error: "Erreur fiche produit IA." }); } });

app.post('/assistant-style', async (req, res) => { const { critere } = req.body; try { const response = await axios.post( 'https://api.openai.com/v1/chat/completions', { model: "gpt-4-turbo", messages: [ { role: "system", content: "Tu es un assistant personnel spécialisé en conseil vestimentaire de luxe." }, { role: "user", content: Voici mon besoin : ${critere} } ] }, { headers: { Authorization: Bearer ${OPENAI_API_KEY}, 'Content-Type': 'application/json' } } ); res.json({ style: response.data.choices[0].message.content }); } catch (error) { console.error("Erreur assistant style:", error.message); res.status(500).json({ error: "Erreur assistant style." }); } });

// Démarrage serveur const PORT = process.env.PORT || 10000; app.listen(PORT, () => console.log(🚀 Serveur SELEZIONE lancé sur le port ${PORT}));

