import React, { useState } from 'react';
import Navbar from './components/Navbar';
import ScheduleModule from './components/ScheduleModule';
import { AppView } from './types';

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);

  const renderView = () => {
    switch (currentView) {
      case AppView.SCHEDULE:
        return <ScheduleModule />;
      case AppView.DASHBOARD:
        return (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-4 max-w-lg">
              <img src="/logo(1).jpg" alt="Logo Kristus Raja" className="w-24 h-24 rounded-full object-cover mx-auto mb-6 shadow-xl shadow-black/10 bg-white border-4 border-white" />
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Formater Jadwal Prodiakon</h2>
              <div className="bg-white p-5 md:p-6 rounded-2xl border border-slate-200 text-left space-y-4 shadow-sm">
                <p className="text-black text-xs md:text-sm leading-relaxed">
                  Selamat datang di alat bantu ekstraksi dan format jadwal misa khusus Prodiakon Kristus Raja.
                </p>
                <div className="space-y-2">
                  <h4 className="text-[10px] md:text-xs font-bold text-black uppercase tracking-wider">Cara Penggunaan:</h4>
                  <ol className="text-black text-xs md:text-sm list-decimal list-inside space-y-1.5">
                    <li>Buka file <code className="text-[#005800] font-mono bg-[#005800]/10 px-1 py-0.5 rounded">Draft Announcement.xlsm</code></li>
                    <li>Screenshot area jadwal shift tugas</li>
                    <li>Upload hasil screenshot di aplikasi ini</li>
                    <li>Klik <strong>Ekstrak & Format</strong></li>
                    <li>Copy blok teks yang dihasilkan ke WhatsApp</li>
                  </ol>
                </div>
                <p className="text-black text-[10px] md:text-xs italic pt-3 border-t border-slate-200">
                  Ada pertanyaan? Hubungi Alfa. Terima kasih.
                </p>
              </div>
              <button 
                onClick={() => setCurrentView(AppView.SCHEDULE)}
                className="mt-6 w-full md:w-auto px-8 py-3.5 bg-[#005800] hover:bg-[#004510] active:bg-[#003000] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#005800]/20"
              >
                Mulai Gunakan
              </button>
            </div>
          </div>
        );
      default:
        return (
          <div className="h-full flex items-center justify-center text-slate-500">
            View not found.
          </div>
        );
    }
  };

  return (
    <div className="flex flex-col h-screen w-full bg-[#fbfbfb] text-slate-900 overflow-hidden font-sans">
      <Navbar currentView={currentView} setView={setCurrentView} />
      <main className="flex-1 p-4 pt-20 md:p-8 md:pt-24 overflow-hidden relative">
        <div className="h-full relative z-10">
          {renderView()}
        </div>
      </main>
       <footer className="w-full text-center py-2 text-[10px] text-slate-400 bg-[#fbfbfb] border-t border-slate-200 z-20">
        Last update : 24 Maret 2026
      </footer>
    </div>
  );
};

export default App;
