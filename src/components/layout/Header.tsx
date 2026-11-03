import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, CircleUserRound, LogOut, Volume2, VolumeX, Languages } from "lucide-react";
import HeaderLogo from "../../assets/HeaderLogo.svg";
import { useAudio } from "../../context/AudioContext";
import { useLanguage } from "../../context/LanguageContext";

interface HeaderProps {
  learnerName: string;
}

export default function Header({ learnerName }: HeaderProps) {
  const navigate = useNavigate();
  const { isPlaying, volume, toggleMusic } = useAudio();
  const { language, toggleLanguage } = useLanguage();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showLogoutModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLogoutModal]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleConfirmLogout = () => {
    localStorage.removeItem("kwelakids_current_user");
    sessionStorage.removeItem("kwelakids_current_user");
    setShowLogoutModal(false);
    navigate("/signin", { replace: true });
  };

  const isMusicActive = isPlaying && volume > 0;

  return (
    <>
      <header className="bg-white border-b border-slate-100 shadow-xs relative z-30">
        <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center cursor-pointer" onClick={() => navigate("/categories")}>
            <img src={HeaderLogo} alt="KwelaKids Logo" className="w-52 sm:w-64 object-contain transition-transform hover:scale-105" />
          </div>

          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen((prev) => !prev)}
              aria-expanded={isDropdownOpen}
              className="flex items-center gap-2.5 rounded-full bg-slate-50 border border-slate-200/80 px-4 py-2 text-[#164B9B] transition-all hover:bg-slate-100 hover:border-slate-300 focus:outline-none shadow-xs"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[#6254F5]/10 text-[#6254F5]">
                <CircleUserRound size={18} />
              </div>
              <span className="font-bold text-sm sm:text-base">
                {language === "tl" ? `Kamusta, ${learnerName}!` : `Hi, ${learnerName}!`}
              </span>
              <ChevronDown size={16} className={`text-slate-500 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {isDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border border-slate-100 bg-white p-2 shadow-xl z-40 animate-in fade-in zoom-in-95 duration-150">
                <button
                  type="button"
                  onClick={() => toggleLanguage()}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#6254F5]/10 hover:text-[#6254F5]"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Languages size={16} />
                  </div>
                  <span>{language === "tl" ? "English (EN)" : "Tagalog (PH)"}</span>
                </button>

                <div className="my-1.5 h-px bg-slate-100" />

                <button
                  type="button"
                  onClick={() => toggleMusic()}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-[#6254F5]/10 hover:text-[#6254F5]"
                >
                  {isMusicActive ? (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#6254F5]/10 text-[#6254F5]"><Volume2 size={16} /></div>
                      <span>{language === "tl" ? "I-mute ang Tugtog" : "Mute Music"}</span>
                    </>
                  ) : (
                    <>
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400"><VolumeX size={16} /></div>
                      <span>{language === "tl" ? "I-unmute ang Tugtog" : "Unmute Music"}</span>
                    </>
                  )}
                </button>

                <div className="my-1.5 h-px bg-slate-100" />

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setShowLogoutModal(true);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600"><LogOut size={16} /></div>
                  <span>{language === "tl" ? "Mag-log out" : "Logout"}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* SYSTEM-MATCHED LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-xs animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
        >
          <div className="w-full max-w-md rounded-[28px] border border-slate-100 bg-white p-8 shadow-2xl scale-100 animate-in zoom-in-95 duration-200 text-center">
            
            {/* Icon sa Itaas (pinalitan din ng accent color para magtugma) */}
            <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-[#9285FF]/10 text-[#9285FF] shadow-inner">
              <LogOut size={28} />
            </div>

            {/* Pamagat */}
            <h2 className="text-2xl font-black text-slate-900">
              {language === "tl" ? "Mag-log out" : "Log Out"}
            </h2>

            {/* Mensahe */}
            <p className="mt-2 text-sm font-medium text-slate-600">
              {language === "tl" 
                ? "Sigurado ka bang gusto mong lumabas sa KwelaKids?" 
                : "Are you sure you want to logout of KwelaKids?"}
            </p>

            {/* Buttons */}
            <div className="mt-8 flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                className="h-12 w-1/2 rounded-full border border-slate-300 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none"
              >
                {language === "tl" ? "Kanselahin" : "Cancel"}
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                className="h-12 w-1/2 rounded-full bg-[#9285FF] text-sm font-bold text-white shadow-md shadow-[#9285FF]/30 transition hover:bg-[#8072ef] focus:outline-none focus:ring-2 focus:ring-[#9285FF] focus:ring-offset-2"
              >
                {language === "tl" ? "Oo, Mag-log out" : "Yes, Logout"}
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}