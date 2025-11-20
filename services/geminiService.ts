import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

// Initialize Gemini AI
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToGenerativePart = async (file: File) => {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]);
      } else {
        resolve('');
      }
    };
    reader.readAsDataURL(file);
  });
  const data = await base64EncodedDataPromise;
  return {
    inlineData: {
      data,
      mimeType: file.type,
    },
  };
};

export const analyzeChartImage = async (imageFile: File): Promise<AnalysisResult> => {
  try {
    if (!process.env.API_KEY) {
        throw new Error("Chave de API da IA não configurada (API_KEY).");
    }

    const imagePart = await fileToGenerativePart(imageFile);
    const prompt = `
      Você é um analista de criptomoedas especialista em padrões de velas e indicadores técnicos. Sua tarefa é analisar a imagem do gráfico de negociação fornecida.

      Com base APENAS nas informações visuais da imagem, identifique o seguinte:

      1. **Padrões de Candlestick:** Procure por estes padrões específicos:
         - Engolfo de alta/baixa
         - Martelo / Martelo invertido
         - Doji
         - Estrela da manhã / Estrela da noite
         - Três soldados brancos / Três corvos negros
         - Uma sequência de velas de baixa seguida por uma forte vela de alta.
         - Se nenhum padrão específico estiver claro, declare "Nenhum padrão claro".

      2. **Indicadores Técnicos:**
         - **Tendência (baseada em EMAs):** Se Médias Móveis Exponenciais (EMAs) estiverem visíveis, determine se a EMA de curto prazo está acima ou abaixo da EMA de longo prazo. Infira a tendência como 'Alta' ou 'Baixa'. Se não estiverem visíveis, declare "EMAs não visíveis".
         - **RSI:** Se o Índice de Força Relativa (RSI) estiver visível, observe se está sobrevendido (abaixo de 30), sobrecomprado (acima de 70) ou neutro.
         - **Volume:** Observe se as barras de volume estão acima ou abaixo da média, especialmente durante movimentos de preços significativos.

      3. **Análise Geral e Recomendação:**
         - Sintetize os achados de padrões e indicadores.
         - Forneça uma recomendação final: 'ALTA' (sinal forte de compra), 'BAIXA' (sinal forte de venda) ou 'AGUARDAR' (sinal incerto ou neutro).

      4. **Pontuação de Confiança:**
         - Forneça uma pontuação de confiança de 0 a 100 para sua recomendação. Uma pontuação alta (ex: 85) significa que múltiplos indicadores e padrões se alinham. Uma pontuação baixa significa sinais conflitantes ou fracos.

      5. **Resumo:** 
         - Forneça um breve resumo de uma frase em português explicando o raciocínio para a recomendação.
      `;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: { parts: [imagePart, { text: prompt }] },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    patterns: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    },
                    trend: { type: Type.STRING },
                    indicators: {
                        type: Type.OBJECT,
                        properties: {
                            rsi: { type: Type.STRING },
                            volume: { type: Type.STRING },
                        },
                        required: ['rsi', 'volume'],
                    },
                    recommendation: { type: Type.STRING },
                    confidenceScore: { type: Type.NUMBER },
                    summary: { type: Type.STRING },
                },
                required: ['patterns', 'trend', 'indicators', 'recommendation', 'confidenceScore', 'summary'],
            },
        },
    });

    const text = response.text;
    if (!text) {
        throw new Error("Failed to generate analysis content.");
    }
    return JSON.parse(text);

  } catch (error: any) {
    console.error("Error analyzing chart image:", error);
    throw new Error(error.message || "Falha ao analisar a imagem. Verifique sua conexão ou tente novamente.");
  }
};