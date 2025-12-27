import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Clock,
  Grid,
  Image as ImageIcon,
} from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Booth = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { setRawPhotos, setSessionConfig } = usePhoto();

  // --- STATE LOKAL ---
  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(0);
  const [isCapturing, setIsCapturing] = useState(false);

  // State Dropdown
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  // Pilihan Config (Default)
  const [selectedLayout, setSelectedLayout] = useState({
    label: "4 Foto",
    type: "strip-4",
    count: 4,
    icon: <Grid size={16} />,
  });
  const [selectedTimer, setSelectedTimer] = useState(3);

  // --- DATA OPSI DROPDOWN (Sesuai Gambar Referensi) ---
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

  // Akses Kamera
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

  // Capture Frame Tunggal
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

  // --- LOGIC SESI FOTO UTAMA ---
  const startPhotoSession = () => {
    if (isCapturing) return;

    // Simpan config ke context agar Editor tahu
    setSessionConfig({
      layout: selectedLayout.type,
      count: selectedLayout.count,
      timer: selectedTimer,
    });

    setIsCapturing(true);
    const photos = [];
    let shotsTaken = 0;
    const totalShots = selectedLayout.count; // Ambil jumlah foto sesuai pilihan dropdown

    const takeShot = () => {
      let count = selectedTimer;
      setCountdown(count);

      const timer = setInterval(() => {
        count--;
        setCountdown(count);

        if (count === 0) {
          clearInterval(timer);
          const img = captureSingleFrame();
          photos.push(img);
          shotsTaken++;

          if (shotsTaken < totalShots) {
            setTimeout(takeShot, 1000); // Jeda 1 detik antar foto
          } else {
            setRawPhotos(photos);
            navigate("/editor");
          }
        }
      }, 1000);
    };

    takeShot();
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col font-sans relative">
      {/* HEADER TOOLS (Dropdown Area) */}
      <div className="h-20 flex items-center justify-center gap-4 bg-white z-30 px-4 relative shadow-sm">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>

        {/* 1. DROPDOWN LAYOUT */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayoutMenu(!showLayoutMenu);
              setShowTimerMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition text-sm font-bold text-gray-700"
          >
            {selectedLayout.icon}
            {selectedLayout.label}
            {showLayoutMenu ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {/* Menu Dropdown */}
          {showLayoutMenu && (
            <div className="absolute top-full mt-2 left-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
              {layoutOptions.map((opt) => (
                <button
                  key={opt.type}
                  onClick={() => {
                    setSelectedLayout(opt);
                    setShowLayoutMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-pink-50 flex items-center gap-3 text-sm text-gray-700 transition"
                >
                  {opt.icon} {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 2. DROPDOWN TIMER */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTimerMenu(!showTimerMenu);
              setShowLayoutMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition text-sm font-bold text-gray-700"
          >
            <Clock size={16} /> {selectedTimer}s Tertunda
            {showTimerMenu ? (
              <ChevronUp size={16} />
            ) : (
              <ChevronDown size={16} />
            )}
          </button>

          {/* Menu Dropdown */}
          {showTimerMenu && (
            <div className="absolute top-full mt-2 left-0 w-40 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50 animate-fade-in-up">
              {timerOptions.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    setSelectedTimer(t);
                    setShowTimerMenu(false);
                  }}
                  className="w-full text-left px-4 py-3 hover:bg-pink-50 text-sm text-gray-700 transition font-medium"
                >
                  {t}s Tertunda
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* AREA KAMERA */}
      <div className="flex-1 relative bg-gray-50 overflow-hidden flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl ring-8 ring-white">
          {countdown > 0 && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <span className="text-[120px] font-black text-white animate-bounce drop-shadow-lg">
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

          {/* Indikator Jumlah Foto */}
          {isCapturing && (
            <div className="absolute top-4 right-4 bg-black/50 backdrop-blur px-4 py-2 rounded-full text-white font-bold">
              Mode: {selectedLayout.label}
            </div>
          )}
        </div>
      </div>

      {/* FILTER & SHUTTER BAR */}
      <div className="h-48 bg-white flex flex-col items-center py-4 gap-4 shadow-[0_-5px_30px_rgba(0,0,0,0.05)] z-20 rounded-t-3xl">
        <div className="flex gap-4 overflow-x-auto w-full max-w-2xl px-6 pb-2 custom-scrollbar justify-center">
          {filters.map((f) => (
            <button
              key={f.name}
              onClick={() => setFilter(f.value)}
              className={`flex flex-col items-center gap-2 min-w-[70px] transition ${
                filter === f.value ? "scale-110" : "opacity-60"
              }`}
            >
              <div
                className="w-12 h-12 rounded-full border-2 border-gray-100 shadow-sm"
                style={{ backgroundColor: f.color }}
              ></div>
              <span className="text-xs font-semibold text-gray-500">
                {f.name}
              </span>
            </button>
          ))}
        </div>

        <button
          onClick={startPhotoSession}
          disabled={isCapturing}
          className="w-20 h-20 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:grayscale"
        >
          {isCapturing ? (
            <span className="animate-spin text-2xl">⏳</span>
          ) : (
            <div className="w-8 h-8 rounded-full border-4 border-white"></div>
          )}
        </button>
      </div>
    </div>
  );
};
export default Booth;
