
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

import background from "../../assets/bgforotp.svg";
import person from "../../assets/forgotpasswordgurl.svg";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
    const navigate = useNavigate();

    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const [error, setError] = useState("");
    const [isCheckingSession, setIsCheckingSession] = useState(true);
    const [hasRecoverySession, setHasRecoverySession] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Check whether Supabase established a session from the recovery link.
    useEffect(() => {
        let isMounted = true;

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(
            (_event, session) => {
                if (!isMounted) return;

                setHasRecoverySession(Boolean(session));
                setIsCheckingSession(false);
            }
        );

        const checkSession = async () => {
            try {
                const { data, error: sessionError } =
                    await supabase.auth.getSession();

                if (sessionError) throw sessionError;

                if (!isMounted) return;

                setHasRecoverySession(Boolean(data.session));
            } catch (sessionError) {
                console.error(
                    "Recovery session check failed:",
                    sessionError
                );

                if (isMounted) {
                    setHasRecoverySession(false);
                }
            } finally {
                if (isMounted) {
                    setIsCheckingSession(false);
                }
            }
        };

        void checkSession();

        return () => {
            isMounted = false;
            subscription.unsubscribe();
        };
    }, []);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();
        setError("");

        if (!hasRecoverySession) {
            setError(
                "Your reset session is invalid or expired. Please request a new reset link."
            );
            return;
        }

        // Validate minimum password length
        if (password.length < 8) {
            setError("Password must be at least 8 characters long.");
            return;
        }

        // Validate uppercase letter
        if (!/[A-Z]/.test(password)) {
            setError("Password must contain at least one uppercase letter.");
            return;
        }

        // Validate lowercase letter
        if (!/[a-z]/.test(password)) {
            setError("Password must contain at least one lowercase letter.");
            return;
        }

        // Validate number
        if (!/[0-9]/.test(password)) {
            setError("Password must contain at least one number.");
            return;
        }

        // Validate special character
        if (!/[^A-Za-z0-9]/.test(password)) {
            setError("Password must contain at least one special character.");
            return;
        }

        // Validate password confirmation
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        setIsSubmitting(true);

        try {
            // Update the password in Supabase Auth
            const { error: updateError } =
                await supabase.auth.updateUser({
                    password,
                });

            if (updateError) {
                throw updateError;
            }

            // End the recovery session so the learner returns to Sign In.
            const { error: signOutError } =
                await supabase.auth.signOut({
                    scope: "local",
                });

            if (signOutError) {
                console.warn(
                    "Password changed, but local sign-out failed:",
                    signOutError
                );
            }

            navigate("/signin", {
                replace: true,
                state: {
                    passwordReset: true,
                },
            });
        } catch (submitError) {
            console.error("Reset password error:", submitError);

            setError(
                submitError instanceof Error
                    ? submitError.message
                    : "Unable to reset your password. Please try again."
            );
        } finally {
            setIsSubmitting(false);
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

            {/* Reset Password Card */}
            <section className="relative z-10 ml-auto mr-[9%] left-[-30px] flex min-h-screen w-full max-w-[480px] items-center justify-center px-4 sm:px-0">
                <div className="flex min-h-[255px] w-full flex-col justify-center rounded-[18px] border border-[#A5A5A5] bg-white px-8 py-8 shadow-[0_3px_12px_rgba(0,0,0,0.08)] sm:px-10">

                    {isCheckingSession ? (
                        <div className="py-8 text-center">
                            <p className="text-sm text-slate-600">
                                Verifying your reset link...
                            </p>
                        </div>
                    ) : !hasRecoverySession ? (
                        <div className="text-center">
                            <h1 className="text-[28px] font-extrabold text-black">
                                Reset Link Invalid
                            </h1>

                            <p className="mt-2 text-[13px] leading-[18px] text-black">
                                This password reset link is invalid or has expired.
                                Please request a new one.
                            </p>

                            <button
                                type="button"
                                onClick={() => navigate("/forgotpassword")}
                                className="mt-6 h-[40px] w-full rounded-full bg-[#6254F5] text-[13px] font-bold text-white shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#5142E5]"
                            >
                                Request New Reset Link
                            </button>
                        </div>
                    ) : (
                        <>
                            {/* Heading */}
                            <div className="text-center">
                                <h1 className="text-[28px] font-extrabold text-black">
                                    Set New Password
                                </h1>

                                <p className="mt-1 text-[13px] leading-[18px] text-black">
                                    Must be at least 8 characters
                                </p>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="mt-6">

                                {/* New Password */}
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        value={password}
                                        onChange={(event) => {
                                            setPassword(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="New Password:"
                                        autoComplete="new-password"
                                        aria-label="New password"
                                        aria-invalid={Boolean(error)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-[42px] w-full rounded-full border border-[#A5A5A5] bg-white px-3 pr-10 text-[13px] text-black shadow-[0_2px_4px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-black focus:border-[#6254F5] focus:ring-2 focus:ring-[#6254F5]/20"
                                    />

                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        aria-label={showPassword ? "Hide password" : "Show password"}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
                                    >
                                        {showPassword ? (
                                            <EyeOff size={15} />
                                        ) : (
                                            <Eye size={15} />
                                        )}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative mt-5">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        name="confirmPassword"
                                        value={confirmPassword}
                                        onChange={(event) => {
                                            setConfirmPassword(event.target.value);
                                            setError("");
                                        }}
                                        placeholder="Confirm Password:"
                                        autoComplete="new-password"
                                        aria-label="Confirm password"
                                        aria-invalid={Boolean(error)}
                                        required
                                        disabled={isSubmitting}
                                        className="h-[42px] w-full rounded-full border border-[#A5A5A5] bg-white px-3 pr-10 text-[13px] text-black shadow-[0_2px_4px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-black focus:border-[#6254F5] focus:ring-2 focus:ring-[#6254F5]/20"
                                    />

                                    <button
                                        type="button"
                                        onClick={() =>
                                            setShowConfirmPassword(!showConfirmPassword)
                                        }
                                        aria-label={
                                            showConfirmPassword
                                                ? "Hide confirm password"
                                                : "Show confirm password"
                                        }
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-black"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff size={15} />
                                        ) : (
                                            <Eye size={15} />
                                        )}
                                    </button>
                                </div>

                                {/* Error Message */}
                                {error && (
                                    <p
                                        role="alert"
                                        className="mt-3 text-center text-xs text-red-600"
                                    >
                                        {error}
                                    </p>
                                )}

                                {/* Reset Password Button */}
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="mt-6 h-[40px] w-full rounded-full bg-[#6254F5] text-[13px] font-bold text-white shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                    {isSubmitting
                                        ? "Updating Password..."
                                        : "Reset Password"}
                                </button>
                            </form>
                        </>
                    )}
                </div>
            </section>
        </main>
    );
}
