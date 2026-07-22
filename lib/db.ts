import { supabase } from "./supabase";
import { addDays, todayKey } from "./date";
import type { MealType } from "./foods";

// Mục tiêu mặc định dùng khi một ngày (cũ) không có mục tiêu được lưu —
// để đánh giá lịch sử / streak vẫn ổn định.
const DEFAULT_GOAL = 1800;

export type Entry = {
  id: string;
  name: string;
  kcal: number;
  meal: MealType;
};

export type Workout = {
  id: string;
  name: string;
  kcal: number; // calo tiêu hao
};

export type DayData = {
  entries: Entry[];
  workouts: Workout[];
  goal: number | null;
};

export type HistoryDay = {
  date: string; // khóa "YYYY-MM-DD"
  eaten: number; // tổng calo đã ăn
  burned: number; // tổng calo đã đốt
  net: number; // eaten - burned
  goal: number | null; // mục tiêu ngày đó (nếu có)
};

/** Ném lỗi nếu client Supabase chưa sẵn sàng (thiếu khóa .env.local). */
function client() {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình (thiếu NEXT_PUBLIC_SUPABASE_*).");
  }
  return supabase;
}

/**
 * Lấy toàn bộ dữ liệu của một ngày: món ăn + bài tập + mục tiêu.
 *
 * Args:
 *   deviceId: mã thiết bị hiện tại.
 *   date: khóa ngày "YYYY-MM-DD".
 *
 * Returns:
 *   DayData gồm entries, workouts (sắp theo lúc tạo) và goal (null nếu chưa đặt).
 */
export async function getDayData(deviceId: string, date: string): Promise<DayData> {
  const db = client();

  const [entriesRes, workoutsRes, goalRes] = await Promise.all([
    db
      .from("entries")
      .select("id, name, kcal, meal")
      .eq("device_id", deviceId)
      .eq("entry_date", date)
      .order("created_at", { ascending: true }),
    db
      .from("workouts")
      .select("id, name, kcal")
      .eq("device_id", deviceId)
      .eq("entry_date", date)
      .order("created_at", { ascending: true }),
    db
      .from("daily_goals")
      .select("goal")
      .eq("device_id", deviceId)
      .eq("goal_date", date)
      .maybeSingle(),
  ]);

  if (entriesRes.error) throw entriesRes.error;
  if (goalRes.error) throw goalRes.error;
  // Bảng workouts có thể chưa tồn tại (chưa chạy migration) → coi như trống.

  return {
    entries: (entriesRes.data ?? []) as Entry[],
    workouts: (workoutsRes.error ? [] : workoutsRes.data ?? []) as Workout[],
    goal: goalRes.data ? goalRes.data.goal : null,
  };
}

/** Thêm một món ăn vào ngày chỉ định và trả về bản ghi vừa tạo. */
export async function addEntry(
  deviceId: string,
  date: string,
  entry: { name: string; kcal: number; meal: MealType }
): Promise<Entry> {
  const db = client();
  const { data, error } = await db
    .from("entries")
    .insert({
      device_id: deviceId,
      entry_date: date,
      name: entry.name,
      kcal: entry.kcal,
      meal: entry.meal,
    })
    .select("id, name, kcal, meal")
    .single();

  if (error) throw error;
  return data as Entry;
}

/** Xoá một món theo id. */
export async function removeEntry(id: string): Promise<void> {
  const db = client();
  const { error } = await db.from("entries").delete().eq("id", id);
  if (error) throw error;
}

/** Xoá toàn bộ món của một ngày. */
export async function clearDay(deviceId: string, date: string): Promise<void> {
  const db = client();
  const { error } = await db
    .from("entries")
    .delete()
    .eq("device_id", deviceId)
    .eq("entry_date", date);
  if (error) throw error;
}

/** Thêm một bài tập (calo tiêu hao) vào ngày chỉ định. */
export async function addWorkout(
  deviceId: string,
  date: string,
  workout: { name: string; kcal: number }
): Promise<Workout> {
  const db = client();
  const { data, error } = await db
    .from("workouts")
    .insert({
      device_id: deviceId,
      entry_date: date,
      name: workout.name,
      kcal: workout.kcal,
    })
    .select("id, name, kcal")
    .single();

  if (error) throw error;
  return data as Workout;
}

/** Xoá một bài tập theo id. */
export async function removeWorkout(id: string): Promise<void> {
  const db = client();
  const { error } = await db.from("workouts").delete().eq("id", id);
  if (error) throw error;
}

/** Đặt (hoặc cập nhật) mục tiêu calo cho một ngày. */
export async function upsertGoal(
  deviceId: string,
  date: string,
  goal: number
): Promise<void> {
  const db = client();
  const { error } = await db.from("daily_goals").upsert(
    {
      device_id: deviceId,
      goal_date: date,
      goal,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "device_id,goal_date" }
  );
  if (error) throw error;
}

/**
 * Lấy mục tiêu gần nhất đã từng đặt (để làm mặc định cho ngày chưa có).
 * Trả về null nếu người dùng chưa từng đặt mục tiêu nào.
 */
export async function getLatestGoal(deviceId: string): Promise<number | null> {
  const db = client();
  const { data, error } = await db
    .from("daily_goals")
    .select("goal")
    .eq("device_id", deviceId)
    .order("goal_date", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ? data.goal : null;
}

// Gộp calo theo ngày cho một khoảng thời gian. Trả về map date -> tổng kcal.
function sumByDate(rows: { entry_date: string; kcal: number }[]) {
  const map = new Map<string, number>();
  for (const r of rows) map.set(r.entry_date, (map.get(r.entry_date) ?? 0) + r.kcal);
  return map;
}

// Lấy dữ liệu tổng hợp (ăn / đốt / mục tiêu) theo ngày cho khoảng [start, end].
async function fetchDailyAgg(deviceId: string, start: string, end: string) {
  const db = client();
  const [eatenRes, burnedRes, goalsRes] = await Promise.all([
    db
      .from("entries")
      .select("entry_date, kcal")
      .eq("device_id", deviceId)
      .gte("entry_date", start)
      .lte("entry_date", end),
    db
      .from("workouts")
      .select("entry_date, kcal")
      .eq("device_id", deviceId)
      .gte("entry_date", start)
      .lte("entry_date", end),
    db
      .from("daily_goals")
      .select("goal_date, goal")
      .eq("device_id", deviceId)
      .gte("goal_date", start)
      .lte("goal_date", end),
  ]);

  if (eatenRes.error) throw eatenRes.error;
  if (goalsRes.error) throw goalsRes.error;

  const eaten = sumByDate(eatenRes.data ?? []);
  // workouts có thể chưa tồn tại → coi như không đốt calo.
  const burned = sumByDate(burnedRes.error ? [] : burnedRes.data ?? []);
  const goals = new Map<string, number>();
  for (const r of goalsRes.data ?? []) goals.set(r.goal_date, r.goal);

  return { eaten, burned, goals };
}

/**
 * Tổng hợp lịch sử "days" ngày gần nhất (tính cả hôm nay).
 * net = calo ăn − calo đốt. Ngày không có dữ liệu vẫn xuất hiện với số 0.
 */
export async function getHistory(
  deviceId: string,
  days: number
): Promise<HistoryDay[]> {
  const today = todayKey();
  const start = addDays(today, -(days - 1));
  const { eaten, burned, goals } = await fetchDailyAgg(deviceId, start, today);

  const result: HistoryDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const e = eaten.get(date) ?? 0;
    const b = burned.get(date) ?? 0;
    result.push({
      date,
      eaten: e,
      burned: b,
      net: e - b,
      goal: goals.get(date) ?? null,
    });
  }
  return result;
}

/**
 * Tính chuỗi ngày (streak) đạt mục tiêu tính đến hôm nay.
 *
 * Quy tắc:
 *   • Một ngày "đạt" khi có ghi nhận (ăn hoặc tập) và net (ăn − đốt) ≤ mục tiêu
 *     của CHÍNH ngày đó (ngày cũ không có mục tiêu thì dùng mặc định).
 *   • Đếm liên tiếp lùi từ hôm nay; gặp ngày không đạt thì dừng.
 *   • Hôm nay nếu CHƯA ghi gì thì bỏ qua (không tính, cũng không phá chuỗi).
 */
export async function getStreak(
  deviceId: string,
  windowDays = 60
): Promise<number> {
  const today = todayKey();
  const start = addDays(today, -(windowDays - 1));
  const { eaten, burned, goals } = await fetchDailyAgg(deviceId, start, today);

  let streak = 0;
  for (let i = 0; i < windowDays; i++) {
    const date = addDays(today, -i);
    const e = eaten.get(date) ?? 0;
    const b = burned.get(date) ?? 0;
    const hasActivity = e > 0 || b > 0;
    const goal = goals.get(date) ?? DEFAULT_GOAL;

    if (i === 0 && !hasActivity) continue; // hôm nay chưa ghi → chưa xét
    if (hasActivity && e - b <= goal) streak++;
    else break;
  }
  return streak;
}
