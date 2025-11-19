
import React, { useState, useEffect } from 'react';
import { getSignalProviders, getSignals, toggleFollowProvider } from '../services/api';
import { SignalType, SignalProvider, Signal } from '../types';
import * as Lucide from 'lucide-react';
import AdPlaceholder from './AdPlaceholder';

// Componente Badge de Verificação
const VerifiedBadge: React.FC = () => (
    <span className="bg-blue-500 text-white text-[10px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shrink-0" title="Trader Verificado (>80% de Acerto)">
        <Lucide.BadgeCheck size={12} />
        <span className="font-bold">PRO</span>
    </span>
);

const ProviderCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4 animate-pulse">
        <div className="h-16 w-16 rounded-full bg-gray-700"></div>
        <div className="flex-grow space-y-2">
            <div className="h-5 bg-gray-700 rounded w-1/2"></div>
            <div className="h-3 bg-gray-700 rounded w-full"></div>
        </div>
        <div className="h-10 w-20 bg-gray-700 rounded-md"></div>
    </div>
);

const SignalCardSkeleton: React.FC = () => (
    <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden animate-pulse">
        <div className="p-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-gray-700"></div>
                    <div className="space-y-2">
                        <div className="h-4 bg-gray-700 rounded w-24"></div>
                        <div className="h-3 bg-gray-700 rounded w-16"></div>
                    </div>
                </div>
                <div className="h-6 w-16 bg-gray-700 rounded-full"></div>
            </div>
            <div className="h-4 bg-gray-700 rounded w-full my-4"></div>
            <div className="h-4 bg-gray-700 rounded w-3/4 my-1"></div>
            <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="h-8 bg-gray-700 rounded-md"></div>
                <div className="h-8 bg-gray-700 rounded-md"></div>
                <div className="h-8 bg-gray-700 rounded-md"></div>
            </div>
        </div>
    </div>
);


const ProviderCard: React.FC<{ provider: SignalProvider; isFollowed: boolean; onToggleFollow: (id: string) => void; isFollowing: boolean; }> = ({ provider, isFollowed, onToggleFollow, isFollowing }) => {
    const buttonContent = isFollowing ? (
        <Lucide.Loader size={18} className="animate-spin" />
    ) : isFollowed ? (
        <>
            <Lucide.Check size={16} />
            <span>Seguindo</span>
        </>
    ) : (
        'Seguir'
    );
    
    const isVerified = provider.winRate > 80;

    return (
        <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 flex items-center gap-4 hover:border-primary transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg">
            <div className="relative">
                <img src={provider.avatarUrl} alt={provider.name} className="h-16 w-16 rounded-full border-2 border-gray-700" />
                {isVerified && (
                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-gray-800">
                        <Lucide.BadgeCheck size={14} />
                    </div>
                )}
            </div>
            <div className="flex-grow">
                <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">{provider.name}</h3>
                    {isVerified && <VerifiedBadge />}
                </div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-400 mt-1">
                    <span className="flex items-center gap-1 text-primary"><Lucide.Target size={14} /> {provider.winRate}% Acertos</span>
                    <span className="flex items-center gap-1"><Lucide.Users size={14} /> {provider.followers.toLocaleString()}</span>
                </div>
            </div>
            <button 
                onClick={() => onToggleFollow(provider.id)}
                disabled={isFollowing}
                className={`w-24 flex items-center justify-center gap-2 font-semibold text-xs py-2 px-2 rounded-md transition-colors disabled:opacity-70 disabled:cursor-wait ${isFollowed ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-primary hover:bg-primary-hover text-white'}`}
            >
                {buttonContent}
            </button>
        </div>
    );
};


const SignalCard: React.FC<{ signal: Signal }> = ({ signal }) => {
    const isVerified = signal.provider.winRate > 80;

    return (
        <div className={`bg-gray-800 rounded-lg border border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 ${signal.type === SignalType.BULLISH ? 'border-green-500 hover:shadow-green-500/10' : 'border-red-500 hover:shadow-red-500/10'}`}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <img src={signal.provider.avatarUrl} alt={signal.provider.name} className="h-10 w-10 rounded-full" />
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="font-semibold">{signal.provider.name}</p>
                                {isVerified && <Lucide.BadgeCheck size={16} className="text-blue-500" />}
                            </div>
                            <p className="text-xs text-gray-400">{signal.pair} - {signal.timeframe}</p>
                        </div>
                    </div>
                    <span className={`px-3 py-1 text-xs font-bold rounded-full flex items-center gap-1 ${signal.type === SignalType.BULLISH ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                        {signal.type === SignalType.BULLISH ? <Lucide.TrendingUp size={14}/> : <Lucide.TrendingDown size={14}/>}
                        {signal.type}
                    </span>
                </div>
                
                <p className="text-sm text-gray-200 mb-4 leading-relaxed bg-gray-900/30 p-3 rounded-md border border-gray-700/50">
                    "{signal.justification}"
                </p>

                <div className="grid grid-cols-3 gap-2 text-center text-sm">
                    <div className="bg-gray-700/30 p-2 rounded border border-gray-700">
                        <span className="text-gray-500 block text-[10px] uppercase font-bold">Entrada</span> 
                        <span className="font-mono">${signal.entry}</span>
                    </div>
                    <div className="bg-green-900/20 p-2 rounded border border-green-900/30">
                        <span className="text-green-500/70 block text-[10px] uppercase font-bold">Alvo</span> 
                        <span className="font-mono text-green-400">${signal.target}</span>
                    </div>
                    <div className="bg-red-900/20 p-2 rounded border border-red-900/30">
                        <span className="text-red-500/70 block text-[10px] uppercase font-bold">Stop</span> 
                        <span className="font-mono text-red-400">${signal.stop}</span>
                    </div>
                </div>
            </div>
            {signal.imageUrl && (
                <div className="border-t border-gray-700">
                     <img src={signal.imageUrl} alt="Chart" className="w-full h-auto object-cover max-h-64" />
                </div>
            )}
            <div className="px-4 py-2 bg-gray-900 text-right text-xs text-gray-500 flex items-center justify-end gap-1">
                <Lucide.Clock size={12}/> <span>Postado {signal.timestamp}</span>
            </div>
        </div>
    );
};


const Community: React.FC = () => {
  const [providers, setProviders] = useState<SignalProvider[]>([]);
  const [signals, setSignals] = useState<Signal[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const [loadingSignals, setLoadingSignals] = useState(true);
  const [followedProviders, setFollowedProviders] = useState<Set<string>>(new Set());
  const [loadingFollow, setLoadingFollow] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const ITEMS_PER_PAGE = 5;

  useEffect(() => {
    const fetchProviders = async () => {
      try {
        const providersData = await getSignalProviders();
        setProviders(providersData);
      } catch (error) {
        console.error("Failed to fetch providers:", error);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
    loadSignals(1);
  }, []);

  const loadSignals = async (pageNum: number) => {
      if (pageNum === 1) setLoadingSignals(true);
      else setLoadingMore(true);

      try {
          const response = await getSignals(pageNum, ITEMS_PER_PAGE);
          setSignals(prev => pageNum === 1 ? response.data : [...prev, ...response.data]);
          setHasMore(response.hasMore);
          setPage(pageNum);
      } catch (error) {
          console.error("Failed to fetch signals:", error);
      } finally {
          setLoadingSignals(false);
          setLoadingMore(false);
      }
  };

  const handleLoadMore = () => {
      if (!loadingMore && hasMore) {
          loadSignals(page + 1);
      }
  };

  const handleToggleFollow = async (providerId: string) => {
    setLoadingFollow(providerId);
    try {
      await toggleFollowProvider(providerId);
      setFollowedProviders(prev => {
        const newSet = new Set(prev);
        if (newSet.has(providerId)) {
          newSet.delete(providerId);
        } else {
          newSet.add(providerId);
        }
        return newSet;
      });
    } catch (error) {
        console.error("Failed to toggle follow:", error);
    } finally {
        setLoadingFollow(null);
    }
  };


  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-white">Comunidade Alpha</h1>
        <p className="text-gray-400">Siga traders verificados e copie suas estratégias.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Feed de Sinais */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
               <h2 className="text-2xl font-bold">Sinais em Tempo Real</h2>
               <div className="flex items-center gap-2 text-sm text-gray-400">
                   <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> Ao Vivo
               </div>
          </div>
          
          {loadingSignals && page === 1 ? (
            <>
                <SignalCardSkeleton />
                <SignalCardSkeleton />
            </>
          ) : (
            <>
                <div className="space-y-6">
                    {signals.map((signal, index) => (
                        <React.Fragment key={signal.id}>
                             <SignalCard signal={signal} />
                             {(index + 1) % 4 === 0 && <AdPlaceholder type="feed" />}
                        </React.Fragment>
                    ))}
                </div>

                {hasMore && (
                    <button 
                        onClick={handleLoadMore} 
                        disabled={loadingMore}
                        className="w-full py-3 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg text-gray-300 font-medium transition-colors flex items-center justify-center gap-2"
                    >
                        {loadingMore ? (
                            <><Lucide.Loader className="animate-spin" /> Buscando...</>
                        ) : (
                            <><Lucide.ChevronDown /> Carregar Mais</>
                        )}
                    </button>
                )}
                
                {!hasMore && signals.length > 0 && (
                    <p className="text-center text-gray-500 py-4">Você visualizou todos os sinais recentes.</p>
                )}
            </>
          )}
        </div>

        {/* Ranking Sidebar */}
        <div className="space-y-6">
          <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Lucide.Trophy className="text-yellow-500" /> Top Traders
            </h2>
            <div className="space-y-4">
                {loadingProviders ? (
                    [...Array(4)].map((_, i) => (
                        <div key={i} className="bg-gray-700/30 p-3 rounded-lg flex items-center gap-4 animate-pulse h-16"></div>
                    ))
                ) : (
                    providers
                    .sort((a, b) => b.winRate - a.winRate)
                    .slice(0, 5)
                    .map((provider, index) => (
                        <div key={provider.id} className="flex items-center gap-3 p-2 hover:bg-gray-700 rounded-lg transition-colors">
                            <div className={`font-bold text-lg w-6 text-center ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-gray-600'}`}>
                                #{index + 1}
                            </div>
                            <img src={provider.avatarUrl} alt={provider.name} className="h-10 w-10 rounded-full border border-gray-600" />
                            <div className="flex-grow">
                                <div className="flex items-center gap-1">
                                    <h4 className="font-semibold text-sm">{provider.name}</h4>
                                    {provider.winRate > 80 && <Lucide.BadgeCheck size={12} className="text-blue-500" />}
                                </div>
                                <div className="text-xs text-gray-400">{provider.winRate}% Win Rate</div>
                            </div>
                        </div>
                    ))
                )}
            </div>
          </div>
          
           <h2 className="text-xl font-bold mt-8">Explorar Traders</h2>
           <div className="space-y-3">
              {loadingProviders ? (
                <>
                    <ProviderCardSkeleton/>
                    <ProviderCardSkeleton/>
                </>
              ) : (
                providers.map(provider => (
                    <ProviderCard 
                        key={provider.id} 
                        provider={provider} 
                        isFollowed={followedProviders.has(provider.id)}
                        onToggleFollow={handleToggleFollow}
                        isFollowing={loadingFollow === provider.id}
                    />)
                )
              )}
           </div>
           <AdPlaceholder type="sidebar" />
        </div>
      </div>
    </div>
  );
};

export default Community;
