
import React, { useState } from 'react';
import { User, NavItem, Page } from '../types';
import * as Lucide from 'lucide-react';

interface HeaderProps {
  user: User;
  onLogout: () => void;
  navItems: NavItem[];
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Header: React.FC<HeaderProps> = ({ user, onLogout, navItems, currentPage, setCurrentPage }) => {
  const handleNavClick = (page: Page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0); // Scroll to top on nav change
  };

  // Filtrar itens para a barra inferior (máximo 5 para não ficar apertado)
  // Removemos 'Admin' da barra inferior se houver muitos itens, ele fica acessível pelo desktop ou perfil
  const mobileNavItems = navItems.slice(0, 5);

  return (
    <>
      {/* Desktop / Tablet Header */}
      <header className="bg-gray-800 shadow-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Lucide.CandlestickChart className="h-8 w-8 text-primary" />
              <span className="font-bold text-xl ml-2 hidden sm:block">CryptoCandles AI</span>
              <span className="font-bold text-xl ml-2 sm:hidden">CC AI</span>
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navItems.map((item) => (
                  <button
                    key={item.name}
                    onClick={() => handleNavClick(item.page)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all duration-300 ease-in-out ${
                      currentPage === item.page
                        ? 'bg-primary text-white scale-105 shadow-lg shadow-primary/30'
                        : 'text-gray-300 hover:bg-gray-700 hover:text-white transform hover:scale-105 active:scale-100'
                    }`}
                  >
                    {item.icon}
                    {item.name}
                  </button>
                ))}
              </div>
            </div>

            {/* User Profile & Logout (Desktop & Mobile Header) */}
            <div className="flex items-center space-x-4">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-medium text-white">{user.name}</div>
                <div className="text-xs text-gray-400">{user.plan}</div>
              </div>
              <div className="sm:hidden h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm">
                  {user.name.charAt(0)}
              </div>
              <button
                onClick={onLogout}
                className="p-2 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white"
                title="Sair"
              >
                <Lucide.LogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 pb-safe z-50 px-2">
        <div className="flex justify-around items-center h-16">
          {mobileNavItems.map((item) => {
             const isActive = currentPage === item.page;
             return (
              <button
                key={item.name}
                onClick={() => handleNavClick(item.page)}
                className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${
                  isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-200'
                }`}
              >
                <div className={`transition-all duration-300 ${isActive ? 'transform -translate-y-1 scale-110' : ''}`}>
                    {/* Clone element to adjust size if needed, or just render */}
                    {React.cloneElement(item.icon as React.ReactElement<any>, { size: 22 })}
                </div>
                <span className={`text-[10px] font-medium transition-opacity ${isActive ? 'opacity-100' : 'opacity-70'}`}>
                  {item.name.split(' ')[0]} {/* Show only first word on mobile */}
                </span>
                {isActive && <div className="absolute bottom-1 w-1 h-1 bg-primary rounded-full"></div>}
              </button>
            );
          })}
        </div>
      </div>
      
      {/* Spacer for bottom nav so content isn't hidden behind it on mobile */}
      <div className="md:hidden h-16"></div>
    </>
  );
};

export default Header;
