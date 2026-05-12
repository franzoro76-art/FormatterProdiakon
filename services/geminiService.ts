
import { GoogleGenAI, Type, Modality } from "@google/genai";

const SCHEDULE_SYSTEM_INSTRUCTION = `
Kamu adalah “Extractor & Formatter Jadwal Misa”.
Tugasmu: mengubah gambar tabel jadwal (mirip Excel) menjadi format JSON terstruktur untuk dikonversi menjadi teks WhatsApp.

ATURAN EKSTRAKSI & FORMATTING:
1) BOLDING: Gunakan format bold WhatsApp (*teks*) untuk semua teks yang tercetak TEBAL (bold) di gambar asal. Ini sangat penting.
2) Salin semua data apa adanya: judul misa, HR/perayaan, tanggal, hari, jam, daftar petugas P1..P7.
3) EMOJI PETUGAS: Jika ada emoji/ikon kecil di samping nama petugas di dalam gambar, SALIN EMOJI TERSEBUT APA ADANYA. PENTING: Jika ikon tersebut merujuk pada kalung doa/rosario, pastikan menggunakan emoji 📿 (prayer beads). JANGAN PERNAH mengubahnya menjadi 🪈 (flute) atau emoji lain. Pastikan emoji yang diekstrak sama persis bentuk dan maknanya (beri spasi sebelum emoji).
4) Jam selalu tulis “WIB”.
5) WARNA LITURGI (PENTING):
   Di bawah baris Jam Misa, wajib tambahkan satu baris: "Warna Liturgi : <emoji hati 3x>"
   Tentukan warna dari header/tema blok misa:
   - Hijau → 💚💚💚
   - Putih → 🤍🤍🤍
   - Merah → ❤️❤️❤️
   - Ungu → 💜💜💜
   - Pink → 💗💗💗
   - Hitam → 🖤🖤🖤
   - Emas/Kuning → 💛💛💛
   Jika ragu/tidak jelas, gunakan 🤍🤍🤍.
6) Format Urutan Baris per Misa:
   - Judul/Tema (Baris 1)
   - 📅 *Hari, Tanggal Bulan Tahun* (Baris 2)
   - 🕔 HH:MM WIB (Baris 3)
   - Warna Liturgi : <Emoji> (Baris 4 - WAJIB ADA)
   - Daftar petugas P1..P7 (Baris-baris berikutnya)
7) Penulisan petugas: 
   Jika nama petugas di gambar tercetak TEBAL, maka seluruh baris petugas tersebut termasuk label P-nya harus ikut tebal (Contoh: *P1. Nama Petugas*).
   Jika tidak tebal, tulis biasa tanpa bintang (Contoh: P1. Nama Petugas).

STRUKTUR OUTPUT:
Harus berupa JSON ARRAY. Setiap elemen adalah objek dengan properti:
- "title": Label singkat (misal: "Misa 1", "Misa Sore").
- "content": Teks lengkap blok tersebut yang siap dicopas ke WhatsApp.
- "type": "misa".

PENTING: Jika gambar tidak mengandung tabel jadwal misa atau terlalu buram untuk dibaca, kembalikan array kosong [].
`.trim();

export class GeminiService {
  async convertScheduleImageToText(base64Data: string, mimeType: string): Promise<any[]> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is not defined in the environment.");
      throw new Error("MISSING_API_KEY");
    }

    const ai = new GoogleGenAI({ apiKey });
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: SCHEDULE_SYSTEM_INSTRUCTION,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                type: { type: Type.STRING }
              },
              required: ["title", "content", "type"]
            }
          }
        },
        contents: [
          {
            parts: [
              { inlineData: { data: base64Data, mimeType } },
              { text: "Extract and format this schedule table into JSON blocks according to the system instructions. Be very precise with bolding and icons." }
            ]
          }
        ],
      });
      
      const text = response.text;
      if (!text) {
        throw new Error("EMPTY_RESPONSE");
      }

      try {
        const parsed = JSON.parse(text);
        if (!Array.isArray(parsed)) {
          throw new Error("INVALID_RESPONSE_FORMAT");
        }
        return parsed;
      } catch (parseError) {
        // Fallback: try to extract JSON from markdown if present
        const jsonMatch = text.match(/```json\n?([\s\S]*?)\n?```/) || text.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const extractedText = jsonMatch[1] || jsonMatch[0];
          const parsed = JSON.parse(extractedText);
          if (Array.isArray(parsed)) return parsed;
        }
        throw parseError;
      }
    } catch (e: any) {
      console.error("Gemini AI Error:", e);
      if (e.name === 'SyntaxError') throw new Error("IMAGE_UNCLEAR");
      throw e;
    }
  }

  // Added chat method to handle conversation with history
  async chat(message: string, history: any[]): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("MISSING_API_KEY");
    
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [...history, { role: 'user', parts: [{ text: message }] }],
    });
    return response.text || "";
  }

  // Added connectLive method to facilitate low-latency voice interaction
  connectLive(callbacks: any) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("MISSING_API_KEY");

    const ai = new GoogleGenAI({ apiKey });
    return ai.live.connect({
      model: 'gemini-3.1-flash-live-preview',
      callbacks,
      config: {
        responseModalities: [Modality.AUDIO],
      }
    });
  }
}

export const geminiService = new GeminiService();

// Added utility function to encode bytes to base64
export function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Added utility function to decode base64 to bytes
export function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

// Added utility function to decode raw PCM audio data into an AudioBuffer
export async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
