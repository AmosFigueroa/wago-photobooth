import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Download,
  Cloud,
  Film,
  Image as ImageIcon,
  RefreshCcw,
} from "lucide-react";
import { usePhoto } from "../PhotoContext";
import gifshot from "gifshot";

const Delivery = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const {
    finalImage,
    rawPhotos = [],
    setRawPhotos,
    setFinalImage,
  } = usePhoto();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [generatedGif, setGeneratedGif] = useState(null);
  const [isProcessingGif, setIsProcessingGif] = useState(false);

  const frameColor = location.state?.frameColorForGif || "#ffffff";

  // --- URL BACKEND GOOGLE APPS SCRIPT (DIPECAH SUPAYA AMAN) ---
  const SCRIPT_ID =
    "AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu";
  const SCRIPT_URL = `https://script.google.com/macros/s/${SCRIPT_ID}/exec`;

  useEffect(() => {
    if (!finalImage) navigate("/booth");
  }, [finalImage, navigate]);

  useEffect(() => {
    if (rawPhotos && rawPhotos.length > 0 && !generatedGif) {
      createFramedGif();
    }
  }, [rawPhotos]);

  const processFramesWithBorder = async (photos, color) => {
    const processedImages = [];
    const padding = 20;
    const footerH = 40;
    const targetW = 320;
    const targetH = 180;

    const canvas = document.createElement("canvas");
    canvas.width = targetW + padding * 2;
    canvas.height = targetH + padding * 2 + footerH;
    const ctx = canvas.getContext("2d");

    for (const src of photos) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.crossOrigin = "Anonymous";
      img.src = src;
      await new Promise((r) => {
        img.onload = r;
        img.onerror = r;
      });

      ctx.drawImage(img, padding, padding, targetW, targetH);

      const isDark = color === "#000000" || color.startsWith("#3");
      ctx.fillStyle = isDark ? "#ffffff" : "#333333";
      ctx.font = "bold 16px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("WAGO BOOTH", canvas.width / 2, canvas.height - 15);

      processedImages.push(canvas.toDataURL("image/jpeg", 0.8));
    }
    return processedImages;
  };

  const createFramedGif = async () => {
    try {
      setIsProcessingGif(true);
      const framedPhotos = await processFramesWithBorder(rawPhotos, frameColor);

      gifshot.createGIF(
        {
          images: framedPhotos,
          interval: 0.5,
          gifWidth: 360,
          gifHeight: 260,
          numFrames: 10,
        },
        function (obj) {
          if (!obj.error) {
            setGeneratedGif(obj.image);
          }
          setIsProcessingGif(false);
        }
      );
    } catch (err) {
      console.error("Gagal GIF", err);
      setIsProcessingGif(false);
    }
  };

  const handleDownloadLocal = () => {
    const link = document.createElement("a");
    link.href = finalImage;
    link.download = `Wago-Strip-${Date.now()}.png`;
    link.click();
  };

  const handleSendToCloud = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Email tidak valid!");
      return;
    }

    setStatus("uploading");

    const uploads = [];
    if (finalImage)
      uploads.push({
        name: "Foto-Strip.png",
        data: finalImage,
        label: "Foto Strip",
      });
    if (generatedGif)
      uploads.push({
        name: "Animasi.gif",
        data: generatedGif,
        label: "Animasi GIF",
      });

    if (rawPhotos && rawPhotos.length > 0) {
      rawPhotos.forEach((img, idx) => {
        uploads.push({
          name: `Raw-${idx + 1}.png`,
          data: img,
          label: `Mentah ${idx + 1}`,
        });
      });
    }

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        // --- DATA PENTING YANG DIKIRIM KE BACKEND ---
        body: JSON.stringify({
          action: "upload_user",
          userEmail: email,
          uploads: uploads,
          appUrl: window.location.origin, // Ini URL website kamu saat ini (localhost atau vercel)
        }),
      });
      setStatus("success");
    } catch (err) {
      console.error(err);
      alert("Gagal koneksi. Cek internet.");
      setStatus("idle");
    }
  };

  const handleFinish = () => {
    setRawPhotos([]);
    setFinalImage(null);
    navigate("/");
  };

  if (!finalImage)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        Loading data...
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-5xl flex flex-col lg:flex-row gap-10">
        {/* KIRI: PREVIEW AREA */}
        <div className="lg:w-1/2 bg-gray-100 rounded-3xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <ImageIcon /> Preview Paket
          </h3>
          <div className="flex gap-4 h-64">
            <div className="flex-1 bg-white rounded-xl shadow-sm p-2 flex items-center justify-center">
              <img
                src={finalImage}
                alt="Strip"
                className="max-h-full object-contain shadow-md"
              />
            </div>
            <div className="flex-1 bg-white rounded-xl shadow-sm p-2 flex flex-col items-center justify-center relative overflow-hidden">
              {isProcessingGif ? (
                <div className="flex flex-col items-center text-gray-400 text-sm animate-pulse">
                  <RefreshCcw className="animate-spin mb-2" /> Bikin GIF...
                </div>
              ) : generatedGif ? (
                <>
                  <img
                    src={generatedGif}
                    alt="GIF"
                    className="w-full h-full object-contain rounded-lg"
                  />
                  <div className="absolute top-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-[10px] font-bold flex gap-1">
                    <Film size={12} /> GIF
                  </div>
                </>
              ) : (
                <span className="text-xs text-gray-400">Gagal GIF</span>
              )}
            </div>
          </div>
        </div>

        {/* KANAN: ACTION AREA */}
        <div className="lg:w-1/2 flex flex-col justify-center space-y-8">
          {status === "success" ? (
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">Terkirim!</h2>
                <p className="text-gray-500 mt-2">
                  Cek email <b>{email}</b>.
                </p>
              </div>
              <button
                onClick={handleFinish}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition"
              >
                Selesai & Kembali
              </button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-4xl font-black text-gray-800 mb-2">
                  Simpan Paket
                </h2>
                <p className="text-gray-500 text-lg">Pilih metode simpan:</p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleDownloadLocal}
                  className="w-full p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-200 transition flex items-center gap-6 text-left"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center">
                    <Download size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">
                      Download HP
                    </h4>
                    <p className="text-sm text-gray-400">Simpan Foto Strip.</p>
                  </div>
                </button>
                <div
                  className={`p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-100 rounded-3xl transition ${
                    status === "uploading" ? "opacity-80" : ""
                  }`}
                >
                  <div className="flex items-center gap-6 mb-4">
                    <div className="w-16 h-16 bg-pink-100 text-pink-600 rounded-2xl flex items-center justify-center">
                      <Cloud size={32} />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-800">
                        Wago Cloud
                      </h4>
                      <p className="text-sm text-gray-400">
                        Kirim Paket Lengkap.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSendToCloud} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="email@kamu.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "uploading"}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-pink-500"
                    />
                    <button
                      type="submit"
                      disabled={status === "uploading"}
                      className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition flex items-center justify-center min-w-[60px]"
                    >
                      {status === "uploading" ? (
                        <RefreshCcw className="animate-spin" />
                      ) : (
                        <ArrowRight />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
export default Delivery;
