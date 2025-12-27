import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PhotoProvider } from "./PhotoContext";

// Import Halaman-halaman
import Home from "./pages/Home";
import PaymentPage from "./pages/PaymentPage";
import Booth from "./pages/Booth";
import Editor from "./pages/Editor";
import Delivery from "./pages/Delivery";
import Gallery from "./pages/Gallery";

const App = () => {
  return (
    // 1. Bungkus aplikasi dengan Provider agar state bisa diakses di mana saja
    <PhotoProvider>
      {/* 2. Bungkus dengan Router untuk mengaktifkan navigasi */}
      <Router>
        <div className="font-sans">
          <Routes>
            {/* 3. Definisikan rute/alamat halaman */}
            <Route path="/" element={<Home />} />
            <Route path="/payment" element={<PaymentPage />} />
            <Route path="/booth" element={<Booth />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/gallery" element={<Gallery />} />
          </Routes>
        </div>
      </Router>
    </PhotoProvider>
  );
};

export default App;
