import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Smile, Check, ArrowLeft, Grid, Pipette } from "lucide-react"; // Tambah icon Pipette
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage, setRawPhotos, sessionConfig } = usePhoto();
  const canvasRef = useRef(null);

  const initialLayout = sessionConfig?.layout || "strip-4";

  // --- STATE BARU ---
  const [layoutType, setLayoutType] = useState(initialLayout);
  const [bgType, setBgType] = useState("color"); // 'color' atau 'pattern'
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [selectedPattern, setSelectedPattern] = useState("dots"); // Nama pattern aktif
  const [activeTab, setActiveTab] = useState("frame");
  const [stickers, setStickers] = useState([]);

  // Preset Warna
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

  // Pilihan Stiker
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

  // Pilihan Pattern (Tekstur)
  const patterns = [
    { id: "dots", name: "Polka", color: "#ffcdd2" },
    { id: "stripes", name: "Garis", color: "#bbdefb" },
    { id: "checkers", name: "Catur", color: "#e1bee7" },
    { id: "grid", name: "Kotak", color: "#c8e6c9" },
    { id: "confetti", name: "Pesta", color: "#fff9c4" },
    { id: "stars", name: "Bintang", color: "#ffe0b2" },
  ];

  // --- FUNGSI GENERATOR PATTERN/TEKSTUR (Aman tanpa Load Image luar) ---
  const createPattern = (ctx, type) => {
    const tCanvas = document.createElement("canvas");
    const tCtx = tCanvas.getContext("2d");

    // Ukuran dasar tile pattern
    const size = 40;
    tCanvas.width = size;
    tCanvas.height = size;

    // Background dasar pattern (biasanya putih/transparan)
    tCtx.fillStyle = "#ffffff";
    tCtx.fillRect(0, 0, size, size);

    switch (type) {
      case "dots":
        tCtx.fillStyle = "#ff80ab"; // Pink Dots
        tCtx.beginPath();
        tCtx.arc(size / 2, size / 2, 6, 0, 2 * Math.PI);
        tCtx.fill();
        break;
      case "stripes":
        tCtx.strokeStyle = "#42a5f5"; // Blue Stripes
        tCtx.lineWidth = 4;
        tCtx.beginPath();
        tCtx.moveTo(0, size);
        tCtx.lineTo(size, 0);
        tCtx.stroke();
        break;
      case "checkers":
        tCtx.fillStyle = "#ba68c8"; // Purple Checkers
        tCtx.fillRect(0, 0, size / 2, size / 2);
        tCtx.fillRect(size / 2, size / 2, size / 2, size / 2);
        break;
      case "grid":
        tCtx.strokeStyle = "#66bb6a"; // Green Grid
        tCtx.lineWidth = 2;
        tCtx.strokeRect(0, 0, size, size);
        break;
      case "confetti":
        tCtx.fillStyle = "#fbc02d"; // Yellow Confetti
        tCtx.fillRect(10, 10, 5, 10);
        tCtx.fillStyle = "#ff5252";
        tCtx.fillRect(25, 25, 8, 4);
        break;
      case "stars":
        tCtx.fillStyle = "#ff9800"; // Orange Stars
        tCtx.font = "20px Arial";
        tCtx.fillText("★", 10, 30);
        break;
      default:
        break;
    }

    return ctx.createPattern(tCanvas, "repeat");
  };

  // --- LOGIKA UTAMA MENGGAMBAR CANVAS ---
  useEffect(() => {
    if (rawPhotos.length === 0) {
      navigate("/booth");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const targetW = 640;
    const targetH = 480;
    const padding = 40;
    const gap = 20;
    const footerH = 140;

    let canvasW, canvasH;
    const count = rawPhotos.length;

    if (layoutType.includes("grid")) {
      canvasW = targetW * 2 + padding * 2 + gap;
      canvasH = targetH * 2 + padding * 2 + gap + footerH;
    } else {
      canvasW = targetW + padding * 2;
      canvasH = targetH * count + gap * (count - 1) + padding * 2 + footerH;
    }

    canvas.width = canvasW;
    canvas.height = canvasH;

    // 1. GAMBAR BACKGROUND (Warna Solid atau Texture)
    if (bgType === "color") {
      ctx.fillStyle = frameColor;
    } else {
      // Generate pattern on the fly
      const pattern = createPattern(ctx, selectedPattern);
      ctx.fillStyle = pattern;
    }
    ctx.fillRect(0, 0, canvasW, canvasH);

    // 2. Helper Crop Image
    const drawCroppedImage = (img, x, y, w, h) => {
      const sourceAspect = img.width / img.height;
      const targetAspect = w / h;
      let sourceX = 0,
        sourceY = 0,
        sourceW = img.width,
        sourceH = img.height;

      if (sourceAspect > targetAspect) {
        sourceW = img.height * targetAspect;
        sourceX = (img.width - sourceW) / 2;
      } else {
        sourceH = img.width / targetAspect;
        sourceY = (img.height - sourceH) / 2;
      }
      ctx.drawImage(img, sourceX, sourceY, sourceW, sourceH, x, y, w, h);
    };

    // 3. Loop Foto
    let photosLoaded = 0;
    rawPhotos.forEach((src, index) => {
      const img = new Image();
      img.onload = () => {
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
        drawCroppedImage(img, x, y, targetW, targetH);

        photosLoaded++;
        if (photosLoaded === rawPhotos.length) {
          drawDecorations(ctx, canvasW, canvasH);
        }
      };
      img.src = src;
    });
  }, [
    rawPhotos,
    layoutType,
    bgType,
    frameColor,
    selectedPattern,
    stickers,
    navigate,
  ]);

  const drawDecorations = (ctx, w, h) => {
    // Teks warna putih jika background gelap, hitam jika terang
    const isDark = bgType === "color" && frameColor === "#000000";
    ctx.fillStyle = isDark ? "#ffffff" : "#333333";

    // Jika pakai pattern, kasih background putih sedikit di teks footer biar terbaca
    if (bgType === "pattern") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.8)";
      ctx.fillRect(0, h - 100, w, 100);
      ctx.fillStyle = "#333333";
    }

    ctx.textAlign = "center";
    ctx.font = "bold 50px Courier New";
    ctx.fillText("WAGO BOOTH", w / 2, h - 80);

    ctx.font = "24px Arial";
    ctx.globalAlpha = 0.7;
    ctx.fillText(
      `${new Date().toLocaleDateString()} | Created with love`,
      w / 2,
      h - 35
    );
    ctx.globalAlpha = 1.0;

    stickers.forEach((s) => {
      ctx.font = "100px Arial";
      ctx.fillText(s.emoji, s.x, s.y);
    });
  };

  const addSticker = (emoji) => {
    const canvas = canvasRef.current;
    const x = canvas.width / 2 + (Math.random() * 200 - 100);
    const y = canvas.height / 2 + (Math.random() * 200 - 100);
    setStickers([...stickers, { emoji, x, y }]);
  };

  const handleFinish = () => {
    if (canvasRef.current) {
      setFinalImage(canvasRef.current.toDataURL("image/png", 1.0));
      navigate("/delivery");
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* KIRI: PREVIEW */}
      <div className="flex-1 bg-gray-800/10 flex items-center justify-center p-4 md:p-8 overflow-auto relative bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
        <button
          onClick={() => navigate("/booth")}
          className="absolute top-4 left-4 p-2 bg-white/80 backdrop-blur rounded-full text-gray-700 md:hidden z-10"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="shadow-[0_10px_40px_-10px_rgba(0,0,0,0.3)] bg-white my-auto rounded-sm overflow-hidden">
          <canvas
            ref={canvasRef}
            className="max-w-full max-h-[85vh] h-auto w-auto block mx-auto"
          />
        </div>
      </div>

      {/* KANAN: TOOLS PANEL */}
      <div className="w-full md:w-[400px] bg-white shadow-2xl flex flex-col z-20 border-l border-gray-200 md:h-full">
        <div className="p-5 border-b border-gray-100 bg-white">
          <h2 className="text-xl font-bold text-gray-800">Edit Foto</h2>
          <p className="text-sm text-gray-500">
            Pilih warna atau tekstur favoritmu!
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
            <Palette size={20} /> Background
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

        {/* Isi Panel Tools */}
        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
          {activeTab === "frame" && (
            <div className="space-y-6">
              {/* 1. SECTION WARNA SOLID */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Warna Solid
                </h3>
                <div className="grid grid-cols-5 gap-3">
                  {/* CUSTOM COLOR PICKER */}
                  <div className="relative aspect-square rounded-full overflow-hidden shadow-sm border-[3px] border-white ring-1 ring-gray-200 group cursor-pointer bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400">
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => {
                        setFrameColor(e.target.value);
                        setBgType("color");
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-white group-hover:scale-110 transition">
                      <Pipette size={20} />
                    </div>
                  </div>

                  {/* PRESET COLORS */}
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFrameColor(c);
                        setBgType("color");
                      }}
                      className={`aspect-square rounded-full border-[3px] shadow-sm transition hover:scale-110 ${
                        bgType === "color" && frameColor === c
                          ? "border-pink-500 ring-2 ring-pink-200 scale-110"
                          : "border-white ring-1 ring-gray-200"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* 2. SECTION TEKSTUR (PATTERN) */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                  Tekstur & Pola
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {patterns.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => {
                        setSelectedPattern(pat.id);
                        setBgType("pattern");
                      }}
                      className={`h-20 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition relative overflow-hidden ${
                        bgType === "pattern" && selectedPattern === pat.id
                          ? "border-pink-500 bg-pink-50 ring-2 ring-pink-200"
                          : "border-gray-100 hover:border-gray-300"
                      }`}
                    >
                      {/* Preview Mini Pattern */}
                      <div
                        className="absolute inset-0 opacity-20"
                        style={{
                          backgroundImage: `radial-gradient(${pat.color} 2px, transparent 2px)`,
                          backgroundSize: "10px 10px",
                        }}
                      ></div>
                      <span className="relative z-10 font-bold text-gray-600 text-sm">
                        {pat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
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

        <div className="p-5 bg-white border-t border-gray-100 flex gap-3">
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
