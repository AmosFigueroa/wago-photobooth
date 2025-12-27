import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Download, Film, Image as ImageIcon, Home, Share2 } from "lucide-react";

const Gallery = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Ambil Data dari URL
  const email = searchParams.get("email");
  const stripId = searchParams.get("strip");
  const gifId = searchParams.get("gif");
  const rawIds = searchParams.get("raw")
    ? searchParams.get("raw").split(",")
    : [];

  // Helper: Link Gambar Langsung dari Drive
  const getImgSrc = (id) => `https://lh3.googleusercontent.com/d/${id}`;
  const getDownloadLink = (id) =>
    `https://drive.google.com/uc?export=download&id=${id}`;

  if (!email || !stripId) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ImageIcon className="text-gray-400" />
        </div>
        <h2 className="text-xl font-bold text-gray-800">
          Link Galeri Tidak Lengkap
        </h2>
        <p className="text-gray-500 mt-2">
          Pastikan kamu membuka link resmi dari email Wago Booth.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 px-6 py-2 bg-gray-900 text-white rounded-full font-bold"
        >
          Ke Depan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-white shadow-sm sticky top-0 z-50 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-pink-500 rounded-lg flex items-center justify-center text-white font-bold">
            W
          </div>
          <span className="font-bold text-gray-800 hidden md:block">
            Wago Cloud
          </span>
        </div>
        <div className="text-xs md:text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
          Milik: <b>{email}</b>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 space-y-10">
        <div className="text-center py-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 mb-2">
            Welcome Back! 👋
          </h1>
          <p className="text-gray-500">
            Berikut adalah koleksi foto digital kamu.
          </p>
        </div>

        {/* 1. HASIL UTAMA (Strip & GIF) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* FOTO STRIP */}
          <div className="bg-white p-4 rounded-3xl shadow-xl hover:shadow-2xl transition duration-500 flex flex-col items-center">
            <div className="bg-gray-100 w-full rounded-2xl p-4 flex items-center justify-center mb-4 min-h-[300px]">
              <img
                src={getImgSrc(stripId)}
                alt="Strip"
                className="max-h-[400px] shadow-md object-contain"
              />
            </div>
            <div className="flex justify-between w-full items-center px-2">
              <div className="text-left">
                <h3 className="font-bold text-gray-800">Foto Strip</h3>
                <p className="text-xs text-gray-400">Format PNG High-Res</p>
              </div>
              <a
                href={getDownloadLink(stripId)}
                className="p-3 bg-gray-900 text-white rounded-full hover:bg-pink-600 transition"
              >
                <Download size={20} />
              </a>
            </div>
          </div>

          {/* GIF ANIMASI */}
          {gifId && (
            <div className="bg-white p-4 rounded-3xl shadow-xl hover:shadow-2xl transition duration-500 flex flex-col items-center">
              <div className="bg-gray-100 w-full rounded-2xl overflow-hidden mb-4 relative min-h-[300px] flex items-center justify-center">
                <img
                  src={getImgSrc(gifId)}
                  alt="GIF"
                  className="w-full h-auto object-cover"
                />
                <div className="absolute top-4 right-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                  <Film size={12} className="text-pink-500" /> GIF
                </div>
              </div>
              <div className="flex justify-between w-full items-center px-2">
                <div className="text-left">
                  <h3 className="font-bold text-gray-800">Animasi Gerak</h3>
                  <p className="text-xs text-gray-400">Looping Video</p>
                </div>
                <a
                  href={getDownloadLink(gifId)}
                  className="p-3 bg-gray-900 text-white rounded-full hover:bg-pink-600 transition"
                >
                  <Download size={20} />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* 2. GRID FOTO RAW */}
        {rawIds.length > 0 && (
          <div className="bg-white rounded-[40px] p-8 shadow-sm border border-gray-100">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              <ImageIcon className="text-pink-500" /> Original Captures
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {rawIds.map((id, idx) => (
                <div
                  key={id}
                  className="group relative rounded-2xl overflow-hidden aspect-square bg-gray-100"
                >
                  <img
                    src={getImgSrc(id)}
                    alt={`Raw ${idx}`}
                    className="w-full h-full object-cover transition duration-500 group-hover:scale-110"
                  />
                  {/* Overlay Download */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <a
                      href={getDownloadLink(id)}
                      className="p-3 bg-white rounded-full text-black hover:scale-110 transition shadow-lg"
                      title="Download"
                    >
                      <Download size={18} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER ACTION */}
        <div className="flex justify-center pt-8">
          <button
            onClick={() => navigate("/")}
            className="px-8 py-3 bg-white border-2 border-gray-200 text-gray-600 font-bold rounded-full hover:bg-gray-50 transition flex items-center gap-2"
          >
            <Home size={18} /> Kembali ke Booth
          </button>
        </div>
      </div>
    </div>
  );
};
export default Gallery;
