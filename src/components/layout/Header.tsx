import { ChevronDown, CircleUserRound } from "lucide-react";
import HeaderLogo from "../../assets/HeaderLogo.svg";

interface HeaderProps {
  learnerName: string;
}

export default function Header({
  learnerName,
}: HeaderProps) {
  return (
    <header className="bg-white border-b border-slate-200">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center justify-between px-6">

        {/* LOGO */}
        <div className="flex items-center">
          <img
            src={HeaderLogo}
            alt="FSL Learn Logo"
            className="w-[200px] object-contain"
          />
        </div>

        {/* USER MENU */}
        <button className="flex items-center gap-2 text-sky-700 transition-colors hover:text-sky-600">
          <CircleUserRound size={24} />

          <span className="font-semibold">
            Hi, {learnerName}!
          </span>

          <ChevronDown size={16} />
        </button>
      </div>
    </header>
  );
}