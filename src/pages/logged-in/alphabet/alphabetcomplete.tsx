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

// Confetti na naka-cluster sa paligid ng girl at modal (percent ng main container,
// kaya laging aligned kahit magbago ang laki ng screen)
const CONFETTI = [
  // kaliwa / itaas ng girl
  { pos: "left-[-1%] top-[4%]", size: "w-9 sm:w-12 lg:w-16", delay: 0, rotate: 15 },
  { pos: "left-[9%] top-[-2%]", size: "w-8 sm:w-10 lg:w-14", delay: 0.5, rotate: -20 },
  { pos: "left-[16%] top-[14%]", size: "w-7 sm:w-9 lg:w-12", delay: 1.1, rotate: 40 },
  { pos: "left-[-3%] top-[30%]", size: "w-8 sm:w-10 lg:w-14", delay: 1.6, rotate: -35 },
  // gitna: sa pagitan ng girl at taas ng modal
  { pos: "left-[34%] top-[-6%]", size: "w-8 sm:w-10 lg:w-14", delay: 0.3, rotate: 25 },
  { pos: "left-[44%] top-[-10%]", size: "w-7 sm:w-9 lg:w-12", delay: 1.4, rotate: -10 },
  // kanan / itaas ng modal
  { pos: "right-[10%] top-[-9%]", size: "w-8 sm:w-10 lg:w-14", delay: 0.8, rotate: 30 },
  { pos: "right-[-2%] top-[6%]", size: "w-9 sm:w-12 lg:w-16", delay: 0.2, rotate: -25 },
  { pos: "right-[-4%] top-[26%]", size: "w-7 sm:w-9 lg:w-12", delay: 1.9, rotate: 55 },
  // kanan / ibaba ng modal
  { pos: "right-[-3%] bottom-[22%]", size: "w-8 sm:w-10 lg:w-14", delay: 1.2, rotate: -45 },
  { pos: "right-[12%] bottom-[-9%]", size: "w-9 sm:w-12 lg:w-16", delay: 0.6, rotate: 20 },
  { pos: "right-[24%] bottom-[-6%]", size: "w-7 sm:w-9 lg:w-12", delay: 1.7, rotate: -15 },
  // ibaba ng girl
  { pos: "left-[4%] bottom-[-5%]", size: "w-8 sm:w-10 lg:w-14", delay: 0.9, rotate: 35 },
  { pos: "left-[20%] bottom-[-8%]", size: "w-7 sm:w-9 lg:w-12", delay: 2.1, rotate: -30 },
];

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-6">
        <Loader2 className="w-12 h-12 text-[#36A9F4] animate-spin mb-4" />

        <p className="text-lg font-black text-[#164B9B]">
          {isTagalog
            ? "Kinukuha ang iyong resulta..."
            : "Loading your results..."}
        </p>
      </div>
    );
  }

  if (error || !attempt) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-6">
        <div className="bg-white rounded-3xl shadow-xl border border-[#B8DDF6] p-8 max-w-md w-full text-center">
          <AlertCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />

          <h1 className="text-2xl font-black text-[#164B9B] mb-3">
            {isTagalog ? "Hindi ma-load ang resulta" : "Result Unavailable"}
          </h1>

          <p className="text-slate-600 font-medium mb-6">
            {error ||
              (isTagalog
                ? "Hindi makita ang iyong resulta."
                : "Your result could not be found.")}
          </p>

          <button
            type="button"
            onClick={handleExit}
            className="w-full rounded-2xl border-b-4 border-sky-700 bg-sky-500 py-3.5 px-6 font-extrabold text-white transition hover:bg-sky-600 active:translate-y-0.5 active:border-b-2"
          >
            {isTagalog ? "BUMALIK SA CATEGORIES" : "BACK TO CATEGORIES"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] flex flex-col items-center justify-center px-4 py-12">

      <style>
        {`
          @keyframes confettiDrift {
            0%, 100% {
              transform: translateY(0) scale(1);
            }
            50% {
              transform: translateY(-12px) scale(1.06);
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

          .confetti-drift {
            animation: confettiDrift 3.5s ease-in-out infinite;
          }

          .sparkle-pulse {
            animation: sparklePulse 2s ease-in-out infinite;
          }

          .girl-float {
            animation: girlFloat 3s ease-in-out infinite;
          }
        `}
      </style>

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-7xl flex flex-col lg:flex-row items-center lg:items-end justify-center gap-0">

        {/* Confetti: nasa likod ng girl at modal */}
        <div className="pointer-events-none absolute inset-0">
          {CONFETTI.map((piece, i) => (
            <img
              key={i}
              src={confetti}
              alt=""
              className={`confetti-drift absolute opacity-90 ${piece.pos} ${piece.size}`}
              style={{
                animationDelay: `${piece.delay}s`,
                rotate: `${piece.rotate}deg`,
              }}
            />
          ))}
        </div>

        {/*
          Girl: ang SVG ay may transparent na espasyo sa paligid niya, kaya
          naka-absolute ang image at ang wrapper ay kasing lapad lang ng mismong
          girl (≈63% ng --girl-w). Ang taas ay sumusunod sa modal (self-stretch),
          at naka-align sa ibaba. Palitan lang ang --girl-w para palakihin/paliitin.
        */}
        <div
          className="relative flex justify-center z-20 shrink-0 -mb-6 lg:mb-0 lg:block lg:self-stretch lg:-mr-6
                     lg:w-[calc(var(--girl-w)*0.63)]
                     lg:[--girl-w:640px] xl:[--girl-w:860px] 2xl:[--girl-w:900px]"
        >
          <img
            src={transitionGirl}
            alt="Celebration character"
            className="girl-float w-72 sm:w-80 md:w-96
                       lg:absolute lg:bottom-0 lg:left-[calc(var(--girl-w)*-0.25)]
                       lg:w-(--girl-w) lg:max-w-none
                       object-contain drop-shadow-2xl"
          />
        </div>

        {/* Result Card (Modal) */}
        <div className="relative bg-white rounded-3xl shadow-sm border border-[#B8DDF6] p-6 sm:p-9 text-center w-full max-w-2xl z-10">

          {/* Sparkles: nakadikit sa mga sulok ng modal */}
          <div className="pointer-events-none absolute -top-8 -left-6 sm:-top-12 sm:-left-10 lg:-top-16 lg:-left-14 z-30">
            <img
              src={sparkle1}
              alt=""
              className="sparkle-pulse w-16 sm:w-24 lg:w-32 xl:w-36"
            />
          </div>

          <div className="pointer-events-none absolute -bottom-8 -right-6 sm:-bottom-12 sm:-right-10 lg:-bottom-16 lg:-right-14 z-30">
            <img
              src={sparkle2}
              alt=""
              className="sparkle-pulse w-16 sm:w-24 lg:w-32 xl:w-36"
              style={{ animationDelay: "0.8s" }}
            />
          </div>

          {/* Greeting */}
          <div className="flex justify-center mb-3">
            <div className="bg-amber-100 p-3 rounded-2xl">
              <Award className="w-9 h-9 text-amber-500" />
            </div>
          </div>

          <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-[#36A9F4] mb-2">
            {isTagalog ? "CHAMPIONSHIP RESULTA" : "CHAMPIONSHIP RESULTS"}
          </p>

          <h1 className="text-3xl sm:text-4xl font-black text-[#164B9B] mb-2">
            {passed
              ? isTagalog
                ? "MAGALING!"
                : "WELL DONE!"
              : isTagalog
                ? "HUWAG SUSUKO!"
                : "KEEP TRYING!"}
          </h1>

          <p className="text-slate-600 font-medium text-sm sm:text-base mb-6">
            {isTagalog
              ? `Magaling, ${userName}! Narito ang iyong resulta sa Alphabet Championship.`
              : `Great effort, ${userName}! Here is your Alphabet Championship result.`}
          </p>

          {/* Pass / Fail status */}
          <div
            className={`rounded-2xl border px-5 py-4 mb-5 ${
              passed
                ? "bg-emerald-50 border-emerald-200"
                : "bg-rose-50 border-rose-200"
            }`}
          >
            <p
              className={`text-xl sm:text-2xl font-black ${
                passed ? "text-emerald-700" : "text-rose-700"
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

            <p className="text-xs sm:text-sm font-medium text-slate-500 mt-1">
              {isTagalog
                ? "Kailangan ng hindi bababa sa 75% upang makapasa."
                : "You need at least 75% to pass."}
            </p>
          </div>

          {/* Score */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="bg-sky-50 border border-sky-100 rounded-2xl p-4">
              <p className="text-xs sm:text-sm font-black text-[#164B9B] mb-1 uppercase tracking-wide">
                {isTagalog ? "TAMANG SAGOT" : "CORRECT ANSWERS"}
              </p>

              <p className="text-3xl sm:text-4xl font-black text-[#164B9B]">
                {score}
                <span className="text-base font-extrabold text-sky-400">
                  /{totalQuestions}
                </span>
              </p>
            </div>

            <div className="bg-purple-50 border border-purple-100 rounded-2xl p-4">
              <p className="text-xs sm:text-sm font-black text-[#A45CE8] mb-1 uppercase tracking-wide">
                {isTagalog ? "PORSYENTO" : "PERCENTAGE"}
              </p>

              <p className="text-3xl sm:text-4xl font-black text-[#A45CE8]">
                {percentage}%
              </p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-7">
            <div className="flex justify-between text-xs sm:text-sm font-extrabold text-slate-500 mb-2">
              <span>{isTagalog ? "Iyong marka" : "Your score"}</span>
              <span>
                {isTagalog ? "Pamantayan: 75%" : "Passing score: 75%"}
              </span>
            </div>

            <div className="h-3.5 w-full rounded-full bg-slate-100 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-1000 ${
                  passed ? "bg-emerald-500" : "bg-rose-500"
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
              type="button"
              onClick={handleTryAgain}
              className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 py-3.5 px-4 font-black text-white shadow-sm transition-all hover:bg-sky-600 active:translate-y-0.5 active:border-b-2"
            >
              <RotateCcw className="w-5 h-5" strokeWidth={2.5} />
              {isTagalog ? "SUBUKAN MULI" : "TRY AGAIN"}
            </button>

            <button
              type="button"
              onClick={handleSummary}
              className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-[#B98AFF] bg-[#E5D3FF] py-3.5 px-4 font-black text-[#A45CE8] shadow-sm transition-all hover:bg-[#D8BCFF] active:translate-y-0.5 active:border-b-2"
            >
              <BookOpen className="w-5 h-5" strokeWidth={2.5} />
              {isTagalog ? "BUOD" : "SUMMARY"}
            </button>

            <button
              type="button"
              onClick={handlePreviousRecords}
              className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-[#79C5FA] bg-[#91D1FF] py-3.5 px-4 font-black text-white shadow-sm transition-all hover:bg-[#70BFFF] active:translate-y-0.5 active:border-b-2"
            >
              <History className="w-5 h-5" strokeWidth={2.5} />
              {isTagalog ? "Mga NAKARAANG RECORD" : "PREVIOUS RECORDS"}
            </button>

            <button
              type="button"
              onClick={handleExit}
              className="flex items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-300 bg-slate-100 py-3.5 px-4 font-black text-slate-700 shadow-sm transition-all hover:bg-slate-200 active:translate-y-0.5 active:border-b-2"
            >
              <LogOut className="w-5 h-5" strokeWidth={2.5} />
              {isTagalog ? "LUMABAS" : "EXIT"}
            </button>

          </div>
        </div>

      </div>

      <p className="text-center text-xs sm:text-sm text-[#164B9B] font-bold mt-6 relative z-10">
        {isTagalog
          ? "Ipagpatuloy ang pag-aaral at pagbutihin pa ang iyong kaalaman!"
          : "Keep learning and continue improving your FSL knowledge!"}
      </p>
    </main>
  );
};

export default AlphabetComplete;