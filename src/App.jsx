import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Camera,
  Download,
  RefreshCcw,
  Layers,
  Zap,
  Image as ImageIcon,
  CreditCard,
  X,
} from "lucide-react";

const WagoPhotobooth = () => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [finalImage, setFinalImage] = useState(null);
  const [filter, setFilter] = useState("none");
  const [mode, setMode] = useState("single");
  const [countdown, setCountdown] = useState(0);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [gallery, setGallery] = useState([]);

  const filters = [
    { name: "Normal", value: "none" },
    { name: "B&W", value: "grayscale(100%)" },
    { name: "Sepia", value: "sepia(100%)" },
    { name: "Vintage", value: "contrast(120%) saturate(120%) sepia(30%)" },
    { name: "Cyberpunk", value: "hue-rotate(180deg) contrast(120%)" },
    { name: "Soft", value: "brightness(110%) blur(0.5px)" },
  ];

  useEffect(() => {
    const startCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720, facingMode: "user" },
          audio: false,
        });
        setStream(mediaStream);
        if (videoRef.current) videoRef.current.srcObject = mediaStream;
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    };
    startCamera();
  }, []);

  const captureFrame = useCallback(() => {
    const video = videoRef.current;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d");

    ctx.filter = filter;
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.filter = "none";
    ctx.font = "24px sans-serif";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("WAGO BOOTH", 20, canvas.height - 20);

    return canvas.toDataURL("image/png");
  }, [filter]);

  const handleCapture = () => {
    let count = 3;
    setCountdown(count);
    const timer = setInterval(() => {
      count--;
      if (count > 0) {
        setCountdown(count);
      } else {
        clearInterval(timer);
        setCountdown(0);
        if (mode === "single") {
          setFinalImage(captureFrame());
        } else {
          processStripCapture();
        }
      }
    }, 1000);
  };

  const processStripCapture = async () => {
    const images = [];
    for (let i = 0; i < 4; i++) {
      await new Promise((r) => setTimeout(r, 500));
      images.push(captureFrame());
    }
    const canvas = document.createElement("canvas");
    const width = 640;
    const height = 480;
    const padding = 20;
    canvas.width = width + padding * 2;
    canvas.height = height * 4 + padding * 5 + 60;
    const ctx = canvas.getContext("2d");

    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < images.length; i++) {
      const img = new Image();
      img.src = images[i];
      await new Promise((resolve) => {
        img.onload = resolve;
      });
      ctx.drawImage(
        img,
        padding,
        padding * (i + 1) + height * i,
        width,
        height
      );
    }

    ctx.fillStyle = "#000";
    ctx.font = "bold 30px Courier New";
    ctx.textAlign = "center";
    ctx.fillText("WAGO PHOTOBOOTH", canvas.width / 2, canvas.height - 25);
    setFinalImage(canvas.toDataURL("image/png"));
  };

  const saveToGallery = () => {
    if (finalImage) {
      setGallery([...gallery, finalImage]);
      setFinalImage(null);
      setIsGalleryOpen(true);
    }
  };

  // --- WAGO PAYMENT INTEGRATION ---
  const handlePayment = () => {
    // Base URL Gateway
    const GATEWAY_URL = "https://payment-gateway-mutasi.vercel.app/";
    const MY_RETURN_URL = window.location.origin; // Otomatis deteksi domain Vercel nanti
    const MY_WEBHOOK = "https://wago-photobooth.vercel.app/api/webhook"; // Placeholder

    // Parameter Wajib Wago
    const orderData = {
      store: "Wago Photobooth",
      prod: "Unlock Premium Filters",
      price: 25000,
      ref_id: "PB-" + Date.now(),
      notify: MY_WEBHOOK,
      return: MY_RETURN_URL,
      time: 15,
    };

    const params = new URLSearchParams(orderData).toString();
    // Redirect ke Gateway dengan parameter
    window.location.href = `${GATEWAY_URL}?${params}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-4 font-sans text-white overflow-hidden">
      <header className="flex justify-between items-center mb-6 max-w-4xl mx-auto backdrop-blur-md bg-white/10 p-4 rounded-2xl shadow-xl border border-white/20">
        <div className="flex items-center gap-2">
          <Camera className="w-8 h-8 text-pink-300" />
          <h1 className="text-2xl font-bold tracking-wider">WAGO BOOTH</h1>
        </div>
        <button
          onClick={() => setIsGalleryOpen(!isGalleryOpen)}
          className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition shadow-lg"
        >
          <ImageIcon className="w-6 h-6" />
        </button>
      </header>

      <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 relative group">
          <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 bg-black aspect-[4/3]">
            {countdown > 0 && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                <span className="text-9xl font-bold text-white animate-ping">
                  {countdown}
                </span>
              </div>
            )}
            {finalImage ? (
              <img
                src={finalImage}
                alt="Captured"
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-full object-cover transform -scale-x-100"
                style={{ filter: filter }}
              />
            )}
            {!finalImage && (
              <div className="absolute bottom-6 left-0 right-0 flex justify-center items-center gap-6">
                <button
                  onClick={() =>
                    setMode(mode === "single" ? "strip" : "single")
                  }
                  className="bg-black/50 p-3 rounded-full hover:bg-black/70 backdrop-blur text-xs font-bold text-white uppercase tracking-widest border border-white/20"
                >
                  {mode === "single" ? "Single" : "4-Strip"}
                </button>
                <button
                  onClick={handleCapture}
                  className="w-20 h-20 rounded-full bg-white border-4 border-pink-500 shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-110 active:scale-95 transition duration-200 flex items-center justify-center"
                >
                  <div className="w-16 h-16 rounded-full bg-pink-500/20"></div>
                </button>
              </div>
            )}
          </div>
          {finalImage && (
            <div className="flex gap-4 mt-4 justify-center animate-fade-in-up">
              <button
                onClick={() => setFinalImage(null)}
                className="flex items-center gap-2 px-6 py-3 bg-red-500/80 hover:bg-red-600 rounded-xl font-bold backdrop-blur shadow-lg transition"
              >
                <RefreshCcw className="w-5 h-5" /> Retake
              </button>
              <button
                onClick={saveToGallery}
                className="flex items-center gap-2 px-6 py-3 bg-green-500/80 hover:bg-green-600 rounded-xl font-bold backdrop-blur shadow-lg transition"
              >
                <Download className="w-5 h-5" /> Save
              </button>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Layers className="w-5 h-5 text-yellow-300" /> Filters
            </h3>
            <div className="grid grid-cols-2 gap-3">
              {filters.map((f) => (
                <button
                  key={f.name}
                  onClick={() => setFilter(f.value)}
                  className={`p-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    filter === f.value
                      ? "bg-pink-500 text-white shadow-lg scale-105 ring-2 ring-pink-300"
                      : "bg-white/20 hover:bg-white/30 text-white"
                  }`}
                >
                  {f.name}
                </button>
              ))}
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-900/80 to-purple-900/80 backdrop-blur-md p-6 rounded-3xl border border-indigo-400/30 shadow-2xl relative overflow-hidden group">
            <h3 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-400 fill-current" /> Premium
            </h3>
            <p className="text-sm text-indigo-200 mb-6">
              Unlock HD frames & cloud storage.
            </p>
            <button
              onClick={handlePayment}
              className="w-full py-4 bg-white text-indigo-900 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.4)] transition-all flex items-center justify-center gap-2 group-hover:scale-[1.02]"
            >
              <CreditCard className="w-5 h-5" /> Unlock Rp 25k
            </button>
            <p className="text-xs text-center mt-3 text-white/40">
              Secured by WAGO Payment
            </p>
          </div>
        </div>
      </div>

      {isGalleryOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-lg flex items-center justify-center p-4">
          <div className="bg-white/10 border border-white/20 w-full max-w-4xl h-[80vh] rounded-3xl p-6 relative flex flex-col">
            <button
              onClick={() => setIsGalleryOpen(false)}
              className="absolute top-4 right-4 p-2 bg-red-500 rounded-full hover:bg-red-600 transition"
            >
              <X className="w-6 h-6" />
            </button>
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-3">
              <ImageIcon className="w-8 h-8 text-pink-400" /> Gallery
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {gallery.map((img, idx) => (
                <div
                  key={idx}
                  className="relative group rounded-xl overflow-hidden border border-white/20 shadow-lg"
                >
                  <img
                    src={img}
                    alt={`Gallery ${idx}`}
                    className="w-full h-auto object-cover"
                  />
                  <a
                    href={img}
                    download={`wago-photo-${idx}.png`}
                    className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center"
                  >
                    <Download className="w-8 h-8 text-white" />
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default WagoPhotobooth;
