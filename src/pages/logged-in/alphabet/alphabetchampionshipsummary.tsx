import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Trophy,
  Loader2,
  AlertCircle,
  RotateCcw,
  BookOpen,
  LogOut,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

type ChampionshipQuestion = {
  id: string;
  letter: string;
  answer: string;
  options: string[];
  question_en: string;
  question_tl: string;
};

type ChampionshipAnswer = {
  question_id: string;
  question_index: number;
  selected_answer: string;
  correct_answer: string;
  is_correct: boolean;
  answered_at: string;
};

type IncorrectAnswer = {
  question: ChampionshipQuestion;
  answer: ChampionshipAnswer;
  questionNumber: number;
};

type ChampionshipAttempt = {
  id: string;
  questions: ChampionshipQuestion[];
  answers: ChampionshipAnswer[];
  score: number;
  total_questions: number;
  status: string;
};

const TOTAL_QUESTIONS = 26;
const PASSING_PERCENTAGE = 75;

export default function AlphabetChampionshipSummary() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const isTagalog = language === "tl";
  const attemptId = searchParams.get("attempt");

  const [attempt, setAttempt] = useState<ChampionshipAttempt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const loadAttempt = async () => {
      setLoading(true);
      setError(null);
      setAttempt(null);

      if (!user?.id) {
        setError(
          isTagalog
            ? "Kailangan mong mag-sign in upang makita ang buod."
            : "You must sign in to view this summary."
        );

        setLoading(false);
        return;
      }

      if (!attemptId) {
        setError(
          isTagalog
            ? "Walang nahanap na Championship attempt."
            : "No Championship attempt was specified."
        );

        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("alphabet_assessment_attempts")
          .select(`
            id,
            questions,
            answers,
            score,
            total_questions,
            status
          `)
          .eq("id", attemptId)
          .eq("user_id", user.id)
          .eq("assessment_type", "championship")
          .eq("part_key", "3")
          .eq("status", "completed")
          .maybeSingle();

        if (fetchError) {
          throw fetchError;
        }

        if (!data) {
          throw new Error(
            isTagalog
              ? "Hindi makita ang resulta. Maaaring wala ito o wala kang pahintulot na tingnan ito."
              : "The result could not be found. It may not exist or you may not have permission to view it."
          );
        }

        const questions = data.questions as ChampionshipQuestion[];
        const answers = data.answers as ChampionshipAnswer[];

        // Validate the saved question and answer arrays.
        if (
          !Array.isArray(questions) ||
          !Array.isArray(answers) ||
          questions.length !== TOTAL_QUESTIONS ||
          answers.length !== TOTAL_QUESTIONS
        ) {
          throw new Error(
            isTagalog
              ? "Hindi kumpleto o hindi wasto ang naka-save na Championship answers."
              : "The saved Championship answers are incomplete or invalid."
          );
        }

        // Validate question properties.
        const validQuestions = questions.every(
          (question) =>
            question &&
            typeof question.id === "string" &&
            typeof question.letter === "string" &&
            typeof question.answer === "string" &&
            typeof question.question_en === "string" &&
            typeof question.question_tl === "string"
        );

        if (!validQuestions) {
          throw new Error(
            isTagalog
              ? "May hindi wastong datos sa naka-save na mga tanong."
              : "The saved questions contain invalid data."
          );
        }

        // Validate answer properties.
        const validAnswers = answers.every(
          (answer) =>
            answer &&
            typeof answer.question_id === "string" &&
            typeof answer.selected_answer === "string" &&
            typeof answer.correct_answer === "string" &&
            typeof answer.question_index === "number" &&
            typeof answer.is_correct === "boolean"
        );

        if (!validAnswers) {
          throw new Error(
            isTagalog
              ? "May hindi wastong datos sa naka-save na mga sagot."
              : "The saved answers contain invalid data."
          );
        }

        // Ensure every question has a unique ID.
        const questionIds = new Set(
          questions.map((question) => question.id)
        );

        if (questionIds.size !== TOTAL_QUESTIONS) {
          throw new Error(
            isTagalog
              ? "May magkakaparehong question ID sa naka-save na resulta."
              : "Duplicate question IDs were found in the saved result."
          );
        }

        // Ensure every question has exactly one corresponding answer.
        const answerIds = new Set(
          answers.map((answer) => answer.question_id)
        );

        if (answerIds.size !== TOTAL_QUESTIONS) {
          throw new Error(
            isTagalog
              ? "May nawawala o dobleng sagot sa naka-save na resulta."
              : "Missing or duplicate answers were found in the saved result."
          );
        }

        const allAnswersMatch = answers.every((answer) =>
          questionIds.has(answer.question_id)
        );

        if (!allAnswersMatch) {
          throw new Error(
            isTagalog
              ? "Hindi magkatugma ang mga tanong at sagot sa resultang ito."
              : "The questions and answers in this result do not match."
          );
        }

        // Validate the saved score.
        const savedScore = Number(data.score);
        const savedTotal = Number(data.total_questions);

        if (
          !Number.isInteger(savedScore) ||
          !Number.isInteger(savedTotal) ||
          savedScore < 0 ||
          savedScore > TOTAL_QUESTIONS ||
          savedTotal !== TOTAL_QUESTIONS
        ) {
          throw new Error(
            isTagalog
              ? "Hindi wasto ang naka-save na marka."
              : "The saved Championship score is invalid."
          );
        }

        if (cancelled) return;

        setAttempt({
          id: data.id,
          questions,
          answers,
          score: savedScore,
          total_questions: savedTotal,
          status: data.status,
        });
      } catch (err) {
        console.error("Error loading Championship summary:", err);

        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : isTagalog
                ? "May nangyaring hindi inaasahang error."
                : "An unexpected error occurred."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadAttempt();

    return () => {
      cancelled = true;
    };
  }, [attemptId, user?.id, authLoading, isTagalog]);

  // Match each answer with its original question.
  // The saved question array retains the shuffled attempt order.
  const incorrectAnswers = useMemo<IncorrectAnswer[]>(() => {
    if (!attempt) return [];

    const questionMap = new Map(
      attempt.questions.map((question, index) => [
        question.id,
        {
          question,
          index,
        },
      ])
    );

    return attempt.answers
      .map((answer) => {
        const matched = questionMap.get(answer.question_id);

        if (!matched) return null;

        const selectedAnswer = answer.selected_answer.trim().toUpperCase();

        const correctAnswer = (
          answer.correct_answer || matched.question.answer
        )
          .trim()
          .toUpperCase();

        const isCorrect = selectedAnswer === correctAnswer;

        if (isCorrect) return null;

        return {
          question: matched.question,
          answer,
          questionNumber: matched.index + 1,
        };
      })
      .filter((item): item is IncorrectAnswer => item !== null)
      .sort((a, b) => a.questionNumber - b.questionNumber);
  }, [attempt]);

  const correctCount = attempt
    ? attempt.total_questions - incorrectAnswers.length
    : 0;

  const percentage = attempt
    ? Math.round((attempt.score / attempt.total_questions) * 100)
    : 0;

  const passed = percentage >= PASSING_PERCENTAGE;

  // Navigation
  const handleBack = () => {
    if (!attemptId) {
      navigate("/categories");
      return;
    }

    navigate(
      `/alphabetcomplete?attempt=${encodeURIComponent(attemptId)}`
    );
  };

  const handleTryAgain = () => {
    navigate("/championship?newAttempt=true");
  };

  const handleExit = () => {
    navigate("/categories");
  };

  // Loading screen
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-6">
        <Loader2 className="w-12 h-12 text-[#36A9F4] animate-spin mb-4" />

        <p className="text-[#164B9B] font-black">
          {isTagalog
            ? "Inihahanda ang iyong resulta..."
            : "Loading your championship summary..."}
        </p>
      </div>
    );
  }

  // Error screen
  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-[#B8DDF6] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>

          <h1 className="text-2xl font-black text-[#164B9B] mb-3">
            {isTagalog
              ? "Hindi Makita ang Resulta"
              : "Result Unavailable"}
          </h1>

          <p className="text-slate-600 font-medium leading-relaxed mb-7">
            {error ||
              (isTagalog
                ? "Hindi makita ang iyong resulta."
                : "Your result could not be found.")}
          </p>

          <button
            type="button"
            onClick={handleExit}
            className="w-full rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-6 py-3.5 font-extrabold text-white transition hover:bg-sky-600 active:translate-y-0.5 active:border-b-2"
          >
            {isTagalog
              ? "Bumalik sa Categories"
              : "Back to Categories"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-4 py-8 sm:px-6">

      {/* Background decorative elements */}
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

      <div className="relative z-10 mx-auto max-w-4xl">

        {/* Back to result */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border-b-4 border-[#B8DDF6] bg-white px-4 py-3 font-extrabold text-[#36A9F4] shadow-sm transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />

          <span>
            {isTagalog
              ? "Bumalik sa Resulta"
              : "Back to Results"}
          </span>
        </button>

        {/* Summary header and score */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm border border-[#B8DDF6]">

          <div className="bg-linear-to-r from-[#36A9F4] to-[#164B9B] px-6 py-8 text-center text-white sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <BookOpen size={34} />
            </div>

            <h1 className="text-3xl font-black sm:text-4xl">
              {isTagalog
                ? "Buod ng Championship"
                : "Championship Summary"}
            </h1>

            <p className="mt-2 text-sm text-sky-100 font-medium sm:text-base">
              {isTagalog
                ? "Suriin ang mga sagot na kailangan mo pang pag-aralan."
                : "Review the answers you need to study further."}
            </p>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">

            <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5 text-center">
              <p className="text-xs font-black text-[#164B9B] uppercase tracking-wide">
                {isTagalog
                  ? "Kabuuang Tanong"
                  : "Total Questions"}
              </p>

              <p className="mt-2 text-3xl font-black text-[#164B9B]">
                {attempt.total_questions}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-center">
              <p className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                {isTagalog
                  ? "Tamang Sagot"
                  : "Correct Answers"}
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-700">
                {correctCount}
              </p>
            </div>

            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5 text-center">
              <p className="text-xs font-black text-rose-700 uppercase tracking-wide">
                {isTagalog
                  ? "Maling Sagot"
                  : "Incorrect Answers"}
              </p>

              <p className="mt-2 text-3xl font-black text-rose-700">
                {incorrectAnswers.length}
              </p>
            </div>

          </div>

          {/* Percentage and progress */}
          <div className="px-6 pb-7 sm:px-8">

            <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-500">
              <span>
                {isTagalog ? "Iyong Iskor" : "Your Score"}
              </span>

              <span>
                {attempt.score}/{attempt.total_questions} ({percentage}%)
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className={`h-full rounded-full transition-all ${
                  passed
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, percentage))}%`,
                }}
              />
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black ${
                  passed
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-rose-100 text-rose-700"
                }`}
              >
                {passed ? (
                  <Trophy size={16} />
                ) : (
                  <RotateCcw size={16} />
                )}

                {passed
                  ? isTagalog
                    ? "NAIPASA"
                    : "PASSED"
                  : isTagalog
                    ? "HINDI NAIPASA"
                    : "NOT PASSED"}
              </span>

              <span className="text-xs font-medium text-slate-500">
                {isTagalog
                  ? "Pamantayan sa pagpasa: 75%"
                  : "Passing requirement: 75%"}
              </span>
            </div>
          </div>
        </div>

        {/* Incorrect answers */}
        {incorrectAnswers.length === 0 ? (
          <div className="rounded-3xl border border-[#B8DDF6] bg-white p-8 text-center shadow-sm sm:p-12">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-emerald-100">
              <Trophy className="h-10 w-10 text-emerald-600" />
            </div>

            <h2 className="text-2xl font-black text-[#164B9B]">
              {isTagalog
                ? "Perpektong Iskor!"
                : "Perfect Score!"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-slate-600 font-medium">
              {isTagalog
                ? "Tama ang lahat ng iyong sagot. Mahusay ang iyong ginawa sa Championship!"
                : "You answered every question correctly. Excellent work in the Championship!"}
            </p>
          </div>
        ) : (
          <section>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600">
                <XCircle className="h-6 w-6" />
              </div>

              <div>
                <h2 className="text-xl font-black text-[#164B9B]">
                  {isTagalog
                    ? "Mga Sagot na Mali"
                    : "Incorrect Answers"}
                </h2>

                <p className="text-sm font-medium text-slate-600">
                  {isTagalog
                    ? "Ito ang mga titik na kailangan mong balikan."
                    : "These are the letters you should review."}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              {incorrectAnswers.map((item) => (
                <article
                  key={item.question.id}
                  className="overflow-hidden rounded-3xl border border-[#B8DDF6] bg-white shadow-sm"
                >

                  {/* Question number */}
                  <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50 px-5 py-4">
                    <span className="font-extrabold text-slate-700 text-sm">
                      {isTagalog ? "Tanong" : "Question"}{" "}
                      {item.questionNumber}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-black text-rose-700">
                      <XCircle size={14} />

                      {isTagalog ? "Mali" : "Incorrect"}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">

                    {/* Question text */}
                    <p className="mb-5 font-bold leading-relaxed text-[#454545]">
                      {isTagalog
                        ? item.question.question_tl
                        : item.question.question_en}
                    </p>

                    {/* Letter */}
                    <div className="mb-5 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-sky-50 border border-sky-100 text-3xl font-black text-[#164B9B]">
                        {item.question.letter}
                      </div>
                    </div>

                    {/* Answer comparison */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      {/* User's answer */}
                      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4">
                        <div className="mb-1 flex items-center gap-2 text-xs font-black text-rose-700 uppercase tracking-wide">
                          <XCircle size={16} />

                          {isTagalog
                            ? "Iyong Sagot"
                            : "Your Answer"}
                        </div>

                        <p className="text-2xl font-black text-rose-700 wrap-break-word">
                          {item.answer.selected_answer}
                        </p>
                      </div>

                      {/* Correct answer */}
                      <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                        <div className="mb-1 flex items-center gap-2 text-xs font-black text-emerald-700 uppercase tracking-wide">
                          <CheckCircle2 size={16} />

                          {isTagalog
                            ? "Tamang Sagot"
                            : "Correct Answer"}
                        </div>

                        <p className="text-2xl font-black text-emerald-700 wrap-break-word">
                          {item.answer.correct_answer ||
                            item.question.answer}
                        </p>
                      </div>

                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <button
            type="button"
            onClick={handleBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-[#B8DDF6] bg-white px-6 py-4 font-black text-[#36A9F4] shadow-sm transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />

            {isTagalog
              ? "Bumalik sa Resulta"
              : "Back to Results"}
          </button>

          <button
            type="button"
            onClick={handleTryAgain}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-6 py-4 font-black text-white shadow-sm transition hover:bg-sky-600 active:translate-y-0.5 active:border-b-2"
          >
            <RotateCcw size={20} strokeWidth={2.5} />

            {isTagalog
              ? "Subukan Muli"
              : "Try Again"}
          </button>

          <button
            type="button"
            onClick={handleExit}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-slate-300 bg-slate-100 px-6 py-4 font-black text-slate-700 transition hover:bg-slate-200 active:translate-y-0.5 active:border-b-2"
          >
            <LogOut size={20} strokeWidth={2.5} />

            {isTagalog
              ? "Lumabas"
              : "Exit"}
          </button>

        </div>
      </div>
    </main>
  );
}