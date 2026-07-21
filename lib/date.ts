/**
 * Tiện ích xử lý ngày dạng khóa "YYYY-MM-DD" theo GIỜ ĐỊA PHƯƠNG.
 * Không dùng toISOString() để tránh lệch múi giờ (UTC) làm sai ngày.
 */

/** Chuyển một Date thành khóa "YYYY-MM-DD" theo giờ địa phương. */
export function dateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Khóa ngày của hôm nay. */
export function todayKey(): string {
  return dateKey(new Date());
}

/** Trả về khóa ngày cách "key" một số ngày (âm để lùi về quá khứ). */
export function addDays(key: string, n: number): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  dt.setDate(dt.getDate() + n);
  return dateKey(dt);
}

/** True nếu khóa ngày là hôm nay. */
export function isToday(key: string): boolean {
  return key === todayKey();
}

/** Nhãn đầy đủ tiếng Việt, vd: "Thứ Hai, 21 tháng 7". */
export function fullLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("vi-VN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });
}

/** Nhãn ngắn tiếng Việt, vd: "T2 21/7". */
export function shortLabel(key: string): string {
  const [y, m, d] = key.split("-").map(Number);
  const dt = new Date(y, m - 1, d);
  const wd = dt.toLocaleDateString("vi-VN", { weekday: "short" });
  return `${wd} ${d}/${m}`;
}
