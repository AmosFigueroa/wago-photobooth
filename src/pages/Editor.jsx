import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  Smile,
  Check,
  Layout as LayoutIcon,
  ArrowLeft,
} from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage, setRawPhotos, sessionConfig } = usePhoto();
  const canvasRef = useRef(null);

  const initialLayout = sessionConfig?.layout || "strip-4";

  const [layoutType, setLayoutType] = useState(initialLayout);
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [activeTab, setActiveTab] = useState("frame");
  const [stickers, setStickers] = useState([]);

  const colors = [
    "#ffffff",
    "#000000",
    "#ffb7b2",
    "#ffdac1",
    "#e2f0cb",
    "#b5ead7",
    "#c7ceea",
    "#ff9aa2",
    "#fff3e0",
    "#e0f2f1",
  ];
  const stickerOptions = [
    "❤️",
    "⭐",
    "🌸",
    "🔥",
    "✨",
    "🎀",
    "🦋",
    "🐱",
    "🦄",
    "😎",
    "👑",
    "🌈",
  ];

  // --- LOGIKA UTAMA MENGGAMBAR CANVAS (DIPERBAIKI) ---
  useEffect(() => {
    if (rawPhotos.length === 0) {
      navigate("/booth");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // --- KONFIGURASI UKURAN ---
    // Kita tentukan ukuran kotak tujuan di canvas (Rasio 4:3)
    const targetW = 640;
    const targetH = 480;

    const padding = 40;
    const gap = 20;
    const footerH = 140; // Footer sedikit diperbesar

    let canvasW, canvasH;
    const count = rawPhotos.length;

    // 1. Hitung Ukuran Total Canvas
    if (layoutType.includes("grid")) {
      // Mode Grid (2x2)
      canvasW = targetW * 2 + padding * 2 + gap;
      canvasH = targetH * 2 + padding * 2 + gap + footerH;
    } else {
      // Mode Strip (Vertikal)
      canvasW = targetW + padding * 2;
      canvasH = targetH * count + gap * (count - 1) + padding * 2 + footerH;
    }

    // Set ukuran canvas agar resolusi tinggi
    canvas.width = canvasW;
    canvas.height = canvasH;

    // 2. Gambar Background
    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 3. Fungsi Helper untuk Menggambar dengan CROP (Agar tidak stretch)
    const drawCroppedImage = (img, x, y, w, h) => {
      // Hitung rasio aspek sumber (foto asli) dan tujuan (kotak di canvas)
      const sourceAspect = img.width / img.height;
      const targetAspect = w / h;

      let sourceX = 0,
        sourceY = 0,
        sourceW = img.width,
        sourceH = img.height;

      // Logika Crop: Pilih bagian tengah foto
      if (sourceAspect > targetAspect) {
        // Foto asli lebih lebar dari tujuan (misal 16:9 masuk ke 4:3) -> Potong kiri kanan
        sourceW = img.height * targetAspect;
        sourceX = (img.width - sourceW) / 2;
      } else {
        // Foto asli lebih tinggi dari tujuan -> Potong atas bawah
        sourceH = img.width / targetAspect;
        sourceY = (img.height - sourceH) / 2;
      }

      // Gunakan drawImage dengan 9 parameter untuk cropping
      ctx.drawImage(
        img,
        sourceX,
        sourceY,
        sourceW,
        sourceH, // Sumber (Crop)
        x,
        y,
        w,
        h // Tujuan (Posisi di Canvas)
      );
    };

    // 4. Loop dan Gambar Semua Foto
    let photosLoaded = 0;
    rawPhotos.forEach((src, index) => {
      const img = new Image();

      img.onload = () => {
        // Tentukan posisi (x, y) berdasarkan layout
        let x, y;
        if (layoutType.includes("grid")) {
          const col = index % 2;
          const row = Math.floor(index / 2);
          x = padding + col * (targetW + gap);
          y = padding + row * (targetH + gap);
        } else {
          x = padding;
          y = padding + index * (targetH + gap);
        }

        // Gambar dengan fungsi crop tadi
        drawCroppedImage(img, x, y, targetW, targetH);

        photosLoaded++;
        // Jika foto terakhir sudah selesai, gambar dekorasi
        if (photosLoaded === rawPhotos.length) {
          drawDecorations(ctx, canvasW, canvasH);
        }
      };
      // Set src setelah mendefinisikan onload agar aman
      img.src = src;
    });
  }, [rawPhotos, layoutType, frameColor, stickers, navigate]);

  // --- FUNGSI GAMBAR TEKS & STIKER ---
  const drawDecorations = (ctx, w, h) => {
    ctx.fillStyle =
      frameColor === "#000000" || frameColor.startsWith("#3")
        ? "#ffffff"
        : "#333333";
    ctx.textAlign = "center";

    // Main Title
    ctx.font = "bold 50px Courier New";
    ctx.fillText("WAGO BOOTH", w / 2, h - 80);

    // Date & Credit
    ctx.font = "24px Arial";
    ctx.globalAlpha = 0.7;
    ctx.fillText(
      `${new Date().toLocaleDateString()} | Created with love`,
      w / 2,
      h - 35
    );
    ctx.globalAlpha = 1.0;

    // Stiker
    stickers.forEach((s) => {
      ctx.font = "100px Arial";
      ctx.fillText(s.emoji, s.x, s.y);
    });
  };

  const addSticker = (emoji) => {
    const canvas = canvasRef.current;
    // Tempatkan stiker di posisi acak yang aman
    const x = canvas.width / 2 + (Math.random() * 200 - 100);
    const y = canvas.height / 2 + (Math.random() * 200 - 100);
    setStickers([...stickers, { emoji, x, y }]);
  };

  const handleFinish = () => {
    // Pastikan canvas sudah tergambar sebelum disimpan
    if (canvasRef.current) {
      setFinalImage(canvasRef.current.toDataURL("image/png", 1.0)); // Kualitas maksimal
      navigate("/delivery");
    }
  };

  return (
    // Container Utama: Flex Row (Kiri Preview, Kanan Tools)
    <div className="h-screen w-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* 1. BAGIAN KIRI: PREVIEW HASIL (Diperbaiki CSS-nya) */}
      <div className="flex-1 bg-gray-800/10 flex items-center justify-center p-4 md:p-8 overflow-auto relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
        {/* Tombol Back kecil di pojok kiri atas preview */}
        <button
          onClick={() => navigate("/booth")}
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full text-gray-700 hover:bg-white md:hidden z-10"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Container Canvas dengan shadow agar terlihat seperti kertas foto */}
        <div className="shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] transition-all duration-300 bg-white my-auto rounded-sm overflow-hidden">
          {/* Canvas dibatasi max-height agar tidak melebihi layar */}
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[85vh] h-auto w-auto block mx-auto"
          />
        </div>
      </div>

      {/* 2. BAGIAN KANAN: TOOLS PANEL (Sidebar) */}
      <div className="w-full md:w-[400px] bg-white shadow-2xl flex flex-col z-20 border-l border-gray-200 md:h-full">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Edit Foto</h2>
          <p className="text-sm text-gray-500">
            Percantik hasil fotomu di sini.
          </p>
        </div>

        {/* Tab Menu */}
        <div className="flex border-b border-gray-100 bg-gray-50/50">
          <button
            onClick={() => setActiveTab("frame")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 text-sm font-bold transition ${
              activeTab === "frame"
                ? "text-pink-600 border-b-2 border-pink-600 bg-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Palette size={20} /> Warna Frame
          </button>
          <button
            onClick={() => setActiveTab("sticker")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 text-sm font-bold transition ${
              activeTab === "sticker"
                ? "text-pink-600 border-b-2 border-pink-600 bg-white"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <Smile size={20} /> Stiker
          </button>
        </div>

        {/* Isi Panel Tools (Scrollable) */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
          {activeTab === "frame" && (
            <div className="grid grid-cols-5 gap-3">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setFrameColor(c)}
                  className={`aspect-square rounded-full border-[3px] shadow-sm transition hover:scale-110 ${
                    frameColor === c
                      ? "border-pink-500 ring-2 ring-pink-200 scale-110"
                      : "border-white ring-1 ring-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
          {activeTab === "sticker" && (
            <div className="space-y-4">
              <div className="grid grid-cols-4 gap-3">
                {stickerOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => addSticker(emoji)}
                    className="text-4xl hover:scale-125 transition p-3 bg-gray-50 rounded-2xl border border-gray-100"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              {stickers.length > 0 && (
                <button
                  onClick={() => setStickers([])}
                  className="w-full py-2 text-red-500 text-sm font-bold border border-red-200 rounded-lg hover:bg-red-50 transition"
                >
                  Reset Stiker
                </button>
              )}
            </div>
          )}
        </div>

        {/* Tombol Aksi Bawah */}
        <div className="p-5 bg-white border-t border-gray-100 flex gap-3">
          {/* Tombol Ulang (hidden di mobile karena sudah ada di atas) */}
          <button
            onClick={() => {
              setRawPhotos([]);
              navigate("/booth");
            }}
            className="hidden md:block flex-1 py-3 border-2 border-gray-300 text-gray-700 font-bold rounded-xl hover:bg-gray-50 transition"
          >
            Ulang
          </button>
          <button
            onClick={handleFinish}
            className="flex-[2] py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold rounded-xl hover:from-pink-600 hover:to-rose-600 shadow-lg transition flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5"
          >
            <Check size={20} /> Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
export default Editor;
