import React, { createContext, useState, useContext } from "react";

const PhotoContext = createContext();

export const usePhoto = () => useContext(PhotoContext);

export const PhotoProvider = ({ children }) => {
  const [rawPhotos, setRawPhotos] = useState([]);
  const [finalImage, setFinalImage] = useState(null);
  const [history, setHistory] = useState([]);
  const [isPremium, setIsPremium] = useState(false);

  // Konfigurasi sesi foto (Layout & Timer yang dipilih)
  const [sessionConfig, setSessionConfig] = useState({
    layout: "strip-4", // default
    count: 4,
    timer: 3,
  });

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
        sessionConfig,
        setSessionConfig,
      }}
    >
      {children}
    </PhotoContext.Provider>
  );
};
