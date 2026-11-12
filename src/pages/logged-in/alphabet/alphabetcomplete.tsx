
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

import transitionGirl from "../../../assets/transitiongurl.svg";
import confetti from "../../../assets/confetti.svg";
import sparkle1 from "../../../assets/sparkle1.svg";
import sparkle2 from "../../../assets/sparkle2.svg";

type ChampionshipResult = {
  id: string;
  score: number;
  total_questions: number;
};

export default function AlphabetComplete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const attemptId = searchParams.get("attempt");

  const [result, setResult] = useState<ChampionshipResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get the authenticated user's display name.
  const userName =
    user?.email
      ?.split("@")[0]
      .replace(/[.\_-]/g, " ")
      .replace(/\b\w/g, (letter: string) => letter.toUpperCase()) ||
    "Learner";

  // Retrieve the exact completed Championship attempt.
  useEffect(() => {
    let isMounted = true;

    const fetchChampionshipResult = async () => {
      if (authLoading) return;

      if (!user) {
        if (isMounted) {
          setError(
            language === "tl"
              ? "Hindi ma-verify ang iyong account."
              : "Unable to verify your account."
          );
          setLoading(false);
        }
        return;
      }

      if (!attemptId) {
        if (isMounted) {
          setError(
            language === "tl"
              ? "Walang nakitang resulta ng pagsusulit."
              : "No Championship attempt was provided."
          );
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("alphabet_assessment_attempts")
        .select("id, score, total_questions")
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .eq("assessment_type", "championship")
        .eq("part_key", "3")
        .eq("status", "completed")
        .maybeSingle();

      if (!isMounted) return;

      if (fetchError) {
        console.error(
          "Error fetching Championship result:",
          fetchError
        );

        setError(
          language === "tl"
            ? "Hindi ma-load ang iyong resulta. Subukan muli."
            : "Unable to load your Championship result. Please try again."
        );
        setLoading(false);
        return;
      }

      if (
        !data ||
        data.score === null ||
        data.total_questions === null ||
        data.total_questions <= 0
      ) {
        setError(
          language === "tl"
            ? "Hindi makita ang kumpletong resulta ng iyong pagsusulit."
            : "The completed Championship result could not be found."
        );
        setLoading(false);
        return;
      }

      setResult({
        id: data.id,
        score: data.score,
        total_questions: data.total_questions,
      });

      setLoading(false);
    };

    fetchChampionshipResult();

    return () => {
      isMounted = false;
    };
  }, [attemptId, user, authLoading, language]);

  // Calculate the final result.
  const percentage = result
    ? Math.round((result.score / result.total_questions) * 100)
    : 0;

  const passingScore = result
    ? Math.ceil(result.total_questions * 0.75)
    : 0;

  const passed = result
    ? result.score >= passingScore
    : false;

  const handleTryAgain = () => {
    // The Championship page creates a new attempt
    // when no unfinished attempt exists.
    navigate("/championship");
  };

  const handleExit = () => {
    navigate("/categories");
  };

  const handleSummary = () => {
    if (!result) return;

    navigate(
      `/championshipsummary?attempt=${encodeURIComponent(result.id)}`
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">

      {/* Confetti Animation */}
      <style>
        {`
          @keyframes confettiRise {
            0% {
              transform: translateY(100vh);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            100% {
              transform: translateY(-120vh);
              opacity: 1;
            }
          }
        `}
      </style>

      <img
        src={confetti}
        alt=""
        className="pointer-events-none absolute left-[55%] top-[40%] z-0 h-[60%] w-[60%] object-cover"
        style={{ animation: "confettiRise 3s linear infinite" }}
      />

      <img
        src={confetti}
        alt=""
        className="pointer-events-none absolute right-[12%] top-[-5%] z-0 h-[80%] w-[80%] object-contain"
        style={{ animation: "confettiRise 4s linear 1s infinite" }}
      />

      <img
        src={confetti}
        alt=""
        className="pointer-events-none absolute right-[45%] top-[20%] z-0 h-[55%] w-[55%] object-contain"
        style={{ animation: "confettiRise 4s linear 2s infinite" }}
      />

      <img
        src={confetti}
        alt=""
        className="pointer-events-none absolute right-[-10%] top-[30%] z-0 h-[65%] w-[65%] object-contain"
        style={{ animation: "confettiRise 3s linear 0.5s infinite" }}
      />

      <img
        src={confetti}
        alt=""
        className="pointer-events-none absolute right-[65%] top-[10%] z-0 h-[50%] w-[50%] object-contain"
        style={{ animation: "confettiRise 4s linear 3s infinite" }}
      />

      <img
        src={confetti}
        alt=""
        className="pointer-events-none absolute right-[25%] top-[50%] z-0 h-[70%] w-[70%] object-contain"
        style={{ animation: "confettiRise 6s linear 1.5s infinite" }}
      />

      {/* Sparkles */}
      <img
        src={sparkle1}
        alt=""
        className="pointer-events-none absolute left-[37%] top-[13%] z-0 h-[25%] w-[25%] object-contain"
      />

      <img
        src={sparkle2}
        alt=""
        className="pointer-events-none absolute right-[6%] top-[65%] z-0 h-[25%] w-[25%] object-contain"
      />

      {/* Girl Illustration */}
      <img
        src={transitionGirl}
        alt="Happy girl celebrating"
        className="pointer-events-none absolute bottom-0 z-0 h-[120%] w-[500%] -translate-x-px translate-y-px object-fill object-bottom"
      />

      {/* Result Card */}
      <div className="absolute left-1/2 top-1/2 z-20 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 -translate-y-1/2 rounded-[22px] border-[6px] border-[#F9C526] bg-white px-5 py-7 text-center shadow-sm sm:px-8 sm:py-8">

        {/* Loading State */}
        {loading ? (
          <div className="py-8">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-[#D7EDFC] border-t-[#238FD5]" />

            <p className="mt-5 text-sm font-bold text-[#102D69]">
              {language === "tl"
                ? "Kinukuha ang iyong resulta..."
                : "Loading your Championship result..."}
            </p>
          </div>
        ) : error ? (
          /* Error State */
          <div className="py-5">
            <h1 className="text-2xl font-black text-[#102D69] sm:text-3xl">
              {language === "tl"
                ? "Hindi Ma-load ang Resulta"
                : "Result Unavailable"}
            </h1>

            <p className="mt-4 text-sm font-medium text-[#536783]">
              {error}
            </p>

            <button
              type="button"
              onClick={handleExit}
              className="mt-7 w-full rounded-xl border border-[#AAAAAA] bg-white px-4 py-3 text-lg font-extrabold text-[#666666] transition hover:bg-gray-100"
            >
              {language === "tl" ? "LUMABAS" : "EXIT"}
            </button>
          </div>
        ) : result ? (
          <>
            {/* Result Heading */}
            <h1 className="text-[30px] font-black leading-tight text-[#102D69] sm:text-[38px]">
              {passed
                ? language === "tl"
                  ? "MAGALING!"
                  : "WELL DONE!"
                : language === "tl"
                  ? "IPAGPATULOY!"
                  : "KEEP PRACTICING!"}
            </h1>

            <p className="mt-2 text-lg font-extrabold text-[#102D69]">
              {userName}!
            </p>

            {/* Pass / Fail Status */}
            <div
              className={`mx-auto mt-5 inline-flex rounded-full px-6 py-2 text-sm font-black tracking-wide sm:text-base ${
                passed
                  ? "bg-[#DDF7E7] text-[#16834B]"
                  : "bg-[#FFE8E8] text-[#D04444]"
              }`}
            >
              {passed
                ? language === "tl"
                  ? "NAIPASA ANG CHAMPIONSHIP"
                  : "CHAMPIONSHIP PASSED"
                : language === "tl"
                  ? "HINDI PA NAIPASA"
                  : "CHAMPIONSHIP NOT PASSED"}
            </div>

            {/* Percentage */}
            <div className="mt-5">
              <p className="text-sm font-bold text-[#536783]">
                {language === "tl"
                  ? "Iyong Iskor"
                  : "Your Final Score"}
              </p>

              <p
                className={`mt-1 text-5xl font-black sm:text-6xl ${
                  passed ? "text-[#16834B]" : "text-[#E05A5A]"
                }`}
              >
                {percentage}%
              </p>

              <p className="mt-2 text-base font-extrabold text-[#102D69]">
                {result.score} / {result.total_questions}
              </p>
            </div>

            {/* Result Description */}
            <p className="mx-auto mt-4 max-w-md text-xs font-medium leading-relaxed text-[#536783] sm:text-sm">
              {passed
                ? language === "tl"
                  ? "Binabati kita! Naabot mo ang kinakailangang marka sa Championship."
                  : "Congratulations! You reached the required score in the Championship."
                : language === "tl"
                  ? `Kailangan mo ng ${passingScore} tamang sagot upang makapasa. Maaari mong subukan muli!`
                  : `You need ${passingScore} correct answers to pass. Keep practicing and try again!`}
            </p>

            {/* Action Buttons */}
            <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">

              {/* Try Again - Only When Failed */}
              {!passed && (
                <button
                  type="button"
                  onClick={handleTryAgain}
                  className="w-full rounded-xl border border-[#238FD5] bg-[#36A9F4] px-4 py-3 text-base font-extrabold text-white transition hover:bg-[#208FD8] sm:flex-1 sm:text-lg"
                >
                  {language === "tl" ? "SUBUKAN MULI" : "TRY AGAIN"}
                </button>
              )}

              {/* Exit */}
              <button
                type="button"
                onClick={handleExit}
                className="w-full rounded-xl border border-[#AAAAAA] bg-white px-4 py-3 text-base font-extrabold text-[#666666] transition hover:bg-gray-100 sm:flex-1 sm:text-lg"
              >
                {language === "tl" ? "LUMABAS" : "EXIT"}
              </button>

              {/* Summary */}
              <button
                type="button"
                onClick={handleSummary}
                className="w-full rounded-xl border border-[#F0B91B] bg-[#F9C526] px-4 py-3 text-base font-extrabold text-[#102D69] transition hover:bg-[#EAB51C] sm:flex-1 sm:text-lg"
              >
                {language === "tl" ? "BUOD" : "SUMMARY"}
              </button>

            </div>
          </>
        ) : null}
      </div>
    </main>
  );
}
