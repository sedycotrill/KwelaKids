import type { Category } from "../../types/category";
import CategoryCard from "./CategoryCard";

interface CategoryListProps {
  categories: Category[];
}

export default function CategoryList({
  categories,
}: CategoryListProps) {
  return (
    <div className="space-y-5">
      {categories.map((category) => (
        <CategoryCard
          key={category.id}
          category={category}
        />
      ))}
    </div>
  );
}