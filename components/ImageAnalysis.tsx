
import React, { useState, useCallback, useMemo } from 'react';
import { analyzeChartImage } from '../services/geminiService';
import { User, AnalysisResult, UserRole } from '../types';
import * as Lucide from 'lucide-react';
import AdPlaceholder from './AdPlaceholder';

interface ImageAnalysisProps {
    user: User | null;
}

const ImageAnalysis: React.FC<ImageAnalysisProps> = ({ user }) => {
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [analysisCount, setAnalysisCount] = useState(0);

    const isFreeUser = user?.role === UserRole.FREE;
    const analysesRemaining = useMemo(() => isFreeUser ? 2 - analysisCount : Infinity, [isFreeUser, analysisCount]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    };

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
        const file = event.dataTransfer.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setResult(null);
            setError(null);
        }
    }, []);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        event.stopPropagation();
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
        }
        setPreviewUrl(null);
        setResult(null);
    };

    const handleAnalyze = async () => {
        if (!imageFile) {
            setError("Por favor, selecione uma imagem para analisar.");
            return;
        }

        if (isFreeUser && analysisCount >= 2) {
            setError("Você atingiu o limite de 2 análises diárias para o plano gratuito.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setResult(null);

        try {
            const analysisResult = await analyzeChartImage(imageFile);
            setResult(analysisResult);
            if (isFreeUser) {
                setAnalysisCount(prev => prev + 1);
            }
        } catch (err: any) {
            setError(err.message || "Ocorreu um erro desconhecido.");
        } finally {
            setIsLoading(false);
        }
    };

    const recommendationConfig = {
        ALTA: {
            icon: <Lucide.TrendingUp className="text-success w-8 h-8" />,
            bgColor: "bg-green-500/10",
            textColor: "text-green-400",
            borderColor: "border-green-500",
            gradient: "from-green-900/20 to-gray-800"
        },
        BAIXA: {
            icon: <Lucide.TrendingDown className="text-danger w-8 h-8" />,
            bgColor: "bg-red-500/10",
            textColor: "text-red-400",
            borderColor: "border-red-500",
            gradient: "from-red-900/20 to-gray-800"
        },
        AGUARDAR: {
            icon: <Lucide.HelpCircle className="text-yellow-400 w-8 h-8" />,
            bgColor: "bg-yellow-500/10",
            textColor: "text-yellow-400",
            borderColor: "border-yellow-500",
            gradient: "from-yellow-900/20 to-gray-800"
        },
    };

    const currentRecommendation = result ? recommendationConfig[result.recommendation] : null;

    return (
        <div className="max-w-6xl mx-auto space-y-8 animate-fade-in">
            <div>
                <h1 className="text-3xl font-bold text-white">Análise de Gráfico por IA</h1>
                <p className="text-gray-400">Carregue seu print e deixe nosso Coach IA encontrar as oportunidades.</p>
                {isFreeUser && (
                    <div className="mt-2 text-xs bg-blue-500/10 text-blue-300 px-3 py-1 rounded-full inline-block border border-blue-500/20">
                        Créditos Diários: {analysesRemaining}
                    </div>
                )}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                    {!previewUrl ? (
                        <div
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                            className="relative flex flex-col items-center justify-center w-full h-80 border-2 border-dashed border-gray-600 rounded-xl cursor-pointer bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-300 group"
                        >
                            <div className="text-center p-6">
                                <div className="bg-gray-700/50 p-4 rounded-full inline-block mb-4 group-hover:scale-110 transition-transform">
                                    <Lucide.UploadCloud className="h-10 w-10 text-primary" />
                                </div>
                                <p className="mt-2 text-lg text-gray-300 font-medium">Arraste seu gráfico aqui</p>
                                <p className="text-sm text-gray-500 mt-1">ou clique para navegar nos arquivos</p>
                            </div>
                            <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        </div>
                    ) : (
                        <div className="relative group">
                            <img src={previewUrl} alt="Preview do gráfico" className="w-full h-auto rounded-xl border border-gray-700 shadow-lg" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center">
                                <button onClick={handleRemoveImage} className="p-3 bg-red-600 rounded-full text-white hover:bg-red-700 transition-all transform hover:scale-110 shadow-lg">
                                    <Lucide.Trash2 size={24} />
                                </button>
                            </div>
                        </div>
                    )}
                    <button
                        onClick={handleAnalyze}
                        disabled={!imageFile || isLoading || (isFreeUser && analysesRemaining <= 0)}
                        className="w-full flex items-center justify-center gap-2 py-4 px-4 bg-gradient-to-r from-primary to-primary-hover text-white font-bold text-lg rounded-xl transition-all shadow-lg hover:shadow-primary/30 disabled:bg-none disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed"
                    >
                        {isLoading ? <><Lucide.Loader className="animate-spin" /> Analisando Padrões...</> : <><Lucide.ScanEye /> Analisar Agora</>}
                    </button>
                    {error && <div className="text-red-400 bg-red-500/10 p-4 rounded-xl flex items-center gap-2 border border-red-500/20"><Lucide.FileWarning size={20}/> {error}</div>}
                </div>
                
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-xl min-h-[400px] flex flex-col">
                        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                            <Lucide.Cpu className="text-primary" /> Resultado da Análise
                        </h2>
                        
                        {isLoading && (
                            <div className="flex-grow flex flex-col items-center justify-center text-gray-400 space-y-4">
                                <div className="relative">
                                    <div className="w-16 h-16 border-4 border-gray-600 rounded-full"></div>
                                    <div className="w-16 h-16 border-4 border-primary rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                </div>
                                <p className="animate-pulse">Identificando velas e tendências...</p>
                            </div>
                        )}
                        
                        {result && !isLoading && (
                            <div className="space-y-6 animate-fade-in">
                                {/* Header do Resultado */}
                                <div className={`p-6 rounded-xl border ${currentRecommendation?.borderColor} bg-gradient-to-br ${currentRecommendation?.gradient} relative overflow-hidden`}>
                                    <div className="relative z-10 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-gray-300 font-medium uppercase tracking-wider mb-1">Recomendação</p>
                                            <p className={`text-3xl font-extrabold ${currentRecommendation?.textColor}`}>{result.recommendation}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-sm text-gray-300 font-medium">Confiança</p>
                                            <p className="text-2xl font-bold text-white">{result.confidenceScore}%</p>
                                        </div>
                                    </div>
                                    {/* Ícone de fundo decorativo */}
                                    <div className="absolute -right-4 -bottom-4 opacity-20 transform rotate-12 scale-150">
                                        {currentRecommendation?.icon}
                                    </div>
                                </div>

                                {/* Insight do Coach - O DIFERENCIAL */}
                                <div className="bg-gradient-to-r from-blue-900/30 to-purple-900/30 border border-blue-500/30 p-5 rounded-xl relative">
                                    <div className="absolute -top-3 left-4 bg-gray-800 px-2 py-1 rounded border border-blue-500/30 text-blue-300 text-xs font-bold flex items-center gap-1">
                                        <Lucide.GraduationCap size={14} /> INSIGHT DO COACH
                                    </div>
                                    <p className="text-gray-200 italic leading-relaxed mt-2">
                                        "{result.summary}"
                                    </p>
                                </div>

                                {/* Grid de Detalhes */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700/50">
                                        <h4 className="font-semibold flex items-center gap-2 text-gray-300 mb-2"><Lucide.Search size={16} className="text-primary"/> Padrões</h4>
                                        {result.patterns.length > 0 ? (
                                            <ul className="space-y-1">
                                                {result.patterns.map((p, i) => (
                                                    <li key={i} className="text-gray-400 flex items-start gap-2">
                                                        <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0"></span>
                                                        {p}
                                                    </li>
                                                ))}
                                            </ul>
                                        ) : <p className="text-gray-500 italic">Nenhum padrão claro.</p>}
                                    </div>
                                    
                                    <div className="bg-gray-700/30 p-4 rounded-lg border border-gray-700/50 space-y-3">
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 text-gray-300 mb-1"><Lucide.TrendingUp size={16} className="text-primary"/> Tendência</h4>
                                            <p className="text-gray-400 pl-6">{result.trend}</p>
                                        </div>
                                        <div>
                                            <h4 className="font-semibold flex items-center gap-2 text-gray-300 mb-1"><Lucide.Activity size={16} className="text-primary"/> Indicadores</h4>
                                            <p className="text-gray-500 text-xs pl-6">RSI: <span className="text-gray-300">{result.indicators.rsi}</span></p>
                                            <p className="text-gray-500 text-xs pl-6">Vol: <span className="text-gray-300">{result.indicators.volume}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                        {!result && !isLoading && (
                            <div className="flex flex-col items-center justify-center h-full text-gray-500 py-12">
                               <Lucide.LineChart size={64} className="mb-4 opacity-20" />
                               <p className="text-lg font-medium">Aguardando imagem...</p>
                               <p className="text-sm opacity-60">Os resultados aparecerão aqui.</p>
                            </div>
                        )}
                    </div>
                    <AdPlaceholder type="sidebar" />
                </div>
            </div>
        </div>
    );
};

export default ImageAnalysis;
