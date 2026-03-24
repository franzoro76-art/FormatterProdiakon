
import React, { useState, useRef } from 'react';
import { geminiService } from '../services/geminiService';

interface ScheduleBlock {
  title: string;
  content: string;
  type: 'note' | 'misa';
}

const STATIC_NOTE: ScheduleBlock = {
  title: 'Note',
  type: 'note',
  content: `Note : 
▪️PIC Keluarkan 2~3 Sibori
▪️Purificatorium ambil di Meja Kreden
⚠️Hadir 30 menit sebelum Misa dimulai`
};

const ScheduleModule: React.FC = () => {
  const [image, setImage] = useState<string | null>(null);
  const [blocks, setBlocks] = useState<ScheduleBlock[]>([]);
  const [isExtracting, setIsExtracting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImage(reader.result as string);
      setBlocks([]);
      setError(null);
    };
    reader.readAsDataURL(file);
  };

  const handleExtract = async () => {
    if (!image) return;

    setIsExtracting(true);
    setError(null);
    setBlocks([]);

    try {
      const base64Data = image.split(',')[1];
      const mimeType = image.split(',')[0].split(':')[1].split(';')[0];
      const resultBlocks = await geminiService.convertScheduleImageToText(base64Data, mimeType);
      
      // Prepend the mandatory static note
      setBlocks([STATIC_NOTE, ...resultBlocks]);
    } catch (err: any) {
      console.error("Extraction error:", err);
      
      const errMsg = err.message || "";
      if (errMsg === "IMAGE_UNCLEAR" || errMsg.includes("SyntaxError")) {
        setError("Silakan unggah gambar yang lebih jelas. Gambar saat ini terlalu buram untuk dibaca sistem.");
      } else {
        setError("Terjadi kesalahan saat mengekstrak data. Pastikan koneksi stabil dan gambar berisi tabel jadwal.");
      }
    } finally {
      setIsExtracting(false);
    }
  };

  const copyBlock = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(id);
    setTimeout(() => setCopyStatus(null), 2000);
  };

  // Basic formatter to render WhatsApp bold (*) in the UI for preview
  const renderFormattedText = (text: string) => {
    const parts = text.split(/(\*.*?\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('*') && part.endsWith('*')) {
        return <strong key={i} className="text-black font-bold">{part.slice(1, -1)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6">
      <style>
        {`
          @keyframes shimmer-sweep {
            0% { transform: translateX(-100%) skewX(-15deg); }
            100% { transform: translateX(200%) skewX(-15deg); }
          }
          .animate-shimmer {
            background-color: #005800;
          }
          .animate-shimmer::after {
            content: '';
            position: absolute;
            top: 0;
            left: -100%;
            width: 50%;
            height: 100%;
            background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.25), transparent);
            animation: shimmer-sweep 2s infinite ease-in-out;
          }
        `}
      </style>

      <div className="flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-xl md:text-2xl font-bold text-[#040404]">Formater Jadwal</h2>
          <p className="text-[#000000] text-xs md:text-sm mt-1">Konversi tabel jadwal menjadi teks WhatsApp.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 flex-1 min-h-0 overflow-y-auto no-scrollbar lg:overflow-hidden pb-4 lg:pb-0">
        {/* Left Side: Upload & Preview */}
        <div className="bg-white rounded-2xl border border-[#004e07] p-4 md:p-6 flex flex-col space-y-4 overflow-hidden shadow-sm min-h-[350px] lg:min-h-0">
          <div className="flex items-center justify-between shrink-0">
            <h3 className="text-xs md:text-sm font-semibold text-slate-700 uppercase tracking-wider">Source Table</h3>
            {image && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-[#ffffff] bg-[#0f5e00] hover:bg-[#004510] transition-colors px-3 py-1.5 rounded-lg font-medium"
              >
                <i className="fa-solid fa-image mr-1.5"></i> Ganti
              </button>
            )}
          </div>

          {!image ? (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center space-y-3 md:space-y-4 cursor-pointer hover:border-[#005800]/50 hover:bg-slate-50 transition-all p-4"
            >
              <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-slate-100 flex items-center justify-center">
                <i className="fa-solid fa-cloud-arrow-up text-xl md:text-2xl text-slate-400"></i>
              </div>
              <div className="text-center">
                <p className="text-slate-700 font-medium text-sm md:text-base">Upload Jadwal (Foto/Screenshot)</p>
                <p className="text-slate-500 text-[10px] md:text-xs mt-1.5">Sistem akan mengekstrak teks otomatis</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 relative rounded-xl overflow-hidden bg-slate-100 border border-[#000000] min-h-[200px]">
              <img src={image} alt="Source" className="w-full h-full object-contain" />
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          <button
            onClick={handleExtract}
            disabled={!image || isExtracting}
            className={`w-full py-3.5 md:py-4 rounded-xl font-bold transition-all flex items-center justify-center space-x-2 relative overflow-hidden shrink-0 ${
              !image
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                : isExtracting
                ? 'animate-shimmer text-white shadow-lg shadow-[#005800]/20'
                : 'bg-[#023f00] hover:bg-[#004510] active:bg-[#003000] text-[#ffffff] shadow-lg shadow-[#005800]/20'
            }`}
          >
            {isExtracting ? (
              <>
                <i className="fa-solid fa-wand-sparkles animate-spin text-sm"></i>
                <span className="relative z-10">Sedang Memproses...</span>
              </>
            ) : (
              <>
                <i className="fa-solid fa-bolt"></i>
                <span>Ekstrak & Format Jadwal</span>
              </>
            )}
          </button>
        </div>

        {/* Right Side: Framed Results */}
        <div className="bg-white rounded-2xl border border-[#0f4900] border-solid flex flex-col overflow-hidden min-h-[400px] lg:min-h-0 mt-4 lg:mt-0 shadow-sm">
          <div className="p-4 md:p-6 border-b border-[#005505] flex items-center justify-between shrink-0">
            <h3 className="text-xs md:text-sm font-semibold text-[#000000] uppercase tracking-wider">Hasil (Siap Copas)</h3>
            {blocks.length > 0 && (
              <span className="text-[10px] bg-[#005800]/10 text-[#005800] px-2.5 py-1 rounded-full border border-[#005800]/20 font-mono font-bold">
                {blocks.length} BLOK
              </span>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto no-scrollbar p-4 md:p-6 space-y-4 md:space-y-6">
            {isExtracting ? (
              <div className="h-full flex flex-col items-center justify-center space-y-6 text-slate-500">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-[#005800]/20 border-t-[#005800] rounded-full animate-spin"></div>
                  <i className="fa-solid fa-magnifying-glass absolute inset-0 flex items-center justify-center text-[#005800] animate-pulse"></i>
                </div>
                <div className="text-center">
                  <p className="text-[#005800] font-medium">Membaca Tabel...</p>
                  <p className="text-xs text-slate-500 mt-2 italic">Mendeteksi format bold, warna liturgi, dan petugas</p>
                </div>
              </div>
            ) : error ? (
              <div className="h-full flex flex-col items-center justify-center text-rose-600 space-y-4 px-8 text-center">
                <div className="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center mb-2">
                  <i className="fa-solid fa-triangle-exclamation text-xl"></i>
                </div>
                <div className="space-y-2">
                  <p className="font-semibold text-rose-700">Gagal Ekstrak</p>
                  <p className="text-sm text-slate-600 leading-relaxed">{error}</p>
                </div>
                <button 
                  onClick={handleExtract}
                  className="mt-4 px-6 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-full text-xs font-bold border border-slate-300 transition-all"
                >
                  Coba Lagi
                </button>
              </div>
            ) : blocks.length > 0 ? (
              blocks.map((block, idx) => (
                <div 
                  key={idx} 
                  className={`relative group bg-white rounded-xl border transition-all hover:shadow-md ${
                    block.type === 'note' ? 'border-amber-300 shadow-sm shadow-amber-500/5' : 'border-slate-200 hover:border-[#005800]/40'
                  }`}
                >
                  <div className={`flex items-center justify-between px-3 md:px-4 py-2 rounded-t-xl border-b ${
                    block.type === 'note' ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <span className={`text-[10px] font-bold uppercase tracking-widest truncate mr-2 ${
                      block.type === 'note' ? 'text-amber-700' : 'text-slate-600'
                    }`}>
                      {block.title}
                    </span>
                    <button
                      onClick={() => copyBlock(block.content, `block-${idx}`)}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-[10px] md:text-[11px] font-bold transition-all shadow-sm shrink-0 ${
                        copyStatus === `block-${idx}`
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-700 border border-slate-200'
                      }`}
                    >
                      <i className={`fa-solid ${copyStatus === `block-${idx}` ? 'fa-check' : 'fa-copy'}`}></i>
                      <span>{copyStatus === `block-${idx}` ? 'Tersalin' : 'Copy'}</span>
                    </button>
                  </div>
                  <div className="p-3 md:p-4 overflow-x-auto">
                    <pre className="text-slate-800 text-xs md:text-sm font-sans whitespace-pre-wrap leading-relaxed">
                      {renderFormattedText(block.content)}
                    </pre>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4 italic">
                <i className="fa-solid fa-clipboard-list text-4xl opacity-20"></i>
                <div className="text-center">
                  <p className="text-sm font-medium text-[#000000] not-italic">Belum Ada Hasil</p>
                  <p className="text-xs mt-1 text-[#000000]">Upload screenshot jadwal untuk generate teks WhatsApp.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ScheduleModule;
