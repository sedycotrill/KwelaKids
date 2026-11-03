import { useNavigate } from "react-router-dom";
import { useLanguage } from "../../../context/LanguageContext";

import transitionGirl from "../../../assets/transitiongurl.svg";
import confetti from "../../../assets/confetti.svg";
import sparkle1 from "../../../assets/sparkle1.svg";
import sparkle2 from "../../../assets/sparkle2.svg";

export default function AlphabetComplete() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const storedUser =
    localStorage.getItem("kwelakids_current_user") ||
    sessionStorage.getItem("kwelakids_current_user");

  const currentUser = storedUser ? JSON.parse(storedUser) : null;

  const userName =
    currentUser?.email
      ?.split("@")[0]
      .replace(/[._-]/g, " ")
      .replace(/\b\w/g, (letter: string) => letter.toUpperCase()) ||
    "Learner";

  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-linear-to-b from-[#C9E9FC] via-[#E4F4FF] to-[#F5FAFF]">

      {/* Confetti Animation */}
      <style>
        {`
          @keyframes confettiRise {
            0% {
              transform: translateY(100vh);
              opacity: 0;
            }
            15% {
              opacity: 1;
            }
            100% {
              transform: translateY(-120vh);
              opacity: 1;
            }
          }
        `}
      </style>

      <img src={confetti} alt="" className="pointer-events-none absolute left-[55%] top-[40%] z-0 h-[60%] w-[60%] object-cover" style={{ animation: "confettiRise 3s linear infinite" }} />
      <img src={confetti} alt="" className="pointer-events-none absolute right-[12%] top-[-5%] z-0 h-[80%] w-[80%] object-contain" style={{ animation: "confettiRise 4s linear 1s infinite" }} />
      <img src={confetti} alt="" className="pointer-events-none absolute right-[45%] top-[20%] z-0 h-[55%] w-[55%] object-contain" style={{ animation: "confettiRise 4s linear 2s infinite" }} />
      <img src={confetti} alt="" className="pointer-events-none absolute right-[-10%] top-[30%] z-0 h-[65%] w-[65%] object-contain" style={{ animation: "confettiRise 3s linear 0.5s infinite" }} />
      <img src={confetti} alt="" className="pointer-events-none absolute right-[65%] top-[10%] z-0 h-[50%] w-[50%] object-contain" style={{ animation: "confettiRise 4s linear 3s infinite" }} />
      <img src={confetti} alt="" className="pointer-events-none absolute right-[25%] top-[50%] z-0 h-[70%] w-[70%] object-contain" style={{ animation: "confettiRise 6s linear 1.5s infinite" }} />

      {/* Sparkles */}
      <img src={sparkle1} alt="" className="pointer-events-none absolute left-[37%] top-[13%] z-0 h-[25%] w-[25%] object-contain" />
      <img src={sparkle2} alt="" className="pointer-events-none absolute right-[6%] top-[65%] z-0 h-[25%] w-[25%] object-contain" />

      {/* Girl Illustration */}
      <img
        src={transitionGirl}
        alt="Happy girl celebrating"
        className="absolute bottom-0 z-0 h-[120%] w-[500%] -translate-x-px translate-y-px object-fill object-bottom"
      />

      {/* Congratulations Card */}
      <div className="absolute right-[20%] top-[50%] z-20 h-77.5 w-full max-w-112.5 translate-y-[-50%] rounded-[22px] border-[6px] border-[#F9C526] bg-white px-6 py-5 text-center shadow-sm">

        {/* Title */}
        <h1 className="text-[36px] font-black leading-tight text-[#102D69] sm:text-[38px]">
          {language === "tl" ? "MAGALING" : "WELL DONE"}
          <br />
          {userName}!
        </h1>

        {/* Description */}
        <p className="mt-4 text-xs leading-relaxed text-[#102D69] sm:text-sm font-medium">
          {language === "tl"
            ? "Sa palagay ko ay handa ka na upang hamunin ang iyong sarili."
            : "I think you are now ready to challenge yourself."}
        </p>

        {/* Buttons */}
        <div className="mt-6 flex items-center justify-center gap-4">

          {/* Exit Button */}
          <button
            type="button"
            onClick={() => navigate("/alphabet")}
            className="w-1/2 rounded-xl border border-[#AAAAAA] bg-white px-3 py-2 text-base font-extrabold text-[#666666] transition hover:bg-gray-100 sm:text-xl"
          >
            {language === "tl" ? "LUMABAS" : "EXIT"}
          </button>

          {/* Proceed Button */}
          <button
            type="button"
            onClick={() => navigate("/alphabetquiz")}
            className="w-1/2 rounded-xl border border-[#238FD5] bg-[#36A9F4] px-3 py-2 text-base font-extrabold text-white transition hover:bg-[#208FD8] sm:text-xl"
          >
            {language === "tl" ? "TULOY" : "PROCEED"}
          </button>

        </div>
      </div>

    </main>
  );
}