
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Award,
} from "lucide-react";

import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

const ALPHABET = "NOPQRSTUVWXYZ".split("");
const PART_KEY = "part_2";

const CHECKPOINTS = {
  1: { start: 0, end: 5, nextIndex: 6 },
  2: { start: 6, end: 12, nextIndex: 12 },
} as const;

const ALPHABET_TIMESTAMPS: Record<
  string,
  { start: number; end: number }
> = {
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

const DESCRIPTIONS_EN: Record<string, string> = {
  N: "Curl your fingers toward your palm to form a fist. Keep your thumb tucked underneath the curled fingers.",
  O: "Curve your fingers and thumb inward until they form a rounded shape. Bring the fingertips close together to create an O shape.",
  P: "Bend your wrist and position your hand downward. Keep your fingers curled as demonstrated in the video.",
  Q: "Position your hand downward while keeping your fingers curled. Follow the thumb and index finger placement shown in the video.",
  R: "Extend your index finger upward while keeping your remaining fingers curled toward your palm. Follow the exact hand position shown in the video.",
  S: "Curl all four fingers tightly into your palm to form a fist. Place your thumb across the front of your curled fingers.",
  T: "Curl your fingers toward your palm and position your thumb between your fingers as demonstrated in the video.",
  U: "Extend your index and middle fingers straight upward and keep them close together. Curl your remaining fingers toward your palm.",
  V: "Extend your index and middle fingers upward and spread them apart to form a V shape. Curl your ring and little fingers toward your palm.",
  W: "Extend your index, middle, and ring fingers upward and spread them apart. Keep your thumb and little finger folded toward your palm.",
  X: "Curl your middle, ring, and little fingers toward your palm. Bend your index finger to form a hooked shape.",
  Y: "Extend your thumb and little finger outward while keeping your other three fingers curled toward your palm.",
  Z: "Extend your index finger while keeping your other fingers curled. Move your index finger to trace the letter Z in the air.",
};

const DESCRIPTIONS_TL: Record<string, string> = {
  N: "Tiklupin ang mga daliri patungo sa palad para bumuo ng kamao. Itago ang hinlalaki sa ilalim ng mga nakatiklop na daliri.",
  O: "Ikurba ang mga daliri at hinlalaki hanggang sa bumuo ito ng bilog na hugis. Paglapitin ang mga dulo ng daliri.",
  P: "Baluktutin ang pulso at ibaba ang kamay. Panatilihing nakatiklop ang mga daliri gaya ng ipinapakita sa video.",
  Q: "Iposisyon ang kamay pababa habang nakatiklop ang mga daliri. Sundin ang tamang pagkakalagay ng hinlalaki at hintuturo.",
  R: "Iunat ang hintuturo paitaas habang nakatiklop ang iba pang mga daliri. Sundin ang eksaktong posisyon ng kamay sa video.",
  S: "Tiklupin nang mahigpit ang lahat ng apat na daliri sa palad para maging kamao. Ilagay ang hinlalaki sa harap.",
  T: "Tiklupin ang mga daliri at ilagay ang hinlalaki sa pagitan ng mga daliri gaya ng ipinakita sa video.",
  U: "Iunat ang hintuturo at gitna paitaas nang magkakalapit. Tiklupin ang natitirang mga daliri patungo sa palad.",
  V: "Iunat ang hintuturo at gitna paitaas at paglayuin ito para bumuo ng V. Tiklupin ang singsing at kalingkingan.",
  W: "Iunat ang hintuturo, gitna, at singsing paitaas at paglayuin. Itupi ang hinlalaki at kalingkingan sa palad.",
  X: "Tiklupin ang gitna, singsing, at kalingkingan. Baluktutin ang hintuturo upang bumuo ng hugis kawit.",
  Y: "Iunat ang hinlalaki at kalingkingan palabas habang nakatiklop ang tatlong natitirang daliri sa palad.",
  Z: "Iunat ang hintuturo habang nakatiklop ang iba. Iguhit ang titik Z sa hangin gamit ang iyong hintuturo.",
};

type CheckpointNumber = 1 | 2;

type QuickTestQuestion = {
  questionEn: string;
  questionTl: string;
  letter: string;
  answer: string;
  options: string[];
};

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];

  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }

  return result;
};

const createQuickTestQuestions = (
  checkpointNumber: CheckpointNumber
): QuickTestQuestion[] => {
  const checkpoint = CHECKPOINTS[checkpointNumber];

  const questionLetters = shuffle(
    ALPHABET.slice(checkpoint.start, checkpoint.end + 1)
  ).slice(0, 3);

  return questionLetters.map((letter) => {
    const distractors = shuffle(
      ALPHABET.filter((candidate) => candidate !== letter)
    ).slice(0, 3);

    return {
      questionEn: "Which letter matches this FSL sign?",
      questionTl: "Anong titik ang ipinapakita sa senyas na ito?",
      letter,
      answer: letter,
      options: shuffle([letter, ...distractors]),
    };
  });
};

export default function AlphabetTutorialPart2() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const isTagalog = language === "tl";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuickTest, setIsQuickTest] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [questions, setQuestions] = useState<QuickTestQuestion[]>([]);
  const [attemptId, setAttemptId] = useState<string | null>(null);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [answers, setAnswers] = useState<(string | null)[]>([
    null,
    null,
    null,
  ]);

  const [progressLoading, setProgressLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressError, setProgressError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const pendingSaves = useRef(0);

  const total = ALPHABET.length;
  const currentLetter = ALPHABET[currentIndex];
  const isLast = currentIndex === total - 1;
  const timestamp = ALPHABET_TIMESTAMPS[currentLetter];

  const description = isTagalog
    ? DESCRIPTIONS_TL[currentLetter]
    : DESCRIPTIONS_EN[currentLetter];

  const getCheckpointNumber = (
    index: number
  ): CheckpointNumber => (index <= 5 ? 1 : 2);

  const getCheckpointLabel = (checkpoint: CheckpointNumber) =>
    `Checkpoint ${checkpoint}`;

  // --------------------------------------------------
  // SAVE PART 2 PROGRESS
  // --------------------------------------------------

  const saveProgress = (
    letterIndex: number,
    questionIndex: number,
    savedAnswers: (string | null)[],
    quickTestMode: boolean,
    completion?: {
      score: number;
      completedAt: string;
    }
  ): Promise<void> => {
    if (!user) {
      return Promise.reject(new Error("No authenticated user."));
    }

    const progressData = {
      user_id: user.id,
      part_key: PART_KEY,
      tutorial_current_index: letterIndex,
      tutorial_is_quick_test: quickTestMode,
      tutorial_test_index: questionIndex,
      tutorial_answers: savedAnswers,
      tutorial_score: completion?.score ?? null,
      tutorial_total_questions: completion ? 3 : null,
      tutorial_completed_at: completion?.completedAt ?? null,
      updated_at: new Date().toISOString(),
    };

    pendingSaves.current += 1;
    setProgressSaving(true);
    setProgressError("");

    const request = saveQueue.current.then(async () => {
      const { error } = await supabase
        .from("alphabet_progress")
        .upsert(progressData, {
          onConflict: "user_id,part_key",
        });

      if (error) throw error;
    });

    saveQueue.current = request.then(
      () => undefined,
      () => undefined
    );

    return request
      .catch((error) => {
        console.error("Unable to save Part 2 progress:", error);

        setProgressError(
          isTagalog
            ? "Hindi na-save ang iyong progreso. Pakisuri ang iyong internet connection at subukan muli."
            : "Your progress could not be saved. Please check your connection and try again."
        );

        throw error;
      })
      .finally(() => {
        pendingSaves.current -= 1;

        if (pendingSaves.current === 0) {
          setProgressSaving(false);
        }
      });
  };

  // --------------------------------------------------
  // CREATE A QUICK TEST ATTEMPT
  // --------------------------------------------------

  const startQuickTest = async (
    checkpointNumber: CheckpointNumber
  ) => {
    if (!user) throw new Error("No authenticated user.");

    const generatedQuestions =
      createQuickTestQuestions(checkpointNumber);

    const initialAnswers: (string | null)[] = [
      null,
      null,
      null,
    ];

    const startedAt = new Date().toISOString();

    const { data, error } = await supabase
      .from("alphabet_assessment_attempts")
      .insert({
        user_id: user.id,
        assessment_type: "quick_test",
        part_key: PART_KEY,
        checkpoint_number: checkpointNumber,
        questions: generatedQuestions,
        answers: initialAnswers,
        score: 0,
        total_questions: 3,
        status: "in_progress",
        started_at: startedAt,
      })
      .select("id")
      .single();

    if (error) throw error;

    setQuestions(generatedQuestions);
    setAnswers(initialAnswers);
    setTestIndex(0);
    setSelectedAnswer(null);
    setIsCorrect(null);
    setAttemptId(data.id);
    setIsQuickTest(true);

    await saveProgress(
      currentIndex,
      0,
      initialAnswers,
      true
    );
  };

  // --------------------------------------------------
  // LOAD SAVED PROGRESS AND ACTIVE ATTEMPT
  // --------------------------------------------------

  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setProgressLoading(false);
      setProgressError(
        isTagalog
          ? "Kailangan mong mag-sign in upang ma-access ang iyong progreso."
          : "You must be signed in to access your progress."
      );
      return;
    }

    let isMounted = true;

    const loadProgress = async () => {
      setProgressLoading(true);
      setProgressError("");

      try {
        const { data, error } = await supabase
          .from("alphabet_progress")
          .select(`
            tutorial_current_index,
            tutorial_is_quick_test,
            tutorial_test_index,
            tutorial_answers,
            tutorial_completed_at
          `)
          .eq("user_id", user.id)
          .eq("part_key", PART_KEY)
          .maybeSingle();

        if (error) throw error;
        if (!isMounted) return;

        if (!data) return;

        const savedLetterIndex = Number(
          data.tutorial_current_index ?? 0
        );

        const safeLetterIndex = Math.min(
          Math.max(savedLetterIndex, 0),
          ALPHABET.length - 1
        );

        setCurrentIndex(safeLetterIndex);

        const savedAnswers = Array.isArray(data.tutorial_answers)
          ? data.tutorial_answers
          : [];

        const restoredAnswers = Array.from(
          { length: 3 },
          (_, index) =>
            typeof savedAnswers[index] === "string"
              ? savedAnswers[index]
              : null
        );

        setAnswers(restoredAnswers);

        if (data.tutorial_completed_at) {
          setIsQuickTest(false);
          return;
        }

        if (data.tutorial_is_quick_test) {
          const checkpointNumber = getCheckpointNumber(
            safeLetterIndex
          );

          const { data: attempt, error: attemptError } =
            await supabase
              .from("alphabet_assessment_attempts")
              .select(`
                id,
                questions,
                answers,
                checkpoint_number
              `)
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

          if (attempt) {
            const restoredQuestions = Array.isArray(
              attempt.questions
            )
              ? (attempt.questions as QuickTestQuestion[])
              : [];

            const attemptAnswers = Array.isArray(attempt.answers)
              ? attempt.answers
              : [];

            if (restoredQuestions.length === 3) {
              // The current question index is stored in alphabet_progress,
              // not alphabet_assessment_attempts.
              const safeTestIndex = Math.min(
                Math.max(Number(data.tutorial_test_index ?? 0), 0),
                2
              );

              const restoredAttemptAnswers = Array.from(
                { length: 3 },
                (_, index) =>
                  typeof attemptAnswers[index] === "string"
                    ? attemptAnswers[index]
                    : null
              );

              setQuestions(restoredQuestions);
              setAnswers(restoredAttemptAnswers);
              setTestIndex(safeTestIndex);
              setAttemptId(attempt.id);

              const restoredAnswer =
                restoredAttemptAnswers[safeTestIndex];

              setSelectedAnswer(restoredAnswer);
              setIsCorrect(
                restoredAnswer === null
                  ? null
                  : restoredAnswer ===
                    restoredQuestions[safeTestIndex].answer
              );

              setIsQuickTest(true);
            }
          }
        }
      } catch (error) {
        console.error(
          "Unable to load Part 2 tutorial progress:",
          error
        );

        if (isMounted) {
          setProgressError(
            isTagalog
              ? "Hindi ma-load ang iyong na-save na progreso. Pakisubukang i-refresh ang page."
              : "Unable to load your saved progress. Please refresh the page and try again."
          );
        }
      } finally {
        if (isMounted) setProgressLoading(false);
      }
    };

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, isTagalog]);

  // --------------------------------------------------
  // VIDEO SEGMENT EFFECTS
  // --------------------------------------------------

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
  }, [currentLetter, timestamp.start, timestamp.end, isQuickTest]);

  useEffect(() => {
    if (!isQuickTest || questions.length === 0) return;

    const video = testVideoRef.current;
    if (!video) return;

    const currentQuestion = questions[testIndex];
    const questionTimestamp =
      ALPHABET_TIMESTAMPS[currentQuestion.letter];

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
      video.removeEventListener(
        "loadedmetadata",
        setTestVideoSegment
      );
    };
  }, [isQuickTest, testIndex, questions]);

  // --------------------------------------------------
  // LETTER PICKER AUTO-SCROLL
  // --------------------------------------------------

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

  // --------------------------------------------------
  // VIDEO CONTROLS
  // --------------------------------------------------

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (
      timestamp.end > timestamp.start &&
      video.currentTime >= timestamp.end
    ) {
      video.pause();
    }
  };

  const handleTestVideoTimeUpdate = () => {
    const video = testVideoRef.current;
    if (!video || questions.length === 0) return;

    const questionTimestamp =
      ALPHABET_TIMESTAMPS[questions[testIndex].letter];

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

    const questionTimestamp =
      ALPHABET_TIMESTAMPS[questions[testIndex].letter];

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

    video.currentTime =
      ALPHABET_TIMESTAMPS[questions[testIndex].letter].start;

    video.play().catch(() => {});
  };

  // --------------------------------------------------
  // TUTORIAL NAVIGATION
  // --------------------------------------------------

  const handleLetterChange = async (index: number) => {
    if (index < 0 || index >= ALPHABET.length) return;

    try {
      await saveProgress(
        index,
        testIndex,
        answers,
        false
      );

      setCurrentIndex(index);
    } catch {
      // Keep the current position if saving failed.
    }
  };

  const handleNext = async () => {
    if (progressSaving) return;

    const checkpointOneEnd = CHECKPOINTS[1].end;
    const checkpointTwoEnd = CHECKPOINTS[2].end;

    // The learner has reached the end of the first checkpoint.
    if (currentIndex === checkpointOneEnd) {
      try {
        await startQuickTest(1);
      } catch (error) {
        console.error("Unable to start Checkpoint 1:", error);
        setProgressError(
          isTagalog
            ? "Hindi masimulan ang pagsusulit. Pakisubukang muli."
            : "Unable to start the Quick Test. Please try again."
        );
      }

      return;
    }

    // The learner has reached the end of the second checkpoint.
    if (currentIndex === checkpointTwoEnd) {
      try {
        await startQuickTest(2);
      } catch (error) {
        console.error("Unable to start Checkpoint 2:", error);
        setProgressError(
          isTagalog
            ? "Hindi masimulan ang pagsusulit. Pakisubukang muli."
            : "Unable to start the Quick Test. Please try again."
        );
      }

      return;
    }

    if (!isLast) {
      const nextIndex = currentIndex + 1;

      try {
        await saveProgress(
          nextIndex,
          testIndex,
          answers,
          false
        );

        setCurrentIndex(nextIndex);
      } catch {
        // Do not advance if saving failed.
      }
    }
  };

  // --------------------------------------------------
  // QUICK TEST ANSWERS
  // --------------------------------------------------

  const handleAnswerSelect = async (option: string) => {
    if (
      selectedAnswer !== null ||
      progressSaving ||
      !attemptId ||
      questions.length !== 3
    ) {
      return;
    }

    const currentQuestion = questions[testIndex];

    if (!currentQuestion.options.includes(option)) return;

    const updatedAnswers = [...answers];
    updatedAnswers[testIndex] = option;

    try {
      // The assessment table has no question_index column.
      // Only update fields that actually exist in its schema.
      const { error } = await supabase
        .from("alphabet_assessment_attempts")
        .update({
          answers: updatedAnswers,
        })
        .eq("id", attemptId)
        .eq("user_id", user?.id)
        .eq("part_key", PART_KEY);

      if (error) throw error;

      await saveProgress(
        currentIndex,
        testIndex,
        updatedAnswers,
        true
      );

      setAnswers(updatedAnswers);
      setSelectedAnswer(option);
      setIsCorrect(option === currentQuestion.answer);
    } catch (error) {
      console.error("Unable to save Quick Test answer:", error);
      setProgressError(
        isTagalog
          ? "Hindi na-save ang iyong sagot. Pakisubukang muli."
          : "Your answer could not be saved. Please try again."
      );
    }
  };

  const handleNextTestQuestion = async () => {
    if (
      selectedAnswer === null ||
      progressSaving ||
      !attemptId ||
      questions.length !== 3
    ) {
      return;
    }

    if (testIndex < questions.length - 1) {
      const nextIndex = testIndex + 1;

      try {
        // Save the next question position in alphabet_progress.
        // alphabet_assessment_attempts does not have question_index.
        await saveProgress(
          currentIndex,
          nextIndex,
          answers,
          true
        );

        setTestIndex(nextIndex);

        const nextAnswer = answers[nextIndex] ?? null;
        setSelectedAnswer(nextAnswer);
        setIsCorrect(
          nextAnswer === null
            ? null
            : nextAnswer === questions[nextIndex].answer
        );
      } catch (error) {
        console.error("Unable to move to the next question:", error);
        setProgressError(
          isTagalog
            ? "Hindi ma-save ang kasalukuyang tanong. Pakisubukang muli."
            : "Unable to save your current question. Please try again."
        );
      }

      return;
    }

    const score = answers.reduce((totalScore, answer, index) => {
      return answer === questions[index].answer
        ? totalScore + 1
        : totalScore;
    }, 0);

    const completedAt = new Date().toISOString();

    try {
      const { error: attemptError } = await supabase
        .from("alphabet_assessment_attempts")
        .update({
          answers,
          score,
          total_questions: 3,
          status: "completed",
          completed_at: completedAt,
        })
        .eq("id", attemptId)
        .eq("user_id", user?.id)
        .eq("part_key", PART_KEY);

      if (attemptError) throw attemptError;

      await saveProgress(
        currentIndex,
        testIndex,
        answers,
        true,
        {
          score,
          completedAt,
        }
      );

      if (getCheckpointNumber(currentIndex) === 1) {
        // Checkpoint 1: return to the tutorial at letter T.
        await saveProgress(
          CHECKPOINTS[1].nextIndex,
          0,
          [null, null, null],
          false
        );

        setCurrentIndex(CHECKPOINTS[1].nextIndex);
        setAnswers([null, null, null]);
        setTestIndex(0);
        setQuestions([]);
        setAttemptId(null);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setIsQuickTest(false);
      } else {
        // Checkpoint 2: Part 2 is complete.
        // Completion is recorded using tutorial_completed_at.
        navigate("/alphabet");
      }
    } catch (error) {
      console.error("Unable to complete Quick Test:", error);
      setProgressError(
        isTagalog
          ? "Hindi makumpleto ang pagsusulit. Pakisubukang muli."
          : "Unable to complete the Quick Test. Please try again."
      );
    }
  };

  const handleQuickTestBack = async () => {
    if (progressSaving) return;

    try {
      await saveProgress(
        currentIndex,
        testIndex,
        answers,
        false
      );

      setIsQuickTest(false);
      setSelectedAnswer(null);
      setIsCorrect(null);
    } catch {
      // Keep the learner in the test if saving failed.
    }
  };

  // --------------------------------------------------
  // LOADING STATE
  // --------------------------------------------------

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
  // QUICK TEST MODE
  // --------------------------------------------------

  if (isQuickTest && questions.length === 3) {
    const currentQuestion = questions[testIndex];

    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
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
                {getCheckpointLabel(
                  getCheckpointNumber(currentIndex)
                )}{" "}
                ·{" "}
                {isTagalog
                  ? "Subukan ang iyong natutunan."
                  : "Test what you've learned."}
              </p>
            </div>
          </div>
        </div>

        <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
        <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />

        <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
          {progressError && (
            <div
              role="alert"
              className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700"
            >
              {progressError}
            </div>
          )}

          {progressSaving && (
            <p className="mb-3 text-xs font-medium text-slate-500">
              {isTagalog
                ? "Sine-save ang progreso..."
                : "Saving progress..."}
            </p>
          )}

          <div className="mb-4">
            <p className="mb-2 text-sm font-extrabold text-[#164B9B] sm:text-base">
              {isTagalog
                ? `Tanong ${testIndex + 1} ng 3`
                : `Question ${testIndex + 1} of 3`}
            </p>

            <div
              className="h-3 w-full overflow-hidden rounded-full bg-white/80"
              aria-hidden="true"
            >
              <div
                className="h-full rounded-full bg-[#36A9F4] transition-all duration-300"
                style={{
                  width: `${((testIndex + 1) / 3) * 100}%`,
                }}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm md:grid-cols-[57%_43%]">
            <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
              <video
                ref={testVideoRef}
                src="/videos/FSLalphabet.mp4"
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
                      disabled={
                        selectedAnswer !== null || progressSaving
                      }
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
                    ? "Tapusin ang Pagsusulit"
                    : "Finish Test"}

                <ArrowRight size={21} strokeWidth={3} />
              </button>
            </div>
          )}
        </section>
      </main>
    );
  }

  // --------------------------------------------------
  // STANDARD TUTORIAL MODE
  // --------------------------------------------------

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/alphabet")}
            aria-label={
              isTagalog
                ? "Bumalik sa menu ng alpabeto"
                : "Back to alphabet menu"
            }
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>

          <div>
            <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
              {isTagalog ? "Tutorial sa Alpabeto" : "Alphabet Tutorial"}
            </h1>
            <p className="text-sm font-medium text-slate-600 sm:text-base">
              {isTagalog
                ? "Matutunan ang mga titik N–Z gamit ang gabay na ito."
                : "Learn letters N–Z step by step."}
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        {progressError && (
          <div
            role="alert"
            className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm font-semibold text-rose-700"
          >
            {progressError}
          </div>
        )}

        {progressSaving && (
          <p className="mb-3 text-xs font-medium text-slate-500">
            {isTagalog ? "Sine-save ang progreso..." : "Saving progress..."}
          </p>
        )}

        <div className="mb-4">
          <p className="mb-2 text-sm font-extrabold text-[#164B9B] sm:text-base">
            {isTagalog
              ? `Titik ${currentIndex + 1} ng ${total}`
              : `Letter ${currentIndex + 1} of ${total}`}
          </p>

          <div
            className="h-3 w-full overflow-hidden rounded-full bg-white/80"
            aria-hidden="true"
          >
            <div
              className="h-full rounded-full bg-[#36A9F4] transition-all duration-300 motion-reduce:transition-none"
              style={{
                width: `${((currentIndex + 1) / total) * 100}%`,
              }}
            />
          </div>
        </div>

        <div
          className="mb-5 flex w-full max-w-full gap-2 overflow-x-auto pb-2 scrollbar-none"
          role="group"
          aria-label={isTagalog ? "Piliin ang titik" : "Choose a letter"}
        >
          {ALPHABET.map((letter, position) => {
            const isCurrent = position === currentIndex;

            return (
              <button
                key={letter}
                ref={(element) => {
                  chipRefs.current[position] = element;
                }}
                type="button"
                onClick={() => handleLetterChange(position)}
                disabled={progressSaving}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={
                  isTagalog ? `Titik ${letter}` : `Letter ${letter}`
                }
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border-b-4 text-lg font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none disabled:cursor-not-allowed disabled:opacity-60 ${
                  isCurrent
                    ? "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8]"
                    : "border-[#B8DDF6] bg-white text-[#426A91] hover:-translate-y-0.5 hover:bg-slate-50 motion-reduce:hover:translate-y-0"
                }`}
              >
                {letter}
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm md:grid-cols-[57%_43%]">
          <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-black">
            <video
              ref={videoRef}
              src="/videos/FSLalphabet.mp4"
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
              <span className="text-5xl font-black text-[#426A91] sm:text-6xl">
                {isTagalog
                  ? `Titik ${currentLetter}`
                  : `Letter ${currentLetter}`}
              </span>
            </div>

            <div>
              <h2 className="mb-1 text-lg font-black text-[#454545] sm:text-xl">
                {isTagalog ? "Paglalarawan:" : "Description:"}
              </h2>

              <p className="text-base leading-relaxed text-[#555555] sm:text-lg">
                {description}
              </p>
            </div>

            <button
              type="button"
              onClick={handleReplay}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-full border-b-4 border-sky-700 bg-sky-500 text-base font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-sky-600 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:w-auto sm:self-start sm:px-6"
            >
              <RotateCcw size={20} aria-hidden="true" />
              {isTagalog ? "Panoorin ulit" : "Watch again"}
            </button>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={() => handleLetterChange(currentIndex - 1)}
              disabled={progressSaving}
              className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#79C5FA] bg-[#91D1FF] px-5 text-lg font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#70BFFF] active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
            >
              <ArrowLeft
                size={21}
                strokeWidth={3}
                aria-hidden="true"
              />
              {isTagalog ? "Nakaraan" : "Previous"}
            </button>
          ) : (
            <span aria-hidden="true" />
          )}

          <button
            type="button"
            onClick={handleNext}
            disabled={progressSaving}
            className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#B98AFF] bg-[#E5D3FF] px-5 text-lg font-extrabold text-[#A45CE8] transition-all hover:-translate-y-0.5 hover:bg-[#D8BCFF] active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
          >
            {currentIndex === 5 || currentIndex === 12
              ? "Quick Test"
              : isTagalog
                ? "Susunod"
                : "Next"}

            {currentIndex === 5 || currentIndex === 12 ? (
              <Check
                size={21}
                strokeWidth={3}
                aria-hidden="true"
              />
            ) : (
              <ArrowRight
                size={21}
                strokeWidth={3}
                aria-hidden="true"
              />
            )}
          </button>
        </div>
      </section>
    </main>
  );
}
