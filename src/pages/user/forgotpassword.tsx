
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import background from "../../assets/bgforotp.svg";
import person from "../../assets/forgotpasswordgurl.svg";

type Account = {
  id: string;
  email: string;
  password: string;
};

const RESET_DURATION = 10 * 60 * 1000;

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError("Please enter your email address.");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/.test(normalizedEmail)) {
      setError("Please enter a valid Gmail address.");
      return;
    }

    try {
      const storedAccounts = localStorage.getItem("kwelakids_accounts");

      const accounts: Account[] = storedAccounts
        ? JSON.parse(storedAccounts)
        : [];

      const accountExists = accounts.some(
        (account) =>
          account.email.toLowerCase() === normalizedEmail
      );

      if (!accountExists) {
        setError("No account found with this email address.");
        return;
      }

      // Generate reset token
      const resetToken = crypto.randomUUID();
      const expiry = Date.now() + RESET_DURATION;

      // Store temporary reset information in localStorage
      localStorage.setItem("kwelakids_reset_token", resetToken);
      localStorage.setItem("kwelakids_reset_email", normalizedEmail);
      localStorage.setItem("kwelakids_reset_expiry", expiry.toString());

      // Generate reset link
      const resetLink = `${window.location.origin}/resetpassword?token=${resetToken}`;

      // Display reset link in browser Console
      console.log("-----------------------------------");
      console.log("KWELAKIDS PASSWORD RESET");
      console.log("Registered email:", normalizedEmail);
      console.log("Reset link:", resetLink);
      console.log("Link expires in 10 minutes.");
      console.log("-----------------------------------");

      setSuccess(
        "Reset link generated! Check your browser Console (F12) to access it."
      );
    } catch (submitError) {
      console.error("Forgot password error:", submitError);
      setError("Something went wrong. Please try again.");
    }
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
        alt="KwelaKids character"
        className="absolute bottom-0 z-0 h-[115%] w-[500%] translate-x-[-100px] translate-y-[20px] object-fill object-bottom"
      />

      {/* Forgot Password Card */}
      <section className="relative z-10 ml-auto mr-[9%] left-[-30px] flex min-h-screen w-full max-w-[480px] items-center justify-center px-4 sm:px-0">
        <div className="flex min-h-[255px] w-full flex-col justify-center rounded-[18px] border border-[#A5A5A5] bg-white px-8 py-8 shadow-[0_3px_12px_rgba(0,0,0,0.08)] sm:px-10">

          {/* Heading */}
          <div className="text-center">
            <h1 className="text-[28px] font-extrabold text-black">
              Set New Password
            </h1>

            <p className="mt-1 text-[13px] leading-[18px] text-black">
              No worries! Enter your email and we will send you
              <br className="hidden sm:block" />
              a link to reset your password.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="mt-6">

            {/* Email */}
            <div>
              <input
                type="email"
                name="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                  setSuccess("");
                }}
                placeholder="Email:"
                autoComplete="email"
                aria-label="Email address"
                aria-invalid={Boolean(error)}
                className={`h-[42px] w-full rounded-full border bg-white px-3 text-[13px] text-black shadow-[0_2px_4px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-black focus:border-[#6254F5] focus:ring-2 focus:ring-[#6254F5]/20 ${
                  error ? "border-red-500" : "border-[#A5A5A5]"
                }`}
              />

              {error && (
                <p
                  role="alert"
                  className="mt-2 text-center text-xs text-red-600"
                >
                  {error}
                </p>
              )}

              {success && (
                <p
                  role="status"
                  className="mt-2 text-center text-xs text-green-700"
                >
                  {success}
                </p>
              )}
            </div>

            {/* Send Reset Link */}
            <button
              type="submit"
              className="mt-5 h-[40px] w-full rounded-full bg-[#6254F5] text-[13px] font-bold text-white shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2"
            >
              Send Reset Link
            </button>
          </form>

          {/* Back to Sign In */}
          <button
            type="button"
            onClick={() => navigate("/signin")}
            className="mt-4 text-center text-[12px] text-[#6254F5] underline underline-offset-2 hover:text-[#4938D8]"
          >
            Back to Sign In
          </button>
        </div>
      </section>
    </main>
  );
}
