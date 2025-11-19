
import React, { useEffect, useRef, useState } from 'react';
import { createChart, ColorType, CrosshairMode } from 'lightweight-charts';
import { getBinanceKlines, KlineData } from '../services/marketService';
import * as Lucide from 'lucide-react';

interface RealTimeChartProps {
    symbol?: string;
}

const RealTimeChart: React.FC<RealTimeChartProps> = ({ symbol = 'BTCUSDT' }) => {
    const chartContainerRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPrice, setCurrentPrice] = useState<number | null>(null);
    const [priceChange, setPriceChange] = useState<number>(0);

    useEffect(() => {
        if (!chartContainerRef.current) return;

        const handleResize = () => {
            if (chart) {
                chart.applyOptions({ width: chartContainerRef.current!.clientWidth });
            }
        };

        // Configuração Visual "Premium"
        const chart = createChart(chartContainerRef.current, {
            layout: {
                background: { 
                    type: ColorType.VerticalGradient, 
                    topColor: '#0f172a', // Slate 900 (Mais escuro no topo)
                    bottomColor: '#1e293b', // Slate 800 (Mais claro embaixo)
                },
                textColor: '#94a3b8',
            },
            grid: {
                vertLines: { color: '#334155' }, // Slate 700 (Linhas sutis)
                horzLines: { color: '#334155' },
            },
            width: chartContainerRef.current.clientWidth,
            height: 500, // Aumentado de 350 para 500px
            timeScale: {
                timeVisible: true,
                secondsVisible: false,
                borderColor: '#475569',
            },
            rightPriceScale: {
                borderColor: '#475569',
            },
            crosshair: {
                mode: CrosshairMode.Normal,
            },
            // Marca d'água gigante no fundo
            watermark: {
                visible: true,
                fontSize: 80,
                horzAlign: 'center',
                vertAlign: 'center',
                color: 'rgba(255, 255, 255, 0.05)',
                text: symbol,
            },
        });

        const candlestickSeries = chart.addCandlestickSeries({
            // Cores Neon para destaque
            upColor: '#22c55e', // Verde Brilhante
            downColor: '#ef4444', // Vermelho Vivo
            borderVisible: false,
            wickUpColor: '#4ade80', // Verde mais claro no pavio
            wickDownColor: '#f87171', // Vermelho mais claro no pavio
        });

        const loadData = async () => {
            setIsLoading(true);
            const data = await getBinanceKlines(symbol, '1h');
            // FIX: Cast data to any to resolve TypeScript error regarding compatible types for Lightweight Charts
            candlestickSeries.setData(data as any);
            
            if(data.length > 0) {
                const lastClose = data[data.length - 1].close;
                const openPrice = data[0].open; // Simplificação para mudança no período carregado
                setCurrentPrice(lastClose);
                setPriceChange(((lastClose - openPrice) / openPrice) * 100);
            }
            
            setIsLoading(false);
        };

        loadData();

        window.addEventListener('resize', handleResize);

        // Cleanup
        return () => {
            window.removeEventListener('resize', handleResize);
            chart.remove();
        };
    }, [symbol]);

    return (
        <div className="bg-gray-800 p-1 rounded-xl border border-gray-700 shadow-2xl overflow-hidden">
            {/* Header do Gráfico estilizado */}
            <div className="flex justify-between items-center px-4 py-3 bg-gray-900/50 border-b border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="bg-gray-700 p-2 rounded-lg">
                        <Lucide.CandlestickChart className="text-primary" size={24} />
                    </div>
                    <div>
                        <h3 className="font-bold text-xl text-white tracking-wide">{symbol}</h3>
                        <span className="text-xs text-gray-400 font-medium bg-gray-800 px-2 py-0.5 rounded border border-gray-600">1 Hora</span>
                    </div>
                </div>
                
                {currentPrice && (
                    <div className="text-right">
                        <div className="text-2xl font-mono font-bold text-white tracking-tight">
                            ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className={`text-sm font-bold flex items-center justify-end gap-1 ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {priceChange >= 0 ? <Lucide.TrendingUp size={14} /> : <Lucide.TrendingDown size={14} />}
                            {priceChange.toFixed(2)}%
                        </div>
                    </div>
                )}
            </div>
            
            <div className="relative w-full h-[500px]">
                {isLoading && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900 z-10">
                        <Lucide.Loader className="animate-spin text-primary h-12 w-12 mb-4" />
                        <p className="text-gray-400 text-sm animate-pulse">Carregando dados da Binance...</p>
                    </div>
                )}
                <div ref={chartContainerRef} className="w-full h-full" />
            </div>
        </div>
    );
};

export default RealTimeChart;
