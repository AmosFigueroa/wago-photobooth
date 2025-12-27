import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Grid,
  Camera,
  RefreshCw,
  Check,
  Zap,
} from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Booth = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { setRawPhotos, setSessionConfig } = usePhoto();

  // --- STATE ---
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImages, setCapturedImages] = useState([]);
  const [isSessionDone, setIsSessionDone] = useState(false);

  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  const [selectedLayout, setSelectedLayout] = useState({
    label: "4 Foto",
    type: "strip-4",
    count: 4,
    icon: <Grid size={16} />,
  });
  const [selectedTimer, setSelectedTimer] = useState(3);

  // --- DATA OPTIONS ---
  const layoutOptions = [
    {
      label: "2 Foto",
      type: "strip-2",
      count: 2,
      icon: (
        <div className="flex flex-col gap-[2px]">
          <div className="w-3 h-2 bg-gray-500 rounded-[1px]"></div>
          <div className="w-3 h-2 bg-gray-500 rounded-[1px]"></div>
        </div>
      ),
    },
    {
      label: "3 Foto",
      type: "strip-3",
      count: 3,
      icon: (
        <div className="flex flex-col gap-[2px]">
          <div className="w-3 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-3 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-3 h-1.5 bg-gray-500 rounded-[1px]"></div>
        </div>
      ),
    },
    {
      label: "4 Foto (Strip)",
      type: "strip-4",
      count: 4,
      icon: (
        <div className="flex flex-col gap-[1px]">
          <div className="w-2 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-2 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-2 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-2 h-1.5 bg-gray-500 rounded-[1px]"></div>
        </div>
      ),
    },
    {
      label: "4 Foto (Grid)",
      type: "grid-4",
      count: 4,
      icon: (
        <div className="grid grid-cols-2 gap-[1px]">
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-[1px]"></div>
          <div className="w-1.5 h-1.5 bg-gray-500 rounded-[1px]"></div>
        </div>
      ),
    },
  ];

  const timerOptions = [3, 5, 10];
  const filters = [
    { name: "Normal", value: "none", color: "#ff7eb3" },
    {
      name: "Lembut",
      value: "brightness(110%) contrast(90%)",
      color: "#a8e6cf",
    },
    { name: "Pedesaan", value: "sepia(40%) contrast(110%)", color: "#fdffab" },
    { name: "B&W", value: "grayscale(100%)", color: "#dcdcdc" },
    { name: "Vintage", value: "sepia(80%) contrast(120%)", color: "#ffd3b6" },
  ];

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Gagal akses kamera.");
      }
    };
    startCamera();
  }, []);

  const handleRetakeAll = () => {
    setCapturedImages([]);
    setIsSessionDone(false);
    setIsCapturing(false);
  };

  const captureSingleFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.filter = filter;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);
    return canvas.toDataURL("image/png");
  };

  const startPhotoSession = () => {
    if (isCapturing) return;
    if (isSessionDone) {
      setCapturedImages([]);
      setIsSessionDone(false);
    }
    setIsCapturing(true);
    let currentShot = 0;
    const totalShots = selectedLayout.count;

    const takeNextShot = () => {
      let count = selectedTimer;
      setCountdown(count);

      const timer = setInterval(() => {
        count--;
        setCountdown(count);

        if (count === 0) {
          clearInterval(timer);
          const img = captureSingleFrame();
          setCapturedImages((prev) => [...prev, img]);
          currentShot++;

          if (currentShot < totalShots) {
            setTimeout(takeNextShot, 1000);
          } else {
            setIsCapturing(false);
            setIsSessionDone(true);
          }
        }
      }, 1000);
    };
    takeNextShot();
  };

  const handleNext = () => {
    setSessionConfig({
      layout: selectedLayout.type,
      count: selectedLayout.count,
      timer: selectedTimer,
    });
    setRawPhotos(capturedImages);
    navigate("/editor");
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col font-sans relative overflow-hidden">
      {/* 1. HEADER (Dropdown Menu) */}
      <div className="h-16 shrink-0 flex items-center justify-center gap-4 bg-white z-30 px-4 shadow-sm border-b border-gray-100 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 p-2 rounded-full hover:bg-gray-100 text-gray-600"
        >
          <ArrowLeft size={24} />
        </button>

        <div className="relative">
          <button
            onClick={() => {
              setShowLayoutMenu(!showLayoutMenu);
              setShowTimerMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition text-sm font-bold text-gray-700"
          >
            {selectedLayout.icon} {selectedLayout.label}{" "}
            {showLayoutMenu ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
          {showLayoutMenu && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {layoutOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    setSelectedLayout(opt);
                    setShowLayoutMenu(false);
                    setCapturedImages([]);
                    setIsSessionDone(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-pink-50 flex items-center gap-3 text-sm text-gray-700"
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => {
              setShowTimerMenu(!showTimerMenu);
              setShowLayoutMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition text-sm font-bold text-gray-700"
          >
            <Clock size={16} /> {selectedTimer}s{" "}
            {showTimerMenu ? (
              <ChevronUp size={14} />
            ) : (
              <ChevronDown size={14} />
            )}
          </button>
          {showTimerMenu && (
            <div className="absolute top-full mt-2 left-0 w-32 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
              {timerOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTimer(t);
                    setShowTimerMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-pink-50 text-sm text-gray-700"
                >
                  {t}s
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 2. MIDDLE AREA (Kamera & Sidebar) */}
      <div className="flex-1 flex overflow-hidden bg-gray-100 relative">
        {/* AREA KAMERA (Mengisi sisa ruang) */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gray-50">
          <div className="relative w-full max-w-3xl aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white">
            {countdown > 0 && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <span className="text-[100px] font-black text-white animate-bounce drop-shadow-lg">
                  {countdown}
                </span>
              </div>
            )}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className="w-full h-full object-cover transform -scale-x-100"
              style={{ filter: filter }}
            />

            {/* Badge Status */}
            {isCapturing && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse flex items-center gap-2">
                <div className="w-2 h-2 bg-white rounded-full"></div> REC{" "}
                {capturedImages.length + 1}/{selectedLayout.count}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR HASIL (Kanan) */}
        <div className="w-24 md:w-32 bg-white border-l border-gray-200 flex flex-col items-center py-4 gap-3 overflow-y-auto shrink-0 z-20">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">
            Preview
          </span>
          {Array.from({ length: selectedLayout.count }).map((_, idx) => (
            <div
              key={idx}
              className="relative w-16 h-16 md:w-20 md:h-20 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-center overflow-hidden shrink-0"
            >
              {capturedImages[idx] ? (
                <div className="w-full h-full relative group">
                  <img
                    src={capturedImages[idx]}
                    alt={`Shot ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-0 right-0 bg-pink-500 text-white text-[10px] w-4 h-4 flex items-center justify-center font-bold">
                    {idx + 1}
                  </div>
                </div>
              ) : (
                <div className="text-gray-300 font-bold text-xl">{idx + 1}</div>
              )}
            </div>
          ))}
          {capturedImages.length > 0 && !isCapturing && (
            <button
              onClick={handleRetakeAll}
              className="mt-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition"
              title="Reset"
            >
              <RefreshCw size={18} />
            </button>
          )}
        </div>
      </div>

      {/* 3. CONTROL PANEL BAWAH (Filter & Tombol Besar) */}
      <div className="bg-white border-t border-gray-100 pt-2 pb-6 px-4 z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[30px] flex flex-col items-center gap-4 shrink-0">
        {/* Filter List */}
        <div className="w-full max-w-lg overflow-x-auto custom-scrollbar flex gap-4 justify-center py-2">
          {filters.map((f) => (
            <button
              key={f.name}
              onClick={() => setFilter(f.value)}
              className={`flex flex-col items-center gap-1 min-w-[60px] group transition ${
                filter === f.value
                  ? "opacity-100 scale-110"
                  : "opacity-60 hover:opacity-100"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-full border-2 shadow-sm transition ${
                  filter === f.value
                    ? "border-pink-500 ring-2 ring-pink-100"
                    : "border-gray-100"
                }`}
                style={{ backgroundColor: f.color }}
              ></div>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider ${
                  filter === f.value ? "text-pink-500" : "text-gray-400"
                }`}
              >
                {f.name}
              </span>
            </button>
          ))}
        </div>

        {/* AREA TOMBOL UTAMA */}
        <div className="flex items-center justify-center w-full relative">
          {!isSessionDone ? (
            // TOMBOL SHUTTER BESAR
            <div className="flex flex-col items-center gap-2 transform translate-y-[-10px]">
              <button
                onClick={startPhotoSession}
                disabled={isCapturing}
                className={`w-24 h-24 rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(236,72,153,0.4)] transition-all duration-300 border-4 border-white ring-4 ring-pink-50 ${
                  isCapturing
                    ? "bg-gray-300 scale-95"
                    : "bg-gradient-to-br from-pink-500 to-rose-600 hover:scale-110 hover:shadow-[0_15px_40px_rgba(236,72,153,0.6)]"
                }`}
              >
                {isCapturing ? (
                  <span className="text-3xl animate-spin">⏳</span>
                ) : (
                  <Camera size={40} className="text-white fill-white/20" />
                )}
              </button>
              {/* Label Tombol */}
              <span className="text-sm font-bold text-gray-500 uppercase tracking-widest animate-pulse">
                {isCapturing ? "Sabar ya..." : "Mulai Foto"}
              </span>
            </div>
          ) : (
            // TOMBOL SELESAI (Next/Ulang)
            <div className="flex gap-4 animate-fade-in-up pb-2">
              <button
                onClick={handleRetakeAll}
                className="px-6 py-4 rounded-2xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200 transition flex items-center gap-2"
              >
                <RefreshCw size={20} /> Ulang
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-4 rounded-2xl bg-[#ff4785] text-white font-bold shadow-lg hover:bg-[#ff2e73] hover:scale-105 transition flex items-center gap-2"
              >
                Lanjut Edit <Check size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Booth;
