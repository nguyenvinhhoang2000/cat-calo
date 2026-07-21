# MèoCalo 🐱

Ứng dụng web dễ thương giúp ghi lại và theo dõi lượng **calo nạp vào trong ngày**, tông màu hồng pastel với bé mèo hoạt hình làm mascot.

Dựng bằng **Next.js 16 (App Router)** · **HeroUI v3** · **Tailwind CSS v4** · **TypeScript**.

## Tính năng

- 🍽️ Thêm món ăn kèm số calo, phân theo bữa (sáng / trưa / tối / ăn vặt)
- 💕 Thêm nhanh từ danh sách món Việt phổ biến (calo tham khảo)
- 🐱 Vòng tròn calo có bé mèo đổi biểu cảm theo mức nạp vào (đói → vui → no → quá no)
- 🎯 Đặt mục tiêu calo mỗi ngày, kèm bộ **gợi ý theo cơ thể** (Mifflin–St Jeor, chọn nam/nữ)
- 📅 **Lịch sử theo ngày:** xem lại nhật ký từng ngày, biểu đồ 7 ngày, số ngày đạt mục tiêu
- ☁️ Lưu dữ liệu trên **Supabase** (đồng bộ theo mã thiết bị)
- 📱 Responsive, chạy tốt trên điện thoại

## Yêu cầu

- Node.js **20+** (khuyến nghị 22+)
- Một project **Supabase** (miễn phí) để lưu dữ liệu

## Cấu hình Supabase

1. Tạo project tại [supabase.com](https://supabase.com).
2. Mở **SQL Editor → New query**, dán toàn bộ nội dung [`supabase/schema.sql`](supabase/schema.sql) và chạy để tạo bảng.
3. Vào **Project Settings → API**, sao chép **Project URL** và **anon public key**.
4. Tạo file `.env.local` (tham khảo `.env.example`) và điền:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
   ```

> **Nhận diện người dùng:** hiện dùng `device_id` (UUID sinh ở trình duyệt, lưu trong localStorage) làm khóa phân biệt dữ liệu — chạy được ngay không cần bật auth. Muốn đồng bộ nhiều thiết bị / bảo mật chặt hơn, hãy nâng lên **Supabase Auth** và thay `device_id` bằng `auth.uid()` trong policy.

## Cách chạy

```bash
# 1. Cài thư viện
npm install

# 2. Tạo .env.local và điền khóa Supabase (xem mục trên)

# 3. Chạy chế độ phát triển
npm run dev
# mở http://localhost:3000

# 4. Build bản chính thức
npm run build
npm run start
```

## Cấu trúc chính

```
app/
  layout.tsx        # Bố cục gốc, nạp font Fredoka + Nunito
  page.tsx          # Toàn bộ logic & giao diện ứng dụng
  globals.css       # Tailwind + HeroUI + bảng màu hồng pastel
components/
  CatMascot.tsx     # Bé mèo SVG, đổi biểu cảm theo tâm trạng
  CalorieRing.tsx   # Vòng tròn tiến độ calo có mèo ở giữa
  HistoryPanel.tsx  # Biểu đồ & danh sách lịch sử nhiều ngày
lib/
  foods.ts          # Danh sách bữa ăn & món thêm nhanh
  supabase.ts       # Khởi tạo client Supabase
  db.ts             # Truy vấn dữ liệu (món ăn, mục tiêu, lịch sử)
  date.ts           # Tiện ích xử lý ngày (khóa YYYY-MM-DD, nhãn tiếng Việt)
  deviceId.ts       # Sinh & lưu mã thiết bị
supabase/
  schema.sql        # DDL tạo bảng + RLS cho Supabase
```

## Tùy chỉnh nhanh

- **Đổi màu:** sửa các biến `--color-*` trong `app/globals.css`.
- **Đổi món thêm nhanh:** sửa mảng `QUICK_FOODS` trong `lib/foods.ts`.
- **Đổi font:** thay thẻ `<link>` Google Fonts trong `app/layout.tsx` và biến `--font-*`.

> Lưu ý: các con số calo chỉ mang tính tham khảo, không thay thế tư vấn dinh dưỡng chuyên môn.
