
import React from 'react';
import * as Lucide from 'lucide-react';

interface AdPlaceholderProps {
  type: 'banner' | 'feed' | 'sidebar';
}

const AdPlaceholder: React.FC<AdPlaceholderProps> = ({ type }) => {
  
  // 1. BANNER HORIZONTAL COMPACTO
  // Promoção Interna: Plano Premium
  if (type === 'banner') {
    return (
      <div className="w-full bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 rounded-lg border border-blue-500/30 shadow-lg overflow-hidden group cursor-pointer relative h-20 sm:h-24">
        {/* Animated Crypto Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-20">
             <div className="absolute top-2 right-10 w-16 h-16 bg-yellow-500/20 rounded-full blur-xl animate-pulse"></div>
             <div className="absolute -bottom-4 left-20 w-24 h-24 bg-blue-500/20 rounded-full blur-xl animate-pulse delay-700"></div>
        </div>
        
        <div className="h-full px-4 sm:px-6 flex items-center justify-between relative z-10">
            <div className="flex items-center gap-4">
                {/* Animated Floating Icon */}
                <div className="hidden sm:flex bg-gradient-to-br from-yellow-400 to-yellow-600 p-2.5 rounded-full shadow-lg shadow-yellow-500/30 animate-bounce" style={{ animationDuration: '3s' }}>
                    <Lucide.Crown className="text-white w-5 h-5" />
                </div>
                
                <div className="flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-0.5">
                        <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">Upgrade</span>
                        <h3 className="font-bold text-white text-sm sm:text-lg leading-tight">Sinais Ilimitados & IA Rápida</h3>
                    </div>
                    <p className="text-gray-300 text-xs sm:text-sm truncate max-w-[200px] sm:max-w-md">
                        Pare de perder oportunidades. <span className="text-yellow-400 font-bold">Seja Premium agora.</span>
                    </p>
                </div>
            </div>

            <button className="flex items-center gap-1.5 bg-white text-blue-900 hover:bg-blue-50 font-bold py-1.5 px-4 rounded-full text-xs sm:text-sm transition-transform transform group-hover:scale-105 shadow-md whitespace-nowrap">
                Assinar <Lucide.Zap size={14} className="fill-current" />
            </button>
        </div>
      </div>
    );
  }

  // 2. FEED COMPACTO
  // Promoção Externa: Corretora
  if (type === 'feed') {
    return (
      <div className="bg-gray-800/50 rounded-lg border border-gray-700/50 hover:border-gray-600 hover:bg-gray-800 transition-all cursor-pointer group relative overflow-hidden">
          {/* Pulse Effect Line */}
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 group-hover:animate-pulse"></div>
          
          <div className="p-3 flex items-center gap-3">
              <div className="flex-shrink-0 relative">
                  <div className="w-10 h-10 bg-green-900/30 rounded-lg flex items-center justify-center text-green-400 font-bold border border-green-500/30">
                      <Lucide.TrendingUp size={20} />
                  </div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-800 animate-ping"></div>
                  <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-gray-800"></div>
              </div>
              
              <div className="flex-grow min-w-0">
                  <div className="flex justify-between items-baseline">
                      <h4 className="font-bold text-gray-200 text-sm truncate group-hover:text-green-400 transition-colors">TradeX: Bônus de $50 USDT</h4>
                      <span className="text-[10px] text-gray-500 border border-gray-700 px-1 rounded ml-2">Ad</span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">
                      Crie sua conta e opere Bitcoin com taxa zero.
                  </p>
              </div>
              
              <Lucide.ChevronRight size={16} className="text-gray-600 group-hover:text-white transition-colors" />
          </div>
      </div>
    );
  }

  // 3. SIDEBAR COMPACTO
  // Promoção Externa: Wallet
  if (type === 'sidebar') {
     return (
      <div className="bg-gradient-to-b from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-4 text-center relative overflow-hidden group cursor-pointer">
        <div className="absolute top-0 right-0 w-16 h-16 bg-white/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-150"></div>
        
        <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 bg-gray-700 rounded-lg border border-gray-600 flex items-center justify-center group-hover:border-primary transition-colors relative">
                <Lucide.ShieldCheck className="text-gray-300 group-hover:text-primary transition-colors" size={24} />
                <div className="absolute inset-0 border-2 border-primary/50 rounded-lg animate-pulse-glow-green opacity-0 group-hover:opacity-100"></div>
            </div>
            <div className="text-left">
                <h3 className="font-bold text-white text-sm leading-tight">Proteja suas Criptos</h3>
                <p className="text-[10px] text-gray-400">SafeVault Hardware Wallet</p>
            </div>
        </div>

        <button className="w-full py-1.5 bg-gray-700 hover:bg-primary border border-gray-600 hover:border-primary text-gray-200 hover:text-white rounded-lg font-bold text-xs transition-all flex items-center justify-center gap-2">
            Comprar c/ 20% OFF
        </button>
      </div>
    );
  }

  return null;
};

export default AdPlaceholder;
