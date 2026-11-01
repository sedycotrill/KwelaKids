
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { AudioWidget } from "../../context/AudioWidget";

import girlImage from "../../assets/signupboi.svg";
import girlBackground from "../../assets/roughedit.svg";
import logo from "../../assets/multipurposever.svg";

type Account = {
  id: string;
  email: string;
  password: string;
};

type SignupDraft = {
  email: string;
  password: string;
  rememberMe: boolean;
  acceptedTerms: boolean;
};

const DRAFT_KEY = "kwelakids_signup_draft";

function getSavedDraft(): SignupDraft {
  const emptyDraft: SignupDraft = {
    email: "",
    password: "",
    rememberMe: false,
    acceptedTerms: false,
  };

  try {
    const savedDraft = sessionStorage.getItem(DRAFT_KEY);

    if (!savedDraft) return emptyDraft;

    return {
      ...emptyDraft,
      ...JSON.parse(savedDraft),
    };
  } catch {
    sessionStorage.removeItem(DRAFT_KEY);
    return emptyDraft;
  }
}

export default function SignUp() {
  const navigate = useNavigate();

  // Restore saved values before the first render
  const [initialDraft] = useState<SignupDraft>(getSavedDraft);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(
    initialDraft.rememberMe
  );
  const [acceptedTerms, setAcceptedTerms] = useState(
    initialDraft.acceptedTerms
  );

  const [email, setEmail] = useState(initialDraft.email);
  const [password, setPassword] = useState(initialDraft.password);

  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");

  // Save form changes automatically
  useEffect(() => {
    const draft: SignupDraft = {
      email,
      password,
      rememberMe,
      acceptedTerms,
    };

    sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
  }, [email, password, rememberMe, acceptedTerms]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setEmailError("");
    setPasswordError("");
    setTermsError("");

    const normalizedEmail = email.trim().toLowerCase();

    // EMAIL VALIDATION
    if (!normalizedEmail) {
      setEmailError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      setEmailError("Please enter a valid email address.");
      return;
    }

    if (!/^[^\s@]+@gmail\.com$/.test(normalizedEmail)) {
      setEmailError("Please use a valid Gmail address.");
      return;
    }

    // PASSWORD VALIDATION
    if (!password) {
      setPasswordError("Password is required.");
      return;
    }

    if (password.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }

    if (!/[A-Z]/.test(password)) {
      setPasswordError("Password must contain at least one uppercase letter.");
      return;
    }

    if (!/[a-z]/.test(password)) {
      setPasswordError("Password must contain at least one lowercase letter.");
      return;
    }

    if (!/[0-9]/.test(password)) {
      setPasswordError("Password must contain at least one number.");
      return;
    }

    if (!/[^A-Za-z0-9]/.test(password)) {
      setPasswordError("Password must contain at least one special character.");
      return;
    }

    // TERMS VALIDATION
    if (!acceptedTerms) {
      setTermsError("You must accept the Terms and Conditions.");
      return;
    }

    try {
      // CHECK EXISTING ACCOUNTS
      const storedAccounts = localStorage.getItem("kwelakids_accounts");

      const accounts: Account[] = storedAccounts
        ? JSON.parse(storedAccounts)
        : [];

      const emailExists = accounts.some(
        (account) => account.email.toLowerCase() === normalizedEmail
      );

      if (emailExists) {
        setEmailError("An account with this email already exists.");
        return;
      }

      // CREATE PENDING ACCOUNT
      const pendingAccount: Account = {
        id: crypto.randomUUID(),
        email: normalizedEmail,
        password,
      };

      // TEMPORARILY STORE UNTIL OTP VERIFICATION
      sessionStorage.setItem(
        "kwelakids_pending_account",
        JSON.stringify(pendingAccount)
      );

      // STORE REMEMBER ME PREFERENCE
      sessionStorage.setItem(
        "kwelakids_remember_me",
        JSON.stringify(rememberMe)
      );

      // CLEAR SAVED DRAFT AFTER SUCCESSFUL SUBMISSION
      sessionStorage.removeItem(DRAFT_KEY);

      // PROCEED TO OTP
      navigate("/otp");
    } catch (error) {
      console.error("Registration error:", error);
      setEmailError("Something went wrong. Please try again.");
    }
  };

  return (
    <main className="relative min-h-screen w-full bg-[#F7FAFE] lg:h-screen lg:overflow-hidden">
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
                className="mb-2 h-20 w-auto max-w-full object-contain"
              />

              <h1 className="text-2xl font-extrabold text-[#164B9B]">
                Sign Up
              </h1>

              <p className="mt-1 text-sm text-[#183D69]">
                One knowledge at a time.
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* EMAIL */}
              <div>
                <label htmlFor="signup-email" className="sr-only">
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
                    id="signup-email"
                    name="email"
                    type="email"
                    placeholder="Enter your Email"
                    autoComplete="email"
                    value={email}
                    aria-invalid={Boolean(emailError)}
                    aria-describedby={
                      emailError ? "signup-email-error" : undefined
                    }
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setEmailError("");
                    }}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
                  />
                </div>

                {emailError && (
                  <p
                    id="signup-email-error"
                    role="alert"
                    className="ml-4 mt-1 text-xs text-red-600"
                  >
                    {emailError}
                  </p>
                )}
              </div>

              {/* PASSWORD */}
              <div>
                <label htmlFor="signup-password" className="sr-only">
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
                    id="signup-password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your Password"
                    autoComplete="new-password"
                    value={password}
                    aria-invalid={Boolean(passwordError)}
                    aria-describedby={
                      passwordError ? "signup-password-error" : undefined
                    }
                    onChange={(event) => {
                      setPassword(event.target.value);
                      setPasswordError("");
                    }}
                    className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
                  />

                  <button
                    type="button"
                    onClick={() => setShowPassword((previous) => !previous)}
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
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
                    className="ml-4 mt-1 text-xs text-red-600"
                  >
                    {passwordError}
                  </p>
                )}
              </div>

              {/* REMEMBER ME */}
              <label className="flex cursor-pointer items-center gap-2 text-xs text-gray-700">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-3.5 w-3.5 accent-[#6254F5]"
                />
                Remember me
              </label>

              {/* SIGN UP */}
              <button
                type="submit"
                className="h-12 w-full rounded-full bg-[#6254F5] text-sm font-bold text-white shadow-sm transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2"
              >
                Sign Up
              </button>

              {/* TERMS AND CONDITIONS */}
              <div>
                <label className="flex cursor-pointer items-start gap-2 text-xs text-gray-700">
                  <input
                    type="checkbox"
                    checked={acceptedTerms}
                    onChange={(event) => {
                      setAcceptedTerms(event.target.checked);
                      setTermsError("");
                    }}
                    className="mt-0.5 h-3.5 w-3.5 accent-[#6254F5]"
                  />

                  <span>
                    I accept the{" "}
                    <Link
                      to="/termsandcondition"
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
