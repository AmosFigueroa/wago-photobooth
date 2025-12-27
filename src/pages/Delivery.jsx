import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, ArrowRight, CheckCircle, Share2, Home } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Delivery = () => {
  const navigate = useNavigate();
  const { finalImage, setRawPhotos, setFinalImage } = usePhoto();

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | loading | success | error

  // Proteksi: Jika tidak ada foto, balik ke booth
  useEffect(() => {
    if (!finalImage) navigate("/booth");
  }, [finalImage, navigate]);

  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email.includes("@")) {
      alert("Masukkan email yang valid!");
      return;
    }

    setStatus("loading");

    // --- PASTE URL GOOGLE APPS SCRIPT DI SINI ---
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec";

    try {
      // Kita kirim sebagai text/plain (default fetch tanpa header)
      // Ini trik agar tidak kena error CORS dari Google
      const response = await fetch(SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          imageBase64: finalImage,
          userEmail: email,
        }),
      });

      const data = await response.json();

      if (data.result === "success") {
        setStatus("success");
        // alert("Sukses! Cek email kamu.");
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      console.error("Gagal:", err);
      alert("Gagal mengirim email. Pastikan koneksi internet lancar.");
      setStatus("error");
    }
  };

  const handleNewSession = () => {
    setRawPhotos([]);
    setFinalImage(null);
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 font-sans">
      <div className="bg-white p-8 rounded-3xl shadow-2xl w-full max-w-4xl flex flex-col md:flex-row gap-8 items-center">
        {/* KIRI: Preview Foto */}
        <div className="w-full md:w-1/2 flex justify-center bg-gray-100 rounded-2xl p-4">
          {finalImage && (
            <img
              src={finalImage}
              alt="Final Result"
              className="max-h-[60vh] object-contain shadow-lg rounded-lg rotate-1 hover:rotate-0 transition duration-500"
            />
          )}
        </div>

        {/* KANAN: Form Email */}
        <div className="w-full md:w-1/2 space-y-6">
          {status !== "success" ? (
            // --- STATE 1: FORM INPUT ---
            <>
              <div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Simpan Fotomu
                </h2>
                <p className="text-gray-500">
                  Kami akan mengirimkan file foto HD langsung ke emailmu (Google
                  Drive).
                </p>
              </div>

              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Alamat Email
                  </label>
                  <div className="relative">
                    <Mail
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                      size={20}
                    />
                    <input
                      type="email"
                      required
                      placeholder="namamu@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={status === "loading"}
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-xl focus:border-pink-500 focus:outline-none transition font-medium disabled:opacity-50"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className={`w-full py-4 text-white font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2 ${
                    status === "loading"
                      ? "bg-gray-400 cursor-wait"
                      : "bg-[#ff4785] hover:bg-[#ff2e73] hover:shadow-xl"
                  }`}
                >
                  {status === "loading" ? (
                    <span>Sedang Mengirim ke Drive... ⏳</span>
                  ) : (
                    <>
                      Kirim Foto <ArrowRight size={20} />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // --- STATE 2: SUKSES ---
            <div className="text-center space-y-6 animate-fade-in-up">
              <div className="w-24 h-24 bg-green-100 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <CheckCircle size={48} />
              </div>

              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  Berhasil Terkirim!
                </h2>
                <p className="text-gray-500 mt-2">
                  Silakan cek Inbox (atau Spam) email: <br />
                  <span className="font-bold text-gray-800">{email}</span>
                </p>
              </div>

              <div className="bg-blue-50 text-blue-800 p-4 rounded-xl text-sm">
                ✅ Foto tersimpan aman di Google Drive.
                <br />✅ Link download sudah ada di emailmu.
              </div>

              <button
                onClick={handleNewSession}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2"
              >
                <Home size={20} /> Kembali ke Awal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default Delivery;
