import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Grid, ChevronDown } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Booth = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const { setRawPhotos, isPremium } = usePhoto();

  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(0);
  const [timerDelay, setTimerDelay] = useState(3); // Default 3 detik
  const [isCapturing, setIsCapturing] = useState(false);

  // Filter ala Referensi
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
    {
      name: "Cyber",
      value: "hue-rotate(190deg) contrast(120%)",
      color: "#ffaaa5",
    },
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

  // Fungsi ambil 1 frame
  const captureSingleFrame = () => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    // Efek Mirror & Filter
    ctx.filter = filter;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0);

    return canvas.toDataURL("image/png");
  };

  // Logic Utama: Ambil 4 Foto Berturut-turut
  const startPhotoSession = () => {
    if (isCapturing) return;
    setIsCapturing(true);
    const photos = [];
    let shotsTaken = 0;

    const takeShot = () => {
      // 1. Mulai Countdown
      let count = timerDelay;
      setCountdown(count);

      const timer = setInterval(() => {
        count--;
        setCountdown(count);

        if (count === 0) {
          clearInterval(timer);
          // 2. Cekrek!
          const img = captureSingleFrame();
          photos.push(img);
          shotsTaken++;

          // 3. Cek apakah sudah 4 foto?
          if (shotsTaken < 4) {
            // Jeda sebentar sebelum foto berikutnya (1 detik)
            setTimeout(takeShot, 1000);
          } else {
            // Selesai! Simpan ke context dan pindah halaman
            setRawPhotos(photos);
            navigate("/editor");
          }
        }
      }, 1000);
    };

    takeShot(); // Mulai foto pertama
  };

  return (
    <div className="h-screen w-screen bg-white flex flex-col font-sans">
      {/* HEADER TOOLS (Mirip Image 200b83) */}
      <div className="h-16 flex items-center justify-center gap-4 bg-white shadow-sm z-10 px-4">
        <button
          onClick={() => navigate("/")}
          className="absolute left-4 p-2 rounded-full hover:bg-gray-100"
        >
          <ArrowLeft size={24} />
        </button>

        {/* Dropdown Simulasi */}
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-700">
            <Grid size={16} /> 4 Foto <ChevronDown size={14} />
          </button>
          <button
            onClick={() => setTimerDelay(timerDelay === 3 ? 5 : 3)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-sm font-bold text-gray-700"
          >
            <Clock size={16} /> {timerDelay}s Tertunda
          </button>
        </div>
      </div>

      {/* CAMERA AREA */}
      <div className="flex-1 relative bg-gray-100 overflow-hidden flex items-center justify-center p-4">
        <div className="relative w-full max-w-4xl aspect-[4/3] bg-black rounded-3xl overflow-hidden shadow-2xl">
          {/* Countdown Overlay */}
          {countdown > 0 && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
              <span className="text-9xl font-black text-white animate-bounce">
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
        </div>
      </div>

      {/* BOTTOM CONTROLS (Filter & Shutter) */}
      <div className="h-48 bg-white flex flex-col items-center py-4 gap-4 shadow-[0_-5px_20px_rgba(0,0,0,0.05)] z-20">
        {/* Filter Scroll Horizontal */}
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
                className="w-12 h-12 rounded-full border-2 border-gray-200"
                style={{ backgroundColor: f.color }}
              ></div>
              <span className="text-xs font-semibold text-gray-600">
                {f.name}
              </span>
            </button>
          ))}
        </div>

        {/* Tombol Shutter Pink Besar */}
        <button
          onClick={startPhotoSession}
          disabled={isCapturing}
          className="w-16 h-16 md:w-20 md:h-20 bg-[#ff4785] hover:bg-[#ff2e73] text-white rounded-full flex items-center justify-center shadow-xl hover:shadow-2xl hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCapturing ? (
            <span className="animate-spin text-2xl">⏳</span>
          ) : (
            <div className="w-8 h-8 rounded-full border-4 border-white"></div>
          )}
        </button>
        <span className="text-sm font-bold text-[#ff4785]">
          {isCapturing ? "Mengambil Foto..." : "Mulai Foto"}
        </span>
      </div>
    </div>
  );
};
export default Booth;
