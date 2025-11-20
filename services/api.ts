
import { mockUsers, mockSignalProviders, mockSignals, mockAdminUsers } from '../constants';
import { User, Signal, SignalProvider, UserRole, AdminUser, BacktestResult, Trade, PaginatedResponse } from '../types';

// Simula a latência da rede para o modo Mock
const FAKE_DELAY = 800;
const BACKTEST_DELAY = 2000;

// --- AUTH SERVICES ---

export const login = async (email: string, password?: string): Promise<User> => {
    
    // --- ADMIN BACKDOOR REQUESTED ---
    // Verifica credenciais de admin específicas antes de qualquer coisa
    if (email === 'admkrug' && password === '122436') {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    id: 'admin_master',
                    name: 'Administrador Krug',
                    email: 'admkrug@cryptocandles.ai',
                    role: UserRole.ADMIN,
                    plan: 'Admin Master'
                });
            }, FAKE_DELAY);
        });
    }
    // --------------------------------

    // Fallback para Mock (Demonstração)
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
    // Fallback Mock
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
    // Fallback para Mock
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
    // Fallback Mock
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
                if (userId === 'guest' || userId === 'admin_master') {
                     const guestUser: User = { id: userId, name: userId === 'admin_master' ? 'Admin Krug' : 'Usuário Convidado', email: 'test@test.com', role: UserRole.PREMIUM, plan: 'Premium' };
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
