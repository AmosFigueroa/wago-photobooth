import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Smile, Check, Layout as LayoutIcon } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage, setRawPhotos, sessionConfig } = usePhoto();
  const canvasRef = useRef(null);

  // Ambil config dari context, atau default jika error
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
  ];

  useEffect(() => {
    if (rawPhotos.length === 0) {
      navigate("/booth");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Config Ukuran
    const photoW = 640;
    const photoH = 480;
    const padding = 40;
    const gap = 20;
    const footerH = 120;

    let canvasW, canvasH;
    const count = rawPhotos.length; // Jumlah foto aktual yang ada

    // LOGIKA LAYOUT DINAMIS
    if (layoutType.includes("grid")) {
      // --- MODE GRID (2x2) ---
      canvasW = photoW * 2 + padding * 2 + gap;
      canvasH = photoH * 2 + padding * 2 + gap + footerH;
    } else {
      // --- MODE STRIP (Vertikal) ---
      canvasW = photoW + padding * 2;
      canvasH = photoH * count + gap * (count - 1) + padding * 2 + footerH;
    }

    canvas.width = canvasW;
    canvas.height = canvasH;

    // Background
    ctx.fillStyle = frameColor;
    ctx.fillRect(0, 0, canvasW, canvasH);

    // Gambar Foto
    rawPhotos.forEach((src, index) => {
      const img = new Image();
      img.src = src;

      let x, y;
      if (layoutType.includes("grid")) {
        const col = index % 2;
        const row = Math.floor(index / 2);
        x = padding + col * (photoW + gap);
        y = padding + row * (photoH + gap);
      } else {
        x = padding;
        y = padding + index * (photoH + gap);
      }

      const draw = () => {
        ctx.drawImage(img, x, y, photoW, photoH);
        if (index === rawPhotos.length - 1)
          drawDecorations(ctx, canvasW, canvasH);
      };

      if (img.complete) draw();
      else img.onload = draw;
    });
  }, [rawPhotos, layoutType, frameColor, stickers, navigate]);

  const drawDecorations = (ctx, w, h) => {
    ctx.fillStyle = frameColor === "#000000" ? "#ffffff" : "#333333";
    ctx.font = "bold 40px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("WAGO BOOTH", w / 2, h - 60);
    ctx.font = "20px Arial";
    ctx.fillText(new Date().toLocaleDateString(), w / 2, h - 25);

    stickers.forEach((s) => {
      ctx.font = "80px Arial";
      ctx.fillText(s.emoji, s.x, s.y);
    });
  };

  const addSticker = (emoji) => {
    const canvas = canvasRef.current;
    const x = Math.random() * (canvas.width - 100) + 50;
    const y = Math.random() * (canvas.height - 100) + 50;
    setStickers([...stickers, { emoji, x, y }]);
  };

  const handleFinish = () => {
    setFinalImage(canvasRef.current.toDataURL("image/png"));
    navigate("/delivery");
  };

  return (
    <div className="h-screen bg-gray-100 flex overflow-hidden font-sans">
      {/* 1. KIRI: HASIL FOTO DI SAMPING (Scrollable) */}
      <div className="flex-1 bg-gray-200 flex items-center justify-center p-8 overflow-y-auto relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:16px_16px]">
        <div className="shadow-2xl transition-all duration-500 ease-in-out transform origin-top my-auto">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[90vh] h-auto w-auto block bg-white"
          />
        </div>
      </div>

      {/* 2. KANAN: TOOLS PANEL */}
      <div className="w-96 bg-white shadow-2xl flex flex-col z-20 border-l border-gray-200">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Edit Foto</h2>
          <p className="text-sm text-gray-500">Sesuaikan hasil fotomu.</p>
        </div>

        <div className="flex border-b border-gray-100">
          <button
            onClick={() => setActiveTab("frame")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 text-sm font-semibold ${
              activeTab === "frame"
                ? "text-pink-500 border-b-2 border-pink-500"
                : "text-gray-400"
            }`}
          >
            <Palette size={20} /> Warna
          </button>
          <button
            onClick={() => setActiveTab("sticker")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 text-sm font-semibold ${
              activeTab === "sticker"
                ? "text-pink-500 border-b-2 border-pink-500"
                : "text-gray-400"
            }`}
          >
            <Smile size={20} /> Stiker
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {activeTab === "frame" && (
            <div className="grid grid-cols-4 gap-4">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setFrameColor(c)}
                  className={`w-12 h-12 rounded-full border-2 shadow-sm transition hover:scale-110 ${
                    frameColor === c
                      ? "border-pink-500 ring-2 ring-pink-200"
                      : "border-gray-200"
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          )}
          {activeTab === "sticker" && (
            <div className="grid grid-cols-4 gap-4">
              {stickerOptions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => addSticker(emoji)}
                  className="text-3xl hover:scale-125 transition p-2 bg-gray-50 rounded-lg"
                >
                  {emoji}
                </button>
              ))}
              <button
                onClick={() => setStickers([])}
                className="col-span-4 mt-4 py-2 text-red-500 text-sm font-bold border border-red-200 rounded-lg hover:bg-red-50"
              >
                Hapus Stiker
              </button>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-gray-100 flex gap-4">
          <button
            onClick={() => {
              setRawPhotos([]);
              navigate("/booth");
            }}
            className="flex-1 py-3 border-2 border-gray-300 text-gray-600 font-bold rounded-xl hover:bg-gray-50 transition"
          >
            Ulang
          </button>
          <button
            onClick={handleFinish}
            className="flex-[2] py-3 bg-[#ff4785] text-white font-bold rounded-xl hover:bg-[#ff2e73] shadow-lg transition flex items-center justify-center gap-2"
          >
            <Check size={20} /> Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
export default Editor;
