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
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-6">
        <Loader2 className="w-12 h-12 text-[#36A9F4] animate-spin mb-4" />

        <p className="text-[#164B9B] font-black">
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] p-6">
        <div className="w-full max-w-lg rounded-3xl bg-white shadow-xl border border-[#B8DDF6] p-8 text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-100">
            <AlertCircle className="h-8 w-8 text-rose-600" />
          </div>

          <h1 className="text-2xl font-black text-[#164B9B] mb-3">
            {isTagalog
              ? "Hindi Ma-load ang History"
              : "History Unavailable"}
          </h1>

          <p className="text-slate-600 font-medium leading-relaxed mb-7">
            {error}
          </p>

          <button
            type="button"
            onClick={handleBack}
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

        {/* Back button */}
        <button
          type="button"
          onClick={handleBack}
          className="mb-6 inline-flex items-center gap-2 rounded-2xl border-b-4 border-[#B8DDF6] bg-white px-4 py-3 font-extrabold text-[#36A9F4] shadow-sm transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
        >
          <ArrowLeft size={20} strokeWidth={2.5} />
          <span>
            {isTagalog
              ? "Bumalik sa Categories"
              : "Back to Categories"}
          </span>
        </button>

        {/* Page header */}
        <div className="mb-8 overflow-hidden rounded-3xl bg-white shadow-sm border border-[#B8DDF6]">

          <div className="bg-linear-to-r from-[#36A9F4] to-[#164B9B] px-6 py-9 text-center text-white sm:px-10">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20">
              <History size={34} />
            </div>

            <h1 className="text-3xl font-black sm:text-4xl">
              {isTagalog
                ? "Mga Nakaraang Championship"
                : "Championship History"}
            </h1>

            <p className="mt-2 text-sm text-sky-100 font-medium sm:text-base">
              {isTagalog
                ? "Tingnan ang iyong mga nakaraang marka at resulta."
                : "Review your previous scores and Championship results."}
            </p>
          </div>

          {/* History statistics */}
          <div className="grid grid-cols-1 gap-4 p-6 sm:grid-cols-3 sm:p-8">

            <div className="rounded-2xl bg-sky-50 border border-sky-100 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-sky-100">
                <BookOpen className="h-5 w-5 text-[#36A9F4]" />
              </div>

              <p className="text-xs font-black text-[#164B9B] uppercase tracking-wide">
                {isTagalog
                  ? "Kabuuang Attempt"
                  : "Total Attempts"}
              </p>

              <p className="mt-2 text-3xl font-black text-[#164B9B]">
                {records.length}
              </p>
            </div>

            <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>

              <p className="text-xs font-black text-emerald-700 uppercase tracking-wide">
                {isTagalog
                  ? "Naipasa"
                  : "Passed"}
              </p>

              <p className="mt-2 text-3xl font-black text-emerald-700">
                {records.filter(hasPassed).length}
              </p>
            </div>

            <div className="rounded-2xl bg-rose-50 border border-rose-100 p-5 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-rose-100">
                <XCircle className="h-5 w-5 text-rose-600" />
              </div>

              <p className="text-xs font-black text-rose-700 uppercase tracking-wide">
                {isTagalog
                  ? "Hindi Naipasa"
                  : "Not Passed"}
              </p>

              <p className="mt-2 text-3xl font-black text-rose-700">
                {records.filter((record) => !hasPassed(record)).length}
              </p>
            </div>

          </div>
        </div>

        {/* History list */}
        <section>

          <div className="mb-5 flex items-center justify-between gap-3">
            <div>
              <h2 className="text-xl font-black text-[#164B9B]">
                {isTagalog
                  ? "Iyong mga Record"
                  : "Your Records"}
              </h2>

              <p className="mt-0.5 text-sm font-medium text-slate-600">
                {isTagalog
                  ? "Nakaayos mula sa pinakabago."
                  : "Sorted from newest to oldest."}
              </p>
            </div>

            <span className="rounded-full bg-sky-100 px-4 py-1.5 text-xs font-black text-[#164B9B]">
              {records.length} {isTagalog ? "Record" : "Records"}
            </span>
          </div>

          {records.length === 0 ? (
            <div className="rounded-3xl border border-[#B8DDF6] bg-white px-6 py-12 text-center shadow-sm sm:px-12">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-sky-100">
                <History className="h-10 w-10 text-[#36A9F4]" />
              </div>

              <h3 className="text-2xl font-black text-[#164B9B]">
                {isTagalog
                  ? "Wala Pang Record"
                  : "No Previous Records"}
              </h3>

              <p className="mx-auto mt-2 max-w-md text-slate-600 font-medium">
                {isTagalog
                  ? "Wala ka pang natapos na Championship attempt. Kumpletuhin ang iyong unang Championship upang makita rito ang iyong resulta."
                  : "You have not completed a Championship attempt yet. Finish your first Championship to see your results here."}
              </p>

              <button
                type="button"
                onClick={handleChampionship}
                className="mt-6 inline-flex items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-7 py-3.5 font-extrabold text-white shadow-sm transition hover:bg-sky-600 active:translate-y-0.5 active:border-b-2"
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
                    className="overflow-hidden rounded-3xl border border-[#B8DDF6] bg-white shadow-sm transition hover:shadow-md"
                  >
                    <div className="p-5 sm:p-6">

                      {/* Attempt header */}
                      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

                        <div className="flex items-center gap-3">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E5D3FF] text-[#A45CE8]">
                            <Medal className="h-6 w-6" />
                          </div>

                          <div>
                            <h3 className="text-lg font-black text-[#164B9B]">
                              {isTagalog
                                ? `Attempt #${records.length - index}`
                                : `Attempt #${records.length - index}`}
                            </h3>

                            <div className="mt-0.5 flex items-center gap-2 text-sm font-medium text-slate-500">
                              <CalendarDays size={15} />

                              <span>
                                {formatDate(record.completed_at)}
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`inline-flex w-fit items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-black ${
                            passed
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-rose-100 text-rose-700"
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

                        <div className="rounded-2xl bg-sky-50 border border-sky-100 p-4">
                          <p className="text-xs font-black text-[#164B9B] uppercase tracking-wide">
                            {isTagalog
                              ? "TAMANG SAGOT"
                              : "CORRECT ANSWERS"}
                          </p>

                          <p className="mt-1 text-2xl font-black text-[#164B9B]">
                            {record.score}
                            <span className="text-base font-extrabold text-sky-400">
                              /{record.total_questions}
                            </span>
                          </p>
                        </div>

                        <div className="rounded-2xl bg-purple-50 border border-purple-100 p-4">
                          <p className="text-xs font-black text-[#A45CE8] uppercase tracking-wide">
                            {isTagalog
                              ? "PORSYENTO"
                              : "PERCENTAGE"}
                          </p>

                          <p className="mt-1 text-2xl font-black text-[#A45CE8]">
                            {percentage}%
                          </p>
                        </div>

                      </div>

                      {/* Score progress */}
                      <div className="mb-5">
                        <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-500">
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

                        <div className="h-3 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full transition-all ${
                              passed
                                ? "bg-emerald-500"
                                : "bg-rose-500"
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
                        type="button"
                        onClick={() => handleViewSummary(record.id)}
                        className="flex w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-[#79C5FA] bg-[#91D1FF] px-5 py-3.5 font-black text-white transition hover:bg-[#70BFFF] active:translate-y-0.5 active:border-b-2"
                      >
                        <BookOpen size={18} strokeWidth={2.5} />

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
            type="button"
            onClick={handleBack}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-[#B8DDF6] bg-white px-6 py-4 font-black text-[#36A9F4] shadow-sm transition hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
          >
            <ArrowLeft size={20} strokeWidth={2.5} />

            {isTagalog
              ? "Bumalik sa Categories"
              : "Back to Categories"}
          </button>

          <button
            type="button"
            onClick={handleChampionship}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-6 py-4 font-black text-white shadow-sm transition hover:bg-sky-600 active:translate-y-0.5 active:border-b-2"
          >
            <RotateCcw size={20} strokeWidth={2.5} />

            {isTagalog
              ? "Pumunta sa Championship"
              : "Go to Championship"}
          </button>

        </div>
      </div>
    </main>
  );
}