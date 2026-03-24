import React, { useState, useRef, useEffect } from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: 'fa-gauge' },
    { view: AppView.SCHEDULE, label: 'Formatter', icon: 'fa-calendar-check' },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#004510] border-b border-[#003000] z-50 px-4 py-3 flex items-center justify-between shadow-md">
      <div className="flex items-center space-x-3">
        <img src="/logo(1).jpg" alt="Logo Kristus Raja" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-lg shadow-black/20 bg-white" />
        <h1 className="text-sm md:text-base font-bold text-white">
          Prodiakon Kristus Raja
        </h1>
      </div>

      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-10 h-10 flex items-center justify-center rounded-lg text-white hover:bg-white/10 transition-colors"
        >
          <i className="fa-solid fa-bars text-xl"></i>
        </button>

        {isMenuOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-2xl py-2 z-50 overflow-hidden">
            {navItems.map((item) => (
              <button
                key={item.view}
                onClick={() => {
                  setView(item.view);
                  setIsMenuOpen(false);
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 transition-colors ${
                  currentView === item.view
                    ? 'bg-[#005800]/10 text-[#005800] border-l-2 border-[#005800]'
                    : 'text-slate-700 hover:bg-slate-50 hover:text-black border-l-2 border-transparent'
                }`}
              >
                <i className={`fa-solid ${item.icon} w-5 text-center`}></i>
                <span className="font-medium text-sm">{item.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
