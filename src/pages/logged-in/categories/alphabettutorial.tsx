
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function AlphabetTutorial() {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  const currentLetter = alphabet[currentIndex];

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
      <section className="absolute left-[5%] right-[5%] top-[35%] z-10 grid min-h-[170px] grid-cols-1 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-sm sm:grid-cols-[40%_60%]">

        {/* Sign Language Image */}
        <div className="flex flex-col items-center justify-center border-b border-[#B8DDF6] px-4 py-5 sm:border-b-0 sm:border-r">

          <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-[35%] bg-[#E6F4FF] sm:h-32 sm:w-32">
            <img
              src={`/images/fsl/${currentLetter}.png`}
              alt={`Filipino Sign Language letter ${currentLetter}`}
              className="h-full w-full object-contain"
            />
          </div>

          <h2 className="mt-2 text-xl font-bold text-[#426A91]">
            {currentLetter}
          </h2>
        </div>

        {/* Description */}
        <div className="flex flex-col justify-center px-5 py-5 sm:px-6">
          <h2 className="mb-1 text-xl font-black text-[#454545]">
            Descriptions:
          </h2>

          <p className="text-sm leading-relaxed text-[#555555]">
            This is the Filipino Sign Language handshape for the letter{" "}
            <strong>{currentLetter}</strong>. Observe the hand position and
            shape carefully to learn how to recognize and perform this
            letter in Filipino Sign Language.
          </p>
        </div>
      </section>

      {/* Next Button */}
      <div className="absolute bottom-[12%] right-[5%] z-20">

        <button
          type="button"
          onClick={() => {
            if (currentIndex < alphabet.length - 1) {
              setCurrentIndex((prev) => prev + 1);
            }
          }}
          disabled={currentIndex === alphabet.length - 1}
          className="flex items-center gap-3 rounded-2xl border border-[#B98AFF] bg-[#E5D3FF] px-6 py-3 text-lg font-extrabold text-[#A45CE8] shadow-sm transition hover:bg-[#D8BCFF] disabled:cursor-not-allowed disabled:opacity-50"
        >
          Next
          <ArrowRight size={21} strokeWidth={3} />
        </button>

      </div>

    </main>
  );
}
