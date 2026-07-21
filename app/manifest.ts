import type { MetadataRoute } from "next";

/**
 * Web App Manifest cho MèoCalo (được Next.js phục vụ tại /manifest.webmanifest).
 * Cho phép cài đặt như ứng dụng trên điện thoại/desktop.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MèoCalo — Theo dõi calo mỗi ngày",
    short_name: "MèoCalo",
    description:
      "Ứng dụng dễ thương giúp bạn ghi lại và theo dõi lượng calo nạp vào trong ngày.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#fff2f7",
    theme_color: "#ec6a96",
    lang: "vi",
    categories: ["health", "lifestyle", "food"],
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icons/maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
