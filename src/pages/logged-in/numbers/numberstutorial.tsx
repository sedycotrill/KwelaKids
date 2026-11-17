import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Languages,
  Award,
} from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { useAudio } from "../../../context/AudioContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

const PART_KEY = "part_1";
const NUMBERS = Array.from({ length: 10 }, (_, index) => String(index + 1));

const PAGE_DESIGN_WIDTH = 1366;
const MOBILE_MAX_WIDTH = 1023;

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;

  const uaData = (
    navigator as Navigator & { userAgentData?: { mobile?: boolean } }
  ).userAgentData;

  if (uaData?.mobile) return true;

  if (/Android|iPhone|iPad|iPod|Mobile|Tablet/i.test(navigator.userAgent)) {
    return true;
  }

  return (
    /Macintosh/i.test(navigator.userAgent) && navigator.maxTouchPoints > 1
  );
}

function detectMobileView() {
  if (typeof window === "undefined") return false;

  return isMobileDevice() && window.innerWidth <= MOBILE_MAX_WIDTH;
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

// Number video timestamps in seconds (1-10)
const NUMBER_TIMESTAMPS: Record<string, { start: number; end: number }> = {
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
};

const DESCRIPTIONS_EN: Record<string, string> = {
  "1": "Raise your index finger straight up while keeping your thumb and the other three fingers folded into your palm. Face your palm forward.",
  "2": "Raise your index and middle fingers, keeping them straight and slightly apart. Fold your thumb, ring finger, and pinky into your palm.",
  "3": "Raise your index, middle, and pinky fingers. Keep your thumb and ring finger folded toward your palm.",
  "4": "Raise your four fingers—index, middle, ring, and pinky—while folding your thumb across your palm.",
  "5": "Open your hand and extend all five fingers. Keep your fingers spread apart with your palm facing forward.",
  "6": "Raise your index and middle fingers while touching your thumb to your ring finger. Keep your pinky extended.",
  "7": "Raise your index, middle, and pinky fingers while touching your thumb to your ring finger.",
  "8": "Raise your index, middle, and ring fingers while touching your thumb to your middle finger. Keep your pinky extended.",
  "9": "Raise your index and middle fingers while touching your thumb to your index finger. Keep your other fingers folded.",
  "10": "Close your hand into a fist and extend your thumb upward.",
};

const DESCRIPTIONS_TL: Record<string, string> = {
  "1": "Iunat nang tuwid paitaas ang iyong hintuturo habang nakatiklop ang iyong hinlalaki at tatlong iba pang daliri sa iyong palad. Harapin ang iyong palad sa unahan.",
  "2": "Itaas ang hintuturo at gitna, panatilihing tuwid at medyo magkalayo ang mga ito. Tiklupin ang hinlalaki, singsing, at kalingkingan sa iyong palad.",
  "3": "Itaas ang hintuturo, gitna, at kalingkingan. Panatilihing nakatiklop ang hinlalaki at singsing patungo sa iyong palad.",
  "4": "Itaas ang apat na daliri—hintuturo, gitna, singsing, at kalingkingan—habang itinitiklop ang hinlalaki sa ibabaw ng palad.",
  "5": "Buksan ang kamay at iunat ang limang daliri. Panatilihing magkakalayo ang mga ito at nakaharap sa unahan ang palad.",
  "6": "Itaas ang hintuturo at gitna habang idinidikit ang hinlalaki sa daliring singsing. Panatilihing nakaunat ang kalingkingan.",
  "7": "Itaas ang hintuturo, gitna, at kalingkingan habang idinidikit ang hinlalaki sa daliring singsing.",
  "8": "Itaas ang hintuturo, gitna, at singsing habang idinidikit ang hinlalaki sa gitnang daliri. Panatilihing nakaunat ang kalingkingan.",
  "9": "Itaas ang hintuturo at gitna habang idinidikit ang hinlalaki sa hintuturo. Tiklupin ang iba pang mga daliri.",
  "10": "Isara ang kamay para maging kamao at iunat paitaas ang hinlalaki.",
};

const CHECKPOINT_AFTER_INDEX = 4; // Checkpoint pagkatapos ng 5 (index 4)
const QUICK_TEST_LENGTH = 3;

type QuickTestQuestion = {
  questionEn: string;
  questionTl: string;
  number: string;
  answer: string;
  options: string[];
};

const seededRandom = (seedText: string) => {
  let seed = 0;
  for (let i = 0; i < seedText.length; i += 1) {
    seed = (seed * 31 + seedText.charCodeAt(i)) >>> 0;
  }
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
};

const shuffleWithSeed = <T,>(items: T[], random: () => number): T[] => {
  const shuffled = [...items];
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

const createQuickTestQuestions = (
  numberPool: string[],
  seed: string
): QuickTestQuestion[] => {
  const random = seededRandom(seed);
  const questionNumbers = shuffleWithSeed(numberPool, random).slice(
    0,
    QUICK_TEST_LENGTH
  );

  return questionNumbers.map((num) => {
    const distractors = shuffleWithSeed(
      numberPool.filter((candidate) => candidate !== num),
      random
    ).slice(0, 3);

    return {
      questionEn: "Which number matches this FSL sign?",
      questionTl: "Anong numero ang ipinapakita sa senyas na ito?",
      number: num,
      answer: num,
      options: shuffleWithSeed([num, ...distractors], random),
    };
  });
};

const chunkyButton =
  "flex h-12 shrink-0 items-center gap-2 rounded-2xl border-b-4 px-3 text-sm font-extrabold " +
  "whitespace-nowrap sm:text-base md:px-4 " +
  "transition-all duration-150 select-none " +
  "hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 " +
  "motion-reduce:transition-none motion-reduce:hover:transform-none";

export default function NumbersTutorialPart1() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { isPlaying, volume, toggleMusic } = useAudio();
  const { user, loading: authLoading } = useAuth();
  const isTagalog = language === "tl";

  const isMobileView = useIsMobileView();

  const {
    outerRef: stageOuterRef,
    innerRef: stageInnerRef,
    fit: stageFit,
  } = useFitWidth(PAGE_DESIGN_WIDTH, !isMobileView);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuickTest, setIsQuickTest] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(QUICK_TEST_LENGTH).fill(null)
  );

  const [quickTestQuestions, setQuickTestQuestions] = useState<
    QuickTestQuestion[]
  >([]);
  const [quickTestAttemptId, setQuickTestAttemptId] = useState<string | null>(
    null
  );
  const [partCompleted, setPartCompleted] = useState(false);

  const [progressLoading, setProgressLoading] = useState(true);
  const [syncFailed, setSyncFailed] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = NUMBERS.length;
  const currentNumber = NUMBERS[currentIndex];
  const isLast = currentIndex === total - 1;

  const checkpointNumber = currentIndex > CHECKPOINT_AFTER_INDEX ? 2 : 1;
  const checkpointNumbers =
    checkpointNumber === 1
      ? NUMBERS.slice(0, CHECKPOINT_AFTER_INDEX + 1)
      : NUMBERS.slice(CHECKPOINT_AFTER_INDEX + 1);

  const QUICK_TEST_QUESTIONS =
    quickTestQuestions.length === QUICK_TEST_LENGTH
      ? quickTestQuestions
      : createQuickTestQuestions(
          checkpointNumbers,
          `${user?.id ?? "guest"}-${PART_KEY}-checkpoint-${checkpointNumber}`
        );

  const timestamp = NUMBER_TIMESTAMPS[currentNumber] || { start: 0, end: 5 };
  const description = isTagalog
    ? DESCRIPTIONS_TL[currentNumber]
    : DESCRIPTIONS_EN[currentNumber];
  const isMusicActive = isPlaying && volume > 0;

  const queueSave = (
    operation: () => Promise<void>,
    label: string
  ): Promise<boolean> => {
    const run = saveQueue.current.then(operation);
    saveQueue.current = run.then(
      () => undefined,
      () => undefined
    );

    return run.then(
      () => {
        setSyncFailed(false);
        return true;
      },
      (err) => {
        console.error(label, err);
        setSyncFailed(true);
        return false;
      }
    );
  };

  const saveProgress = (
    numberIndex: number,
    completed = false,
    score: number | null = null
  ): Promise<boolean> => {
    if (!user) {
      console.error("Save progress error: no authenticated user.");
      setSyncFailed(true);
      return Promise.resolve(false);
    }

    return queueSave(async () => {
      const now = new Date().toISOString();
      const progressData = {
        user_id: user.id,
        part_key: PART_KEY,
        tutorial_current_index: numberIndex,
        tutorial_is_quick_test: false,
        tutorial_test_index: 0,
        tutorial_answers: [],
        tutorial_score: score,
        tutorial_total_questions: score === null ? null : QUICK_TEST_LENGTH,
        tutorial_completed_at: completed ? now : null,
        updated_at: now,
      };

      const { error } = await supabase
        .from("numbers_progress")
        .upsert(progressData, { onConflict: "user_id,part_key" });

      if (error) throw error;
    }, "Unable to save numbers progress:");
  };

  const saveQuickTestProgress = (
    numberIndex: number,
    questionIndex: number,
    savedAnswers: (string | null)[]
  ): Promise<boolean> => {
    if (!user) {
      console.error("Save quick test progress error: no authenticated user.");
      setSyncFailed(true);
      return Promise.resolve(false);
    }

    return queueSave(async () => {
      const progressData = {
        user_id: user.id,
        part_key: PART_KEY,
        tutorial_current_index: numberIndex,
        tutorial_is_quick_test: true,
        tutorial_test_index: questionIndex,
        tutorial_answers: savedAnswers,
        tutorial_score: null,
        tutorial_total_questions: QUICK_TEST_LENGTH,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("numbers_progress")
        .upsert(progressData, { onConflict: "user_id,part_key" });

      if (error) throw error;
    }, "Unable to save numbers quick test progress:");
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setProgressLoading(false);
      return;
    }

    let isMounted = true;

    const loadProgress = async () => {
      setProgressLoading(true);
      try {
        const { data: progress, error: progressQueryError } = await supabase
          .from("numbers_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("part_key", PART_KEY)
          .maybeSingle();

        if (progressQueryError) throw progressQueryError;

        if (!isMounted) return;

        const savedIndex = Math.min(
          Math.max(Number(progress?.tutorial_current_index ?? 0), 0),
          NUMBERS.length - 1
        );

        setCurrentIndex(savedIndex);
        setPartCompleted(Boolean(progress?.tutorial_completed_at));

        const { data: activeAttempts, error: attemptQueryError } = await supabase
          .from("numbers_assessment_attempts")
          .select("*")
          .eq("user_id", user.id)
          .eq("assessment_type", "quick_test")
          .eq("part_key", PART_KEY)
          .eq("status", "in_progress")
          .order("created_at", { ascending: false })
          .limit(1);

        if (attemptQueryError) throw attemptQueryError;
        if (!isMounted) return;
        const activeAttempt = activeAttempts?.[0];

        const attemptCheckpoint =
          Number(activeAttempt?.checkpoint_number) === 1 ? 1 : 2;
        const progressCheckpoint = savedIndex > CHECKPOINT_AFTER_INDEX ? 2 : 1;
        const alreadyCompleted = Boolean(progress?.tutorial_completed_at);
        const shouldResume =
          Boolean(activeAttempt) &&
          !alreadyCompleted &&
          attemptCheckpoint === progressCheckpoint;

        if (activeAttempt && shouldResume) {
          const checkpoint = Number(activeAttempt.checkpoint_number) === 1 ? 1 : 2;
          const pool =
            checkpoint === 1
              ? NUMBERS.slice(0, CHECKPOINT_AFTER_INDEX + 1)
              : NUMBERS.slice(CHECKPOINT_AFTER_INDEX + 1);

          const storedQuestions = Array.isArray(activeAttempt.questions)
            ? activeAttempt.questions
            : [];

          const restoredQuestions =
            storedQuestions.length === QUICK_TEST_LENGTH
              ? storedQuestions
              : createQuickTestQuestions(
                  pool,
                  `${user.id}-${PART_KEY}-checkpoint-${checkpoint}`
                );

          const storedAnswers = Array.isArray(activeAttempt.answers)
            ? activeAttempt.answers
            : [];
          const restoredAnswers = Array.from(
            { length: QUICK_TEST_LENGTH },
            (_, index) =>
              typeof storedAnswers[index] === "string"
                ? (storedAnswers[index] as string)
                : null
          );

          const firstUnanswered = restoredAnswers.findIndex((a) => a === null);
          const restoredIndex = firstUnanswered === -1 ? QUICK_TEST_LENGTH - 1 : firstUnanswered;
          const restoredAnswer = restoredAnswers[restoredIndex];

          const checkpointIndex =
            checkpoint === 1 ? CHECKPOINT_AFTER_INDEX : NUMBERS.length - 1;

          setCurrentIndex(checkpointIndex);
          setQuickTestAttemptId(activeAttempt.id);
          setQuickTestQuestions(restoredQuestions);
          setAnswers(restoredAnswers);
          setTestIndex(restoredIndex);
          setSelectedAnswer(restoredAnswer);
          setIsCorrect(
            restoredAnswer === null
              ? null
              : restoredAnswer === restoredQuestions[restoredIndex].answer
          );
          setIsQuickTest(true);
        }
      } catch (err) {
        console.error("Error loading numbers progress:", err);
        if (isMounted) setSyncFailed(true);
      } finally {
        if (isMounted) setProgressLoading(false);
      }
    };

    loadProgress();
    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  const createQuickTestAttempt = async () => {
    if (!user) return;
    const checkpoint = currentIndex <= CHECKPOINT_AFTER_INDEX ? 1 : 2;
    const pool =
      checkpoint === 1
        ? NUMBERS.slice(0, CHECKPOINT_AFTER_INDEX + 1)
        : NUMBERS.slice(CHECKPOINT_AFTER_INDEX + 1);

    const questions = createQuickTestQuestions(
      pool,
      `${user.id}-${PART_KEY}-checkpoint-${checkpoint}-${Date.now()}`
    );
    const initialAnswers: (string | null)[] = Array(QUICK_TEST_LENGTH).fill(null);

    setQuickTestQuestions(questions);
    setAnswers(initialAnswers);
    setTestIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);

    await saveQuickTestProgress(currentIndex, 0, initialAnswers);

    try {
      const { data, error } = await supabase
        .from("numbers_assessment_attempts")
        .insert({
          user_id: user.id,
          assessment_type: "quick_test",
          part_key: PART_KEY,
          checkpoint_number: checkpoint,
          questions,
          answers: initialAnswers,
          score: null,
          total_questions: QUICK_TEST_LENGTH,
          status: "in_progress",
          started_at: new Date().toISOString(),
        })
        .select("id")
        .single();

      if (error) throw error;
      if (data) setQuickTestAttemptId(data.id);
    } catch (err) {
      console.error("Unable to create quick test attempt:", err);
      setSyncFailed(true);
    }
  };

  const persistAttemptAnswers = async (
    updatedAnswers: (string | null)[],
    qIndex: number
  ) => {
    if (!user) return;

    if (quickTestAttemptId) {
      try {
        const { error } = await supabase
          .from("numbers_assessment_attempts")
          .update({ answers: updatedAnswers })
          .eq("id", quickTestAttemptId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (err) {
        console.error("Unable to save quick test answer:", err);
        setSyncFailed(true);
      }
    }

    await saveQuickTestProgress(currentIndex, qIndex, updatedAnswers);
  };

  const resetQuickTestState = () => {
    setQuickTestAttemptId(null);
    setQuickTestQuestions([]);
    setAnswers(Array(QUICK_TEST_LENGTH).fill(null));
    setTestIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsQuickTest(false);
  };

  const completeQuickTestAttempt = async () => {
    const score = QUICK_TEST_QUESTIONS.reduce(
      (sum, q, idx) => sum + (answers[idx] === q.answer ? 1 : 0),
      0
    );

    const now = new Date().toISOString();

    if (quickTestAttemptId && user) {
      try {
        const { error } = await supabase
          .from("numbers_assessment_attempts")
          .update({
            answers,
            score,
            total_questions: QUICK_TEST_LENGTH,
            status: "completed",
            completed_at: now,
          })
          .eq("id", quickTestAttemptId)
          .eq("user_id", user.id);

        if (error) throw error;
      } catch (err) {
        console.error("Unable to complete quick test attempt:", err);
        setSyncFailed(true);
      }
    }

    if (currentIndex === CHECKPOINT_AFTER_INDEX) {
      const nextIndex = CHECKPOINT_AFTER_INDEX + 1;
      const saved = await saveProgress(nextIndex, partCompleted, score);
      if (!saved) return;

      setCurrentIndex(nextIndex);
      resetQuickTestState();
      return;
    }

    const saved = await saveProgress(NUMBERS.length - 1, true, score);
    if (!saved) return;

    setPartCompleted(true);
    resetQuickTestState();
    navigate("/numbers");
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video || isQuickTest) return;

    const setVideoSegment = () => {
      video.pause();
      video.currentTime = timestamp.start;
    };

    if (video.readyState >= 1) {
      setVideoSegment();
    } else {
      video.addEventListener("loadedmetadata", setVideoSegment, { once: true });
    }
    return () => {
      video.removeEventListener("loadedmetadata", setVideoSegment);
    };
  }, [currentNumber, timestamp.start, isQuickTest]);

  useEffect(() => {
    if (!isQuickTest) return;
    const video = testVideoRef.current;
    if (!video) return;

    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = NUMBER_TIMESTAMPS[currentQ.number] || { start: 0, end: 5 };

    const setTestVideoSegment = () => {
      video.pause();
      video.currentTime = qTimestamp.start;
    };

    if (video.readyState >= 1) {
      setTestVideoSegment();
    } else {
      video.addEventListener("loadedmetadata", setTestVideoSegment, { once: true });
    }
  }, [isQuickTest, testIndex, QUICK_TEST_QUESTIONS]);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;
    if (timestamp.end > timestamp.start && video.currentTime >= timestamp.end) {
      video.pause();
    }
  };

  const handleTestVideoTimeUpdate = () => {
    const video = testVideoRef.current;
    if (!video) return;
    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = NUMBER_TIMESTAMPS[currentQ.number] || { start: 0, end: 5 };
    if (qTimestamp.end > qTimestamp.start && video.currentTime >= qTimestamp.end) {
      video.pause();
    }
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.currentTime >= timestamp.end - 0.1 || video.currentTime < timestamp.start) {
      video.currentTime = timestamp.start;
    }
  };

  const handleTestVideoPlay = () => {
    const video = testVideoRef.current;
    if (!video) return;
    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = NUMBER_TIMESTAMPS[currentQ.number] || { start: 0, end: 5 };
    if (video.currentTime >= qTimestamp.end - 0.1 || video.currentTime < qTimestamp.start) {
      video.currentTime = qTimestamp.start;
    }
  };

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = timestamp.start;
    video.play().catch(() => {});
  };

  const handleTestReplay = () => {
    const video = testVideoRef.current;
    if (!video) return;
    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = NUMBER_TIMESTAMPS[currentQ.number] || { start: 0, end: 5 };
    video.currentTime = qTimestamp.start;
    video.play().catch(() => {});
  };

  const handleNext = async () => {
    const isCheckpoint = currentIndex === CHECKPOINT_AFTER_INDEX || isLast;

    if (isCheckpoint) {
      try {
        if (!quickTestAttemptId) {
          await createQuickTestAttempt();
        }
      } catch (err) {
        console.error("Quick test start error:", err);
        setSyncFailed(true);
      }
      setIsQuickTest(true);
      return;
    }

    const nextIndex = currentIndex + 1;
    setCurrentIndex(nextIndex);
    await saveProgress(nextIndex, partCompleted);
  };

  const syncBanner = syncFailed ? (
    <div
      role="alert"
      className="mb-4 rounded-2xl border border-rose-300 bg-rose-50 px-4 py-3 text-sm font-bold text-rose-700"
    >
      {isTagalog
        ? "Hindi na-save o na-load ang iyong progreso. Pakisuri ang iyong internet connection at subukan muli."
        : "Your progress could not be saved or loaded. Please check your connection and try again."}
    </div>
  ) : null;

  if (authLoading || progressLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#E4F4FF] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#B8DDF6] border-t-[#36A9F4]" />
          <p className="font-bold text-[#164B9B]">
            {isTagalog ? "Nilo-load ang iyong progreso..." : "Loading your progress..."}
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // RENDER CONTENT FUNCTION (ZOOM-PROOF)
  // --------------------------------------------------

  const renderContent = (_isDesktop: boolean) => {
    if (isQuickTest) {
      const currentQ = QUICK_TEST_QUESTIONS[testIndex];

      return (
        <div className="relative w-full min-h-[700px]">
          {/* SUB-HEADER BAR */}
          <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={async () => {
                  await saveQuickTestProgress(currentIndex, testIndex, answers);
                  setIsQuickTest(false);
                }}
                aria-label={isTagalog ? "Bumalik sa tutorial" : "Back to tutorial"}
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
              >
                <ArrowLeft size={22} strokeWidth={2.5} />
              </button>

              <div>
                <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
                  {isTagalog ? "Mabilis na Pagsusulit" : "Quick Test"}
                </h1>
                <p className="text-sm font-medium text-slate-600 sm:text-base">
                  {isTagalog
                    ? `Checkpoint ${checkpointNumber}: mga numero ${checkpointNumber === 1 ? "1–5" : "6–10"}`
                    : `Checkpoint ${checkpointNumber}: numbers ${checkpointNumber === 1 ? "1–5" : "6–10"}`}
                </p>
              </div>
            </div>

            {/* QUICK CONTROLS: Language & Music / Mute */}
            <div className="flex items-center gap-2 sm:gap-3">
              <button
                type="button"
                onClick={() => toggleLanguage()}
                className={`${chunkyButton} border-purple-300 bg-purple-100 text-purple-700 hover:bg-purple-200`}
              >
                <Languages size={22} />
                <span>{isTagalog ? "TL" : "EN"}</span>
              </button>

              <button
                type="button"
                onClick={() => toggleMusic()}
                aria-pressed={isMusicActive}
                aria-label={
                  isMusicActive
                    ? isTagalog ? "I-mute ang tugtog" : "Mute music"
                    : isTagalog ? "I-unmute ang tugtog" : "Unmute music"
                }
                className={`${chunkyButton} ${
                  isMusicActive
                    ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                    : "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {isMusicActive ? (
                  <Volume2 size={22} className="animate-pulse motion-reduce:animate-none" />
                ) : (
                  <VolumeX size={22} />
                )}
                <span className="hidden md:inline">
                  {isMusicActive
                    ? isTagalog ? "Tugtog" : "Music"
                    : isTagalog ? "Naka-mute" : "Muted"}
                </span>
              </button>
            </div>
          </div>

          <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
            {syncBanner}
            <div className="mb-4">
              <p className="mb-2 text-sm font-extrabold text-[#164B9B] sm:text-base">
                {isTagalog
                  ? `Tanong ${testIndex + 1} ng ${QUICK_TEST_LENGTH}`
                  : `Question ${testIndex + 1} of ${QUICK_TEST_LENGTH}`}
              </p>

              <div className="h-3 w-full overflow-hidden rounded-full bg-white/80" aria-hidden="true">
                <div
                  className="h-full rounded-full bg-[#36A9F4] transition-all duration-300"
                  style={{
                    width: `${((testIndex + 1) / QUICK_TEST_LENGTH) * 100}%`,
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm md:grid-cols-[57%_43%]">
              <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
                <video
                  ref={testVideoRef}
                  src="/videos/FSLnumbers.mp4"
                  controls
                  playsInline
                  preload="metadata"
                  onTimeUpdate={handleTestVideoTimeUpdate}
                  onPlay={handleTestVideoPlay}
                  className="h-full w-full object-contain"
                />
              </div>

              <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-6">
                <div className="flex items-center gap-2 text-[#36A9F4]">
                  <Award size={22} />
                  <span className="text-xs font-extrabold uppercase tracking-wide text-[#164B9B]">
                    {isTagalog ? "Pagsusulit sa FSL" : "FSL Challenge"}
                  </span>
                </div>

                <div>
                  <h2 className="text-lg font-black leading-relaxed text-[#454545] sm:text-xl">
                    {isTagalog ? currentQ.questionTl : currentQ.questionEn}
                  </h2>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {currentQ.options.map((opt) => {
                    let btnStyle =
                      "border-[#B8DDF6] bg-white text-[#426A91] hover:bg-slate-50";

                    if (selectedAnswer === opt) {
                      btnStyle = isCorrect
                        ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                        : "border-rose-500 bg-rose-100 text-rose-700";
                    } else if (selectedAnswer && opt === currentQ.answer) {
                      btnStyle =
                        "border-emerald-500 bg-emerald-100 text-emerald-700";
                    }

                    return (
                      <button
                        key={opt}
                        type="button"
                        disabled={selectedAnswer !== null}
                        onClick={async () => {
                          const updated = [...answers];
                          updated[testIndex] = opt;
                          setAnswers(updated);
                          setSelectedAnswer(opt);
                          setIsCorrect(opt === currentQ.answer);
                          await persistAttemptAnswers(updated, testIndex);
                        }}
                        className={`flex h-14 items-center justify-center rounded-xl border-b-4 text-xl font-black transition-all disabled:cursor-not-allowed ${btnStyle}`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={handleTestReplay}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-b-4 border-sky-700 bg-sky-500 text-base font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0.5 active:border-b-2 sm:w-auto sm:self-start sm:px-6"
                >
                  <RotateCcw size={20} aria-hidden="true" />
                  {isTagalog ? "Panoorin ulit" : "Watch again"}
                </button>
              </div>
            </div>

            {selectedAnswer !== null && (
              <div className="mt-6 rounded-2xl border border-[#B8DDF6] bg-white p-5 text-center shadow-sm">
                <p
                  className={`text-base font-extrabold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}
                >
                  {isCorrect
                    ? isTagalog
                      ? "Magaling! Tama ang sagot mo! 🎉"
                      : "Great job! Correct answer! 🎉"
                    : isTagalog
                      ? `Mali! Ang tamang sagot ay ${currentQ.answer}.`
                      : `Incorrect! The correct answer is ${currentQ.answer}.`}
                </p>

                <button
                  type="button"
                  onClick={async () => {
                    if (testIndex < QUICK_TEST_LENGTH - 1) {
                      const next = testIndex + 1;
                      setTestIndex(next);
                      setSelectedAnswer(answers[next]);
                      setIsCorrect(
                        answers[next] === null
                          ? null
                          : answers[next] === QUICK_TEST_QUESTIONS[next].answer
                      );
                    } else {
                      await completeQuickTestAttempt();
                    }
                  }}
                  className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-lg font-extrabold text-white transition hover:bg-sky-600 active:border-b-2"
                >
                  {testIndex < QUICK_TEST_LENGTH - 1
                    ? isTagalog
                      ? "Susunod na Tanong"
                      : "Next Question"
                    : isTagalog
                      ? checkpointNumber === 1
                        ? "Magpatuloy sa 6–10"
                        : "Tapusin"
                      : checkpointNumber === 1
                        ? "Continue to 6–10"
                        : "Finish"}

                  <ArrowRight size={21} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full min-h-[700px]">
        {/* SUB-HEADER BAR */}
        <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/numbers")}
              aria-label={isTagalog ? "Bumalik sa mapa" : "Back to map"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
                {isTagalog ? "Tutorial sa mga Numero (1–10)" : "Numbers Tutorial (1–10)"}
              </h1>
              <p className="text-sm font-medium text-slate-600 sm:text-base">
                {isTagalog ? "Matutunan ang mga numerong 1–10 hakbang-hakbang." : "Learn numbers 1–10 step by step."}
              </p>
            </div>
          </div>

          {/* QUICK CONTROLS: Language & Music / Mute */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => toggleLanguage()}
              className={`${chunkyButton} border-purple-300 bg-purple-100 text-purple-700 hover:bg-purple-200`}
            >
              <Languages size={22} />
              <span>{isTagalog ? "TL" : "EN"}</span>
            </button>

            <button
              type="button"
              onClick={() => toggleMusic()}
              aria-pressed={isMusicActive}
              aria-label={
                isMusicActive
                  ? isTagalog ? "I-mute ang tugtog" : "Mute music"
                  : isTagalog ? "I-unmute ang tugtog" : "Unmute music"
              }
              className={`${chunkyButton} ${
                isMusicActive
                  ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                  : "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {isMusicActive ? (
                <Volume2 size={22} className="animate-pulse motion-reduce:animate-none" />
              ) : (
                <VolumeX size={22} />
              )}
              <span className="hidden md:inline">
                {isMusicActive
                  ? isTagalog ? "Tugtog" : "Music"
                  : isTagalog ? "Naka-mute" : "Muted"}
              </span>
            </button>
          </div>
        </div>

        <div className="mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
          {syncBanner}
          <div className="mb-4">
            <p className="mb-2 text-sm font-extrabold text-[#164B9B]">
              {isTagalog ? `Numero ${currentIndex + 1} ng ${total}` : `Number ${currentIndex + 1} of ${total}`}
            </p>
            <div className="h-3 w-full overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-[#36A9F4]"
                style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* NUMBER CHIPS */}
          <div className="mb-5 flex w-full max-w-full gap-2 overflow-x-auto pb-2">
            {NUMBERS.map((num, position) => {
              const isCurrent = position === currentIndex;
              return (
                <button
                  key={num}
                  ref={(el) => {
                    chipRefs.current[position] = el;
                  }}
                  type="button"
                  onClick={async () => {
                    if (currentIndex <= CHECKPOINT_AFTER_INDEX && position > CHECKPOINT_AFTER_INDEX) return;
                    setCurrentIndex(position);
                    await saveProgress(position, partCompleted);
                  }}
                  className={`flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border-b-4 text-lg font-black ${
                    isCurrent
                      ? "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8]"
                      : "border-[#B8DDF6] bg-white text-[#426A91]"
                  }`}
                >
                  {num}
                </button>
              );
            })}
          </div>

          {/* TUTORIAL CARD */}
          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm md:grid-cols-[57%_43%]">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
              <video
                ref={videoRef}
                src="/videos/FSLnumbers.mp4"
                controls
                playsInline
                preload="metadata"
                onTimeUpdate={handleVideoTimeUpdate}
                onPlay={handleVideoPlay}
                className="h-full w-full object-contain"
              />
            </div>

            <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-6">
              <div className="flex flex-col items-center justify-center">
                <span className="text-4xl font-black text-[#426A91] sm:text-5xl">
                  {isTagalog ? `Numero ${currentNumber}` : `Number ${currentNumber}`}
                </span>
              </div>
              <div>
                <h2 className="mb-1 text-lg font-black text-[#454545]">
                  {isTagalog ? "Paglalarawan:" : "Description:"}
                </h2>
                <p className="text-base leading-relaxed text-[#555555]">
                  {description}
                </p>
              </div>
              <button
                type="button"
                onClick={handleReplay}
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-b-4 border-sky-700 bg-sky-500 font-extrabold text-white sm:w-auto sm:px-6"
              >
                <RotateCcw size={20} />
                {isTagalog ? "Panoorin ulit" : "Watch again"}
              </button>
            </div>
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {currentIndex > 0 ? (
              <button
                type="button"
                onClick={async () => {
                  const prev = currentIndex - 1;
                  setCurrentIndex(prev);
                  await saveProgress(prev, partCompleted);
                }}
                className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#79C5FA] bg-[#91D1FF] px-5 font-extrabold text-white"
              >
                <ArrowLeft size={21} />
                {isTagalog ? "Nakaraan" : "Previous"}
              </button>
            ) : (
              <span />
            )}

            <button
              type="button"
              onClick={handleNext}
              className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#B98AFF] bg-[#E5D3FF] px-5 font-extrabold text-[#A45CE8]"
            >
              {currentIndex === CHECKPOINT_AFTER_INDEX || isLast
                ? "Quick Test"
                : isTagalog
                  ? "Susunod"
                  : "Next"}
              {currentIndex === CHECKPOINT_AFTER_INDEX || isLast ? <Check size={21} /> : <ArrowRight size={21} />}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      {/* Background clouds */}
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

      {isMobileView ? (
        <div className="relative z-10 w-full">
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
            {renderContent(true)}
          </div>
        </div>
      )}
    </main>
  );
}