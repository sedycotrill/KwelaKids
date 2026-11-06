
import { useEffect, useRef, useState } from "react";
import type { KeyboardEvent, ClipboardEvent } from "react";
import { useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase";

import background from "../../assets/bgforotp.svg";
import person from "../../assets/personotponly.svg";

const OTP_LENGTH = 6;
const RESEND_COOLDOWN = 60;

export default function OTP() {
    const navigate = useNavigate();

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const [otp, setOtp] = useState<string[]>(
        Array(OTP_LENGTH).fill("")
    );

    const [secondsLeft, setSecondsLeft] = useState(
        RESEND_COOLDOWN
    );

    const [error, setError] = useState("");
    const [isVerified, setIsVerified] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);

    // Check pending registration
    useEffect(() => {
        const pendingEmail = sessionStorage.getItem(
            "kwelakids_pending_email"
        );

        if (!pendingEmail) {
            navigate("/signup", { replace: true });
            return;
        }

        inputRefs.current[0]?.focus();
    }, [navigate]);

    // Countdown for resend cooldown
    useEffect(() => {
        if (secondsLeft <= 0) return;

        const timer = window.setInterval(() => {
            setSecondsLeft((previous) =>
                Math.max(0, previous - 1)
            );
        }, 1000);

        return () => window.clearInterval(timer);
    }, [secondsLeft]);

    // Format countdown
    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;

        return `${String(minutes).padStart(2, "0")}:${String(
            remainingSeconds
        ).padStart(2, "0")}`;
    };

    // Handle individual digit input
    const handleOTPChange = (
        value: string,
        index: number
    ) => {
        const digit = value.replace(/\D/g, "").slice(-1);

        const updatedOTP = [...otp];
        updatedOTP[index] = digit;

        setOtp(updatedOTP);
        setError("");

        if (digit && index < OTP_LENGTH - 1) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle keyboard navigation
    const handleKeyDown = (
        event: KeyboardEvent<HTMLInputElement>,
        index: number
    ) => {
        if (
            event.key === "Backspace" &&
            !otp[index] &&
            index > 0
        ) {
            inputRefs.current[index - 1]?.focus();
        }

        if (event.key === "ArrowLeft" && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }

        if (
            event.key === "ArrowRight" &&
            index < OTP_LENGTH - 1
        ) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    // Handle pasted OTP
    const handlePaste = (
        event: ClipboardEvent<HTMLInputElement>
    ) => {
        event.preventDefault();

        const pastedCode = event.clipboardData
            .getData("text")
            .replace(/\D/g, "")
            .slice(0, OTP_LENGTH);

        if (!pastedCode) return;

        const updatedOTP = Array(OTP_LENGTH).fill("");

        pastedCode.split("").forEach((digit, index) => {
            updatedOTP[index] = digit;
        });

        setOtp(updatedOTP);
        setError("");

        const nextIndex = Math.min(
            pastedCode.length,
            OTP_LENGTH - 1
        );

        inputRefs.current[nextIndex]?.focus();
    };

    // Verify OTP through Supabase
    const handleVerify = async () => {
        if (isVerifying || isVerified) return;

        const enteredOTP = otp.join("");

        if (enteredOTP.length !== OTP_LENGTH) {
            setError(
                "Please enter the complete 6-digit verification code."
            );
            return;
        }

        const email = sessionStorage.getItem(
            "kwelakids_pending_email"
        );

        if (!email) {
            setError(
                "Registration details not found. Please sign up again."
            );
            return;
        }

        setIsVerifying(true);
        setError("");

        try {
            const { data, error } = await supabase.auth.verifyOtp({
                email,
                token: enteredOTP,
                type: "signup",
            });

            if (error) {
                console.error("OTP verification error:", error);

                setError(
                    "Invalid or expired verification code. Please try again."
                );
                return;
            }

            if (!data.user) {
                setError(
                    "Unable to verify your account. Please try again."
                );
                return;
            }

            // Remove temporary registration details
            sessionStorage.removeItem(
                "kwelakids_pending_email"
            );

            sessionStorage.removeItem(
                "kwelakids_remember_me"
            );

            sessionStorage.removeItem(
                "kwelakids_otp_resend_at"
            );

            setIsVerified(true);

            // Supabase has authenticated the user
            navigate("/categories", { replace: true });

        } catch (verificationError) {
            console.error(
                "OTP verification error:",
                verificationError
            );

            setError(
                "Something went wrong. Please try again."
            );
        } finally {
            setIsVerifying(false);
        }
    };

    // Resend OTP through Supabase
    const handleResend = async () => {
        if (secondsLeft > 0 || isResending) return;

        const email = sessionStorage.getItem(
            "kwelakids_pending_email"
        );

        if (!email) {
            setError(
                "Registration details not found. Please sign up again."
            );
            return;
        }

        setIsResending(true);
        setError("");

        try {
            const { error } = await supabase.auth.resend({
                type: "signup",
                email,
            });

            if (error) {
                console.error("OTP resend error:", error);

                setError(
                    "Unable to resend the verification code. Please try again."
                );
                return;
            }

            setSecondsLeft(RESEND_COOLDOWN);
            setOtp(Array(OTP_LENGTH).fill(""));

            inputRefs.current[0]?.focus();

        } catch (resendError) {
            console.error("OTP resend error:", resendError);

            setError(
                "Something went wrong while resending your code."
            );
        } finally {
            setIsResending(false);
        }
    };

    return (
        <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-slate-50">

            {/* Background */}
            <img
                src={background}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover"
            />

            {/* Character Illustration */}
            <img
                src={person}
                alt="KwelaKids character showing Filipino Sign Language"
                className="absolute bottom-0 z-0 h-[120%] w-[1000%] object-fill object-bottom"
            />

            {/* OTP Card */}
            <section className="relative z-10 ml-auto mr-[9%] left-[-30px] flex min-h-screen w-full max-w-[480px] items-center justify-center px-4 sm:px-0">

                <div className="flex min-h-[460px] w-full flex-col justify-center rounded-[18px] border-2 border-slate-200 bg-white px-10 py-10 shadow-[0_3px_12px_rgba(0,0,0,0.08)]">

                    {/* Heading */}
                    <div className="text-center">

                        <h1 className="text-[28px] font-extrabold text-sky-700">
                            Verify your Account
                        </h1>

                        <p className="mt-2 text-[15px] text-slate-600">
                            Enter the verification code we just sent to your email.
                        </p>
                    </div>

                    {/* OTP Inputs */}
                    <div className="mt-7 flex justify-center gap-3">

                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(element) => {
                                    inputRefs.current[index] = element;
                                }}
                                type="text"
                                inputMode="numeric"
                                autoComplete={
                                    index === 0
                                        ? "one-time-code"
                                        : "off"
                                }
                                maxLength={1}
                                value={digit}
                                disabled={isVerified || isVerifying}
                                onChange={(event) =>
                                    handleOTPChange(
                                        event.target.value,
                                        index
                                    )
                                }
                                onKeyDown={(event) =>
                                    handleKeyDown(event, index)
                                }
                                onPaste={handlePaste}
                                aria-label={`OTP digit ${index + 1}`}
                                className="h-12 w-12 rounded-full border border-slate-300 bg-white text-center text-base font-semibold text-slate-900 shadow-[0_2px_3px_rgba(0,0,0,0.18)] outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 disabled:bg-slate-100"
                            />
                        ))}

                    </div>

                    {/* Error */}
                    {error && (
                        <p
                            role="alert"
                            className="mt-3 text-center text-xs text-red-600"
                        >
                            {error}
                        </p>
                    )}

                    {/* Expiration / Resend Countdown */}
                    <div className="mt-8 text-center text-[13px] text-slate-500">

                        Resend available in{" "}

                        <span
                            className={`font-medium ${
                                secondsLeft === 0
                                    ? "text-green-600"
                                    : "text-sky-600"
                            }`}
                        >
                            {formatTime(secondsLeft)}
                        </span>

                    </div>

                    {/* Resend */}
                    <p className="mt-2 text-center text-[13px] text-slate-700">

                        Didn't receive a code?{" "}

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={
                                secondsLeft > 0 ||
                                isResending ||
                                isVerified
                            }
                            className={`underline underline-offset-4 ${
                                secondsLeft > 0 ||
                                isResending ||
                                isVerified
                                    ? "cursor-not-allowed text-slate-400"
                                    : "text-sky-600 hover:text-sky-700"
                            }`}
                        >
                            {isResending ? "Sending..." : "Resend"}
                        </button>

                    </p>

                    {/* Verify Button */}
                    <button
                        type="button"
                        onClick={handleVerify}
                        disabled={isVerified || isVerifying}
                        className="mt-6 h-10 w-full rounded-full bg-sky-500 text-[13px] font-bold text-white shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isVerifying
                            ? "Verifying..."
                            : "Verify"}
                    </button>

                </div>
            </section>
        </main>
    );
}
