import { useNavigate } from "react-router-dom";
import { ArrowLeft, Trophy } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

export default function AlphabetChampionship() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTagalog = language === "tl";

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF] p-6">
      <div className="mx-auto max-w-4xl pt-6">
        <button
          type="button"
          onClick={() => navigate("/alphabet")}
          aria-label={isTagalog ? "Bumalik sa mapa" : "Back to map"}
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border-b-4 border-[#B8DDF6] bg-white text-[#36A9F4] transition-all duration-150 hover:-translate-y-0.5 hover:bg-slate-50 active:translate-y-0.5 active:border-b-2"
        >
          <ArrowLeft size={22} strokeWidth={2.5} />
        </button>

        <div className="mt-8 rounded-3xl border border-[#B8DDF6] bg-white p-8 text-center shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-500">
              <Trophy size={40} />
            </div>
          </div>
          <h1 className="text-3xl font-black text-[#164B9B]">
            {isTagalog ? "Kampeonato ng Alpabeto" : "Alphabet Championship"}
          </h1>
          <p className="mt-3 text-slate-600">
            {isTagalog
              ? "Ang pinakahuling pagsubok para patunayan ang iyong husay sa FSL Alphabet!"
              : "The ultimate challenge to prove your FSL mastery!"}
          </p>
        </div>
      </div>
    </main>
  );
}