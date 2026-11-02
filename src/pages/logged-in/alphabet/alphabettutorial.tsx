import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function AlphabetTutorial() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  const currentLetter = alphabet[currentIndex];

  // A-Z video timestamps in seconds.
  const alphabetTimestamps: Record<
    string,
    { start: number; end: number }
  > = {
    A: { start: 4, end: 7 },
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
    Y: { start: 58, end: 60 },
    Z: { start: 60, end: 62 },
  };

  // Alphabet descriptions
  const alphabetDescriptions: Record<string, string> = {
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

  const timestamp = alphabetTimestamps[currentLetter];
  const description = alphabetDescriptions[currentLetter];

  // Seek to the beginning of the selected letter's video segment.
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
  }, [currentLetter, timestamp.start, timestamp.end]);

  // Stop playback when the selected letter's segment ends.
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
          onClick={() => navigate("/alphabet")}
          aria-label="Back to categories"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#36A9F4] text-white transition hover:bg-[#208FD8]"
        >
          <ArrowLeft size={23} strokeWidth={3} />
        </button>

        <div>
          <h1 className="text-2xl font-black leading-tight text-[#36A9F4] sm:text-3xl">
            Alphabet
          </h1>

          <p className="mt-1 text-xs text-[#555555] sm:text-sm">
            Learn the letters of the Filipino alphabet.
          </p>
        </div>
      </div>

      {/* Tutorial Content Card */}
      <section className="absolute left-[5%] right-[5%] top-[35%] z-10 grid min-h-[170px] grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm sm:grid-cols-[57%_43%]">

        {/* Local Video */}
        <div className="mx-auto h-[325px] w-[600px] max-w-full overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            src="/videos/FSL.mp4"
            controls
            playsInline
            preload="metadata"
            onTimeUpdate={handleVideoTimeUpdate}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col justify-center px-5 py-5 sm:px-6">

          {/* Current Letter */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <span className="text-5xl font-black text-[#426A91]">
              Letter {currentLetter}
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

      {/* Previous Button - Hidden on Letter A */}
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
            if (currentIndex < alphabet.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
  localStorage.setItem(
    "kwelakids_alphabet_tutorial_completed",
    "true"
  );

  navigate("/alphabetcomplete");
}
          }}
          className="flex items-center gap-3 rounded-2xl border border-[#B98AFF] bg-[#E5D3FF] px-6 py-3 text-lg font-extrabold text-[#A45CE8] shadow-sm transition hover:bg-[#D8BCFF]"
        >
          {currentIndex === alphabet.length - 1 ? "Finish" : "Next"}
          <ArrowRight size={21} strokeWidth={3} />
        </button>
      </div>

    </main>
  );
}