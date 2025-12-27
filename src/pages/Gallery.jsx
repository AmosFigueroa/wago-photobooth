import React from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Download,
  Home as HomeIcon,
  Image as ImageIcon,
} from "lucide-react";
import { usePhoto } from "../PhotoContext";

const Gallery = () => {
  const navigate = useNavigate();
  const { history } = usePhoto();

  return (
    <div className="min-h-screen bg-gray-950 text-white p-6">
      <header className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate("/")}
          className="p-3 bg-white/10 rounded-full hover:bg-white/20 transition"
        >
          <HomeIcon />
        </button>
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ImageIcon className="text-pink-400" /> Galeri & History
        </h2>
        <div className="w-12"></div> {/* Spacer */}
      </header>

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-white/40">
          <ImageIcon className="w-16 h-16 mb-4 opacity-50" />
          <p>Belum ada foto yang disimpan.</p>
          <button
            onClick={() => navigate("/booth")}
            className="mt-4 text-pink-400 underline"
          >
            Mulai Foto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {history.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-white/20 shadow-lg aspect-[4/3]"
            >
              <img
                src={img}
                alt={`History ${idx}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-4">
                <a
                  href={img}
                  download={`wago-booth-${Date.now()}.png`}
                  className="p-3 bg-white text-black rounded-full hover:scale-110 transition shadow-lg"
                >
                  <Download className="w-6 h-6" />
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
export default Gallery;
