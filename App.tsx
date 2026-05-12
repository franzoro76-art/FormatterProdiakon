import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import ScheduleModule from './components/ScheduleModule';
import { AppView } from './types';

declare const __BUILD_TIME__: string;
declare const __APP_VERSION__: string;

const isNewerVersion = (current: string, latest: string) => {
  const v1 = current.split('.').map(Number);
  const v2 = latest.split('.').map(Number);
  for (let i = 0; i < Math.max(v1.length, v2.length); i++) {
    const n1 = v1[i] || 0;
    const n2 = v2[i] || 0;
    if (n1 < n2) return true;
    if (n1 > n2) return false;
  }
  return false;
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<AppView>(AppView.DASHBOARD);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{version: string, url: string} | null>(null);

  useEffect(() => {
    const checkVersion = async () => {
      try {
        // [PENTING]: Ganti URL ini dengan URL file JSON di backend / github / storage Anda
        // Format JSON yang diharapkan:
        // { "latestVersion": "1.1.5", "updateUrl": "https://link-download-apk-anda" }
        const VERSION_JSON_URL = 'https://raw.githubusercontent.com/username/repo/main/version.json';
        
        // --- CONTOH SIMULASI ---
        // Anda bisa menyalakan simulasi ini untuk mengetes modal update
        const simulateUpdateModal = false; // Ubah ke true untuk melihat modal
        
        if (simulateUpdateModal) {
          setUpdateInfo({ version: '9.9.9', url: 'https://example.com/download' });
          setShowUpdateModal(true);
          return;
        }

        const response = await fetch(VERSION_JSON_URL, { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          const currentAppVersion = typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '1.1.0';
          
          if (data && data.latestVersion && isNewerVersion(currentAppVersion, data.latestVersion)) {
            setUpdateInfo({ version: data.latestVersion, url: data.updateUrl });
            setShowUpdateModal(true);
          }
        }
      } catch (e) {
        console.error('Pengecekan versi gagal, abaikan.', e);
      }
    };
    
    // Beri jeda sedikit agar app tidak langsung loading berat saat dibuka
    setTimeout(checkVersion, 2000);
  }, []);

  // Format the build time into Indonesian locale
  const formattedBuildTime = React.useMemo(() => {
    try {
      const date = typeof __BUILD_TIME__ !== 'undefined' ? new Date(__BUILD_TIME__) : new Date();
      return new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    } catch (e) {
      return 'Baru Saja';
    }
  }, []);

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
        
        {/* Modal Update App */}
        {showUpdateModal && updateInfo && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
              <div className="bg-[#005800] p-6 text-center text-white">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-md">
                  <i className="fas fa-cloud-arrow-down text-3xl"></i>
                </div>
                <h3 className="text-xl font-bold mb-1">Update Tersedia!</h3>
                <p className="text-white/80 text-sm">Versi {updateInfo.version} telah rilis</p>
              </div>
              <div className="p-6">
                <p className="text-slate-600 text-sm text-center mb-6">
                  Versi terbaru dari aplikasi Prodi KR sudah memiliki fitur fitur baru dan perbaikan bug. Harap segera update untuk pengalaman terbaik!
                </p>
                <div className="flex flex-col gap-3">
                  <a 
                    href={updateInfo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 bg-[#005800] hover:bg-[#004510] text-white text-center font-bold rounded-xl transition-colors shadow-lg shadow-[#005800]/20"
                    onClick={() => setShowUpdateModal(false)}
                  >
                    Download Sekarang
                  </a>
                  <button 
                    onClick={() => setShowUpdateModal(false)}
                    className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-center font-semibold rounded-xl transition-colors"
                  >
                    Nanti Saja
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </main>
      <footer className="w-full text-center py-2 text-[10px] text-slate-400 bg-[#fbfbfb] border-t border-slate-200 z-20">
        Last update : {formattedBuildTime}
      </footer>
    </div>
  );
};

export default App;
