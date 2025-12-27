import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  ArrowRight,
  CheckCircle,
  Download,
  Cloud,
  Film,
  Image as ImageIcon,
} from "lucide-react";
import { usePhoto } from "../PhotoContext";
import gifshot from "gifshot";

const Delivery = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { finalImage, rawPhotos, setRawPhotos, setFinalImage } = usePhoto();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [generatedGif, setGeneratedGif] = useState(null);
  const [isProcessingGif, setIsProcessingGif] = useState(false);

  const frameColor = location.state?.frameColorForGif || "#ffffff";
  const SCRIPT_URL = "GANTI_DENGAN_URL_WEB_APP_KAMU";

  useEffect(() => {
    if (!finalImage) navigate("/booth");
    if (rawPhotos.length > 0 && !generatedGif) createFramedGif();
  }, [finalImage, rawPhotos, navigate, generatedGif]);

  const processFramesWithBorder = async (photos, color) => {
    const processedImages = [];
    const canvas = document.createElement("canvas");
    const padding = 25,
      footerH = 50,
      targetW = 640,
      targetH = 360;
    canvas.width = targetW + padding * 2;
    canvas.height = targetH + padding * 2 + footerH;
    const ctx = canvas.getContext("2d");

    for (const src of photos) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const img = new Image();
      img.src = src;
      await new Promise((r) => (img.onload = r));
      ctx.drawImage(img, padding, padding, targetW, targetH);
      const isDark = color === "#000000" || color.startsWith("#3");
      ctx.fillStyle = isDark ? "#ffffff" : "#333333";
      ctx.font = "bold 24px Courier New";
      ctx.textAlign = "center";
      ctx.fillText("WAGO BOOTH GIF", canvas.width / 2, canvas.height - 18);
      processedImages.push(canvas.toDataURL("image/jpeg", 0.9));
    }
    return processedImages;
  };

  const createFramedGif = async () => {
    setIsProcessingGif(true);
    const framedPhotos = await processFramesWithBorder(rawPhotos, frameColor);
    gifshot.createGIF(
      { images: framedPhotos, interval: 0.5, gifWidth: 690, gifHeight: 460 },
      (obj) => {
        if (!obj.error) setGeneratedGif(obj.image);
        setIsProcessingGif(false);
      }
    );
  };

  const handleSendToCloud = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) return alert("Email tidak valid!");
    setStatus("uploading");
    const uploads = [
      { name: "Foto-Strip.png", data: finalImage, label: "Foto Strip" },
    ];
    if (generatedGif)
      uploads.push({
        name: "Animasi.gif",
        data: generatedGif,
        label: "Animasi GIF",
      });
    rawPhotos.forEach((img, i) =>
      uploads.push({
        name: `Raw-${i + 1}.png`,
        data: img,
        label: `Mentah ${i + 1}`,
      })
    );

    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          action: "upload_user",
          userEmail: email,
          uploads,
          appUrl: window.location.origin,
        }),
      });
      const data = await res.json();
      if (data.result === "success") setStatus("success");
      else alert("Gagal: " + data.message);
    } catch (err) {
      alert("Gagal koneksi ke server.");
    } finally {
      setStatus("idle");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-5xl flex flex-col lg:flex-row gap-10">
        <div className="lg:w-1/2 bg-gray-100 rounded-3xl p-6 flex flex-col gap-6">
          <h3 className="text-xl font-bold text-gray-700 flex items-center gap-2">
            <ImageIcon /> Preview
          </h3>
          <div className="flex gap-4 h-64">
            <div className="flex-1 bg-white rounded-xl p-2 flex items-center justify-center shadow-sm">
              <img
                src={finalImage}
                alt="Strip"
                className="max-h-full object-contain"
              />
            </div>
            <div className="flex-1 bg-white rounded-xl p-2 flex items-center justify-center shadow-sm">
              {isProcessingGif ? (
                <RefreshCcw className="animate-spin text-gray-300" />
              ) : (
                <img
                  src={generatedGif}
                  alt="GIF"
                  className="max-h-full object-contain"
                />
              )}
            </div>
          </div>
        </div>
        <div className="lg:w-1/2 flex flex-col justify-center space-y-8">
          {status === "success" ? (
            <div className="text-center space-y-4 animate-fade-in">
              <CheckCircle size={64} className="mx-auto text-green-500" />
              <h2 className="text-3xl font-bold">Terkirim!</h2>
              <button
                onClick={() => {
                  setRawPhotos([]);
                  setFinalImage(null);
                  navigate("/");
                }}
                className="w-full bg-gray-900 text-white py-4 rounded-2xl font-bold"
              >
                Kembali
              </button>
            </div>
          ) : (
            <form onSubmit={handleSendToCloud} className="space-y-6">
              <h2 className="text-4xl font-black">Simpan Momen</h2>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email kamu..."
                required
                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-pink-500"
              />
              <button
                disabled={status === "uploading" || isProcessingGif}
                className="w-full bg-pink-600 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-2"
              >
                {status === "uploading" ? "Mengirim..." : "Kirim ke Cloud"}{" "}
                <ArrowRight size={20} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Delivery;
