
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
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

const VIDEO_URL = "/videos/FSLalphabet.mp4";

const TOTAL_QUESTIONS = 26;
const PASSING_PERCENTAGE = 75;

const PASSING_SCORE = Math.ceil(
  (TOTAL_QUESTIONS * PASSING_PERCENTAGE) / 100
);

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/*
 * Video timestamps for each FSL alphabet letter.
 *
 * The timestamp is determined by the question's letter,
 * not its position in the randomized question array.
 */
const ALPHABET_TIMESTAMPS: Record<
  string,
  { start: number; end: number }
> = {
  A: { start: 5.50, end: 8.25 },
  B: { start: 8.25, end: 10.75 },
  C: { start: 10.75, end: 13.00 },
  D: { start: 13.00, end: 15.50 },
  E: { start: 15.50, end: 17.75 },
  F: { start: 17.75, end: 20.00 },
  G: { start: 20.00, end: 22.25 },
  H: { start: 22.25, end: 24.25 },
  I: { start: 24.25, end: 25.75 },
  J: { start: 25.75, end: 28.00 },
  K: { start: 28.00, end: 30.00 },
  L: { start: 30.00, end: 32.50 },
  M: { start: 32.50, end: 34.75 },
  N: { start: 34.75, end: 36.75 },
  O: { start: 36.75, end: 39.25 },
  P: { start: 39.25, end: 41.50 },
  Q: { start: 41.50, end: 43.25 },
  R: { start: 43.25, end: 45.50 },
  S: { start: 45.50, end: 47.75 },
  T: { start: 47.75, end: 50.00 },
  U: { start: 50.00, end: 52.25 },
  V: { start: 52.25, end: 54.25 },
  W: { start: 54.25, end: 56.25 },
  X: { start: 56.25, end: 58.25 },
  Y: { start: 58.25, end: 60.00 },
  Z: { start: 60.00, end: 63.25 },
};

const VIDEO_END_BUFFER = 0.05;

/* ---------------------------------------------------------
   QUESTION HELPERS
--------------------------------------------------------- */

/* Fisher-Yates shuffle. */
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

/*
 * Creates a new shuffled Championship question set.
 *
 * Question order and answer-option order are randomized
 * independently.
 */
const createChampionshipQuestions =
  (): ChampionshipQuestion[] => {
    const shuffledLetters = shuffleArray(ALPHABET);

    return shuffledLetters.map((letter) => {
      const distractors = shuffleArray(
        ALPHABET.filter((item) => item !== letter)
      ).slice(0, 3);

      const options = shuffleArray([
        letter,
        ...distractors,
      ]);

      return {
        id: `championship-${letter}`,
        letter,
        answer: letter,
        options,
        question_en: "Which letter matches this FSL sign?",
        question_tl:
          "Anong titik ang ipinapakita sa senyas na ito?",
      };
    });
  };

/*
 * Validate the saved question structure before using it.
 */
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

/*
 * Normalize persisted answers.
 */
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
   CHAMPIONSHIP COMPONENT
--------------------------------------------------------- */

export default function Championship() {
  const navigate = useNavigate();

  const [searchParams] = useSearchParams();

  const { language } = useLanguage();
  const { user, loading: authLoading } = useAuth();

  const isTagalog = language === "tl";

  /*
   * Explicit retry request.
   *
   * When true, the component must create a fresh attempt
   * without checking completed or unfinished attempts.
   */
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

  /*
   * While feedback is displayed, remain on the question
   * that was just answered.
   */
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

  /*
   * Video segment follows the current question's letter.
   */
  const currentTimestamp = currentQuestion
    ? ALPHABET_TIMESTAMPS[currentQuestion.letter] ?? null
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
      ? `Tanong ${Math.min(
          answers.length + (showFeedback ? 0 : 1),
          TOTAL_QUESTIONS
        )} sa ${TOTAL_QUESTIONS}`
      : `Question ${Math.min(
          answers.length + (showFeedback ? 0 : 1),
          TOTAL_QUESTIONS
        )} of ${TOTAL_QUESTIONS}`,

    chooseAnswer: isTagalog
      ? "Piliin ang tamang titik."
      : "Choose the correct letter.",

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
      ? "Panoorin ang senyas at piliin ang titik na tumutugma rito."
      : "Watch the sign and select the letter that matches it.",
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
            if (!cancelled) {
              console.error(
                "Championship video playback error:",
                playError
              );

              onPlaybackError?.(playError);
            }
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

  /*
   * Automatically play the correct segment whenever
   * the active question changes.
   */
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

  /*
   * Stop playback before the next letter's segment begins.
   */
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

  /* ---------------------------------------------------------
     WATCH THE CURRENT SIGN AGAIN
  --------------------------------------------------------- */

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
        .from("alphabet_assessment_attempts")
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
          "Championship completion error:",
          updateError
        );

        setError(
          isTagalog
            ? "Hindi ma-save ang resulta. Pakisubukang muli."
            : "Your result could not be saved. Please try again."
        );

        return;
      }

      /*
       * Open the result page using the exact completed
       * attempt UUID.
       */
      navigate(
        `/alphabetcomplete?attempt=${encodeURIComponent(data.id)}`
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

      /*
       * Consume the explicit retry parameter.
       *
       * IMPORTANT:
       * forceNewAttempt remains true for this initialization
       * even after the URL is replaced.
       *
       * This prevents a refresh from accidentally creating
       * another fresh attempt.
       */
      if (forceNewAttempt) {
        navigate("/championship", { replace: true });
      }

      /*
       * NORMAL ACCESS:
       *
       * First check whether the user already has a completed
       * Championship attempt.
       *
       * If one exists, redirect to that result immediately.
       *
       * This check is deliberately skipped when the user
       * explicitly chooses Try Again.
       */
      if (!forceNewAttempt) {
        const {
          data: completedAttempt,
          error: completedError,
        } = await supabase
          .from("alphabet_assessment_attempts")
          .select("id")
          .eq("user_id", userId)
          .eq("assessment_type", "championship")
          .eq("part_key", "3")
          .eq("status", "completed")
          .order("completed_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (completedError) {
          throw completedError;
        }

        if (completedAttempt) {
          /*
           * A completed record already exists.
           * Do not resume or insert another attempt.
           */
          navigate(
            `/alphabetcomplete?attempt=${encodeURIComponent(
              completedAttempt.id
            )}`,
            { replace: true }
          );

          return;
        }
      }

      /*
       * Only retrieve an unfinished attempt when this
       * is NOT an intentional fresh-attempt request.
       *
       * This happens only after confirming that there
       * is no completed attempt.
       */
      let existingAttempt: any = null;

      if (!forceNewAttempt) {
        const {
          data,
          error: attemptError,
        } = await supabase
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

        existingAttempt = data;
      }

      let activeAttempt: AssessmentAttempt;

      if (existingAttempt) {
        /*
         * Resume the latest unfinished attempt.
         */
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
              ? "Hindi wasto ang naka-save na Championship attempt."
              : "The saved Championship attempt is invalid."
          );
        }

        /*
         * Verify that the saved answers correspond to
         * the saved question order and have no duplicates.
         */
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
        /*
         * No unfinished attempt exists, or the user
         * explicitly requested a fresh attempt.
         *
         * Create a NEW row with a NEW UUID.
         */
        const newQuestions =
          createChampionshipQuestions();

        const {
          data: insertedAttempt,
          error: insertError,
        } = await supabase
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
              ? "Hindi maihanda ang mga tanong sa Championship."
              : "The Championship questions could not be prepared."
          );
        }
      }

      /*
       * Restore the selected attempt.
       */
      setAttemptId(activeAttempt.id);
      setQuestions(activeAttempt.questions);
      setAnswers(activeAttempt.answers);

      setSelectedAnswer(null);
      setShowFeedback(false);

      /*
       * If all answers were saved but the completion
       * update did not finish, complete the same attempt.
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
      console.error(
        "Error loading Championship:",
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

  /*
   * Initialize once AuthContext has finished loading.
   */
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
      /*
       * Save the answer immediately.
       *
       * select("id").maybeSingle() verifies that the
       * expected in-progress attempt was actually updated.
       */
      const { data, error: saveError } = await supabase
        .from("alphabet_assessment_attempts")
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
          "The Championship attempt could not be updated."
        );
      }

      /*
       * Only update the interface after the database
       * confirms that the answer was saved.
       */
      setAnswers(updatedAnswers);
      setSelectedAnswer(option);
      setShowFeedback(true);
    } catch (saveError) {
      console.error(
        "Error saving Championship answer:",
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

  /* ---------------------------------------------------------
     NEXT QUESTION / FINISH CHAMPIONSHIP
  --------------------------------------------------------- */

  const handleNext = async () => {
    if (
      savingRef.current ||
      saving ||
      !attemptId ||
      !showFeedback
    ) {
      return;
    }

    /*
     * Finish only after the final question's feedback
     * has been displayed.
     */
    if (answers.length === TOTAL_QUESTIONS) {
      await completeAttempt(attemptId, answers);
      return;
    }

    /*
     * Advancing removes feedback mode.
     * The next unanswered question is then displayed.
     */
    setSelectedAnswer(null);
    setShowFeedback(false);
    setError("");
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

          <p className="text-[#806452] mb-6">
            {error}
          </p>

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
              style={{
                width: `${progressPercentage}%`,
              }}
            />
          </div>

          <div className="mt-3 flex items-center justify-between text-xs sm:text-sm text-[#9a7b67]">
            <span>
              {isTagalog
                ? "Tamang sagot"
                : "Correct answers"}: {score}
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
                  "border-orange-200 bg-[#fffaf3] text-[#65432f] hover:border-orange-400 hover:bg-orange-50";

                if (isCorrectOption) {
                  optionClass =
                    "border-green-500 bg-green-100 text-green-800";
                } else if (isWrongSelection) {
                  optionClass =
                    "border-red-400 bg-red-100 text-red-800";
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
              <Loader2
                size={17}
                className="animate-spin"
              />

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
