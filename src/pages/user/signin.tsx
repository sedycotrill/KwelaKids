
import { useEffect, useState } from "react";
import type { FormEvent } from "react";

import { Link, useNavigate } from "react-router-dom";

import { Eye, EyeOff } from "lucide-react";

import { AudioWidget } from "../../context/AudioWidget";

import girlImage from "../../assets/signingurl.svg";
import girlBackground from "../../assets/roughedit.svg";
import logo from "../../assets/multipurposever.svg";

import { supabase } from "../../lib/supabase";


// =========================================================
// TYPES
// =========================================================

type LoginResponse = {
    success?: boolean;
    code?: string;
    message?: string;
    lockedUntil?: string;
    failedAttempts?: number;

    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    expires_at?: number;
    token_type?: string;

    user?: {
        id: string;
        email?: string;
    };
};


// =========================================================
// COMPONENT
// =========================================================

export default function SignIn() {

    const navigate = useNavigate();


    // -----------------------------------------------------
    // FORM STATE
    // -----------------------------------------------------

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);


    // -----------------------------------------------------
    // ERROR STATE
    // -----------------------------------------------------

    const [emailError, setEmailError] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [googleError, setGoogleError] = useState("");

    const [lockMessage, setLockMessage] = useState("");

    const [lockUntil, setLockUntil] = useState<string | null>(
        null
    );


    // -----------------------------------------------------
    // LOADING STATE
    // -----------------------------------------------------

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);


    // -----------------------------------------------------
    // COUNTDOWN STATE
    // -----------------------------------------------------

    const [currentTime, setCurrentTime] = useState(Date.now());


    useEffect(() => {

        if (!lockUntil) {
            return;
        }

        const updateCountdown = () => {

            const now = Date.now();

            setCurrentTime(now);

            if (Date.parse(lockUntil) <= now) {
                setLockUntil(null);
                setLockMessage("");
            }

        };

        updateCountdown();

        const interval = window.setInterval(
            updateCountdown,
            1000
        );

        return () => {
            window.clearInterval(interval);
        };

    }, [lockUntil]);


    const remainingSeconds = lockUntil
        ? Math.max(
            0,
            Math.ceil(
                (Date.parse(lockUntil) - currentTime) / 1000
            )
        )
        : 0;


    const isLocked = remainingSeconds > 0;


    // -----------------------------------------------------
    // HANDLE LOGIN RESPONSES
    // -----------------------------------------------------

    const handleLoginFailure = (
        response: LoginResponse
    ): boolean => {

        if (response.code === "ACCOUNT_LOCKED") {

            setEmailError("");
            setPasswordError("");

            setLockUntil(
                response.lockedUntil || null
            );

            setLockMessage(
                "Too many failed password attempts. Please wait before trying again."
            );

            return true;
        }


        if (response.code === "IP_RATE_LIMITED") {

            setEmailError("");
            setPasswordError("");

            setLockUntil(
                response.lockedUntil || null
            );

            setLockMessage(
                "Too many sign-in attempts from this network. Please wait before trying again."
            );

            return true;
        }


        if (response.code === "INVALID_CREDENTIALS") {

            setEmailError("Invalid email or password.");
            setPasswordError("Invalid email or password.");

            setLockMessage("");

            return true;
        }


        return false;
    };


    // -----------------------------------------------------
    // EMAIL AND PASSWORD SIGN-IN
    // -----------------------------------------------------

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {

        event.preventDefault();

        setEmailError("");
        setPasswordError("");
        setGoogleError("");


        // Prevent another submission during an active lock.

        if (isLocked) {
            return;
        }


        // Basic form validation.

        if (!email.trim()) {
            setEmailError("Please enter your email.");
            return;
        }

        if (!password) {
            setPasswordError("Please enter your password.");
            return;
        }


        setIsSubmitting(true);


        try {

            // -------------------------------------------------
            // CALL SERVER-SIDE LOGIN FUNCTION
            // -------------------------------------------------

            const { data, error } = await supabase.functions.invoke(
                "login",
                {
                    body: {
                        email: email.trim().toLowerCase(),
                        password,
                    },
                }
            );


            let responseData = data as LoginResponse | null;


            // -------------------------------------------------
            // READ ERROR RESPONSE
            // -------------------------------------------------
            // FunctionsHttpError stores the HTTP response
            // in its context property.
            // -------------------------------------------------

            if (error) {

                const errorContext = (
                    error as {
                        context?: unknown;
                    }
                ).context;

                if (errorContext instanceof Response) {

                    try {

                        responseData = await errorContext
                            .clone()
                            .json();

                    } catch {
                        responseData = null;
                    }

                }

            }


            // -------------------------------------------------
            // HANDLE LOGIN FAILURE
            // -------------------------------------------------

            if (
                responseData &&
                responseData.success !== true
            ) {

                if (handleLoginFailure(responseData)) {
                    return;
                }


                if (
                    responseData.code ===
                    "AUTH_TEMPORARILY_UNAVAILABLE"
                ) {

                    setEmailError(
                        "Sign-in is temporarily unavailable. Please try again."
                    );

                    return;
                }


                if (
                    responseData.code ===
                    "LOGIN_SERVICE_ERROR" ||
                    responseData.code ===
                    "SERVER_CONFIGURATION_ERROR"
                ) {

                    setEmailError(
                        "The login service is currently unavailable. Please try again later."
                    );

                    return;
                }


                if (error) {
                    throw error;
                }


                setEmailError(
                    responseData.message ||
                    "Unable to sign in. Please try again."
                );

                return;
            }


            if (error) {
                throw error;
            }


            // -------------------------------------------------
            // VALIDATE SESSION TOKENS
            // -------------------------------------------------

            if (
                !responseData?.access_token ||
                !responseData?.refresh_token
            ) {

                setEmailError(
                    "Unable to establish your session. Please try again."
                );

                return;
            }


            // -------------------------------------------------
            // ESTABLISH SUPABASE SESSION
            // -------------------------------------------------
            // This allows the existing AuthContext to detect
            // the authenticated user through onAuthStateChange.
            // -------------------------------------------------

            const { data: sessionData, error: sessionError } =
                await supabase.auth.setSession({

                    access_token: responseData.access_token,

                    refresh_token: responseData.refresh_token,

                });


            if (sessionError) {
                throw sessionError;
            }


            if (!sessionData.user) {

                setEmailError(
                    "Unable to retrieve your account."
                );

                return;
            }


            // Remember Me remains a UI preference, as in
            // the existing implementation.
            //
            // Supabase's configured session persistence
            // remains unchanged.


            setPassword("");
            setLockUntil(null);
            setLockMessage("");


            // Navigate after Supabase has established the session.

            navigate("/categories", {
                replace: true,
            });


        } catch (error) {

            console.error("Sign in error:", error);

            setEmailError(
                "Something went wrong. Please try again."
            );

        } finally {

            setIsSubmitting(false);

        }

    };


    // -----------------------------------------------------
    // GOOGLE OAUTH SIGN-IN
    // -----------------------------------------------------

    const handleGoogleSignIn = async () => {

        setGoogleError("");
        setEmailError("");
        setPasswordError("");

        setIsGoogleLoading(true);


        try {

            const { error } = await supabase.auth.signInWithOAuth({

                provider: "google",

                options: {

                    redirectTo:
                        `${window.location.origin}/categories`,

                    queryParams: {
                        prompt: "select_account",
                    },

                },

            });


            if (error) {
                throw error;
            }


            // Supabase redirects the browser to Google.
            // Google then redirects back through Supabase.


        } catch (error) {

            console.error("Google sign-in error:", error);


            setGoogleError(
                error instanceof Error
                    ? error.message
                    : "Unable to sign in with Google. Please try again."
            );


            setIsGoogleLoading(false);

        }

    };


    // -----------------------------------------------------
    // RENDER
    // -----------------------------------------------------

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
                        alt="Kwelakids girl character showing Filipino Sign Language"
                        className="absolute inset-0 h-full w-full object-contain object-center"
                    />

                </div>


                {/* Right sign-in panel */}

                <div className="flex min-h-135 items-center justify-center bg-[#F7FAFE] px-6 py-8 sm:px-12 lg:h-full lg:min-h-0 lg:px-10 xl:px-16">

                    <div className="w-full max-w-97.5">


                        {/* Logo and Heading */}

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


                        {/* Email and Password Form */}

                        <form
                            onSubmit={handleSubmit}
                            noValidate
                            className="space-y-4"
                        >


                            {/* Email */}

                            <div>

                                <label
                                    htmlFor="email"
                                    className="sr-only"
                                >
                                    Email
                                </label>


                                <div
                                    className={`flex h-12 items-center rounded-full border bg-[#F7FAFE] px-4 shadow-sm focus-within:border-[#6254F5] ${
                                        emailError
                                            ? "border-red-500"
                                            : "border-[#B8B8B8]"
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
                                        value={email}
                                        disabled={
                                            isSubmitting ||
                                            isGoogleLoading ||
                                            isLocked
                                        }
                                        aria-invalid={Boolean(emailError)}
                                        aria-describedby={
                                            emailError
                                                ? "email-error"
                                                : undefined
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

                                <label
                                    htmlFor="password"
                                    className="sr-only"
                                >
                                    Password
                                </label>


                                <div
                                    className={`flex h-12 items-center rounded-full border bg-[#F7FAFE] px-4 shadow-sm focus-within:border-[#6254F5] ${
                                        passwordError
                                            ? "border-red-500"
                                            : "border-[#B8B8B8]"
                                    }`}
                                >

                                    <span className="mr-2 shrink-0 text-sm font-semibold text-gray-800">
                                        Password:
                                    </span>


                                    <input
                                        id="password"
                                        name="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter your Password"
                                        autoComplete="current-password"
                                        value={password}
                                        disabled={
                                            isSubmitting ||
                                            isGoogleLoading ||
                                            isLocked
                                        }
                                        aria-invalid={Boolean(passwordError)}
                                        aria-describedby={
                                            passwordError
                                                ? "password-error"
                                                : undefined
                                        }
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setPasswordError("");
                                        }}
                                        className="min-w-0 flex-1 bg-transparent text-sm text-gray-800 outline-none placeholder:text-gray-500"
                                    />


                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowPassword(
                                                (previous) => !previous
                                            )
                                        }
                                        aria-label={
                                            showPassword
                                                ? "Hide password"
                                                : "Show password"
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
                                        id="password-error"
                                        role="alert"
                                        className="ml-4 mt-1 text-xs text-red-600"
                                    >
                                        {passwordError}
                                    </p>

                                )}

                            </div>


                            {/* Remember Me and Forgot Password */}

                            <div className="flex items-center justify-between gap-3 text-xs">

                                <label className="flex cursor-pointer items-center gap-2 text-gray-700">

                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(event) =>
                                            setRememberMe(
                                                event.target.checked
                                            )
                                        }
                                        className="h-3.5 w-3.5 accent-[#6254F5]"
                                    />

                                    Remember me

                                </label>


                                <Link
                                    to="/forgotpassword"
                                    className="text-[#6254F5] underline underline-offset-2 hover:text-[#4938D8]"
                                >
                                    Forgot Password
                                </Link>

                            </div>


                            {/* Sign In Button */}

                            <button
                                type="submit"
                                disabled={
                                    isSubmitting ||
                                    isGoogleLoading ||
                                    isLocked
                                }
                                className="h-12 w-full rounded-full bg-[#6254F5] text-sm font-bold text-white shadow-sm transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                            >

                                {isLocked
                                    ? `Try Again in ${remainingSeconds}s`
                                    : isSubmitting
                                        ? "Signing In..."
                                        : "Sign In"}

                            </button>


                            {/* Lockout Message and Countdown */}

                            {isLocked && (

                                <div
                                    role="alert"
                                    aria-live="polite"
                                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-center"
                                >

                                    <p className="text-sm font-semibold text-red-700">
                                        Sign-in temporarily restricted
                                    </p>

                                    <p className="mt-1 text-xs text-red-600">
                                        {lockMessage}
                                    </p>

                                    <p className="mt-2 text-sm font-bold text-red-700">
                                        {remainingSeconds} second
                                        {remainingSeconds === 1 ? "" : "s"} remaining
                                    </p>

                                </div>

                            )}

                            {!isLocked && lockMessage && (

                                <p
                                    role="alert"
                                    className="text-center text-xs text-red-600"
                                >
                                    {lockMessage}
                                </p>

                            )}

                        </form>


                        {/* OR Divider */}

                        <div className="my-5 flex items-center gap-3">

                            <div className="h-px flex-1 bg-gray-300" />

                            <span className="text-xs font-medium text-gray-500">
                                OR
                            </span>

                            <div className="h-px flex-1 bg-gray-300" />

                        </div>


                        {/* Google Sign In */}

                        <button
                            type="button"
                            onClick={handleGoogleSignIn}
                            disabled={
                                isGoogleLoading ||
                                isSubmitting
                            }
                            className="flex h-12 w-full items-center justify-center gap-3 rounded-full border border-[#B8B8B8] bg-[#F7FAFE] text-sm font-medium text-gray-800 transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >

                            {isGoogleLoading ? (

                                <span>
                                    Connecting to Google...
                                </span>

                            ) : (

                                <>

                                    <img
                                        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
                                        alt=""
                                        aria-hidden="true"
                                        className="h-5 w-5"
                                    />

                                    Sign In with Google

                                </>

                            )}

                        </button>


                        {googleError && (

                            <p
                                role="alert"
                                className="mt-2 text-center text-xs text-red-600"
                            >
                                {googleError}
                            </p>

                        )}


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
