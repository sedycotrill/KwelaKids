import { useNavigate } from "react-router-dom";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { useLanguage } from "../../../context/LanguageContext";

export default function AlphabetPractical() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isTagalog = language === "tl";

  const handlePassQuiz = () => {
    try {
      const storedUser =
        localStorage.getItem("kwelakids_current_user") ||
        sessionStorage.getItem("kwelakids_current_user");
      const currentUser = storedUser ? JSON.parse(storedUser) : null;
      const userEmail = currentUser?.email || "default_user";

      // I-save ang pagpasa sa practical para mag-unlock ang Championship
      localStorage.setItem(`kwelakids_${userEmail}_alphabet_practical_passed`, "true");
    } catch {
      // fallback
    }
    navigate("/alphabet");
  };

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
          <h1 className="text-3xl font-black text-[#164B9B]">
            {isTagalog ? "Praktis na Pagsusulit (Practical)" : "Alphabet Practical Quiz"}
          </h1>
          <p className="mt-3 text-slate-600">
            {isTagalog
              ? "Dito isinasagawa ang pagsusulit para sa mga natutunang titik."
              : "Complete the quiz tests to unlock the championship island."}
          </p>

          <div className="mt-8 flex justify-center">
            <button
              type="button"
              onClick={handlePassQuiz}
              className="flex items-center gap-2 rounded-2xl border-b-4 border-emerald-600 bg-emerald-500 px-6 py-4 text-lg font-extrabold text-white transition hover:bg-emerald-600 active:border-b-2"
            >
              <CheckCircle2 size={24} />
              {isTagalog ? "Ipasa ang Pagsusulit (Test Pass)" : "Pass Quiz (Test Pass)"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}