import MainLayout from "../../../components/layout/MainLayout";
import CategoryList from "../../../components/category/CategoryList";
import { categories } from "../../../data/categories";
import bgImage from "../../../assets/bgforlistoflesson.svg";
import lightbulbIcon from "../../../assets/lightbulb.svg";
import { Sparkles, BookOpen } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

export default function CategoriesPage() {
  const learnerName = "Learner";
  const { language } = useLanguage();

  return (
    <MainLayout>
      <section className="relative isolate mx-auto w-full max-w-6xl overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10 space-y-8">

        {/* Background Image */}
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 translate-y-10 z-0 h-auto w-full object-contain object-bottom"
        />

        {/* WELCOME HERO BANNER */}
        <div className="relative z-10 overflow-hidden rounded-[28px] bg-linear-to-r from-[#6254F5] via-[#7566F6] to-[#9285FF] p-6 sm:p-10 text-white shadow-lg">
          {/* Subtle background glow elements */}
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute right-40 -bottom-10 h-32 w-32 rounded-full bg-black/10 blur-xl" />

          <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-3 text-center sm:text-left">
              {/* Badge with Lucide Sparkles Icon */}
              <span className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white backdrop-blur-md shadow-xs">
                <Sparkles size={14} className="text-yellow-300 animate-pulse" />
                {language === "tl" ? `Maligayang pagbabalik, ${learnerName}!` : `Welcome back, ${learnerName}!`}
              </span>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-wide leading-tight">
                {language === "tl"
                  ? "Handa ka na bang matuto ng Filipino Sign Language ngayon?"
                  : "Ready to learn Filipino Sign Language today?"}
              </h2>

              <p className="text-xs sm:text-sm text-white/90 max-w-xl font-medium flex items-center justify-center sm:justify-start gap-1.5">
                <BookOpen size={16} className="shrink-0 text-white/80" />
                {language === "tl"
                  ? "Mag-explore ng mga interactive na aralin, magsanay ng mga nakakatuwang kilos, at subukan ang iyong kakayahan sa mabilis na learning modules!"
                  : "Explore interactive lessons, practice fun gestures, and test your skills with quick learning modules!"}
              </p>
            </div>

            {/* Right Container with scaled-up lightbulb */}
            <div className="hidden md:flex shrink-0 items-center justify-center h-28 w-28 rounded-3xl bg-white/15 backdrop-blur-md border border-white/20 shadow-inner overflow-visible">
              <img
                src={lightbulbIcon}
                alt="Lightbulb"
                className="h-20 w-20 object-contain drop-shadow-md scale-[1.7]"
              />
            </div>
          </div>
        </div>

        {/* Category Content */}
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-blue-900 sm:text-4xl lg:text-5xl">
            {language === "tl" ? "Pumili ng kategorya" : "Choose a category"}
          </h1>

          <p className="mt-2 mb-6 text-sm text-slate-600 sm:mb-8 sm:text-base">
            {language === "tl" ? "Piliin ang gusto mong matutunan ngayon!" : "Pick what you want to learn today!"}
          </p>

          <CategoryList categories={categories} />
        </div>
      </section>
    </MainLayout>
  );
}