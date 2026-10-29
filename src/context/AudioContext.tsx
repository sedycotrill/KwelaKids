import React, { createContext, useContext, useState, useRef, useEffect } from "react";
import bgMusic from "../assets/BackgroundMusic.mp3";

interface AudioContextType {
  isPlaying: boolean;
  volume: number;
  toggleMusic: () => void;
  setVolume: (vol: number) => void;
}

const AudioContext = createContext<AudioContextType | undefined>(undefined);

export const AudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.3); // Default 30% volume
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleMusic = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch((err) => {
          console.log("Autoplay blocked:", err);
        });
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSetVolume = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0 && !isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => {});
      setIsPlaying(true);
    }
  };

  return (
    <AudioContext.Provider
      value={{
        isPlaying,
        volume,
        toggleMusic,
        setVolume: handleSetVolume,
      }}
    >
      <audio ref={audioRef} src={bgMusic} loop />
      {children}
    </AudioContext.Provider>
  );
};

export const useAudio = () => {
  const context = useContext(AudioContext);
  if (!context) {
    throw new Error("useAudio must be used within an AudioProvider");
  }
  return context;
};