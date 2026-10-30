import FooterIcon from "../../assets/FooterIcon.svg";

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-1">

        {/* Left Side */}
        <div className="flex items-center gap-3">
          <img
            src={FooterIcon}
            alt="KwelaKids Logo"
            className="h-20 w-auto object-contain"
          />

          <div className="flex items-center gap-2 text-sm text-slate-500">
            <span className="font-medium text-slate-700">
              KwelaKids Educational Platform
            </span>

            <span className="text-slate-300">•</span>

            <span>
              Filipino Sign Language Learning Platform
            </span>
          </div>
        </div>

        {/* Right Side */}
        <p className="text-sm text-slate-500">
          © 2026
        </p>
      </div>
    </footer>
  );
}