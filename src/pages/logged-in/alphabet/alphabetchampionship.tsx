
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  CheckCircle,
  Loader2,
  RotateCcw,
  XCircle,
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

type AssessmentAttempt = {
  id: string;
  user_id: string;
  assessment_type: string;
  part_key: string | null;
  checkpoint_number: number | null;
  questions: ChampionshipQuestion[];
  answers: ChampionshipAnswer[];
  score: number | null;
  total_questions: number;
  status: "in_progress" | "completed";
  started_at: string;
  completed_at: string | null;
};

const VIDEO_URL = "/videos/FSLalphabet.mp4";

const TOTAL_QUESTIONS = 26;
const PASSING_PERCENTAGE = 75;
const PASSING_SCORE = Math.ceil(
  (TOTAL_QUESTIONS * PASSING_PERCENTAGE) / 100
);

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const ALPHABET_TIMESTAMPS: Record<
  string,
  { start: number; end: number }
> = {
  A: { start: 5, end: 7 },
  B: { start: 8, end: 10 },
  C: { start: 11, end: 13 },
  D: { start: 13, end: 15 },
  E: { start: 15, end: 17 },
  F: { start: 18, end: 20 },
  G: { start: 20, end: 22 },
  H: { start: 22, end: 24 },
  I: { start: 24, end: 25 },
  J: { start: 25, end: 27 },
  K: { start: 28, end: 29 },
  L: { start: 30, end: 31 },
  M: { start: 32, end: 34 },
  N: { start: 34, end: 36 },
  O: { start: 37, end: 39 },
  P: { start: 39, end: 41 },
  Q: { start: 41, end: 43 },
  R: { start: 43, end: 45 },
  S: { start: 45, end: 47 },
  T: { start: 47, end: 49 },
  U: { start: 50, end: 52 },
  V: { start: 52, end: 53 },
  W: { start: 54, end: 55 },
  X: { start: 56, end: 57 },
  Y: { start: 58, end: 59 },
  Z: { start: 60, end: 63 },
};

/* Fisher-Yates shuffle. */
const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
};

/* Creates a new shuffled Championship question set.
   Existing attempts always use their saved question order. */
const createChampionshipQuestions = (): ChampionshipQuestion[] => {
  const shuffledLetters = shuffleArray(ALPHABET);

  return shuffledLetters.map((letter) => {
    const distractors = shuffleArray(
      ALPHABET.filter((item) => item !== letter)
    ).slice(0, 3);

    const options = shuffleArray([letter, ...distractors]);

    return {
      id: `championship-${letter}`,
      letter,
      answer: letter,
      options,
      question_en: "Which letter matches this FSL sign?",
      question_tl: "Anong titik ang ipinapakita sa senyas na ito?",
    };
  });
};

const normalizeQuestions = (value: unknown): ChampionshipQuestion[] => {
  if (!Array.isArray(value)) return [];

  return value as ChampionshipQuestion[];
};

const normalizeAnswers = (value: unknown): ChampionshipAnswer[] => {
  if (!Array.isArray(value)) return [];

  return value as ChampionshipAnswer[];
};

export default function Championship() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Use the same authentication context as the other alphabet pages.
  const { user, loading: authLoading } = useAuth();

  const isTagalog = language === "tl";

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const loadingRef = useRef(false);
  const savingRef = useRef(false);
  const initializedRef = useRef(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [questions, setQuestions] = useState<ChampionshipQuestion[]>([]);
  const [answers, setAnswers] = useState<ChampionshipAnswer[]>([]);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [videoEnded, setVideoEnded] = useState(false);

  const currentQuestionIndex = answers.length;

  const currentQuestion = useMemo(() => {
    if (
      currentQuestionIndex < 0 ||
      currentQuestionIndex >= questions.length
    ) {
      return null;
    }

    return questions[currentQuestionIndex];
  }, [questions, currentQuestionIndex]);

  const currentTimestamp = currentQuestion
    ? ALPHABET_TIMESTAMPS[currentQuestion.letter]
    : null;

  const score = useMemo(
    () => answers.filter((answer) => answer.is_correct).length,
    [answers]
  );

  const progressPercentage =
    questions.length > 0
      ? Math.min((answers.length / questions.length) * 100, 100)
      : 0;

  const text = {
    loading: isTagalog
      ? "Inihahanda ang Championship..."
      : "Preparing your Championship...",

    title: "CHAMPIONSHIP",

    subtitle: isTagalog
      ? "Subukan ang iyong kaalaman sa lahat ng 26 na titik ng FSL alphabet."
      : "Test your knowledge of all 26 letters of the FSL alphabet.",

    question: isTagalog
      ? "Anong titik ang ipinapakita sa senyas na ito?"
      : "Which letter matches this FSL sign?",

    questionCount: isTagalog
      ? `Tanong ${Math.min(answers.length + 1, TOTAL_QUESTIONS)} sa ${TOTAL_QUESTIONS}`
      : `Question ${Math.min(answers.length + 1, TOTAL_QUESTIONS)} of ${TOTAL_QUESTIONS}`,

    chooseAnswer: isTagalog
      ? "Piliin ang tamang titik."
      : "Choose the correct letter.",

    correct: isTagalog ? "Tama ang sagot!" : "Correct answer!",

    incorrect: isTagalog ? "Hindi ito ang tamang sagot." : "Not quite!",

    correctAnswer: isTagalog ? "Tamang sagot:" : "Correct answer:",

    watchAgain: isTagalog ? "PANOORIN MULI" : "WATCH AGAIN",

    next: isTagalog ? "SUSUNOD" : "NEXT",

    finish: isTagalog ? "TAPUSIN" : "FINISH",

    saving: isTagalog ? "Sine-save..." : "Saving...",

    back: isTagalog ? "BUMALIK" : "GO BACK",

    videoUnavailable: isTagalog
      ? "Hindi ma-play ang video. Pakisubukang muli."
      : "The video could not be played. Please try again.",

    errorTitle: isTagalog
      ? "May nangyaring problema"
      : "Something went wrong",

    retryLoading: isTagalog ? "SUBUKAN MULI" : "TRY AGAIN",

    loadingAttempt: isTagalog
      ? "Binubuksan ang iyong kasalukuyang pagsusulit..."
      : "Loading your current assessment...",

    savingProgress: isTagalog
      ? "Sine-save ang iyong progreso..."
      : "Saving your progress...",

    progressSaved: isTagalog
      ? "Nai-save ang iyong progreso."
      : "Your progress is saved.",

    instruction: isTagalog
      ? "Panoorin ang senyas at piliin ang titik na tumutugma rito."
      : "Watch the sign and select the letter that matches it.",
  };

  /* ---------------------------------------------------------
     COMPLETE AN ATTEMPT
  --------------------------------------------------------- */

  const completeAttempt = useCallback(
    async (
      id: string,
      finalAnswers: ChampionshipAnswer[]
    ) => {
      const finalScore = finalAnswers.filter(
        (answer) => answer.is_correct
      ).length;

      const { error: updateError } = await supabase
        .from("alphabet_assessment_attempts")
        .update({
          answers: finalAnswers,
          score: finalScore,
          total_questions: TOTAL_QUESTIONS,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("assessment_type", "championship")
        .eq("part_key", "3")
        .eq("status", "in_progress");

      if (updateError) {
        console.error("Championship completion error:", updateError);

        setError(
          isTagalog
            ? "Hindi ma-save ang resulta. Pakisubukang muli."
            : "Your result could not be saved. Please try again."
        );

        return;
      }

      navigate(`/alphabetcomplete?attempt=${encodeURIComponent(id)}`);
    },
    [navigate, isTagalog]
  );

  /* ---------------------------------------------------------
     LOAD OR CREATE THE CHAMPIONSHIP ATTEMPT
  --------------------------------------------------------- */

  const loadChampionship = useCallback(async () => {
    // Wait until the shared authentication context finishes loading.
    if (authLoading || loadingRef.current) return;

    loadingRef.current = true;
    setLoading(true);
    setError("");

    try {
      /*
       * Use the authenticated user supplied by AuthContext.
       * Do not independently request the Supabase user here.
       */
      if (!user) {
        throw new Error(
          isTagalog
            ? "Hindi makita ang iyong learner account. Mag-login muli."
            : "Your learner account could not be found. Please log in again."
        );
      }

      const userId = user.id;

      /*
       * Find the learner's latest unfinished Championship attempt.
       * This allows the learner to continue after leaving,
       * refreshing, or reopening the page.
       */
      const { data: existingAttempt, error: attemptError } =
        await supabase
          .from("alphabet_assessment_attempts")
          .select("*")
          .eq("user_id", userId)
          .eq("assessment_type", "championship")
          .eq("part_key", "3")
          .eq("status", "in_progress")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

      if (attemptError) {
        throw attemptError;
      }

      let activeAttempt: AssessmentAttempt;

      if (existingAttempt) {
        const savedQuestions = normalizeQuestions(
          existingAttempt.questions
        );

        const savedAnswers = normalizeAnswers(existingAttempt.answers);

        if (
          savedQuestions.length !== TOTAL_QUESTIONS ||
          savedAnswers.length > TOTAL_QUESTIONS
        ) {
          throw new Error(
            isTagalog
              ? "Hindi wasto ang naka-save na Championship attempt."
              : "The saved Championship attempt is invalid."
          );
        }

        activeAttempt = {
          ...existingAttempt,
          questions: savedQuestions,
          answers: savedAnswers,
        } as AssessmentAttempt;
      } else {
        /*
         * No unfinished attempt exists.
         * Create a new shuffled set of all 26 letters.
         */
        const newQuestions = createChampionshipQuestions();

        const { data: insertedAttempt, error: insertError } =
          await supabase
            .from("alphabet_assessment_attempts")
            .insert({
              user_id: userId,
              assessment_type: "championship",
              part_key: "3",
              checkpoint_number: null,
              questions: newQuestions,
              answers: [],
              score: null,
              total_questions: TOTAL_QUESTIONS,
              status: "in_progress",
            })
            .select("*")
            .single();

        if (insertError) {
          throw insertError;
        }

        activeAttempt = {
          ...insertedAttempt,
          questions: normalizeQuestions(insertedAttempt.questions),
          answers: normalizeAnswers(insertedAttempt.answers),
        } as AssessmentAttempt;
      }

      setAttemptId(activeAttempt.id);
      setQuestions(activeAttempt.questions);
      setAnswers(activeAttempt.answers);

      /*
       * If all 26 answers were saved but the learner left before
       * completing the attempt, complete it automatically.
       */
      if (
        activeAttempt.answers.length === TOTAL_QUESTIONS &&
        activeAttempt.questions.length === TOTAL_QUESTIONS
      ) {
        await completeAttempt(
          activeAttempt.id,
          activeAttempt.answers
        );
      }
    } catch (loadError) {
      console.error("Error loading Championship:", loadError);

      setError(
        loadError instanceof Error
          ? loadError.message
          : text.errorTitle
      );
    } finally {
      setLoading(false);
      loadingRef.current = false;
    }
  }, [
    authLoading,
    user,
    completeAttempt,
    isTagalog,
    text.errorTitle,
  ]);

  /*
   * Initialize only after AuthContext finishes checking the session.
   * This prevents the page from treating a still-loading user as logged out.
   */
  useEffect(() => {
    if (authLoading) return;
    if (initializedRef.current) return;

    initializedRef.current = true;
    void loadChampionship();
  }, [authLoading, loadChampionship]);

  /* ---------------------------------------------------------
     VIDEO PLAYBACK
  --------------------------------------------------------- */

  const playCurrentSegment = useCallback(() => {
    const video = videoRef.current;

    if (!video || !currentTimestamp) return;

    setVideoEnded(false);

    video.currentTime = currentTimestamp.start;

    const playPromise = video.play();

    if (playPromise !== undefined) {
      playPromise.catch((playError) => {
        console.error("Video playback error:", playError);
      });
    }
  }, [currentTimestamp]);

  useEffect(() => {
    if (!currentQuestion || !currentTimestamp || loading) return;

    const video = videoRef.current;

    if (!video) return;

    const startPlayback = () => {
      video.currentTime = currentTimestamp.start;
      setVideoEnded(false);

      const playPromise = video.play();

      if (playPromise !== undefined) {
        playPromise.catch((playError) => {
          console.error("Video playback error:", playError);
        });
      }
    };

    if (video.readyState >= 1) {
      startPlayback();
    } else {
      video.addEventListener("loadedmetadata", startPlayback, {
        once: true,
      });
    }

    return () => {
      video.removeEventListener("loadedmetadata", startPlayback);
      video.pause();
    };
  }, [currentQuestion, currentTimestamp, loading]);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;

    if (!video || !currentTimestamp) return;

    if (video.currentTime >= currentTimestamp.end) {
      video.pause();
      video.currentTime = currentTimestamp.end;
      setVideoEnded(true);
    }
  };

  const handleVideoError = () => {
    setError(text.videoUnavailable);
  };

  /* ---------------------------------------------------------
     SAVE EACH ANSWER
  --------------------------------------------------------- */

  const handleAnswer = async (option: string) => {
    if (
      !currentQuestion ||
      !attemptId ||
      savingRef.current ||
      showFeedback ||
      answers.length >= TOTAL_QUESTIONS
    ) {
      return;
    }

    savingRef.current = true;
    setSaving(true);
    setError("");

    const isCorrect = option === currentQuestion.answer;

    const newAnswer: ChampionshipAnswer = {
      question_id: currentQuestion.id,
      question_index: currentQuestionIndex,
      selected_answer: option,
      correct_answer: currentQuestion.answer,
      is_correct: isCorrect,
      answered_at: new Date().toISOString(),
    };

    const updatedAnswers = [...answers, newAnswer];

    try {
      /*
       * Save the answer immediately.
       * The answers array identifies the next unanswered question
       * when the learner returns to the page.
       */
      const { error: saveError } = await supabase
        .from("alphabet_assessment_attempts")
        .update({
          answers: updatedAnswers,
        })
        .eq("id", attemptId)
        .eq("user_id", user?.id ?? "")
        .eq("assessment_type", "championship")
        .eq("part_key", "3")
        .eq("status", "in_progress");

      if (saveError) {
        throw saveError;
      }

      setAnswers(updatedAnswers);
      setSelectedAnswer(option);
      setShowFeedback(true);
    } catch (saveError) {
      console.error("Error saving Championship answer:", saveError);

      setError(
        isTagalog
          ? "Hindi na-save ang iyong sagot. Pakisubukang muli."
          : "Your answer could not be saved. Please try again."
      );
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  /* ---------------------------------------------------------
     NEXT QUESTION / FINISH CHAMPIONSHIP
  --------------------------------------------------------- */

  const handleNext = async () => {
    if (savingRef.current || saving || !attemptId) return;

    if (answers.length === TOTAL_QUESTIONS) {
      await completeAttempt(attemptId, answers);
      return;
    }

    setSelectedAnswer(null);
    setShowFeedback(false);
    setVideoEnded(false);
  };

  /* ---------------------------------------------------------
     WATCH THE CURRENT SIGN AGAIN
  --------------------------------------------------------- */

  const handleWatchAgain = () => {
    playCurrentSegment();
  };

  /* ---------------------------------------------------------
     LOADING SCREEN
  --------------------------------------------------------- */

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#fff8ed] px-6">
        <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />

        <h2 className="text-xl font-bold text-[#5b3525] text-center">
          {text.loading}
        </h2>

        <p className="text-sm text-[#8b6b58] mt-2 text-center">
          {text.loadingAttempt}
        </p>
      </div>
    );
  }

  /* ---------------------------------------------------------
     ERROR SCREEN
  --------------------------------------------------------- */

  if (error && !currentQuestion) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fff8ed] px-5">
        <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl text-center">
          <XCircle className="w-14 h-14 text-red-500 mx-auto mb-4" />

          <h2 className="text-2xl font-extrabold text-[#5b3525] mb-3">
            {text.errorTitle}
          </h2>

          <p className="text-[#806452] mb-6">{error}</p>

          <button
            onClick={() => {
              if (loadingRef.current) return;

              initializedRef.current = false;
              void loadChampionship();
            }}
            className="w-full rounded-xl bg-orange-500 px-6 py-3 font-bold text-white hover:bg-orange-600 transition"
          >
            {text.retryLoading}
          </button>

          <button
            onClick={() => navigate("/alphabet")}
            className="w-full mt-3 rounded-xl border-2 border-orange-200 px-6 py-3 font-bold text-[#80543b] hover:bg-orange-50 transition"
          >
            {text.back}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) {
    return null;
  }

  /* ---------------------------------------------------------
     MAIN CHAMPIONSHIP PAGE
  --------------------------------------------------------- */

  return (
    <div className="min-h-screen bg-[#fff8ed] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-5xl">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => navigate("/alphabet")}
            className="inline-flex items-center gap-2 rounded-xl border-2 border-orange-200 bg-white px-4 py-2.5 font-bold text-[#80543b] shadow-sm hover:bg-orange-50 transition"
          >
            <ArrowLeft size={18} />
            <span>{text.back}</span>
          </button>

          <div className="flex items-center gap-2 rounded-full bg-yellow-100 px-4 py-2 text-yellow-800">
            <Award size={20} />
            <span className="font-extrabold tracking-wide">
              {text.title}
            </span>
          </div>
        </div>

        {/* TITLE AND DESCRIPTION */}
        <div className="text-center mb-7">
          <h1 className="text-3xl sm:text-4xl font-black text-[#593725] tracking-wide">
            {text.title}
          </h1>

          <p className="mt-2 text-sm sm:text-base text-[#8b6b58] max-w-2xl mx-auto">
            {text.subtitle}
          </p>
        </div>

        {/* PROGRESS */}
        <div className="rounded-2xl bg-white p-4 sm:p-5 shadow-md border border-orange-100 mb-6">
          <div className="flex items-center justify-between gap-3 mb-3">
            <span className="font-extrabold text-[#65432f]">
              {text.questionCount}
            </span>

            <span className="text-sm font-bold text-orange-600">
              {answers.length}/{TOTAL_QUESTIONS}
            </span>
          </div>

          <div className="h-3 w-full overflow-hidden rounded-full bg-orange-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-orange-400 to-yellow-400 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-[#9a7b67]">
            <span>
              {isTagalog ? "Tamang sagot" : "Correct answers"}: {score}
            </span>

            <span>
              {isTagalog
                ? `Kailangang puntos: ${PASSING_SCORE}`
                : `Passing score: ${PASSING_SCORE}`}
            </span>
          </div>
        </div>

        {/* QUESTION CARD */}
        <div className="rounded-3xl bg-white p-4 sm:p-7 shadow-xl border border-orange-100">
          <div className="text-center mb-5">
            <span className="inline-block rounded-full bg-orange-100 px-4 py-1.5 text-xs sm:text-sm font-extrabold tracking-wider text-orange-700">
              CHAMPIONSHIP TEST
            </span>

            <h2 className="mt-4 text-xl sm:text-2xl font-extrabold text-[#593725]">
              {text.question}
            </h2>

            <p className="mt-2 text-sm text-[#9a7b67]">
              {text.instruction}
            </p>
          </div>

          {/* VIDEO */}
          <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-lg">
            <video
              ref={videoRef}
              src={VIDEO_URL}
              className="block w-full aspect-video object-contain"
              playsInline
              preload="auto"
              onTimeUpdate={handleVideoTimeUpdate}
              onError={handleVideoError}
            />
          </div>

          {/* VIDEO CONTROLS */}
          <div className="mt-4 flex justify-center">
            <button
              onClick={handleWatchAgain}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl border-2 border-orange-300 bg-orange-50 px-5 py-2.5 text-sm font-extrabold text-orange-700 hover:bg-orange-100 disabled:opacity-50 transition"
            >
              <RotateCcw size={17} />
              {text.watchAgain}
            </button>
          </div>

          {/* ANSWER OPTIONS */}
          <div className="mt-7">
            <p className="text-center text-sm font-bold text-[#8b6b58] mb-4">
              {text.chooseAnswer}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {currentQuestion.options.map((option) => {
                const isSelected = selectedAnswer === option;

                const isCorrectOption =
                  showFeedback && option === currentQuestion.answer;

                const isWrongSelection =
                  showFeedback &&
                  isSelected &&
                  option !== currentQuestion.answer;

                let optionClass =
                  "border-orange-200 bg-[#fffaf3] text-[#65432f] hover:border-orange-400 hover:bg-orange-50";

                if (isCorrectOption) {
                  optionClass =
                    "border-green-500 bg-green-100 text-green-800";
                } else if (isWrongSelection) {
                  optionClass = "border-red-400 bg-red-100 text-red-800";
                } else if (isSelected) {
                  optionClass =
                    "border-orange-500 bg-orange-100 text-orange-800";
                }

                return (
                  <button
                    key={option}
                    onClick={() => void handleAnswer(option)}
                    disabled={showFeedback || saving}
                    className={`min-h-20 sm:min-h-24 rounded-2xl border-2 text-3xl sm:text-4xl font-black shadow-sm transition ${optionClass} disabled:cursor-not-allowed`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>

          {/* FEEDBACK */}
          {showFeedback && (
            <div
              className={`mt-6 rounded-2xl border-2 p-4 sm:p-5 ${
                selectedAnswer === currentQuestion.answer
                  ? "border-green-200 bg-green-50"
                  : "border-red-200 bg-red-50"
              }`}
            >
              <div className="flex items-center gap-3">
                {selectedAnswer === currentQuestion.answer ? (
                  <CheckCircle className="h-8 w-8 shrink-0 text-green-600" />
                ) : (
                  <XCircle className="h-8 w-8 shrink-0 text-red-500" />
                )}

                <div>
                  <h3
                    className={`font-extrabold text-lg ${
                      selectedAnswer === currentQuestion.answer
                        ? "text-green-800"
                        : "text-red-700"
                    }`}
                  >
                    {selectedAnswer === currentQuestion.answer
                      ? text.correct
                      : text.incorrect}
                  </h3>

                  {selectedAnswer !== currentQuestion.answer && (
                    <p className="mt-1 text-sm text-red-700">
                      {text.correctAnswer}{" "}
                      <strong className="text-lg">
                        {currentQuestion.answer}
                      </strong>
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* SAVE STATUS / ERROR */}
          {saving && (
            <div className="mt-4 flex items-center justify-center gap-2 text-sm font-semibold text-orange-600">
              <Loader2 size={17} className="animate-spin" />
              {text.saving}
            </div>
          )}

          {error && currentQuestion && (
            <p className="mt-4 text-center text-sm font-semibold text-red-600">
              {error}
            </p>
          )}

          {/* NEXT / FINISH */}
          {showFeedback && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => void handleNext()}
                disabled={saving}
                className="inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-orange-500 px-8 py-3.5 font-extrabold text-white shadow-md hover:bg-orange-600 disabled:opacity-50 transition"
              >
                {answers.length === TOTAL_QUESTIONS
                  ? text.finish
                  : text.next}

                <ArrowRight size={19} />
              </button>
            </div>
          )}
        </div>

        {/* FOOTER */}
        <div className="mt-5 text-center text-xs sm:text-sm text-[#a18470]">
          {text.progressSaved}
        </div>
      </div>
    </div>
  );
}
