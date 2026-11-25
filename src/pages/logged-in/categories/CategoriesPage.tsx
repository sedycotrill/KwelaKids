import { useState } from "react";
import { Lightbulb } from "lucide-react";

import MainLayout from "../../../components/layout/MainLayout";
import CategoryList from "../../../components/category/CategoryList";
import { categories } from "../../../data/categories";
import bgImage from "../../../assets/bgforlistoflesson.svg";
import lightbulbIcon from "../../../assets/lightbulb.svg";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { getFirstName } from "../../../lib/getLearnerName";

// Short tips that appear when the child taps the lightbulb
const TIPS = {
  tl: [
    "Hindi lang kamay ang ginagamit sa sign language. Pati mukha mo, may sinasabi!",
    "Mas madali kapag nagsasanay ka kahit sandali lang araw-araw.",
    "Okay lang magkamali. Subukan lang ulit!",
    "Subukan mo sa harap ng salamin para makita mo ang mga kilos mo.",
  ],
  en: [
    "Sign language isn't just hands. Your face says things too!",
    "It gets easier when you practice a little every day.",
    "It's okay to make mistakes. Just try again!",
    "Try it in front of a mirror so you can see your signs.",
  ],
};

export default function CategoriesPage() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const firstName = getFirstName(user);
  const isTagalog = language === "tl";

  // null = no tip shown yet
  const [tipIndex, setTipIndex] = useState<number | null>(null);

  const tips = isTagalog ? TIPS.tl : TIPS.en;

  const handleLightbulbClick = () => {
    setTipIndex((current) => (current === null ? 0 : (current + 1) % tips.length));
  };

  return (
    <MainLayout>
      <section className="relative isolate mx-auto w-full max-w-6xl space-y-5 overflow-x-clip px-4 py-5 sm:space-y-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Background Image */}
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 bottom-0 z-0 h-auto w-full object-contain object-bottom opacity-85 sm:absolute sm:opacity-100"
        />

        {/* GREETING */}
        <div className="relative z-10 rounded-2xl bg-[#6254F5] p-5 text-white shadow-md sm:rounded-3xl sm:p-8">
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between sm:gap-6">
            <div className="min-w-0 w-full text-center sm:text-left">
              <h1 className="font-fredoka text-2xl font-bold leading-tight sm:text-4xl">
                {isTagalog ? `Kamusta, ${firstName}!` : `Hi, ${firstName}!`}
              </h1>

              <p className="mt-1 text-base text-white/90 sm:text-xl">
                {isTagalog
                  ? "Ano'ng gusto mong matutunan ngayon?"
                  : "What do you want to learn today?"}
              </p>

              {/* Tip (appears after tapping the lightbulb) */}
              <div aria-live="polite">
                {tipIndex !== null && (
                  <div
                    key={tipIndex}
                    className="mt-3.5 flex w-full max-w-xl animate-in items-start gap-2.5 rounded-2xl bg-white p-3.5 text-left text-sm font-semibold text-slate-700 fade-in duration-300 sm:mt-4 sm:gap-3 sm:p-4 sm:text-base"
                  >
                    <Lightbulb size={20} className="mt-0.5 shrink-0 text-amber-500" />
                    <span className="leading-snug">{tips[tipIndex]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Lightbulb: tap for a tip */}
            <button
              type="button"
              onClick={handleLightbulbClick}
              className="group flex min-w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-2xl bg-white/10 px-3 py-2 transition-colors hover:bg-white/15 active:bg-white/20 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 sm:bg-transparent sm:p-2 sm:hover:bg-white/10"
            >
              <img
                src={lightbulbIcon}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 object-contain transition-transform duration-200 group-hover:rotate-6 group-active:scale-95 motion-reduce:transition-none motion-reduce:group-hover:transform-none sm:h-20 sm:w-20"
              />
              <span className="mt-0.5 text-xs font-bold text-white/95 sm:mt-1 sm:text-sm">
                {tipIndex === null
                  ? isTagalog ? "Pindutin ako!" : "Tap me!"
                  : isTagalog ? "Susunod na tip" : "Next tip"}
              </span>
            </button>
          </div>
        </div>

        {/* Categories */}
        <div className="relative z-10 pb-2 sm:pb-0">
          <CategoryList categories={categories} />
        </div>
      </section>
    </MainLayout>
  );
}