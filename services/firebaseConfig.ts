/// <reference types="vite/client" />

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Fix for Vite environment variables access
// We use a safe access pattern to prevent crashes if env is not fully loaded
const env = import.meta.env || {};

// Configuração do Firebase lida das variáveis de ambiente (Padrão Vite)
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let auth: any = null;
let db: any = null;
let app: any = null;

// Só inicializa se a chave de API estiver presente e válida
if (firebaseConfig.apiKey && typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.startsWith('AIza')) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
        console.log("Firebase conectado com sucesso!");
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }
} else {
    console.warn("Chaves do Firebase não encontradas ou inválidas. O app rodará em modo SIMULAÇÃO (Mock).");
}

export { auth, db };
