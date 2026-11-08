import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
  ChevronDown,
  CircleUserRound,
  LogOut,
  Volume2,
  VolumeX,
  Languages,
  Hand,
  PartyPopper,
} from "lucide-react";

import HeaderLogo from "../../assets/HeaderLogo.svg";

import { useAudio } from "../../context/AudioContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

import { supabase } from "../../lib/supabase";
import { getLearnerName } from "../../lib/getLearnerName";

// Shared "chunky 3D" button look: big tap target, presses down when clicked
const chunkyButton =
  "flex h-11 shrink-0 items-center gap-1.5 rounded-2xl border-b-4 px-2.5 text-sm font-extrabold " +
  "whitespace-nowrap sm:h-12 sm:gap-2 sm:px-3 md:px-4 md:text-base " +
  "transition-all duration-150 select-none " +
  "hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 " +
  "motion-reduce:transition-none motion-reduce:hover:translate-y-0";

export default function Header() {
  const navigate = useNavigate();

  const { isPlaying, volume, toggleMusic } = useAudio();
  const { language, toggleLanguage } = useLanguage();
  const { user } = useAuth();

  const learnerName = getLearnerName(user);
  const isTagalog = language === "tl";

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState("");

  const dropdownRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    document.body.style.overflow = showLogoutModal ? "hidden" : "unset";
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showLogoutModal]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close modal with the Escape key
  useEffect(() => {
    if (!showLogoutModal) return;

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !isLoggingOut) setShowLogoutModal(false);
    };

    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [showLogoutModal, isLoggingOut]);

  const handleLogoutClick = () => {
    setIsDropdownOpen(false);
    setLogoutError("");
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = async () => {
    if (isLoggingOut) return;

    setIsLoggingOut(true);
    setLogoutError("");

    try {
      const { error } = await supabase.auth.signOut({ scope: "local" });
      if (error) throw error;

      // Remove legacy authentication data
      localStorage.removeItem("kwelakids_current_user");
      sessionStorage.removeItem("kwelakids_current_user");

      // Remove temporary registration data
      sessionStorage.removeItem("kwelakids_pending_email");
      sessionStorage.removeItem("kwelakids_remember_me");
      sessionStorage.removeItem("kwelakids_otp");
      sessionStorage.removeItem("kwelakids_otp_expiry");
      sessionStorage.removeItem("kwelakids_otp_resend_at");
      sessionStorage.removeItem("kwelakids_signup_draft");

      setShowLogoutModal(false);
      navigate("/signin", { replace: true });
    } catch (error) {
      console.error("Logout error:", error);
      setLogoutError(
        isTagalog
          ? "Hindi makapag-log out ngayon. Subukan ulit."
          : "Unable to log out right now. Please try again."
      );
    } finally {
      setIsLoggingOut(false);
    }
  };

  const isMusicActive = isPlaying && volume > 0;

  return (
    <>
      {/* HEADER */}
      <header className="sticky top-0 z-30 bg-white/95 shadow-sm backdrop-blur">
        {/* Rainbow strip */}
        <div className="h-1.5 w-full bg-linear-to-r from-sky-400 via-purple-400 via-60% to-amber-300" />

        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-2 px-2 min-[400px]:px-3 sm:h-20 sm:px-6 lg:px-8">
          {/* LOGO */}
          <button
            type="button"
            onClick={() => navigate("/categories")}
            aria-label={isTagalog ? "Pumunta sa mga kategorya" : "Go to categories"}
            className="flex shrink-0 items-center rounded-2xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
          >
            <img
              src={HeaderLogo}
              alt="KwelaKids Logo"
              className="w-24 object-contain transition-transform duration-200 min-[400px]:w-36 hover:scale-110 hover:-rotate-2 motion-reduce:transition-none motion-reduce:hover:transform-none sm:w-44 md:w-60"
            />
          </button>

          {/* QUICK ACTIONS: always visible, so kids don't have to search a menu */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
            {/* LANGUAGE */}
            <button
              type="button"
              onClick={() => toggleLanguage()}
              aria-label={isTagalog ? "Palitan sa English" : "Switch to Tagalog"}
              className={`${chunkyButton} border-purple-300 bg-purple-100 text-purple-700 hover:bg-purple-200`}
            >
              <Languages size={22} />
              <span>{isTagalog ? "TL" : "EN"}</span>
            </button>

            {/* MUSIC */}
            <button
              type="button"
              onClick={() => toggleMusic()}
              aria-pressed={isMusicActive}
              aria-label={
                isMusicActive
                  ? isTagalog ? "I-mute ang tugtog" : "Mute music"
                  : isTagalog ? "I-unmute ang tugtog" : "Unmute music"
              }
              className={`${chunkyButton} ${
                isMusicActive
                  ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {isMusicActive ? (
                <Volume2 size={22} className="animate-pulse motion-reduce:animate-none" />
              ) : (
                <VolumeX size={22} />
              )}
              <span className="hidden lg:inline">
                {isMusicActive
                  ? isTagalog ? "Tugtog" : "Music"
                  : isTagalog ? "Naka-mute" : "Muted"}
              </span>
            </button>

            {/* USER BUBBLE */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setIsDropdownOpen((previous) => !previous)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
                className={`${chunkyButton} border-sky-300 bg-sky-100 text-sky-800 hover:bg-sky-200`}
              >
                <CircleUserRound size={22} className="shrink-0" />
                <span className="hidden max-w-48 truncate lg:inline">
                  {isTagalog ? `Kamusta, ${learnerName}!` : `Hi, ${learnerName}!`}
                </span>
                <ChevronDown
                  size={16}
                  className={`shrink-0 transition-transform duration-200 ${
                    isDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* DROPDOWN MENU */}
              {isDropdownOpen && (
                <div
                  role="menu"
                  className="absolute right-0 z-40 mt-3 w-60 max-w-[calc(100vw-1rem)] origin-top-right animate-in rounded-3xl border-2 border-sky-100 bg-white p-3 shadow-xl fade-in zoom-in-95 duration-150"
                >
                  <p className="flex items-center justify-center gap-2 px-3 pb-2 pt-1 text-center text-sm font-extrabold text-sky-800 lg:hidden">
                    <Hand size={16} aria-hidden="true" />
                    {isTagalog ? `Kamusta, ${learnerName}!` : `Hi, ${learnerName}!`}
                  </p>

                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogoutClick}
                    className="flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-base font-bold text-rose-600 transition hover:bg-rose-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-rose-200"
                  >
                    <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100">
                      <LogOut size={18} />
                    </span>
                    {isTagalog ? "Mag-log out" : "Logout"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* LOGOUT CONFIRMATION MODAL */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-sky-950/40 p-4 backdrop-blur-xs fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="logout-title"
        >
          <div className="max-h-[90vh] w-full max-w-md animate-in overflow-y-auto rounded-4xl border-4 border-sky-100 bg-white p-6 text-center sm:p-8 shadow-2xl zoom-in-95 duration-200">
            {/* Friendly wave */}
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-5xl">
              <Hand
                size={40}
                aria-hidden="true"
                className="animate-bounce text-amber-500 motion-reduce:animate-none"
              />
            </div>

            <h2 id="logout-title" className="text-2xl font-black text-slate-900">
              {isTagalog ? "Aalis ka na ba?" : "Leaving already?"}
            </h2>

            <p className="mt-2 text-base font-medium text-slate-600">
              {isTagalog
                ? "Marami pa tayong matututunan! Gusto mo bang mag-log out?"
                : "We still have so much to learn! Do you want to log out?"}
            </p>

            {logoutError && (
              <p role="alert" className="mt-4 rounded-2xl bg-rose-50 px-3 py-2 text-sm font-semibold text-rose-600">
                {logoutError}
              </p>
            )}

            {/* The "stay" button is biggest and first, so kids don't log out by accident */}
            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                onClick={() => setShowLogoutModal(false)}
                disabled={isLoggingOut}
                autoFocus
                className="flex h-14 w-full items-center justify-center gap-2 rounded-full border-b-4 border-sky-700 bg-sky-500 text-lg font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 disabled:cursor-not-allowed disabled:opacity-50 motion-reduce:transition-none"
              >
                <span>{isTagalog ? "Mag-aral pa tayo!" : "Keep learning!"}</span>
                <PartyPopper size={22} aria-hidden="true" />
              </button>

              <button
                type="button"
                onClick={handleConfirmLogout}
                disabled={isLoggingOut}
                className="h-12 w-full rounded-full border-2 border-slate-200 text-sm font-bold text-slate-600 transition hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoggingOut
                  ? isTagalog ? "Nagla-logout..." : "Logging out..."
                  : isTagalog ? "Oo, Mag-log out" : "Yes, Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}