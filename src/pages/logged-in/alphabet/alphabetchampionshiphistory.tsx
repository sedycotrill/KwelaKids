
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Trophy,
  History,
  CalendarDays,
  CheckCircle2,
  XCircle,
  BookOpen,
  Loader2,
  AlertCircle,
  Medal,
  RotateCcw,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

type ChampionshipHistoryRecord = {
  id: string;
  score: number;
  total_questions: number;
  completed_at: string | null;
  started_at: string;
};

const PASSING_PERCENTAGE = 75;
const TOTAL_QUESTIONS = 26;

export default function AlphabetChampionshipHistory() {
  const navigate = useNavigate();

  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const isTagalog = language === "tl";

  const [records, setRecords] = useState<ChampionshipHistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;

    let cancelled = false;

    const loadHistory = async () => {
      setLoading(true);
      setError(null);

      if (!user?.id) {
        setError(
          isTagalog
            ? "Kailangan mong mag-sign in upang makita ang iyong mga nakaraang record."
            : "You must sign in to view your previous records."
        );

        setLoading(false);
        return;
      }

      try {
        const { data, error: fetchError } = await supabase
          .from("alphabet_assessment_attempts")
          .select(
            "id, score, total_questions, completed_at, started_at"
          )
          .eq("user_id", user.id)
          .eq("assessment_type", "championship")
          .eq("part_key", "3")
          .eq("status", "completed")
          .order("completed_at", { ascending: false });

        if (fetchError) {
          throw fetchError;
        }

        if (cancelled) return;

        const validRecords = (data ?? []).filter((record) => {
          const score = Number(record.score);
          const total = Number(record.total_questions);

          return (
            typeof record.id === "string" &&
            Number.isInteger(score) &&
            Number.isInteger(total) &&
            score >= 0 &&
            score <= TOTAL_QUESTIONS &&
            total === TOTAL_QUESTIONS
          );
        });

        setRecords(
          validRecords.map((record) => ({
            id: record.id,
            score: Number(record.score),
            total_questions: Number(record.total_questions),
            completed_at: record.completed_at,
            started_at: record.started_at,
          }))
        );
      } catch (err) {
        console.error("Error loading Championship history:", err);

        if (!cancelled) {
          setError(
            isTagalog
              ? "Hindi ma-load ang iyong mga nakaraang record. Pakisubukang muli."
              : "Unable to load your previous records. Please try again."
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadHistory();

    return () => {
      cancelled = true;
    };
  }, [user?.id, authLoading, isTagalog]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return isTagalog ? "Hindi available" : "Not available";
    }

    const date = new Date(dateString);

    if (Number.isNaN(date.getTime())) {
      return isTagalog ? "Hindi available" : "Not available";
    }

    return new Intl.DateTimeFormat(
      isTagalog ? "fil-PH" : "en-US",
      {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
      }
    ).format(date);
  };

  const getPercentage = (record: ChampionshipHistoryRecord) => {
    if (record.total_questions <= 0) return 0;

    return Math.round(
      (record.score / record.total_questions) * 100
    );
  };

  const hasPassed = (record: ChampionshipHistoryRecord) => {
    return getPercentage(record) >= PASSING_PERCENTAGE;
  };

  const handleViewSummary = (attemptId: string) => {
    navigate(
      `/championshipsummary?attempt=${encodeURIComponent(attemptId)}`
    );
  };

  const handleBack = () => {
    navigate("/categories");
  };

  const handleChampionship = () => {
    navigate("/championship");
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 px-6">
        <Loader2 className="w-12 h-12 text-indigo-600 animate-spin mb-4" />

        <p className="text-gray-600 font-medium">
          {isTagalog
            ? "Kinukuha ang iyong mga nakaraang record..."
            : "Loading your Championship history..."}
        </p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-gray-100 p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>

          <h1 className="text-2xl font-bold text-gray-800 mb-3">
            {isTagalog
              ? "Hindi Ma-load ang History"
              : "History Unavailable"}
          </h1>

          <p className="text-gray-600 leading-relaxed mb-7">
            {error}
          </p>

          <button
            onClick={handleBack}
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

        {/* Back button */}
        <button
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-xl px-3 py-2 text-gray-600 transition hover:bg-white hover:text-indigo-700"
        >
          <ArrowLeft size={20} />

          <span className="font-medium">
            {isTagalog
              ? "Bumalik sa Categories"
              : "Back to Categories"}
          </span>
        </button>

        {/* Page header */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-xl border border-gray-100">

          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-9 text-center text-white sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <History size={34} />
            </div>

            <h1 className="text-3xl font-extrabold sm:text-4xl">
              {isTagalog
                ? "Mga Nakaraang Championship"
                : "Championship History"}
            </h1>

            <p className="mt-3 text-sm text-indigo-100 sm:text-base">
              {isTagalog
                ? "Tingnan ang iyong mga nakaraang marka at resulta."
                : "Review your previous scores and Championship results."}
            </p>
          </div>

          {/* History statistics */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">

            <div className="rounded-2xl bg-indigo-50 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                <BookOpen className="h-5 w-5 text-indigo-600" />
              </div>

              <p className="text-sm font-medium text-indigo-600">
                {isTagalog
                  ? "Kabuuang Attempt"
                  : "Total Attempts"}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-indigo-800">
                {records.length}
              </p>
            </div>

            <div className="rounded-2xl bg-green-50 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>

              <p className="text-sm font-medium text-green-700">
                {isTagalog
                  ? "Naipasa"
                  : "Passed"}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-green-700">
                {records.filter(hasPassed).length}
              </p>
            </div>

            <div className="rounded-2xl bg-red-50 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-5 w-5 text-red-600" />
              </div>

              <p className="text-sm font-medium text-red-700">
                {isTagalog
                  ? "Hindi Naipasa"
                  : "Not Passed"}
              </p>

              <p className="mt-2 text-3xl font-extrabold text-red-700">
                {records.filter((record) => !hasPassed(record)).length}
              </p>
            </div>

          </div>
        </div>

        {/* History list */}
        <section>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                {isTagalog
                  ? "Iyong mga Record"
                  : "Your Records"}
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                {isTagalog
                  ? "Nakaayos mula sa pinakabago."
                  : "Sorted from newest to oldest."}
              </p>
            </div>

            <span className="rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">
              {records.length} {isTagalog ? "Record" : "Records"}
            </span>
          </div>

          {records.length === 0 ? (
            <div className="rounded-3xl border border-gray-100 bg-white px-6 py-12 text-center shadow-lg sm:px-12">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-indigo-100">
                <History className="h-10 w-10 text-indigo-500" />
              </div>

              <h3 className="text-2xl font-extrabold text-gray-800">
                {isTagalog
                  ? "Wala Pang Record"
                  : "No Previous Records"}
              </h3>

              <p className="mx-auto mt-3 max-w-md text-gray-500">
                {isTagalog
                  ? "Wala ka pang natapos na Championship attempt. Kumpletuhin ang iyong unang Championship upang makita rito ang iyong resulta."
                  : "You have not completed a Championship attempt yet. Finish your first Championship to see your results here."}
              </p>

              <button
                onClick={handleChampionship}
                className="mt-7 inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-7 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700"
              >
                <Trophy size={18} />

                {isTagalog
                  ? "Simulan ang Championship"
                  : "Start Championship"}
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {records.map((record, index) => {
                const percentage = getPercentage(record);
                const passed = hasPassed(record);

                return (
                  <article
                    key={record.id}
                    className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-md transition hover:shadow-lg"
                  >
                    <div className="p-5 sm:p-6">

                      {/* Attempt header */}
                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-indigo-100">
                            <Medal className="h-6 w-6 text-indigo-600" />
                          </div>

                          <div>
                            <h3 className="text-lg font-bold text-gray-800">
                              {isTagalog
                                ? `Attempt #${records.length - index}`
                                : `Attempt #${records.length - index}`}
                            </h3>

                            <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                              <CalendarDays size={15} />

                              <span>
                                {formatDate(record.completed_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-2 text-xs font-bold ${
                            passed
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {passed ? (
                            <CheckCircle2 size={15} />
                          ) : (
                            <XCircle size={15} />
                          )}

                          {passed
                            ? isTagalog
                              ? "NAIPASA"
                              : "PASSED"
                            : isTagalog
                              ? "HINDI NAIPASA"
                              : "NOT PASSED"}
                        </span>

                      </div>

                      {/* Score and percentage */}
                      <div className="grid grid-cols-2 gap-3 mb-5">

                        <div className="rounded-xl bg-indigo-50 p-4">
                          <p className="text-xs font-semibold text-indigo-500">
                            {isTagalog
                              ? "TAMANG SAGOT"
                              : "CORRECT ANSWERS"}
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-indigo-800">
                            {record.score}
                            <span className="text-base font-semibold text-indigo-400">
                              /{record.total_questions}
                            </span>
                          </p>
                        </div>

                        <div className="rounded-xl bg-purple-50 p-4">
                          <p className="text-xs font-semibold text-purple-500">
                            {isTagalog
                              ? "PORSYENTO"
                              : "PERCENTAGE"}
                          </p>

                          <p className="mt-1 text-2xl font-extrabold text-purple-800">
                            {percentage}%
                          </p>
                        </div>

                      </div>

                      {/* Score progress */}
                      <div className="mb-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-gray-500">
                          <span>
                            {isTagalog
                              ? "Iskor"
                              : "Score"}
                          </span>

                          <span>
                            {isTagalog
                              ? "Kailangan: 75%"
                              : "Required: 75%"}
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
                              width: `${Math.min(
                                100,
                                Math.max(0, percentage)
                              )}%`,
                            }}
                          />
                        </div>
                      </div>

                      {/* View summary */}
                      <button
                        onClick={() => handleViewSummary(record.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white transition hover:bg-indigo-700 active:scale-[0.99]"
                      >
                        <BookOpen size={18} />

                        {isTagalog
                          ? "Tingnan ang Buod"
                          : "View Summary"}
                      </button>

                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Bottom navigation */}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">

          <button
            onClick={handleBack}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3.5 font-semibold text-gray-700 shadow-sm transition hover:bg-gray-50"
          >
            <ArrowLeft size={18} />

            {isTagalog
              ? "Bumalik sa Categories"
              : "Back to Categories"}
          </button>

          <button
            onClick={handleChampionship}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-6 py-3.5 font-semibold text-white shadow-md transition hover:bg-indigo-700"
          >
            <RotateCcw size={18} />

            {isTagalog
              ? "Pumunta sa Championship"
              : "Go to Championship"}
          </button>

        </div>
      </div>
    </div>
  );
}
