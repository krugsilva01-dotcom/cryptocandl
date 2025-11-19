
import React, { useState, useEffect } from 'react';
import { getSignals } from '../services/api';
import { getMarketPrices } from '../services/marketService';
import { Signal, SignalType, MarketData } from '../types';
import * as Lucide from 'lucide-react';
import AdPlaceholder from './AdPlaceholder';
import RealTimeChart from './RealTimeChart';

const SignalSkeleton: React.FC = () => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-start gap-4 animate-pulse">
        <div className="flex-shrink-0">
            <div className="h-12 w-12 rounded-full bg-gray-700"></div>
        </div>
        <div className="flex-grow">
            <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-gray-700 rounded w-1/2 mt-1"></div>
        </div>
    </div>
);

// Componente Visual do Índice de Medo e Ganância
const FearAndGreedGauge: React.FC = () => {
    // Simulação de valor (em produção viria de uma API)
    const value = 65; // Ganância
    const rotation = (value / 100) * 180 - 90; // Mapeia 0-100 para -90 a 90 graus

    let status = "Neutro";
    let colorClass = "text-yellow-400";
    if (value < 25) { status = "Medo Extremo"; colorClass = "text-red-500"; }
    else if (value < 45) { status = "Medo"; colorClass = "text-orange-400"; }
    else if (value > 55 && value < 75) { status = "Ganância"; colorClass = "text-green-400"; }
    else if (value >= 75) { status = "Ganância Extrema"; colorClass = "text-green-500"; }

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 h-full flex flex-col items-center justify-center relative overflow-hidden">
            <div className="absolute top-2 right-2 opacity-20">
                <Lucide.Gauge size={48} />
            </div>
            <h3 className="font-bold text-gray-300 mb-4 self-start">Sentimento do Mercado</h3>
            
            <div className="relative w-48 h-24 overflow-hidden mb-2">
                <div className="absolute top-0 left-0 w-full h-full bg-gray-700 rounded-t-full"></div>
                <div 
                    className="absolute top-0 left-0 w-full h-full rounded-t-full origin-bottom transition-transform duration-1000 ease-out"
                    style={{ 
                        background: 'conic-gradient(from 180deg at 50% 100%, #ef4444 0deg, #eab308 90deg, #22c55e 180deg)',
                        transform: 'rotate(0deg)' // O gradiente é o background estático
                    }}
                ></div>
                 {/* Máscara para criar o arco */}
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-32 h-16 bg-gray-800 rounded-t-full"></div>
                
                {/* Ponteiro */}
                <div 
                    className="absolute bottom-0 left-1/2 w-1 h-20 bg-white origin-bottom transform transition-transform duration-1000"
                    style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
                ></div>
            </div>

            <div className="text-center z-10">
                <div className="text-3xl font-bold text-white">{value}</div>
                <div className={`text-sm font-bold uppercase tracking-wider ${colorClass}`}>{status}</div>
            </div>
            <p className="text-xs text-gray-500 mt-4 text-center">Atualizado agora</p>
        </div>
    );
};

const Dashboard: React.FC = () => {
  const [signals, setSignals] = useState<Signal[]>([]);
  const [marketData, setMarketData] = useState<MarketData[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMoreSignals, setLoadingMoreSignals] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedSymbol, setSelectedSymbol] = useState('BTCUSDT');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [signalsResponse, marketDataRes] = await Promise.all([
            getSignals(1, 5),
            getMarketPrices()
        ]);
        setSignals(signalsResponse.data);
        setHasMore(signalsResponse.hasMore);
        setMarketData(marketDataRes);
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    
    const interval = setInterval(() => {
        getMarketPrices().then(data => setMarketData(data));
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const handleLoadMore = async () => {
      setLoadingMoreSignals(true);
      try {
          const nextPage = page + 1;
          const response = await getSignals(nextPage, 5);
          setSignals(prev => [...prev, ...response.data]);
          setPage(nextPage);
          setHasMore(response.hasMore);
      } catch (error) {
          console.error("Failed to load more signals", error);
      } finally {
          setLoadingMoreSignals(false);
      }
  };

  const getBinanceSymbol = (coinSymbol: string) => {
      const map: Record<string, string> = {
          'btc': 'BTCUSDT',
          'eth': 'ETHUSDT',
          'sol': 'SOLUSDT',
          'ada': 'ADAUSDT',
          'doge': 'DOGEUSDT',
          'xrp': 'XRPUSDT',
          'dot': 'DOTUSDT',
          'matic': 'MATICUSDT'
      };
      return map[coinSymbol.toLowerCase()] || 'BTCUSDT';
  };

  const handleCoinClick = (coinSymbol: string) => {
      const binanceSymbol = getBinanceSymbol(coinSymbol);
      setSelectedSymbol(binanceSymbol);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Painel Principal</h1>
        <p className="text-gray-400">Resumo do mercado e inteligência emocional.</p>
      </div>

      {/* Market Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loading && marketData.length === 0 ? (
             [...Array(4)].map((_, i) => (
                <div key={i} className="bg-gray-800 p-6 rounded-xl border border-gray-700 h-32 animate-pulse"></div>
             ))
        ) : (
            marketData.slice(0, 4).map((coin) => (
            <div 
                key={coin.id} 
                onClick={() => handleCoinClick(coin.symbol)}
                className="group bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg hover:border-primary hover:shadow-primary/20 transform hover:-translate-y-1 transition-all duration-300 animate-pulse-glow-green cursor-pointer"
            >
                <div className="flex justify-between items-start">
                <div className="flex flex-col">
                     <span className="text-gray-400 text-xs uppercase font-bold">{coin.symbol}/USD</span>
                    <p className="text-lg font-bold">{coin.name}</p>
                    <p className={`text-2xl font-semibold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    ${coin.current_price.toLocaleString()}
                    </p>
                </div>
                {coin.price_change_percentage_24h >= 0 ? <Lucide.ArrowUpRight className="text-success" /> : <Lucide.ArrowDownRight className="text-danger" />}
                </div>
                <p className={`text-sm font-semibold mt-2 ${coin.price_change_percentage_24h >= 0 ? 'text-success' : 'text-danger'}`}>
                {coin.price_change_percentage_24h >= 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(2)}% (24h)
                </p>
            </div>
            ))
        )}
      </div>

      {/* Chart & Highlights & Fear/Greed */}
      <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Análise Técnica & Sentimento</h2>
            <div className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full border border-gray-700">
                Par Selecionado: <span className="text-primary font-bold">{selectedSymbol}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
               {/* Chart Area */}
               <div className="lg:col-span-3">
                   <RealTimeChart symbol={selectedSymbol} />
               </div>
               
               {/* Sidebar with Highlights and Sentiment */}
               <div className="lg:col-span-1 flex flex-col gap-6">
                   {/* Fear & Greed Widget */}
                   <div className="h-64">
                       <FearAndGreedGauge />
                   </div>

                   {/* Market List */}
                   <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex-grow flex flex-col">
                       <h3 className="font-bold mb-4 text-gray-300">Destaques</h3>
                       <div className="space-y-2 overflow-y-auto max-h-[250px] pr-1 custom-scrollbar">
                           {marketData.map(coin => {
                               const coinBinanceSymbol = getBinanceSymbol(coin.symbol);
                               const isSelected = coinBinanceSymbol === selectedSymbol;
                               return (
                               <div 
                                    key={coin.id} 
                                    onClick={() => handleCoinClick(coin.symbol)}
                                    className={`flex justify-between items-center p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                        isSelected 
                                        ? 'bg-primary/20 border border-primary/50 shadow-lg shadow-primary/10' 
                                        : 'hover:bg-gray-700 border border-transparent'
                                    }`}
                               >
                                   <div className="flex items-center gap-3">
                                       <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
                                       <div className="flex flex-col">
                                            <span className="uppercase font-bold text-xs">{coin.symbol}</span>
                                            <span className="text-[10px] text-gray-400">{coin.name}</span>
                                       </div>
                                   </div>
                                   <div className={`text-xs font-bold ${coin.price_change_percentage_24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                       {coin.price_change_percentage_24h > 0 ? '+' : ''}{coin.price_change_percentage_24h.toFixed(1)}%
                                   </div>
                               </div>
                           )})}
                       </div>
                   </div>
               </div>
          </div>
      </div>

      {/* Ad Banner */}
      <AdPlaceholder type="banner" />

      {/* Recent Signals */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-4">Sinais Recentes da Comunidade</h2>
          <div className="space-y-4">
            {loading ? (
                <>
                    <SignalSkeleton />
                    <SignalSkeleton />
                </>
            ) : (
                <>
                    {signals.map((signal) => (
                        <div key={signal.id} className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex flex-col sm:flex-row items-start gap-4 hover:bg-gray-700/50 transition-colors duration-200">
                            <div className="flex-shrink-0">
                            <img src={signal.provider.avatarUrl} alt={signal.provider.name} className="h-12 w-12 rounded-full" />
                            </div>
                            <div className="flex-grow">
                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-2">
                                    <p className="font-semibold">{signal.provider.name}</p>
                                    {/* Verified Badge Logic */}
                                    {signal.provider.winRate > 80 && (
                                        <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5" title="Trader Verificado">
                                            <Lucide.BadgeCheck size={10} /> PRO
                                        </span>
                                    )}
                                </div>
                                <span className={`px-3 py-1 text-xs font-bold rounded-full ${signal.type === SignalType.BULLISH ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                {signal.type}
                                </span>
                            </div>
                            <p className="text-xs text-gray-400 mt-0.5">em {signal.pair}</p>
                            <p className="text-sm text-gray-300 mt-2">{signal.justification}</p>
                            <div className="flex items-center text-xs text-gray-400 mt-3 gap-4 bg-gray-900/30 p-2 rounded">
                                <span className="font-mono text-green-400">Alvo: ${signal.target}</span>
                                <span className="font-mono text-red-400">Stop: ${signal.stop}</span>
                            </div>
                            </div>
                        </div>
                    ))}
                    {hasMore && (
                        <button 
                            onClick={handleLoadMore}
                            disabled={loadingMoreSignals}
                            className="w-full py-2 bg-gray-800 hover:bg-gray-700 border border-gray-600 text-sm text-gray-300 rounded-md transition-colors flex items-center justify-center gap-2"
                        >
                            {loadingMoreSignals ? <Lucide.Loader size={14} className="animate-spin" /> : <Lucide.ChevronDown size={14} />}
                            Carregar mais sinais
                        </button>
                    )}
                </>
            )}
          </div>
        </div>
        
        {/* Favorites */}
        <div>
          <h2 className="text-2xl font-bold mb-4">Meus Favoritos</h2>
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 space-y-3">
             {['BTC/USDT', 'ETH/USDT', 'SOL/USDT', 'DOGE/USDT'].map(pair => (
                <div 
                    key={pair} 
                    onClick={() => setSelectedSymbol(pair.replace('/', ''))}
                    className="flex justify-between items-center p-2 rounded hover:bg-gray-700/50 transition-colors duration-200 cursor-pointer group"
                >
                    <div>
                        <p className="font-semibold group-hover:text-primary transition-colors">{pair.split('/')[0]}</p>
                        <p className="text-xs text-gray-400">{pair.split('/')[1]}</p>
                    </div>
                    <Lucide.Star size={18} className="text-yellow-400 cursor-pointer" />
                </div>
             ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
