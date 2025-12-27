import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  DollarSign,
  Users,
  Upload,
  LogOut,
  RefreshCcw,
  FileText,
} from "lucide-react";

const Admin = () => {
  // --- STATE ---
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  // Data Statistik
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  // Upload Aset
  const [assetFile, setAssetFile] = useState(null);
  const [assetType, setAssetType] = useState("bg"); // 'bg' atau 'sticker'
  const [uploading, setUploading] = useState(false);

  // --- KONFIGURASI ---
  // GANTI DENGAN URL WEB APP TERBARU DARI GOOGLE APPS SCRIPT
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec";

  // --- FUNGSI LOGIN ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === "123456") {
      // PIN Default
      setIsAuth(true);
      fetchStats();
    } else {
      alert("PIN Salah! Coba 123456");
    }
  };

  // --- FUNGSI AMBIL STATISTIK ---
  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(SCRIPT_URL);
      const data = await res.json();

      if (data.status === "success") {
        setStats(data.stats);
      } else {
        console.error("Error data:", data);
      }
    } catch (err) {
      console.error("Gagal koneksi ke server:", err);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI UPLOAD ASET ---
  const handleAssetUpload = async (e) => {
    e.preventDefault();
    if (!assetFile) return;

    setUploading(true);

    // Ubah file jadi Base64 string agar bisa dikirim ke Google Script
    const reader = new FileReader();
    reader.readAsDataURL(assetFile);

    reader.onloadend = async () => {
      try {
        const base64Data = reader.result;

        const res = await fetch(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "upload_asset", // Wajib ada agar backend tahu ini upload aset
            image: base64Data,
            name: assetFile.name,
            type: assetType,
          }),
        });

        const data = await res.json();

        if (data.result === "success") {
          alert(`✅ Sukses! ${assetType.toUpperCase()} berhasil diupload.`);
          setAssetFile(null); // Reset form
        } else {
          alert("❌ Gagal: " + data.message);
        }
      } catch (err) {
        console.error(err);
        alert("❌ Terjadi kesalahan jaringan.");
      } finally {
        setUploading(false);
      }
    };
  };

  // --- TAMPILAN LOGIN ---
  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-800 text-center"
        >
          <div className="w-16 h-16 bg-pink-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <LayoutDashboard className="text-white" size={32} />
          </div>
          <h2 className="text-white text-2xl font-bold mb-2">Admin Portal</h2>
          <p className="text-gray-500 text-sm mb-6">Wago Photobooth System</p>

          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Masukkan PIN"
            className="w-full p-4 rounded-xl bg-gray-800 text-white mb-4 text-center tracking-widest text-2xl border border-gray-700 focus:border-pink-500 outline-none transition"
          />
          <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-pink-900/20">
            Masuk Dashboard
          </button>
        </form>
      </div>
    );
  }

  // --- TAMPILAN DASHBOARD ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans text-gray-800">
      {/* SIDEBAR */}
      <div className="w-full md:w-72 bg-gray-900 text-white p-6 flex flex-col min-h-[100vh]">
        <h1 className="text-2xl font-black text-pink-500 italic mb-10 tracking-tighter">
          WAGO ADMIN
        </h1>

        <nav className="space-y-3 flex-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 w-full p-4 rounded-xl transition font-bold ${
              activeTab === "dashboard"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-900/50"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`flex items-center gap-3 w-full p-4 rounded-xl transition font-bold ${
              activeTab === "assets"
                ? "bg-pink-600 text-white shadow-lg shadow-pink-900/50"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <ImageIcon size={20} /> Library Aset
          </button>
        </nav>

        <button
          onClick={() => setIsAuth(false)}
          className="flex items-center gap-3 text-gray-500 hover:text-red-400 p-4 mt-10 transition font-bold"
        >
          <LogOut size={20} /> Keluar
        </button>
      </div>

      {/* CONTENT AREA */}
      <div className="flex-1 p-6 md:p-12 overflow-y-auto">
        {/* TAB 1: DASHBOARD STATISTIK */}
        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-3xl font-bold text-gray-900">
                  Overview Bisnis
                </h2>
                <p className="text-gray-500">
                  Pantau performa photobooth secara real-time.
                </p>
              </div>
              <button
                onClick={fetchStats}
                className="p-3 bg-white rounded-full shadow-md hover:bg-gray-100 text-gray-600 transition"
              >
                <RefreshCcw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>

            {stats ? (
              <>
                {/* Kartu Statistik */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-green-100 text-green-600 rounded-2xl">
                        <DollarSign size={24} />
                      </div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Total Pendapatan
                      </p>
                    </div>
                    <p className="text-4xl font-black text-gray-800">
                      Rp {stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-2xl">
                        <Users size={24} />
                      </div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Total Sesi Foto
                      </p>
                    </div>
                    <p className="text-4xl font-black text-gray-800">
                      {stats.totalUsers}
                    </p>
                  </div>

                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-2xl">
                        <RefreshCcw size={24} />
                      </div>
                      <p className="text-gray-400 text-xs font-bold uppercase tracking-wider">
                        Returning Users
                      </p>
                    </div>
                    <p className="text-4xl font-black text-gray-800">
                      {stats.returningUsers}
                    </p>
                  </div>
                </div>

                {/* Tabel Transaksi */}
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-200">
                  <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
                    <FileText size={20} /> 10 Transaksi Terakhir
                  </h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-gray-400 border-b border-gray-100 uppercase text-xs">
                        <tr>
                          <th className="py-3 font-bold">Tanggal</th>
                          <th className="py-3 font-bold">Email User</th>
                          <th className="py-3 font-bold">Tipe</th>
                          <th className="py-3 font-bold text-right">Nilai</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {stats.transactions.map((t, i) => (
                          <tr key={i} className="hover:bg-gray-50 transition">
                            <td className="py-4 text-gray-500">
                              {new Date(t[0]).toLocaleDateString()}
                            </td>
                            <td className="py-4 font-bold text-gray-800">
                              {t[1]}
                            </td>
                            <td className="py-4">
                              <span className="bg-blue-50 text-blue-600 px-2 py-1 rounded-md text-xs font-bold">
                                {t[2]}
                              </span>
                            </td>
                            <td className="py-4 text-right font-bold text-green-600">
                              Rp {Number(t[3]).toLocaleString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-20 text-gray-400">
                {loading
                  ? "Sedang memuat data..."
                  : "Gagal memuat data. Periksa URL Script."}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: UPLOAD ASET */}
        {activeTab === "assets" && (
          <div className="max-w-2xl mx-auto space-y-8 animate-fade-in-up">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-900">
                Upload Aset Baru
              </h2>
              <p className="text-gray-500 mt-2">
                Tambahkan background atau stiker baru untuk editor foto.
              </p>
            </div>

            <div className="bg-white p-10 rounded-[40px] shadow-lg border border-gray-100">
              <form onSubmit={handleAssetUpload} className="space-y-8">
                {/* Pilihan Tipe */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-3">
                    1. Pilih Tipe Aset
                  </label>
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => setAssetType("bg")}
                      className={`flex-1 py-4 rounded-2xl font-bold border-2 transition flex flex-col items-center gap-2 ${
                        assetType === "bg"
                          ? "border-pink-500 bg-pink-50 text-pink-600"
                          : "border-gray-100 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <ImageIcon size={24} /> BACKGROUND
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssetType("sticker")}
                      className={`flex-1 py-4 rounded-2xl font-bold border-2 transition flex flex-col items-center gap-2 ${
                        assetType === "sticker"
                          ? "border-pink-500 bg-pink-50 text-pink-600"
                          : "border-gray-100 text-gray-400 hover:border-gray-300"
                      }`}
                    >
                      <Smile size={24} /> STICKER
                    </button>
                  </div>
                </div>

                {/* Input File */}
                <div>
                  <label className="block text-sm font-bold text-gray-400 uppercase mb-3">
                    2. Upload File Gambar
                  </label>
                  <div className="border-4 border-dashed border-gray-100 rounded-[30px] h-64 flex flex-col items-center justify-center relative hover:bg-gray-50 transition cursor-pointer group">
                    <input
                      type="file"
                      onChange={(e) => setAssetFile(e.target.files[0])}
                      className="absolute inset-0 opacity-0 cursor-pointer z-10"
                      accept="image/png, image/jpeg"
                    />
                    {assetFile ? (
                      <div className="text-center">
                        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                          <CheckCircle size={32} />
                        </div>
                        <p className="font-bold text-gray-800">
                          {assetFile.name}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Siap diupload
                        </p>
                      </div>
                    ) : (
                      <div className="text-center group-hover:scale-105 transition duration-300">
                        <div className="w-16 h-16 bg-gray-100 text-gray-400 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Upload size={28} />
                        </div>
                        <p className="font-bold text-gray-500">
                          Klik untuk pilih file
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Format: PNG (Transparan) atau JPG
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tombol Submit */}
                <button
                  disabled={uploading || !assetFile}
                  className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition shadow-xl disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {uploading ? (
                    <>
                      Sedang Mengupload...{" "}
                      <RefreshCcw className="animate-spin" />
                    </>
                  ) : (
                    <>
                      Upload ke Server <ArrowRight />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Ikon tambahan untuk UI
const Smile = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M8 14s1.5 2 4 2 4-2 4-2" />
    <line x1="9" y1="9" x2="9.01" y2="9" />
    <line x1="15" y1="9" x2="15.01" y2="9" />
  </svg>
);
const ArrowRight = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);
const CheckCircle = ({ size }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export default Admin;
