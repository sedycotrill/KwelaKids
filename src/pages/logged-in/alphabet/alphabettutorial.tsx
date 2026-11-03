import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

export default function AlphabetTutorial() {
  const navigate = useNavigate();
  const { language } = useLanguage();
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

  // English descriptions
  const alphabetDescriptionsEN: Record<string, string> = {
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

  // Tagalog descriptions
  const alphabetDescriptionsTL: Record<string, string> = {
    A: "Isara ang apat na daliri upang bumuo ng kamao patungo sa iyong palad. Panatilihing nakadikit ang hinlalaki sa gilid ng mga nakatiklop na daliri.",
    B: "Iunat ang apat na daliri paitaas at panatilihing magkakalapit ang mga ito. Itupi ang hinlalaki sa ibabaw ng iyong palad.",
    C: "Baluktutin ang iyong mga daliri at hinlalaki upang bumuo ng hugis C. Mag-iwan ng puwang sa pagitan ng iyong mga dulo ng daliri at hinlalaki.",
    D: "Iunat nang tuwid paitaas ang iyong hintuturo. Itupi ang gitna, pal singsing, at kalingkingan patungo sa iyong palad.",
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

  const timestamp = alphabetTimestamps[currentLetter];
  const description = language === "tl" ? alphabetDescriptionsTL[currentLetter] : alphabetDescriptionsEN[currentLetter];

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

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video) return;

    if (timestamp.end > timestamp.start && video.currentTime >= timestamp.end) {
      video.pause();
    }
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      {/* SUB-HEADER BAR */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6 z-20 relative">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/alphabet")}
            aria-label="Back to alphabet menu"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#B8DDF6] text-[#36A9F4] shadow-xs transition hover:bg-slate-50 hover:scale-105"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
              {language === "tl" ? "Tutorial sa Alpabeto" : "Alphabet Tutorial"}
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm font-medium">
              {language === "tl"
                ? "Matutunan ang bawat titik gamit ang gabay na ito."
                : "Learn each letter step by step."}
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
      <section className="absolute left-[5%] right-[5%] top-[28%] z-10 grid min-h-42.5 grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm sm:grid-cols-[57%_43%]">

        {/* Local Video */}
        <div className="mx-auto h-81.25 w-150 max-w-full overflow-hidden rounded-xl bg-black">
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
          <div className="mb-6 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-[#426A91]">
              {language === "tl" ? `Titik ${currentLetter}` : `Letter ${currentLetter}`}
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
            if (currentIndex < alphabet.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
              localStorage.setItem("kwelakids_alphabet_tutorial_completed", "true");
              navigate("/alphabetcomplete");
            }
          }}
          className="flex items-center gap-3 rounded-2xl border border-[#B98AFF] bg-[#E5D3FF] px-6 py-3 text-lg font-extrabold text-[#A45CE8] shadow-sm transition hover:bg-[#D8BCFF]"
        >
          {currentIndex === alphabet.length - 1
            ? language === "tl" ? "Tapusin" : "Finish"
            : language === "tl" ? "Susunod" : "Next"}
          <ArrowRight size={21} strokeWidth={3} />
        </button>
      </div>

    </main>
  );
}