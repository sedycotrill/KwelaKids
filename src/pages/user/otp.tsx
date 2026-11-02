
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import background from "../../assets/bgforotp.svg";
import person from "../../assets/personotponly.svg";

type Account = {
  id: string;
  email: string;
  password: string;
};

const OTP_LENGTH = 6;
const OTP_DURATION = 180;

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export default function OTP() {
  const navigate = useNavigate();
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [otp, setOtp] = useState<string[]>(
    Array(OTP_LENGTH).fill("")
  );
  const [secondsLeft, setSecondsLeft] = useState(OTP_DURATION);
  const [error, setError] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // Generate and store OTP
const createOTP = () => {
  const newOTP = generateOTP();
  const expiry = Date.now() + OTP_DURATION * 1000;

  sessionStorage.setItem("kwelakids_otp", newOTP);
  sessionStorage.setItem("kwelakids_otp_expiry", expiry.toString());

  console.log("Generated OTP:", newOTP);

  setSecondsLeft(OTP_DURATION);
  setOtp(Array(OTP_LENGTH).fill(""));
  setError("");

  inputRefs.current[0]?.focus();
};

  // Check pending registration and generate initial OTP
  useEffect(() => {
    const pendingAccount = sessionStorage.getItem(
      "kwelakids_pending_account"
    );

    if (!pendingAccount) {
      navigate("/signup", { replace: true });
      return;
    }

    try {
      JSON.parse(pendingAccount) as Account;
      createOTP();
    } catch {
      sessionStorage.removeItem("kwelakids_pending_account");
      navigate("/signup", { replace: true });
    }
  }, [navigate]);

  // Countdown timer
  useEffect(() => {
    const timer = window.setInterval(() => {
      const expiry = Number(
        sessionStorage.getItem("kwelakids_otp_expiry")
      );

      if (!expiry) return;

      const remaining = Math.max(
        0,
        Math.ceil((expiry - Date.now()) / 1000)
      );

      setSecondsLeft(remaining);
    }, 1000);

    return () => window.clearInterval(timer);
  }, []);

  // Format timer
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    return `${String(minutes).padStart(2, "0")}:${String(
      remainingSeconds
    ).padStart(2, "0")}`;
  };

  // Handle individual digit input
  const handleOTPChange = (value: string, index: number) => {
    const digit = value.replace(/\D/g, "").slice(-1);

    const updatedOTP = [...otp];
    updatedOTP[index] = digit;

    setOtp(updatedOTP);
    setError("");

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle backspace
  const handleKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
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

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle pasted OTP
  const handlePaste = (
    event: React.ClipboardEvent<HTMLInputElement>
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

  // Verify OTP and complete registration
  const handleVerify = () => {
    const enteredOTP = otp.join("");

    if (secondsLeft <= 0) {
      setError("Your verification code has expired. Please request a new one.");
      return;
    }

    if (enteredOTP.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    const storedOTP = sessionStorage.getItem("kwelakids_otp");
    const expiry = Number(
      sessionStorage.getItem("kwelakids_otp_expiry")
    );

    if (!storedOTP || Date.now() >= expiry) {
      setError("Your verification code has expired. Please request a new one.");
      return;
    }

    if (enteredOTP !== storedOTP) {
      setError("Incorrect verification code. Please try again.");
      return;
    }

    try {
      const pendingAccountData = sessionStorage.getItem(
        "kwelakids_pending_account"
      );

      if (!pendingAccountData) {
        setError("Registration details not found. Please sign up again.");
        return;
      }

      const pendingAccount = JSON.parse(
        pendingAccountData
      ) as Account;

      const storedAccounts = localStorage.getItem(
        "kwelakids_accounts"
      );

      const accounts: Account[] = storedAccounts
        ? JSON.parse(storedAccounts)
        : [];

      const emailExists = accounts.some(
        (account) =>
          account.email.toLowerCase() ===
          pendingAccount.email.toLowerCase()
      );

      if (emailExists) {
        setError("This email is already registered. Please sign in.");
        sessionStorage.removeItem("kwelakids_pending_account");
        navigate("/signin");
        return;
      }

      // Save verified account
      localStorage.setItem(
        "kwelakids_accounts",
        JSON.stringify([...accounts, pendingAccount])
      );

      // Clear temporary registration and OTP data
      sessionStorage.removeItem("kwelakids_pending_account");
      sessionStorage.removeItem("kwelakids_otp");
      sessionStorage.removeItem("kwelakids_otp_expiry");
      sessionStorage.removeItem("kwelakids_remember_me");

      setIsVerified(true);

      // Proceed to Sign In
      navigate("/signin", {
        replace: true,
        state: {
          registered: true,
          email: pendingAccount.email,
        },
      });
    } catch (verificationError) {
      console.error("OTP verification error:", verificationError);
      setError("Something went wrong. Please try again.");
    }
  };

  // Resend OTP
  const handleResend = () => {
    if (secondsLeft > 0) return;
    createOTP();
  };

  return (
    <main className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#F7FAFE]">

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
<div className="w-full min-h-[460px] rounded-[18px] border border-[#A5A5A5] bg-white px-10 py-10 shadow-[0_3px_12px_rgba(0,0,0,0.08)] flex flex-col justify-center">

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-[28px] font-extrabold text-black">
              Verify your Account
            </h1>
<p className="mt-2 text-[15px] text-black">
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
                autoComplete={index === 0 ? "one-time-code" : "off"}
                maxLength={1}
                value={digit}
                disabled={isVerified}
                onChange={(event) =>
                  handleOTPChange(event.target.value, index)
                }
                onKeyDown={(event) =>
                  handleKeyDown(event, index)
                }
                onPaste={handlePaste}
                aria-label={`OTP digit ${index + 1}`}
                className="h-12 w-12 rounded-full border border-[#A5A5A5] bg-white text-center text-base font-semibold text-black shadow-[0_2px_3px_rgba(0,0,0,0.18)] outline-none transition focus:border-[#6254F5] focus:ring-2 focus:ring-[#6254F5]/20"
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

          {/* Expiration */}
          <div className="mt-8 text-center text-[13px] text-[#666666]">
            Code expires in{" "}
            <span
              className={`font-medium ${
                secondsLeft === 0
                  ? "text-red-500"
                  : "text-[#6254F5]"
              }`}
            >
              {formatTime(secondsLeft)}
            </span>
          </div>

          {/* Resend */}
          <p className="mt-2 text-center text-[13px] text-black">
            If you didn't receive a code.{" "}
            <button
              type="button"
              onClick={handleResend}
              disabled={secondsLeft > 0}
              className={`underline underline-offset-4 ${
                secondsLeft > 0
                  ? "cursor-not-allowed text-gray-400"
                  : "text-[#6254F5] hover:text-[#4938D8]"
              }`}
            >
              Resend
            </button>
          </p>

          {/* Verify Button */}
          <button
            type="button"
            onClick={handleVerify}
            disabled={isVerified}
            className="mt-6 h-10 w-full rounded-full bg-[#6254F5] text-[13px] font-bold text-white shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2 disabled:opacity-60"
          >
            Verify
          </button>
        </div>
      </section>
    </main>
  );
}
