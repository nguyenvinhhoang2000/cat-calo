import { supabase } from "./supabase";
import { addDays, todayKey } from "./date";
import type { MealType } from "./foods";

export type Entry = {
  id: string;
  name: string;
  kcal: number;
  meal: MealType;
};

export type DayData = {
  entries: Entry[];
  goal: number | null;
};

export type HistoryDay = {
  date: string; // khóa "YYYY-MM-DD"
  total: number; // tổng calo đã nạp
  goal: number | null; // mục tiêu ngày đó (nếu có)
  count: number; // số món đã ghi
};

/** Ném lỗi nếu client Supabase chưa sẵn sàng (thiếu khóa .env.local). */
function client() {
  if (!supabase) {
    throw new Error("Supabase chưa được cấu hình (thiếu NEXT_PUBLIC_SUPABASE_*).");
  }
  return supabase;
}

/**
 * Lấy toàn bộ dữ liệu của một ngày: danh sách món + mục tiêu.
 *
 * Args:
 *   deviceId: mã thiết bị hiện tại.
 *   date: khóa ngày "YYYY-MM-DD".
 *
 * Returns:
 *   DayData gồm entries (sắp theo lúc tạo) và goal (null nếu chưa đặt).
 */
export async function getDayData(deviceId: string, date: string): Promise<DayData> {
  const db = client();

  const [entriesRes, goalRes] = await Promise.all([
    db
      .from("entries")
      .select("id, name, kcal, meal")
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

  return {
    entries: (entriesRes.data ?? []) as Entry[],
    goal: goalRes.data ? goalRes.data.goal : null,
  };
}

/**
 * Thêm một món vào ngày chỉ định và trả về bản ghi vừa tạo.
 */
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

/**
 * Tổng hợp lịch sử "days" ngày gần nhất (tính cả hôm nay).
 *
 * Returns:
 *   Mảng HistoryDay theo thứ tự ngày cũ → mới, đủ "days" phần tử
 *   (ngày không có dữ liệu vẫn xuất hiện với total = 0).
 */
export async function getHistory(
  deviceId: string,
  days: number
): Promise<HistoryDay[]> {
  const db = client();
  const today = todayKey();
  const start = addDays(today, -(days - 1));

  const [entriesRes, goalsRes] = await Promise.all([
    db
      .from("entries")
      .select("entry_date, kcal")
      .eq("device_id", deviceId)
      .gte("entry_date", start)
      .lte("entry_date", today),
    db
      .from("daily_goals")
      .select("goal_date, goal")
      .eq("device_id", deviceId)
      .gte("goal_date", start)
      .lte("goal_date", today),
  ]);

  if (entriesRes.error) throw entriesRes.error;
  if (goalsRes.error) throw goalsRes.error;

  const totals = new Map<string, { total: number; count: number }>();
  for (const row of entriesRes.data ?? []) {
    const cur = totals.get(row.entry_date) ?? { total: 0, count: 0 };
    cur.total += row.kcal;
    cur.count += 1;
    totals.set(row.entry_date, cur);
  }

  const goals = new Map<string, number>();
  for (const row of goalsRes.data ?? []) {
    goals.set(row.goal_date, row.goal);
  }

  const result: HistoryDay[] = [];
  for (let i = 0; i < days; i++) {
    const date = addDays(start, i);
    const agg = totals.get(date) ?? { total: 0, count: 0 };
    result.push({
      date,
      total: agg.total,
      count: agg.count,
      goal: goals.get(date) ?? null,
    });
  }
  return result;
}
