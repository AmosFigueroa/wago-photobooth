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

  // Ambil warna frame dari halaman sebelumnya
  const frameColor = location.state?.frameColorForGif || "#ffffff";

  // URL Backend Google Apps Script (Pastikan ini URL Deploy terbaru kamu)
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec";

  useEffect(() => {
    if (!finalImage) navigate("/booth");
    if (rawPhotos.length > 0 && !generatedGif) {
      createFramedGif();
    }
  }, [finalImage, rawPhotos, navigate, generatedGif]);

  // --- FUNGSI MEMBUAT FRAME GIF ---
  const processFramesWithBorder = async (photos, color) => {
    const processedImages = [];
    const padding = 25;
    const footerH = 50;
    const targetW = 640;
    const targetH = 360;

    const canvas = document.createElement("canvas");
    canvas.width = targetW + padding * 2;
    canvas.height = targetH + padding * 2 + footerH;
    const ctx = canvas.getContext("2d");

    for (const src of photos) {
      ctx.fillStyle = color;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const img = new Image();
      img.src = src;
      await new Promise((resolve) => {
        img.onload = resolve;
      });

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
      {
        images: framedPhotos,
        interval: 0.5,
        gifWidth: 690,
        gifHeight: 460,
        numFrames: 10,
      },
      function (obj) {
        if (!obj.error) {
          setGeneratedGif(obj.image);
        }
        setIsProcessingGif(false);
      }
    );
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
    uploads.push({
      name: "Foto-Strip.png",
      data: finalImage,
      label: "Foto Strip",
    });

    if (generatedGif) {
      uploads.push({
        name: "Animasi-Befram.gif",
        data: generatedGif,
        label: "Animasi GIF",
      });
    }

    rawPhotos.forEach((img, idx) => {
      uploads.push({
        name: `Raw-${idx + 1}.png`,
        data: img,
        label: `Mentah ${idx + 1}`,
      });
    });

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        // --- UPDATE PENTING: Menambahkan action 'upload_user' untuk Admin Stats ---
        body: JSON.stringify({
          action: "upload_user",
          userEmail: email,
          uploads: uploads,
          appUrl: window.location.origin,
        }),
      });
      setStatus("success");
    } catch (err) {
      console.error(err);
      alert("Gagal koneksi ke server. Pastikan internet lancar.");
      setStatus("idle");
    }
  };

  const handleFinish = () => {
    setRawPhotos([]);
    setFinalImage(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-[40px] shadow-2xl w-full max-w-5xl flex flex-col lg:flex-row gap-10">
        {/* PREVIEW AREA */}
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
                <div className="flex flex-col items-center text-gray-400 text-sm">
                  <span className="text-2xl animate-spin mb-2">⚙️</span>
                  Membuat Frame GIF...
                </div>
              ) : generatedGif ? (
                <>
                  <img
                    src={generatedGif}
                    alt="GIF Framed"
                    className="w-full h-full object-contain rounded-lg shadow-sm"
                  />
                  <div className="absolute top-3 right-3">
                    <span className="bg-black/60 text-white px-2 py-1 rounded-md text-[10px] font-bold flex items-center gap-1">
                      <Film size={12} /> GIF
                    </span>
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>

        {/* ACTION AREA */}
        <div className="lg:w-1/2 flex flex-col justify-center space-y-8">
          {status === "success" ? (
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={48} />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-gray-800">
                  Paket Terkirim!
                </h2>
                <p className="text-gray-500 mt-2">
                  Cek email <b>{email}</b> untuk melihat galerimu.
                </p>
              </div>
              <button
                onClick={handleFinish}
                className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold hover:bg-black transition"
              >
                Selesai
              </button>
            </div>
          ) : (
            <>
              <div>
                <h2 className="text-4xl font-black text-gray-800 mb-2">
                  Simpan Paket
                </h2>
                <p className="text-gray-500 text-lg">
                  Download langsung atau kirim ke Cloud.
                </p>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleDownloadLocal}
                  className="w-full p-6 bg-white border-2 border-gray-100 rounded-3xl hover:border-blue-200 hover:bg-blue-50 transition flex items-center gap-6 group text-left"
                >
                  <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition">
                    <Download size={32} />
                  </div>
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">
                      Download HP
                    </h4>
                    <p className="text-sm text-gray-400">
                      Simpan Foto Strip ke galeri HP.
                    </p>
                  </div>
                </button>

                <div
                  className={`p-6 bg-gradient-to-br from-pink-50 to-purple-50 border-2 border-pink-100 rounded-3xl transition ${
                    status === "uploading" || isProcessingGif
                      ? "opacity-80 cursor-not-allowed"
                      : ""
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
                        Kirim Paket Lengkap ke Email.
                      </p>
                    </div>
                  </div>
                  <form onSubmit={handleSendToCloud} className="flex gap-2">
                    <input
                      type="email"
                      placeholder="namamu@email.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "uploading" || isProcessingGif}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500 disabled:bg-gray-100"
                    />
                    <button
                      type="submit"
                      disabled={status === "uploading" || isProcessingGif}
                      className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition disabled:bg-gray-400 flex items-center justify-center min-w-[60px]"
                    >
                      {status === "uploading" ? (
                        "⏳"
                      ) : isProcessingGif ? (
                        "⚙️"
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
