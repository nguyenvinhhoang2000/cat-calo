export type QuickFood = {
  name: string;
  kcal: number;
  emoji: string;
  meal: MealType;
};

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

// Calo mang tính tham khảo cho 1 khẩu phần thông thường
export const QUICK_FOODS: QuickFood[] = [
  { name: "Phở bò", kcal: 420, emoji: "🍜", meal: "breakfast" },
  { name: "Bánh mì trứng", kcal: 320, emoji: "🥖", meal: "breakfast" },
  { name: "Xôi", kcal: 350, emoji: "🍙", meal: "breakfast" },
  { name: "Trứng ốp la", kcal: 90, emoji: "🍳", meal: "breakfast" },
  { name: "Cơm tấm sườn", kcal: 620, emoji: "🍚", meal: "lunch" },
  { name: "Bún chả", kcal: 500, emoji: "🍢", meal: "lunch" },
  { name: "Salad ức gà", kcal: 280, emoji: "🥗", meal: "lunch" },
  { name: "Cơm gà", kcal: 560, emoji: "🍗", meal: "lunch" },
  { name: "Bún bò Huế", kcal: 480, emoji: "🌶️", meal: "dinner" },
  { name: "Lẩu (1 phần)", kcal: 450, emoji: "🍲", meal: "dinner" },
  { name: "Cá hồi áp chảo", kcal: 350, emoji: "🐟", meal: "dinner" },
  { name: "Trà sữa trân châu", kcal: 340, emoji: "🧋", meal: "snack" },
  { name: "Sữa chua", kcal: 100, emoji: "🥛", meal: "snack" },
  { name: "Táo", kcal: 80, emoji: "🍎", meal: "snack" },
  { name: "Bánh quy (3 cái)", kcal: 160, emoji: "🍪", meal: "snack" },
  { name: "Cà phê sữa", kcal: 120, emoji: "☕", meal: "snack" },
];

export type QuickWorkout = {
  name: string;
  kcal: number; // calo tiêu hao tham khảo cho ~30 phút
  emoji: string;
};

// Calo tiêu hao mang tính tham khảo (khoảng 30 phút, người ~55kg)
export const QUICK_WORKOUTS: QuickWorkout[] = [
  { name: "Đi bộ", kcal: 120, emoji: "🚶" },
  { name: "Chạy bộ", kcal: 300, emoji: "🏃" },
  { name: "Đạp xe", kcal: 250, emoji: "🚴" },
  { name: "Yoga", kcal: 150, emoji: "🧘" },
  { name: "Gym / tạ", kcal: 200, emoji: "🏋️" },
  { name: "Bơi lội", kcal: 330, emoji: "🏊" },
  { name: "Nhảy dây", kcal: 300, emoji: "🤸" },
  { name: "Cầu lông", kcal: 240, emoji: "🏸" },
];
