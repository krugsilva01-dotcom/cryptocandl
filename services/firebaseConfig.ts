
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Configuração do Firebase lida das variáveis de ambiente via process.env
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

let auth: any = null;
let db: any = null;
let app: any = null;

// Só inicializa se a chave de API estiver presente e válida
if (firebaseConfig.apiKey && typeof firebaseConfig.apiKey === 'string' && firebaseConfig.apiKey.startsWith('AIza')) {
    try {
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        // db = getFirestore(app); // Disabled due to missing module
        console.log("Firebase conectado com sucesso (Apenas Auth)!");
    } catch (error) {
        console.error("Erro ao inicializar Firebase:", error);
    }
} else {
    console.warn("Chaves do Firebase não encontradas ou inválidas. O app rodará em modo SIMULAÇÃO (Mock).");
}

export { auth, db };
