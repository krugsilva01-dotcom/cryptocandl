
# 🚀 Roteiro de Migração: CryptoCandles AI (Protótipo -> Produção)

Este documento lista todas as alterações de código necessárias para conectar o aplicativo aos servidores reais (Google Firebase).

## 1. Configuração do Firebase
- [ ] **Criar Projeto:** Acesse [console.firebase.google.com](https://console.firebase.google.com) e crie o projeto.
- [ ] **Habilitar Authentication:** Ative o provedor "Email/Password".
- [ ] **Habilitar Firestore:** Crie o banco de dados em modo de teste.
- [ ] **Pegar Chaves:** Copie as configurações do Web App (API Key, Project ID, etc).

## 2. Hospedagem (Vercel)
- [ ] **Criar Conta:** Acesse [vercel.com](https://vercel.com).
- [ ] **Importar Projeto:** Conecte com seu GitHub.
- [ ] **Variáveis de Ambiente (.env):** Configure na Vercel:
  - `VITE_FIREBASE_API_KEY`
  - `VITE_FIREBASE_AUTH_DOMAIN`
  - `VITE_FIREBASE_PROJECT_ID`
  - `VITE_FIREBASE_STORAGE_BUCKET`
  - `VITE_FIREBASE_MESSAGING_SENDER_ID`
  - `VITE_FIREBASE_APP_ID`
  - `VITE_API_KEY` (Sua chave da Gemini AI)

## 3. Frontend - Verificações
- [ ] **Modo Simulação:** O app está configurado para usar Mocks se as chaves não existirem. Assim que você colocar as chaves na Vercel, ele mudará automaticamente para o modo Real.
- [ ] **Inteligência Artificial:** Certifique-se de que a `VITE_API_KEY` da Gemini está válida.

## 4. Segurança (Regras do Firestore)
Quando for para produção real, altere as regras do Firestore de "Modo Teste" para:
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    match /signals/{signalId} {
      allow read: if true;
      allow write: if request.auth != null && get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
    }
  }
}
```
