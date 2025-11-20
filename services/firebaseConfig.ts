import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// Access env via cast to avoid TS errors if ImportMeta interface is not properly augmented with env
// Fallback to empty object to prevent "Cannot read properties of undefined" error
const env = (import.meta as any).env || {};

// Configuração do Firebase lida das variáveis de ambiente (Padrão Vite)
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY,
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

let auth = null;
let db = null;
let app = null;

// Só inicializa se a chave de API estiver presente e válida
if (firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith('AIza')) {
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