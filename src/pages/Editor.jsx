import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Smile, Check, ArrowLeft, Pipette } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage, sessionConfig } = usePhoto();
  const canvasRef = useRef(null);

  // URL BACKEND (DIPECAH SUPAYA AMAN)
  const SCRIPT_ID =
    "AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu";
  const SCRIPT_URL = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

  const initialLayout = sessionConfig?.layout || "strip-4";

  const [layoutType, setLayoutType] = useState(initialLayout);
  const [bgType, setBgType] = useState("color"); // 'color', 'pattern', 'image'
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [patternColor, setPatternColor] = useState("#ff4785");
  const [selectedPattern, setSelectedPattern] = useState("dots");
  const [activeTab, setActiveTab] = useState("frame");
  const [stickers, setStickers] = useState([]);

  const [customAssets, setCustomAssets] = useState({ bgs: [], stickers: [] });

  // 1. Fetch Aset dari Google Sheet
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${SCRIPT_URL}?get=assets`);
        const data = await res.json();
        if (data.status === "success") {
          const bgs = data.assets.filter((a) => a.type === "bg");
          const stks = data.assets.filter((a) => a.type === "sticker");
          setCustomAssets({ bgs, stickers: stks });
        }
      } catch (e) {
        console.error("Gagal muat aset", e);
      }
    };
    fetchAssets();
  }, []);

  // Preset
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
  const patterns = [
    { id: "dots", name: "Polka" },
    { id: "stripes", name: "Garis" },
    { id: "grid", name: "Kotak" },
    { id: "checkers", name: "Catur" },
  ];

  const createPattern = (ctx, type, color) => {
    const tCanvas = document.createElement("canvas");
    const tCtx = tCanvas.getContext("2d");
    const size = 40;
    tCanvas.width = size;
    tCanvas.height = size;

    // Background dasar transparan agar bisa ditumpuk (atau putih)
    tCtx.fillStyle = "#ffffff";
    tCtx.fillRect(0, 0, size, size);

    // Warna Pola dari Input User
    tCtx.fillStyle = color;
    tCtx.strokeStyle = color;

    if (type === "dots") {
      tCtx.beginPath();
      tCtx.arc(size / 2, size / 2, 6, 0, 2 * Math.PI);
      tCtx.fill();
    } else if (type === "stripes") {
      tCtx.lineWidth = 4;
      tCtx.beginPath();
      tCtx.moveTo(0, 0);
      tCtx.lineTo(size, size);
      tCtx.stroke();
    } else if (type === "grid") {
      tCtx.lineWidth = 2;
      tCtx.strokeRect(0, 0, size, size);
    } else if (type === "checkers") {
      tCtx.fillRect(0, 0, size / 2, size / 2);
      tCtx.fillRect(size / 2, size / 2, size / 2, size / 2);
    }

    return ctx.createPattern(tCanvas, "repeat");
  };

  // 2. MAIN DRAWING LOGIC
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

    const drawPhotos = () => {
      let loaded = 0;
      rawPhotos.forEach((src, i) => {
        const img = new Image();
        img.onload = () => {
          let x, y;
          if (layoutType.includes("grid")) {
            const col = i % 2;
            const row = Math.floor(i / 2);
            x = padding + col * (targetW + gap);
            y = padding + row * (targetH + gap);
          } else {
            x = padding;
            y = padding + i * (targetH + gap);
          }
          // Crop Logic
          const sAspect = img.width / img.height;
          const tAspect = targetW / targetH;
          let sX = 0,
            sY = 0,
            sW = img.width,
            sH = img.height;
          if (sAspect > tAspect) {
            sW = img.height * tAspect;
            sX = (img.width - sW) / 2;
          } else {
            sH = img.width / tAspect;
            sY = (img.height - sH) / 2;
          }

          ctx.drawImage(img, sX, sY, sW, sH, x, y, targetW, targetH);
          loaded++;
          if (loaded === count) drawDecorations(ctx, canvasW, canvasH);
        };
        img.src = src;
      });
    };

    // LOGIKA RENDER BACKGROUND
    if (bgType === "color") {
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
      drawPhotos();
    } else if (bgType === "image") {
      const bgImg = new Image();
      bgImg.crossOrigin = "Anonymous";
      bgImg.src = selectedPattern;
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, canvasW, canvasH);
        drawPhotos();
      };
      bgImg.onerror = () => {
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvasW, canvasH);
        drawPhotos();
      };
    } else {
      // Render Pattern dengan warna dinamis
      const pattern = createPattern(ctx, selectedPattern, patternColor);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvasW, canvasH);
      drawPhotos();
    }
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

  const drawDecorations = (ctx, w, h) => {
    ctx.fillStyle =
      bgType === "pattern" ? "rgba(255,255,255,0.85)" : "transparent";
    if (bgType === "pattern") ctx.fillRect(0, h - 100, w, 100);

    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.font = "bold 50px Courier New";
    ctx.fillText("WAGO BOOTH", w / 2, h - 60);
    ctx.font = "20px Arial";
    ctx.fillText(new Date().toLocaleDateString(), w / 2, h - 25);

    stickers.forEach((s) => {
      if (s.type === "emoji") {
        ctx.font = "100px Arial";
        ctx.fillText(s.content, s.x, s.y);
      } else if (s.type === "image") {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = s.content;
        ctx.drawImage(img, s.x, s.y, 150, 150);
      }
    });
  };

  const addSticker = (content, type = "emoji") => {
    const x = Math.random() * 200 + 50;
    const y = Math.random() * 200 + 50;
    setStickers([...stickers, { content, type, x, y }]);
  };

  const handleFinish = () => {
    if (canvasRef.current) {
      try {
        const dataUrl = canvasRef.current.toDataURL("image/png", 1.0);
        setFinalImage(dataUrl);
        const colorForGif = bgType === "color" ? frameColor : "#ffffff";
        navigate("/delivery", { state: { frameColorForGif: colorForGif } });
      } catch (e) {
        alert("Gagal simpan. Coba ganti background.");
      }
    }
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[85vh] shadow-2xl bg-white"
        />
      </div>

      <div className="w-full md:w-[400px] bg-white shadow-2xl flex flex-col border-l">
        <div className="flex border-b bg-gray-50">
          <button
            onClick={() => setActiveTab("frame")}
            className={`flex-1 py-4 font-bold ${
              activeTab === "frame"
                ? "text-pink-600 border-b-2 border-pink-600 bg-white"
                : "text-gray-400"
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setActiveTab("sticker")}
            className={`flex-1 py-4 font-bold ${
              activeTab === "sticker"
                ? "text-pink-600 border-b-2 border-pink-600 bg-white"
                : "text-gray-400"
            }`}
          >
            Stiker
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {activeTab === "frame" && (
            <div className="space-y-6">
              {/* 1. Warna Solid */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
                  Warna Solid
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  <div className="relative aspect-square rounded-full border-2 overflow-hidden bg-gradient-to-tr from-pink-200 to-blue-200 cursor-pointer group">
                    <input
                      type="color"
                      value={frameColor}
                      onChange={(e) => {
                        setFrameColor(e.target.value);
                        setBgType("color");
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none group-hover:text-pink-600">
                      <Pipette size={16} />
                    </div>
                  </div>
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFrameColor(c);
                        setBgType("color");
                      }}
                      className={`aspect-square rounded-full border-2 shadow-sm ${
                        bgType === "color" && frameColor === c
                          ? "border-pink-500 scale-110"
                          : ""
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              {/* 2. Uploadan Admin */}
              {customAssets.bgs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Custom Backgrounds
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {customAssets.bgs.map((bg) => (
                      <button
                        key={bg.url}
                        onClick={() => {
                          setSelectedPattern(bg.url);
                          setBgType("image");
                        }}
                        className="aspect-video rounded-lg border-2 overflow-hidden hover:border-pink-500"
                      >
                        <img
                          src={bg.url}
                          className="w-full h-full object-cover"
                          alt={bg.name}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Pola & Color Picker Tekstur (FIXED) */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
                  Pola Standar
                </h3>
                <div className="flex items-center gap-2 mb-2 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <div className="w-8 h-8 rounded-full border overflow-hidden relative bg-white shadow-sm cursor-pointer">
                    <input
                      type="color"
                      value={patternColor}
                      onChange={(e) => {
                        setPatternColor(e.target.value);
                        // FORCE UPDATE: Jika user ganti warna, otomatis masuk mode pattern
                        if (bgType !== "pattern") setBgType("pattern");
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div
                      className="absolute inset-0 flex items-center justify-center"
                      style={{ backgroundColor: patternColor }}
                    ></div>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 font-bold">
                      Ganti Warna Pola
                    </span>
                    <span className="text-[10px] text-gray-400">
                      Klik lingkaran di kiri
                    </span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {patterns.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => {
                        setSelectedPattern(p.id);
                        setBgType("pattern");
                      }}
                      className={`h-12 border rounded-lg bg-white text-xs font-bold text-gray-600 hover:bg-pink-50 hover:border-pink-300 ${
                        bgType === "pattern" && selectedPattern === p.id
                          ? "border-pink-500 text-pink-600"
                          : ""
                      }`}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "sticker" && (
            <div className="space-y-6">
              {customAssets.stickers.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">
                    Stiker Premium
                  </h3>
                  <div className="grid grid-cols-4 gap-2">
                    {customAssets.stickers.map((s) => (
                      <button
                        key={s.url}
                        onClick={() => addSticker(s.url, "image")}
                        className="aspect-square p-1 border rounded hover:bg-gray-50"
                      >
                        <img
                          src={s.url}
                          className="w-full h-full object-contain"
                          alt={s.name}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-5 gap-2">
                {[
                  "❤️",
                  "⭐",
                  "🔥",
                  "✨",
                  "🌸",
                  "📸",
                  "🦋",
                  "👑",
                  "😎",
                  "🌈",
                ].map((e) => (
                  <button
                    key={e}
                    onClick={() => addSticker(e, "emoji")}
                    className="text-2xl hover:scale-125 transition p-2 bg-white rounded-lg border border-gray-100"
                  >
                    {e}
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStickers([])}
                className="w-full py-3 border-2 border-red-100 text-red-500 rounded-xl font-bold text-sm hover:bg-red-50 mt-4"
              >
                Hapus Semua Stiker
              </button>
            </div>
          )}
        </div>

        <div className="p-5 border-t bg-white">
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-pink-700 shadow-lg"
          >
            <Check /> Selesai / Kirim
          </button>
        </div>
      </div>
    </div>
  );
};
export default Editor;
