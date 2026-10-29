import React from "react";
import { Volume2, VolumeX } from "lucide-react";
import { useAudio } from "../context/AudioContext";

export const AudioWidget: React.FC = () => {
  const { isPlaying, volume, toggleMusic, setVolume } = useAudio();

  return (
    <div className="group absolute top-4 right-4 z-50 flex items-center gap-2 bg-white px-3 py-1.5 rounded-full shadow-md border border-gray-200 transition-all duration-300 hover:pr-4">
      <button
        type="button"
        onClick={toggleMusic}
        aria-label={isPlaying ? "Mute music" : "Play music"}
        className="flex items-center gap-1.5 text-xs font-bold text-[#6254F5] hover:text-[#4938D8] transition"
      >
        {isPlaying && volume > 0 ? (
          <Volume2 size={18} />
        ) : (
          <VolumeX size={18} />
        )}
      </button>

      {/* Shrinking Volume Slider */}
      <div className="w-0 overflow-hidden transition-all duration-300 ease-in-out group-hover:w-20">
        <input
          type="range"
          min="0"
          max="1"
          step="0.05"
          value={volume}
          onChange={(e) => setVolume(parseFloat(e.target.value))}
          className="w-20 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#6254F5]"
          title={`Volume: ${Math.round(volume * 100)}%`}
        />
      </div>
    </div>
  );
};