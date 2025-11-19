
/**
 * CryptoCandles AI - Backend Server
 * 
 * Para rodar este servidor:
 * 1. Instale as dependências: npm install express cors dotenv @supabase/supabase-js @google/genai multer
 * 2. Configure o arquivo .env com suas chaves
 * 3. Execute: node server.js
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI, Type } = require("@google/genai");
const multer = require('multer'); // Para upload de imagens

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configuração do Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configuração do Gemini (AI)
const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Configuração de Upload (Memória)
const upload = multer({ storage: multer.memoryStorage() });

// --- ROTAS DE AUTENTICAÇÃO ---

app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;

  // OBS: Em produção, use supabase.auth.signInWithPassword
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();

  if (error || !data) {
    return res.status(401).json({ error: 'Credenciais inválidas' });
  }

  // Simulação de verificação de senha (em produção, compare hashes)
  if (password !== 'password' && data.password_hash !== password) { 
     // return res.status(401).json({ error: 'Senha incorreta' });
  }

  res.json(data);
});

app.post('/api/register', async (req, res) => {
  const { email, password, name } = req.body;
  
  const { data, error } = await supabase
    .from('users')
    .insert([{ email, password_hash: password, name, role: 'free' }])
    .select();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data[0]);
});

// --- ROTAS DE USUÁRIO ---

app.post('/api/users/:id/upgrade', async (req, res) => {
  const { id } = req.params;
  
  const { data, error } = await supabase
    .from('users')
    .update({ role: 'premium', plan: 'Premium' })
    .eq('id', id)
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// --- ROTAS DA COMUNIDADE (Sinais) ---

app.get('/api/signals', async (req, res) => {
  const { data, error } = await supabase
    .from('signals')
    .select('*, signal_providers(name, avatar_url, win_rate)')
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.get('/api/providers', async (req, res) => {
  const { data, error } = await supabase
    .from('signal_providers')
    .select('*');
    
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// --- ROTA DE INTELIGÊNCIA ARTIFICIAL (Gemini) ---
// Movemos a lógica do frontend para cá para proteger a API KEY

app.post('/api/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhuma imagem enviada.' });
    }

    const base64Image = req.file.buffer.toString('base64');
    const mimeType = req.file.mimetype;

    const prompt = `
      Você é um analista de criptomoedas. Analise a imagem.
      Retorne um JSON com: patterns (array), trend (string), indicators (object with rsi, volume), recommendation (ALTA, BAIXA, AGUARDAR), confidenceScore (number), summary (string).
    `;

    const result = await genAI.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { inlineData: { mimeType: mimeType, data: base64Image } },
                { text: prompt }
            ]
        },
        config: {
            responseMimeType: "application/json",
             responseSchema: {
                type: Type.OBJECT,
                properties: {
                    patterns: { type: Type.ARRAY, items: { type: Type.STRING } },
                    trend: { type: Type.STRING },
                    indicators: { type: Type.OBJECT, properties: { rsi: { type: Type.STRING }, volume: { type: Type.STRING } } },
                    recommendation: { type: Type.STRING },
                    confidenceScore: { type: Type.NUMBER },
                    summary: { type: Type.STRING },
                }
            }
        }
    });

    res.json(JSON.parse(result.text));

  } catch (error) {
    console.error("Erro na análise de IA:", error);
    res.status(500).json({ error: 'Falha na análise de IA.' });
  }
});

// --- ROTA DE BACKTESTING ---

app.post('/api/backtest', (req, res) => {
    // Aqui você conectaria com uma API de dados de mercado real (Binance API)
    // Por enquanto, mantemos a lógica de simulação, mas rodando no servidor
    
    const { pair, timeframe, strategy } = req.body;
    
    // Lógica simulada
    const totalTrades = Math.floor(Math.random() * 150) + 50;
    const winRate = Math.floor(Math.random() * 40) + 50;
    
    // ... (Lógica de geração de trades) ...
    
    res.json({
        totalTrades,
        winRate,
        cumulativeReturn: Math.random() * 200 + 50,
        maxDrawdown: -(Math.random() * 15 + 5),
        trades: [] // Preencher com array de trades
    });
});

app.listen(port, () => {
  console.log(`Servidor CryptoCandles rodando na porta ${port}`);
});
