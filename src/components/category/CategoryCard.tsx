import { useNavigate } from "react-router-dom";
import confetti from "canvas-confetti";
import type { Category } from "../../types/category";
import { categoryThemes } from "../../data/categoryThemes";
import CircleArrowButton from "../ui/CircleArrowButton";

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({
  category,
}: CategoryCardProps) {
  const theme = categoryThemes[category.theme];
  const navigate = useNavigate();

  const handleCategoryClick = () => {
    const title = category.title.toLowerCase();

    // 1. Kunin ang eksaktong posisyon ng button sa pamamagitan ng ID ng wrapper nito
    const buttonElement = document.getElementById(`btn-${category.id}`);
    
    let x = 0.5;
    let y = 0.5;

    if (buttonElement) {
      const rect = buttonElement.getBoundingClientRect();
      x = (rect.left + rect.width / 2) / window.innerWidth;
      y = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // 2. Pumili ng kulay base sa kategorya para sa mga bata
    let confettiColors = ["#6254F5", "#8275FF", "#FFD700"];

    if (title === "alphabet") {
      confettiColors = ["#0284c7", "#38bdf8", "#bae6fd"];
    } else if (title === "numbers") {
      confettiColors = ["#10b981", "#34d399", "#a7f3d0"];
    } else if (title === "greetings") {
      confettiColors = ["#f59e0b", "#fbbf24", "#fde68a"];
    } else if (title === "phrase" || title === "phrases") {
      confettiColors = ["#8b5cf6", "#a78bfa", "#ddd6fe"];
    }

    // 3. I-burst ang confetti mismo mula sa button nang mabagal (floaty)
    confetti({
      particleCount: 50,
      spread: 70,
      startVelocity: 25, // Mababang bilis sa simula
      gravity: 0.5,      // Mababang gravity para mabagal ang pagbagsak
      drift: 0,
      scalar: 1.2,       // Mas malalaking piraso para masaya sa mga bata
      ticks: 200,        // Mas matagal bago mawala
      origin: { x, y },  // Mismo sa gitna ng arrow button
      colors: confettiColors,
    });

    // 4. Maghintay ng kaunti para maranasan ang animation bago lumipat ng page
    setTimeout(() => {
      if (title === "alphabet") {
        navigate("/alphabet");
      } else if (title === "greetings") {
        navigate("/greetings");
      } else if (title === "numbers") {
        navigate("/numbers");
      } else if (title === "phrase" || title === "phrases") {
        navigate("/phrase");
      }
    }, 600);
  };

  return (
    <div
      className={`
        ${theme.card}
        flex
        flex-col
        gap-4
        rounded-3xl
        px-5
        py-4
        transition-all
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
            alt={category.title}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Text */}
        <div>
          <h3
            className={`
              text-2xl
              font-extrabold
              sm:text-3xl
              ${theme.title}
            `}
          >
            {category.title}
          </h3>

          <p className="text-slate-600">
            {category.description}
          </p>
        </div>
      </div>

      {/* Arrow Button na binigyan ng unique ID para sa confetti coordinates */}
      <div id={`btn-${category.id}`} className="self-end sm:self-auto">
        <CircleArrowButton
          color={theme.button}
          onClick={handleCategoryClick}
        />
      </div>
    </div>
  );
}