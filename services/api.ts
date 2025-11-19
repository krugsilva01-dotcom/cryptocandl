import { mockUsers, mockSignalProviders, mockSignals, mockAdminUsers } from '../constants';
import { User, Signal, SignalProvider, UserRole, AdminUser, BacktestResult, Trade, PaginatedResponse } from '../types';
import { supabase } from './supabaseClient';

// Simula a latência da rede para o modo Mock
const FAKE_DELAY = 800;
const BACKTEST_DELAY = 2000;

// --- AUTH SERVICES ---

export const login = async (email: string, password?: string): Promise<User> => {
    // 1. Tenta Login Real (Supabase Auth)
    if (supabase && password) {
        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (authError) throw authError;

            if (authData.user) {
                // Busca os dados do perfil público (criado pelo Trigger)
                const { data: userData, error: userError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', authData.user.id)
                    .single();

                if (userData) {
                    return {
                        id: userData.id,
                        name: userData.name,
                        email: userData.email,
                        role: userData.role as UserRole,
                        plan: userData.plan
                    };
                }
            }
        } catch (e) {
            console.warn("Supabase login failed, falling back to mock if possible", e);
        }
    }

    // 2. Fallback para Mock (Demonstração)
    return new Promise((resolve) => {
        setTimeout(() => {
            const user = mockUsers.find(u => u.email === email);
            if (user) {
                resolve(user);
            } else {
                // Se não achar no mock, cria um guest temporário
                const guestUser: User = { id: 'guest', name: 'Usuário Convidado', email, role: UserRole.FREE, plan: 'Gratuito' };
                resolve(guestUser);
            }
        }, FAKE_DELAY);
    });
};

export const register = async (email: string, password: string, name: string): Promise<User> => {
    // 1. Tenta Registro Real (Supabase Auth)
    if (supabase) {
        try {
            // IMPORTANTE: Passamos o 'name' dentro de options.data
            // Isso permite que o Trigger 'handle_new_user' no SQL pegue esse nome e salve na tabela public.users
            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        name: name 
                    }
                }
            });

            if (error) throw error;

            if (data.user) {
                // Retornamos o objeto de usuário formatado
                 return {
                    id: data.user.id,
                    name: name,
                    email: email,
                    role: UserRole.FREE,
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
    // 1. Tenta Supabase
    if (supabase) {
        try {
            await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: window.location.origin + '/update-password',
            });
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
                        avatarUrl: s.signal_providers?.avatar_url || 'https://picsum.photos/100',
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

export const getSignalProviders = async (): Promise<SignalProvider[]> => {
    if (supabase) {
        try {
            const { data, error } = await supabase.from('signal_providers').select('*');
            if (!error && data) {
                return data.map((p: any) => ({
                    id: p.id,
                    name: p.name,
                    avatarUrl: p.avatar_url || 'https://picsum.photos/100',
                    winRate: p.win_rate,
                    followers: p.followers,
                    totalSignals: p.total_signals
                }));
            }
        } catch(e) { console.warn("Fetch providers failed", e); }
    }
    return new Promise((resolve) => setTimeout(() => resolve(mockSignalProviders), FAKE_DELAY));
};

export const getAdminUsers = async (): Promise<AdminUser[]> => {
    if (supabase) {
        try {
            const { data, error } = await supabase.from('users').select('*');
            if (!error && data) {
                return data.map((u: any) => ({
                    id: u.id,
                    name: u.name || 'No Name',
                    email: u.email || '',
                    plan: u.plan,
                    status: u.status as 'Ativo' | 'Suspenso',
                    joinedAt: new Date(u.created_at).toLocaleDateString()
                }));
            }
        } catch(e) { console.warn("Fetch admin users failed", e); }
    }
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

export const upgradePlan = async (userId: string): Promise<User> => {
    // 1. Tenta Supabase
    if (supabase) {
        try {
            const { data, error } = await supabase
                .from('users')
                .update({ role: 'premium', plan: 'Premium' })
                .eq('id', userId)
                .select()
                .single();
            
            if (!error && data) {
                return {
                    id: data.id,
                    name: data.name,
                    email: data.email,
                    role: data.role as UserRole,
                    plan: data.plan
                };
            }
        } catch(e) { console.warn("Supabase upgrade failed", e); }
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
    console.log(`Simulating follow/unfollow for provider: ${providerId}`);
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({ success: true });
        }, FAKE_DELAY / 2);
    });
};

// --- ADMIN SERVICES ---

export const updateUserStatus = async (userId: string, newStatus: 'Ativo' | 'Suspenso'): Promise<void> => {
    if (supabase) {
        try {
            await supabase.from('users').update({ status: newStatus }).eq('id', userId);
            return;
        } catch(e) { console.warn("Supabase status update failed", e); }
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
    if (supabase) {
        try {
            // Nota: Deletar do public.users não deleta do auth.users automaticamente sem uma Function Cloud
            // Mas para este MVP deletamos o perfil público
            await supabase.from('users').delete().eq('id', userId);
            return;
        } catch(e) { console.warn("Supabase delete failed", e); }
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