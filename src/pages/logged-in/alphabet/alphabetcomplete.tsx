
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Award,
  BookOpen,
  History,
  LogOut,
  RotateCcw,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

import transitionGirl from "../../../assets/transitiongurl.svg";
import confetti from "../../../assets/confetti.svg";
import sparkle1 from "../../../assets/sparkle1.svg";
import sparkle2 from "../../../assets/sparkle2.svg";

type ChampionshipAttempt = {
  id: string;
  user_id: string;
  assessment_type: string;
  part_key: string;
  score: number;
  total_questions: number;
  status: "in_progress" | "completed";
  started_at: string;
  completed_at: string | null;
};

const PASSING_PERCENTAGE = 75;
const TOTAL_QUESTIONS = 26;

const AlphabetComplete = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { language } = useLanguage();
  const { user } = useAuth();

  const isTagalog = language === "tl";
  const attemptId = searchParams.get("attempt");

  const [attempt, setAttempt] = useState<ChampionshipAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userName =
    user?.user_metadata?.username ||
    user?.user_metadata?.full_name ||
    user?.user_metadata?.name ||
    "Learner";

  useEffect(() => {
    let isMounted = true;

    const loadAttempt = async () => {
      if (!user?.id) {
        if (isMounted) {
          setError(
            isTagalog
              ? "Hindi ma-verify ang iyong account. Mangyaring mag-log in muli."
              : "Your account could not be verified. Please sign in again."
          );
          setLoading(false);
        }
        return;
      }

      if (!attemptId) {
        if (isMounted) {
          setError(
            isTagalog
              ? "Walang nakitang Championship attempt."
              : "No Championship attempt was specified."
          );
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("alphabet_assessment_attempts")
        .select(
          "id, user_id, assessment_type, part_key, score, total_questions, status, started_at, completed_at"
        )
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .eq("assessment_type", "championship")
        .eq("part_key", "3")
        .eq("status", "completed")
        .maybeSingle();

      if (!isMounted) return;

      if (fetchError) {
        console.error("Error loading Championship result:", fetchError);

        setError(
          isTagalog
            ? "Hindi ma-load ang iyong resulta. Pakisubukang muli."
            : "Unable to load your result. Please try again."
        );

        setLoading(false);
        return;
      }

      if (!data) {
        setError(
          isTagalog
            ? "Hindi makita ang natapos na Championship attempt na ito."
            : "This completed Championship attempt could not be found."
        );

        setLoading(false);
        return;
      }

      setAttempt(data as ChampionshipAttempt);
      setLoading(false);
    };

    loadAttempt();

    return () => {
      isMounted = false;
    };
  }, [attemptId, user?.id, isTagalog]);

  const score = attempt?.score ?? 0;
  const totalQuestions = attempt?.total_questions ?? TOTAL_QUESTIONS;

  const percentage =
    totalQuestions > 0
      ? Math.round((score / totalQuestions) * 100)
      : 0;

  const passed = percentage >= PASSING_PERCENTAGE;

  const handleTryAgain = () => {
    navigate("/championship?newAttempt=true");
  };

  const handleSummary = () => {
    if (!attempt) return;

    navigate(
      `/championshipsummary?attempt=${encodeURIComponent(attempt.id)}`
    );
  };

  const handlePreviousRecords = () => {
    navigate("/championshiphistory");
  };

  const handleExit = () => {
    navigate("/categories");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAF6FF] px-6">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin mb-4" />

        <p className="text-lg font-semibold text-gray-600">
          {isTagalog
            ? "Kinukuha ang iyong resulta..."
            : "Loading your results..."}
        </p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#EAF6FF] px-6">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-md w-full text-center">
          <AlertCircle className="w-14 h-14 text-red-400 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {isTagalog ? "Hindi ma-load ang resulta" : "Result Unavailable"}
          </h1>

          <p className="text-gray-500 mb-6">
            {error ||
              (isTagalog
                ? "Hindi makita ang iyong resulta."
                : "Your result could not be found.")}
          </p>

          <button
            onClick={handleExit}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-xl transition"
          >
            {isTagalog ? "BUMALIK SA CATEGORIES" : "BACK TO CATEGORIES"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] flex flex-col items-center justify-center px-5 py-12">

      <style>
        {`
          @keyframes confettiRise {
            0% {
              transform: translateY(40px) rotate(0deg);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            100% {
              transform: translateY(-120px) rotate(360deg);
              opacity: 0;
            }
          }

          @keyframes sparklePulse {
            0%, 100% {
              transform: scale(0.85);
              opacity: 0.55;
            }
            50% {
              transform: scale(1.15);
              opacity: 1;
            }
          }

          @keyframes girlFloat {
            0%, 100% {
              transform: translateY(0);
            }
            50% {
              transform: translateY(-9px);
            }
          }

          .confetti-rise {
            animation: confettiRise 3.5s ease-in-out infinite;
          }

          .sparkle-pulse {
            animation: sparklePulse 2s ease-in-out infinite;
          }

          .girl-float {
            animation: girlFloat 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Celebration confetti */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <img
          src={confetti}
          alt=""
          className="confetti-rise absolute left-[8%] top-[22%] w-10 opacity-80"
        />

        <img
          src={confetti}
          alt=""
          className="confetti-rise absolute left-[22%] top-[48%] w-8 opacity-70"
          style={{ animationDelay: "0.6s" }}
        />

        <img
          src={confetti}
          alt=""
          className="confetti-rise absolute right-[12%] top-[25%] w-10 opacity-80"
          style={{ animationDelay: "1s" }}
        />

        <img
          src={confetti}
          alt=""
          className="confetti-rise absolute right-[25%] top-[55%] w-8 opacity-70"
          style={{ animationDelay: "1.4s" }}
        />

        <img
          src={confetti}
          alt=""
          className="confetti-rise absolute left-[45%] top-[15%] w-9 opacity-70"
          style={{ animationDelay: "0.3s" }}
        />

        <img
          src={confetti}
          alt=""
          className="confetti-rise absolute right-[45%] top-[65%] w-8 opacity-70"
          style={{ animationDelay: "1.8s" }}
        />
      </div>

      {/* Sparkles */}
      <img
        src={sparkle1}
        alt=""
        className="sparkle-pulse pointer-events-none absolute left-[9%] top-[12%] w-12 md:w-16"
      />

      <img
        src={sparkle2}
        alt=""
        className="sparkle-pulse pointer-events-none absolute right-[9%] top-[18%] w-10 md:w-14"
        style={{ animationDelay: "0.8s" }}
      />

      {/* Main content */}
      <div className="relative z-10 w-full max-w-2xl">

        {/* Character illustration */}
        <div className="flex justify-center mb-[-20px] relative z-20">
          <img
            src={transitionGirl}
            alt="Celebration character"
            className="girl-float w-44 sm:w-52 md:w-60 object-contain drop-shadow-md"
          />
        </div>

        {/* Result card */}
        <div className="relative bg-white/95 backdrop-blur-sm rounded-[2rem] shadow-[0_15px_45px_rgba(80,145,190,0.18)] border border-white p-7 sm:p-10 text-center">

          {/* Greeting */}
          <div className="flex justify-center mb-3">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Award className="w-9 h-9 text-yellow-500" />
            </div>
          </div>

          <p className="text-sm sm:text-base font-bold uppercase tracking-[0.2em] text-blue-500 mb-2">
            {isTagalog ? "CHAMPIONSHIP RESULTA" : "CHAMPIONSHIP RESULTS"}
          </p>

          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-800 mb-2">
            {passed
              ? isTagalog
                ? "MAGALING!"
                : "WELL DONE!"
              : isTagalog
                ? "HUWAG SUSUKO!"
                : "KEEP TRYING!"}
          </h1>

          <p className="text-gray-500 text-sm sm:text-base mb-6">
            {isTagalog
              ? `Magaling, ${userName}! Narito ang iyong resulta sa Alphabet Championship.`
              : `Great effort, ${userName}! Here is your Alphabet Championship result.`}
          </p>

          {/* Pass / Fail status */}
          <div
            className={`rounded-2xl px-5 py-4 mb-5 ${
              passed
                ? "bg-green-50 border border-green-200"
                : "bg-orange-50 border border-orange-200"
            }`}
          >
            <p
              className={`text-xl sm:text-2xl font-extrabold ${
                passed ? "text-green-600" : "text-orange-600"
              }`}
            >
              {passed
                ? isTagalog
                  ? "NAIPASA MO ANG CHAMPIONSHIP!"
                  : "CHAMPIONSHIP PASSED!"
                : isTagalog
                  ? "HINDI PA NAIPASA"
                  : "CHAMPIONSHIP NOT PASSED"}
            </p>

            <p className="text-sm text-gray-500 mt-1">
              {isTagalog
                ? "Kailangan ng hindi bababa sa 75% upang makapasa."
                : "You need at least 75% to pass."}
            </p>
          </div>

          {/* Score */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-blue-50 rounded-2xl p-4">
              <p className="text-xs sm:text-sm font-semibold text-blue-500 mb-1">
                {isTagalog ? "TAMANG SAGOT" : "CORRECT ANSWERS"}
              </p>

              <p className="text-3xl sm:text-4xl font-extrabold text-blue-700">
                {score}
                <span className="text-lg text-blue-400">
                  /{totalQuestions}
                </span>
              </p>
            </div>

            <div className="bg-purple-50 rounded-2xl p-4">
              <p className="text-xs sm:text-sm font-semibold text-purple-500 mb-1">
                {isTagalog ? "PORSYENTO" : "PERCENTAGE"}
              </p>

              <p className="text-3xl sm:text-4xl font-extrabold text-purple-700">
                {percentage}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-7">
            <div className="flex justify-between text-xs sm:text-sm font-semibold text-gray-500 mb-2">
              <span>{isTagalog ? "Iyong marka" : "Your score"}</span>
              <span>
                {isTagalog ? "Pamantayan: 75%" : "Passing score: 75%"}
              </span>
            </div>

            <div className="h-4 w-full rounded-full bg-gray-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  passed ? "bg-green-400" : "bg-orange-400"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, percentage))}%`,
                }}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <button
              onClick={handleTryAgain}
              className="flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <RotateCcw className="w-5 h-5" />
              {isTagalog ? "SUBUKAN MULI" : "TRY AGAIN"}
            </button>

            <button
              onClick={handleSummary}
              className="flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              <BookOpen className="w-5 h-5" />
              {isTagalog ? "BUOD" : "SUMMARY"}
            </button>

            <button
              onClick={handlePreviousRecords}
              className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 border-2 border-blue-200 font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98]"
            >
              <History className="w-5 h-5" />
              {isTagalog ? "MGA NAKARAANG RECORD" : "PREVIOUS RECORDS"}
            </button>

            <button
              onClick={handleExit}
              className="flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-3.5 px-4 rounded-xl transition-all active:scale-[0.98]"
            >
              <LogOut className="w-5 h-5" />
              {isTagalog ? "LUMABAS" : "EXIT"}
            </button>

          </div>
        </div>

        <p className="text-center text-xs sm:text-sm text-blue-500/70 font-medium mt-6">
          {isTagalog
            ? "Ipagpatuloy ang pag-aaral at pagbutihin pa ang iyong kaalaman!"
            : "Keep learning and continue improving your FSL knowledge!"}
        </p>
      </div>
    </div>
  );
};

export default AlphabetComplete;
