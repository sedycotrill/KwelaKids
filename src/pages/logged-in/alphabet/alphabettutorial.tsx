import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, RotateCcw, Award } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { supabase } from "../../../lib/supabase";

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const ALPHABET_TIMESTAMPS: Record<string, { start: number; end: number }> = {
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

const DESCRIPTIONS_EN: Record<string, string> = {
  A: "Close all four fingers into a fist by curling them toward your palm. Keep your thumb resting alongside the curled fingers. Hold your hand upright.",
  B: "Extend all four fingers upward and keep them close together. Fold your thumb across your palm, resting it against the base of your fingers.",
  C: "Curve your fingers and thumb to form a rounded C shape. Leave an open space between your fingertips and thumb.",
  D: "Extend your index finger straight upward. Bend your middle, ring, and little fingers toward your palm, with your thumb positioned near the curled fingers.",
  E: "Curl all four fingers inward toward your palm. Bend your thumb alongside the curled fingers to form the handshape shown in the video.",
  F: "Extend your fingers upward as demonstrated in the video. Keep the remaining fingers positioned close together and maintain the demonstrated thumb position.",
  G: "Extend your index finger sideways while pointing your thumb upward. Curl your middle, ring, and little fingers toward your palm.",
  H: "Extend your fingers together in the direction shown in the video. Keep your thumb positioned alongside your fingers.",
  I: "Extend your little finger straight upward while keeping your other fingers curled toward your palm.",
  J: "Form the handshape shown in the video and follow its demonstrated finger position and movement to complete the letter J.",
  K: "Extend your index and middle fingers while keeping the other fingers curled. Position your thumb between the extended and curled fingers as demonstrated.",
  L: "Extend your index finger straight upward and your thumb sideways. Keep your middle, ring, and little fingers curled toward your palm to form an L shape.",
  M: "Curl all four fingers toward your palm to form a closed fist. Position your thumb underneath the curled fingers as shown in the video.",
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
  A: "Isara ang apat na daliri upang bumuo ng kamao patungo sa iyong palad. Panatilihing nakadikit ang hinlalaki sa gilid ng mga nakatiklop na daliri.",
  B: "Iunat ang apat na daliri paitaas at panatilihing magkakalapit ang mga ito. Itupi ang hinlalaki sa ibabaw ng iyong palad.",
  C: "Baluktutin ang iyong mga daliri at hinlalaki upang bumuo ng hugis C. Mag-iwan ng puwang sa pagitan ng iyong mga dulo ng daliri at hinlalaki.",
  D: "Iunat nang tuwid paitaas ang iyong hintuturo. Itupi ang gitna, singsing, at kalingkingan patungo sa iyong palad.",
  E: "Ikurba ang lahat ng apat na daliri papasok sa iyong palad. Itupi ang hinlalaki sa tabi ng mga nakatiklop na daliri.",
  F: "Iunat ang mga daliri paitaas tulad ng ipinakita sa video. Panatilihing magkakalapit ang natitirang mga daliri.",
  G: "Iunat ang hintuturo patagilid habang nakaturo paitaas ang hinlalaki. Tiklupin ang gitna, singsing, at kalingkingan.",
  H: "Iunat ang mga daliri nang magkasama ayon sa direksyon sa video. Panatilihing nakaposisyon ang hinlalaki sa tabi ng mga daliri.",
  I: "Iunat ang kalingkingan paitaas habang nakatiklop ang iba pang mga daliri patungo sa palad.",
  J: "Buuin ang hugis ng kamay sa video at sundin ang galaw ng mga daliri upang makumpleto ang titik J.",
  K: "Iunat ang hintuturo at gitna habang nakatiklop ang iba. Ilagay ang hinlalaki sa pagitan ng nakunat at nakatiklop na mga daliri.",
  L: "Iunat ang hintuturo paitaas at ang hinlalaki patagilid para bumuo ng hugis L habang nakatiklop ang ibang mga daliri.",
  M: "Tiklupin ang apat na daliri patungo sa palad para bumuo ng saradong kamao. Ilagay ang hinlalaki sa ilalim ng mga daliri.",
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

// Mga tanong sa Quick Test na may kasamang tamang timestamp para sa video
const QUICK_TEST_QUESTIONS = [
  {
    questionEn: "Which letter matches this FSL sign?",
    questionTl: "Anong titik ang ipinapakita sa senyas na ito?",
    letter: "A",
    answer: "A",
    options: ["A", "C", "E", "S"]
  },
  {
    questionEn: "Which letter matches this FSL sign?",
    questionTl: "Anong titik ang ipinapakita sa senyas na ito?",
    letter: "U",
    answer: "U",
    options: ["U", "V", "W", "L"]
  },
  {
    questionEn: "Which letter matches this FSL sign?",
    questionTl: "Anong titik ang ipinapakita sa senyas na ito?",
    letter: "D",
    answer: "D",
    options: ["B", "D", "I", "L"]
  }
];


export default function AlphabetTutorial() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const isTagalog = language === "tl";

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isQuickTest, setIsQuickTest] = useState(false);
  const [testIndex, setTestIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const [answers, setAnswers] = useState<(string | null)[]>(() =>
    QUICK_TEST_QUESTIONS.map(() => null)
  );

  const [progressLoading, setProgressLoading] = useState(true);
  const [progressSaving, setProgressSaving] = useState(false);
  const [progressError, setProgressError] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const testVideoRef = useRef<HTMLVideoElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Serialize saves so older requests cannot overwrite newer progress.
  const saveQueue = useRef<Promise<void>>(Promise.resolve());
  const pendingSaves = useRef(0);

  const total = ALPHABET.length;
  const currentLetter = ALPHABET[currentIndex];
  const isLast = currentIndex === total - 1;

  const timestamp = ALPHABET_TIMESTAMPS[currentLetter];

  const description = isTagalog
    ? DESCRIPTIONS_TL[currentLetter]
    : DESCRIPTIONS_EN[currentLetter];

  // --------------------------------------------------
  // LOAD SAVED PROGRESS
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
          .maybeSingle();

        if (error) throw error;
        if (!isMounted) return;

        if (data) {
          const savedLetterIndex = Number(
            data.tutorial_current_index ?? 0
          );

          const savedTestIndex = Number(
            data.tutorial_test_index ?? 0
          );

          const safeLetterIndex = Math.min(
            Math.max(savedLetterIndex, 0),
            ALPHABET.length - 1
          );

          const safeTestIndex = Math.min(
            Math.max(savedTestIndex, 0),
            QUICK_TEST_QUESTIONS.length - 1
          );

          const savedAnswers = Array.isArray(data.tutorial_answers)
            ? data.tutorial_answers
            : [];

          const restoredAnswers = QUICK_TEST_QUESTIONS.map((question, index) => {
            const answer = savedAnswers[index];

            return typeof answer === "string" &&
              question.options.includes(answer)
              ? answer
              : null;
          });

          setCurrentIndex(safeLetterIndex);
          setTestIndex(safeTestIndex);
          setAnswers(restoredAnswers);

          const restoredAnswer = restoredAnswers[safeTestIndex];

          setSelectedAnswer(restoredAnswer);

          setIsCorrect(
            restoredAnswer === null
              ? null
              : restoredAnswer ===
                  QUICK_TEST_QUESTIONS[safeTestIndex].answer
          );

          // Completed learners return to the tutorial for review.
          // Unfinished learners resume their saved tutorial/test state.
          if (data.tutorial_completed_at) {
            setIsQuickTest(false);
          } else {
            setIsQuickTest(Boolean(data.tutorial_is_quick_test));
          }
        }
      } catch (error) {
        console.error(
          "Unable to load alphabet tutorial progress:",
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
        if (isMounted) {
          setProgressLoading(false);
        }
      }
    };

    void loadProgress();

    return () => {
      isMounted = false;
    };
  }, [user, authLoading, isTagalog]);

  // --------------------------------------------------
  // SAVE PROGRESS
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
      tutorial_current_index: letterIndex,
      tutorial_is_quick_test: quickTestMode,
      tutorial_test_index: questionIndex,
      tutorial_answers: savedAnswers,
      updated_at: new Date().toISOString(),
      ...(completion
        ? {
            tutorial_score: completion.score,
            tutorial_total_questions: QUICK_TEST_QUESTIONS.length,
            tutorial_completed_at: completion.completedAt,
          }
        : {}),
    };

    pendingSaves.current += 1;
    setProgressSaving(true);
    setProgressError("");

    const request = saveQueue.current.then(async () => {
      const { error } = await supabase
        .from("alphabet_progress")
        .upsert(progressData, {
          onConflict: "user_id",
        });

      if (error) throw error;
    });

    // Keep the queue alive after a failed request, but preserve
    // the original request's rejection for the caller to handle.
    saveQueue.current = request.then(
      () => undefined,
      () => undefined
    );

    return request
      .catch((error) => {
        console.error("Unable to save alphabet progress:", error);

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
    if (!isQuickTest) return;

    const video = testVideoRef.current;
    if (!video) return;

    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = ALPHABET_TIMESTAMPS[currentQ.letter];

    const setTestVideoSegment = () => {
      video.pause();
      video.currentTime = qTimestamp.start;
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
  }, [isQuickTest, testIndex]);

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
    if (!video) return;

    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = ALPHABET_TIMESTAMPS[currentQ.letter];

    if (
      qTimestamp.end > qTimestamp.start &&
      video.currentTime >= qTimestamp.end
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
    if (!video) return;

    const currentQ = QUICK_TEST_QUESTIONS[testIndex];
    const qTimestamp = ALPHABET_TIMESTAMPS[currentQ.letter];

    if (
      video.currentTime >= qTimestamp.end - 0.1 ||
      video.currentTime < qTimestamp.start
    ) {
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

    video.currentTime = ALPHABET_TIMESTAMPS[currentQ.letter].start;
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
        // Do not advance if progress could not be saved.
      }

      return;
    }

    try {
      await saveProgress(
        currentIndex,
        testIndex,
        answers,
        true
      );

      setIsQuickTest(true);
    } catch {
      // Do not enter the test if saving failed.
    }
  };

  // --------------------------------------------------
  // QUICK TEST
  // --------------------------------------------------

  const handleAnswerSelect = async (option: string) => {
    if (selectedAnswer !== null || progressSaving) return;

    const currentQ = QUICK_TEST_QUESTIONS[testIndex];

    if (!currentQ.options.includes(option)) return;

    const updatedAnswers = [...answers];
    updatedAnswers[testIndex] = option;

    try {
      await saveProgress(
        currentIndex,
        testIndex,
        updatedAnswers,
        true
      );

      setAnswers(updatedAnswers);
      setSelectedAnswer(option);
      setIsCorrect(option === currentQ.answer);
    } catch {
      // Do not accept an answer that could not be saved.
    }
  };

  const handleNextTestQuestion = async () => {
    if (selectedAnswer === null || progressSaving) return;

    if (testIndex < QUICK_TEST_QUESTIONS.length - 1) {
      const nextIndex = testIndex + 1;
      const nextAnswer = answers[nextIndex] ?? null;

      try {
        await saveProgress(
          currentIndex,
          nextIndex,
          answers,
          true
        );

        setTestIndex(nextIndex);
        setSelectedAnswer(nextAnswer);

        setIsCorrect(
          nextAnswer === null
            ? null
            : nextAnswer === QUICK_TEST_QUESTIONS[nextIndex].answer
        );
      } catch {
        // Stay on the current question if saving failed.
      }

      return;
    }

    const score = answers.reduce((totalScore, answer, index) => {
      return answer === QUICK_TEST_QUESTIONS[index].answer
        ? totalScore + 1
        : totalScore;
    }, 0);

    const completedAt = new Date().toISOString();

    try {
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

      navigate("/alphabetcomplete", {
        state: {
          score,
          total: QUICK_TEST_QUESTIONS.length,
        },
      });
    } catch {
      // The learner stays on the final question so they can retry.
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

  if (isQuickTest) {
    const currentQ = QUICK_TEST_QUESTIONS[testIndex];

    return (
      <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
        <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleQuickTestBack}
              disabled={progressSaving}
              aria-label={isTagalog ? "Bumalik sa tutorial" : "Back to tutorial"}
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ArrowLeft size={22} strokeWidth={2.5} />
            </button>

            <div>
              <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
                {isTagalog ? "Mabilis na Pagsusulit" : "Quick Test"}
              </h1>
              <p className="text-sm font-medium text-slate-600 sm:text-base">
                {isTagalog ? "Subukan ang iyong natutunan." : "Test what you've learned."}
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
              {isTagalog ? "Sine-save ang progreso..." : "Saving progress..."}
            </p>
          )}

          <div className="mb-4">
            <p className="mb-2 text-sm font-extrabold text-[#164B9B] sm:text-base">
              {isTagalog
                ? `Tanong ${testIndex + 1} ng ${QUICK_TEST_QUESTIONS.length}`
                : `Question ${testIndex + 1} of ${QUICK_TEST_QUESTIONS.length}`}
            </p>

            <div className="h-3 w-full overflow-hidden rounded-full bg-white/80" aria-hidden="true">
              <div
                className="h-full rounded-full bg-[#36A9F4] transition-all duration-300"
                style={{
                  width: `${((testIndex + 1) / QUICK_TEST_QUESTIONS.length) * 100}%`,
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
                      disabled={selectedAnswer !== null || progressSaving}
                      onClick={() => handleAnswerSelect(opt)}
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
              <p className={`text-base font-extrabold ${isCorrect ? "text-emerald-600" : "text-rose-600"}`}>
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
                onClick={handleNextTestQuestion}
                disabled={progressSaving}
                className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-2xl border-b-4 border-sky-700 bg-sky-500 text-lg font-extrabold text-white transition hover:bg-sky-600 active:border-b-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {testIndex < QUICK_TEST_QUESTIONS.length - 1
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
            aria-label={isTagalog ? "Bumalik sa menu ng alpabeto" : "Back to alphabet menu"}
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
                ? "Matutunan ang bawat titik gamit ang gabay na ito."
                : "Learn each letter step by step."}
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

        {/* LETTER PICKER */}
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
                aria-label={isTagalog ? `Titik ${letter}` : `Letter ${letter}`}
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
                {isTagalog ? `Titik ${currentLetter}` : `Letter ${currentLetter}`}
              </span>
            </div>

            <div>
              <h2 className="mb-1 text-lg font-black text-[#454545] sm:text-xl">
                {isTagalog ? "Paglalarawan:" : "Descriptions:"}
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
            className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#B98AFF] bg-[#E5D3FF] px-5 text-lg font-extrabold text-[#A45CE8] transition-all hover:-translate-y-0.5 hover:bg-[#D8BCFF] active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50 sm:px-6"
          >
            {isLast
              ? isTagalog
                ? "Quick Test"
                : "Quick Test"
              : isTagalog
                ? "Susunod"
                : "Next"}

            {isLast ? (
              <Check size={21} strokeWidth={3} aria-hidden="true" />
            ) : (
              <ArrowRight size={21} strokeWidth={3} aria-hidden="true" />
            )}
          </button>
        </div>
      </section>
    </main>
  );
}
