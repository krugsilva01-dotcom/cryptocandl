import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { runBacktest } from '../services/api';
import { BacktestResult } from '../types';
import AdPlaceholder from './AdPlaceholder';

const Backtesting: React.FC = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [results, setResults] = useState<BacktestResult | null>(null);
    const [isInitialState, setIsInitialState] = useState(true);

    const handleRunBacktest = async () => {
        setIsLoading(true);
        setResults(null);
        setIsInitialState(false);
        try {
            const data = await runBacktest();
            setResults(data);
        } catch (error) {
            console.error("Backtest failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-7xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-white">Backtesting de Estratégias</h1>
                <p className="text-gray-400">Teste suas estratégias com dados históricos para avaliar o desempenho.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-lg border border-gray-700 h-fit">
                    <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Lucide.Filter size={20} /> Filtros</h2>
                    <form className="space-y-4">
                        <div>
                            <label htmlFor="pair" className="block text-sm font-medium text-gray-300 mb-1">Par de Moedas</label>
                            <select id="pair" className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>BTC/USDT</option>
                                <option>ETH/USDT</option>
                                <option>SOL/USDT</option>
                                <option>ADA/USDT</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="period" className="block text-sm font-medium text-gray-300 mb-1">Período</label>
                            <select id="period" className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>Últimos 3 meses</option>
                                <option>Últimos 6 meses</option>
                                <option>Último ano</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="strategy" className="block text-sm font-medium text-gray-300 mb-1">Estratégia</label>
                            <select id="strategy" className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary">
                                <option>Cruzamento de EMAs (21/50) + RSI</option>
                                <option>Engolfo de Alta/Baixa</option>
                                <option>Martelo com Volume</option>
                            </select>
                        </div>
                        <div className="flex gap-4">
                            <div>
                                <label htmlFor="takeProfit" className="block text-sm font-medium text-gray-300 mb-1">Alvo de Lucro (%)</label>
                                <input id="takeProfit" type="number" defaultValue="5" className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                             <div>
                                <label htmlFor="stopLoss" className="block text-sm font-medium text-gray-300 mb-1">Stop Loss (%)</label>
                                <input id="stopLoss" type="number" defaultValue="3" className="w-full py-2 px-3 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-primary" />
                            </div>
                        </div>
                         <button type="button" onClick={handleRunBacktest} disabled={isLoading} className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md transition-colors disabled:bg-gray-600 disabled:cursor-not-allowed">
                            {isLoading ? <><Lucide.Loader className="animate-spin" /> Processando...</> : <><Lucide.Play size={18} /> Iniciar Backtest</>}
                        </button>
                    </form>
                </div>
                
                {/* Results Panel */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-lg border border-gray-700 min-h-[500px] flex flex-col">
                    <h2 className="text-xl font-bold mb-4">Resultados</h2>
                    {isInitialState && (
                        <div className="flex-grow flex flex-col items-center justify-center text-gray-500">
                           <Lucide.History size={48} className="mb-4" />
                           <p className="font-semibold">Seus resultados aparecerão aqui.</p>
                           <p className="text-sm">Configure os filtros e inicie um backtest para começar.</p>
                        </div>
                    )}
                    {isLoading && (
                         <div className="flex-grow flex flex-col items-center justify-center text-gray-400">
                            <Lucide.Loader className="animate-spin h-12 w-12 mb-4" />
                            <p>Executando simulação histórica...</p>
                         </div>
                    )}
                    {results && !isLoading && (
                        <div className="animate-fade-in">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                                <StatCard icon={<Lucide.BarChart />} title="Total de Operações" value={results.totalTrades} />
                                <StatCard icon={<Lucide.Percent />} title="Taxa de Acerto" value={`${results.winRate}%`} positive />
                                <StatCard icon={<Lucide.TrendingUp />} title="Retorno Acumulado" value={`+${results.cumulativeReturn.toFixed(2)}%`} positive />
                                <StatCard icon={<Lucide.TrendingDown />} title="Rebaixamento Máximo" value={`${results.maxDrawdown.toFixed(2)}%`} positive={false} />
                            </div>

                            <h3 className="text-lg font-bold mb-2">Lista de Operações</h3>
                            <div className="overflow-x-auto max-h-80 relative">
                                <table className="w-full text-sm text-left text-gray-300">
                                    <thead className="text-xs text-gray-400 uppercase bg-gray-700 sticky top-0">
                                        <tr>
                                            <th scope="col" className="px-4 py-3">Data</th>
                                            <th scope="col" className="px-4 py-3">Tipo</th>
                                            <th scope="col" className="px-4 py-3">Preço de Entrada</th>
                                            <th scope="col" className="px-4 py-3">Preço de Saída</th>
                                            <th scope="col" className="px-4 py-3">Resultado (%)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results.trades.slice(0, 10).map((trade, i) => (
                                            <tr key={i} className="border-b border-gray-700 hover:bg-gray-700/50">
                                                <td className="px-4 py-2">{trade.date}</td>
                                                <td className="px-4 py-2"><span className={trade.type === 'Compra' ? 'text-cyan-400' : 'text-orange-400'}>{trade.type}</span></td>
                                                <td className="px-4 py-2">${trade.entryPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                <td className="px-4 py-2">${trade.exitPrice.toLocaleString(undefined, {minimumFractionDigits: 2})}</td>
                                                <td className={`px-4 py-2 font-semibold ${trade.result > 0 ? 'text-success' : 'text-danger'}`}>{trade.result.toFixed(2)}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <AdPlaceholder type="banner" />
        </div>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    positive?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, positive }) => (
     <div className="bg-gray-700/50 p-4 rounded-md text-center">
        <div className={`mx-auto h-8 w-8 mb-2 flex items-center justify-center ${positive === undefined ? 'text-primary' : positive ? 'text-success' : 'text-danger'}`}>{icon}</div>
        <p className="text-sm text-gray-400">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
    </div>
);

export default Backtesting;
