import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Check, RotateCcw } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

const GREETINGS = [
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
  "Welcome",
  "What Is Your Name?",
  "My Name Is",
  "Nice to Meet You",
  "How Are You?",
  "I'm Fine",
  "Happy Birthday",
  "Happy Valentine",
  "Happy Anniversary",
  "Happy Mother's Day",
  "Happy Father's Day",
  "Merry Christmas",
  "Happy New Year",
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
  "Welcome": { start: 172, end: 184 },
  "What Is Your Name?": { start: 185, end: 198 },
  "My Name Is": { start: 199, end: 212 },
  "Nice to Meet You": { start: 213, end: 224 },
  "How Are You?": { start: 225, end: 233 },
  "I'm Fine": { start: 234, end: 239 },
  "Happy Birthday": { start: 240, end: 253 },
  "Happy Valentine": { start: 254, end: 262 },
  "Happy Anniversary": { start: 263, end: 274 },
  "Happy Mother's Day": { start: 275, end: 291 },
  "Happy Father's Day": { start: 292, end: 303 },
  "Merry Christmas": { start: 304, end: 317 },
  "Happy New Year": { start: 319, end: 329 },
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
  "Welcome": "Start with one open hand near your mouth. Move it outward, then extend your other hand forward with its palm facing upward.",
  "What Is Your Name?": "Raise one index finger upright in front of your chest. Form the demonstrated handshape with your other hand and bring your hands together.",
  "My Name Is": "Point toward yourself with one index finger near your chest. Then bring both hands together in front of your body and follow the demonstrated finger movement.",
  "Nice to Meet You": "Place one open hand horizontally over your other hand in front of your chest. Move your hands together following the instructor's demonstration.",
  "How Are You?": "Raise both hands in front of your chest with your thumbs pointing upward. Move your hands toward each other as demonstrated.",
  "I'm Fine": "Open your hand and spread your fingers apart. Keep your palm facing your chest, then touch your thumb against your chest twice to sign I'm Fine.",
  "Happy Birthday": "Bring both hands near your chest. Move your hands upward toward your mouth, then open your hands and move them outward as demonstrated.",
  "Happy Valentine": "Raise both hands in front of your chest and form the demonstrated two-finger handshapes. Follow the instructor's finger positioning and movement.",
  "Happy Anniversary": "Move one open hand across your chest, then bring your other hand toward the center of your body. Follow the demonstrated sequence.",
  "Happy Mother's Day": "Raise one open hand beside your face and move it outward. Then bring your hand toward your chin and chest before crossing your arms in front of your body.",
  "Happy Father's Day": "Move one open hand from near your mouth toward your chest. Then bring your hands across the front of your body as demonstrated.",
  "Merry Christmas": "Using both hands, keep all your fingers extended and close together. Start near your neck and move both hands horizontally in a circular, waving motion down toward your chest. Next, position your hands in front of the upper part of your nose and make a circular movement downward toward your chest, imitating the appearance of Christmas lights.",
  "Happy New Year": "Raise both open hands in front of your chest with palms facing upward. Move your hands forward and upward following the demonstrated motion.",
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
  "Welcome": "Magsimula sa isang bukas na kamay malapit sa iyong bibig. Igalaw ito palabas, pagkatapos ay iunat ang kabilang kamay pasulong na nakaharap paitaas ang palad.",
  "What Is Your Name?": "Itaas ang isang hintuturo nang tuwid sa harap ng iyong dibdib. Bumuo ng tamang hugis ng kamay sa kabilang kamay at paglapitin ang mga ito.",
  "My Name Is": "Ituro ang iyong sarili gamit ang isang hintuturo malapit sa dibdib. Pagkatapos ay paglapitin ang dalawang kamay sa harap ng katawan.",
  "Nice to Meet You": "Ilagay ang isang bukas na kamay nang pahalang sa ibabaw ng kabilang kamay sa harap ng dibdib. Igalaw ang mga kamay nang sabay.",
  "How Are You?": "Itaas ang parehong kamay sa harap ng iyong dibdib na nakaturo paitaas ang mga hinlalaki. Igalaw ang mga kamay papalapit sa isa't isa.",
  "I'm Fine": "Buksan ang iyong kamay at paglayuin ang mga daliri. Panatilihing nakaharap ang palad sa iyong dibdib, pagkatapos ay idikit ang hinlalaki sa dibdib nang dalawang beses.",
  "Happy Birthday": "Dalhin ang parehong kamay malapit sa iyong dibdib. Igalaw ito paitaas patungo sa bibig, pagkatapos ay buksan ang mga kamay palabas.",
  "Happy Valentine": "Itaas ang parehong kamay sa harap ng dibdib at bumuo ng ipinakitang hugis ng daliri. Sundin ang posisyon ng guro.",
  "Happy Anniversary": "Igalaw ang isang bukas na kamay sa kabuuan ng iyong dibdib, pagkatapos ay dalhin ang kabilang kamay sa gitna ng katawan.",
  "Happy Mother's Day": "Itaas ang isang bukas na kamay sa tabi ng mukha at igalaw palabas. Dalhin ang kamay sa baba at dibdib bago i-krus ang mga braso.",
  "Happy Father's Day": "Igalaw ang isang bukas na kamay mula malapit sa bibig patungo sa dibdib. Dalhin ang mga kamay sa harap ng katawan.",
  "Merry Christmas": "Gamit ang parehong kamay, panatilihing nakaunat at magkakalapit ang mga daliri. Magsimula malapit sa leeg at igalaw nang pahalang at paikot pababa sa dibdib. Pagkatapos ay ilagay sa harap ng ilong at gumawa ng paikot na galaw pababa para gayahin ang Christmas lights.",
  "Happy New Year": "Itaas ang parehong bukas na kamay sa harap ng dibdib na nakaharap paitaas ang mga palad. Igalaw ang mga kamay pasulong at paitaas.",
};

export default function GreetingsTutorial() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTagalog = language === "tl";

  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const total = GREETINGS.length;
  const currentGreeting = GREETINGS[currentIndex];
  const isLast = currentIndex === total - 1;

  const timestamp = GREETING_TIMESTAMPS[currentGreeting] || { start: 0, end: 5 };
  const description = isTagalog ? DESCRIPTIONS_TL[currentGreeting] : DESCRIPTIONS_EN[currentGreeting];

  // Jump the video to the start of the current greeting segment
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
  }, [currentGreeting, timestamp.start, timestamp.end]);

  // Keep the selected greeting chip in view inside the scrolling strip
  useEffect(() => {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    chipRefs.current[currentIndex]?.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      inline: "nearest", // Inayos para hindi mag-stretch o humila sa dulo
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

    if (video.currentTime >= timestamp.end - 0.1 || video.currentTime < timestamp.start) {
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

    // Kunin ang current user para ma-save ang greetings tutorial completion para sa account na ito
    const storedUser =
      localStorage.getItem("kwelakids_current_user") ||
      sessionStorage.getItem("kwelakids_current_user");
    const currentUser = storedUser ? JSON.parse(storedUser) : null;
    const userEmail = currentUser?.email || "default_user";

    try {
      localStorage.setItem(`kwelakids_${userEmail}_greetings_tutorial_completed`, "true");
    } catch {}
    navigate("/greetingscomplete");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      {/* SUB-HEADER BAR */}
      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/greetings")}
            aria-label={isTagalog ? "Bumalik sa menu ng mga bati" : "Back to greetings menu"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
              {isTagalog ? "Tutorial sa mga Bati" : "Greetings Tutorial"}
            </h1>
            <p className="text-sm font-medium text-slate-600 sm:text-base">
              {isTagalog
                ? "Matutunan ang bawat bati hakbang-hakbang."
                : "Learn each greeting step by step."}
            </p>
          </div>
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
              ? `Bati ${currentIndex + 1} ng ${total}`
              : `Greeting ${currentIndex + 1} of ${total}`}
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

        {/* GREETING PICKER STRIP */}
        <div
          className="mb-5 flex gap-2 overflow-x-auto pb-2 scrollbar-none w-full max-w-full"
          role="group"
          aria-label={isTagalog ? "Piliin ang bati" : "Choose a greeting"}
        >
          {GREETINGS.map((greeting, position) => {
            const isCurrent = position === currentIndex;

            return (
              <button
                key={greeting}
                ref={(element) => {
                  chipRefs.current[position] = element;
                }}
                type="button"
                onClick={() => setCurrentIndex(position)}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={greeting}
                className={`flex h-11 shrink-0 items-center justify-center px-4 rounded-xl border-b-4 text-sm font-black transition-all duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none whitespace-nowrap ${
                  isCurrent
                    ? "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8]"
                    : "border-[#B8DDF6] bg-white text-[#426A91] hover:-translate-y-0.5 hover:bg-slate-50 motion-reduce:hover:translate-y-0"
                }`}
              >
                {greeting}
              </button>
            );
          })}
        </div>

        {/* TUTORIAL CARD */}
        <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm md:grid-cols-[57%_43%]">
          {/* Local Video */}
          <div className="relative aspect-video w-full overflow-hidden bg-black flex items-center justify-center">
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

          {/* Description */}
          <div className="flex flex-col justify-center gap-4 px-5 py-6 sm:px-6">
            <div className="flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-[#426A91] text-center sm:text-3xl">
                {currentGreeting}
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
              ? isTagalog ? "Tapusin" : "Finish"
              : isTagalog ? "Susunod" : "Next"}
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