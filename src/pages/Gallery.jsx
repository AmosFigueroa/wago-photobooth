import React from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Folder, CheckCircle, Home } from "lucide-react";

const Gallery = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center font-sans">
      {!email ? (
        <div className="max-w-md">
          <h1 className="text-2xl font-bold text-gray-800">Galeri Privat</h1>
          <p className="text-gray-500 mt-2 mb-6">
            Akses halaman ini melalui link yang dikirim ke email kamu.
          </p>
          <button
            onClick={() => navigate("/")}
            className="px-6 py-3 bg-gray-900 text-white rounded-full font-bold"
          >
            Ke Halaman Depan
          </button>
        </div>
      ) : (
        <div className="max-w-lg w-full bg-white border border-gray-100 p-8 rounded-[40px] shadow-2xl animate-fade-in-up">
          <div className="w-20 h-20 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <Folder size={40} />
          </div>

          <h1 className="text-3xl font-black text-gray-800 mb-2">
            Welcome Back!
          </h1>
          <p className="text-gray-500">
            Koleksi foto untuk <b>{email}</b>
          </p>

          <div className="my-8 p-6 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
            <p className="text-sm text-gray-600 mb-4">
              Demi keamanan privasi, file foto kamu tersimpan aman di Folder
              Google Drive Pribadi yang telah kami buatkan.
            </p>
            <a
              href="https://drive.google.com/drive/my-drive"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#e62e7b] text-white font-bold rounded-full shadow-lg hover:shadow-pink-200 hover:scale-105 transition"
            >
              Buka Google Drive Saya
            </a>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-gray-400 text-sm hover:text-gray-600 flex items-center justify-center gap-2 mx-auto"
          >
            <Home size={14} /> Kembali ke Booth
          </button>
        </div>
      )}
    </div>
  );
};
export default Gallery;
