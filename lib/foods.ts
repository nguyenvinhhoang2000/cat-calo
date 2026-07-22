export type MealType = "breakfast" | "lunch" | "dinner" | "snack";

export const MEALS: {
  id: MealType;
  label: string;
  emoji: string;
  color: string; // token màu nền chip
}[] = [
  { id: "breakfast", label: "Bữa sáng", emoji: "🌅", color: "bg-butter" },
  { id: "lunch", label: "Bữa trưa", emoji: "🍱", color: "bg-peach" },
  { id: "dinner", label: "Bữa tối", emoji: "🌙", color: "bg-lilac" },
  { id: "snack", label: "Ăn vặt", emoji: "🍬", color: "bg-mint" },
];
