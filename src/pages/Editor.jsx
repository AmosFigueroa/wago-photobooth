import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Palette, Smile, Check, ArrowLeft, Pipette } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage, setRawPhotos, sessionConfig } = usePhoto();
  const canvasRef = useRef(null);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec"; // GANTI DENGAN URL APPS SCRIPT KAMU

  const [bgType, setBgType] = useState("color");
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [patternColor, setPatternColor] = useState("#ff4785");
  const [selectedPattern, setSelectedPattern] = useState("dots");
  const [activeTab, setActiveTab] = useState("background");
  const [stickers, setStickers] = useState([]);
  const [customAssets, setCustomAssets] = useState({ bgs: [], stickers: [] });

  // Load Aset dari Database
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
        console.error("Gagal muat aset");
      }
    };
    fetchAssets();
  }, [SCRIPT_URL]);

  const colors = [
    "#ffffff",
    "#000000",
    "#ffb7b2",
    "#ffdac1",
    "#e2f0cb",
    "#b5ead7",
    "#c7ceea",
    "#ff9aa2",
    "#fecaca",
    "#fef3c7",
  ];

  // Fungsi helper agar gambar tidak stretch (Object Fit: Cover)
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

  useEffect(() => {
    if (!rawPhotos.length) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const targetW = 640,
      targetH = 440,
      padding = 40,
      gap = 20,
      footerH = 120;
    const canvasW = targetW + padding * 2;
    const canvasH =
      targetH * rawPhotos.length +
      gap * (rawPhotos.length - 1) +
      padding * 2 +
      footerH;

    canvas.width = canvasW;
    canvas.height = canvasH;

    const render = async () => {
      // 1. Draw Background
      if (bgType === "color") {
        ctx.fillStyle = frameColor;
        ctx.fillRect(0, 0, canvasW, canvasH);
      } else if (bgType === "image") {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = selectedPattern;
        await new Promise((r) => (img.onload = r));
        drawImageProp(ctx, img, 0, 0, canvasW, canvasH);
      }

      // 2. Draw Photos (Anti-Stretch)
      for (let i = 0; i < rawPhotos.length; i++) {
        const img = new Image();
        img.src = rawPhotos[i];
        await new Promise((r) => (img.onload = r));
        const y = padding + i * (targetH + gap);
        drawImageProp(ctx, img, padding, y, targetW, targetH);
      }

      // 3. Draw WM & Text
      ctx.textAlign = "center";
      ctx.fillStyle =
        frameColor === "#000000" && bgType === "color" ? "#fff" : "#333";
      ctx.font = "bold 40px Courier New";
      ctx.fillText("WAGO BOOTH", canvasW / 2, canvasH - 60);
      ctx.font = "20px Arial";
      ctx.fillText(new Date().toLocaleDateString(), canvasW / 2, canvasH - 30);

      // 4. Draw Stickers (With WM if from Admin)
      stickers.forEach((s) => {
        const sImg = new Image();
        sImg.crossOrigin = "anonymous";
        sImg.src = s.url;
        sImg.onload = () => {
          ctx.drawImage(sImg, s.x, s.y, 150, 150);
          // Tambah WM kecil di bawah stiker admin
          ctx.font = "bold 12px Arial";
          ctx.fillStyle = "rgba(0,0,0,0.3)";
          ctx.fillText("WAGO", s.x + 75, s.y + 145);
        };
      });
    };

    render();
  }, [rawPhotos, bgType, frameColor, selectedPattern, patternColor, stickers]);

  const addSticker = (url) => {
    setStickers([
      ...stickers,
      { url, x: Math.random() * 300, y: Math.random() * 600 },
    ]);
  };

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      {/* Preview Area */}
      <div className="flex-1 flex items-center justify-center p-4 bg-slate-200 overflow-auto">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full shadow-2xl bg-white"
        />
      </div>

      {/* Sidebar Tools */}
      <div className="w-full md:w-[400px] bg-white shadow-2xl flex flex-col border-l">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("background")}
            className={`flex-1 py-4 font-bold ${
              activeTab === "background"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-400"
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setActiveTab("stiker")}
            className={`flex-1 py-4 font-bold ${
              activeTab === "stiker"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-400"
            }`}
          >
            Stiker
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "background" && (
            <div className="space-y-6">
              <h3 className="text-sm font-bold text-gray-400 uppercase">
                Warna Solid
              </h3>
              <div className="grid grid-cols-5 gap-2">
                {colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setFrameColor(c);
                      setBgType("color");
                    }}
                    className={`aspect-square rounded-full border-2 ${
                      frameColor === c && bgType === "color"
                        ? "border-pink-500 scale-110"
                        : "border-gray-100"
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>

              {customAssets.bgs.length > 0 && (
                <>
                  <h3 className="text-sm font-bold text-gray-400 uppercase mt-6">
                    Custom Backgrounds
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {customAssets.bgs.map((bg) => (
                      <button
                        key={bg.url}
                        onClick={() => {
                          setSelectedPattern(bg.url);
                          setBgType("image");
                        }}
                        className="border rounded-lg overflow-hidden"
                      >
                        <img
                          src={bg.url}
                          alt="bg"
                          className="w-full h-20 object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}

          {activeTab === "stiker" && (
            <div className="grid grid-cols-3 gap-4">
              {customAssets.stickers.map((stk) => (
                <button
                  key={stk.url}
                  onClick={() => addSticker(stk.url)}
                  className="p-2 border rounded-xl hover:bg-gray-50"
                >
                  <img
                    src={stk.url}
                    alt="stk"
                    className="w-full aspect-square object-contain"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="p-6 border-t">
          <button
            onClick={() => {
              setFinalImage(canvasRef.current.toDataURL());
              navigate("/delivery", {
                state: { frameColorForGif: frameColor },
              });
            }}
            className="w-full py-4 bg-pink-600 text-white rounded-2xl font-bold"
          >
            Selesai / Kirim
          </button>
        </div>
      </div>
    </div>
  );
};

export default Editor;
