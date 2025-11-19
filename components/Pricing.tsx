
import React, { useState } from 'react';
import * as Lucide from 'lucide-react';
import { User, UserRole } from '../types';

interface PricingProps {
    user: User | null;
    onUpgrade: () => Promise<void>;
}

const Pricing: React.FC<PricingProps> = ({ user, onUpgrade }) => {
    const [paymentStatus, setPaymentStatus] = useState<'idle' | 'redirecting' | 'processing' | 'success'>('idle');

    const handleUpgradeClick = async () => {
        // 1. Simula redirecionamento para Gateway (Stripe/MercadoPago)
        setPaymentStatus('redirecting');
        await new Promise(resolve => setTimeout(resolve, 1500));

        // 2. Simula processamento do pagamento
        setPaymentStatus('processing');
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 3. Sucesso
        setPaymentStatus('success');
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // 4. Efetiva o upgrade
        await onUpgrade();
        setPaymentStatus('idle');
    };

    const freeFeatures = [
        { text: "Acesso ao par BTC/USDT", included: true },
        { text: "Alertas limitados", included: true },
        { text: "2 análises por print/dia", included: true },
        { text: "Backtesting simplificado", included: true },
        { text: "Todos os pares liberados", included: false },
        { text: "Sinais antecipados", included: false },
        { text: "Backtesting completo", included: false },
        { text: "Estratégias avançadas", included: false },
        { text: "Acesso total à comunidade", included: false },
    ];
    
    const premiumFeatures = freeFeatures.map(f => ({...f, included: true}));

    const isCurrentUserFree = user?.role === UserRole.FREE;
    const isCurrentUserPremium = user?.role === UserRole.PREMIUM;

    const getButtonContent = () => {
        switch (paymentStatus) {
            case 'redirecting':
                return (
                    <>
                        <Lucide.ExternalLink className="animate-bounce mr-2" size={20} />
                        <span>Conectando ao Stripe...</span>
                    </>
                );
            case 'processing':
                return (
                    <>
                        <Lucide.Loader className="animate-spin mr-2" size={20} />
                        <span>Processando Pagamento...</span>
                    </>
                );
            case 'success':
                return (
                    <>
                        <Lucide.CheckCircle className="mr-2" size={20} />
                        <span>Pagamento Aprovado!</span>
                    </>
                );
            default:
                return isCurrentUserPremium ? 'Você já é Premium' : 'Obter Acesso Vitalício';
        }
    };

    return (
        <div className="max-w-4xl mx-auto py-8 animate-fade-in">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-white sm:text-5xl">
                    Invista uma vez, lucre para sempre
                </h1>
                <p className="mt-4 text-xl text-gray-400">
                    Sem mensalidades. Tenha acesso vitalício ao CryptoCandles AI.
                </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Free Plan */}
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 flex flex-col hover:border-gray-500 transition-colors duration-300">
                    <h3 className="text-2xl font-semibold">Visitante</h3>
                    <p className="mt-2 text-gray-400">Para testar o poder da IA.</p>
                    <div className="mt-6">
                        <span className="text-4xl font-bold">Grátis</span>
                        <span className="text-lg font-medium text-gray-400"> /sempre</span>
                    </div>
                    <ul className="mt-8 space-y-4 text-sm flex-grow">
                        {freeFeatures.map((feature, i) => (
                           <li key={i} className={`flex items-center gap-3 ${feature.included ? '' : 'text-gray-500'}`}>
                                {feature.included ? <Lucide.Check className="h-5 w-5 text-green-500" /> : <Lucide.X className="h-5 w-5 text-red-500" />}
                                <span>{feature.text}</span>
                           </li>
                        ))}
                    </ul>
                    <button 
                        disabled={isCurrentUserFree}
                        className="mt-8 w-full py-3 px-6 border border-transparent rounded-md text-center text-base font-medium bg-gray-700 hover:bg-gray-600 text-white disabled:opacity-70 disabled:cursor-not-allowed transition-colors"
                    >
                        {isCurrentUserFree ? 'Seu Plano Atual' : 'Plano Gratuito'}
                    </button>
                </div>

                {/* Premium Plan (Lifetime) */}
                <div className="bg-gray-800 border-2 border-primary rounded-2xl p-8 flex flex-col relative shadow-2xl shadow-primary/10 transform hover:-translate-y-1 transition-all duration-300">
                    <div className="absolute top-0 -translate-y-1/2 bg-gradient-to-r from-yellow-500 to-yellow-600 text-white px-4 py-1 text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                        <Lucide.Sparkles size={14} /> OFERTA VITALÍCIA
                    </div>
                    <h3 className="text-2xl font-semibold text-white">Premium PRO</h3>
                    <p className="mt-2 text-primary font-medium">Acesso definitivo a todas as ferramentas.</p>
                    <div className="mt-6">
                        <span className="text-4xl font-bold text-white">R$ 99,90</span>
                        <span className="text-lg font-medium text-green-400 ml-2">Pagamento Único</span>
                    </div>
                     <ul className="mt-8 space-y-4 text-sm flex-grow">
                        {premiumFeatures.map((feature, i) => (
                           <li key={i} className="flex items-center gap-3">
                                <div className="bg-primary/20 p-1 rounded-full">
                                    <Lucide.Check className="h-3 w-3 text-primary" />
                                </div>
                                <span className="text-gray-200">{feature.text}</span>
                           </li>
                        ))}
                    </ul>
                    <button 
                        onClick={handleUpgradeClick}
                        disabled={isCurrentUserPremium || paymentStatus !== 'idle'}
                        className={`mt-8 w-full py-3 px-6 border border-transparent rounded-md text-center text-base font-bold text-white flex items-center justify-center transition-all duration-300 ${
                            paymentStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-hover'
                        } disabled:opacity-80 disabled:cursor-not-allowed shadow-lg hover:shadow-primary/30`}
                    >
                        {getButtonContent()}
                    </button>
                    <p className="text-xs text-center text-gray-400 mt-4 flex items-center justify-center gap-1">
                        <Lucide.Lock size={12} /> Acesso vitalício garantido. Sem taxas ocultas.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Pricing;
