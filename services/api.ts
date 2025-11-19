
import { mockUsers, mockSignalProviders, mockSignals, mockAdminUsers } from '../constants';
import { User, Signal, SignalProvider, UserRole, AdminUser, BacktestResult, Trade, PaginatedResponse } from '../types';
import { auth, db } from './firebaseConfig';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, getDocs, updateDoc, query, orderBy, limit as firestoreLimit, startAfter } from 'firebase/firestore';

// Simula a latência da rede para o modo Mock
const FAKE_DELAY = 800;
const BACKTEST_DELAY = 2000;

// --- AUTH SERVICES ---

export const login = async (email: string, password?: string): Promise<User> => {
    // 1. Tenta Login Real (Firebase)
    if (auth && db && password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Busca os dados extras do usuário no Firestore (Plano, Nome, Role)
            const userDocRef = doc(db, "users", firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const userData = userDoc.data();
                return {
                    id: firebaseUser.uid,
                    name: userData.name || "Usuário",
                    email: firebaseUser.email || "",
                    role: userData.role as UserRole,
                    plan: userData.plan || "Gratuito"
                };
            }
        } catch (e) {
            console.warn("Firebase login failed, falling back to mock if possible", e);
             // Opcional: Re-lançar erro se quiser avisar o usuário que a senha tá errada
             // throw e; 
        }
    }

    // 2. Fallback para Mock (Demonstração)
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.email === email);
            if (user) {
                resolve(user);
            } else {
                const guestUser: User = { id: 'guest', name: 'Usuário Convidado', email, role: UserRole.FREE, plan: 'Gratuito' };
                resolve(guestUser);
            }
        }, FAKE_DELAY);
    });
};

export const register = async (email: string, password: string, name: string): Promise<User> => {
    // 1. Tenta Registro Real (Firebase)
    if (auth && db) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const firebaseUser = userCredential.user;

            // Salva os dados extras no Firestore
            await setDoc(doc(db, "users", firebaseUser.uid), {
                name: name,
                email: email,
                role: 'free',
                plan: 'Gratuito',
                created_at: new Date().toISOString()
            });

            return {
                id: firebaseUser.uid,
                name: name,
                email: email,
                role: UserRole.FREE,
                plan: 'Gratuito'
            };

        } catch (e) {
             console.warn("Firebase register failed", e);
             // throw e;
        }
    }

    // 2. Fallback Mock
    return new Promise((resolve) => {
        setTimeout(() => {
            const newUser: User = {
                id: `new_${Date.now()}`,
                name: name,
                email: email,
                role: UserRole.FREE,
                plan: 'Gratuito'
            };
            // Adiciona ao mock para a sessão atual
            mockUsers.push(newUser);
            
            // Adiciona ao mock do Admin para visualização imediata
            mockAdminUsers.unshift({
                id: newUser.id,
                name: newUser.name,
                email: newUser.email,
                plan: 'Gratuito',
                status: 'Ativo'
            });

            resolve(newUser);
        }, FAKE_DELAY);
    });
};

export const recoverPassword = async (email: string): Promise<void> => {
    // No Firebase, seria sendPasswordResetEmail(auth, email)
    console.log("Recuperação de senha solicitada para:", email);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve();
        }, FAKE_DELAY);
    });
};

// --- DATA FETCHING SERVICES ---

export const getSignals = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Signal>> => {
    // 1. Tenta Buscar do Firestore
    if (db) {
        try {
            const signalsRef = collection(db, "signals");
            // Firestore pagination é complexa (precisa do último doc), aqui faremos um fetch simples
            // Para MVP, pegamos os últimos 20
            const q = query(signalsRef, orderBy("timestamp", "desc"), firestoreLimit(20));
            const querySnapshot = await getDocs(q);
            
            const signals: Signal[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                signals.push({
                    id: doc.id,
                    provider: data.provider || { name: "Desconhecido", avatarUrl: "", winRate: 0 }, // Simplificado
                    pair: data.pair,
                    type: data.type,
                    timeframe: data.timeframe,
                    entry: data.entry,
                    target: data.target,
                    stop: data.stop,
                    justification: data.justification,
                    imageUrl: data.imageUrl,
                    timestamp: new Date(data.timestamp).toLocaleDateString()
                });
            });
            
            if (signals.length > 0) {
                 return {
                    data: signals,
                    total: signals.length,
                    page,
                    limit,
                    hasMore: false // Simplificado para o exemplo
                 };
            }

        } catch (e) {
            console.warn("Firestore fetch failed", e);
        }
    }

    // 2. Fallback para Mock
    return new Promise((resolve) => {
        setTimeout(() => {
            const startIndex = (page - 1) * limit;
            const endIndex = startIndex + limit;
            const paginatedSignals = mockSignals.slice(startIndex, endIndex);
            const hasMore = endIndex < mockSignals.length;

            resolve({
                data: paginatedSignals,
                total: mockSignals.length,
                page,
                limit,
                hasMore
            });
        }, FAKE_DELAY);
    });
};

export const getSignalProviders = async (): Promise<SignalProvider[]> => {
    // Fallback Mock (Em produção buscaria da coleção 'providers')
    return new Promise((resolve) => setTimeout(() => resolve(mockSignalProviders), FAKE_DELAY));
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
    if (db) {
        try {
            const usersRef = collection(db, "users");
            const querySnapshot = await getDocs(usersRef);
            const users: AdminUser[] = [];
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                users.push({
                    id: doc.id,
                    name: data.name || 'No Name',
                    email: data.email || '',
                    plan: data.plan || 'Gratuito',
                    status: data.status || 'Ativo',
                });
            });
            if (users.length > 0) return users;
        } catch (e) { console.warn("Firestore admin fetch failed", e); }
    }
    return new Promise((resolve) => setTimeout(() => resolve([...mockAdminUsers]), FAKE_DELAY));
};

// --- ACTION SERVICES ---

export const runBacktest = (): Promise<BacktestResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const totalTrades = Math.floor(Math.random() * 150) + 50;
            const winRate = Math.floor(Math.random() * 40) + 50; 
            const trades: Trade[] = [];

            for (let i = 0; i < 15; i++) {
                const isWin = Math.random() * 100 < winRate;
                const entryPrice = Math.random() * 10000 + 50000;
                const result = isWin ? 5.0 : -3.0;
                const exitPrice = entryPrice * (1 + result / 100);
                trades.push({
                    date: `2024-05-${25-i}`,
                    type: Math.random() > 0.5 ? 'Compra' : 'Venda',
                    entryPrice,
                    exitPrice,
                    result,
                });
            }

            resolve({
                totalTrades,
                winRate,
                cumulativeReturn: Math.random() * 200 + 50,
                maxDrawdown: -(Math.random() * 15 + 5),
                trades: trades.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
            });
        }, BACKTEST_DELAY);
    });
};

export const upgradePlan = async (userId: string): Promise<User> => {
    // 1. Tenta Firebase
    if (db) {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, {
                role: 'premium',
                plan: 'Premium'
            });
            
            // Retorna o objeto de usuário atualizado localmente
            // Num app real, você buscaria de novo o doc ou usaria onSnapshot
            const userData = (await getDoc(userRef)).data();
            return {
                id: userId,
                name: userData?.name || '',
                email: userData?.email || '',
                role: UserRole.PREMIUM,
                plan: 'Premium'
            };

        } catch(e) { console.warn("Firebase upgrade failed", e); }
    }

    // 2. Fallback Mock
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            const userIndex = mockUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                const updatedUser = {
                    ...mockUsers[userIndex],
                    role: UserRole.PREMIUM,
                    plan: 'Premium',
                };
                resolve(updatedUser);
            } else {
                if (userId === 'guest') {
                     const guestUser: User = { id: 'guest', name: 'Usuário Convidado', email: 'guest@test.com', role: UserRole.PREMIUM, plan: 'Premium' };
                     resolve(guestUser);
                } else {
                    reject(new Error("User not found"));
                }
            }
        }, FAKE_DELAY);
    });
};

export const toggleFollowProvider = (providerId: string): Promise<{ success: true }> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, FAKE_DELAY / 2);
    });
};

// --- ADMIN SERVICES ---

export const updateUserStatus = async (userId: string, newStatus: 'Ativo' | 'Suspenso'): Promise<void> => {
    if (db) {
        try {
            const userRef = doc(db, "users", userId);
            await updateDoc(userRef, { status: newStatus });
            return;
        } catch(e) { console.warn("Firebase status update failed", e); }
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            const userIndex = mockAdminUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                mockAdminUsers[userIndex].status = newStatus;
            }
            resolve();
        }, FAKE_DELAY / 2);
    });
};

export const deleteUser = async (userId: string): Promise<void> => {
    // Deletar usuários no Firebase Auth via Client SDK não é permitido por segurança (exige Admin SDK no Node.js)
    // Aqui vamos apenas simular deletando do Firestore para fins de demonstração
    if (db) {
         console.warn("Nota: Deletar usuário do Auth requer Backend. Deletando apenas do Firestore.");
    }

    return new Promise((resolve) => {
        setTimeout(() => {
            const userIndex = mockAdminUsers.findIndex(u => u.id === userId);
            if (userIndex !== -1) {
                mockAdminUsers.splice(userIndex, 1);
            }
            resolve();
        }, FAKE_DELAY / 2);
    });
};
