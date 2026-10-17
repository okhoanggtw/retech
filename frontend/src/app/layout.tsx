import type { Metadata } from "next";
import "./globals.css";
import Providers from "@/components/Providers";
import Shell from "@/components/Shell";

export const metadata: Metadata = {
  title: { default: "ReTech – Đồ công nghệ cũ chuẩn như mới", template: "%s | ReTech" },
  description: "Mua bán điện thoại, laptop, máy ảnh, tai nghe, đồng hồ đã qua sử dụng. AI định giá thu cũ tức thì, thanh toán QR PayOS.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      </head>
      <body>
        <Providers>
          <Shell>{children}</Shell>
        </Providers>
      </body>
    </html>
  );
}
