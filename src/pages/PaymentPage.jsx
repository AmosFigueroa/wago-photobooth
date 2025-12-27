import React from "react";
import { useNavigate } from "react-router-dom";
import { Zap, CreditCard, ArrowLeft } from "lucide-react";
import { usePhoto } from "../PhotoContext";

const PaymentPage = () => {
  const navigate = useNavigate();
  const { setIsPremium } = usePhoto();

  const handlePayment = () => {
    // --- LOGIKA WAGO PAYMENT ---
    const GATEWAY_URL = "https://payment-gateway-mutasi.vercel.app/";
    // Return URL diarahkan kembali ke halaman Booth setelah bayar sukses
    const MY_RETURN_URL = window.location.origin + "/booth?status=premium";
    const MY_WEBHOOK = "https://placeholder-webhook.com"; // Ganti dengan webhook aslimu

    const orderData = {
      store: "Wago Photobooth",
      prod: "Unlock Premium",
      price: 25000,
      ref_id: "PB-" + Date.now(),
      notify: MY_WEBHOOK,
      return: MY_RETURN_URL,
      time: 15,
    };

    // Simulasi pembayaran sukses untuk demo (HAPUS INI JIKA SUDAH LIVE)
    // setIsPremium(true);
    // navigate('/booth');
    // return;

    // Redirect ke gateway Wago yang sebenarnya
    const params = new URLSearchParams(orderData).toString();
    window.location.href = `${GATEWAY_URL}?${params}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 flex items-center justify-center">
      <button
        onClick={() => navigate("/")}
        className="absolute top-6 left-6 p-2 bg-white/10 rounded-full"
      >
        <ArrowLeft />
      </button>
      <div className="max-w-md w-full bg-white/10 backdrop-blur-xl p-8 rounded-3xl border border-white/20 shadow-2xl text-center">
        <Zap className="w-16 h-16 text-yellow-400 mx-auto mb-6" />
        <h2 className="text-3xl font-bold mb-2">Unlock Premium</h2>
        <p className="text-indigo-200 mb-8">
          Dapatkan akses filter eksklusif, tanpa watermark, dan frame HD.
        </p>

        <div className="bg-white/5 p-4 rounded-xl mb-8">
          <p className="text-4xl font-black text-pink-400">
            Rp 25.000{" "}
            <span className="text-sm text-white/60 font-normal">/ sesi</span>
          </p>
        </div>

        <button
          onClick={handlePayment}
          className="w-full py-4 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl font-bold text-lg hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all flex items-center justify-center gap-2 scale-105"
        >
          <CreditCard className="w-6 h-6" />
          Bayar Sekarang
        </button>
        <p className="text-xs text-center mt-4 text-white/40">
          Secured by WAGO Payment
        </p>
      </div>
    </div>
  );
};
export default PaymentPage;
