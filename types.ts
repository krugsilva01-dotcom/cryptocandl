
import type { ReactNode } from 'react';

export enum UserRole {
  FREE = 'free',
  PREMIUM = 'premium',
  ADMIN = 'admin',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  plan: string;
}

export interface SignalProvider {
  id: string;
  name:string;
  avatarUrl: string;
  winRate: number;
  followers: number;
  totalSignals: number;
}

export enum SignalType {
    BULLISH = 'ALTA',
    BEARISH = 'BAIXA',
}

export interface Signal {
  id: string;
  provider: SignalProvider;
  pair: string;
  type: SignalType;
  timeframe: string;
  entry: string;
  target: string;
  stop: string;
  justification: string;
  imageUrl?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
    hasMore: boolean;
}

export type Page = 'dashboard' | 'analysis' | 'community' | 'backtesting' | 'admin' | 'pricing';

export interface NavItem {
  name: string;
  page: Page;
  icon: ReactNode;
}

export interface AnalysisResult {
    patterns: string[];
    trend: string;
    indicators: {
        rsi: string;
        volume: string;
    };
    recommendation: 'ALTA' | 'BAIXA' | 'AGUARDAR';
    confidenceScore: number;
    summary: string;
}

export interface AdminUser {
    id: string;
    name: string;
    email: string;
    plan: string;
    status: 'Ativo' | 'Suspenso';
}

export interface Trade {
    date: string;
    type: 'Compra' | 'Venda';
    entryPrice: number;
    exitPrice: number;
    result: number;
}

export interface BacktestResult {
    totalTrades: number;
    winRate: number;
    cumulativeReturn: number;
    maxDrawdown: number;
    trades: Trade[];
}

export interface MarketData {
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    price_change_percentage_24h: number;
    image: string;
}
