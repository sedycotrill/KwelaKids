import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import type { Category } from "../../types/category";
import { categoryThemes } from "../../data/categoryThemes";
import { useLanguage } from "../../context/LanguageContext";
import CircleArrowButton from "../ui/CircleArrowButton";

interface CategoryCardProps {
  category: Category;
}

// Tagalog text, keyed by the lowercase English title.
// If a category has no entry here, the card falls back to its English text.
const TAGALOG_TEXT: Record<string, { title: string; description: string }> = {
  alphabet: {
    title: "Alpabeto",
    description: "Alamin ang mga letra ng alpabetong Filipino.",
  },
  numbers: {
    title: "Mga Numero",
    description: "Alamin kung paano i-sign ang 1 hanggang 10.",
  },
  greetings: {
    title: "Mga Pagbati",
    description: "Alamin kung paano bumati gamit ang sign language.",
  },
  phrase: {
    title: "Mga Parirala",
    description: "Alamin ang mga karaniwang parirala sa sign language.",
  },
  phrases: {
    title: "Mga Parirala",
    description: "Alamin ang mga karaniwang parirala sa sign language.",
  },
};

export default function CategoryCard({ category }: CategoryCardProps) {
  const theme = categoryThemes[category.theme];
  const navigate = useNavigate();
  const { language } = useLanguage();

  // Stops repeated clicks from firing confetti and navigation many times
  const isLeaving = useRef(false);

  const key = category.title.toLowerCase();

  const tagalog = TAGALOG_TEXT[key];
  const displayTitle =
    language === "tl" && tagalog ? tagalog.title : category.title;
  const displayDescription =
    language === "tl" && tagalog ? tagalog.description : category.description;

  const handleCategoryClick = () => {
    if (isLeaving.current) return;
    isLeaving.current = true;

    // 1. Find the exact position of the arrow button for the confetti origin
    const buttonElement = document.getElementById(`btn-${category.id}`);

    let x = 0.5;
    let y = 0.5;

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      x = (rect.left + rect.width / 2) / window.innerWidth;
      y = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // 2. Pick confetti colors based on the category
    let confettiColors = ["#6254F5", "#8275FF", "#FFD700"];

    if (key === "alphabet") {
      confettiColors = ["#0284c7", "#38bdf8", "#bae6fd"];
    } else if (key === "numbers") {
      confettiColors = ["#10b981", "#34d399", "#a7f3d0"];
    } else if (key === "greetings") {
      confettiColors = ["#f59e0b", "#fbbf24", "#fde68a"];
    } else if (key === "phrase" || key === "phrases") {
      confettiColors = ["#8b5cf6", "#a78bfa", "#ddd6fe"];
    }

    // 3. Slow, floaty confetti burst from the arrow button
    confetti({
      particleCount: 50,
      spread: 70,
      startVelocity: 25,
      gravity: 0.5,
      drift: 0,
      scalar: 1.2,
      ticks: 200,
      origin: { x, y },
      colors: confettiColors,
      disableForReducedMotion: true,
    });

    // 4. Wait a moment so the animation can be seen before changing page
    setTimeout(() => {
      if (key === "alphabet") {
        navigate("/alphabet");
      } else if (key === "greetings") {
        navigate("/greetings");
      } else if (key === "numbers") {
        navigate("/numbers");
      } else if (key === "phrase" || key === "phrases") {
        navigate("/phrase");
      } else {
        // Unknown category: let the child try again
        isLeaving.current = false;
      }
    }, 600);
  };

  return (
    // The whole card is tappable. The arrow button below stays the keyboard
    // and screen reader control; its click bubbles up to this handler.
    <div
      onClick={handleCategoryClick}
      className={`
        ${theme.card}
        group
        flex
        cursor-pointer
        flex-col
        gap-4
        rounded-3xl
        px-5
        py-4
        transition-all
        duration-200
        hover:-translate-y-1
        hover:shadow-lg
        active:translate-y-0
        active:scale-98
        motion-reduce:transition-none
        motion-reduce:hover:translate-y-0
        sm:flex-row
        sm:items-center
        sm:justify-between
      `}
    >
      {/* Left Content */}
      <div className="flex items-center gap-3">
        {/* Icon Container */}
        <div className="flex h-28 w-28 shrink-0 items-center justify-center sm:h-32 sm:w-32">
          <img
            src={category.image}
            alt={displayTitle}
            className="h-full w-full object-cover transition-transform duration-200 group-hover:-rotate-3 group-hover:scale-110 motion-reduce:transition-none motion-reduce:group-hover:transform-none"
          />
        </div>

        {/* Text */}
        <div className="min-w-0">
          <h3
            className={`
              text-2xl
              font-extrabold
              sm:text-3xl
              ${theme.title}
            `}
          >
            {displayTitle}
          </h3>

          <p className="text-base text-slate-600 sm:text-lg">
            {displayDescription}
          </p>
        </div>
      </div>

      {/* Arrow button with a unique ID for the confetti coordinates */}
      <div
        id={`btn-${category.id}`}
        className="self-end transition-transform duration-200 group-hover:translate-x-1 motion-reduce:transition-none motion-reduce:group-hover:transform-none sm:self-auto"
      >
        <CircleArrowButton
          color={theme.button}
          onClick={() => {
            /* the click bubbles up to the card, which handles it once */
          }}
        />
      </div>
    </div>
  );
}