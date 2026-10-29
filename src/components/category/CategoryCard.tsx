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
        sm:flex-row
        sm:items-center
        sm:justify-between
      `}
    >
      <div className="flex items-center gap-4">
        <img
          src={category.image}
          alt={category.title}
          className="h-20 w-20 object-contain"
        />

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

      <CircleArrowButton color={theme.button} />
    </div>
  );
}
