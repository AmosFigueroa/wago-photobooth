import React, { createContext, useState, useContext } from "react";

// Membuat Context
const PhotoContext = createContext();

// Custom Hook agar mudah dipakai di halaman lain
export const usePhoto = () => useContext(PhotoContext);

// Provider untuk membungkus aplikasi
export const PhotoProvider = ({ children }) => {
  const [currentPhoto, setCurrentPhoto] = useState(null); // Foto yang baru saja diambil
  const [history, setHistory] = useState([]); // Riwayat semua foto
  const [isPremium, setIsPremium] = useState(false); // Status premium

  const addToHistory = (photo) => {
    setHistory((prev) => [photo, ...prev]);
  };

  return (
    <PhotoContext.Provider
      value={{
        currentPhoto,
        setCurrentPhoto,
        history,
        addToHistory,
        isPremium,
        setIsPremium,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};
