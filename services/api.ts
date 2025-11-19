
import { mockUsers, mockSignalProviders, mockSignals, mockAdminUsers } from '../constants';
import { User, Signal, SignalProvider, UserRole, AdminUser, BacktestResult, Trade, PaginatedResponse } from '../types';
import { supabase } from './supabaseClient';

// Simula a latência da rede
const FAKE_DELAY = 800;
const BACKTEST_DELAY = 2000;

// --- AUTH SERVICES ---

export const login = async (email: string): Promise<User> => {
    // 1. Tenta Login Real (Supabase)
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('email', email)
                .single();

            if (!error && data) {
                return {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role as UserRole,
                    plan: data.plan || (data.role === 'premium' ? 'Premium' : 'Gratuito')
                };
            }
        } catch (e) {
            console.warn("Supabase login failed, falling back to mock", e);
        }
    }

    // 2. Fallback para Mock
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
    // 1. Tenta Registro Real (Supabase)
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('users')
                .insert([{ email, password_hash: password, name, role: 'free', plan: 'Gratuito' }])
                .select()
                .single();

            if (!error && data) {
                 return {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: UserRole.FREE, // Padrão Free
                    plan: 'Gratuito'
                };
            }
        } catch (e) {
             console.warn("Supabase register failed", e);
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
            // Adiciona ao mock para a sessão atual (e pro admin ver)
            mockUsers.push(newUser);
            
            // Adiciona ao mock do Admin também para controle imediato
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
    // 1. Tenta Supabase
    if (supabase) {
        try {
            await supabase.auth.resetPasswordForEmail(email);
            return;
        } catch (e) {
            console.warn("Supabase recovery failed", e);
        }
    }

    // 2. Fallback Mock
    return new Promise((resolve) => {
        setTimeout(() => {
            console.log(`Recovery email sent to ${email}`);
            resolve();
        }, FAKE_DELAY);
    });
};

// --- DATA FETCHING SERVICES ---

export const getSignals = async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Signal>> => {
    // 1. Tenta Buscar do Supabase
    if (supabase) {
        try {
            const from = (page - 1) * limit;
            const to = from + limit - 1;
            
            const { data, error, count } = await supabase
                .from('signals')
                .select('*, signal_providers(name, avatar_url, win_rate)', { count: 'exact' })
                .order('created_at', { ascending: false })
                .range(from, to);

            if (!error && data) {
                 const signals: Signal[] = data.map((s: any) => ({
                    id: s.id,
                    provider: {
                        id: s.signal_provider_id,
                        name: s.signal_providers?.name || 'Unknown',
                        avatarUrl: s.signal_providers?.avatar_url || '',
                        winRate: s.signal_providers?.win_rate || 0,
                        followers: 0,
                        totalSignals: 0
                    },
                    pair: s.pair,
                    type: s.type,
                    timeframe: s.timeframe,
                    entry: s.entry_price,
                    target: s.target_price,
                    stop: s.stop_loss,
                    justification: s.justification,
                    imageUrl: s.image_url,
                    timestamp: new Date(s.created_at).toLocaleDateString()
                 }));

                 return {
                    data: signals,
                    total: count || 0,
                    page,
                    limit,
                    hasMore: (to + 1) < (count || 0)
                 };
            }
        } catch (e) {
            console.warn("Supabase fetch failed", e);
        }
    }

    // 2. Fallback para Mock com Paginação
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

export const getSignalProviders = (): Promise<SignalProvider[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(mockSignalProviders), FAKE_DELAY));
};

export const getAdminUsers = (): Promise<AdminUser[]> => {
    return new Promise((resolve) => setTimeout(() => resolve([...mockAdminUsers]), FAKE_DELAY));
};

// --- ACTION SERVICES ---

export const runBacktest = (): Promise<BacktestResult> => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const totalTrades = Math.floor(Math.random() * 150) + 50;
            const winRate = Math.floor(Math.random() * 40) + 50; // 50% to 90%
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

export const upgradePlan = (userId: string): Promise<User> => {
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
    console.log(`Simulating follow/unfollow for provider: ${providerId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, FAKE_DELAY / 2);
    });
};

// --- ADMIN SERVICES ---

export const updateUserStatus = (userId: string, newStatus: 'Ativo' | 'Suspenso'): Promise<void> => {
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

export const deleteUser = (userId: string): Promise<void> => {
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
