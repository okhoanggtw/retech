"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { LayoutDashboard, BarChart3, Package, ShoppingCart, Users, Image as ImageIcon, Menu as MenuIcon, Tag, HelpCircle, Recycle, Mail, Settings, LogOut, ExternalLink, X } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Spinner } from "@/components/ui";

const NAV = [
  ["/admin", "Tổng quan", LayoutDashboard], ["/admin/thong-ke", "Thống kê", BarChart3],
  ["/admin/san-pham", "Sản phẩm", Package], ["/admin/don-hang", "Đơn hàng", ShoppingCart],
  ["/admin/thu-mua", "Thu mua", Recycle], ["/admin/nguoi-dung", "Người dùng", Users],
  ["/admin/khuyen-mai", "Khuyến mãi (Sales)", Tag], ["/admin/banner", "Banner", ImageIcon],
  ["/admin/menu", "Menu", MenuIcon], ["/admin/faq", "Hỏi đáp", HelpCircle],
  ["/admin/lien-he", "Liên hệ", Mail], ["/admin/cai-dat", "Cài đặt cửa hàng", Settings],
] as const;

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isLogin = path === "/admin/dang-nhap";

  useEffect(() => {
    if (!loading && !isLogin && (!user || user.role !== "ADMIN")) router.replace("/admin/dang-nhap");
  }, [loading, user, isLogin, router]);
  useEffect(() => setOpen(false), [path]);

  if (isLogin) return <>{children}</>;
  if (loading || !user || user.role !== "ADMIN") return <div className="grid h-screen place-items-center"><Spinner /></div>;

  return (
    <div className="min-h-screen bg-paper md:grid md:grid-cols-[240px_1fr]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-[240px] bg-ink text-white/80 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex h-14 items-center justify-between px-5">
          <Link href="/admin" className="text-lg font-bold text-white">ReTech <span className="font-medium text-white/50">Admin</span></Link>
          <button className="md:hidden" onClick={() => setOpen(false)} aria-label="Đóng menu"><X size={18} /></button>
        </div>
        <nav className="space-y-0.5 px-3 text-sm">
          {NAV.map(([href, label, Icon]) => {
            const on = href === "/admin" ? path === href : path.startsWith(href);
            return <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-2.5 ${on ? "bg-white/10 text-white" : "hover:bg-white/5 hover:text-white"}`}><Icon size={17} />{label}</Link>;
          })}
        </nav>
        <div className="absolute inset-x-3 bottom-4 space-y-0.5 text-sm">
          <Link href="/" target="_blank" className="flex items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5"><ExternalLink size={17} />Xem website</Link>
          <button onClick={() => { logout(); router.push("/admin/dang-nhap"); }} className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 hover:bg-white/5"><LogOut size={17} />Đăng xuất</button>
        </div>
      </aside>
      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/5 bg-white/80 px-4 backdrop-blur md:px-8">
          <button className="icon-btn md:hidden" onClick={() => setOpen(true)} aria-label="Mở menu"><MenuIcon size={18} /></button>
          <p className="text-sm text-graphite">{NAV.find(([h]) => (h === "/admin" ? path === h : path.startsWith(h)))?.[1]}</p>
          <p className="text-sm font-medium">{user.fullName}</p>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
