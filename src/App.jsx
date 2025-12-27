import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { PhotoProvider } from "./PhotoContext";

// Import Pages
import Home from "./pages/Home";
import Booth from "./pages/Booth";
import Editor from "./pages/Editor";
import Delivery from "./pages/Delivery";
import Gallery from "./pages/Gallery";
import Admin from "./pages/Admin"; // Pastikan file Admin.jsx sudah dibuat

const App = () => {
  return (
    <PhotoProvider>
      <Router>
        <div className="font-sans antialiased text-gray-900">
          <Routes>
            {/* User Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/booth" element={<Booth />} />
            <Route path="/editor" element={<Editor />} />
            <Route path="/delivery" element={<Delivery />} />
            <Route path="/gallery" element={<Gallery />} />

            {/* Admin Route (Rahasia) */}
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </div>
      </Router>
    </PhotoProvider>
  );
};

export default App;
