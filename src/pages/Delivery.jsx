import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const { finalImage, rawPhotos, setRawPhotos, setFinalImage } = usePhoto();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [generatedGif, setGeneratedGif] = useState(null);

  useEffect(() => {
    if (!finalImage) navigate("/booth");
    if (rawPhotos.length > 0) {
      createGif();
    }
  }, [finalImage, rawPhotos, navigate]);

  // --- PERBAIKAN 1: GIF TIDAK GEPENG (RASIO 16:9) ---
  const createGif = () => {
    gifshot.createGIF(
      {
        images: rawPhotos,
        interval: 0.5,
        gifWidth: 640, // Lebar standar
        gifHeight: 360, // Tinggi 16:9 (640 * 9 / 16)
        numFrames: 10,
      },
      function (obj) {
        if (!obj.error) {
          setGeneratedGif(obj.image);
        }
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
        name: "Animasi.gif",
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

    // --- GANTI URL INI DENGAN URL APPS SCRIPT BARU (SETELAH DEPLOY ULANG) ---
    const SCRIPT_URL =
      "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec";

    try {
      await fetch(SCRIPT_URL, {
        method: "POST",
        // Kita kirim URL website saat ini agar email bisa generate link galeri yang benar
        body: JSON.stringify({
          userEmail: email,
          uploads: uploads,
          appUrl: window.location.origin, // Otomatis deteksi domain (localhost/vercel)
        }),
      });
      setStatus("success");
    } catch (err) {
      console.error(err);
      alert("Gagal koneksi ke server.");
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
            {generatedGif && (
              <div className="flex-1 bg-white rounded-xl shadow-sm p-2 flex flex-col items-center justify-center relative overflow-hidden">
                {/* GIF Preview */}
                <img
                  src={generatedGif}
                  alt="GIF"
                  className="w-full h-full object-cover rounded-lg opacity-90"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="bg-black/50 text-white px-3 py-1 rounded-full text-xs font-bold flex gap-1">
                    <Film size={14} /> GIF
                  </span>
                </div>
              </div>
            )}
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
                      disabled={status === "uploading"}
                      className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:border-pink-500"
                    />
                    <button
                      type="submit"
                      disabled={status === "uploading"}
                      className="bg-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-pink-700 transition disabled:bg-gray-400"
                    >
                      {status === "uploading" ? "⏳" : <ArrowRight />}
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
