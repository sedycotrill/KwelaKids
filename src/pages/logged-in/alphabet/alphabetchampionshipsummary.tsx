
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />

        <p className="text-gray-600 font-medium">
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-gray-100 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {isTagalog
              ? "Hindi Makita ang Resulta"
              : "Result Unavailable"}
          </h1>

          <p className="text-gray-600 leading-relaxed mb-7">
            {error ||
              (isTagalog
                ? "Hindi makita ang iyong resulta."
                : "Your result could not be found.")}
          </p>

          <button
            onClick={handleExit}
            className="w-full rounded-xl bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Back to result */}
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-gray-600 transition hover:bg-white hover:text-indigo-700"
        >
          <ArrowLeft size={20} />

          <span className="font-medium">
            {isTagalog
              ? "Bumalik sa Resulta"
              : "Back to Results"}
          </span>
        </button>

        {/* Summary header and score */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8 text-center text-white sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <BookOpen size={34} />
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {isTagalog
                ? "Buod ng Championship"
                : "Championship Summary"}
            </h1>

            <p className="mt-3 text-sm text-indigo-100 sm:text-base">
              {isTagalog
                ? "Suriin ang mga sagot na kailangan mo pang pag-aralan."
                : "Review the answers you need to study further."}
            </p>
          </div>

          {/* Score cards */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">

            <div className="rounded-2xl bg-indigo-50 p-5 text-center">
              <p className="text-sm font-medium text-indigo-600">
                {isTagalog
                  ? "Kabuuang Tanong"
                  : "Total Questions"}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-indigo-800">
                {attempt.total_questions}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5 text-center">
              <p className="text-sm font-medium text-green-700">
                {isTagalog
                  ? "Tamang Sagot"
                  : "Correct Answers"}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-green-700">
                {correctCount}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-5 text-center">
              <p className="text-sm font-medium text-red-700">
                {isTagalog
                  ? "Maling Sagot"
                  : "Incorrect Answers"}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-red-700">
                {incorrectAnswers.length}
              </p>
            </div>

          </div>

          {/* Percentage and progress */}
          <div className="px-6 pb-7 sm:px-8">

            <div className="mb-3 flex items-center justify-between text-sm font-medium text-gray-600">
              <span>
                {isTagalog ? "Iyong Iskor" : "Your Score"}
              </span>

              <span>
                {attempt.score}/{attempt.total_questions} ({percentage}%)
              </span>
            </div>

            <div className="h-3 overflow-hidden rounded-full bg-gray-100">
              <div
                className={`h-full rounded-full transition-all ${
                  passed
                    ? "bg-gradient-to-r from-green-400 to-green-600"
                    : "bg-gradient-to-r from-orange-400 to-red-500"
                }`}
                style={{
                  width: `${Math.min(100, Math.max(0, percentage))}%`,
                }}
              />
            </div>

            <div className="mt-4 flex flex-col items-center justify-between gap-2 sm:flex-row">
              <span
                className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                  passed
                    ? "bg-green-100 text-green-700"
                    : "bg-orange-100 text-orange-700"
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

              <span className="text-sm text-gray-500">
                {isTagalog
                  ? "Pamantayan sa pagpasa: 75%"
                  : "Passing requirement: 75%"}
              </span>
            </div>
          </div>
        </div>

        {/* Incorrect answers */}
        {incorrectAnswers.length === 0 ? (
          <div className="rounded-3xl border border-green-100 bg-white p-8 text-center shadow-lg sm:p-12">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-green-100">
              <Trophy className="h-10 w-10 text-green-600" />
            </div>

            <h2 className="text-2xl font-extrabold text-gray-800">
              {isTagalog
                ? "Perpektong Iskor!"
                : "Perfect Score!"}
            </h2>

            <p className="mx-auto mt-3 max-w-md text-gray-600">
              {isTagalog
                ? "Tama ang lahat ng iyong sagot. Mahusay ang iyong ginawa sa Championship!"
                : "You answered every question correctly. Excellent work in the Championship!"}
            </p>
          </div>
        ) : (
          <section>

            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-800">
                  {isTagalog
                    ? "Mga Sagot na Mali"
                    : "Incorrect Answers"}
                </h2>

                <p className="text-sm text-gray-500">
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
                  className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md"
                >

                  {/* Question number */}
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-5 py-4">
                    <span className="font-semibold text-gray-700">
                      {isTagalog ? "Tanong" : "Question"}{" "}
                      {item.questionNumber}
                    </span>

                    <span className="inline-flex items-center gap-1.5 rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">
                      <XCircle size={14} />

                      {isTagalog ? "Mali" : "Incorrect"}
                    </span>
                  </div>

                  <div className="p-5 sm:p-6">

                    {/* Question text */}
                    <p className="mb-5 font-medium leading-relaxed text-gray-700">
                      {isTagalog
                        ? item.question.question_tl
                        : item.question.question_en}
                    </p>

                    {/* Letter */}
                    <div className="mb-5 flex justify-center">
                      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 text-3xl font-extrabold text-indigo-700">
                        {item.question.letter}
                      </div>
                    </div>

                    {/* Answer comparison */}
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

                      {/* User's answer */}
                      <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-red-700">
                          <XCircle size={17} />

                          {isTagalog
                            ? "Iyong Sagot"
                            : "Your Answer"}
                        </div>

                        <p className="text-2xl font-extrabold text-red-700 break-words">
                          {item.answer.selected_answer}
                        </p>
                      </div>

                      {/* Correct answer */}
                      <div className="rounded-xl border border-green-200 bg-green-50 p-4">
                        <div className="mb-2 flex items-center gap-2 text-sm font-semibold text-green-700">
                          <CheckCircle2 size={17} />

                          {isTagalog
                            ? "Tamang Sagot"
                            : "Correct Answer"}
                        </div>

                        <p className="text-2xl font-extrabold text-green-700 break-words">
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
            onClick={handleBack}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft size={18} />

            {isTagalog
              ? "Bumalik sa Resulta"
              : "Back to Results"}
          </button>

          <button
            onClick={handleTryAgain}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <RotateCcw size={18} />

            {isTagalog
              ? "Subukan Muli"
              : "Try Again"}
          </button>

          <button
            onClick={handleExit}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-100 px-6 py-3.5 font-semibold text-gray-700 transition hover:bg-gray-200"
          >
            <LogOut size={18} />

            {isTagalog
              ? "Lumabas"
              : "Exit"}
          </button>

        </div>
      </div>
    </div>
  );
}
