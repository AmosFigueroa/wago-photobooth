import React, { createContext, useState, useContext } from "react";

const PhotoContext = createContext();

export const usePhoto = () => useContext(PhotoContext);

export const PhotoProvider = ({ children }) => {
  const [rawPhotos, setRawPhotos] = useState([]); // Array untuk menyimpan 4 foto mentah
  const [finalImage, setFinalImage] = useState(null); // Hasil akhir setelah diedit
  const [history, setHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  const addToHistory = (photo) => {
    setHistory((prev) => [photo, ...prev]);
  };

  return (
    <PhotoContext.Provider
      value={{
        rawPhotos,
        setRawPhotos,
        finalImage,
        setFinalImage,
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
