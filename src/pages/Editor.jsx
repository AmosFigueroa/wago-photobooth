import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Palette, Smile, Check, ArrowLeft, Image as ImageIcon, Pipette } from 'lucide-react';
import { usePhoto } from '../PhotoContext';

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage } = usePhoto();
  const canvasRef = useRef(null);
  
  // URL Backend Google Apps Script (Pastikan ini URL Deploy TERBARU & PUBLIC)
  const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec"; 

  // State
  const [bgType, setBgType] = useState('color'); // 'color' atau 'image'
  const [frameColor, setFrameColor] = useState('#ffffff');
  const [selectedBgUrl, setSelectedBgUrl] = useState('');
  const [activeTab, setActiveTab] = useState('background'); 
  const [customAssets, setCustomAssets] = useState({ bgs: [], stickers: [] });
  const [stickers, setStickers] = useState([]);

  const colors = ['#ffffff', '#000000', '#ffb7b2', '#ffdac1', '#e2f0cb', '#b5ead7', '#c7ceea', '#ff9aa2', '#fecaca', '#fef3c7'];

  // 1. Proteksi Halaman Blank (Redirect jika tidak ada foto)
  useEffect(() => {
    if (!rawPhotos || rawPhotos.length === 0) {
      console.warn("Tidak ada foto mentah, kembali ke booth.");
      navigate('/booth');
    }
  }, [rawPhotos, navigate]);

  // 2. Load Aset dari Google Sheet
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${SCRIPT_URL}?get=assets`);
        const data = await res.json();
        if (data.status === 'success') {
          setCustomAssets({
            bgs: data.assets.filter(a => a.type === 'bg'),
            stickers: data.assets.filter(a => a.type === 'sticker')
          });
        }
      } catch (e) { console.error("Gagal muat aset:", e); }
    };
    fetchAssets();
  }, [SCRIPT_URL]);

  // 3. Fungsi Helper: Gambar Anti-Gepeng (Object Fit Cover)
  const drawImageProp = (ctx, img, x, y, w, h) => {
    const offsetX = 0.5, offsetY = 0.5;
    let iw = img.width, ih = img.height, r = Math.min(w / iw, h / ih),
        nw = iw * r, nh = ih * r, cx, cy, cw, ch, ar = 1;

    if (nw < w) ar = w / nw;                             
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh; 
    nw *= ar; nh *= ar;

    cw = iw / (nw / w); ch = ih / (nh / h);
    cx = (iw - cw) * offsetX; cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0; if (cy < 0) cy = 0;
    if (cw > iw) cw = iw; if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
  };

  // 4. Logika Utama Render Canvas
  useEffect(() => {
    if (!rawPhotos || rawPhotos.length === 0) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    // Config Ukuran
    const targetW = 640; 
    const targetH = 480; 
    const padding = 40; 
    const gap = 20; 
    const footerH = 140;

    const canvasW = targetW + (padding * 2);
    const canvasH = (targetH * rawPhotos.length) + (gap * (rawPhotos.length - 1)) + (padding * 2) + footerH;
    
    canvas.width = canvasW; canvas.height = canvasH;

    const renderCanvas = async () => {
      // A. Gambar Background
      if (bgType === 'color') {
        ctx.fillStyle = frameColor;
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (bgType === 'image' && selectedBgUrl) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = "anonymous"; // WAJIB: Agar tidak error CORS
          bgImg.src = selectedBgUrl;
          
          await new Promise((resolve, reject) => {
             bgImg.onload = resolve;
             bgImg.onerror = reject;
          });
          drawImageProp(ctx, bgImg, 0, 0, canvasW, canvasH);
        } catch (err) {
          console.error("Gagal load background:", err);
          // Fallback ke putih jika gagal load gambar
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvasW, canvasH);
        }
      }

      // B. Gambar Foto User
      for (let i = 0; i < rawPhotos.length; i++) {
        const img = new Image();
        img.src = rawPhotos[i];
        await new Promise(r => img.onload = r);
        
        const y = padding + (i * (targetH + gap));
        drawImageProp(ctx, img, padding, y, targetW, targetH);
      }

      // C. Teks Footer
      const isDark = (bgType === 'color' && frameColor === '#000000');
      ctx.fillStyle = isDark ? '#ffffff' : '#333333';
      ctx.textAlign = 'center';
      
      ctx.font = 'bold 50px Courier New';
      ctx.fillText('WAGO BOOTH', canvasW / 2, canvasH - 70);
      
      ctx.font = '24px Arial';
      ctx.fillText(new Date().toLocaleDateString(), canvasW / 2, canvasH - 30);

      // D. Gambar Stiker
      for (const s of stickers) {
         const sImg = new Image();
         sImg.crossOrigin = "anonymous"; // WAJIB
         sImg.src = s.url;
         try {
            await new Promise((resolve, reject) => {
                sImg.onload = resolve;
                sImg.onerror = reject;
            });
            ctx.drawImage(sImg, s.x, s.y, 150, 150);
         } catch (e) {
            console.error("Gagal load stiker:", e);
         }
      }
    };

    renderCanvas();
  }, [rawPhotos, bgType, frameColor, selectedBgUrl, stickers]);

  const addSticker = (url) => {
     setStickers([...stickers, { url, x: Math.random() * 400, y: Math.random() * 400 }]);
  };

  const handleFinish = () => {
    if (canvasRef.current) {
      const dataUrl = canvasRef.current.toDataURL('image/png', 1.0);
      setFinalImage(dataUrl);
      const colorForGif = bgType === 'color' ? frameColor : '#ffffff';
      navigate('/delivery', { state: { frameColorForGif: colorForGif } });
    }
  };

  // Jika data foto belum siap, tampilkan loading agar tidak blank putih
  if (!rawPhotos || rawPhotos.length === 0) return <div className="h-screen flex items-center justify-center">Memuat Foto...</div>;

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* KIRI: Preview */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-200 overflow-auto">
        <canvas ref={canvasRef} className="max-w-full max-h-full shadow-2xl bg-white" />
      </div>

      {/* KANAN: Tools */}
      <div className="w-full md:w-[400px] bg-white shadow-2xl flex flex-col border-l z-20">
        <div className="flex border-b">
          <button onClick={() => setActiveTab('background')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'background' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}>Background</button>
          <button onClick={() => setActiveTab('stiker')} className={`flex-1 py-4 font-bold text-sm uppercase tracking-wider ${activeTab === 'stiker' ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-400'}`}>Stiker</button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {activeTab === 'background' && (
            <div className="space-y-8">
              {/* Warna Solid */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Warna Solid</h3>
                <div className="grid grid-cols-5 gap-3">
                   {colors.map(c => (
                     <button 
                       key={c} 
                       onClick={() => { setFrameColor(c); setBgType('color'); }} 
                       className={`aspect-square rounded-full border-2 transition hover:scale-110 ${bgType === 'color' && frameColor === c ? 'border-pink-500 scale-110 shadow-md' : 'border-gray-200'}`}
                       style={{ backgroundColor: c }}
                     />
                   ))}
                   <div className="relative aspect-square rounded-full border-2 border-gray-200 overflow-hidden bg-gradient-to-tr from-blue-100 to-pink-100 flex items-center justify-center cursor-pointer hover:border-pink-400">
                      <input type="color" className="absolute opacity-0 w-full h-full cursor-pointer" onChange={(e) => { setFrameColor(e.target.value); setBgType('color'); }} />
                      <Pipette size={16} className="text-gray-500"/>
                   </div>
                </div>
              </div>

              {/* Custom Backgrounds */}
              {customAssets.bgs.length > 0 && (
                <div>
                   <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Custom Backgrounds</h3>
                   <div className="grid grid-cols-2 gap-3">
                      {customAssets.bgs.map((bg, idx) => (
                         <button 
                           key={idx}
                           onClick={() => { setSelectedBgUrl(bg.url); setBgType('image'); }} 
                           className={`relative aspect-video rounded-xl overflow-hidden border-2 transition group ${bgType === 'image' && selectedBgUrl === bg.url ? 'border-pink-500 ring-2 ring-pink-100' : 'border-gray-100 hover:border-gray-300'}`}
                         >
                            <img src={bg.url} crossOrigin="anonymous" alt={bg.name} className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition"/>
                         </button>
                      ))}
                   </div>
                </div>
              )}
            </div>
          )}

          {activeTab === 'stiker' && (
             <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">Stiker Tambahan</h3>
                <div className="grid grid-cols-3 gap-3">
                   {customAssets.stickers.map((stk, idx) => (
                     <button key={idx} onClick={() => addSticker(stk.url)} className="aspect-square border border-gray-100 rounded-xl p-2 hover:bg-gray-50 hover:border-pink-200 transition">
                        <img src={stk.url} crossOrigin="anonymous" alt="stiker" className="w-full h-full object-contain" />
                     </button>
                   ))}
                </div>
                {stickers.length > 0 && (
                   <button onClick={() => setStickers([])} className="w-full mt-6 py-2 border border-red-200 text-red-500 rounded-lg text-sm font-bold hover:bg-red-50">Hapus Semua Stiker</button>
                )}
             </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button onClick={handleFinish} className="w-full py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition flex items-center justify-center gap-2">
             <Check className="w-5 h-5"/> Selesai & Simpan
          </button>
        </div>
      </div>
    </div>
  );
};
export default Editor;