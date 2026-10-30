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

      {/* Arrow Button */}
      <div className="self-end sm:self-auto">
        <CircleArrowButton color={theme.button} />
      </div>
    </div>
  );
}