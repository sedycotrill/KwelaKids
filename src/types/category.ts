export type CategoryTheme =
  | "sky"
  | "green"
  | "yellow"
  | "purple";

export interface Category {
  id: number;
  title: string;
  description: string;
  image: string;
  theme: CategoryTheme;
}