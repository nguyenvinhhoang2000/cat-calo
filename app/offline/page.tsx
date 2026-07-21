import type { Metadata } from "next";
import CatMascot from "@/components/CatMascot";

export const metadata: Metadata = {
  title: "Ngoại tuyến — MèoCalo",
};

export default function OfflinePage() {
  return (
    <main className="mx-auto flex min-h-[80vh] max-w-md flex-col items-center justify-center px-4 text-center">
      <CatMascot mood="hungry" size={140} className="animate-floaty" />
      <h1 className="mt-4 font-display text-2xl font-bold text-plum">
        Đang mất kết nối 🐾
      </h1>
      <p className="mt-2 text-sm font-semibold text-plum-soft">
        Bé mèo không lên mạng được. Kiểm tra kết nối rồi thử lại nhé — dữ liệu
        đã lưu vẫn an toàn.
      </p>
    </main>
  );
}
