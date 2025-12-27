import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 to-purple-700 flex flex-col items-center justify-center text-white p-6">
      <div className="text-center space-y-8 animate-fade-in-up">
        <div className="bg-white/20 p-6 rounded-full inline-block mb-4 shadow-xl">
          <Camera className="w-20 h-20 text-pink-300" />
        </div>
        <h1 className="text-5xl font-extrabold tracking-tight">WAGO BOOTH</h1>
        <p className="text-xl text-purple-200 max-w-md mx-auto">
          Abadikan momen serumu dengan filter kekinian dan frame unik!
        </p>

        <div className="flex flex-col gap-4 pt-8">
          <Link
            to="/payment"
            className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl font-bold text-xl shadow-lg hover:scale-105 transition transform"
          >
            Mulai Foto (Premium)
          </Link>
          <Link
            to="/booth"
            className="px-8 py-4 bg-white/10 hover:bg-white/20 rounded-2xl font-bold text-lg backdrop-blur-md transition"
          >
            Coba Gratis
          </Link>
          <Link
            to="/gallery"
            className="text-sm underline opacity-80 hover:opacity-100"
          >
            Lihat Galeri Saya
          </Link>
        </div>
      </div>
    </div>
  );
};
export default Home;
