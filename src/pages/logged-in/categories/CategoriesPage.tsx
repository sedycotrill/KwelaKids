import { useState } from "react";
import { Sparkles, BookOpen, Lightbulb } from "lucide-react";

import MainLayout from "../../../components/layout/MainLayout";
import CategoryList from "../../../components/category/CategoryList";
import { categories } from "../../../data/categories";
import bgImage from "../../../assets/bgforlistoflesson.svg";
import lightbulbIcon from "../../../assets/lightbulb.svg";
import { useLanguage } from "../../../context/LanguageContext";
import { useAuth } from "../../../context/AuthContext";
import { getLearnerName } from "../../../lib/getLearnerName";

// Short tips that appear when the child taps the lightbulb
const TIPS = {
  tl: [
    "Hindi lang kamay ang ginagamit sa sign language. Gamitin din ang iyong mukha!",
    "Mas madali kapag nagsasanay ka nang kaunti araw-araw.",
    "Huwag matakot magkamali. Subukan ulit, kaya mo iyan!",
    "Magsanay sa harap ng salamin para makita mo ang iyong mga kilos.",
  ],
  en: [
    "Sign language is not just hands. Use your face too!",
    "It gets easier when you practice a little every day.",
    "Don't be afraid to make mistakes. Try again, you can do it!",
    "Practice in front of a mirror so you can see your signs.",
  ],
};

export default function CategoriesPage() {
  const { language } = useLanguage();
  const { user } = useAuth();

  const learnerName = getLearnerName(user);
  const isTagalog = language === "tl";

  // null = no tip shown yet
  const [tipIndex, setTipIndex] = useState<number | null>(null);

  const tips = isTagalog ? TIPS.tl : TIPS.en;

  const handleLightbulbClick = () => {
    setTipIndex((current) => (current === null ? 0 : (current + 1) % tips.length));
  };

  return (
    <MainLayout>
      <section className="relative isolate mx-auto w-full max-w-6xl space-y-8 overflow-hidden px-4 py-6 sm:px-6 sm:py-8 lg:px-8 lg:py-10">
        {/* Background Image */}
        <img
          src={bgImage}
          alt=""
          aria-hidden="true"
          className="pointer-events-none absolute bottom-0 left-0 z-0 h-auto w-full translate-y-10 object-contain object-bottom"
        />

        {/* WELCOME HERO BANNER */}
        <div className="relative z-10 overflow-hidden rounded-[28px] border-b-8 border-[#4B3FD1] bg-linear-to-r from-[#6254F5] via-[#7566F6] to-[#9285FF] p-6 text-white shadow-lg sm:p-10">
          {/* Subtle background glow elements */}
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
          <div className="absolute -bottom-10 right-40 h-32 w-32 rounded-full bg-black/10 blur-xl" />

          <div className="relative z-10 flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="min-w-0 space-y-3 text-center sm:text-left">
              {/* Badge */}
              <span className="inline-flex max-w-full items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-xs font-extrabold uppercase tracking-wider text-white shadow-xs backdrop-blur-md">
                <Sparkles
                  size={14}
                  className="shrink-0 animate-pulse text-yellow-300 motion-reduce:animate-none"
                />
                <span className="truncate">
                  {isTagalog
                    ? `Maligayang pagbabalik, ${learnerName}!`
                    : `Welcome back, ${learnerName}!`}
                </span>
              </span>

              <h2 className="text-2xl font-black leading-tight tracking-wide sm:text-3xl lg:text-4xl">
                {isTagalog
                  ? "Handa ka na bang matuto ng Filipino Sign Language ngayon?"
                  : "Ready to learn Filipino Sign Language today?"}
              </h2>

              <p className="flex max-w-xl items-start justify-center gap-2 text-sm font-medium text-white/90 sm:justify-start sm:text-base">
                <BookOpen size={18} className="mt-0.5 shrink-0 text-white/80" />
                <span>
                  {isTagalog
                    ? "Mag-explore ng mga interactive na aralin, magsanay ng mga nakakatuwang kilos, at subukan ang iyong kakayahan sa mabilis na learning modules!"
                    : "Explore interactive lessons, practice fun gestures, and test your skills with quick learning modules!"}
                </span>
              </p>

              {/* TIP BUBBLE (appears after tapping the lightbulb) */}
              <div aria-live="polite" className="min-h-0">
                {tipIndex !== null && (
                  <div
                    key={tipIndex}
                    className="mx-auto flex max-w-xl animate-in items-start gap-3 rounded-2xl bg-white p-4 text-left text-sm font-bold text-[#4B3FD1] shadow-md fade-in slide-in-from-bottom-2 duration-300 sm:mx-0 sm:text-base"
                  >
                    <Lightbulb size={20} className="mt-0.5 shrink-0 text-amber-500" />
                    <span>{tips[tipIndex]}</span>
                  </div>
                )}
              </div>
            </div>

            {/* LIGHTBULB: tap for a tip */}
            <button
              type="button"
              onClick={handleLightbulbClick}
              aria-label={
                isTagalog ? "Pindutin para sa tip" : "Tap for a tip"
              }
              className="group flex h-24 w-24 shrink-0 flex-col items-center justify-center gap-1 rounded-3xl border-b-4 border-white/30 bg-white/15 shadow-inner backdrop-blur-md transition-all duration-150 hover:-translate-y-1 hover:bg-white/25 active:translate-y-0.5 active:border-b-2 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60 motion-reduce:transition-none motion-reduce:hover:translate-y-0 sm:h-28 sm:w-28"
            >
              <img
                src={lightbulbIcon}
                alt=""
                aria-hidden="true"
                className="h-14 w-14 scale-140 object-contain drop-shadow-md transition-transform duration-200 group-hover:rotate-6 group-hover:scale-160 motion-reduce:transition-none motion-reduce:group-hover:transform-none sm:h-20 sm:w-20 sm:scale-170 sm:group-hover:scale-185"
              />
              <span className="text-xs font-extrabold uppercase tracking-wide text-white">
                {tipIndex === null ? "Tip!" : isTagalog ? "Susunod" : "Next"}
              </span>
            </button>
          </div>
        </div>

        {/* Category Content */}
        <div className="relative z-10">
          <h1 className="text-3xl font-black text-blue-900 sm:text-4xl lg:text-5xl">
            {isTagalog ? "Pumili ng kategorya" : "Choose a category"}
          </h1>

          {/* Colorful underline */}
          <div className="mt-2 h-1.5 w-24 rounded-full bg-linear-to-r from-sky-400 via-purple-400 to-amber-300" />

          <p className="mb-6 mt-3 text-base font-medium text-slate-600 sm:mb-8 sm:text-lg">
            {isTagalog
              ? "Piliin ang gusto mong matutunan ngayon!"
              : "Pick what you want to learn today!"}
          </p>

          <CategoryList categories={categories} />
        </div>
      </section>
    </MainLayout>
  );
}