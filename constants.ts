
import { User, UserRole, SignalProvider, Signal, SignalType, AdminUser } from './types';

export const mockUsers: User[] = [
  { id: '1', name: 'Usuário Admin', email: 'admin@cryptocandles.ai', role: UserRole.ADMIN, plan: 'Admin' },
  { id: '2', name: 'Usuário Premium', email: 'premium@test.com', role: UserRole.PREMIUM, plan: 'Premium' },
  { id: '3', name: 'Usuário Gratuito', email: 'free@test.com', role: UserRole.FREE, plan: 'Gratuito' },
];

export const mockSignalProviders: SignalProvider[] = [
    { id: 'sp1', name: 'CryptoWhale', avatarUrl: 'https://picsum.photos/seed/whale/100/100', winRate: 85, followers: 12500, totalSignals: 342 },
    { id: 'sp2', name: 'Bullrun Master', avatarUrl: 'https://picsum.photos/seed/bull/100/100', winRate: 78, followers: 8900, totalSignals: 210 },
    { id: 'sp3', name: 'Altcoin Sniper', avatarUrl: 'https://picsum.photos/seed/sniper/100/100', winRate: 92, followers: 21300, totalSignals: 512 },
    { id: 'sp4', name: 'Satoshi\'s Ghost', avatarUrl: 'https://picsum.photos/seed/ghost/100/100', winRate: 72, followers: 5400, totalSignals: 150 },
];

// Função auxiliar para gerar sinais aleatórios
const generateMockSignals = (count: number): Signal[] => {
    const signals: Signal[] = [];
    const pairs = ['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'ADA/USDT', 'DOGE/USDT', 'XRP/USDT'];
    const timeframes = ['15m', '1H', '4H', '1D'];
    const justifications = [
        'Engolfo de alta no suporte chave.',
        'RSI sobrevendido com divergência.',
        'Rompimento de triângulo ascendente.',
        'Rejeição na média móvel de 200 períodos.',
        'Padrão de bandeira de alta confirmado.',
        'Estrela da noite na resistência.',
        'Cruzamento da morte (Death Cross) iminente.'
    ];

    for (let i = 0; i < count; i++) {
        const provider = mockSignalProviders[Math.floor(Math.random() * mockSignalProviders.length)];
        const type = Math.random() > 0.5 ? SignalType.BULLISH : SignalType.BEARISH;
        const pair = pairs[Math.floor(Math.random() * pairs.length)];
        
        signals.push({
            id: `sig${i + 1}`,
            provider,
            pair,
            type,
            timeframe: timeframes[Math.floor(Math.random() * timeframes.length)],
            entry: (Math.random() * 1000).toFixed(2),
            target: (Math.random() * 1200).toFixed(2),
            stop: (Math.random() * 900).toFixed(2),
            justification: justifications[Math.floor(Math.random() * justifications.length)],
            imageUrl: Math.random() > 0.7 ? `https://picsum.photos/seed/chart${i}/400/200` : undefined,
            timestamp: `${Math.floor(Math.random() * 24) + 1} horas atrás`,
        });
    }
    return signals;
};

// Geramos 50 sinais para simular um banco de dados maior
export const mockSignals: Signal[] = generateMockSignals(50);

export const mockAdminUsers: AdminUser[] = [
    { id: 'u1', name: 'Alice', email: 'alice@example.com', plan: 'Premium', status: 'Ativo' as const },
    { id: 'u2', name: 'Bob', email: 'bob@example.com', plan: 'Gratuito', status: 'Ativo' as const },
    { id: 'u3', name: 'Charlie', email: 'charlie@example.com', plan: 'Premium', status: 'Suspenso' as const },
];
