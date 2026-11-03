import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

import theoreticalImage from "../../../assets/theoretical.svg";
import practicalImage from "../../../assets/practical.svg";
import championshipImage from "../../../assets/championship.svg";
import ropeImage from "../../../assets/rope.svg";

export default function NumbersPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const isTutorialCompleted =
    localStorage.getItem("kwelakids_numbers_tutorial_completed") === "true";

  const islands = [
    {
      id: 1,
      image: theoreticalImage,
      alt: "Theoretical",
      position: "left-[13%] top-[52%]",
      size: "scale-[4.0]",
    },
    {
      id: 2,
      image: practicalImage,
      alt: "Practical",
      position: "left-[44%] top-[39%]",
      size: "scale-[4.0]",
    },
    {
      id: 3,
      image: championshipImage,
      alt: "Championship",
      position: "right-[11%] top-[21%]",
      size: "scale-[4.0]",
    },
  ];

  const handleTheoreticalClick = () => {
    navigate("/numberstutorial");
  };

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">


      {/* SUB-HEADER BAR PARA SA CATEGORY TITLE AT BACK BUTTON */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 pt-6 z-20 relative">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/categories")}
            aria-label="Back to categories"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white border border-[#B8DDF6] text-[#36A9F4] shadow-xs transition hover:bg-slate-50 hover:scale-105"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
              {language === "tl" ? "Mga Numero" : "Numbers"}
            </h1>
            <p className="text-xs text-slate-600 sm:text-sm font-medium">
              {language === "tl"
                ? "Matutunan ang mga numero sa Filipino Sign Language."
                : "Learn the numbers in Filipino Sign Language."}
            </p>
          </div>
        </div>
      </div>

      {/* Clouds */}
      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

      {/* Decorative Bottom Clouds */}
      <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

      {/* Rope 1: Theoretical to Practical */}
      <img
        src={ropeImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[15%] top-[39%] z-0 h-[40%] w-[35%] object-fill"
      />

      {/* Rope 2: Practical to Championship */}
      <img
        src={ropeImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[52%] top-[27%] z-0 h-[40%] w-[29%] object-fill"
      />

      {/* Islands */}
      {islands.map((island) => (
        <div
          key={island.id}
          className={`absolute z-10 ${island.position} group flex h-48 w-48 items-center justify-center overflow-visible sm:h-56 sm:w-56`}
        >
          {/* Island Image */}
          <button
            type="button"
            onClick={island.id === 1 ? handleTheoreticalClick : undefined}
            disabled={island.id !== 1}
            aria-label={
              island.id === 1
                ? "Start Numbers Tutorial"
                : `Open ${island.alt} tutorial`
            }
            className={`
              h-full w-full
              ${island.id === 1 ? "cursor-pointer" : "cursor-default"}
              focus-visible:outline-none
              focus-visible:ring-2
              focus-visible:ring-purple-400
              rounded-full
            `}
          >
            <img
              src={island.image}
              alt={island.alt}
              className={`
                h-full w-full object-contain
                ${island.size}
                transition-all duration-300 ease-in-out
                group-hover:brightness-110
                group-hover:drop-shadow-[0_0_18px_rgba(255,210,50,0.8)]
              `}
            />
          </button>

          {/* Start Tutorial Button - Theoretical Only */}
          {island.id === 1 && (
            <button
              type="button"
              onClick={handleTheoreticalClick}
              className="
                absolute left-[72%] top-[75%] z-30
                whitespace-nowrap
                rounded-full
                border border-[#B98AFF]
                bg-[#E5D3FF]
                px-7 py-3
                text-lg font-extrabold
                text-[#A45CE8]
                shadow-sm
                invisible opacity-0
                translate-y-2
                transition-all duration-300
                group-hover:visible
                group-hover:opacity-100
                group-hover:translate-y-0
                group-focus-within:visible
                group-focus-within:opacity-100
                group-focus-within:translate-y-0
                hover:bg-[#D8BCFF]
                cursor-pointer
              "
            >
              {isTutorialCompleted
                ? language === "tl" ? "Maglaro" : "Play"
                : language === "tl" ? "Simulan ang Tutorial" : "Start Tutorial"}
            </button>
          )}
        </div>
      ))}

    </main>
  );
}