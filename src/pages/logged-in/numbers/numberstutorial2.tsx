import { useState, useRef, useEffect, useLayoutEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Award,
  Languages,
  Volume2,
  VolumeX,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";
import { useAudio } from "../../../context/AudioContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

const NUMBERS = Array.from({ length: 10 }, (_, index) => String(index + 11)); // "11" ... "20"
const PART_KEY = "part_2";
const QUICK_TEST_LENGTH = 3;

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

// Indexes inside NUMBERS: 0-4 = numbers 11-15, 5-9 = numbers 16-20
const CHECKPOINTS = {
  1: { start: 0, end: 4, nextIndex: 5, label: "11–15" },
  2: { start: 5, end: 9, nextIndex: 9, label: "16–20" },
} as const;

const NUMBER_TIMESTAMPS: Record<string, { start: number; end: number }> = {
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

const DESCRIPTIONS_EN: Record<string, string> = Object.fromEntries(
  NUMBERS.map((num) => [
    num,
    `Watch the video closely and copy the hand shape and movement for number ${num}.`,
  ])
);

const DESCRIPTIONS_TL: Record<string, string> = Object.fromEntries(
  NUMBERS.map((num) => [
    num,
    `Panoorin nang mabuti ang video at gayahin ang hugis ng kamay at galaw para sa numerong ${num}.`,
  ])
);

type CheckpointNumber = 1 | 2;

type QuickTestQuestion = {
  questionEn: string;
  questionTl: string;
  number: string;
  answer: string;
  options: string[];
};

type ProgressErrorKey =
  | "save"
  | "load"
  | "signIn"
  | "startTest"
  | "saveAnswer"
  | "saveQuestion"
  | "completeTest";

const ERROR_MESSAGES: Record<ProgressErrorKey, { en: string; tl: string }> = {
  save: {
    en: "Your progress could not be saved. Please check your connection and try again.",
    tl: "Hindi na-save ang iyong progreso. Pakisuri ang iyong internet connection at subukan muli.",
  },
  load: {
    en: "Unable to load your saved progress. Please refresh the page and try again.",
    tl: "Hindi ma-load ang iyong na-save na progreso. Pakisubukang i-refresh ang page.",
  },
  signIn: {
    en: "You must be signed in to access your progress.",
    tl: "Kailangan mong mag-sign in upang ma-access ang iyong progreso.",
  },
  startTest: {
    en: "Unable to start the Quick Test. Please try again.",
    tl: "Hindi masimulan ang pagsusulit. Pakisubukang muli.",
  },
  saveAnswer: {
    en: "Your answer could not be saved. Please try again.",
    tl: "Hindi na-save ang iyong sagot. Pakisubukang muli.",
  },
  saveQuestion: {
    en: "Unable to save your current question. Please try again.",
    tl: "Hindi ma-save ang kasalukuyang tanong. Pakisubukang muli.",
  },
  completeTest: {
    en: "Unable to complete the Quick Test. Please try again.",
    tl: "Hindi makumpleto ang pagsusulit. Pakisubukang muli.",
  },
};

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const createQuickTestQuestions = (
  checkpointNumber: CheckpointNumber
): QuickTestQuestion[] => {
  const checkpoint = CHECKPOINTS[checkpointNumber];

  const questionNumbers = shuffle(
    NUMBERS.slice(checkpoint.start, checkpoint.end + 1)
  ).slice(0, QUICK_TEST_LENGTH);

  return questionNumbers.map((num) => {
    const distractors = shuffle(
      NUMBERS.filter((candidate) => candidate !== num)
    ).slice(0, 3);

    return {
      questionEn: "Which number matches this FSL sign?",
      questionTl: "Anong numero ang ipinapakita sa senyas na ito?",
      number: num,
      answer: num,
      options: shuffle([num, ...distractors]),
    };
  });
};

const getCheckpointNumber = (index: number): CheckpointNumber =>
  index <= CHECKPOINTS[1].end ? 1 : 2;

const emptyAnswers = (): (string | null)[] =>
  Array(QUICK_TEST_LENGTH).fill(null);

const chunkyButton =
  "flex h-12 shrink-0 items-center gap-2 rounded-2xl border-b-4 px-3 text-sm font-extrabold " +
  "whitespace-nowrap sm:text-base md:px-4 " +
  "transition-all duration-150 select-none " +
  "hover:-translate-y-0.5 active:translate-y-0.5 active:border-b-2 " +
  "focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 " +
  "motion-reduce:transition-none motion-reduce:hover:transform-none";

export default function NumbersTutorialPart2() {
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
  const [questions, setQuestions] = useState<QuickTestQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [attemptCheckpoint, setAttemptCheckpoint] =
    useState<CheckpointNumber | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>(emptyAnswers());

  const [progressLoading, setProgressLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressError, setProgressError] = useState<ProgressErrorKey | null>(
    null
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const pendingSaves = useRef(0);

  const completionRef = useRef<{
    score: number | null;
    completedAt: string | null;
  }>({ score: null, completedAt: null });

  const total = NUMBERS.length;
  const currentNumber = NUMBERS[currentIndex];
  const timestamp = NUMBER_TIMESTAMPS[currentNumber] ?? { start: 0, end: 5 };
  const isMusicActive = isPlaying && volume > 0;

  const description = isTagalog
    ? DESCRIPTIONS_TL[currentNumber]
    : DESCRIPTIONS_EN[currentNumber];

  const isCheckpointEnd =
    currentIndex === CHECKPOINTS[1].end || currentIndex === CHECKPOINTS[2].end;

  const errorText = progressError
    ? isTagalog
      ? ERROR_MESSAGES[progressError].tl
      : ERROR_MESSAGES[progressError].en
    : "";

  const saveProgress = (
    numberIndex: number,
    questionIndex: number,
    savedAnswers: (string | null)[],
    quickTestMode: boolean,
    completion?: { score: number; completedAt: string }
  ): Promise<void> => {
    if (!user) {
      return Promise.reject(new Error("No authenticated user."));
    }

    const result = completion ?? completionRef.current;

    const progressData = {
      user_id: user.id,
      part_key: PART_KEY,
      tutorial_current_index: numberIndex,
      tutorial_is_quick_test: quickTestMode,
      tutorial_test_index: questionIndex,
      tutorial_answers: savedAnswers,
      tutorial_score: result.score,
      tutorial_total_questions: result.completedAt ? QUICK_TEST_LENGTH : null,
      tutorial_completed_at: result.completedAt,
      updated_at: new Date().toISOString(),
    };

    pendingSaves.current += 1;
    setProgressSaving(true);
    setProgressError(null);

    const request = saveQueue.current.then(async () => {
      const { error } = await supabase
        .from("numbers_progress")
        .upsert(progressData, { onConflict: "user_id,part_key" });

      if (error) throw error;
    });

    saveQueue.current = request.then(
      () => undefined,
      () => undefined
    );

    return request
      .then(() => {
        if (completion) completionRef.current = completion;
      })
      .catch((error) => {
        console.error("Unable to save Part 2 numbers progress:", error);
        setProgressError("save");
        throw error;
      })
      .finally(() => {
        pendingSaves.current -= 1;

        if (pendingSaves.current === 0) {
          setProgressSaving(false);
        }
      });
  };

  const startQuickTest = async (checkpointNumber: CheckpointNumber) => {
    if (!user) throw new Error("No authenticated user.");

    const generatedQuestions = createQuickTestQuestions(checkpointNumber);
    const initialAnswers = emptyAnswers();

    const { data, error } = await supabase
      .from("numbers_assessment_attempts")
      .insert({
        user_id: user.id,
        assessment_type: "quick_test",
        part_key: PART_KEY,
        checkpoint_number: checkpointNumber,
        questions: generatedQuestions,
        answers: initialAnswers,
        score: 0,
        total_questions: QUICK_TEST_LENGTH,
        status: "in_progress",
        started_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (error) throw error;

    await saveProgress(currentIndex, 0, initialAnswers, true);

    setQuestions(generatedQuestions);
    setAnswers(initialAnswers);
    setTestIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttemptId(data.id);
    setAttemptCheckpoint(checkpointNumber);
    setIsQuickTest(true);
  };

  const openQuickTest = async (checkpointNumber: CheckpointNumber) => {
    if (
      attemptId &&
      attemptCheckpoint === checkpointNumber &&
      questions.length === QUICK_TEST_LENGTH
    ) {
      await saveProgress(currentIndex, testIndex, answers, true);

      const savedAnswer = answers[testIndex] ?? null;
      setSelectedAnswer(savedAnswer);
      setIsCorrect(
        savedAnswer === null
          ? null
          : savedAnswer === questions[testIndex].answer
      );
      setIsQuickTest(true);
      return;
    }

    await startQuickTest(checkpointNumber);
  };

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProgressLoading(false);
      setProgressError("signIn");
      return;
    }

    let isMounted = true;

    const loadProgress = async () => {
      setProgressLoading(true);
      setProgressError(null);

      try {
        const { data, error } = await supabase
          .from("numbers_progress")
          .select(
            "tutorial_current_index, tutorial_is_quick_test, tutorial_test_index, tutorial_score, tutorial_completed_at"
          )
          .eq("user_id", user.id)
          .eq("part_key", PART_KEY)
          .maybeSingle();

        if (error) throw error;
        if (!isMounted) return;
        if (!data) return;

        const safeNumberIndex = Math.min(
          Math.max(Number(data.tutorial_current_index ?? 0), 0),
          NUMBERS.length - 1
        );

        setCurrentIndex(safeNumberIndex);

        completionRef.current = {
          score:
            data.tutorial_score === null || data.tutorial_score === undefined
              ? null
              : Number(data.tutorial_score),
          completedAt: data.tutorial_completed_at ?? null,
        };

        if (data.tutorial_completed_at) {
          setIsQuickTest(false);
          return;
        }

        if (!data.tutorial_is_quick_test) return;

        const checkpointNumber = getCheckpointNumber(safeNumberIndex);

        const { data: attempt, error: attemptError } = await supabase
          .from("numbers_assessment_attempts")
          .select("id, questions, answers, checkpoint_number")
          .eq("user_id", user.id)
          .eq("part_key", PART_KEY)
          .eq("assessment_type", "quick_test")
          .eq("checkpoint_number", checkpointNumber)
          .eq("status", "in_progress")
          .order("started_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (attemptError) throw attemptError;
        if (!isMounted) return;
        if (!attempt) return;

        const restoredQuestions = Array.isArray(attempt.questions)
          ? (attempt.questions as QuickTestQuestion[])
          : [];

        if (restoredQuestions.length !== QUICK_TEST_LENGTH) return;

        const attemptAnswers = Array.isArray(attempt.answers)
          ? attempt.answers
          : [];

        const restoredAnswers = Array.from(
          { length: QUICK_TEST_LENGTH },
          (_, index) =>
            typeof attemptAnswers[index] === "string"
              ? (attemptAnswers[index] as string)
              : null
        );

        const safeTestIndex = Math.min(
          Math.max(Number(data.tutorial_test_index ?? 0), 0),
          QUICK_TEST_LENGTH - 1
        );

        const restoredAnswer = restoredAnswers[safeTestIndex];

        setQuestions(restoredQuestions);
        setAnswers(restoredAnswers);
        setTestIndex(safeTestIndex);
        setAttemptId(attempt.id);
        setAttemptCheckpoint(checkpointNumber);
        setSelectedAnswer(restoredAnswer);
        setIsCorrect(
          restoredAnswer === null
            ? null
            : restoredAnswer === restoredQuestions[safeTestIndex].answer
        );
        setIsQuickTest(true);
      } catch (error) {
        console.error("Unable to load Part 2 numbers progress:", error);
        if (isMounted) setProgressError("load");
      } finally {
        if (isMounted) setProgressLoading(false);
      }
    };

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (isQuickTest) return;

    const video = videoRef.current;
    if (!video) return;

    const setVideoSegment = () => {
      video.pause();
      video.currentTime = timestamp.start;
    };

    if (video.readyState >= 1) {
      setVideoSegment();
    } else {
      video.addEventListener("loadedmetadata", setVideoSegment, {
        once: true,
      });
    }

    return () => {
      video.removeEventListener("loadedmetadata", setVideoSegment);
    };
  }, [currentNumber, timestamp.start, timestamp.end, isQuickTest]);

  useEffect(() => {
    if (!isQuickTest || questions.length === 0) return;

    const video = testVideoRef.current;
    if (!video) return;

    const currentQuestion = questions[testIndex];
    if (!currentQuestion) return;

    const questionTimestamp = NUMBER_TIMESTAMPS[currentQuestion.number] ?? {
      start: 0,
      end: 5,
    };

    const setTestVideoSegment = () => {
      video.pause();
      video.currentTime = questionTimestamp.start;
    };

    if (video.readyState >= 1) {
      setTestVideoSegment();
    } else {
      video.addEventListener("loadedmetadata", setTestVideoSegment, {
        once: true,
      });
    }

    return () => {
      video.removeEventListener("loadedmetadata", setTestVideoSegment);
    };
  }, [isQuickTest, testIndex, questions]);

  useEffect(() => {
    if (isQuickTest) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    chipRefs.current[currentIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [currentIndex, isQuickTest]);

  const getTestTimestamp = () => {
    const question = questions[testIndex];
    return (
      (question && NUMBER_TIMESTAMPS[question.number]) ?? { start: 0, end: 5 }
    );
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (timestamp.end > timestamp.start && video.currentTime >= timestamp.end) {
      video.pause();
    }
  };

  const handleTestVideoTimeUpdate = () => {
    const video = testVideoRef.current;
    if (!video || questions.length === 0) return;

    const questionTimestamp = getTestTimestamp();

    if (
      questionTimestamp.end > questionTimestamp.start &&
      video.currentTime >= questionTimestamp.end
    ) {
      video.pause();
    }
  };

  const handleVideoPlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (
      video.currentTime >= timestamp.end - 0.1 ||
      video.currentTime < timestamp.start
    ) {
      video.currentTime = timestamp.start;
    }
  };

  const handleTestVideoPlay = () => {
    const video = testVideoRef.current;
    if (!video || questions.length === 0) return;

    const questionTimestamp = getTestTimestamp();

    if (
      video.currentTime >= questionTimestamp.end - 0.1 ||
      video.currentTime < questionTimestamp.start
    ) {
      video.currentTime = questionTimestamp.start;
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
    if (!video || questions.length === 0) return;

    video.currentTime = getTestTimestamp().start;
    video.play().catch(() => {});
  };

  const handleNumberChange = async (index: number) => {
    if (index < 0 || index >= NUMBERS.length) return;

    if (currentIndex <= CHECKPOINTS[1].end && index > CHECKPOINTS[1].end) {
      return;
    }

    try {
      await saveProgress(index, testIndex, answers, false);
      setCurrentIndex(index);
    } catch {
      // Keep current position if saving failed
    }
  };

  const handleNext = async () => {
    if (progressSaving) return;

    if (isCheckpointEnd) {
      const checkpointNumber = getCheckpointNumber(currentIndex);

      try {
        await openQuickTest(checkpointNumber);
      } catch (error) {
        console.error(
          `Unable to start Checkpoint ${checkpointNumber}:`,
          error
        );
        setProgressError("startTest");
      }

      return;
    }

    const nextIndex = currentIndex + 1;

    try {
      await saveProgress(nextIndex, testIndex, answers, false);
      setCurrentIndex(nextIndex);
    } catch {
      // Do not advance if saving failed
    }
  };

  const handleAnswerSelect = async (option: string) => {
    if (
      !user ||
      selectedAnswer !== null ||
      progressSaving ||
      !attemptId ||
      questions.length !== QUICK_TEST_LENGTH
    ) {
      return;
    }

    const currentQuestion = questions[testIndex];

    if (!currentQuestion.options.includes(option)) return;

    const updatedAnswers = [...answers];
    updatedAnswers[testIndex] = option;

    try {
      const { error } = await supabase
        .from("numbers_assessment_attempts")
        .update({ answers: updatedAnswers })
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .eq("part_key", PART_KEY);

      if (error) throw error;

      await saveProgress(currentIndex, testIndex, updatedAnswers, true);

      setAnswers(updatedAnswers);
      setSelectedAnswer(option);
      setIsCorrect(option === currentQuestion.answer);
    } catch (error) {
      console.error("Unable to save Quick Test answer:", error);
      setProgressError("saveAnswer");
    }
  };

  const resetQuickTestState = () => {
    setAnswers(emptyAnswers());
    setTestIndex(0);
    setQuestions([]);
    setAttemptId(null);
    setAttemptCheckpoint(null);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setIsQuickTest(false);
  };

  const handleNextTestQuestion = async () => {
    if (
      !user ||
      selectedAnswer === null ||
      progressSaving ||
      !attemptId ||
      questions.length !== QUICK_TEST_LENGTH
    ) {
      return;
    }

    if (testIndex < questions.length - 1) {
      const nextTestIndex = testIndex + 1;

      try {
        await saveProgress(currentIndex, nextTestIndex, answers, true);

        setTestIndex(nextTestIndex);

        const nextAnswer = answers[nextTestIndex] ?? null;
        setSelectedAnswer(nextAnswer);
        setIsCorrect(
          nextAnswer === null
            ? null
            : nextAnswer === questions[nextTestIndex].answer
        );
      } catch (error) {
        console.error("Unable to move to the next question:", error);
        setProgressError("saveQuestion");
      }

      return;
    }

    const score = answers.reduce<number>(
      (totalScore, answer, index) =>
        answer === questions[index].answer ? totalScore + 1 : totalScore,
      0
    );

    const completedAt = new Date().toISOString();
    const checkpointNumber =
      attemptCheckpoint ?? getCheckpointNumber(currentIndex);

    try {
      const { error: attemptError } = await supabase
        .from("numbers_assessment_attempts")
        .update({
          answers,
          score,
          total_questions: QUICK_TEST_LENGTH,
          status: "completed",
          completed_at: completedAt,
        })
        .eq("id", attemptId)
        .eq("user_id", user.id)
        .eq("part_key", PART_KEY);

      if (attemptError) throw attemptError;

      if (checkpointNumber === 1) {
        await saveProgress(
          CHECKPOINTS[1].nextIndex,
          0,
          emptyAnswers(),
          false
        );

        setCurrentIndex(CHECKPOINTS[1].nextIndex);
        resetQuickTestState();
      } else {
        await saveProgress(
          CHECKPOINTS[2].nextIndex,
          0,
          emptyAnswers(),
          false,
          { score, completedAt }
        );

        resetQuickTestState();
        navigate("/numbers");
      }
    } catch (error) {
      console.error("Unable to complete Quick Test:", error);
      setProgressError("completeTest");
    }
  };

  const handleQuickTestBack = async () => {
    if (progressSaving) return;

    try {
      await saveProgress(currentIndex, testIndex, answers, false);

      setIsQuickTest(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } catch {
      // Keep learner in test if saving failed
    }
  };

  const errorBanner = errorText ? (
    <div
      role="alert"
      className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700"
    >
      {errorText}
    </div>
  ) : null;

  const savingNote = progressSaving ? (
    <p className="mb-3 text-xs font-medium text-slate-500">
      {isTagalog ? "Sine-save ang progreso..." : "Saving progress..."}
    </p>
  ) : null;

  if (authLoading || progressLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#E4F4FF] px-4">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-[#B8DDF6] border-t-[#36A9F4]" />
          <p className="font-bold text-[#164B9B]">
            {isTagalog
              ? "Nilo-load ang iyong progreso..."
              : "Loading your progress..."}
          </p>
        </div>
      </main>
    );
  }

  // --------------------------------------------------
  // RENDER CONTENT FUNCTION (ZOOM-PROOF)
  // --------------------------------------------------

  const renderContent = (_isDesktop: boolean) => {
    if (isQuickTest && questions.length === QUICK_TEST_LENGTH) {
      const currentQuestion = questions[testIndex];
      const checkpointNumber =
        attemptCheckpoint ?? getCheckpointNumber(currentIndex);

      return (
        <div className="relative w-full min-h-[700px]">
          {/* SUB-HEADER: back button, title, and quick controls */}
          <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleQuickTestBack}
                disabled={progressSaving}
                aria-label={
                  isTagalog ? "Bumalik sa tutorial" : "Back to tutorial"
                }
                className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={22} strokeWidth={2.5} />
              </button>
              <div>
                <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
                  {isTagalog ? "Mabilis na Pagsusulit" : "Quick Test"}
                </h1>
                <p className="text-sm font-medium text-slate-600 sm:text-base">
                  {isTagalog
                    ? `Checkpoint ${checkpointNumber}: mga numero ${CHECKPOINTS[checkpointNumber].label}`
                    : `Checkpoint ${checkpointNumber}: numbers ${CHECKPOINTS[checkpointNumber].label}`}
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
            {errorBanner}
            {savingNote}

            <div className="mb-4">
              <p className="mb-2 text-sm font-extrabold text-[#164B9B] sm:text-base">
                {isTagalog
                  ? `Tanong ${testIndex + 1} ng ${QUICK_TEST_LENGTH}`
                  : `Question ${testIndex + 1} of ${QUICK_TEST_LENGTH}`}
              </p>

              <div
                className="h-3 w-full overflow-hidden rounded-full bg-white/80"
                aria-hidden="true"
              >
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

                <h2 className="text-lg font-black leading-relaxed text-[#454545] sm:text-xl">
                  {isTagalog
                    ? currentQuestion.questionTl
                    : currentQuestion.questionEn}
                </h2>

                <div className="grid grid-cols-2 gap-3">
                  {currentQuestion.options.map((option) => {
                    let buttonStyle =
                      "border-[#B8DDF6] bg-white text-[#426A91] hover:bg-slate-50";

                    if (selectedAnswer === option) {
                      buttonStyle = isCorrect
                        ? "border-emerald-500 bg-emerald-100 text-emerald-700"
                        : "border-rose-500 bg-rose-100 text-rose-700";
                    } else if (
                      selectedAnswer &&
                      option === currentQuestion.answer
                    ) {
                      buttonStyle =
                        "border-emerald-500 bg-emerald-100 text-emerald-700";
                    }

                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={selectedAnswer !== null || progressSaving}
                        onClick={() => handleAnswerSelect(option)}
                        className={`flex h-14 items-center justify-center rounded-xl border-b-4 text-xl font-black transition-all disabled:cursor-not-allowed ${buttonStyle}`}
                      >
                        {option}
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
                  className={`text-base font-extrabold ${
                    isCorrect ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {isCorrect
                    ? isTagalog
                      ? "Magaling! Tama ang sagot mo! 🎉"
                      : "Great job! Correct answer! 🎉"
                    : isTagalog
                      ? `Mali! Ang tamang sagot ay ${currentQuestion.answer}.`
                      : `Incorrect! The correct answer is ${currentQuestion.answer}.`}
                </p>

                <button
                  type="button"
                  onClick={handleNextTestQuestion}
                  disabled={progressSaving}
                  className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-lg font-extrabold text-white transition hover:bg-sky-600 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {testIndex < questions.length - 1
                    ? isTagalog
                      ? "Susunod na Tanong"
                      : "Next Question"
                    : isTagalog
                      ? checkpointNumber === 1
                        ? "Magpatuloy sa 16–20"
                        : "Tapusin"
                      : checkpointNumber === 1
                        ? "Continue to 16–20"
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
        {/* SUB-HEADER: back button, title, and quick controls */}
        <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate("/numbers")}
              aria-label={
                isTagalog ? "Bumalik sa menu ng mga numero" : "Back to numbers menu"
              }
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>
            <div>
              <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
                {isTagalog
                  ? "Tutorial sa mga Numero (11–20)"
                  : "Numbers Tutorial (11–20)"}
              </h1>
              <p className="text-sm font-medium text-slate-600 sm:text-base">
                {isTagalog
                  ? "Matutunan ang mga numerong 11–20 hakbang-hakbang."
                  : "Learn numbers 11–20 step by step."}
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
          {errorBanner}
          {savingNote}

          <div className="mb-4">
            <p className="mb-2 text-sm font-extrabold text-[#164B9B] sm:text-base">
              {isTagalog
                ? `Numero ${currentNumber} (${currentIndex + 1} ng ${total})`
                : `Number ${currentNumber} (${currentIndex + 1} of ${total})`}
            </p>

            <div
              className="h-3 w-full overflow-hidden rounded-full bg-white/80"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-[#36A9F4] transition-all duration-300 motion-reduce:transition-none"
                style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
              />
            </div>
          </div>

          {/* NUMBER CHIPS */}
          <div
            className="mb-5 flex w-full max-w-full gap-2 overflow-x-auto pb-2"
            role="group"
            aria-label={isTagalog ? "Piliin ang numero" : "Choose a number"}
          >
            {NUMBERS.map((num, position) => {
              const isCurrent = position === currentIndex;
              const isLocked =
                currentIndex <= CHECKPOINTS[1].end &&
                position > CHECKPOINTS[1].end;

              return (
                <button
                  key={num}
                  ref={(element) => {
                    chipRefs.current[position] = element;
                  }}
                  type="button"
                  onClick={() => handleNumberChange(position)}
                  disabled={progressSaving || isLocked}
                  aria-current={isCurrent ? "step" : undefined}
                  aria-label={isTagalog ? `Numero ${num}` : `Number ${num}`}
                  className={`flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border-b-4 text-lg font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${
                    isCurrent
                      ? "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8]"
                      : "border-[#B8DDF6] bg-white text-[#426A91] hover:-translate-y-0.5 hover:bg-slate-50 motion-reduce:hover:translate-y-0"
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
                className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-b-4 border-sky-700 bg-sky-500 font-extrabold text-white sm:w-auto sm:self-start sm:px-6"
              >
                <RotateCcw size={20} aria-hidden="true" />
                {isTagalog ? "Panoorin ulit" : "Watch again"}
              </button>
            </div>
          </div>

          {/* NAVIGATION BUTTONS */}
          <div className="mt-6 flex items-center justify-between gap-3">
            {currentIndex > 0 ? (
              <button
                type="button"
                onClick={() => handleNumberChange(currentIndex - 1)}
                disabled={progressSaving}
                className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#79C5FA] bg-[#91D1FF] px-5 font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#70BFFF] active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={21} strokeWidth={3} aria-hidden="true" />
                {isTagalog ? "Nakaraan" : "Previous"}
              </button>
            ) : (
              <span aria-hidden="true" />
            )}

            <button
              type="button"
              onClick={handleNext}
              disabled={progressSaving}
              className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#B98AFF] bg-[#E5D3FF] px-5 font-extrabold text-[#A45CE8] transition-all hover:-translate-y-0.5 hover:bg-[#D8BCFF] active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isCheckpointEnd ? "Quick Test" : isTagalog ? "Susunod" : "Next"}
              {isCheckpointEnd ? (
                <Check size={21} strokeWidth={3} aria-hidden="true" />
              ) : (
                <ArrowRight size={21} strokeWidth={3} aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

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