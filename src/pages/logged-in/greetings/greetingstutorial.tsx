import { useState, useRef, useEffect } from "react";
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

const GREETINGS_PART_1 = [
  "Greeting",
  "Hi",
  "Hello",
  "Good Morning",
  "Good Noon",
  "Good Afternoon",
  "Good Evening",
  "Good Night",
  "See You Soon",
  "See You Later",
  "See You Tomorrow",
  "See You Next Week",
  "Please",
  "Thank You",
];

// Greeting video timestamps in seconds.
const GREETING_TIMESTAMPS: Record<string, { start: number; end: number }> = {
  "Greeting": { start: 1, end: 9 },    
  "Hi": { start: 10, end: 18 },
  "Hello": { start: 19, end: 25 },
  "Good Morning": { start: 26, end: 37 },
  "Good Noon": { start: 39, end: 53 },
  "Good Afternoon": { start: 54, end: 66 },
  "Good Evening": { start: 67, end: 82 },
  "Good Night": { start: 83, end: 97 },
  "See You Soon": { start: 98, end: 110 },
  "See You Later": { start: 111, end: 123 },
  "See You Tomorrow": { start: 124, end: 137 },
  "See You Next Week": { start: 138, end: 152 },
  "Please": { start: 153, end: 160 },
  "Thank You": { start: 161, end: 171 },
};

// English descriptions
const DESCRIPTIONS_EN: Record<string, string> = {
  "Greeting": "Form an L-shaped hand with your thumb and index finger. Place your hand horizontally under your chin, then move it in a circular motion downward from your chin toward your chest.",
  "Hi": "Raise your open hand beside your face, with your palm facing outward. Move your hand gently from side to side as if waving.",
  "Hello": "Raise one open hand beside your face with your palm facing outward. Move your hand in a friendly greeting gesture.",
  "Good Morning": "Place one hand horizontally in front of your chest. Raise your other open hand beside your face, then move it outward while keeping your lower hand in place.",
  "Good Noon": "Hold one hand flat with the palm facing upward in front of your chest. Bring your other open hand down toward the center of your palm.",
  "Good Afternoon": "Position one hand flat and palm-up in front of your chest. Raise your other open hand above it, then bring it down toward the lower palm.",
  "Good Evening": "Bring both open hands in front of your chest with palms facing upward. Move them gently forward, then raise both hands toward the sides of your face.",
  "Good Night": "Bring your open hands together in front of your chest. Lower one hand over the other, following the demonstrated resting motion.",
  "See You Soon": "Bring both hands together in front of your chest. Touch your fingertips together and perform the small finger movement shown by the instructor.",
  "See You Later": "Raise your index and middle fingers together near your face. Move your hand slightly outward while maintaining the two-finger handshape.",
  "See You Tomorrow": "Form a thumbs-up handshape with one hand and position it near your shoulder. Move your hand forward as demonstrated.",
  "See You Next Week": "Raise your index and middle fingers near your face. Position your other hand horizontally in front of your chest, then bring the two-finger hand toward your other hand.",
  "Please": "Place one open hand over the center of your chest. Keep your fingers together and follow the demonstrated movement.",
  "Thank You": "Bring your fingertips toward your chin or mouth with your palm facing inward. Move your hand forward and away from your face.",
};

// Tagalog descriptions
const DESCRIPTIONS_TL: Record<string, string> = {
  "Greeting": "Bumuo ng hugis L gamit ang iyong hinlalaki at hintuturo. Ilagay ang iyong kamay nang pahalang sa ilalim ng iyong baba, pagkatapos ay igalaw ito nang paikot pababa mula sa iyong baba patungo sa iyong dibdib.",
  "Hi": "Itaas ang iyong bukas na kamay sa tabi ng iyong mukha, habang nakaharap ang iyong palad sa labas. Igalaw nang marahan ang iyong kamay pakaliwa't pakanan na parang kumakaway.",
  "Hello": "Itaas ang isang bukas na kamay sa tabi ng iyong mukha habang nakaharap ang palad sa labas sa isang magiliw na bati.",
  "Good Morning": "Ilagay ang isang kamay nang pahalang sa harap ng iyong dibdib. Itaas ang isa pang bukas na kamay sa tabi ng iyong mukha, pagkatapos ay iunat ito palabas habang nananatili sa pwesto ang ibabang kamay.",
  "Good Noon": "Hawakan ang isang kamay nang patag na nakaharap ang palad paitaas sa harap ng iyong dibdib. Dalhin ang isa pang bukas na kamay pababa patungo sa gitna ng iyong palad.",
  "Good Afternoon": "Iposisyon ang isang kamay nang patag at nakaharap paitaas sa harap ng iyong dibdib. Itaas ang isa pang bukas na kamay sa ibabaw nito, pagkatapos ay ibaba ito sa ibabang palad.",
  "Good Evening": "Dalhin ang parehong bukas na kamay sa harap ng iyong dibdib na nakaharap paitaas ang mga palad. Igalaw ito nang marahan pasulong, pagkatapos ay itaas ang parehong kamay sa gilid ng iyong mukha.",
  "Good Night": "Paglapitin ang iyong mga bukas na kamay sa harap ng iyong dibdib. Ibaba ang isang kamay sa ibabaw ng isa ayon sa ipinapakitang galaw.",
  "See You Soon": "Paglapitin ang magkabilang kamay sa harap ng iyong dibdib. Idikit ang mga dulo ng daliri at gawin ang maliit na galaw ng daliri na ipinakita.",
  "See You Later": "Itaas ang hintuturo at gitna nang magkasama malapit sa iyong mukha. Igalaw nang bahagya ang kamay palabas habang pinapanatili ang dalawang daliri.",
  "See You Tomorrow": "Bumuo ng hugis thumbs-up gamit ang isang kamay at ilagay malapit sa iyong balikat. Igalaw ang kamay pasulong.",
  "See You Next Week": "Itaas ang hintuturo at gitna malapit sa iyong mukha. Iposisyon ang kabilang kamay nang pahalang sa harap ng dibdib, pagkatapos ay ilapit ang dalawang daliri rito.",
  "Please": "Ilagay ang isang bukas na kamay sa gitna ng iyong dibdib. Panatilihing magkakalapit ang mga daliri at sundin ang galaw.",
  "Thank You": "Dalhin ang mga dulo ng iyong daliri patungo sa iyong baba o bibig habang nakaharap ang palad paloob. Igalaw ang kamay pasulong palayo sa mukha.",
};

const CHECKPOINT_AFTER_INDEX = 6; // Checkpoint sa kalagitnaan ng Part 1
const QUICK_TEST_LENGTH = 3;

type QuickTestQuestion = {
  questionEn: string;
  questionTl: string;
  greeting: string;
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
  pool: string[],
  seed: string
): QuickTestQuestion[] => {
  const random = seededRandom(seed);
  const selected = shuffleWithSeed(pool, random).slice(0, QUICK_TEST_LENGTH);

  return selected.map((item) => {
    const distractors = shuffleWithSeed(
      GREETINGS_PART_1.filter((candidate) => candidate !== item),
      random
    ).slice(0, 3);

    return {
      questionEn: "Which greeting matches this FSL sign?",
      questionTl: "Anong bati ang ipinapakita sa senyas na ito?",
      greeting: item,
      answer: item,
      options: shuffleWithSeed([item, ...distractors], random),
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

export default function GreetingsTutorialPart1() {
  const navigate = useNavigate();
  const { language, toggleLanguage } = useLanguage();
  const { isPlaying, volume, toggleMusic } = useAudio();
  const { user, loading: authLoading } = useAuth();
  const isTagalog = language === "tl";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuickTest, setIsQuickTest] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [answers, setAnswers] = useState<(string | null)[]>(
    Array(QUICK_TEST_LENGTH).fill(null)
  );

  const [quickTestQuestions, setQuickTestQuestions] = useState<QuickTestQuestion[]>([]);
  const [quickTestAttemptId, setQuickTestAttemptId] = useState<string | null>(null);
  const [partCompleted, setPartCompleted] = useState(false);

  const [progressLoading, setProgressLoading] = useState(true);
  const [syncFailed, setSyncFailed] = useState(false);
  const saveQueue = useRef<Promise<void>>(Promise.resolve());

  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = GREETINGS_PART_1.length;
  const currentGreeting = GREETINGS_PART_1[currentIndex];
  const isLast = currentIndex === total - 1;

  const checkpointNumber = currentIndex > CHECKPOINT_AFTER_INDEX ? 2 : 1;
  const checkpointPool =
    checkpointNumber === 1
      ? GREETINGS_PART_1.slice(0, CHECKPOINT_AFTER_INDEX + 1)
      : GREETINGS_PART_1.slice(CHECKPOINT_AFTER_INDEX + 1);

  const QUICK_TEST_QUESTIONS =
    quickTestQuestions.length === QUICK_TEST_LENGTH
      ? quickTestQuestions
      : createQuickTestQuestions(
          checkpointPool,
          `${user?.id ?? "guest"}-${PART_KEY}-checkpoint-${checkpointNumber}`
        );

  const timestamp = GREETING_TIMESTAMPS[currentGreeting] || { start: 0, end: 5 };
  const description = isTagalog
    ? DESCRIPTIONS_TL[currentGreeting]
    : DESCRIPTIONS_EN[currentGreeting];
  const isMusicActive = isPlaying && volume > 0;

  const queueSave = (operation: () => Promise<void>, label: string): Promise<boolean> => {
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
    greetingIndex: number,
    completed = false,
    score: number | null = null
  ): Promise<boolean> => {
    if (!user) {
      setSyncFailed(true);
      return Promise.resolve(false);
    }

    return queueSave(async () => {
      const now = new Date().toISOString();
      const progressData = {
        user_id: user.id,
        part_key: PART_KEY,
        tutorial_current_index: greetingIndex,
        tutorial_completed_at: completed ? now : null,
        updated_at: now,
      };

      const { error } = await supabase
        .from("greetings_progress")
        .upsert(progressData, { onConflict: "user_id,part_key" });

      if (error) throw error;
    }, "Unable to save greetings progress:");
  };

  const saveQuickTestProgress = (
    greetingIndex: number,
    questionIndex: number,
    savedAnswers: (string | null)[]
  ): Promise<boolean> => {
    if (!user) {
      setSyncFailed(true);
      return Promise.resolve(false);
    }

    return queueSave(async () => {
      const progressData = {
        user_id: user.id,
        part_key: PART_KEY,
        tutorial_current_index: greetingIndex,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase
        .from("greetings_progress")
        .upsert(progressData, { onConflict: "user_id,part_key" });

      if (error) throw error;
    }, "Unable to save quick test progress:");
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
          .from("greetings_progress")
          .select("*")
          .eq("user_id", user.id)
          .eq("part_key", PART_KEY)
          .maybeSingle();

        if (progressQueryError) throw progressQueryError;
        if (!isMounted) return;

        const savedIndex = Math.min(
          Math.max(Number(progress?.tutorial_current_index ?? 0), 0),
          GREETINGS_PART_1.length - 1
        );

        setCurrentIndex(savedIndex);
        setPartCompleted(Boolean(progress?.tutorial_completed_at));

        const { data: activeAttempts, error: attemptQueryError } = await supabase
          .from("greetings_assessment_attempts")
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

        const attemptCheckpoint = Number(activeAttempt?.checkpoint_number) === 1 ? 1 : 2;
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
              ? GREETINGS_PART_1.slice(0, CHECKPOINT_AFTER_INDEX + 1)
              : GREETINGS_PART_1.slice(CHECKPOINT_AFTER_INDEX + 1);

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
            checkpoint === 1 ? CHECKPOINT_AFTER_INDEX : GREETINGS_PART_1.length - 1;

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
        console.error("Error loading greetings progress:", err);
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
        ? GREETINGS_PART_1.slice(0, CHECKPOINT_AFTER_INDEX + 1)
        : GREETINGS_PART_1.slice(CHECKPOINT_AFTER_INDEX + 1);

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
        .from("greetings_assessment_attempts")
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
          .from("greetings_assessment_attempts")
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
          .from("greetings_assessment_attempts")
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

    const saved = await saveProgress(GREETINGS_PART_1.length - 1, true, score);
    if (!saved) return;

    setPartCompleted(true);
    resetQuickTestState();
    navigate("/greetings");
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
  }, [currentGreeting, timestamp.start, isQuickTest]);

  useEffect(() => {
    if (!isQuickTest) return;
    const video = testVideoRef.current;
    if (!video) return;

    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = GREETING_TIMESTAMPS[currentQ.greeting] || { start: 0, end: 5 };

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
    const qTimestamp = GREETING_TIMESTAMPS[currentQ.greeting] || { start: 0, end: 5 };
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
    const qTimestamp = GREETING_TIMESTAMPS[currentQ.greeting] || { start: 0, end: 5 };
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
    const qTimestamp = GREETING_TIMESTAMPS[currentQ.greeting] || { start: 0, end: 5 };
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
        ? "Hindi na-save o na-load ang iyong progreso. Pakisuri ang iyong internet connection."
        : "Your progress could not be saved or loaded. Please check your connection."}
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

  // Quick Test Mode View
  if (isQuickTest) {
    const currentQ = QUICK_TEST_QUESTIONS[testIndex];

    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
        <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
        <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

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
                  ? `Checkpoint ${checkpointNumber}: Bahagi 1`
                  : `Checkpoint ${checkpointNumber}: Part 1`}
              </p>
            </div>
          </div>
        </div>

        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
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
                src="/videos/FSLgreetings.mp4"
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
                      className={`flex h-14 items-center justify-center rounded-xl border-b-4 text-sm font-black transition-all disabled:cursor-not-allowed ${btnStyle}`}
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
                      ? "Magpatuloy sa Susunod"
                      : "Tapusin ang Bahagi 1"
                    : checkpointNumber === 1
                      ? "Continue"
                      : "Finish Part 1"}

                <ArrowRight size={21} strokeWidth={3} />
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      {/* SUB-HEADER BAR */}
      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/greetings")}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4]"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
              {isTagalog ? "Tutorial sa mga Bati (Bahagi 1)" : "Greetings Tutorial (Part 1)"}
            </h1>
            <p className="text-sm font-medium text-slate-600 sm:text-base">
              {isTagalog ? "Matutunan ang mga bati hakbang-hakbang." : "Learn greetings step by step."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={() => toggleLanguage()}
            className={`${chunkyButton} border-purple-300 bg-purple-100 text-purple-700`}
          >
            <Languages size={22} />
            <span>{isTagalog ? "TL" : "EN"}</span>
          </button>

          <button
            type="button"
            onClick={() => toggleMusic()}
            className={`${chunkyButton} ${isMusicActive ? "border-amber-300 bg-amber-100 text-amber-700" : "border-slate-300 bg-slate-100 text-slate-500"}`}
          >
            {isMusicActive ? <Volume2 size={22} /> : <VolumeX size={22} />}
          </button>
        </div>
      </div>

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        {syncBanner}
        <div className="mb-4">
          <p className="mb-2 text-sm font-extrabold text-[#164B9B]">
            {isTagalog ? `Bati ${currentIndex + 1} ng ${total}` : `Greeting ${currentIndex + 1} of ${total}`}
          </p>
          <div className="h-3 w-full overflow-hidden rounded-full bg-white/80">
            <div
              className="h-full rounded-full bg-[#36A9F4]"
              style={{ width: `${((currentIndex + 1) / total) * 100}%` }}
            />
          </div>
        </div>

        {/* GREETINGS CHIPS */}
        <div className="mb-5 flex w-full max-w-full gap-2 overflow-x-auto pb-2">
          {GREETINGS_PART_1.map((greeting, position) => {
            const isCurrent = position === currentIndex;
            return (
              <button
                key={greeting}
                ref={(el) => {
                  chipRefs.current[position] = el;
                }}
                type="button"
                onClick={async () => {
                  if (currentIndex <= CHECKPOINT_AFTER_INDEX && position > CHECKPOINT_AFTER_INDEX) return;
                  setCurrentIndex(position);
                  await saveProgress(position, partCompleted);
                }}
                className={`flex h-11 shrink-0 items-center justify-center px-4 rounded-xl border-b-4 text-sm font-black whitespace-nowrap ${
                  isCurrent
                    ? "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8]"
                    : "border-[#B8DDF6] bg-white text-[#426A91]"
                }`}
              >
                {greeting}
              </button>
            );
          })}
        </div>

        {/* TUTORIAL CARD */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm md:grid-cols-[57%_43%]">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
            <video
              ref={videoRef}
              src="/videos/FSLgreetings.mp4"
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
              <span className="text-2xl font-black text-[#426A91] text-center sm:text-3xl">
                {currentGreeting}
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
      </section>
    </main>
  );
}