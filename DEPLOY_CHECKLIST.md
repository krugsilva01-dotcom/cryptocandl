# 🚀 Roteiro de Migração: CryptoCandles AI (Protótipo -> Produção)

Este documento lista todas as alterações de código necessárias para conectar o aplicativo a servidores reais.

## 1. Banco de Dados (Supabase)
- [ ] **Executar SQL:** Copiar o conteúdo de `database/schema.sql` e rodar no "SQL Editor" do seu projeto Supabase.
- [ ] **Policies (RLS):** Ativar Row Level Security nas tabelas para que usuários só possam editar seus próprios dados.

## 2. Backend (Node.js / Server)
- [ ] **Hospedagem:** Subir a pasta `server/` para um serviço como Render, Heroku ou Railway.
- [ ] **Variáveis de Ambiente (.env):** Configurar no servidor:
  - `SUPABASE_URL`
  - `SUPABASE_ANON_KEY`
  - `GEMINI_API_KEY` (A chave sai do frontend e fica apenas aqui)
  - `STRIPE_SECRET_KEY` (Para pagamentos)

## 3. Frontend - Atualizações de Código

### A. Autenticação e Usuários (`services/api.ts`)
- [ ] **Remover Mocks:** Apagar `mockUsers`, `mockSignals`, etc.
- [ ] **Login/Registro:** Substituir a lógica atual que verifica `supabase` ou `fallback` por chamadas diretas à API do seu backend ou usar `supabase.auth` nativo.
- [ ] **Admin:** A função `getAdminUsers` deve fazer um `fetch('/api/admin/users')` protegido por token de administrador.

### B. Dados de Mercado (`services/marketService.ts`)
- [ ] **CORS da Binance:** Alterar `getBinanceKlines`.
  - **Atual:** Tenta fetch direto -> falha -> gera simulação.
  - **Produção:** Deve fazer `fetch('https://seu-api.com/api/market/klines')`. O seu servidor fará a chamada à Binance.

### C. Pagamentos (`components/Pricing.tsx`)
- [ ] **Integrar Gateway:**
  - **Atual:** `setTimeout` simulando "Redirecionando...".
  - **Produção:** Chamar endpoint `/api/checkout`. Receber uma URL de checkout (Stripe/MercadoPago) e fazer `window.location.href = checkoutUrl`.

### D. Inteligência Artificial (`services/geminiService.ts`)
- [ ] **Segurança:**
  - **Atual:** Chama a IA direto do navegador (expondo a chave se não usar proxy).
  - **Produção:** O frontend deve apenas enviar o arquivo para `/api/analyze`. O backend processa e retorna o JSON.

## 4. Segurança Final
- [ ] **Remover API Keys do Frontend:** Apagar qualquer referência a `process.env.API_KEY` ou `supabaseKey` dentro dos arquivos `.tsx` ou `vite.config`. Elas devem viver apenas no Backend.
