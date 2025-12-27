import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Image as ImageIcon,
  DollarSign,
  Users,
  Upload,
  LogOut,
  RefreshCcw,
} from "lucide-react";

const Admin = () => {
  const [isAuth, setIsAuth] = useState(false);
  const [pin, setPin] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [assetFile, setAssetFile] = useState(null);
  const [assetType, setAssetType] = useState("bg");
  const [uploading, setUploading] = useState(false);

  const SCRIPT_URL = "GANTI_DENGAN_URL_WEB_APP_KAMU";

  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === "123456") {
      // PIN default
      setIsAuth(true);
      fetchStats();
    } else {
      alert("PIN Salah!");
    }
  };

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(SCRIPT_URL);
      const data = await res.json();
      if (data.status === "success") setStats(data.stats);
    } catch (err) {
      console.error("Gagal memuat statistik", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssetUpload = async (e) => {
    e.preventDefault();
    if (!assetFile) return;
    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(assetFile);
    reader.onloadend = async () => {
      try {
        const res = await fetch(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "upload_asset",
            image: reader.result,
            name: assetFile.name,
            type: assetType,
          }),
        });
        const data = await res.json();
        if (data.result === "success") {
          alert("Aset berhasil diupload!");
          setAssetFile(null);
        }
      } catch (err) {
        alert("Gagal upload");
      } finally {
        setUploading(false);
      }
    };
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center p-6">
        <form
          onSubmit={handleLogin}
          className="bg-gray-900 p-8 rounded-3xl shadow-2xl w-full max-w-sm border border-gray-800"
        >
          <h2 className="text-white text-2xl font-bold mb-6 text-center">
            Wago Admin Access
          </h2>
          <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="Enter Admin PIN"
            className="w-full p-4 rounded-xl bg-gray-800 text-white mb-4 text-center tracking-widest text-2xl border border-gray-700 focus:border-pink-500 outline-none"
          />
          <button className="w-full bg-pink-600 hover:bg-pink-700 text-white py-4 rounded-xl font-bold transition shadow-lg shadow-pink-900/20">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar */}
      <div className="w-full md:w-64 bg-gray-900 text-white p-6 space-y-8">
        <h1 className="text-2xl font-black text-pink-500 italic">WAGO ADMIN</h1>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
              activeTab === "dashboard"
                ? "bg-pink-600 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
              activeTab === "assets"
                ? "bg-pink-600 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <ImageIcon size={20} /> Library Aset
          </button>
        </nav>
        <button
          onClick={() => setIsAuth(false)}
          className="flex items-center gap-3 text-gray-500 hover:text-red-400 p-3 mt-10 transition"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        {activeTab === "dashboard" && stats && (
          <div className="space-y-8 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold text-gray-800">
                Overview Bisnis
              </h2>
              <button
                onClick={fetchStats}
                className="p-3 bg-white rounded-full shadow-sm hover:bg-gray-100"
              >
                <RefreshCcw
                  size={20}
                  className={loading ? "animate-spin" : ""}
                />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-bold uppercase mb-2">
                  Total Pendapatan
                </p>
                <p className="text-4xl font-black text-green-600">
                  Rp {stats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-bold uppercase mb-2">
                  Total Sesi Foto
                </p>
                <p className="text-4xl font-black text-blue-600">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-400 text-sm font-bold uppercase mb-2">
                  Returning Users
                </p>
                <p className="text-4xl font-black text-purple-600">
                  {stats.returningUsers}
                </p>
              </div>
            </div>
          </div>
        )}

        {activeTab === "assets" && (
          <div className="max-w-2xl bg-white p-8 md:p-12 rounded-[40px] shadow-sm border border-gray-100 mx-auto">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">
              Tambah Aset Baru
            </h2>
            <form onSubmit={handleAssetUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-500 mb-3">
                  Tipe File
                </label>
                <div className="flex gap-3">
                  {["bg", "sticker"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAssetType(t)}
                      className={`flex-1 py-4 rounded-2xl font-bold border-2 transition ${
                        assetType === t
                          ? "border-pink-500 bg-pink-50 text-pink-600"
                          : "border-gray-100 text-gray-400"
                      }`}
                    >
                      {t.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div className="border-4 border-dashed border-gray-100 rounded-[30px] p-10 text-center relative hover:bg-gray-50 transition">
                <input
                  type="file"
                  onChange={(e) => setAssetFile(e.target.files[0])}
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  accept="image/*"
                />
                <div className="text-gray-400">
                  <Upload size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="font-bold">
                    {assetFile ? assetFile.name : "Pilih file PNG atau JPG"}
                  </p>
                </div>
              </div>
              <button
                disabled={uploading}
                className="w-full bg-gray-900 text-white py-5 rounded-2xl font-bold text-lg hover:bg-black transition disabled:bg-gray-200"
              >
                {uploading ? "Sedang Memproses..." : "Simpan ke Library"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
