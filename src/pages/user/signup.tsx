
import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import boyImage from "../../assets/signupboi.png";
import girlBackground from "../../assets/roughedit.png";
import logo from "../../assets/multipurposever.png";
import { AudioWidget } from "../../context/AudioWidget"; // Import ang widget

import girlImage from "../../assets/signupboi.svg";
import girlBackground from "../../assets/roughedit.svg";
import logo from "../../assets/multipurposever.svg";

export default function SignUp() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setTermsError("");

    const formData = new FormData(event.currentTarget);
    const email = String(formData.get("email") ?? "").trim();
    const password = String(formData.get("password") ?? "");

    let hasError = false;

    if (!email) {
      setEmailError("Email is required.");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email address.");
      hasError = true;
    } else if (!/^[^\s@]+@gmail\.com$/i.test(email)) {
      setEmailError("Please use a Gmail address.");
      hasError = true;
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    } else if (
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password) ||
      !/[^A-Za-z0-9]/.test(password)
    ) {
      setPasswordError(
        "Use uppercase, lowercase, a number, and a special character.",
      );
      hasError = true;
    }

    if (!acceptedTerms) {
      setTermsError("Please accept the Terms and Conditions.");
      hasError = true;
    }

    if (hasError) return;

    // Registration logic will be connected later.
    // rememberMe is available for the future account flow.
  };

  return (
    <main className="min-h-screen w-full bg-[#F7FAFE] lg:h-screen lg:overflow-hidden">
      <section className="grid min-h-screen w-full grid-cols-1 lg:h-full lg:grid-cols-2">
        {/* Left illustration panel */}
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-[#B9DDFB] sm:min-h-[430px] lg:h-full lg:min-h-0">
        <img
  src={girlBackground}
  alt=""
  aria-hidden="true"className="absolute inset-0 h-full w-full object-cover object-[10%_center]"
/>

<img
  src={boyImage}
  alt="Kwelakids boy character"
  className="absolute inset-0 h-full w-full object-contain object-center"
/>
        </div>

        {/* Right sign-up panel */}
        <div className="flex min-h-[540px] items-center justify-center bg-[#F7FAFE] px-6 py-8 sm:px-12 lg:h-full lg:min-h-0 lg:px-10 lg:py-6 xl:px-16">
          <div className="w-full max-w-[500px]">
            {/* Logo and tagline */}
    // validation logic...
  };

  return (
    <main className="min-h-screen w-full bg-[#F7FAFE] lg:h-screen lg:overflow-hidden relative">
      {/* Global Audio Control Component */}
      <AudioWidget />

      <section className="grid min-h-screen w-full grid-cols-1 lg:h-full lg:grid-cols-2">
        {/* Left illustration panel */}
        <div className="relative flex min-h-85 items-center justify-center overflow-hidden bg-[#B9DDFB] sm:min-h-107.5 lg:h-full lg:min-h-0">
          <img
            src={girlBackground}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <img
            src={girlImage}
            alt="Kwelakids character showing Filipino Sign Language"
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        </div>

        {/* Right sign-up panel */}
        <div className="flex min-h-135 items-center justify-center bg-[#F7FAFE] px-6 py-8 sm:px-12 lg:h-full lg:min-h-0 lg:px-10 xl:px-16">
          <div className="w-full max-w-97.5">
            <div className="mb-7 flex flex-col items-center text-center">
              <img
                src={logo}
                alt="Kwelakids logo"
                className="mb-1 h-28 w-auto max-w-full object-contain"
              />

              <p className="mt-1 text-xs text-[#183D69]">
                className="mb-2 h-20 w-auto max-w-full object-contain"
              />

              <h1 className="text-2xl font-extrabold text-[#164B9B]">
                Sign Up
              </h1>

              <p className="mt-1 text-sm text-[#183D69]">
                One knowledge at a time.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-5">
              {/* Email */}
            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="signup-email" className="sr-only">
                  Email
                </label>

                <div
                  className={`flex h-12 items-center rounded-full border bg-[#F7FAFE] px-5 shadow-sm focus-within:border-[#6254F5] ${
  emailError ? "border-red-500" : "border-[#B8B8B8]"
                  }`}
                >
                  <span className="mr-1.5 shrink-0 text-xs font-semibold text-gray-800">
                  className={`flex h-12 items-center rounded-full border bg-[#F7FAFE] px-4 shadow-sm focus-within:border-[#6254F5] ${
                    emailError ? "border-red-500" : "border-[#B8B8B8]"
                  }`}
                >
                  <span className="mr-2 shrink-0 text-sm font-semibold text-gray-800">
                    Email:
                  </span>

                  <input
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your Email"
                    autoComplete="email"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={
                      emailError ? "signup-email-error" : undefined
                    }
                    onChange={() => setEmailError("")}
                    className="min-w-0 flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-500"
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
                  />
                </div>

                {emailError && (
                  <p
                    id="signup-email-error"
                    role="alert"
                    className="ml-3 mt-1 text-xs text-red-600"
                    className="ml-4 mt-1 text-xs text-red-600"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="signup-password" className="sr-only">
                  Password
                </label>

                <div
                  className={`flex h-10 items-center rounded-full border bg-[#F7FAFE] px-3 shadow-sm focus-within:border-[#6254F5] ${
                    passwordError ? "border-red-500" : "border-[#B8B8B8]"
                  }`}
                >
                  <span className="mr-1.5 shrink-0 text-xs font-semibold text-gray-800">
                  className={`flex h-12 items-center rounded-full border bg-[#F7FAFE] px-4 shadow-sm focus-within:border-[#6254F5] ${
                    passwordError ? "border-red-500" : "border-[#B8B8B8]"
                  }`}
                >
                  <span className="mr-2 shrink-0 text-sm font-semibold text-gray-800">
                    Password:
                  </span>

                  <input
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    autoComplete="new-password"
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={
                      passwordError ? "signup-password-error" : undefined
                    }
                    onChange={() => setPasswordError("")}
                    className="min-w-0 flex-1 bg-transparent text-xs text-gray-800 outline-none placeholder:text-gray-500"
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      setShowPassword((previous) => !previous)
                    }
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                    className="ml-1 shrink-0 text-gray-700 transition hover:text-[#6254F5]"
                  >
                    {showPassword ? (
                      <EyeOff size={13} />
                    ) : (
                      <Eye size={13} />
                    className="ml-2 shrink-0 text-gray-700 transition hover:text-[#6254F5]"
                  >
                    {showPassword ? (
                      <EyeOff size={16} />
                    ) : (
                      <Eye size={16} />
                    )}
                  </button>
                </div>

                {passwordError && (
                  <p
                    id="signup-password-error"
                    role="alert"
                    className="ml-3 mt-1 text-xs text-red-600"
                    className="ml-4 mt-1 text-xs text-red-600"
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember me */}
              <label className="flex cursor-pointer items-center gap-2 text-[10px] text-gray-700">
              <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-3 w-3 accent-[#6254F5]"
                  className="h-3.5 w-3.5 accent-[#6254F5]"
                />
                Remember me
              </label>

              {/* Sign Up button */}
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-[#6254F5] text-sm font-bold text-white shadow-sm transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2">
                Sign Up
              </button>

              {/* Terms and Conditions */}
              <div>
                <label className="flex cursor-pointer items-start gap-2 text-[10px] text-gray-700">
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-[#6254F5] text-sm font-bold text-white shadow-sm transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2"
              >
                Sign Up
              </button>

              <div>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => {
                      setAcceptedTerms(event.target.checked);
                      setTermsError("");
                    }}
                    className="mt-0.5 h-3 w-3 accent-[#6254F5]"
                    className="mt-0.5 h-3.5 w-3.5 accent-[#6254F5]"
                  />

                  <span>
                    I accept the{" "}
                    <Link
                      to="/terms"
                      className="text-[#6254F5] underline underline-offset-2 hover:text-[#4938D8]"
                    >
                      Terms and Condition
                    </Link>
                  </span>
                </label>

                {termsError && (
                  <p
                    role="alert"
                    className="ml-5 mt-1 text-xs text-red-600"
                  >
                    {termsError}
                  </p>
                )}
              </div>
            </form>

            {/* Sign In link */}
            <p className="mt-6 text-center text-[10px] text-gray-700">
            <p className="mt-6 text-center text-sm text-gray-700">
              Already have an Account?{" "}
              <Link
                to="/signin"
                className="text-[#6254F5] underline underline-offset-2 hover:text-[#4938D8]"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
}
