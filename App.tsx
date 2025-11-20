
import React, { useState, useCallback } from 'react';
import { User, UserRole, Page, NavItem } from './types';
import { login, register, upgradePlan } from './services/api';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ImageAnalysis from './components/ImageAnalysis';
import Community from './components/Community';
import Backtesting from './components/Backtesting';
import AdminPanel from './components/AdminPanel';
import Pricing from './components/Pricing';
import * as Lucide from 'lucide-react';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleLogin = async (email: string, password?: string) => {
    setIsLoggingIn(true);
    try {
      const user = await login(email, password);
      setCurrentUser(user);
      setCurrentPage('dashboard');
    } catch (error) {
      console.error("Login failed", error);
      // Aqui você poderia definir uma mensagem de erro para exibir na tela de login
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleRegister = async (name: string, email: string) => {
      setIsLoggingIn(true);
      try {
          // Senha padrão "password" para simplificar o mock
          const user = await register(email, 'password', name);
          setCurrentUser(user);
          setCurrentPage('dashboard');
      } catch (error) {
          console.error("Registration failed", error);
      } finally {
          setIsLoggingIn(false);
      }
  };

  const handleLogout = useCallback(() => {
    setCurrentUser(null);
    setCurrentPage('dashboard');
  }, []);

  const handleUpgradePlan = async () => {
    if (!currentUser) return;
    try {
      const updatedUser = await upgradePlan(currentUser.id);
      setCurrentUser(updatedUser);
      // Opcional: mostrar uma mensagem de sucesso
    } catch (error) {
      console.error("Upgrade failed", error);
      // Opcional: mostrar uma mensagem de erro
    }
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'analysis':
        return <ImageAnalysis user={currentUser} />;
      case 'community':
        return <Community />;
      case 'backtesting':
        return <Backtesting />;
      case 'admin':
        return currentUser?.role === UserRole.ADMIN ? <AdminPanel /> : <div className="text-center p-8"><h2 className="text-2xl text-danger">Acesso Negado</h2></div>;
      case 'pricing':
        return <Pricing user={currentUser} onUpgrade={handleUpgradePlan} />;
      default:
        return <Dashboard />;
    }
  };

  if (!currentUser) {
    return <Login onLogin={handleLogin} onRegister={handleRegister} isLoggingIn={isLoggingIn} />;
  }

  const navItems: NavItem[] = [
    { name: 'Dashboard', page: 'dashboard', icon: <Lucide.BarChart2 size={20} /> },
    { name: 'Análise por Imagem', page: 'analysis', icon: <Lucide.UploadCloud size={20} /> },
    { name: 'Comunidade', page: 'community', icon: <Lucide.Users size={20} /> },
    { name: 'Backtesting', page: 'backtesting', icon: <Lucide.TestTube2 size={20} /> },
    { name: 'Planos', page: 'pricing', icon: <Lucide.CandlestickChart size={20} /> },
  ];

  if (currentUser.role === UserRole.ADMIN) {
    navItems.push({ name: 'Admin', page: 'admin', icon: <Lucide.Shield size={20} /> });
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans">
      <Header
        user={currentUser}
        onLogout={handleLogout}
        navItems={navItems}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />
      <main className="p-4 md:p-8">
        {renderPage()}
      </main>
    </div>
  );
};

export default App;
