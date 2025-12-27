import React from "react";
import { Link } from "react-router-dom";
import { Camera } from "lucide-react";

const Home = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-800 p-6 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-20%] left-[-20%] w-[500px] h-[500px] bg-pink-200 rounded-full blur-3xl opacity-50"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[400px] h-[400px] bg-blue-200 rounded-full blur-3xl opacity-50"></div>

      <div className="text-center space-y-8 animate-fade-in-up z-10">
        <div className="bg-gradient-to-tr from-pink-500 to-purple-600 p-6 rounded-3xl inline-block mb-4 shadow-xl shadow-pink-200">
          <Camera className="w-20 h-20 text-white" />
        </div>
        <div>
          <h1 className="text-6xl font-black tracking-tighter mb-2 bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            WAGO BOOTH
          </h1>
          <p className="text-xl text-gray-500 font-medium max-w-md mx-auto">
            Studio foto otomatis dengan filter kekinian & AI Frame.
          </p>
        </div>

        <div className="flex flex-col gap-4 pt-4 w-full max-w-xs mx-auto">
          <Link
            to="/booth"
            className="w-full py-4 bg-gray-900 text-white rounded-2xl font-bold text-xl shadow-2xl hover:scale-105 hover:bg-black transition flex items-center justify-center gap-2"
          >
            Mulai Foto 📸
          </Link>
          {/* LINK GALERI DIHAPUS DARI SINI */}
        </div>

        <p className="text-xs text-gray-400 mt-12">© 2025 Wago Booth System</p>
      </div>
    </div>
  );
};
export default Home;
