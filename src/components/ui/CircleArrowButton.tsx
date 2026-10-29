import { ArrowRight } from "lucide-react";

interface CircleArrowButtonProps {
  color: string;
}

export default function CircleArrowButton({
  color,
}: CircleArrowButtonProps) {
  return (
    <button
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