"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { Search, ShoppingBag, User as UserIcon, Menu, X, LogOut, LayoutDashboard, Package, ArrowRight } from "lucide-react";
import { fetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { vnd } from "@/lib/format";
import type { MenuItem, Page, Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import GradeRing from "@/components/GradeRing";

const FALLBACK: MenuItem[] = [
  { label: "Điện thoại", href: "/danh-muc/dien-thoai", position: "HEADER", sortOrder: 1, active: true },
  { label: "Laptop", href: "/danh-muc/laptop", position: "HEADER", sortOrder: 2, active: true },
  { label: "Máy ảnh", href: "/danh-muc/may-anh", position: "HEADER", sortOrder: 3, active: true },
  { label: "Tai nghe", href: "/danh-muc/tai-nghe", position: "HEADER", sortOrder: 4, active: true },
  { label: "Đồng hồ", href: "/danh-muc/dong-ho", position: "HEADER", sortOrder: 5, active: true },
  { label: "Thu cũ", href: "/thu-cu", position: "HEADER", sortOrder: 6, active: true },
];

export default function Header() {
  const { data } = useSWR<MenuItem[]>("/api/content/menus", fetcher);
  const menus = (data ?? FALLBACK).filter((m) => m.position === "HEADER");
  const { user, logout } = useAuth();
  const { count } = useCart();
  const path = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [q, setQ] = useState("");
  const [userMenu, setUserMenu] = useState(false);

  const queryTrimmed = q.trim();
  const { data: searchResults, isLoading: searchLoading } = useSWR<Page<Product>>(
    searching && queryTrimmed ? `/api/products?q=${encodeURIComponent(queryTrimmed)}&size=6` : null,
    fetcher,
    { keepPreviousData: true }
  );

  useEffect(() => { setOpen(false); setSearching(false); setUserMenu(false); }, [path]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSearching(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) {
      router.push(`/san-pham?q=${encodeURIComponent(q.trim())}`);
      setSearching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-white/75 backdrop-blur-xl backdrop-saturate-150">
      <nav className="mx-auto flex h-12 max-w-page items-center justify-between px-4 text-[13px] md:px-6" aria-label="Chính">
        <Link href="/" className="flex items-center gap-1.5 text-[17px] font-bold tracking-tight text-ink">
          <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="M4 12a8 8 0 0 1 13.7-5.6L20 4v6h-6l2.3-2.3A6 6 0 1 0 18 12h2a8 8 0 0 1-16 0Z" fill="#2F4BFF" /></svg>
          ReTech
        </Link>
        <ul className="hidden items-center gap-7 md:flex">
          {menus.map((m) => (
            <li key={m.href}>
              <Link href={m.href} className={`text-ink/80 transition-colors hover:text-ink ${path.startsWith(m.href) ? "text-ink font-medium" : ""}`}>{m.label}</Link>
            </li>
          ))}
        </ul>
        <div className="flex items-center gap-1">
          <button onClick={() => setSearching((s) => !s)} className="icon-btn" aria-label="Tìm kiếm"><Search size={17} /></button>
          <Link href="/gio-hang" className="icon-btn relative" aria-label={`Giỏ hàng (${count})`}>
            <ShoppingBag size={17} />
            {count > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-cobalt px-1 text-[10px] font-bold text-white">{count}</span>}
          </Link>
          <div className="relative">
            {user ? (
              <button onClick={() => setUserMenu((s) => !s)} className="icon-btn" aria-label="Tài khoản" aria-expanded={userMenu}>
                <span className="grid h-6 w-6 place-items-center rounded-full bg-ink text-[11px] font-semibold text-white">{user.fullName.trim().split(" ").pop()?.[0]}</span>
              </button>
            ) : (
              <Link href="/dang-nhap" className="icon-btn" aria-label="Đăng nhập"><UserIcon size={17} /></Link>
            )}
            {userMenu && user && (
              <div className="absolute right-0 top-10 w-56 rounded-xl2 border border-black/5 bg-white p-2 text-sm shadow-xl">
                <p className="px-3 py-2 text-graphite">Xin chào, <b className="text-ink">{user.fullName}</b></p>
                <Link href="/tai-khoan" className="menu-item"><Package size={16} /> Đơn hàng của tôi</Link>
                {user.role === "ADMIN" && <Link href="/admin" className="menu-item"><LayoutDashboard size={16} /> Trang quản trị</Link>}
                <button onClick={() => { logout(); router.push("/"); }} className="menu-item w-full"><LogOut size={16} /> Đăng xuất</button>
              </div>
            )}
          </div>
          <button onClick={() => setOpen((o) => !o)} className="icon-btn md:hidden" aria-label="Menu" aria-expanded={open}>{open ? <X size={18} /> : <Menu size={18} />}</button>
        </div>
      </nav>

      {/* Thanh tìm kiếm thông minh */}
      {searching && (
        <div className="border-t border-black/5 bg-white shadow-2xl transition-all">
          <form onSubmit={submit} className="mx-auto flex max-w-page items-center gap-3 px-4 py-3.5 md:px-6">
            <Search size={20} className="text-cobalt shrink-0" />
            <input
              autoFocus
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Tìm iPhone 16, MacBook, tai nghe..."
              className="w-full bg-transparent text-lg md:text-xl font-medium outline-none placeholder:text-mist"
              aria-label="Từ khóa tìm kiếm"
            />
            {q && (
              <button
                type="button"
                onClick={() => setQ("")}
                className="icon-btn text-graphite hover:text-ink shrink-0"
                aria-label="Xóa từ khóa"
              >
                <X size={16} />
              </button>
            )}
            <button
              type="button"
              onClick={() => setSearching(false)}
              className="rounded-lg px-2.5 py-1 text-xs font-semibold text-graphite hover:bg-paper hover:text-ink shrink-0"
            >
              Đóng (ESC)
            </button>
          </form>

          {/* Gợi ý tìm kiếm tức thì khi gõ */}
          {queryTrimmed && (
            <div className="border-t border-mist/80 bg-paper/60 px-4 py-4 md:px-6">
              <div className="mx-auto max-w-page space-y-4">
                {/* Gợi ý từ khóa nhanh */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-medium text-graphite">Từ khóa gợi ý:</span>
                  {(queryTrimmed.toLowerCase().startsWith("i")
                    ? ["iPhone 16 Pro Max", "iPhone 15 Pro", "iPhone 14", "iPad Pro", "Apple Watch"]
                    : ["iPhone", "MacBook Air", "Sony A7", "AirPods", "Galaxy S24"]
                  ).map((sug) => (
                    <button
                      type="button"
                      key={sug}
                      onClick={() => {
                        setQ(sug);
                        router.push(`/san-pham?q=${encodeURIComponent(sug)}`);
                        setSearching(false);
                      }}
                      className="rounded-full bg-white px-3 py-1 text-xs font-medium text-ink shadow-sm transition hover:bg-cobalt hover:text-white"
                    >
                      {sug}
                    </button>
                  ))}
                </div>

                {/* Danh sách sản phẩm tương ứng */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold text-graphite">
                    <span>SẢN PHẨM PHÙ HỢP NHẤT</span>
                    {searchResults && <span>{searchResults.totalElements} sản phẩm</span>}
                  </div>

                  {searchLoading && !searchResults ? (
                    <div className="py-6 text-center text-sm text-graphite">
                      Đang tìm kiếm sản phẩm...
                    </div>
                  ) : searchResults && searchResults.content.length > 0 ? (
                    <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3">
                      {searchResults.content.map((p) => (
                        <Link
                          key={p.id}
                          href={`/san-pham/${p.slug}`}
                          onClick={() => setSearching(false)}
                          className="group flex items-center gap-3 rounded-xl bg-white p-2.5 transition hover:shadow-md hover:ring-2 hover:ring-cobalt/40"
                        >
                          <div className="h-12 w-14 shrink-0 overflow-hidden rounded-lg bg-paper">
                            <ProductImage p={p} className="h-full w-full object-contain" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-ink group-hover:text-cobalt">
                              {p.name}
                            </p>
                            <p className="text-xs text-graphite truncate">{p.variant}</p>
                            <div className="mt-1 flex items-center justify-between">
                              <span className="text-xs font-bold text-cobalt tabular-nums">{vnd(p.price)}</span>
                              <GradeRing condition={p.condition} size={22} />
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="py-4 text-center text-sm text-graphite">
                      Không tìm thấy sản phẩm nào khớp với "{q}".
                    </div>
                  )}
                </div>

                {/* Nút xem toàn bộ kết quả */}
                {searchResults && searchResults.totalElements > 0 && (
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        router.push(`/san-pham?q=${encodeURIComponent(queryTrimmed)}`);
                        setSearching(false);
                      }}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-cobalt hover:underline"
                    >
                      Xem tất cả {searchResults.totalElements} kết quả cho "{queryTrimmed}" <ArrowRight size={14} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {open && (
        <ul className="border-t border-black/5 bg-white px-4 py-3 md:hidden">
          {menus.map((m) => (
            <li key={m.href}><Link href={m.href} className="block py-3 text-lg font-semibold">{m.label}</Link></li>
          ))}
        </ul>
      )}
    </header>
  );
}
