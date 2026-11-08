import { Fragment, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Lock, Play } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

import theoreticalImage from "../../../assets/theoretical.svg";
import practicalImage from "../../../assets/practical.svg";
import championshipImage from "../../../assets/championship.svg";
import ropeImage from "../../../assets/rope.svg";

interface IslandProps {
  image: string;
  name: string;
  actionLabel: string;
  locked: boolean;
  ariaLabel: string;
  onOpen: () => void;
  className?: string;
}

function Island({
  image,
  name,
  actionLabel,
  locked,
  ariaLabel,
  onOpen,
  className = "",
}: IslandProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={locked}
      aria-label={ariaLabel}
      className={`
        group z-10 flex flex-col items-center rounded-3xl
        focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-purple-400
        ${locked ? "cursor-not-allowed pointer-events-none opacity-60" : "cursor-pointer pointer-events-auto"}
        ${className}
      `}
    >
      {/* Island picture */}
      <span className="relative flex h-40 w-40 items-center justify-center overflow-visible sm:h-56 sm:w-56">
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className={`
            pointer-events-none h-full w-full scale-400 object-contain
            transition-all duration-300 ease-in-out motion-reduce:transition-none
            ${
              locked
                ? "grayscale"
                : `group-hover:-translate-y-2 group-hover:brightness-110
                   group-hover:drop-shadow-[0_0_18px_rgba(255,210,50,0.8)]
                   group-active:scale-380`
            }
          `}
        />
      </span>

      {/* Name */}
      <span className="mt-1 rounded-full bg-white/80 px-4 py-1 text-base font-black text-[#164B9B] shadow-xs sm:text-lg">
        {name}
      </span>

      {/* Action / status pill */}
      <span
        className={`
          mt-2 flex items-center gap-2 whitespace-nowrap rounded-full border-b-4 px-5 py-2
          text-base font-extrabold transition-all duration-150 motion-reduce:transition-none
          ${
            locked
              ? "border-slate-300 bg-slate-100 text-slate-500"
              : "border-[#B98AFF] bg-[#E5D3FF] text-[#A45CE8] group-hover:-translate-y-0.5 group-hover:bg-[#D8BCFF] group-active:translate-y-0.5 group-active:border-b-2"
          }
        `}
      >
        {locked ? (
          <Lock size={18} aria-hidden="true" />
        ) : (
          <Play size={18} aria-hidden="true" className="fill-current" />
        )}
        {actionLabel}
      </span>
    </button>
  );
}

export default function AlphabetPage() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTagalog = language === "tl";

  const [isTutorialCompleted, setIsTutorialCompleted] = useState(false);
  const [hasPassedPractical, setHasPassedPractical] = useState(false);

  useEffect(() => {
    try {
      const storedUser =
        localStorage.getItem("kwelakids_current_user") ||
        sessionStorage.getItem("kwelakids_current_user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = currentUser?.email || "default_user";

      const tutorialDone =
        localStorage.getItem(`kwelakids_${userEmail}_alphabet_tutorial_completed`) === "true";
      setIsTutorialCompleted(tutorialDone);

      const practicalPassed =
        localStorage.getItem(`kwelakids_${userEmail}_alphabet_practical_passed`) === "true";
      setHasPassedPractical(practicalPassed);
    } catch {
      // fallback
    }
  }, []);

  const comingSoon = isTagalog ? "Malapit na" : "Coming soon";
  
  const theoreticalPlayLabel = isTutorialCompleted
    ? isTagalog ? "Rebyuhin" : "Review"
    : isTagalog ? "Simulan" : "Start";

  const playLabel = isTagalog ? "Maglaro" : "Play";

  const islands = [
    {
      id: 1,
      image: theoreticalImage,
      name: isTagalog ? "Teorya" : "Theoretical",
      position: "left-[13%] top-[52%]",
      locked: false,
      actionLabel: theoreticalPlayLabel,
      onOpen: () => {
        navigate("/alphabettutorial");
      },
    },
    {
      id: 2,
      image: practicalImage,
      name: isTagalog ? "Praktis" : "Practical",
      position: "left-[44%] top-[39%]",
      locked: !isTutorialCompleted, 
      actionLabel: !isTutorialCompleted ? comingSoon : playLabel,
      onOpen: () => {
        navigate("/alphabetpractical"); // Dumidiretso na sa bagong practical file
      },
    },
    {
      id: 3,
      image: championshipImage,
      name: isTagalog ? "Kampeonato" : "Championship",
      position: "right-[11%] top-[21%]",
      locked: !hasPassedPractical, 
      actionLabel: !hasPassedPractical ? comingSoon : playLabel,
      onOpen: () => {
        navigate("/alphabetchampionship"); // Dumidiretso na sa championship file
      },
    },
  ];

  const renderIsland = (
    island: (typeof islands)[number],
    className: string
  ) => (
    <Island
      image={island.image}
      name={island.name}
      locked={island.locked}
      actionLabel={island.actionLabel}
      ariaLabel={
        island.locked
          ? `${island.name}: ${comingSoon}`
          : isTagalog
            ? `Buksan ang ${island.name}`
            : `Open ${island.name}`
      }
      onOpen={island.onOpen}
      className={className}
    />
  );

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">
      <div className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-4 pt-6 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate("/categories")}
            aria-label={isTagalog ? "Bumalik sa mga kategorya" : "Back to categories"}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 motion-reduce:transition-none"
          >
            <ArrowLeft size={22} strokeWidth={2.5} />
          </button>
          <div>
            <h1 className="text-2xl font-black leading-tight text-[#164B9B] sm:text-3xl">
              {isTagalog ? "Alpabeto" : "Alphabet"}
            </h1>
            <p className="text-sm font-medium text-slate-600 sm:text-base">
              {isTagalog
                ? "Matutunan ang mga titik ng alpabetong Filipino."
                : "Learn the letters of the Filipino alphabet."}
            </p>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -left-10 top-[40%] h-20 w-40 rounded-full bg-white/50 blur-xl" />
      <div className="pointer-events-none absolute -right-10 top-[26%] h-24 w-44 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-12 left-[-5%] h-36 w-72 rounded-full bg-white/60 blur-xl" />
      <div className="pointer-events-none absolute -bottom-16 right-[-5%] h-40 w-80 rounded-full bg-white/60 blur-xl" />

      <div className="pointer-events-none absolute -bottom-24 left-[15%] h-40 w-72 rounded-full bg-[#D8EEFC]/80" />
      <div className="pointer-events-none absolute -bottom-24 right-[10%] h-44 w-80 rounded-full bg-[#D8EEFC]/80" />

      <div className="relative z-10 mx-auto flex max-w-md flex-col items-center px-6 pb-24 pt-8 lg:hidden">
        {islands.map((island, index) => (
          <Fragment key={island.id}>
            {index > 0 && (
              <div
                aria-hidden="true"
                className="my-2 h-10 w-0 border-l-4 border-dashed border-white/90"
              />
            )}
            {renderIsland(island, index % 2 === 0 ? "self-start" : "self-end")}
          </Fragment>
        ))}
      </div>

      <div className="absolute inset-0 hidden lg:block">
        <img
          src={ropeImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[15%] top-[39%] z-0 h-[40%] w-[35%] object-fill"
        />

        <img
          src={ropeImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute left-[52%] top-[27%] z-0 h-[40%] w-[29%] object-fill"
        />

        {islands.map((island) => (
          <Fragment key={island.id}>
            {renderIsland(island, `absolute ${island.position}`)}
          </Fragment>
        ))}
      </div>
    </main>
  );
}