import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Smile, Check, ArrowLeft, Pipette } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage, setRawPhotos, sessionConfig } = usePhoto();
  const canvasRef = useRef(null);

  const initialLayout = sessionConfig?.layout || "strip-4";

  // --- STATE ---
  const [layoutType, setLayoutType] = useState(initialLayout);
  const [bgType, setBgType] = useState("color"); // 'color' atau 'pattern'
  const [frameColor, setFrameColor] = useState("#ffffff"); // Warna Solid Background

  // Warna khusus untuk Pattern/Tekstur
  const [patternColor, setPatternColor] = useState("#ff4785"); // Default pink
  const [selectedPattern, setSelectedPattern] = useState("dots");

  const [activeTab, setActiveTab] = useState("frame");
  const [stickers, setStickers] = useState([]);

  // Preset Warna Solid
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

  // --- DATA POLA (VARIASI LENGKAP) ---
  const patterns = [
    // Klasik
    { id: "dots", name: "Polka" },
    { id: "stripes", name: "Garis" },
    { id: "grid", name: "Kotak" },
    { id: "checkers", name: "Catur" },
    // Bentuk Geometris
    { id: "diagonal", name: "Diagonal" },
    { id: "triangles", name: "Segitiga" },
    { id: "zigzag", name: "Zigzag" },
    { id: "cross", name: "Silang" },
    { id: "plus", name: "Plus" },
    // Bentuk Organik & Seru
    { id: "waves", name: "Ombak" },
    { id: "confetti", name: "Pesta" },
    { id: "stars", name: "Bintang" },
    { id: "hearts", name: "Hati" },
    { id: "circles", name: "Lingkaran" },
    { id: "diamond", name: "Wajik" },
    { id: "bricks", name: "Bata" },
  ];

  // --- FUNGSI GENERATOR PATTERN DINAMIS ---
  const createPattern = (ctx, type, color) => {
    const tCanvas = document.createElement("canvas");
    const tCtx = tCanvas.getContext("2d");

    const size = 40; // Ukuran tile dasar
    tCanvas.width = size;
    tCanvas.height = size;

    // Background dasar tile (Putih)
    tCtx.fillStyle = "#ffffff";
    tCtx.fillRect(0, 0, size, size);

    // Set warna pola sesuai input user
    tCtx.fillStyle = color;
    tCtx.strokeStyle = color;

    switch (type) {
      // --- KLASIK ---
      case "dots":
        tCtx.beginPath();
        tCtx.arc(size / 2, size / 2, 6, 0, 2 * Math.PI);
        tCtx.fill();
        break;
      case "stripes":
        tCtx.lineWidth = 4;
        tCtx.beginPath();
        tCtx.moveTo(0, 0);
        tCtx.lineTo(size, size);
        tCtx.stroke();
        break;
      case "grid":
        tCtx.lineWidth = 2;
        tCtx.strokeRect(0, 0, size, size);
        break;
      case "checkers":
        tCtx.fillRect(0, 0, size / 2, size / 2);
        tCtx.fillRect(size / 2, size / 2, size / 2, size / 2);
        break;

      // --- GEOMETRIS ---
      case "diagonal":
        tCtx.lineWidth = 2;
        tCtx.beginPath();
        tCtx.moveTo(0, size / 2);
        tCtx.lineTo(size / 2, 0);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(size / 2, size);
        tCtx.lineTo(size, size / 2);
        tCtx.stroke();
        break;
      case "triangles":
        tCtx.beginPath();
        tCtx.moveTo(size / 2, 10);
        tCtx.lineTo(10, size - 10);
        tCtx.lineTo(size - 10, size - 10);
        tCtx.closePath();
        tCtx.fill();
        break;
      case "zigzag":
        tCtx.lineWidth = 3;
        tCtx.beginPath();
        tCtx.moveTo(0, size / 2);
        tCtx.lineTo(size / 4, size / 4);
        tCtx.lineTo(size * 0.75, size * 0.75);
        tCtx.lineTo(size, size / 2);
        tCtx.stroke();
        break;
      case "cross":
        tCtx.lineWidth = 3;
        tCtx.beginPath();
        tCtx.moveTo(10, 10);
        tCtx.lineTo(size - 10, size - 10);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(size - 10, 10);
        tCtx.lineTo(10, size - 10);
        tCtx.stroke();
        break;
      case "plus":
        tCtx.lineWidth = 4;
        tCtx.beginPath();
        tCtx.moveTo(size / 2, 5);
        tCtx.lineTo(size / 2, size - 5);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(5, size / 2);
        tCtx.lineTo(size - 5, size / 2);
        tCtx.stroke();
        break;

      // --- ORGANIK ---
      case "waves":
        tCtx.lineWidth = 3;
        tCtx.beginPath();
        tCtx.moveTo(0, size / 2);
        tCtx.bezierCurveTo(
          size / 4,
          size / 4,
          size * 0.75,
          size * 0.75,
          size,
          size / 2
        );
        tCtx.stroke();
        break;
      case "confetti":
        tCtx.fillRect(10, 10, 6, 10);
        tCtx.fillRect(25, 25, 10, 6);
        tCtx.fillRect(5, 30, 8, 8);
        break;
      case "stars":
        tCtx.font = "24px Arial";
        tCtx.fillText("★", 8, 28);
        break;
      case "hearts":
        tCtx.font = "24px Arial";
        tCtx.fillText("♥", 8, 28);
        break;
      case "circles":
        tCtx.beginPath();
        tCtx.arc(size / 2, size / 2, 10, 0, 2 * Math.PI);
        tCtx.stroke();
        break;
      case "diamond":
        tCtx.beginPath();
        tCtx.moveTo(size / 2, 5);
        tCtx.lineTo(size - 5, size / 2);
        tCtx.lineTo(size / 2, size - 5);
        tCtx.lineTo(5, size / 2);
        tCtx.closePath();
        tCtx.fill();
        break;
      case "bricks":
        tCtx.lineWidth = 2;
        tCtx.strokeRect(0, 0, size, size / 2);
        tCtx.strokeRect(0, size / 2, size, size / 2);
        tCtx.beginPath();
        tCtx.moveTo(size / 2, 0);
        tCtx.lineTo(size / 2, size / 2);
        tCtx.stroke();
        tCtx.beginPath();
        tCtx.moveTo(size / 2, size / 2);
        tCtx.lineTo(size / 2, size);
        tCtx.stroke();
        break;
      default:
        break;
    }

    return ctx.createPattern(tCanvas, "repeat");
  };

  // --- LOGIKA DRAWING UTAMA ---
  useEffect(() => {
    if (rawPhotos.length === 0) {
      navigate("/booth");
      return;
    }

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    // Konfigurasi Ukuran & Padding
    const targetW = 640;
    const targetH = 480;
    const padding = 40;
    const gap = 20;
    const footerH = 140;

    let canvasW, canvasH;
    const count = rawPhotos.length;

    // Hitung Ukuran Canvas
    if (layoutType.includes("grid")) {
      canvasW = targetW * 2 + padding * 2 + gap;
      canvasH = targetH * 2 + padding * 2 + gap + footerH;
    } else {
      canvasW = targetW + padding * 2;
      canvasH = targetH * count + gap * (count - 1) + padding * 2 + footerH;
    }
    canvas.width = canvasW;
    canvas.height = canvasH;

    // 1. DRAW BACKGROUND
    if (bgType === "color") {
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else {
      const pattern = createPattern(ctx, selectedPattern, patternColor);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    // 2. Helper Crop & Draw (Anti-Stretch)
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

    // 3. Loop Draw Photos
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
        if (photosLoaded === rawPhotos.length)
          drawDecorations(ctx, canvasW, canvasH);
      };
      img.src = src;
    });
  }, [
    rawPhotos,
    layoutType,
    bgType,
    frameColor,
    selectedPattern,
    patternColor,
    stickers,
    navigate,
  ]);

  // --- DEKORASI (TEXT & STICKERS) ---
  const drawDecorations = (ctx, w, h) => {
    let isDark = false;
    if (bgType === "color") {
      isDark = frameColor === "#000000" || frameColor.startsWith("#3");
    } else {
      isDark = patternColor === "#000000" || patternColor.startsWith("#3");
    }

    ctx.fillStyle = isDark ? "#ffffff" : "#333333";

    // Background putih transparan di footer jika pakai pattern
    if (bgType === "pattern") {
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fillRect(0, h - 110, w, 110);
      ctx.fillStyle = "#333333";
    }

    ctx.textAlign = "center";
    ctx.font = "bold 50px Courier New";
    ctx.fillText("WAGO BOOTH", w / 2, h - 70);
    ctx.font = "24px Arial";
    ctx.globalAlpha = 0.7;
    ctx.fillText(
      `${new Date().toLocaleDateString()} | Created with love`,
      w / 2,
      h - 30
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

  // --- FINISH HANDLER (Kirim Warna ke Delivery untuk GIF) ---
  const handleFinish = () => {
    if (canvasRef.current) {
      setFinalImage(canvasRef.current.toDataURL("image/png", 1.0));

      // Kirim warna frame saat ini agar GIF juga punya frame sama
      const colorForGif = bgType === "color" ? frameColor : "#ffffff";
      navigate("/delivery", { state: { frameColorForGif: colorForGif } });
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
            Kreasikan background sesukamu!
          </p>
        </div>

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

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar bg-white">
          {activeTab === "frame" && (
            <div className="space-y-8 animate-fade-in-up">
              {/* SECTION 1: WARNA SOLID */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Warna Solid Polos{" "}
                  <div className="h-px bg-gray-200 flex-1"></div>
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {/* Color Picker Solid */}
                  <div className="relative aspect-square rounded-xl overflow-hidden shadow-sm border-2 border-gray-200 group cursor-pointer bg-gradient-to-tr from-gray-100 to-gray-300 hover:border-pink-400 transition">
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => {
                        setFrameColor(e.target.value);
                        setBgType("color");
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-gray-500 group-hover:text-pink-500 transition">
                      <Pipette size={18} />
                    </div>
                  </div>
                  {/* Presets Solid */}
                  {colors.slice(0, 5).map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFrameColor(c);
                        setBgType("color");
                      }}
                      className={`aspect-square rounded-xl border-2 shadow-sm transition hover:scale-105 ${
                        bgType === "color" && frameColor === c
                          ? "border-pink-500 ring-2 ring-pink-100"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* SECTION 2: TEKSTUR & POLA */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                  Tekstur & Pola <div className="h-px bg-gray-200 flex-1"></div>
                </h3>

                {/* Color Picker Pola */}
                <div className="flex items-center gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div
                    className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-200 cursor-pointer"
                    style={{ backgroundColor: patternColor }}
                  >
                    <input
                      type="color"
                      value={patternColor}
                      onChange={(e) => {
                        setPatternColor(e.target.value);
                        if (bgType !== "pattern") setBgType("pattern");
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">
                      Ganti Warna Pola
                    </p>
                    <p className="text-xs text-gray-400">
                      Klik lingkaran untuk ubah warna.
                    </p>
                  </div>
                </div>

                {/* Grid Pola */}
                <div className="grid grid-cols-3 gap-2">
                  {patterns.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => {
                        setSelectedPattern(pat.id);
                        setBgType("pattern");
                      }}
                      className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 transition relative overflow-hidden hover:border-pink-300 hover:bg-pink-50/50 ${
                        bgType === "pattern" && selectedPattern === pat.id
                          ? "border-pink-500 bg-pink-50 ring-2 ring-pink-100"
                          : "border-gray-100"
                      }`}
                    >
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `radial-gradient(${patternColor} 20%, transparent 20%), radial-gradient(${patternColor} 20%, transparent 20%)`,
                          backgroundPosition: "0 0, 5px 5px",
                          backgroundSize: "10px 10px",
                        }}
                      ></div>
                      <span className="relative z-10 font-bold text-gray-600 text-[11px] uppercase tracking-tight">
                        {pat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sticker" && (
            <div className="space-y-4 animate-fade-in-up">
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
