import React from 'react';
import { AppView } from '../types';

interface NavbarProps {
  currentView: AppView;
  setView: (view: AppView) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentView, setView }) => {
  const navItems = [
    { view: AppView.DASHBOARD, label: 'Dashboard', icon: 'fa-gauge' },
    { view: AppView.SCHEDULE, label: 'Formatter', icon: 'fa-calendar-check' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 bg-[#004510] border-b border-[#003000] z-50 px-4 py-2 md:py-3 flex flex-col md:flex-row items-center justify-between shadow-md">
      <div className="flex items-center space-x-3 w-full md:w-auto justify-center md:justify-start mb-2 md:mb-0 shrink-0">
        <img src="/logo(1).jpg" alt="Logo Kristus Raja" className="w-8 h-8 rounded-full object-cover shrink-0 shadow-lg shadow-black/20 bg-white" />
        <h1 className="text-sm md:text-base font-bold text-white">
          Prodiakon Kristus Raja
        </h1>
      </div>

      <nav className="flex items-center space-x-1 md:space-x-2 w-full md:w-auto justify-center md:justify-end overflow-x-auto no-scrollbar">
        {navItems.map((item) => (
          <button
            key={item.view}
            onClick={() => setView(item.view)}
            className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap ${
              currentView === item.view
                ? 'bg-white/20 text-white shadow-sm'
                : 'text-white/80 hover:bg-white/10 hover:text-white'
            }`}
          >
            <i className={`fa-solid ${item.icon} text-sm`}></i>
            <span className="font-medium text-xs md:text-sm">{item.label}</span>
          </button>
        ))}
        <a
          href="/apkprodi.apk"
          download="apkprodi.apk"
          className="flex items-center space-x-1.5 px-3 py-2 rounded-lg transition-colors whitespace-nowrap text-white/80 hover:bg-white/10 hover:text-white"
        >
          <i className="fa-brands fa-android text-[#3DDC84] text-sm"></i>
          <span className="font-medium text-xs md:text-sm">APK</span>
        </a>
      </nav>
    </header>
  );
};

export default Navbar;
