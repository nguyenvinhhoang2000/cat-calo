const DEVICE_KEY = "meocalo:device_id";

function randomId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/**
 * Lấy (hoặc tạo mới) mã thiết bị ổn định cho trình duyệt hiện tại.
 * Mã này dùng làm khóa phân biệt dữ liệu giữa các thiết bị trong Supabase.
 * Chỉ gọi ở phía client (sau khi component đã mount).
 */
export function getDeviceId(): string {
  if (typeof window === "undefined") return "";
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = randomId();
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}
