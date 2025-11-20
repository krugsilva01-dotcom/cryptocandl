
import React, { useState, useEffect } from 'react';
import * as Lucide from 'lucide-react';
import { recoverPassword } from '../services/api';

interface LoginProps {
  onLogin: (email: string, password?: string) => void; // Atualizado para passar senha
  onRegister: (name: string, email: string, password?: string) => void;
  isLoggingIn: boolean;
}

type AuthMode = 'login' | 'register' | 'recover';

// Componente para gerar o fundo de gráfico
const ChartBackground = () => {
    const [candles, setCandles] = useState<Array<{ height: number, isGreen: boolean, offset: number }>>([]);

    useEffect(() => {
        // Gera velas aleatórias apenas uma vez na montagem
        const count = 50; // Quantidade de velas na tela
        const newCandles = Array.from({ length: count }).map(() => ({
            height: Math.random() * 60 + 10, // Altura entre 10% e 70%
            isGreen: Math.random() > 0.45, // Leve viés de alta
            offset: Math.random() * 20 // Deslocamento vertical
        }));
        setCandles(newCandles);
    }, []);

    return (
        <div className="absolute inset-0 flex items-end justify-between px-2 opacity-20 pointer-events-none overflow-hidden bg-gray-900">
             {/* Grid Lines */}
            <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to bottom, #374151 1px, transparent 1px), linear-gradient(to right, #374151 1px, transparent 1px)', backgroundSize: '40px 40px', opacity: 0.2 }}></div>

            {candles.map((candle, i) => (
                <div key={i} className="flex flex-col items-center justify-end w-full mx-0.5 relative" style={{ height: `${candle.height + candle.offset}%` }}>
                    {/* Wick (Pavio) */}
                    <div className={`w-px absolute h-full ${candle.isGreen ? 'bg-green-500' : 'bg-red-500'}`} style={{ height: '120%', bottom: '-10%'}}></div>
                    {/* Body (Corpo) */}
                    <div 
                        className={`w-full sm:w-3 rounded-sm z-10 ${candle.isGreen ? 'bg-green-500' : 'bg-red-500'}`} 
                        style={{ height: `${candle.height}%` }}
                    ></div>
                </div>
            ))}
        </div>
    );
};

const Login: React.FC<LoginProps> = ({ onLogin, onRegister, isLoggingIn }) => {
  const [authMode, setAuthMode] = useState<AuthMode>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // Estado para recuperação de senha
  const [recoveryStatus, setRecoveryStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoggingIn) return;
    
    if (authMode === 'register') {
        onRegister(name, email, password);
    } else if (authMode === 'login') {
        // Passamos a senha para validar o admin hardcoded
        onLogin(email, password); 
    }
  };
  
  const handleRecoverPassword = async (e: React.FormEvent) => {
      e.preventDefault();
      setRecoveryStatus('sending');
      try {
          await recoverPassword(email);
          setRecoveryStatus('sent');
      } catch (error) {
          console.error("Failed to recover", error);
          setRecoveryStatus('idle');
      }
  };

  const handleDemoLogin = (demoEmail: string) => {
    if (isLoggingIn) return;
    setEmail(demoEmail);
    setPassword('password'); // mock password
    onLogin(demoEmail, 'password');
  }

  // Reset de estados ao mudar de modo
  useEffect(() => {
      setRecoveryStatus('idle');
  }, [authMode]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 p-4 relative overflow-hidden">
      
      {/* Fundo de Gráfico */}
      <ChartBackground />
      
      {/* Overlay Escuro para contraste */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-[2px]"></div>

      <div className="w-full max-w-md bg-gray-800/90 backdrop-blur-md rounded-xl shadow-2xl p-8 space-y-6 border border-gray-700 z-10 shadow-black/50 animate-fade-in-up">
        <div className="text-center select-none relative">
            <div className="inline-block">
                <div className="bg-gray-900 p-3 rounded-full border border-gray-600 shadow-lg">
                    <Lucide.CandlestickChart className="h-10 w-10 text-primary" />
                </div>
            </div>
          <h1 className="text-3xl font-bold text-white mt-4">CryptoCandles AI</h1>
          <p className="text-gray-400 text-sm">Domine o mercado com inteligência artificial.</p>
        </div>
        
        {/* Botões de Demo (Só aparecem no modo Login) */}
        {authMode === 'login' && (
        <div className="flex justify-center gap-2 animate-fade-in">
            <button disabled={isLoggingIn} onClick={() => handleDemoLogin('premium@test.com')} className="flex items-center gap-1 text-xs bg-gradient-to-r from-yellow-600 to-yellow-500 hover:from-yellow-500 hover:to-yellow-400 text-white p-2 rounded-lg transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20 border border-yellow-400/20">
                <Lucide.Crown size={12} /> Premium
            </button>
        </div>
        )}

        {/* Separador e Título do Modo */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-600"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-gray-800 text-gray-400 rounded uppercase font-bold text-xs tracking-wider">
                {authMode === 'register' ? 'Crie sua conta' : authMode === 'recover' ? 'Recuperar Senha' : 'Login Seguro'}
            </span>
          </div>
        </div>

        {/* --- FORMULÁRIO DE RECUPERAÇÃO --- */}
        {authMode === 'recover' ? (
            <div className="animate-fade-in-right space-y-4">
                {recoveryStatus === 'sent' ? (
                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 text-center">
                        <Lucide.MailCheck className="h-12 w-12 text-green-500 mx-auto mb-2" />
                        <h3 className="text-green-400 font-bold">E-mail Enviado!</h3>
                        <p className="text-gray-400 text-sm mt-1">Verifique sua caixa de entrada para redefinir sua senha.</p>
                        <button 
                            onClick={() => setAuthMode('login')} 
                            className="mt-4 text-sm text-green-400 hover:underline"
                        >
                            Voltar para Login
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleRecoverPassword} className="space-y-4">
                        <p className="text-gray-400 text-sm text-center">
                            Insira seu e-mail e enviaremos instruções para você redefinir sua senha.
                        </p>
                        <div>
                            <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="recovery-email">Email</label>
                            <div className="relative">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <Lucide.Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="recovery-email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    placeholder="Seu e-mail cadastrado"
                                    className="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                                />
                            </div>
                        </div>
                        <button 
                            type="submit" 
                            disabled={recoveryStatus === 'sending'}
                            className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md transition-all duration-300 flex items-center justify-center disabled:opacity-50"
                        >
                            {recoveryStatus === 'sending' ? <Lucide.Loader className="animate-spin mr-2" /> : 'Enviar Link de Recuperação'}
                        </button>
                        <button 
                            type="button" 
                            onClick={() => setAuthMode('login')}
                            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            Cancelar e voltar
                        </button>
                    </form>
                )}
            </div>
        ) : (
        /* --- FORMULÁRIO DE LOGIN / REGISTRO --- */
        <form className="space-y-4 animate-fade-in" onSubmit={handleSubmit}>
          {authMode === 'register' && (
              <div className="animate-fade-in-down">
                <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="name">Nome</label>
                <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Lucide.User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        placeholder="Seu Nome"
                        className="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                    />
                </div>
              </div>
          )}

          <div>
            <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="email">Email ou Usuário</label>
            <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lucide.Mail className="h-5 w-5 text-gray-400" />
                </div>
                {/* Alterado type="email" para "text" para aceitar nomes de usuário como 'admkrug' */}
                <input
                    id="email"
                    type="text" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="E-mail ou Usuário"
                    className="w-full pl-10 pr-3 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
            </div>
          </div>
          <div>
            <label className="text-sm font-medium text-gray-300 sr-only" htmlFor="password">Senha</label>
            <div className="relative">
                 <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Lucide.Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Senha"
                    className="w-full pl-10 pr-10 py-2 bg-gray-700/50 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all"
                />
                 <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer hover:text-gray-200">
                    {showPassword ? <Lucide.EyeOff className="h-5 w-5 text-gray-400" /> : <Lucide.Eye className="h-5 w-5 text-gray-400" />}
                </button>
            </div>
          </div>
          
          {authMode === 'login' && (
            <div className="flex items-center justify-between">
                <button 
                    type="button"
                    onClick={() => setAuthMode('recover')} 
                    className="text-sm text-primary hover:text-primary-hover hover:underline transition-colors"
                >
                    Esqueceu a senha?
                </button>
            </div>
          )}

          <button type="submit" disabled={isLoggingIn} className="w-full py-2 px-4 bg-primary hover:bg-primary-hover text-white font-semibold rounded-md transition-all duration-300 flex items-center justify-center disabled:bg-primary-hover/50 disabled:cursor-not-allowed shadow-lg shadow-primary/20 transform active:scale-95">
            {isLoggingIn ? (
                <>
                    <Lucide.Loader className="animate-spin mr-2" size={20} />
                    <span>{authMode === 'register' ? 'Criando Conta...' : 'Entrando...'}</span>
                </>
            ) : (
                authMode === 'register' ? 'Criar Conta' : 'Entrar'
            )}
          </button>
        </form>
        )}

        {authMode !== 'recover' && (
            <>
                <div className="text-center mt-4">
                    <button 
                        onClick={() => { 
                            setAuthMode(authMode === 'login' ? 'register' : 'login'); 
                            setName(''); 
                        }}
                        className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                        {authMode === 'register' ? 'Já tem uma conta? ' : 'Não tem uma conta? '}
                        <span className="text-primary font-bold underline">{authMode === 'register' ? 'Faça Login' : 'Cadastre-se agora'}</span>
                    </button>
                </div>
            </>
        )}
      </div>
    </div>
  );
};

export default Login;
