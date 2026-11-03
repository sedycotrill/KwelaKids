import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

export default function NumbersTutorial() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const numbers = Array.from({ length: 20 }, (_, index) =>
    String(index + 1)
  );

  const currentNumber = numbers[currentIndex];

  // Number video timestamps in seconds.
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

  // English descriptions
  const numberDescriptionsEN: Record<string, string> = {
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

  // Tagalog descriptions
  const numberDescriptionsTL: Record<string, string> = {
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
    "11": "Isara ang kamay para maging kamao. Panatilihing nakatiklop ang mga daliri at nakatupi ang hinlalaki sa ibabaw ng mga ito.",
    "12": "Bumuo ng saradong kamay na nakatiklop ang mga daliri patungo sa palad. Sundin ang maliit na galaw ng daliri sa video.",
    "13": "Panatilihing nakatiklop ang kamay sa maluwag na kamao. Sundin ang galaw ng kamay na ipinakita sa video.",
    "14": "Tiklupin ang mga daliri papasok sa palad para bumuo ng saradong kamay ayon sa ipinapakita sa video.",
    "15": "Buksan nang buo ang kamay at iunat ang limang daliri nang magkakalayo habang nakaharap sa unahan ang palad.",
    "16": "Itaas ang hintuturo at gitna habang dinidikit ang hinlalaki sa singsing. Panatilihing nakaunat ang kalingkingan.",
    "17": "Itaas ang hintuturo, gitna, at kalingkingan habang dinidikit ang hinlalaki sa singsing.",
    "18": "Iunat ang apat na daliri paitaas habang nakabaluktot ang hinlalaki papasok sa palad.",
    "19": "Itaas ang hintuturo at gitna habang idinidikit ang hinlalaki sa hintuturo. Tiklupin ang natitirang mga daliri.",
    "20": "Isara ang kamay sa kamao at iunat paitaas ang hintuturo. Sundin ang galaw na ipinakita sa video."
  };

  const timestamp = numberTimestamps[currentNumber];
  const description = language === "tl" ? numberDescriptionsTL[currentNumber] : numberDescriptionsEN[currentNumber];

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

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (timestamp.end > timestamp.start && video.currentTime >= timestamp.end) {
      video.pause();
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">

      {/* TANGGAL NA ANG HEADER COMPONENT DITO */}

      {/* SUB-HEADER BAR (Inilipat nang kaunti sa itaas dahil wala nang Header) */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-8 z-20 relative">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/numbers")}
            aria-label="Back to numbers menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#B8DDF6] text-[#36A9F4] shadow-xs transition hover:bg-slate-50 hover:scale-105"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
              {language === "tl" ? "Tutorial sa mga Numero" : "Numbers Tutorial"}
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm font-medium">
              {language === "tl"
                ? "Matutunan ang bawat numero hakbang-hakbang."
                : "Learn each number step by step."}
            </p>
          </div>
        </div>
      </div>

      {/* Decorative Clouds */}
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

      {/* Bottom Clouds */}
      <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

      {/* Tutorial Content Card */}
      <section className="absolute left-[5%] right-[5%] top-[25%] z-10 grid min-h-42.5 grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm sm:grid-cols-[57%_43%]">

        {/* Local Video */}
        <div className="mx-auto h-81.25 w-150 max-w-full overflow-hidden rounded-xl bg-black">
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
          <div className="mb-6 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-[#426A91]">
              {language === "tl" ? `Numero ${currentNumber}` : `Number ${currentNumber}`}
            </span>
          </div>

          <h2 className="mb-1 text-lg font-black text-[#454545]">
            {language === "tl" ? "Paglalarawan:" : "Descriptions:"}
          </h2>

          <p className="text-sm leading-relaxed text-[#555555]">
            {description}
          </p>
        </div>
      </section>

      {/* Previous Button */}
      {currentIndex > 0 && (
        <div className="absolute bottom-[6%] left-[5%] z-20">
          <button
            type="button"
            onClick={() => {
              setCurrentIndex((prev) => prev - 1);
            }}
            className="flex items-center gap-3 rounded-2xl border border-[#79C5FA] bg-[#91D1FF] px-6 py-3 text-lg font-extrabold text-white shadow-sm transition hover:bg-[#70BFFF]"
          >
            <ArrowLeft size={21} strokeWidth={3} />
            {language === "tl" ? "Nakaraan" : "Previous"}
          </button>
        </div>
      )}

      {/* Next / Finish Button */}
      <div className="absolute bottom-[6%] right-[5%] z-20">
        <button
          type="button"
          onClick={() => {
            if (currentIndex < numbers.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
              localStorage.setItem("kwelakids_numbers_tutorial_completed", "true");
              navigate("/numberscomplete");
            }
          }}
          className="flex items-center gap-3 rounded-2xl border border-[#B98AFF] bg-[#E5D3FF] px-6 py-3 text-lg font-extrabold text-[#A45CE8] shadow-sm transition hover:bg-[#D8BCFF]"
        >
          {currentIndex === numbers.length - 1
            ? language === "tl" ? "Tapusin" : "Finish"
            : language === "tl" ? "Susunod" : "Next"}
          <ArrowRight size={21} strokeWidth={3} />
        </button>
      </div>

    </main>
  );
}