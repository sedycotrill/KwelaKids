import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import girlImage from "../../assets/signingurl.png";
import girlBackground from "../../assets/roughedit.png";
import logo from "../../assets/multipurposever.png";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");

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
    }

    if (!password.trim()) {
      setPasswordError("Password is required.");
      hasError = true;
    } else if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      hasError = true;
    }

    if (hasError) return;

    // Connect authentication logic here.
  };

  return (
    <main className="min-h-screen w-full bg-[#F7FAFE] lg:h-screen lg:overflow-hidden">
      <section className="grid min-h-screen w-full grid-cols-1 lg:h-full lg:grid-cols-2">
        {/* Left illustration panel */}
        <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden bg-[#B9DDFB] sm:min-h-[430px] lg:h-full lg:min-h-0">
          <img
            src={girlBackground}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover"
          />

          <img
            src={girlImage}
            alt="Kwelakids girl character showing Filipino Sign Language"
            className="absolute inset-0 h-full w-full object-contain object-center"
          />
        </div>

        {/* Right sign-in panel */}
        <div className="flex min-h-[540px] items-center justify-center bg-[#F7FAFE] px-6 py-8 sm:px-12 lg:h-full lg:min-h-0 lg:px-10 xl:px-16">
          <div className="w-full max-w-[390px]">
            {/* Logo and tagline */}
            <div className="mb-7 flex flex-col items-center text-center">
              <img
                src={logo}
                alt="Kwelakids logo"
                className="mb-2 h-20 w-auto max-w-full object-contain"
              />

              <h1 className="text-2xl font-extrabold text-[#164B9B]">
                Sign In
              </h1>

              <p className="mt-1 text-sm text-[#183D69]">
                One knowledge at a time.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Email */}
              <div>
                <label htmlFor="email" className="sr-only">
                  Email
                </label>

                <div
                  className={`flex h-12 items-center rounded-full border bg-[#F7FAFE] px-4 shadow-sm focus-within:border-[#6254F5] ${
                    emailError ? "border-red-500" : "border-[#B8B8B8]"
                  }`}
                >
                  <span className="mr-2 shrink-0 text-sm font-semibold text-gray-800">
                    Email:
                  </span>

                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your Email"
                    autoComplete="email"
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={emailError ? "email-error" : undefined}
                    onChange={() => setEmailError("")}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
                  />
                </div>

                {emailError && (
                  <p
                    id="email-error"
                    role="alert"
                    className="ml-4 mt-1 text-xs text-red-600"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="sr-only">
                  Password
                </label>

                <div
                  className={`flex h-12 items-center rounded-full border bg-[#F7FAFE] px-4 shadow-sm focus-within:border-[#6254F5] ${
                    passwordError ? "border-red-500" : "border-[#B8B8B8]"
                  }`}
                >
                  <span className="mr-2 shrink-0 text-sm font-semibold text-gray-800">
                    Password:
                  </span>

                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    autoComplete="current-password"
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={
                      passwordError ? "password-error" : undefined
                    }
                    onChange={() => setPasswordError("")}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    className="ml-2 shrink-0 text-gray-700 transition hover:text-[#6254F5]"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {passwordError && (
                  <p
                    id="password-error"
                    role="alert"
                    className="ml-4 mt-1 text-xs text-red-600"
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              {/* Remember me and Forgot Password */}
              <div className="flex items-center justify-between gap-3 text-xs">
                <label className="flex cursor-pointer items-center gap-2 text-gray-700">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(event) => setRememberMe(event.target.checked)}
                    className="h-3.5 w-3.5 accent-[#6254F5]"
                  />
                  Remember me
                </label>

                <Link
                  to="/forgot-password"
                  className="text-[#6254F5] underline underline-offset-2 hover:text-[#4938D8]"
                >
                  Forgot Password
                </Link>
              </div>

              {/* Sign In */}
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-[#6254F5] text-sm font-bold text-white shadow-sm transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2"
              >
                Sign In
              </button>
            </form>

            {/* Divider */}
            <div className="my-5 flex items-center gap-3">
              <div className="h-px flex-1 bg-gray-300" />
              <span className="text-xs font-medium text-gray-500">OR</span>
              <div className="h-px flex-1 bg-gray-300" />
            </div>

            {/* Google Sign In */}
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border border-[#B8B8B8] bg-[#F7FAFE] text-sm font-medium text-gray-800 transition hover:bg-white"
            >
              <span className="text-lg font-bold">G</span>
              Sign In with Google
            </button>

            {/* Sign Up */}
            <p className="mt-6 text-center text-sm text-gray-700">
              Don&apos;t have an account?{" "}
              <Link
                to="/signup"
                className="text-[#6254F5] underline underline-offset-2 hover:text-[#4938D8]"
              >
                Sign Up
              </Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
