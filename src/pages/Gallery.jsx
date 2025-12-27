import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Download, CheckCircle, Lock } from "lucide-react";

const Gallery = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const email = searchParams.get("email");

  // Karena file sudah di Drive (Link dikirim via email),
  // Halaman ini sekarang hanya berfungsi sebagai konfirmasi atau redirect.

  if (!email) {
    // Jika orang iseng buka /gallery tanpa link email
    return (
      <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white p-6 text-center">
        <Lock size={64} className="text-gray-600 mb-4" />
        <h1 className="text-2xl font-bold">Akses Dibatasi</h1>
        <p className="text-gray-400 mt-2">
          Halaman ini hanya bisa diakses melalui link di email kamu.
        </p>
        <button
          onClick={() => navigate("/")}
          className="mt-8 px-6 py-3 bg-white text-black rounded-full font-bold"
        >
          Kembali ke Depan
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
        <CheckCircle size={48} />
      </div>
      <h1 className="text-3xl font-black text-gray-800 mb-2">
        Halo, {email.split("@")[0]}!
      </h1>
      <p className="text-gray-500 max-w-md mx-auto">
        Kamu sedang mengakses portal Wago Cloud. Silakan cek <b>Inbox Email</b>{" "}
        kamu untuk melihat folder Google Drive berisi:
      </p>

      <div className="mt-8 grid grid-cols-3 gap-4 max-w-lg mx-auto w-full">
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-2xl">📸</span>
          <p className="text-xs font-bold mt-2 text-gray-600">Foto Strip</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-2xl">🎬</span>
          <p className="text-xs font-bold mt-2 text-gray-600">Animasi GIF</p>
        </div>
        <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
          <span className="text-2xl">🖼️</span>
          <p className="text-xs font-bold mt-2 text-gray-600">Foto Raw</p>
        </div>
      </div>

      <p className="text-xs text-gray-400 mt-12">
        Link download lengkap sudah dikirim ke {email}
      </p>
    </div>
  );
};
export default Gallery;
