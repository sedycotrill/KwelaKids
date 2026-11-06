
import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";

import background from "../../assets/bgforotp.svg";
import person from "../../assets/forgotpasswordgurl.svg";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword() {
    const navigate = useNavigate();

    const [email, setEmail] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (
        event: FormEvent<HTMLFormElement>
    ) => {
        event.preventDefault();

        setError("");
        setSuccess("");

        const normalizedEmail = email.trim().toLowerCase();

        if (!normalizedEmail) {
            setError("Please enter your email address.");
            return;
        }

        // Basic email validation. Supabase supports more than Gmail.
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
            setError("Please enter a valid email address.");
            return;
        }

        setIsSubmitting(true);

        try {
            const { error: resetError } =
                await supabase.auth.resetPasswordForEmail(
                    normalizedEmail,
                    {
                        redirectTo: `${window.location.origin}/resetpassword`,
                    }
                );

            if (resetError) {
                throw resetError;
            }

            // Use a generic message so the page does not reveal
            // whether an email address has an account.
            setSuccess(
                "If an account exists with this email, a password reset link has been sent. Please check your inbox."
            );
        } catch (submitError) {
            console.error("Forgot password error:", submitError);

            setError(
                "Unable to send the reset email right now. Please try again."
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
                                required
                                disabled={isSubmitting}
                                className={`h-[42px] w-full rounded-full border bg-white px-3 text-[13px] text-black shadow-[0_2px_4px_rgba(0,0,0,0.18)] outline-none transition placeholder:text-black focus:border-[#6254F5] focus:ring-2 focus:ring-[#6254F5]/20 ${
                                    error
                                        ? "border-red-500"
                                        : "border-[#A5A5A5]"
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
                            disabled={isSubmitting}
                            className="mt-5 h-[40px] w-full rounded-full bg-[#6254F5] text-[13px] font-bold text-white shadow-[0_2px_3px_rgba(0,0,0,0.25)] transition hover:bg-[#5142E5] focus:outline-none focus:ring-2 focus:ring-[#6254F5] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {isSubmitting
                                ? "Sending..."
                                : "Send Reset Link"}
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
