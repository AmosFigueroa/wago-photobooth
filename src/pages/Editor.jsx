import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Palette,
  Smile,
  Check,
  ArrowLeft,
  Pipette,
  Image as ImageIcon,
} from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { rawPhotos, setFinalImage, setRawPhotos, sessionConfig } = usePhoto();
  const canvasRef = useRef(null);

  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec";

  const [bgType, setBgType] = useState("color");
  const [frameColor, setFrameColor] = useState("#ffffff");
  const [patternColor, setPatternColor] = useState("#ff4785");
  const [selectedPattern, setSelectedPattern] = useState("dots");
  const [activeTab, setActiveTab] = useState("frame");
  const [stickers, setStickers] = useState([]);

  // --- STATE BARU: ASET DARI DATABASE ---
  const [customAssets, setCustomAssets] = useState({ bgs: [], stickers: [] });

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
        console.error("Gagal muat aset khusus");
      }
    };
    fetchAssets();
  }, []);

  // --- LOGIKA DRAWING (Tetap Sama dengan Tambahan Image Background) ---
  useEffect(() => {
    if (rawPhotos.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const targetW = 640;
    const targetH = 480;
    const padding = 40;
    const gap = 20;
    const footerH = 140;
    let canvasW, canvasH;
    const count = rawPhotos.length;

    canvasW = targetW + padding * 2;
    canvasH = targetH * count + gap * (count - 1) + padding * 2 + footerH;
    canvas.width = canvasW;
    canvas.height = canvasH;

    // DRAW BACKGROUND
    if (bgType === "color") {
      ctx.fillStyle = frameColor;
      ctx.fillRect(0, 0, canvasW, canvasH);
    } else if (bgType === "image") {
      // Logika Menggambar Background dari Gambar yang di-upload
      const bgImg = new Image();
      bgImg.crossOrigin = "anonymous";
      bgImg.onload = () => {
        ctx.drawImage(bgImg, 0, 0, canvasW, canvasH);
        drawAllPhotos();
      };
      bgImg.src = selectedPattern; // URL Gambar disimpan di sini
      return;
    } else {
      const pattern = createPattern(ctx, selectedPattern, patternColor);
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvasW, canvasH);
    }

    const drawAllPhotos = () => {
      let loaded = 0;
      rawPhotos.forEach((src, i) => {
        const img = new Image();
        img.onload = () => {
          const y = padding + i * (targetH + gap);
          ctx.drawImage(img, padding, y, targetW, targetH);
          loaded++;
          if (loaded === count) drawDecorations(ctx, canvasW, canvasH);
        };
        img.src = src;
      });
    };
    drawAllPhotos();
  }, [rawPhotos, bgType, frameColor, selectedPattern, patternColor, stickers]);

  // ... (Fungsi createPattern & drawDecorations tetap sama) ...

  return (
    <div className="h-screen w-screen bg-gray-100 flex flex-col md:flex-row overflow-hidden font-sans">
      <div className="flex-1 flex items-center justify-center p-8 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:20px_20px]">
        <canvas
          ref={canvasRef}
          className="max-w-full max-h-[85vh] shadow-2xl bg-white"
        />
      </div>

      <div className="w-full md:w-[400px] bg-white shadow-2xl flex flex-col border-l">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab("frame")}
            className={`flex-1 py-4 font-bold ${
              activeTab === "frame"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-400"
            }`}
          >
            Background
          </button>
          <button
            onClick={() => setActiveTab("sticker")}
            className={`flex-1 py-4 font-bold ${
              activeTab === "sticker"
                ? "text-pink-600 border-b-2 border-pink-600"
                : "text-gray-400"
            }`}
          >
            Stiker
          </button>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
          {activeTab === "frame" && (
            <div className="space-y-6">
              {/* HASIL UPLOAD ADMIN MUNCUL DI SINI */}
              {customAssets.bgs.length > 0 && (
                <div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                    Custom Uploads
                  </h3>
                  <div className="grid grid-cols-3 gap-2">
                    {customAssets.bgs.map((bg) => (
                      <button
                        key={bg.url}
                        onClick={() => {
                          setSelectedPattern(bg.url);
                          setBgType("image");
                        }}
                        className="aspect-video rounded-lg border-2 overflow-hidden border-gray-100"
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
              {/* Pola Bawaan Tetap Ada di Bawahnya */}
              <h3 className="text-xs font-bold text-gray-400 uppercase mb-3">
                Pola Standar
              </h3>
              <div className="grid grid-cols-3 gap-2">
                {/* ... (Daftar pola dots, stripes, dll tetap sama) ... */}
              </div>
            </div>
          )}
        </div>

        <div className="p-5 border-t flex gap-3">
          <button
            onClick={() => navigate("/delivery")}
            className="w-full py-4 bg-pink-600 text-white rounded-xl font-bold flex items-center justify-center gap-2"
          >
            <Check /> Selesai
          </button>
        </div>
      </div>
    </div>
  );
};
export default Editor;
