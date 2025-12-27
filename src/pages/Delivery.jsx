import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Printer, Share2, ArrowLeft } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Delivery = () => {
  const navigate = useNavigate();
  const { currentPhoto, addToHistory, setCurrentPhoto } = usePhoto();

  useEffect(() => {
    if (!currentPhoto) navigate("/booth");
  }, [currentPhoto, navigate]);

  const handleFinish = () => {
    // Simpan foto ke history global
    addToHistory(currentPhoto);
    // Reset foto saat ini agar sesi berikutnya bersih
    setCurrentPhoto(null);
    // Arahkan ke galeri
    navigate("/gallery");
  };

  const handlePrint = () => {
    alert("Fitur Print akan segera hadir! Mengalihkan ke versi digital...");
    handleFinish();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 flex flex-col items-center justify-center">
      <button
        onClick={() => navigate("/editor")}
        className="absolute top-6 left-6 p-2 bg-white/10 rounded-full"
      >
        <ArrowLeft />
      </button>
      <h2 className="text-3xl font-bold mb-8">Pilih Metode Pengiriman</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl w-full">
        {/* Pilihan Print */}
        <button
          onClick={handlePrint}
          className="flex flex-col items-center p-8 bg-white/10 hover:bg-white/20 border-2 border-white/30 rounded-3xl transition group"
        >
          <Printer className="w-20 h-20 mb-4 text-yellow-300 group-hover:scale-110 transition" />
          <h3 className="text-2xl font-bold">Cetak Foto</h3>
          <p className="text-sm text-white/60 mt-2">
            Ambil hasil cetak di mesin.
          </p>
        </button>

        {/* Pilihan Digital */}
        <button
          onClick={handleFinish}
          className="flex flex-col items-center p-8 bg-gradient-to-br from-pink-500/80 to-purple-500/80 hover:scale-105 border-2 border-pink-400/50 rounded-3xl transition shadow-xl"
        >
          <Share2 className="w-20 h-20 mb-4 text-white" />
          <h3 className="text-2xl font-bold">Simpan Digital</h3>
          <p className="text-sm text-white/80 mt-2">
            Simpan ke galeri & download.
          </p>
        </button>
      </div>
    </div>
  );
};
export default Delivery;
