import type{ CategoryTheme } from "../types/category";

export const categoryThemes: Record<
  CategoryTheme,
  {
    card: string;
    title: string;
    button: string;
  }
> = {
  sky: {
    card: "bg-sky-100",
    title: "text-sky-600",
    button: "bg-sky-500",
  },

  green: {
    card: "bg-green-100",
    title: "text-green-600",
    button: "bg-green-500",
  },

  yellow: {
    card: "bg-yellow-200",
    title: "text-yellow-700",
    button: "bg-yellow-600",
  },

  purple: {
    card: "bg-purple-100",
    title: "text-purple-600",
    button: "bg-purple-500",
  },
};