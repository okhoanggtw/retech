"use client";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "./ChatWidget";

/** Trang user co header/footer, trang admin dung layout rieng */
export default function Shell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  if (path.startsWith("/admin")) return <>{children}</>;
  return (
    <>
      <Header />
      <main className="min-h-[70vh]">{children}</main>
      <Footer />
      <ChatWidget />
    </>
  );
}
