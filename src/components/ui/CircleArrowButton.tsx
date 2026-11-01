import { ArrowRight } from "lucide-react";

interface CircleArrowButtonProps {
  color: string;
  onClick?: () => void;
}

export default function CircleArrowButton({
  color,
  onClick,
}: CircleArrowButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Open category"
      className={`
        ${color}
        flex
        h-14
        w-14
        items-center
        justify-center
        rounded-full
        text-white
        transition-all
        hover:scale-105
      `}
    >
      <ArrowRight size={24} />
    </button>
  );
}