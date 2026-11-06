
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import { AudioWidget } from "../../context/AudioWidget";
import { supabase } from "../../lib/supabase";

import girlImage from "../../assets/signupboi.svg";
import girlBackground from "../../assets/roughedit.svg";
import logo from "../../assets/multipurposever.svg";

type SignupDraft = {
    email: string;
    rememberMe: boolean;
    acceptedTerms: boolean;
};

const DRAFT_KEY = "kwelakids_signup_draft";

function getSavedDraft(): SignupDraft {
    const emptyDraft: SignupDraft = {
        email: "",
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

    // Restore saved form details
    const [initialDraft] = useState<SignupDraft>(getSavedDraft);

    const [showPassword, setShowPassword] = useState(false);

    const [rememberMe, setRememberMe] = useState(
        initialDraft.rememberMe
    );

    const [acceptedTerms, setAcceptedTerms] = useState(
        initialDraft.acceptedTerms
    );

    const [email, setEmail] = useState(initialDraft.email);
    const [password, setPassword] = useState("");

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [termsError, setTermsError] = useState("");

    const [isSubmitting, setIsSubmitting] = useState(false);

    // Save non-sensitive form details only
    useEffect(() => {
        const draft: SignupDraft = {
            email,
            rememberMe,
            acceptedTerms,
        };

        sessionStorage.setItem(
            DRAFT_KEY,
            JSON.stringify(draft)
        );
    }, [email, rememberMe, acceptedTerms]);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        if (isSubmitting) return;

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
            setPasswordError(
                "Password must contain at least one uppercase letter."
            );
            return;
        }

        if (!/[a-z]/.test(password)) {
            setPasswordError(
                "Password must contain at least one lowercase letter."
            );
            return;
        }

        if (!/[0-9]/.test(password)) {
            setPasswordError(
                "Password must contain at least one number."
            );
            return;
        }

        if (!/[^A-Za-z0-9]/.test(password)) {
            setPasswordError(
                "Password must contain at least one special character."
            );
            return;
        }

        // TERMS VALIDATION
        if (!acceptedTerms) {
            setTermsError(
                "You must accept the Terms and Conditions."
            );
            return;
        }

        setIsSubmitting(true);

        try {
            // REGISTER USER THROUGH SUPABASE AUTH
            const { data, error } = await supabase.auth.signUp({
                email: normalizedEmail,
                password,
            });

            if (error) {
                console.error("Supabase signup error:", error);

                setEmailError(
                    "Unable to register with this email. " +
                    "Please check your details or try again."
                );
                return;
            }

            if (!data.user) {
                setEmailError(
                    "Unable to create your account. Please try again."
                );
                return;
            }

            // Store only the email while waiting for OTP
            sessionStorage.setItem(
                "kwelakids_pending_email",
                normalizedEmail
            );

            // Preserve the user's Remember Me preference
            sessionStorage.setItem(
                "kwelakids_remember_me",
                JSON.stringify(rememberMe)
            );

            // Remove old local authentication data
            sessionStorage.removeItem(
                "kwelakids_pending_account"
            );

            sessionStorage.removeItem("kwelakids_otp");
            sessionStorage.removeItem("kwelakids_otp_expiry");

            localStorage.removeItem("kwelakids_accounts");
            localStorage.removeItem("kwelakids_current_user");
            sessionStorage.removeItem("kwelakids_current_user");

            // Clear the saved registration draft
            sessionStorage.removeItem(DRAFT_KEY);

            if (data.session) {
                // Email confirmation is disabled
                navigate("/categories", { replace: true });
            } else {
                // Supabase has sent the confirmation OTP
                navigate("/otp", { replace: true });
            }

        } catch (error) {
            console.error("Registration error:", error);

            setEmailError(
                "Something went wrong. Please try again."
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="relative min-h-screen w-full bg-slate-50 lg:h-screen lg:overflow-hidden">
            <AudioWidget />

            <section className="grid min-h-screen w-full grid-cols-1 lg:h-full lg:grid-cols-2">

                {/* Left illustration panel */}
                <div className="relative flex min-h-85 items-center justify-center overflow-hidden bg-sky-200 sm:min-h-107.5 lg:h-full lg:min-h-0">

                    <img
                        src={girlBackground}
                        alt=""
                        aria-hidden="true"
                        className="absolute inset-0 h-full w-full object-cover"
                    />

                    <img
                        src={girlImage}
                        alt="KwelaKids character showing Filipino Sign Language"
                        className="absolute inset-0 h-full w-full object-contain object-center"
                    />
                </div>

                {/* Right sign-up panel */}
                <div className="flex min-h-135 items-center justify-center bg-slate-50 px-6 py-8 sm:px-12 lg:h-full lg:min-h-0 lg:px-10 xl:px-16">

                    <div className="w-full max-w-97.5">

                        {/* Heading */}
                        <div className="mb-7 flex flex-col items-center text-center">

                            <img
                                src={logo}
                                alt="KwelaKids logo"
                                className="mb-2 h-20 w-auto max-w-full object-contain"
                            />

                            <h1 className="text-2xl font-extrabold text-sky-700">
                                Sign Up
                            </h1>

                            <p className="mt-1 text-sm text-slate-700">
                                One knowledge at a time.
                            </p>
                        </div>

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4"
                        >

                            {/* EMAIL */}
                            <div>
                                <label
                                    htmlFor="signup-email"
                                    className="sr-only"
                                >
                                    Email
                                </label>

                                <div
                                    className={`flex h-12 items-center rounded-full border bg-white px-4 shadow-sm focus-within:border-sky-500 ${
                                        emailError
                                            ? "border-red-500"
                                            : "border-slate-300"
                                    }`}
                                >
                                    <span className="mr-2 shrink-0 text-sm font-semibold text-slate-800">
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
                                            emailError
                                                ? "signup-email-error"
                                                : undefined
                                        }
                                        onChange={(event) => {
                                            setEmail(event.target.value);
                                            setEmailError("");
                                        }}
                                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
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
                                <label
                                    htmlFor="signup-password"
                                    className="sr-only"
                                >
                                    Password
                                </label>

                                <div
                                    className={`flex h-12 items-center rounded-full border bg-white px-4 shadow-sm focus-within:border-sky-500 ${
                                        passwordError
                                            ? "border-red-500"
                                            : "border-slate-300"
                                    }`}
                                >
                                    <span className="mr-2 shrink-0 text-sm font-semibold text-slate-800">
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
                                            passwordError
                                                ? "signup-password-error"
                                                : undefined
                                        }
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setPasswordError("");
                                        }}
                                        className="min-w-0 flex-1 bg-transparent text-sm text-slate-800 outline-none placeholder:text-slate-400"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword((previous) => !previous)
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
                                        }
                                        className="ml-2 shrink-0 text-slate-700 transition hover:text-sky-600"
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
                            <label className="flex cursor-pointer items-center gap-2 text-xs text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(event) =>
                                        setRememberMe(event.target.checked)
                                    }
                                    className="h-3.5 w-3.5 accent-sky-500"
                                />

                                Remember me
                            </label>

                            {/* SIGN UP */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="h-12 w-full rounded-full bg-sky-500 text-sm font-bold text-white shadow-sm transition hover:bg-sky-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isSubmitting
                                    ? "Creating Account..."
                                    : "Sign Up"}
                            </button>

                            {/* TERMS AND CONDITIONS */}
                            <div>
                                <label className="flex cursor-pointer items-start gap-2 text-xs text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={acceptedTerms}
                                        onChange={(event) => {
                                            setAcceptedTerms(event.target.checked);
                                            setTermsError("");
                                        }}
                                        className="mt-0.5 h-3.5 w-3.5 accent-sky-500"
                                    />

                                    <span>
                                        I accept the{" "}
                                        <Link
                                            to="/termsandcondition"
                                            className="text-sky-600 underline underline-offset-2 hover:text-sky-700"
                                        >
                                            Terms and Conditions
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

                        {/* SIGN IN LINK */}
                        <p className="mt-6 text-center text-sm text-slate-700">
                            Already have an Account?{" "}
                            <Link
                                to="/signin"
                                className="text-sky-600 underline underline-offset-2 hover:text-sky-700"
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
