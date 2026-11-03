import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

import Lightbulb from "../../../assets/lightbulb.svg";

export default function AlphabetQuiz() {
  const navigate = useNavigate();
  const { language } = useLanguage();
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
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">

      {/* SUB-HEADER BAR PARA SA TITLE AT BACK BUTTON */}
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
              {language === "tl" ? "Pagsusulit sa Alpabeto" : "Alphabet Quiz"}
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm font-medium">
              {language === "tl"
                ? "Subukan ang iyong natutunan sa Filipino Sign Language."
                : "Test your knowledge of the Filipino Sign Language alphabet."}
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

      {/* Quiz Content */}
      <section className="absolute left-[5.3%] right-[4.2%] top-[35.5%] z-10 grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-[2%]">

        {/* Question Card */}
        <div className="h-75 overflow-hidden rounded-2xl border border-[#B8DDF6] bg-white shadow-[0_2px_2px_rgba(0,0,0,0.25)] sm:h-75">
          {/* Question Header */}
          <div className="flex h-15 items-center border-b border-[#E5EDF3] bg-[#F5F9FC] px-5">
            <img
              src={Lightbulb}
              alt="Lightbulb"
              className="h-15 w-15 object-contain mr-3"
            />

            <h2 className="text-sm sm:text-base font-bold text-[#454545]">
              {language === "tl"
                ? "Anong titik ang isinasaad ng senyas ng kamay?"
                : "What letter does the hand sign signify?"}
            </h2>
          </div>

          {/* Hand Sign */}
          <div className="flex h-60 items-center justify-center">
            <div className="flex h-35 w-35 items-center justify-center rounded-[45%] bg-[#E2F2FC]">
              <span className="text-[100px] drop-shadow-sm">
                🤙
              </span>
            </div>
          </div>
        </div>

        {/* Answer Choices */}
        <div className="grid grid-cols-2 gap-4">
          {answers.map((answer) => (
            <button
              key={answer.letter}
              type="button"
              onClick={() => setSelectedAnswer(answer.letter)}
              className={`
                flex h-33.75 items-center justify-center
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