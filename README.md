# MèoCalo 🐱

Ứng dụng web dễ thương giúp ghi lại và theo dõi lượng **calo nạp vào trong ngày**, tông màu hồng pastel với bé mèo hoạt hình làm mascot.

Dựng bằng **Next.js 16 (App Router)** · **HeroUI v3** · **Tailwind CSS v4** · **TypeScript**.

## Tính năng

- 🍽️ Thêm món ăn kèm số calo, phân theo bữa (sáng / trưa / tối / ăn vặt)
- 💕 Thêm nhanh từ danh sách món Việt phổ biến (calo tham khảo)
- 🐱 Vòng tròn calo có bé mèo đổi biểu cảm theo mức nạp vào (đói → vui → no → quá no)
- 🎯 Đặt mục tiêu calo mỗi ngày, kèm bộ **gợi ý theo cơ thể** (công thức Mifflin–St Jeor)
- 💾 Tự động lưu dữ liệu ngay trên máy bạn (localStorage) — mở lại vẫn còn
- 📱 Responsive, chạy tốt trên điện thoại

## Yêu cầu

- Node.js **20+** (khuyến nghị 22+)

## Cách chạy

```bash
# 1. Cài thư viện
npm install

# 2. Chạy chế độ phát triển
npm run dev
# mở http://localhost:3000

# 3. Build bản chính thức
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
lib/
  foods.ts          # Danh sách bữa ăn & món thêm nhanh
```

## Tùy chỉnh nhanh

- **Đổi màu:** sửa các biến `--color-*` trong `app/globals.css`.
- **Đổi món thêm nhanh:** sửa mảng `QUICK_FOODS` trong `lib/foods.ts`.
- **Đổi font:** thay thẻ `<link>` Google Fonts trong `app/layout.tsx` và biến `--font-*`.

> Lưu ý: các con số calo chỉ mang tính tham khảo, không thay thế tư vấn dinh dưỡng chuyên môn.
