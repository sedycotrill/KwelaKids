import type { Category } from "../types/category";

import alphabetImage from "../assets/alphabet.svg";
import numbersImage from "../assets/numbers.svg";
import greetingsImage from "../assets/greetings.svg";
import phrasesImage from "../assets/phrases.svg";

export const categories: Category[] = [
  {
    id: 1,
    title: "Alphabet",
    description: "Learn the letters of the Filipino alphabet.",
    image: alphabetImage,
    theme: "sky",
  },
  {
    id: 2,
    title: "Numbers",
    description: "Learn how to sign 1-10.",
    image: numbersImage,
    theme: "green",
  },
  {
    id: 3,
    title: "Greetings",
    description: "Learn common greetings and polite expressions.",
    image: greetingsImage,
    theme: "yellow",
  },
  {
    id: 4,
    title: "Phrase",
    description: "Learn common greetings and polite expressions.",
    image: phrasesImage,
    theme: "purple",
  },
];