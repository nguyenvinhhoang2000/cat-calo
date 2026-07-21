"use client";

import { useEffect } from "react";

/**
 * Đăng ký service worker để bật khả năng offline / cài đặt PWA.
 * Chỉ đăng ký ở môi trường production nhằm tránh xung đột với HMR khi dev.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    const register = () => {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* đăng ký thất bại thì app vẫn chạy bình thường */
      });
    };

    // Nếu trang đã tải xong (effect chạy sau sự kiện 'load') thì đăng ký ngay,
    // ngược lại chờ 'load' để không tranh tài nguyên lúc khởi động.
    if (document.readyState === "complete") {
      register();
    } else {
      window.addEventListener("load", register, { once: true });
      return () => window.removeEventListener("load", register);
    }
  }, []);

  return null;
}
