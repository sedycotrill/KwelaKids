
import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

import {
    ChevronDown,
    CircleUserRound,
    LogOut,
    Volume2,
    VolumeX,
    Languages,
} from "lucide-react";

import HeaderLogo from "../../assets/HeaderLogo.svg";

import { useAudio } from "../../context/AudioContext";
import { useLanguage } from "../../context/LanguageContext";
import { useAuth } from "../../context/AuthContext";

import { supabase } from "../../lib/supabase";

// Get the current user's display name
function getLearnerName(
    user: ReturnType<typeof useAuth>["user"]
): string {
    if (!user) return "Learner";

    const metadata = user.user_metadata ?? {};

    const possibleNames = [
        metadata.display_name,
        metadata.full_name,
        metadata.name,
    ];

    for (const name of possibleNames) {
        if (typeof name === "string" && name.trim()) {
            return name.trim();
        }
    }

    // Fallback to the email username
    const emailName = user.email?.split("@")[0];

    if (emailName) {
        return emailName
            .replace(/[._-]/g, " ")
            .replace(/\b\w/g, (character) =>
                character.toUpperCase()
            );
    }

    return "Learner";
}

export default function Header() {
    const navigate = useNavigate();

    const { isPlaying, volume, toggleMusic } = useAudio();
    const { language, toggleLanguage } = useLanguage();

    const { user } = useAuth();

    const learnerName = getLearnerName(user);

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [logoutError, setLogoutError] = useState("");

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Prevent background scrolling while modal is open
    useEffect(() => {
        document.body.style.overflow = showLogoutModal
            ? "hidden"
            : "unset";

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

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );
        };
    }, []);

    // Open logout confirmation
    const handleLogoutClick = () => {
        setIsDropdownOpen(false);
        setLogoutError("");
        setShowLogoutModal(true);
    };

    // Logout through Supabase
    const handleConfirmLogout = async () => {
        if (isLoggingOut) return;

        setIsLoggingOut(true);
        setLogoutError("");

        try {
            // Sign out the current device/session
            const { error } = await supabase.auth.signOut({
                scope: "local",
            });

            if (error) {
                throw error;
            }

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

            // AuthContext receives SIGNED_OUT and clears its user/session
            navigate("/signin", { replace: true });

        } catch (error) {
            console.error("Logout error:", error);

            setLogoutError(
                "Unable to log out right now. Please try again."
            );
        } finally {
            setIsLoggingOut(false);
        }
    };

    const isMusicActive = isPlaying && volume > 0;

    return (
        <>
            {/* HEADER */}
            <header className="relative z-30 border-b border-slate-100 bg-white shadow-xs">
                <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">

                    {/* LOGO */}
                    <div
                        className="flex cursor-pointer items-center"
                        onClick={() => navigate("/categories")}
                    >
                        <img
                            src={HeaderLogo}
                            alt="KwelaKids Logo"
                            className="w-52 object-contain transition-transform hover:scale-105 sm:w-64"
                        />
                    </div>

                    {/* USER DROPDOWN */}
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() =>
                                setIsDropdownOpen((previous) => !previous)
                            }
                            aria-expanded={isDropdownOpen}
                            className="flex items-center gap-2.5 rounded-full border border-slate-200/80 bg-slate-50 px-4 py-2 text-sky-800 shadow-xs transition-all hover:border-slate-300 hover:bg-slate-100 focus:outline-none"
                        >
                            <div className="flex h-7 w-7 items-center justify-center rounded-full bg-sky-500/10 text-sky-600">
                                <CircleUserRound size={18} />
                            </div>

                            <span className="text-sm font-bold sm:text-base">
                                {language === "tl"
                                    ? `Kamusta, ${learnerName}!`
                                    : `Hi, ${learnerName}!`}
                            </span>

                            <ChevronDown
                                size={16}
                                className={`text-slate-500 transition-transform duration-200 ${
                                    isDropdownOpen ? "rotate-180" : ""
                                }`}
                            />
                        </button>

                        {/* DROPDOWN MENU */}
                        {isDropdownOpen && (
                            <div className="absolute right-0 z-40 mt-2 w-56 origin-top-right animate-in rounded-2xl border border-slate-100 bg-white p-2 shadow-xl fade-in zoom-in-95 duration-150">

                                {/* LANGUAGE */}
                                <button
                                    type="button"
                                    onClick={() => toggleLanguage()}
                                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-purple-50 hover:text-purple-600"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                                        <Languages size={16} />
                                    </div>

                                    <span>
                                        {language === "tl"
                                            ? "English (EN)"
                                            : "Tagalog (PH)"}
                                    </span>
                                </button>

                                <div className="my-1.5 h-px bg-slate-100" />

                                {/* MUSIC */}
                                <button
                                    type="button"
                                    onClick={() => toggleMusic()}
                                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-sky-50 hover:text-sky-600"
                                >
                                    {isMusicActive ? (
                                        <>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-50 text-sky-600">
                                                <Volume2 size={16} />
                                            </div>

                                            <span>
                                                {language === "tl"
                                                    ? "I-mute ang Tugtog"
                                                    : "Mute Music"}
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-400">
                                                <VolumeX size={16} />
                                            </div>

                                            <span>
                                                {language === "tl"
                                                    ? "I-unmute ang Tugtog"
                                                    : "Unmute Music"}
                                            </span>
                                        </>
                                    )}
                                </button>

                                <div className="my-1.5 h-px bg-slate-100" />

                                {/* LOGOUT */}
                                <button
                                    type="button"
                                    onClick={handleLogoutClick}
                                    className="flex w-full items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                                >
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 text-red-600">
                                        <LogOut size={16} />
                                    </div>

                                    <span>
                                        {language === "tl"
                                            ? "Mag-log out"
                                            : "Logout"}
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* LOGOUT CONFIRMATION MODAL */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 z-50 flex animate-in items-center justify-center bg-black/40 p-4 backdrop-blur-xs fade-in duration-200"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="logout-title"
                >
                    <div className="w-full max-w-md animate-in scale-100 rounded-[28px] border border-slate-100 bg-white p-8 text-center shadow-2xl zoom-in-95 duration-200">

                        {/* ICON */}
                        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-sky-500/10 text-sky-600 shadow-inner">
                            <LogOut size={28} />
                        </div>

                        {/* TITLE */}
                        <h2
                            id="logout-title"
                            className="text-2xl font-black text-slate-900"
                        >
                            {language === "tl"
                                ? "Mag-log out"
                                : "Log Out"}
                        </h2>

                        {/* DESCRIPTION */}
                        <p className="mt-2 text-sm font-medium text-slate-600">
                            {language === "tl"
                                ? "Sigurado ka bang gusto mong lumabas sa KwelaKids?"
                                : "Are you sure you want to logout of KwelaKids?"}
                        </p>

                        {/* ERROR MESSAGE */}
                        {logoutError && (
                            <p
                                role="alert"
                                className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600"
                            >
                                {logoutError}
                            </p>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="mt-8 flex items-center gap-3">

                            <button
                                type="button"
                                onClick={() => setShowLogoutModal(false)}
                                disabled={isLoggingOut}
                                className="h-12 w-1/2 rounded-full border border-slate-300 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {language === "tl"
                                    ? "Kanselahin"
                                    : "Cancel"}
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmLogout}
                                disabled={isLoggingOut}
                                className="h-12 w-1/2 rounded-full bg-sky-500 text-sm font-bold text-white shadow-md shadow-sky-500/30 transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isLoggingOut
                                    ? language === "tl"
                                        ? "Nagla-logout..."
                                        : "Logging out..."
                                    : language === "tl"
                                        ? "Oo, Mag-log out"
                                        : "Yes, Logout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
