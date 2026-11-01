
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

import theoreticalImage from "../../../assets/theoretical.png";
import practicalImage from "../../../assets/practical.png";
import championshipImage from "../../../assets/championship.png";
import ropeImage from "../../../assets/rope.png";

export default function AlphabetPage() {
  const navigate = useNavigate();

  const islands = [
    {
      id: 1,
      image: theoreticalImage,
      alt: "Theoretical",
      position: "left-[13%] top-[50%]",
      size: "scale-[4.0]",
    },
    {
      id: 2,
      image: practicalImage,
      alt: "Practical",
      position: "left-[44%] top-[37%]",
      size: "scale-[4.0]",
    },
    {
      id: 3,
      image: championshipImage,
      alt: "Championship",
      position: "right-[11%] top-[19%]",
      size: "scale-[4.0]",
    },
  ];

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">

      {/* Clouds */}
      <div className="pointer-events-none absolute -left-10 top-[36%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[22%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

      {/* Decorative Bottom Clouds */}
      <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

      {/* Title Card */}
      <div className="absolute left-[4.5%] top-[16%] z-20 flex items-center gap-4 rounded-2xl border border-[#B8DDF6] bg-white px-4 py-3 shadow-sm sm:px-5 sm:py-4">

        <button
          type="button"
          onClick={() => navigate("/categories")}
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

      {/* Rope 1: Theoretical to Practical */}
      <img
        src={ropeImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[15%] top-[35%] z-0 h-[40%] w-[35%] object-fill"
      />

      {/* Rope 2: Practical to Championship */}
      <img
        src={ropeImage}
        alt=""
        aria-hidden="true"
        className="pointer-events-none absolute left-[52%] top-[23%] z-0 h-[40%] w-[29%] object-fill"
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
      onClick={() => {
        if (island.id === 1) {
          navigate("/alphabettutorial");
        }
      }}
      disabled={island.id !== 1}
      aria-label={`Open ${island.alt} tutorial`}
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
        onClick={() => navigate("/alphabettutorial")}
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
        Start Tutorial
      </button>
    )}
  </div>
))}


    </main>
  );
}
