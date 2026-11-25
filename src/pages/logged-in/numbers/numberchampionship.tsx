import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
} from "react";
import {
  useNavigate,
  useSearchParams,
} from "react-router-dom";
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

const VIDEO_URL = "/videos/FSLnumbers.mp4";

const TOTAL_QUESTIONS = 20;
const PASSING_PERCENTAGE = 75;

const PASSING_SCORE = Math.ceil(
  (TOTAL_QUESTIONS * PASSING_PERCENTAGE) / 100
);

const NUMBERS = Array.from({ length: 20 }, (_, i) => String(i + 1));

const NUMBER_TIMESTAMPS: Record<
  string,
  { start: number; end: number }
> = {
  "1": { start: 6, end: 7 },
  "2": { start: 9, end: 10 },
  "3": { start: 11, end: 12 },
  "4": { start: 14, end: 15 },
  "5": { start: 16, end: 17 },
  "6": { start: 18, end: 20 },
  "7": { start: 21, end: 23 },
  "8": { start: 24, end: 25 },
  "9": { start: 26, end: 28 },
  "10": { start: 29, end: 31 },
  "11": { start: 32, end: 35 },
  "12": { start: 35, end: 38 },
  "13": { start: 38, end: 41 },
  "14": { start: 41, end: 44 },
  "15": { start: 44, end: 47 },
  "16": { start: 47, end: 50 },
  "17": { start: 50, end: 53 },
  "18": { start: 53, end: 56 },
  "19": { start: 56, end: 59 },
  "20": { start: 59, end: 62 },
};

const VIDEO_END_BUFFER = 0.05;

const PAGE_DESIGN_WIDTH = 1366;
const MOBILE_MAX_WIDTH = 1023;

function detectMobileView() {
  if (typeof window === "undefined") return false;

  return window.innerWidth <= MOBILE_MAX_WIDTH;
}

function useIsMobileView() {
  const [isMobile, setIsMobile] = useState(detectMobileView);

  useEffect(() => {
    const update = () => setIsMobile(detectMobileView());

    update();

    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
    };
  }, []);

  return isMobile;
}

function useFitWidth(designWidth: number, enabled: boolean) {
  const [outer, setOuter] = useState<HTMLDivElement | null>(null);
  const [inner, setInner] = useState<HTMLDivElement | null>(null);

  const [fit, setFit] = useState({ scale: 1, height: 0 });

  useLayoutEffect(() => {
    if (!enabled || !outer || !inner) return;

    const update = () => {
      const width = outer.clientWidth;

      if (!width) return;

      const scale = width / designWidth;
      const height = inner.offsetHeight * scale;

      setFit((previous) =>
        previous.scale === scale && previous.height === height
          ? previous
          : { scale, height }
      );
    };

    update();

    const observer = new ResizeObserver(update);

    observer.observe(outer);
    observer.observe(inner);

    return () => observer.disconnect();
  }, [outer, inner, enabled, designWidth]);

  return { outerRef: setOuter, innerRef: setInner, fit };
}

/* ---------------------------------------------------------
   QUESTION HELPERS
--------------------------------------------------------- */

const shuffleArray = <T,>(array: T[]): T[] => {
  const shuffled = [...array];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [shuffled[i], shuffled[j]] = [
      shuffled[j],
      shuffled[i],
    ];
  }

  return shuffled;
};

const createChampionshipQuestions =
  (): ChampionshipQuestion[] => {
    const shuffledNumbers = shuffleArray(NUMBERS);

    return shuffledNumbers.map((num) => {
      const distractors = shuffleArray(
        NUMBERS.filter((item) => item !== num)
      ).slice(0, 3);

      const options = shuffleArray([
        num,
        ...distractors,
      ]);

      return {
        id: `championship-num-${num}`,
        letter: num,
        answer: num,
        options,
        question_en: "Which number matches this FSL sign?",
        question_tl:
          "Anong numero ang ipinapakita sa senyas na ito?",
      };
    });
  };

const normalizeQuestions = (
  value: unknown
): ChampionshipQuestion[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is ChampionshipQuestion => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.id === "string" &&
      typeof item.letter === "string" &&
      typeof item.answer === "string" &&
      Array.isArray(item.options) &&
      item.options.length === 4 &&
      item.options.every(
        (option: unknown) => typeof option === "string"
      ) &&
      typeof item.question_en === "string" &&
      typeof item.question_tl === "string"
    );
  });
};

const normalizeAnswers = (
  value: unknown
): ChampionshipAnswer[] => {
  if (!Array.isArray(value)) return [];

  return value.filter((item): item is ChampionshipAnswer => {
    return (
      typeof item === "object" &&
      item !== null &&
      typeof item.question_id === "string" &&
      typeof item.question_index === "number" &&
      typeof item.selected_answer === "string" &&
      typeof item.correct_answer === "string" &&
      typeof item.is_correct === "boolean" &&
      typeof item.answered_at === "string"
    );
  });
};

/* ---------------------------------------------------------
   NUMBERS CHAMPIONSHIP COMPONENT
--------------------------------------------------------- */

export default function NumbersChampionship() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const isTagalog = language === "tl";

  const isMobileView = useIsMobileView();

  const {
    outerRef: stageOuterRef,
    innerRef: stageInnerRef,
    fit: stageFit,
  } = useFitWidth(PAGE_DESIGN_WIDTH, !isMobileView);

  const forceNewAttempt =
    searchParams.get("newAttempt") === "true";

  const videoRef = useRef<HTMLVideoElement | null>(null);

  const loadingRef = useRef(false);
  const savingRef = useRef(false);
  const initializedRef = useRef(false);

  const playbackCleanupRef = useRef<(() => void) | null>(
    null
  );

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [attemptId, setAttemptId] = useState<string | null>(
    null
  );

  const [questions, setQuestions] = useState<
    ChampionshipQuestion[]
  >([]);

  const [answers, setAnswers] = useState<
    ChampionshipAnswer[]
  >([]);

  const [selectedAnswer, setSelectedAnswer] = useState<
    string | null
  >(null);

  const [showFeedback, setShowFeedback] = useState(false);

  const currentQuestionIndex = showFeedback
    ? answers.length - 1
    : answers.length;

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
    ? NUMBER_TIMESTAMPS[currentQuestion.letter] ?? null
    : null;

  const score = useMemo(
    () =>
      answers.filter((answer) => answer.is_correct).length,
    [answers]
  );

  const progressPercentage =
    questions.length > 0
      ? Math.min(
          (answers.length / questions.length) * 100,
          100
        )
      : 0;

  /* ---------------------------------------------------------
     BILINGUAL TEXT
  --------------------------------------------------------- */

  const text = {
    loading: isTagalog
      ? "Inihahanda ang Numbers Championship..."
      : "Preparing your Numbers Championship...",

    title: "NUMBERS CHAMPIONSHIP",

    subtitle: isTagalog
      ? "Subukan ang iyong kaalaman sa lahat ng mga numero mula 1 hanggang 20 sa FSL."
      : "Test your knowledge of all numbers from 1 to 20 in FSL.",

    question: isTagalog
      ? "Anong numero ang ipinapakita sa senyas na ito?"
      : "Which number matches this FSL sign?",

    questionCount: isTagalog
      ? `Tanong ${Math.min(
          answers.length + (showFeedback ? 0 : 1),
          TOTAL_QUESTIONS
        )} sa ${TOTAL_QUESTIONS}`
      : `Question ${Math.min(
          answers.length + (showFeedback ? 0 : 1),
          TOTAL_QUESTIONS
        )} of ${TOTAL_QUESTIONS}`,

    chooseAnswer: isTagalog
      ? "Piliin ang tamang numero."
      : "Choose the correct number.",

    correct: isTagalog ? "Tama ang sagot!" : "Correct answer!",

    incorrect: isTagalog
      ? "Hindi ito ang tamang sagot."
      : "Not quite!",

    correctAnswer: isTagalog
      ? "Tamang sagot:"
      : "Correct answer:",

    watchAgain: isTagalog
      ? "PANOORIN MULI"
      : "WATCH AGAIN",

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

    retryLoading: isTagalog
      ? "SUBUKAN MULI"
      : "TRY AGAIN",

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
      ? "Panoorin ang senyas at piliin ang numerong tumutugma rito."
      : "Watch the sign and select the number that matches it.",
  };

  /* ---------------------------------------------------------
     VIDEO SEEKING AND PLAYBACK
  --------------------------------------------------------- */

  const seekAndPlaySegment = useCallback(
    (
      startTime: number,
      onPlaybackError?: (error: unknown) => void
    ) => {
      const video = videoRef.current;

      if (!video) return () => {};

      let cancelled = false;

      let seekedHandler: (() => void) | null = null;
      let metadataHandler: (() => void) | null = null;

      const removeSeekedHandler = () => {
        if (seekedHandler) {
          video.removeEventListener(
            "seeked",
            seekedHandler
          );

          seekedHandler = null;
        }
      };

      const startPlayback = () => {
        if (cancelled) return;

        const playPromise = video.play();

        if (playPromise !== undefined) {
          playPromise.catch((playError) => {
            if (cancelled) return;

            if (
              playError instanceof DOMException &&
              (playError.name === "NotAllowedError" ||
                playError.name === "AbortError")
            ) {
              return;
            }

            console.error(
              "Numbers Championship video playback error:",
              playError
            );

            onPlaybackError?.(playError);
          });
        }
      };

      const performSeek = () => {
        if (cancelled) return;

        video.pause();

        removeSeekedHandler();

        const targetTime = startTime;

        seekedHandler = () => {
          removeSeekedHandler();

          if (!cancelled) {
            startPlayback();
          }
        };

        video.addEventListener(
          "seeked",
          seekedHandler,
          { once: true }
        );

        video.currentTime = targetTime;

        if (
          !video.seeking &&
          Math.abs(video.currentTime - targetTime) < 0.05
        ) {
          removeSeekedHandler();
          startPlayback();
        }
      };

      if (video.readyState >= 1) {
        performSeek();
      } else {
        metadataHandler = () => {
          metadataHandler = null;

          if (!cancelled) {
            performSeek();
          }
        };

        video.addEventListener(
          "loadedmetadata",
          metadataHandler,
          { once: true }
        );
      }

      return () => {
        cancelled = true;

        removeSeekedHandler();

        if (metadataHandler) {
          video.removeEventListener(
            "loadedmetadata",
            metadataHandler
          );

          metadataHandler = null;
        }

        video.pause();
      };
    },
    []
  );

  useEffect(() => {
    if (
      !currentQuestion ||
      !currentTimestamp ||
      loading
    ) {
      return;
    }

    const cleanup = seekAndPlaySegment(
      currentTimestamp.start,
      () => {
        setError(text.videoUnavailable);
      }
    );

    playbackCleanupRef.current = cleanup;

    return () => {
      cleanup();

      if (playbackCleanupRef.current === cleanup) {
        playbackCleanupRef.current = null;
      }
    };
  }, [
    currentQuestion,
    currentTimestamp,
    loading,
    seekAndPlaySegment,
    text.videoUnavailable,
  ]);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;

    if (!video || !currentTimestamp) return;

    const playbackEnd =
      currentTimestamp.end - VIDEO_END_BUFFER;

    if (video.currentTime >= playbackEnd) {
      video.pause();

      video.currentTime = Math.max(
        currentTimestamp.start,
        playbackEnd
      );
    }
  };

  const handleVideoError = () => {
    setError(text.videoUnavailable);
  };

  const playCurrentSegment = useCallback(() => {
    if (!currentTimestamp) return;

    playbackCleanupRef.current?.();

    const cleanup = seekAndPlaySegment(
      currentTimestamp.start,
      () => {
        setError(text.videoUnavailable);
      }
    );

    playbackCleanupRef.current = cleanup;
  }, [
    currentTimestamp,
    seekAndPlaySegment,
    text.videoUnavailable,
  ]);

  const handleWatchAgain = () => {
    setError("");
    playCurrentSegment();
  };

  /* ---------------------------------------------------------
     COMPLETE AN ATTEMPT
  --------------------------------------------------------- */

  const completeAttempt = useCallback(
    async (
      id: string,
      finalAnswers: ChampionshipAnswer[]
    ) => {
      if (!user) {
        setError(
          isTagalog
            ? "Hindi ma-verify ang iyong account."
            : "Unable to verify your account."
        );

        return;
      }

      if (finalAnswers.length !== TOTAL_QUESTIONS) {
        setError(
          isTagalog
            ? "Hindi pa kumpleto ang iyong mga sagot."
            : "Your answers are not yet complete."
        );

        return;
      }

      const finalScore = finalAnswers.filter(
        (answer) => answer.is_correct
      ).length;

      const { data, error: updateError } = await supabase
        .from("numbers_assessment_attempts")
        .update({
          answers: finalAnswers,
          score: finalScore,
          total_questions: TOTAL_QUESTIONS,
          status: "completed",
          completed_at: new Date().toISOString(),
        })
        .eq("id", id)
        .eq("user_id", user.id)
        .eq("assessment_type", "championship")
        .eq("part_key", "3")
        .eq("status", "in_progress")
        .select("id")
        .maybeSingle();

      if (updateError || !data) {
        console.error(
          "Numbers Championship completion error:",
          updateError
        );

        setError(
          isTagalog
            ? "Hindi ma-save ang resulta. Pakisubukang muli."
            : "Your result could not be saved. Please try again."
        );

        return;
      }

      navigate(
        `/numbercomplete?attempt=${encodeURIComponent(data.id)}`
      );
    },
    [navigate, isTagalog, user]
  );

  /* ---------------------------------------------------------
     LOAD OR CREATE THE CHAMPIONSHIP ATTEMPT
  --------------------------------------------------------- */

  const loadChampionship = useCallback(async () => {
    if (authLoading || loadingRef.current) return;

    loadingRef.current = true;

    setLoading(true);
    setError("");

    try {
      if (!user) {
        throw new Error(
          isTagalog
            ? "Hindi makita ang iyong learner account. Mag-login muli."
            : "Your learner account could not be found. Please log in again."
        );
      }

      const userId = user.id;

      if (forceNewAttempt) {
        navigate("/numberchampionship", { replace: true });
      }

      let existingAttempt: any = null;

      if (!forceNewAttempt) {
        const {
          data,
          error: attemptError,
        } = await supabase
          .from("numbers_assessment_attempts")
          .select("*")
          .eq("user_id", userId)
          .eq("assessment_type", "championship")
          .eq("part_key", "3")
          .eq("status", "in_progress")
          .order("started_at", { ascending: false, nullsFirst: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (attemptError) {
          throw attemptError;
        }

        existingAttempt = data;

        if (!existingAttempt) {
          const {
            data: completedAttempt,
            error: completedError,
          } = await supabase
            .from("numbers_assessment_attempts")
            .select("id")
            .eq("user_id", userId)
            .eq("assessment_type", "championship")
            .eq("part_key", "3")
            .eq("status", "completed")
            .order("completed_at", { ascending: false, nullsFirst: false })
            .limit(1)
            .maybeSingle();

          if (completedError) {
            throw completedError;
          }

          if (completedAttempt) {
            navigate(
              `/numbercomplete?attempt=${encodeURIComponent(
                completedAttempt.id
              )}`,
              { replace: true }
            );

            return;
          }
        }
      }

      let activeAttempt: AssessmentAttempt;

      if (existingAttempt) {
        const savedQuestions = normalizeQuestions(
          existingAttempt.questions
        );

        const savedAnswers = normalizeAnswers(
          existingAttempt.answers
        );

        if (
          savedQuestions.length !== TOTAL_QUESTIONS ||
          savedAnswers.length > TOTAL_QUESTIONS
        ) {
          throw new Error(
            isTagalog
              ? "Hindi wasto ang naka-save na Numbers Championship attempt."
              : "The saved Numbers Championship attempt is invalid."
          );
        }

        const savedQuestionIds = new Set(
          savedQuestions.map((question) => question.id)
        );

        const savedAnswerIds = new Set<string>();

        for (const answer of savedAnswers) {
          if (
            !savedQuestionIds.has(answer.question_id) ||
            savedAnswerIds.has(answer.question_id)
          ) {
            throw new Error(
              isTagalog
                ? "Hindi wasto ang mga naka-save na sagot."
                : "The saved answers are invalid."
            );
          }

          savedAnswerIds.add(answer.question_id);
        }

        activeAttempt = {
          ...existingAttempt,
          questions: savedQuestions,
          answers: savedAnswers,
        } as AssessmentAttempt;
      } else {
        const newQuestions =
          createChampionshipQuestions();

        const {
          data: insertedAttempt,
          error: insertError,
        } = await supabase
          .from("numbers_assessment_attempts")
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
            started_at: new Date().toISOString(),
          })
          .select("*")
          .single();

        if (insertError) {
          throw insertError;
        }

        activeAttempt = {
          ...insertedAttempt,
          questions: normalizeQuestions(
            insertedAttempt.questions
          ),
          answers: normalizeAnswers(
            insertedAttempt.answers
          ),
        } as AssessmentAttempt;

        if (
          activeAttempt.questions.length !== TOTAL_QUESTIONS
        ) {
          throw new Error(
            isTagalog
              ? "Hindi maihanda ang mga tanong sa Numbers Championship."
              : "The Numbers Championship questions could not be prepared."
          );
        }
      }

      setAttemptId(activeAttempt.id);
      setQuestions(activeAttempt.questions);
      setAnswers(activeAttempt.answers);

      setSelectedAnswer(null);
      setShowFeedback(false);

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
      console.error(
        "Error loading Numbers Championship:",
        loadError
      );

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
    forceNewAttempt,
    navigate,
  ]);

  useEffect(() => {
    if (authLoading) return;
    if (initializedRef.current) return;

    initializedRef.current = true;

    void loadChampionship();
  }, [authLoading, loadChampionship]);

  /* ---------------------------------------------------------
     SAVE EACH ANSWER
  --------------------------------------------------------- */

  const handleAnswer = async (option: string) => {
    if (
      !currentQuestion ||
      !attemptId ||
      !user ||
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

    const updatedAnswers = [
      ...answers,
      newAnswer,
    ];

    try {
      const { data, error: saveError } = await supabase
        .from("numbers_assessment_attempts")
        .update({
          answers: updatedAnswers,
        })
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .eq("assessment_type", "championship")
        .eq("part_key", "3")
        .eq("status", "in_progress")
        .select("id")
        .maybeSingle();

      if (saveError) {
        throw saveError;
      }

      if (!data) {
        throw new Error(
          "The Numbers Championship attempt could not be updated."
        );
      }

      setAnswers(updatedAnswers);
      setSelectedAnswer(option);
      setShowFeedback(true);
    } catch (saveError) {
      console.error(
        "Error saving Numbers Championship answer:",
        saveError
      );

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

  const handleNext = async () => {
    if (
      savingRef.current ||
      saving ||
      !attemptId ||
      !showFeedback
    ) {
      return;
    }

    if (answers.length === TOTAL_QUESTIONS) {
      await completeAttempt(attemptId, answers);
      return;
    }

    setSelectedAnswer(null);
    setShowFeedback(false);
    setError("");
  };

  /* ---------------------------------------------------------
     LOADING SCREEN
  --------------------------------------------------------- */

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-6">
        <Loader2 className="w-12 h-12 text-[#36A9F4] animate-spin mb-4" />

        <h2 className="text-xl font-black text-[#164B9B] text-center">
          {text.loading}
        </h2>

        <p className="text-sm font-medium text-slate-600 mt-2 text-center">
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
      <div className="min-h-screen flex items-center justify-center bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] px-5">
        <div className="w-full max-w-md rounded-3xl border border-[#B8DDF6] bg-white p-8 shadow-xl text-center">
          <XCircle className="w-14 h-14 text-rose-500 mx-auto mb-4" />

          <h2 className="text-2xl font-black text-[#164B9B] mb-3">
            {text.errorTitle}
          </h2>

          <p className="text-slate-600 mb-6 font-medium">
            {error}
          </p>

          <button
            onClick={() => {
              if (loadingRef.current) return;

              initializedRef.current = false;

              void loadChampionship();
            }}
            className="w-full rounded-2xl border-b-4 border-sky-700 bg-sky-500 px-6 py-3.5 font-extrabold text-white hover:bg-sky-600 active:translate-y-0.5 active:border-b-2 transition"
          >
            {text.retryLoading}
          </button>

          <button
            onClick={() => navigate("/numbers")}
            className="w-full mt-3 rounded-2xl border-b-4 border-[#B8DDF6] bg-white px-6 py-3.5 font-extrabold text-[#36A9F4] hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 transition"
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
     RENDER CONTENT FUNCTION (ZOOM-PROOF)
  --------------------------------------------------------- */

  const renderContent = (_isDesktop: boolean) => (
    <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-2.5 sm:gap-4 mb-5 sm:mb-6">
        <button
          type="button"
          onClick={() => navigate("/numbers")}
          aria-label={text.back}
          className="flex h-11 w-11 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300"
        >
          <ArrowLeft size={21} strokeWidth={2.5} />
        </button>

        <div className="flex min-w-0 items-center gap-1.5 sm:gap-2 rounded-full bg-[#E5D3FF] border-b-4 border-[#B98AFF] px-3.5 sm:px-4 py-2 text-[#A45CE8] shadow-sm">
          <Award size={19} className="shrink-0" />
          <span className="truncate font-black tracking-wide text-xs sm:text-base">
            {text.title}
          </span>
        </div>
      </div>

      {/* TITLE AND DESCRIPTION */}
      <div className="text-center mb-6 sm:mb-7">
        <h1 className="text-2xl sm:text-4xl font-black text-[#164B9B] tracking-wide">
          {text.title}
        </h1>

        <p className="mt-2 text-xs sm:text-base font-medium text-slate-600 max-w-2xl mx-auto">
          {text.subtitle}
        </p>
      </div>

      {/* PROGRESS */}
      <div className="rounded-3xl bg-white p-4 sm:p-6 shadow-sm border border-[#B8DDF6] mb-5 sm:mb-6">
        <div className="flex items-center justify-between gap-3 mb-3">
          <span className="font-black text-[#164B9B] text-xs sm:text-base">
            {text.questionCount}
          </span>

          <span className="text-xs sm:text-sm font-black text-[#36A9F4]">
            {answers.length}/{TOTAL_QUESTIONS}
          </span>
        </div>

        <div className="h-3 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-[#36A9F4] transition-all duration-500"
            style={{
              width: `${progressPercentage}%`,
            }}
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-medium text-slate-500">
          <span>
            {isTagalog
              ? "Tamang sagot"
              : "Correct answers"}:{" "}
            <strong className="text-slate-700">{score}</strong>
          </span>

          <span>
            {isTagalog
              ? `Kailangang puntos: ${PASSING_SCORE}`
              : `Passing score: ${PASSING_SCORE}`}
          </span>
        </div>
      </div>

      {/* QUESTION CARD */}
      <div className="rounded-3xl bg-white p-4 sm:p-8 shadow-sm border border-[#B8DDF6]">
        <div className="text-center mb-5 sm:mb-6">
          <span className="inline-block rounded-full bg-sky-100 px-3.5 sm:px-4 py-1.5 text-xs sm:text-sm font-black tracking-wider text-[#164B9B]">
            CHAMPIONSHIP TEST
          </span>

          <h2 className="mt-3 text-lg sm:text-2xl font-black text-[#454545]">
            {text.question}
          </h2>

          <p className="mt-1.5 text-xs sm:text-sm font-medium text-slate-500">
            {text.instruction}
          </p>
        </div>

        {/* VIDEO */}
        <div className="mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-black shadow-md aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            src={VIDEO_URL}
            className="h-full w-full object-contain"
            playsInline
            preload="auto"
            onTimeUpdate={handleVideoTimeUpdate}
            onError={handleVideoError}
          />
        </div>

        {/* VIDEO CONTROLS */}
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={handleWatchAgain}
            disabled={saving}
            className="flex h-12 w-full sm:w-auto items-center justify-center gap-2 rounded-full border-b-4 border-sky-700 bg-sky-500 px-6 text-sm sm:text-base font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0.5 active:border-b-2 disabled:opacity-50"
          >
            <RotateCcw size={19} aria-hidden="true" />
            {text.watchAgain}
          </button>
        </div>

        {/* ANSWER OPTIONS */}
        <div className="mt-7 sm:mt-8">
          <p className="text-center text-xs sm:text-sm font-extrabold text-[#164B9B] mb-4">
            {text.chooseAnswer}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
            {currentQuestion.options.map((option) => {
              const isSelected =
                selectedAnswer === option;

              const isCorrectOption =
                showFeedback &&
                option === currentQuestion.answer;

              const isWrongSelection =
                showFeedback &&
                isSelected &&
                option !== currentQuestion.answer;

              let optionClass =
                "border-[#B8DDF6] bg-white text-[#426A91] hover:bg-slate-50";

              if (isCorrectOption) {
                optionClass =
                  "border-emerald-500 bg-emerald-100 text-emerald-700";
              } else if (isWrongSelection) {
                optionClass =
                  "border-rose-500 bg-rose-100 text-rose-700";
              } else if (isSelected) {
                optionClass =
                  "border-sky-500 bg-sky-100 text-sky-700";
              }

              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => void handleAnswer(option)}
                  disabled={showFeedback || saving}
                  className={`flex h-16 sm:h-24 items-center justify-center rounded-2xl border-b-4 text-2xl sm:text-4xl font-black transition-all ${optionClass} disabled:cursor-not-allowed`}
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
            className={`mt-6 rounded-2xl border p-4 sm:p-5 ${
              selectedAnswer === currentQuestion.answer
                ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                : "border-rose-200 bg-rose-50 text-rose-800"
            }`}
          >
            <div className="flex items-center gap-3">
              {selectedAnswer === currentQuestion.answer ? (
                <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 text-emerald-600" />
              ) : (
                <XCircle className="h-7 w-7 sm:h-8 sm:w-8 shrink-0 text-rose-500" />
              )}

              <div>
                <h3 className="font-black text-base sm:text-lg">
                  {selectedAnswer === currentQuestion.answer
                    ? text.correct
                    : text.incorrect}
                </h3>

                {selectedAnswer !== currentQuestion.answer && (
                  <p className="mt-1 text-xs sm:text-sm font-bold">
                    {text.correctAnswer}{" "}
                    <strong className="text-sm sm:text-base">
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
          <div className="mt-4 flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-[#36A9F4]">
            <Loader2
              size={18}
              className="animate-spin"
            />
            {text.saving}
          </div>
        )}

        {error && currentQuestion && (
          <p className="mt-4 text-center text-xs sm:text-sm font-extrabold text-rose-600">
            {error}
          </p>
        )}

        {/* NEXT / FINISH */}
        {showFeedback && (
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={() => void handleNext()}
              disabled={saving}
              className="flex h-13 sm:h-14 w-full sm:w-auto min-w-50 items-center justify-center gap-2 rounded-2xl border-b-4 border-[#B98AFF] bg-[#E5D3FF] text-base sm:text-lg font-black text-[#A45CE8] transition-all hover:bg-[#D8BCFF] active:translate-y-0.5 active:border-b-2 disabled:opacity-50"
            >
              {answers.length === TOTAL_QUESTIONS
                ? text.finish
                : text.next}

              <ArrowRight size={20} strokeWidth={3} />
            </button>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div className="mt-6 text-center text-xs sm:text-sm font-medium text-slate-500">
        {answers.length > 0 && !saving && !error
          ? text.progressSaved
          : "\u00A0"}
      </div>
    </div>
  );

  return (
    <main className="relative min-h-screen w-full overflow-x-clip bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      {/* Background decorative elements */}
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

      {isMobileView ? (
        <div className="relative z-10 pb-20 sm:pb-24">
          {renderContent(false)}
        </div>
      ) : (
        <div
          ref={stageOuterRef}
          className="relative z-10 w-full"
          style={{ height: stageFit.height || undefined }}
        >
          <div
            ref={stageInnerRef}
            style={{
              width: PAGE_DESIGN_WIDTH,
              transform: `scale(${stageFit.scale})`,
              transformOrigin: "top left",
            }}
          >
            <div className="pb-24">
              {renderContent(true)}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}