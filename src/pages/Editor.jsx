import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Smile, Check, ArrowLeft, Pipette } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage } = usePhoto();
  const canvasRef = useRef(null);

  // URL Backend Google Apps Script
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec";

  // State
  const [bgType, setBgType] = useState("color");
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [selectedBgUrl, setSelectedBgUrl] = useState("");
  const [patternColor, setPatternColor] = useState("#ff4785");
  const [selectedPattern, setSelectedPattern] = useState("dots");

  const [activeTab, setActiveTab] = useState("background");
  const [customAssets, setCustomAssets] = useState({ bgs: [], stickers: [] });
  const [stickers, setStickers] = useState([]);

  const colors = [
    "#ffffff",
    "#333333",
    "#ffb7b2",
    "#ffdac1",
    "#e2f0cb",
    "#b5ead7",
    "#c7ceea",
    "#ff9aa2",
    "#fecaca",
    "#fef3c7",
  ];

  const patterns = [
    { id: "dots", name: "Polka" },
    { id: "stripes", name: "Garis" },
    { id: "grid", name: "Kotak" },
    { id: "checkers", name: "Catur" },
    { id: "diagonal", name: "Diagonal" },
    { id: "triangles", name: "Segitiga" },
    { id: "waves", name: "Ombak" },
    { id: "stars", name: "Bintang" },
  ];

  // Helper: Ubah Link Drive agar bisa dibaca Canvas
  const getSafeUrl = (url) => {
    if (url.includes("drive.google.com/uc?export=view&id=")) {
      const id = url.split("id=")[1];
      return `https://lh3.googleusercontent.com/d/${id}`;
    }
    return url;
  };

  // Proteksi Halaman Blank
  useEffect(() => {
    if (!rawPhotos || rawPhotos.length === 0) navigate("/booth");
  }, [rawPhotos, navigate]);

  // Load Aset dari Google Sheet
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        const res = await fetch(`${SCRIPT_URL}?get=assets`);
        const data = await res.json();
        if (data.status === "success") {
          setCustomAssets({
            bgs: data.assets.filter((a) => a.type === "bg"),
            stickers: data.assets.filter((a) => a.type === "sticker"),
          });
        }
      } catch (e) {
        console.error("Gagal muat aset:", e);
      }
    };
    fetchAssets();
  }, [SCRIPT_URL]);

  // Generator Pola Dinamis
  const createPattern = (ctx, type, color) => {
    const tCanvas = document.createElement("canvas");
    const tCtx = tCanvas.getContext("2d");
    const size = 40;
    tCanvas.width = size;
    tCanvas.height = size;

    tCtx.fillStyle = "#ffffff";
    tCtx.fillRect(0, 0, size, size); // Base Putih
    tCtx.fillStyle = color;
    tCtx.strokeStyle = color;

    switch (type) {
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
      case "diagonal":
        tCtx.lineWidth = 2;
        tCtx.beginPath();
        tCtx.moveTo(0, size);
        tCtx.lineTo(size, 0);
        tCtx.stroke();
        break;
      case "triangles":
        tCtx.beginPath();
        tCtx.moveTo(size / 2, 10);
        tCtx.lineTo(10, size - 10);
        tCtx.lineTo(size - 10, size - 10);
        tCtx.fill();
        break;
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
      case "stars":
        tCtx.font = "24px Arial";
        tCtx.fillText("★", 8, 28);
        break;
      default:
        break;
    }
    return ctx.createPattern(tCanvas, "repeat");
  };

  // Fungsi Anti-Gepeng (Crop Tengah)
  const drawImageProp = (ctx, img, x, y, w, h) => {
    const offsetX = 0.5,
      offsetY = 0.5;
    let iw = img.width,
      ih = img.height,
      r = Math.min(w / iw, h / ih),
      nw = iw * r,
      nh = ih * r,
      cx,
      cy,
      cw,
      ch,
      ar = 1;

    if (nw < w) ar = w / nw;
    if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;
    nw *= ar;
    nh *= ar;

    cw = iw / (nw / w);
    ch = ih / (nh / h);
    cx = (iw - cw) * offsetX;
    cy = (ih - ch) * offsetY;

    if (cx < 0) cx = 0;
    if (cy < 0) cy = 0;
    if (cw > iw) cw = iw;
    if (ch > ih) ch = ih;

    ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
  };

  // --- RENDER CANVAS UTAMA (FIXED VERSION) ---
  useEffect(() => {
    if (!rawPhotos || rawPhotos.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    // Setting Ukuran
    const targetW = 640;
    const targetH = 480;
    const padding = 40;
    const gap = 20;
    const footerH = 140;
    const canvasW = targetW + padding * 2;
    const canvasH =
      targetH * rawPhotos.length +
      gap * (rawPhotos.length - 1) +
      padding * 2 +
      footerH;

    canvas.width = canvasW;
    canvas.height = canvasH;

    const renderCanvas = async () => {
      // 1. RESET CANVAS (PENTING)
      ctx.clearRect(0, 0, canvasW, canvasH);
      ctx.globalCompositeOperation = "source-over"; // Reset blending mode ke normal
      ctx.globalAlpha = 1.0;
      ctx.shadowBlur = 0;

      // 2. LAYER 1: BACKGROUND (Paling Bawah)
      ctx.save();
      if (bgType === "color") {
        ctx.fillStyle = frameColor;
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (bgType === "pattern") {
        const ptrn = createPattern(ctx, selectedPattern, patternColor);
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (bgType === "image" && selectedBgUrl) {
        try {
          const bgImg = new Image();
          bgImg.crossOrigin = "anonymous";
          bgImg.src = getSafeUrl(selectedBgUrl);
          await new Promise((resolve) => {
            bgImg.onload = resolve;
            bgImg.onerror = resolve;
          });
          drawImageProp(ctx, bgImg, 0, 0, canvasW, canvasH);
        } catch (err) {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvasW, canvasH);
        }
      }
      ctx.restore();

      // 3. LAYER 2: FOTO USER
      for (let i = 0; i < rawPhotos.length; i++) {
        const img = new Image();
        img.src = rawPhotos[i];
        // Tunggu image load
        await new Promise((r) => (img.onload = r));

        const y = padding + i * (targetH + gap);

        // --- FIX UTAMA: LAYER PELINDUNG ---
        // Kita paksa mode gambar normal
        ctx.globalCompositeOperation = "source-over";

        // Gambar KOTAK PUTIH SOLID dulu di posisi foto
        // Ini menutupi pola polkadot yang ada di background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(padding, y, targetW, targetH);

        // Baru gambar foto di atas kotak putih itu
        drawImageProp(ctx, img, padding, y, targetW, targetH);

        // (Opsional) Border tipis biar rapi
        ctx.strokeStyle = "rgba(0,0,0,0.1)";
        ctx.lineWidth = 1;
        ctx.strokeRect(padding, y, targetW, targetH);
      }

      // 4. LAYER 3: FOOTER
      ctx.globalCompositeOperation = "source-over";
      let isDark =
        bgType === "color" &&
        (frameColor === "#000000" || frameColor === "#333333");

      if (bgType === "pattern") {
        ctx.fillStyle = "rgba(255,255,255,0.9)";
        ctx.fillRect(0, canvasH - 110, canvasW, 110);
        isDark = false;
      }

      ctx.fillStyle = isDark ? "#ffffff" : "#333333";
      ctx.textAlign = "center";
      ctx.font = "bold 50px Courier New";
      ctx.fillText("WAGO BOOTH", canvasW / 2, canvasH - 70);
      ctx.font = "24px Arial";
      ctx.fillText(new Date().toLocaleDateString(), canvasW / 2, canvasH - 30);

      // 5. LAYER 4: STIKER (Paling Atas)
      for (const s of stickers) {
        const sImg = new Image();
        sImg.crossOrigin = "anonymous";
        sImg.src = getSafeUrl(s.url);
        try {
          await new Promise((r) => (sImg.onload = r));
          ctx.drawImage(sImg, s.x, s.y, 150, 150);
        } catch (e) {}
      }
    };

    renderCanvas();
  }, [
    rawPhotos,
    bgType,
    frameColor,
    selectedBgUrl,
    selectedPattern,
    patternColor,
    stickers,
  ]);

  const addSticker = (url) =>
    setStickers([
      ...stickers,
      { url, x: Math.random() * 400, y: Math.random() * 400 },
    ]);

  const handleFinish = () => {
    if (canvasRef.current) {
      setFinalImage(canvasRef.current.toDataURL("image/png", 1.0));
      const colorForGif = bgType === "color" ? frameColor : "#ffffff";
      navigate("/delivery", { state: { frameColorForGif: colorForGif } });
    }
  };

  if (!rawPhotos || rawPhotos.length === 0)
    return (
      <div className="h-screen flex items-center justify-center">Memuat...</div>
    );

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* KIRI: Preview */}
      <div className="flex-1 flex items-center justify-center p-4 bg-gray-200 overflow-auto">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full shadow-2xl bg-white"
        />
      </div>

      {/* KANAN: Tools */}
      <div className="w-full md:w-[400px] bg-white shadow-2xl flex flex-col border-l z-20">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("background")}
            className={`flex-1 py-4 font-bold text-sm uppercase ${
              activeTab === "background"
                ? "text-pink-600 border-b-2"
                : "text-gray-400"
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setActiveTab("stiker")}
            className={`flex-1 py-4 font-bold text-sm uppercase ${
              activeTab === "stiker"
                ? "text-pink-600 border-b-2"
                : "text-gray-400"
            }`}
          >
            Stiker
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto custom-scrollbar">
          {activeTab === "background" && (
            <div className="space-y-8">
              {/* WARNA SOLID */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                  Warna Solid
                </h3>
                <div className="grid grid-cols-6 gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      onClick={() => {
                        setFrameColor(c);
                        setBgType("color");
                        setSelectedBgUrl("");
                      }}
                      className={`aspect-square rounded-full border-2 transition hover:scale-110 ${
                        bgType === "color" && frameColor === c
                          ? "border-pink-500 scale-110 shadow-md"
                          : "border-gray-200"
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <div className="relative aspect-square rounded-full border-2 flex items-center justify-center bg-gray-100 cursor-pointer">
                    <input
                      type="color"
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      onChange={(e) => {
                        setFrameColor(e.target.value);
                        setBgType("color");
                        setSelectedBgUrl("");
                      }}
                    />
                    <Pipette size={16} className="text-gray-500" />
                  </div>
                </div>
              </div>

              {/* CUSTOM BACKGROUND */}
              {customAssets.bgs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Custom Backgrounds
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {customAssets.bgs.map((bg, idx) => (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedBgUrl(bg.url);
                          setBgType("image");
                        }}
                        className={`relative aspect-video rounded-xl overflow-hidden border-2 transition ${
                          bgType === "image" && selectedBgUrl === bg.url
                            ? "border-pink-500 ring-2"
                            : "border-gray-100 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={getSafeUrl(bg.url)}
                          crossOrigin="anonymous"
                          alt={bg.name}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* POLA STANDAR */}
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                  Pola & Tekstur
                </h3>
                <div className="flex items-center gap-3 mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                  <div
                    className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-white shadow-sm ring-1 ring-gray-200 cursor-pointer"
                    style={{ backgroundColor: patternColor }}
                  >
                    <input
                      type="color"
                      className="absolute w-full h-full opacity-0 cursor-pointer z-10"
                      value={patternColor}
                      onChange={(e) => {
                        setPatternColor(e.target.value);
                        if (bgType !== "pattern") setBgType("pattern");
                      }}
                    />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-700">
                      Ganti Warna Pola
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {patterns.map((pat) => (
                    <button
                      key={pat.id}
                      onClick={() => {
                        setSelectedPattern(pat.id);
                        setBgType("pattern");
                      }}
                      className={`h-16 rounded-xl border-2 flex flex-col items-center justify-center gap-1 ${
                        bgType === "pattern" && selectedPattern === pat.id
                          ? "border-pink-500 bg-pink-50"
                          : "border-gray-100"
                      }`}
                    >
                      <div
                        className="absolute inset-0 opacity-10"
                        style={{
                          backgroundImage: `radial-gradient(${patternColor} 20%, transparent 20%)`,
                          backgroundSize: "10px 10px",
                        }}
                      ></div>
                      <span className="relative z-10 font-bold text-gray-600 text-[10px] uppercase">
                        {pat.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "stiker" && (
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                Stiker
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {customAssets.stickers.map((stk, idx) => (
                  <button
                    key={idx}
                    onClick={() => addSticker(stk.url)}
                    className="aspect-square border rounded-xl p-2 hover:bg-gray-50"
                  >
                    <img
                      src={getSafeUrl(stk.url)}
                      crossOrigin="anonymous"
                      alt="stk"
                      className="w-full h-full object-contain"
                    />
                  </button>
                ))}
              </div>
              <button
                onClick={() => setStickers([])}
                className="w-full mt-6 py-2 text-red-500 text-sm font-bold border rounded-lg hover:bg-red-50"
              >
                Hapus Semua
              </button>
            </div>
          )}
        </div>

        <div className="p-6 border-t bg-gray-50">
          <button
            onClick={handleFinish}
            className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" /> Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
export default Editor;
