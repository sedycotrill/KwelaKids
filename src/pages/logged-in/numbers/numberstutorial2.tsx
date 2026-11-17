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
} from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";
import { useAudio } from "../../../context/AudioContext";

const NUMBERS = Array.from({ length: 10 }, (_, index) => String(index + 11));

// Number video timestamps in seconds (11-20)
const NUMBER_TIMESTAMPS: Record<string, { start: number; end: number }> = {
  "11": { start: 32, end: 34 },
  "12": { start: 34, end: 36 },
  "13": { start: 36, end: 38 },
  "14": { start: 38, end: 40 },
  "15": { start: 40, end: 42 },
  "16": { start: 43, end: 45 },
  "17": { start: 46, end: 48 },
  "18": { start: 48, end: 51 },
  "19": { start: 51, end: 53 },
  "20": { start: 53, end: 55 },
};

// English descriptions (11-20)
const DESCRIPTIONS_EN: Record<string, string> = {
  "11": "Close your hand into a fist. Keep your fingers curled inward and your thumb folded over them, following the hand movement shown in the video.",
  "12": "Form a closed hand with your fingers curled toward your palm. Follow the slight finger movement demonstrated in the video.",
  "13": "Keep your hand curled into a loose fist, with the fingertips bent inward and slightly visible. Follow the hand movement shown in the video.",
  "14": "Curl your fingers inward toward your palm to form a closed hand. Follow the hand position demonstrated in the video.",
  "15": "Open your hand fully and extend all five fingers, spreading them apart with your palm facing forward.",
  "16": "Raise your index and middle fingers while touching your thumb to your ring finger. Keep your pinky extended, following the handshape shown in the video.",
  "17": "Raise your index, middle, and pinky fingers while touching your thumb to your ring finger.",
  "18": "Extend your four fingers upward while keeping your thumb bent inward toward your palm.",
  "19": "Raise your index and middle fingers while touching your thumb to your index finger. Keep your remaining fingers folded.",
  "20": "Close your hand into a fist and extend your index finger upward. Follow the movement demonstrated in the video.",
};

// Tagalog descriptions (11-20)
const DESCRIPTIONS_TL: Record<string, string> = {
  "11": "Isara ang kamay para maging kamao. Panatilihing nakatiklop ang mga daliri at nakatupi ang hinlalaki sa ibabaw ng mga ito.",
  "12": "Bumuo ng saradong kamay na nakatiklop ang mga daliri patungo sa palad. Sundin ang maliit na galaw ng daliri sa video.",
  "13": "Panatilihing nakatiklop ang kamay sa maluwag na kamao. Sundin ang galaw ng kamay na ipinakita sa video.",
  "14": "Tiklupin ang mga daliri papasok sa palad para bumuo ng saradong kamay ayon sa ipinapakita sa video.",
  "15": "Buksan nang buo ang kamay at iunat ang limang daliri nang magkakalayo habang nakaharap sa unahan ang palad.",
  "16": "Itaas ang hintuturo at gitna habang dinidikit ang hinlalaki sa singsing. Panatilihing nakaunat ang kalingkingan.",
  "17": "Itaas ang hintuturo, gitna, at kalingkingan habang dinidikit ang hinlalaki sa singsing.",
  "18": "Iunat ang apat na daliri paitaas habang nakabaluktot ang hinlalaki papasok sa palad.",
  "19": "Itaas ang hintuturo at gitna habang idinidikit ang hinlalaki sa hintuturo. Tiklupin ang natitirang mga daliri.",
  "20": "Isara ang kamay sa kamao at iunat paitaas ang hintuturo. Sundin ang galaw na ipinakita sa video.",
};

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
  const isTagalog = language === "tl";

  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = NUMBERS.length;
  const currentNumber = NUMBERS[currentIndex];
  const isLast = currentIndex === total - 1;

  const timestamp = NUMBER_TIMESTAMPS[currentNumber] || { start: 32, end: 34 };
  const description = isTagalog
    ? DESCRIPTIONS_TL[currentNumber]
    : DESCRIPTIONS_EN[currentNumber];
  const isMusicActive = isPlaying && volume > 0;

  useEffect(() => {
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
  }, [currentNumber, timestamp.start, timestamp.end]);

  useEffect(() => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    chipRefs.current[currentIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "nearest",
      block: "nearest",
    });
  }, [currentIndex]);

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (timestamp.end > timestamp.start && video.currentTime >= timestamp.end) {
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

  const handleReplay = () => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = timestamp.start;
    video.play().catch(() => {});
  };

  const handleNext = () => {
    if (!isLast) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }

    const storedUser =
      localStorage.getItem("kwelakids_current_user") ||
      sessionStorage.getItem("kwelakids_current_user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userEmail = currentUser?.email || "default_user";

    try {
      localStorage.setItem(
        `kwelakids_${userEmail}_numbers_tutorial_completed`,
        "true"
      );
    } catch {}
    navigate("/numberscomplete");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      {/* SUB-HEADER BAR */}
      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/numbers")}
            aria-label={
              isTagalog
                ? "Bumalik sa menu ng mga numero"
                : "Back to numbers menu"
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
            aria-label={isTagalog ? "Palitan sa English" : "Switch to Tagalog"}
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
                ? isTagalog
                  ? "I-mute ang tugtog"
                  : "Mute music"
                : isTagalog
                  ? "I-unmute ang tugtog"
                  : "Unmute music"
            }
            className={`${chunkyButton} ${
              isMusicActive
                ? "border-amber-300 bg-amber-100 text-amber-700 hover:bg-amber-200"
                : "border-slate-300 bg-slate-100 text-slate-500 hover:bg-slate-200"
            }`}
          >
            {isMusicActive ? (
              <Volume2
                size={22}
                className="animate-pulse motion-reduce:animate-none"
              />
            ) : (
              <VolumeX size={22} />
            )}
            <span className="hidden md:inline">
              {isMusicActive
                ? isTagalog
                  ? "Tugtog"
                  : "Music"
                : isTagalog
                  ? "Naka-mute"
                  : "Muted"}
            </span>
          </button>
        </div>
      </div>

      {/* Decorative Clouds */}
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

      {/* CONTENT */}
      <section className="relative z-10 mx-auto w-full max-w-6xl px-4 pb-24 pt-6 sm:px-6">
        {/* PROGRESS */}
        <div className="mb-4">
          <p className="mb-2 text-sm font-extrabold text-[#164B9B] sm:text-base">
            {isTagalog
              ? `Numero ${currentIndex + 1} ng ${total}`
              : `Number ${currentIndex + 1} of ${total}`}
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

        {/* NUMBER PICKER STRIP */}
        <div
          className="mb-5 flex w-full max-w-full gap-2 overflow-x-auto pb-2 scrollbar-none"
          role="group"
          aria-label={isTagalog ? "Piliin ang numero" : "Choose a number"}
        >
          {NUMBERS.map((num, position) => {
            const isCurrent = position === currentIndex;

            return (
              <button
                key={num}
                ref={(element) => {
                  chipRefs.current[position] = element;
                }}
                type="button"
                onClick={() => setCurrentIndex(position)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={isTagalog ? `Numero ${num}` : `Number ${num}`}
                className={`flex h-11 w-12 shrink-0 items-center justify-center rounded-xl border-b-4 text-lg font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none ${
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
          {/* Local Video */}
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

          {/* Description */}
          <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-6">
            <div className="flex flex-col items-center justify-center">
              <span className="text-4xl font-black text-[#426A91] sm:text-5xl">
                {isTagalog
                  ? `Numero ${currentNumber}`
                  : `Number ${currentNumber}`}
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

        {/* PREVIOUS / NEXT */}
        <div className="mt-6 flex items-center justify-between gap-3">
          {currentIndex > 0 ? (
            <button
              type="button"
              onClick={() => setCurrentIndex((prev) => prev - 1)}
              className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#79C5FA] bg-[#91D1FF] px-5 text-lg font-extrabold text-white transition-all hover:-translate-y-0.5 hover:bg-[#70BFFF] active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-6"
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
            className="flex h-14 items-center gap-2 rounded-2xl border-b-4 border-[#B98AFF] bg-[#E5D3FF] px-5 text-lg font-extrabold text-[#A45CE8] transition-all hover:-translate-y-0.5 hover:bg-[#D8BCFF] active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-300 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:px-6"
          >
            {isLast
              ? isTagalog
                ? "Tapusin"
                : "Finish"
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