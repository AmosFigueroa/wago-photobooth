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
  const [capturedImages, setCapturedImages] = useState([]); // Menyimpan foto sementara di sidebar
  const [isSessionDone, setIsSessionDone] = useState(false); // Penanda sesi selesai

  // State Dropdown
  const [showLayoutMenu, setShowLayoutMenu] = useState(false);
  const [showTimerMenu, setShowTimerMenu] = useState(false);

  // Default Config
  const [selectedLayout, setSelectedLayout] = useState({
    label: "4 Foto",
    type: "strip-4",
    count: 4,
    icon: <Grid size={16} />,
  });
  const [selectedTimer, setSelectedTimer] = useState(3);

  // --- DATA OPSI ---
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

  // Fungsi Reset / Foto Ulang Total
  const handleRetakeAll = () => {
    setCapturedImages([]);
    setIsSessionDone(false);
    setIsCapturing(false);
  };

  // Capture Frame
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

  // --- LOGIC SESI FOTO (Diperbarui dengan Sidebar) ---
  const startPhotoSession = () => {
    if (isCapturing) return;

    // Jika sesi sudah selesai sebelumnya, reset dulu
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

          // Update sidebar real-time
          setCapturedImages((prev) => {
            const newPhotos = [...prev, img];
            return newPhotos;
          });

          currentShot++;

          if (currentShot < totalShots) {
            // Jeda 1 detik sebelum foto berikutnya
            setTimeout(takeNextShot, 1000);
          } else {
            // Selesai
            setIsCapturing(false);
            setIsSessionDone(true);
          }
        }
      }, 1000);
    };

    takeNextShot();
  };

  const handleNext = () => {
    // Simpan data final ke context dan pindah halaman
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
      {/* HEADER TOOLS */}
      <div className="h-16 flex items-center justify-center gap-4 bg-white z-30 px-4 shadow-sm border-b border-gray-100">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={20} />
        </button>

        {/* Dropdown Layout */}
        <div className="relative">
          <button
            onClick={() => {
              setShowLayoutMenu(!showLayoutMenu);
              setShowTimerMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition text-sm font-bold text-gray-700"
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

        {/* Dropdown Timer */}
        <div className="relative">
          <button
            onClick={() => {
              setShowTimerMenu(!showTimerMenu);
              setShowLayoutMenu(false);
            }}
            className="flex items-center gap-2 px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-full hover:bg-gray-100 transition text-sm font-bold text-gray-700"
          >
            <Clock size={14} /> {selectedTimer}s{" "}
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

      {/* MAIN CONTENT: FLEX ROW (Camera Kiri - Sidebar Kanan) */}
      <div className="flex-1 flex overflow-hidden bg-gray-50">
        {/* 1. AREA KAMERA (Tengah/Kiri) */}
        <div className="flex-1 flex flex-col items-center justify-center p-4 relative">
          {/* Wrapper Kamera dengan Aspect Ratio 4:3 */}
          <div className="relative w-full max-w-2xl aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl ring-4 ring-white">
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

            {/* Indikator Status */}
            {isCapturing && (
              <div className="absolute top-4 right-4 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                Merekam... {capturedImages.length + 1}/{selectedLayout.count}
              </div>
            )}
          </div>

          {/* Filter Bar (Di bawah kamera) */}
          <div className="mt-6 flex gap-4 overflow-x-auto w-full max-w-xl px-4 pb-2 custom-scrollbar justify-center">
            {filters.map((f) => (
              <button
                key={f.name}
                onClick={() => setFilter(f.value)}
                className={`flex flex-col items-center gap-2 min-w-[60px] transition ${
                  filter === f.value
                    ? "scale-110 opacity-100"
                    : "opacity-50 hover:opacity-100"
                }`}
              >
                <div
                  className="w-10 h-10 rounded-full border-2 border-white shadow-md"
                  style={{ backgroundColor: f.color }}
                ></div>
                <span className="text-[10px] font-bold text-gray-500 uppercase">
                  {f.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 2. SIDEBAR HASIL (Kanan) */}
        <div className="w-24 md:w-32 bg-white border-l border-gray-100 flex flex-col items-center py-4 gap-3 overflow-y-auto z-20 shadow-[-5px_0_15px_rgba(0,0,0,0.02)]">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
            Hasil
          </span>

          {/* Generate Placeholder Slot */}
          {Array.from({ length: selectedLayout.count }).map((_, idx) => (
            <div
              key={idx}
              className="relative w-20 h-20 md:w-24 md:h-24 bg-gray-100 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center overflow-hidden shrink-0 transition-all duration-300"
            >
              {capturedImages[idx] ? (
                // Jika foto sudah ada
                <div className="relative w-full h-full group">
                  <img
                    src={capturedImages[idx]}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                  {/* Overlay nomor urut */}
                  <div className="absolute bottom-1 right-1 bg-black/50 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                    {idx + 1}
                  </div>
                </div>
              ) : (
                // Jika masih kosong
                <span className="text-gray-300 font-bold text-xl">
                  {idx + 1}
                </span>
              )}
            </div>
          ))}

          {/* Tombol Reset Kecil di Sidebar */}
          {capturedImages.length > 0 && !isCapturing && (
            <button
              onClick={handleRetakeAll}
              className="mt-auto mb-20 p-2 text-gray-400 hover:text-red-500 transition"
              title="Hapus Semua"
            >
              <RefreshCw size={20} />
            </button>
          )}
        </div>
      </div>

      {/* BOTTOM ACTION BAR (Tombol Shutter / Next) */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white via-white to-transparent flex items-center justify-center z-40 pointer-events-none">
        <div className="pointer-events-auto mb-6">
          {!isSessionDone ? (
            // Tombol Shutter (Mulai Foto)
            <button
              onClick={startPhotoSession}
              disabled={isCapturing}
              className={`w-16 h-16 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                isCapturing
                  ? "bg-gray-300 scale-90"
                  : "bg-[#ff4785] hover:bg-[#ff2e73] hover:scale-105 hover:shadow-2xl"
              }`}
            >
              {isCapturing ? (
                <span className="text-2xl animate-spin">⏳</span>
              ) : (
                <div className="w-6 h-6 rounded-full border-[3px] border-white"></div>
              )}
            </button>
          ) : (
            // Tombol Berikutnya (Muncul setelah selesai)
            <div className="flex gap-4 animate-fade-in-up">
              <button
                onClick={handleRetakeAll}
                className="px-6 py-3 rounded-full bg-white border border-gray-300 text-gray-600 font-bold shadow-lg hover:bg-gray-50 flex items-center gap-2"
              >
                <RefreshCw size={18} /> Ulang
              </button>
              <button
                onClick={handleNext}
                className="px-8 py-3 rounded-full bg-[#ff4785] text-white font-bold shadow-[0_4px_15px_rgba(255,71,133,0.4)] hover:bg-[#ff2e73] hover:scale-105 transition flex items-center gap-2"
              >
                Berikutnya <Check size={18} />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Booth;
