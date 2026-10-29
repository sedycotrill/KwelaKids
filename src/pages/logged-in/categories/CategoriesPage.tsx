import MainLayout from "../../../components/layout/MainLayout";
import CategoryList from "../../../components/category/CategoryList";
import { categories } from "../../../data/categories";

export default function CategoriesPage() {
  return (
    <MainLayout>
      <section className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        <h1 className="text-3xl font-black text-blue-900 sm:text-4xl lg:text-5xl">
          Choose a category
        </h1>

        <p className="mt-2 mb-6 text-sm text-slate-600 sm:mb-8 sm:text-base">
          Pick what you want to learn today!
        </p>

        <CategoryList categories={categories} />
      </section>
    </MainLayout>
  );
}
