"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { MenuItem, SiteSettings } from "@/lib/types";

const SOCIAL_ICONS: Record<string, React.ReactNode> = {
  facebook: <path d="M14 8h3V4h-3c-2.8 0-4 1.8-4 4.3V10H7v4h3v7h4v-7h3l.5-4H14V8.6c0-.4.2-.6.6-.6Z" />,
  instagram: <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm5 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0 2a2 2 0 1 1 0 4 2 2 0 0 1 0-4Zm5-3.2a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Z" />,
  tiktok: <path d="M15 3c.4 2.4 1.8 3.8 4 4v3c-1.5 0-2.8-.4-4-1.2V15a6 6 0 1 1-6-6v3a3 3 0 1 0 3 3V3h3Z" />,
  youtube: <path d="M21.6 7.2a2.5 2.5 0 0 0-1.8-1.8C18.2 5 12 5 12 5s-6.2 0-7.8.4A2.5 2.5 0 0 0 2.4 7.2C2 8.8 2 12 2 12s0 3.2.4 4.8a2.5 2.5 0 0 0 1.8 1.8C5.8 19 12 19 12 19s6.2 0 7.8-.4a2.5 2.5 0 0 0 1.8-1.8c.4-1.6.4-4.8.4-4.8s0-3.2-.4-4.8ZM10 15V9l5.2 3L10 15Z" />,
  zalo: <path d="M4 4h16v12H9l-5 4V4Zm4 4v1.5h3.2L8 13.5V15h5.5v-1.5h-3.3L13.5 10V8H8Zm7 0v7h1.5V8H15Z" />,
};

export default function Footer() {
  const { data: menus } = useSWR<MenuItem[]>("/api/content/menus", fetcher);
  const { data: s } = useSWR<SiteSettings>("/api/content/settings", fetcher);
  const groups = new Map<string, MenuItem[]>();
  (menus ?? []).filter((m) => m.position === "FOOTER").forEach((m) => {
    const g = m.groupName || "Khác";
    groups.set(g, [...(groups.get(g) ?? []), m]);
  });

  return (
    <footer className="bg-paper text-[13px] text-graphite">
      <div className="mx-auto max-w-page px-4 py-12 md:px-6">
        <div className="grid gap-10 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <p className="text-base font-bold text-ink">{s?.storeName ?? "ReTech"}</p>
            <p className="mt-2 max-w-xs leading-relaxed">{s?.slogan ?? "Công nghệ đã qua sử dụng. Chất lượng như mới."}</p>
            <ul className="mt-4 space-y-1">
              {s?.hotline && <li>Hotline: <a className="text-ink hover:underline" href={`tel:${s.hotline.replace(/\s/g, "")}`}>{s.hotline}</a></li>}
              {s?.email && <li>Email: <a className="text-ink hover:underline" href={`mailto:${s.email}`}>{s.email}</a></li>}
              {s?.address && <li>{s.address}</li>}
              {s?.workingHours && <li>Mở cửa {s.workingHours}</li>}
            </ul>
          </div>
          {[...groups.entries()].map(([g, items]) => (
            <div key={g}>
              <p className="font-semibold text-ink">{g}</p>
              <ul className="mt-3 space-y-2">
                {items.map((m) => <li key={m.href}><Link href={m.href} className="hover:text-ink hover:underline">{m.label}</Link></li>)}
              </ul>
            </div>
          ))}
          <div>
            <p className="font-semibold text-ink">Kết nối với ReTech</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(s?.socials ?? {}).map(([k, url]) => (
                <a key={k} href={url} target="_blank" rel="noreferrer" aria-label={k}
                  className="grid h-9 w-9 place-items-center rounded-full bg-white text-ink transition-colors hover:bg-ink hover:text-white">
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden>{SOCIAL_ICONS[k]}</svg>
                </a>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 flex flex-col justify-between gap-2 border-t border-mist pt-5 md:flex-row">
          <p>© {new Date().getFullYear()} ReTech. Đồ án môn Phát triển hệ thống TMĐT – PTIT.</p>
          <p>Thanh toán an toàn qua PayOS · VietQR</p>
        </div>
      </div>
    </footer>
  );
}
