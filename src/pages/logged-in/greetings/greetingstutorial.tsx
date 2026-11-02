
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function GreetingsTutorial() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const greetings = [
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

  const currentGreeting = greetings[currentIndex];

  // Greeting video timestamps in seconds.
  // Replace the placeholder values with your actual timestamps.
  const greetingTimestamps: Record<
    string,
    { start: number; end: number }
  > = {
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

  // Greeting descriptions.
const greetingDescriptions: Record<string, string> = {
 "Greeting":
  "Form an L-shaped hand with your thumb and index finger. Place your hand horizontally under your chin, then move it in a circular motion downward from your chin toward your chest.",

  "Hi":
    "Raise your open hand beside your face, with your palm facing outward. Move your hand gently from side to side as if waving.",

  "Hello":
    "Raise one open hand beside your face with your palm facing outward. Move your hand in a friendly greeting gesture.",

  "Good Morning":
    "Place one hand horizontally in front of your chest. Raise your other open hand beside your face, then move it outward while keeping your lower hand in place.",

  "Good Noon":
    "Hold one hand flat with the palm facing upward in front of your chest. Bring your other open hand down toward the center of your palm.",

  "Good Afternoon":
    "Position one hand flat and palm-up in front of your chest. Raise your other open hand above it, then bring it down toward the lower palm.",

  "Good Evening":
    "Bring both open hands in front of your chest with palms facing upward. Move them gently forward, then raise both hands toward the sides of your face.",

  "Good Night":
    "Bring your open hands together in front of your chest. Lower one hand over the other, following the demonstrated resting motion.",

  "See You Soon":
    "Bring both hands together in front of your chest. Touch your fingertips together and perform the small finger movement shown by the instructor.",

  "See You Later":
    "Raise your index and middle fingers together near your face. Move your hand slightly outward while maintaining the two-finger handshape.",

  "See You Tomorrow":
    "Form a thumbs-up handshape with one hand and position it near your shoulder. Move your hand forward as demonstrated.",

  "See You Next Week":
    "Raise your index and middle fingers near your face. Position your other hand horizontally in front of your chest, then bring the two-finger hand toward your other hand.",

  "Please":
    "Place one open hand over the center of your chest. Keep your fingers together and follow the demonstrated movement.",

  "Thank You":
    "Bring your fingertips toward your chin or mouth with your palm facing inward. Move your hand forward and away from your face.",

  "Welcome":
    "Start with one open hand near your mouth. Move it outward, then extend your other hand forward with its palm facing upward.",

  "What Is Your Name?":
    "Raise one index finger upright in front of your chest. Form the demonstrated handshape with your other hand and bring your hands together.",

  "My Name Is":
    "Point toward yourself with one index finger near your chest. Then bring both hands together in front of your body and follow the demonstrated finger movement.",

  "Nice to Meet You":
    "Place one open hand horizontally over your other hand in front of your chest. Move your hands together following the instructor's demonstration.",

  "How Are You?":
    "Raise both hands in front of your chest with your thumbs pointing upward. Move your hands toward each other as demonstrated.",

  "I'm Fine":
  "Open your hand and spread your fingers apart. Keep your palm facing your chest, then touch your thumb against your chest twice to sign I'm Fine.",

  "Happy Birthday":
    "Bring both hands near your chest. Move your hands upward toward your mouth, then open your hands and move them outward as demonstrated.",

  "Happy Valentine":
    "Raise both hands in front of your chest and form the demonstrated two-finger handshapes. Follow the instructor's finger positioning and movement.",

  "Happy Anniversary":
    "Move one open hand across your chest, then bring your other hand toward the center of your body. Follow the demonstrated sequence.",

  "Happy Mother's Day":
    "Raise one open hand beside your face and move it outward. Then bring your hand toward your chin and chest before crossing your arms in front of your body.",

  "Happy Father's Day":
    "Move one open hand from near your mouth toward your chest. Then bring your hands across the front of your body as demonstrated.",

"Merry Christmas":
  "Using both hands, keep all your fingers extended and close together. Start near your neck and move both hands horizontally in a circular, waving motion down toward your chest. Next, position your hands in front of the upper part of your nose and make a circular movement downward toward your chest, imitating the appearance of Christmas lights.",
  
  "Happy New Year":
    "Raise both open hands in front of your chest with palms facing upward. Move your hands forward and upward following the demonstrated motion.",
};

  const timestamp = greetingTimestamps[currentGreeting];
  const description = greetingDescriptions[currentGreeting];

  // Seek to the beginning of the selected greeting's video segment.
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

  // Stop playback when the selected greeting's segment ends.
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
          onClick={() => navigate("/greetings")}
          aria-label="Back to greetings"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#36A9F4] text-white transition hover:bg-[#208FD8]"
        >
          <ArrowLeft size={23} strokeWidth={3} />
        </button>

        <div>
          <h1 className="text-2xl font-black leading-tight text-[#36A9F4] sm:text-3xl">
            Greetings
          </h1>

          <p className="mt-1 text-xs text-[#555555] sm:text-sm">
            Learn greetings in Filipino Sign Language.
          </p>
        </div>
      </div>

      {/* Tutorial Content Card */}
      <section className="absolute left-[5%] right-[5%] top-[35%] z-10 grid min-h-[170px] grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm sm:grid-cols-[57%_43%]">

        {/* Local Video */}
        <div className="mx-auto h-[325px] w-[600px] max-w-full overflow-hidden rounded-xl bg-black">
          <video
            ref={videoRef}
            src="/videos/FSLgreetings.mp4"
            controls
            playsInline
            preload="metadata"
            onTimeUpdate={handleVideoTimeUpdate}
            className="h-full w-full object-contain"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col justify-center px-5 py-5 sm:px-6">

          {/* Current Greeting */}
          <div className="mb-10 flex flex-col items-center justify-center">
            <span className="text-4xl font-black text-[#426A91] text-center sm:text-5xl">
              {currentGreeting}
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

      {/* Previous Button - Hidden on First Greeting */}
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
            if (currentIndex < greetings.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            } else {
              localStorage.setItem(
                "kwelakids_greetings_tutorial_completed",
                "true"
              );

              navigate("/greetingscomplete");
            }
          }}
          className="flex items-center gap-3 rounded-2xl border border-[#B98AFF] bg-[#E5D3FF] px-6 py-3 text-lg font-extrabold text-[#A45CE8] shadow-sm transition hover:bg-[#D8BCFF]"
        >
          {currentIndex === greetings.length - 1 ? "Finish" : "Next"}
          <ArrowRight size={21} strokeWidth={3} />
        </button>
      </div>

    </main>
  );
}
