
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function NumbersTutorial() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const numbers = Array.from({ length: 20 }, (_, index) =>
    String(index + 1)
  );

  const currentNumber = numbers[currentIndex];

  // Number video timestamps in seconds.
  // Replace the placeholder values with your actual timestamps.
  const numberTimestamps: Record<
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

  // Number descriptions.
  // Replace the placeholder descriptions with your own.
  const numberDescriptions: Record<string, string> = {
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
  "11": "Close your hand into a fist. Keep your fingers curled inward and your thumb folded over them, following the hand movement shown in the video.",
  "12": "Form a closed hand with your fingers curled toward your palm. Follow the slight finger movement demonstrated in the video.",
  "13": "Keep your hand curled into a loose fist, with the fingertips bent inward and slightly visible. Follow the hand movement shown in the video.",
  "14": "Curl your fingers inward toward your palm to form a closed hand. Follow the hand position demonstrated in the video.",
  "15": "Open your hand fully and extend all five fingers, spreading them apart with your palm facing forward.",
  "16": "Raise your index and middle fingers while touching your thumb to your ring finger. Keep your pinky extended, following the handshape shown in the video.",
  "17": "Raise your index, middle, and pinky fingers while touching your thumb to your ring finger.",
  "18": "Extend your four fingers upward while keeping your thumb bent inward toward your palm.",
  "19": "Raise your index and middle fingers while touching your thumb to your index finger. Keep your remaining fingers folded.",
  "20": "Close your hand into a fist and extend your index finger upward. Follow the movement demonstrated in the video."
};

  const timestamp = numberTimestamps[currentNumber];
  const description = numberDescriptions[currentNumber];

  // Seek to the beginning of the selected number's video segment.
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

  // Stop playback when the selected number's segment ends.
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

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">

      {/* Decorative Clouds */}
      <div className="pointer-events-none absolute -left-10 top-[36%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[22%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

      {/* Bottom Clouds */}
      <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

      {/* Title Card */}
      <div className="absolute left-[4.5%] top-[16%] z-20 flex items-center gap-4 rounded-2xl border border-[#B8DDF6] bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">
        <button
          type="button"
          onClick={() => navigate("/numbers")}
          aria-label="Back to numbers"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#36A9F4] text-white transition hover:bg-[#208FD8]"
        >
          <ArrowLeft size={23} strokeWidth={3} />
        </button>

        <div>
          <h1 className="text-2xl font-black leading-tight text-[#36A9F4] sm:text-3xl">
            Numbers
          </h1>

          <p className="mt-1 text-xs text-[#555555] sm:text-sm">
            Learn the numbers in Filipino Sign Language.
          </p>
        </div>
      </div>

      {/* Tutorial Content Card */}
      <section className="absolute left-[5%] right-[5%] top-[35%] z-10 grid min-h-[170px] grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm sm:grid-cols-[57%_43%]">

        {/* Local Video */}
        <div className="mx-auto h-[325px] w-[600px] max-w-full overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            src="/videos/FSLnumbers.mp4"
            controls
            playsInline
            preload="metadata"
            onTimeUpdate={handleVideoTimeUpdate}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col justify-center px-5 py-5 sm:px-6">

          {/* Current Number */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-[#426A91]">
              Number {currentNumber}
            </span>
          </div>

          <h2 className="mb-1 text-xl font-black text-[#454545]">
            Descriptions:
          </h2>

          <p className="text-sm leading-relaxed text-[#555555]">
            {description}
          </p>
        </div>
      </section>

      {/* Previous Button - Hidden on Number 1 */}
      {currentIndex > 0 && (
        <div className="absolute bottom-[8%] left-[5%] z-20">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex((prev) => prev - 1);
            }}
            className="flex items-center gap-3 rounded-2xl border border-[#79C5FA] bg-[#91D1FF] px-6 py-3 text-lg font-extrabold text-white shadow-sm transition hover:bg-[#70BFFF]"
          >
            <ArrowLeft size={21} strokeWidth={3} />
            Previous
          </button>
        </div>
      )}

      {/* Next / Finish Button */}
      <div className="absolute bottom-[8%] right-[5%] z-20">
        <button
          type="button"
          onClick={() => {
            if (currentIndex < numbers.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
              localStorage.setItem(
                "kwelakids_numbers_tutorial_completed",
                "true"
              );

              navigate("/numberscomplete");
            }
          }}
          className="flex items-center gap-3 rounded-2xl border border-[#B98AFF] bg-[#E5D3FF] px-6 py-3 text-lg font-extrabold text-[#A45CE8] shadow-sm transition hover:bg-[#D8BCFF]"
        >
          {currentIndex === numbers.length - 1 ? "Finish" : "Next"}
          <ArrowRight size={21} strokeWidth={3} />
        </button>
      </div>

    </main>
  );
}
