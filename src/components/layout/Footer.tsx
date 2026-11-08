import { Star } from "lucide-react";

import FooterIcon from "../../assets/FooterIcon.svg";

export default function Footer() {
  return (
    <footer className="relative mt-12">
      {/* Wavy divider */}
      <svg
        viewBox="0 0 1440 48"
        preserveAspectRatio="none"
        className="block h-8 w-full text-white sm:h-12"
        aria-hidden="true"
      >
        <path
          fill="currentColor"
          d="M0 48V24C120 4 240 4 360 20s240 24 360 8 240-28 360-12 240 24 360 8V48H0Z"
        />
      </svg>

      <div className="bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-6 pb-4 text-center sm:flex-row sm:text-left">
          {/* Left Side */}
          <div className="flex flex-col items-center gap-2 sm:flex-row sm:gap-4">
            <img
              src={FooterIcon}
              alt="KwelaKids Logo"
              className="h-20 w-auto object-contain transition-transform duration-200 hover:scale-110 hover:rotate-3 motion-reduce:transition-none motion-reduce:hover:transform-none"
            />

            <div className="flex flex-col text-sm text-slate-500">
              <span className="text-base font-extrabold text-sky-700">
                KwelaKids Educational Platform
              </span>
              <span className="font-medium">Filipino Sign Language Learning Platform</span>
            </div>
          </div>

          {/* Right Side */}
          <p className="flex items-center gap-1.5 rounded-full bg-amber-100 px-4 py-1.5 text-sm font-bold text-amber-700">
            <span>© 2026</span>
            <Star size={14} aria-hidden="true" className="fill-amber-500 text-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}