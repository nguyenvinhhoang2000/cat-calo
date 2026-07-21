import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

/**
 * True khi cả URL và anon key đều đã được cấu hình trong .env.local.
 * Dùng để hiển thị cảnh báo và tránh gọi Supabase khi thiếu khóa.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

/**
 * Client Supabase dùng chung cho phía trình duyệt.
 * Là null khi chưa cấu hình khóa (app vẫn render được, chỉ không lưu).
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string, {
      auth: { persistSession: false },
    })
  : null;
