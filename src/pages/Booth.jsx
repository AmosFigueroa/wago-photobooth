import React, { useRef, useState, useEffect, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Camera, Layers, ArrowLeft } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Booth = () => {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { setCurrentPhoto, isPremium, setIsPremium } = usePhoto();

  const [filter, setFilter] = useState("none");
  const [countdown, setCountdown] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Cek status pembayaran dari URL
  useEffect(() => {
    if (searchParams.get("status") === "premium") {
      setIsPremium(true);
    }
  }, [searchParams, setIsPremium]);

  const filters = [
    { name: "Normal", value: "none" },
    { name: "B&W", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Vintage", value: "contrast(120%) saturate(120%) sepia(30%)" },
    { name: "Soft", value: "brightness(110%) blur(0.5px)" },
    ...(isPremium
      ? [
          {
            name: "PREMIUM: Cyberpunk",
            value: "hue-rotate(180deg) contrast(120%)",
          },
        ]
      : []),
  ];

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1920, height: 1080, facingMode: "user" },
          audio: false,
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera Error:", err);
        alert("Gagal akses kamera.");
      }
    };
    startCamera();
    // Cleanup function untuk mematikan kamera saat pindah halaman
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.filter = filter;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1); // Mirror
    ctx.drawImage(video, 0, 0);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";
    if (!isPremium) {
      ctx.font = "30px sans-serif";
      ctx.fillStyle = "rgba(255,255,255,0.5)";
      ctx.fillText("WAGO TRIAL", 50, canvas.height - 50);
    }
    return canvas.toDataURL("image/png");
  }, [filter, isPremium]);

  const handleCapture = () => {
    setCountdown(3);
    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        const img = captureFrame();
        setCurrentPhoto(img); // Simpan ke global state
        navigate("/editor"); // Pindah ke halaman editor
      }
    }, 1000);
  };

  return (
    <div className="h-screen w-screen bg-black overflow-hidden relative">
      {/* Tombol Kembali */}
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 z-20 p-3 bg-black/40 backdrop-blur-md rounded-full text-white"
      >
        <ArrowLeft />
      </button>

      {/* Countdown */}
      {countdown > 0 && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40">
          <span className="text-[10rem] font-bold text-white animate-ping">
            {countdown}
          </span>
        </div>
      )}

      {/* Video Fullscreen */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="h-full w-full object-cover transform -scale-x-100"
        style={{ filter: filter }}
      />

      {/* Controls */}
      <div className="absolute bottom-0 inset-x-0 p-8 flex justify-center items-center gap-8 bg-gradient-to-t from-black/70 to-transparent">
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="p-4 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/30 transition"
        >
          <Layers className="w-6 h-6" />
        </button>
        <button
          onClick={handleCapture}
          className="w-24 h-24 rounded-full bg-white border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-105 active:scale-95 transition flex items-center justify-center"
        >
          <div className="w-20 h-20 rounded-full bg-pink-500"></div>
        </button>
        <div className="w-14"></div> {/* Spacer */}
      </div>

      {/* Filter Panel (Muncul dari samping) */}
      {showFilters && (
        <div className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/60 backdrop-blur-md p-4 rounded-2xl border border-white/10 flex flex-col gap-3 animate-fade-in-right">
          {filters.map((f) => (
            <button
              key={f.name}
              onClick={() => setFilter(f.value)}
              className={`text-xs py-2 px-4 rounded-lg ${
                filter === f.value
                  ? "bg-pink-500 text-white"
                  : "bg-white/20 text-white"
              }`}
            >
              {f.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
export default Booth;
