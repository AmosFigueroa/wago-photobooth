import React, { useState, useEffect } from "react";
import {
  LayoutDashboard,
  Image,
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

  // GANTI DENGAN URL APPS SCRIPT BARU KAMU
  const SCRIPT_URL =
    "https://script.google.com/macros/s/AKfycbyg1IZ8lTWCz3y-r-VS4E-s6fz9ug1rtu6id5w8uOd4eBmWtu_-VAEt8ZGTW408cfsu/exec";

  // --- LOGIN SIMPLE ---
  const handleLogin = (e) => {
    e.preventDefault();
    if (pin === "123456") {
      // GANTI PIN RAHASIA DISINI
      setIsAuth(true);
      fetchStats();
    } else {
      alert("PIN Salah!");
    }
  };

  // --- STATISTIK ---
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await fetch(SCRIPT_URL); // GET Request
      const data = await res.json();
      if (data.status === "success") {
        setStats(data.stats);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --- UPLOAD ASET ---
  const [assetFile, setAssetFile] = useState(null);
  const [assetType, setAssetType] = useState("sticker"); // sticker | frame | bg
  const [uploading, setUploading] = useState(false);

  const handleAssetUpload = async (e) => {
    e.preventDefault();
    if (!assetFile) return;

    setUploading(true);
    const reader = new FileReader();
    reader.readAsDataURL(assetFile);
    reader.onloadend = async () => {
      const base64 = reader.result;
      try {
        await fetch(SCRIPT_URL, {
          method: "POST",
          body: JSON.stringify({
            action: "upload_asset",
            image: base64,
            name: assetFile.name,
            type: assetType,
          }),
        });
        alert("Upload Berhasil!");
        setAssetFile(null);
      } catch (err) {
        alert("Gagal upload");
      } finally {
        setUploading(false);
      }
    };
  };

  if (!isAuth) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <form
          onSubmit={handleLogin}
          className="bg-gray-800 p-8 rounded-2xl shadow-xl text-center w-80"
        >
          <h2 className="text-white text-xl font-bold mb-4">Wago Admin</h2>
          <input
            type="password"
            placeholder="Masukkan PIN"
            className="w-full p-3 rounded-lg bg-gray-700 text-white mb-4 text-center tracking-widest text-xl"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
          />
          <button className="w-full bg-pink-600 text-white py-3 rounded-lg font-bold">
            Masuk
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex font-sans">
      {/* SIDEBAR */}
      <div className="w-64 bg-gray-900 text-white p-6 flex flex-col">
        <h1 className="text-2xl font-bold mb-10 text-pink-500">Wago Admin</h1>
        <nav className="space-y-4 flex-1">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
              activeTab === "dashboard"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button
            onClick={() => setActiveTab("assets")}
            className={`flex items-center gap-3 w-full p-3 rounded-xl transition ${
              activeTab === "assets"
                ? "bg-gray-700 text-white"
                : "text-gray-400 hover:bg-gray-800"
            }`}
          >
            <Image size={20} /> Upload Aset
          </button>
        </nav>
        <button
          onClick={() => setIsAuth(false)}
          className="flex items-center gap-3 text-red-400 hover:text-red-300 mt-auto"
        >
          <LogOut size={20} /> Logout
        </button>
      </div>

      {/* CONTENT */}
      <div className="flex-1 p-8 overflow-y-auto">
        {/* DASHBOARD TAB */}
        {activeTab === "dashboard" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-800">
                Overview Statistik
              </h2>
              <button
                onClick={fetchStats}
                className="p-2 bg-white rounded-full shadow hover:bg-gray-50"
              >
                <RefreshCcw size={20} />
              </button>
            </div>

            {loading ? (
              <p>Loading data...</p>
            ) : stats ? (
              <>
                <div className="grid grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-green-100 text-green-600 rounded-xl">
                        <DollarSign />
                      </div>
                      <span className="text-gray-500 font-medium">
                        Total Pendapatan
                      </span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">
                      Rp {stats.totalRevenue.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                        <Users />
                      </div>
                      <span className="text-gray-500 font-medium">
                        Total Pengguna
                      </span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">
                      {stats.totalUsers}{" "}
                      <span className="text-sm font-normal text-gray-400">
                        sesi
                      </span>
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                    <div className="flex items-center gap-4 mb-2">
                      <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
                        <RefreshCcw />
                      </div>
                      <span className="text-gray-500 font-medium">
                        Returning Users
                      </span>
                    </div>
                    <p className="text-3xl font-black text-gray-800">
                      {stats.returningUsers}{" "}
                      <span className="text-sm font-normal text-gray-400">
                        orang
                      </span>
                    </p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
                  <h3 className="font-bold text-gray-700 mb-4">
                    10 Transaksi Terakhir
                  </h3>
                  <table className="w-full text-left text-sm">
                    <thead className="text-gray-400 border-b">
                      <tr>
                        <th className="py-2">Tanggal</th>
                        <th>Email</th>
                        <th>Tipe</th>
                        <th>Harga</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.transactions.map((t, i) => (
                        <tr
                          key={i}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-3 text-gray-500">
                            {new Date(t[0]).toLocaleDateString()}
                          </td>
                          <td className="font-medium">{t[1]}</td>
                          <td>
                            <span className="bg-gray-100 px-2 py-1 rounded text-xs">
                              {t[2]}
                            </span>
                          </td>
                          <td className="font-bold text-green-600">
                            Rp {t[3].toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            ) : (
              <p className="text-red-500">
                Gagal memuat data. Pastikan Sheet ID benar.
              </p>
            )}
          </div>
        )}

        {/* ASSETS TAB */}
        {activeTab === "assets" && (
          <div className="max-w-xl mx-auto bg-white p-8 rounded-2xl shadow-sm border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">
              Upload Aset Baru
            </h2>
            <form onSubmit={handleAssetUpload} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tipe Aset
                </label>
                <div className="flex gap-4">
                  {["sticker", "frame", "bg"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAssetType(t)}
                      className={`flex-1 py-3 rounded-xl border-2 capitalize font-bold ${
                        assetType === t
                          ? "border-pink-500 bg-pink-50 text-pink-600"
                          : "border-gray-200 text-gray-500"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  File Gambar (PNG/Transparan)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:bg-gray-50 transition cursor-pointer relative">
                  <input
                    type="file"
                    onChange={(e) => setAssetFile(e.target.files[0])}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    accept="image/png, image/jpeg"
                  />
                  {assetFile ? (
                    <div className="text-green-600 font-bold">
                      {assetFile.name}
                    </div>
                  ) : (
                    <div className="text-gray-400 flex flex-col items-center">
                      <Upload size={32} className="mb-2" />
                      <span>Klik untuk pilih file</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                disabled={uploading}
                className="w-full py-4 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition disabled:bg-gray-400"
              >
                {uploading ? "Mengupload..." : "Upload ke Server"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
export default Admin;
