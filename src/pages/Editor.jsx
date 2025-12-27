import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Check, RefreshCcw } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Editor = () => {
  const navigate = useNavigate();
  const { currentPhoto, setCurrentPhoto } = usePhoto();

  // Jika tidak ada foto (misal user langsung akses URL ini), kembalikan ke booth
  useEffect(() => {
    if (!currentPhoto) navigate("/booth");
  }, [currentPhoto, navigate]);

  if (!currentPhoto) return null;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 relative">
      <h2 className="text-white text-2xl font-bold mb-6">Review Foto</h2>

      {/* Area Preview Foto */}
      <div className="relative max-w-2xl w-full aspect-[4/3] bg-black rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20">
        <img
          src={currentPhoto}
          alt="Result"
          className="w-full h-full object-contain"
        />
      </div>

      {/* Tombol Aksi */}
      <div className="flex gap-6 mt-8 w-full max-w-md justify-center">
        <button
          onClick={() => {
            setCurrentPhoto(null);
            navigate("/booth");
          }}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-red-500/80 hover:bg-red-600 text-white rounded-xl font-bold backdrop-blur transition"
        >
          <RefreshCcw className="w-5 h-5" /> Foto Ulang
        </button>
        <button
          onClick={() => navigate("/delivery")}
          className="flex-1 flex items-center justify-center gap-2 py-4 bg-green-500 hover:bg-green-600 text-white rounded-xl font-bold shadow-lg transition scale-105"
        >
          <Check className="w-5 h-5" /> Lanjut
        </button>
      </div>
    </div>
  );
};
export default Editor;
