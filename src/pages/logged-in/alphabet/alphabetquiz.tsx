import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import Lightbulb from "../../../assets/lightbulb.svg";

export default function AlphabetQuiz() {
  const navigate = useNavigate();
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);

  const answers = [
    {
      letter: "A",
      color: "bg-[#BDE3FA]",
      border: "border-[#55B9F8]",
      text: "text-[#2196E1]",
    },
    {
      letter: "C",
      color: "bg-[#FFE49A]",
      border: "border-[#E8C66B]",
      text: "text-[#A8750C]",
    },
    {
      letter: "B",
      color: "bg-[#B9EDC2]",
      border: "border-[#4BD77B]",
      text: "text-[#35B968]",
    },
    {
      letter: "D",
      color: "bg-[#DED0FA]",
      border: "border-[#B58AF5]",
      text: "text-[#9B5DE5]",
    },
  ];

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

      {/* Quiz Content */}
      <section className="absolute left-[5.3%] right-[4.2%] top-[35.5%] z-10 grid grid-cols-2 gap-4 sm:grid-cols-2 sm:gap-[2%]">

        {/* Question Card */}
         <div className="h-[300px] overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-[0_2px_2px_rgba(0,0,0,0.25)] sm:h-[300px]">
          {/* Question Header */}
          <div className="flex h-[60px] items-center border-b border-[#E5EDF3] bg-[#F5F9FC] px-5">
            <img
  src={Lightbulb}
  alt="Lightbulb"
  className="h-[100px] w-[100px] object-contain"
/>

            <h2 className="text-center text-xl font-bold text-[#454545]">
              What letter does the hand sign signifies?
            </h2>
          </div>

          {/* Hand Sign */}
          <div className="flex h-[250px] items-center justify-center">
            <div className="flex h-[160px] w-[160px] items-center justify-center rounded-[45%] bg-[#E2F2FC]">
              <span className="text-[115px] drop-shadow-sm">
                🤙
              </span>
            </div>
          </div>
        </div>

        {/* Answer Choices */}
       <div className="relative top-4.5 grid grid-cols-2 gap-4 sm:gap-4">
          {answers.map((answer) => (
            <button
              key={answer.letter}
              type="button"
              onClick={() => setSelectedAnswer(answer.letter)}
              className={`
                flex h-[116px] items-center justify-center
                rounded-2xl border
                ${answer.color}
                ${answer.border}
                ${answer.text}
                text-4xl font-black
                shadow-[0_2px_2px_rgba(0,0,0,0.2)]
                transition-all duration-200
                hover:brightness-105
                active:scale-95
                ${
                  selectedAnswer === answer.letter
                    ? "ring-4 ring-white ring-offset-2"
                    : ""
                }
              `}
            >
              {answer.letter}
            </button>
          ))}
        </div>
      </section>
    </main>
  );
}
