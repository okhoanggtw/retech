"use client";
import Link from "next/link";
import useSWR from "swr";
import { fetcher, imgUrl } from "@/lib/api";
import { vnd } from "@/lib/format";
import type { Banner, Category, Product, Promotion } from "@/lib/types";
import DeviceArt from "../DeviceArt";
import ProductCard from "../ProductCard";
import { Skeleton } from "../ui";

export function Banners() {
  const { data } = useSWR<Banner[]>("/api/content/banners", fetcher);
  if (!data) return <div className="mx-auto max-w-page px-4 py-6 md:px-6"><Skeleton className="h-[420px]" /></div>;
  const [first, ...rest] = data;
  if (!first) return null;
  const Tile = ({ b, big }: { b: Banner; big?: boolean }) => {
    const dark = b.theme === "dark";
    return (
      <Link href={b.link || "/san-pham"} className={`group relative flex flex-col items-center overflow-hidden rounded-xl3 px-6 pt-12 text-center ${dark ? "bg-black text-white" : "bg-white text-ink"} ${big ? "min-h-[460px] md:col-span-2" : "min-h-[400px]"}`}>
        <h2 className={`font-bold tracking-tightest ${big ? "text-4xl md:text-6xl" : "text-3xl md:text-4xl"}`}>{b.title}</h2>
        {b.subtitle && <p className={`mt-3 max-w-xl text-lg ${dark ? "text-white/70" : "text-graphite"}`}>{b.subtitle}</p>}
        {b.ctaText && <span className="mt-5 inline-flex rounded-full bg-cobalt px-5 py-2 text-sm font-semibold text-white">{b.ctaText}</span>}
        <div className="mt-auto w-full max-w-md translate-y-6 transition-transform duration-700 group-hover:translate-y-2">
          {b.image
            // eslint-disable-next-line @next/next/no-img-element
            ? <img src={imgUrl(b.image)} alt="" className="mx-auto max-h-56 object-contain" />
            : <DeviceArt category={/thu-cu/.test(b.link ?? "") ? "dien-thoai" : /laptop|macbook/i.test(b.link + b.title) ? "laptop" : "dien-thoai"}
                variant={b.title} className="mx-auto h-56" />}
        </div>
      </Link>
    );
  };
  return (
    <section className="mx-auto grid max-w-page gap-3 px-3 py-3 md:grid-cols-2 md:px-6">
      <Tile b={first} big />
      {rest.map((b) => <Tile key={b.id} b={b} />)}
    </section>
  );
}

export function Categories() {
  const { data } = useSWR<Category[]>("/api/categories", fetcher);
  return (
    <section className="mx-auto max-w-page px-4 py-16 md:px-6">
      <h2 className="text-3xl font-bold tracking-tightest md:text-5xl">Chọn theo loại máy.</h2>
      <div className="mt-8 flex snap-x gap-4 overflow-x-auto pb-2 [scrollbar-width:none] md:grid md:grid-cols-5 md:overflow-visible">
        {(data ?? []).map((c) => (
          <Link key={c.slug} href={`/danh-muc/${c.slug}`} className="group w-[180px] shrink-0 snap-start text-center md:w-auto">
            <div className="rounded-xl2 bg-white p-4 transition-colors group-hover:bg-white/60">
              <DeviceArt category={c.slug} name={c.name} variant="Bạc" className="h-28 w-full transition-transform duration-500 group-hover:-translate-y-1" />
            </div>
            <p className="mt-3 font-semibold">{c.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function Featured() {
  const { data } = useSWR<Product[]>("/api/products/featured", fetcher);
  return (
    <section className="mx-auto max-w-page px-4 pb-16 md:px-6">
      <div className="flex items-end justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tightest md:text-5xl">Đáng mua nhất tuần này.</h2>
        <Link href="/san-pham" className="link hidden shrink-0 text-[15px] md:inline">Xem tất cả sản phẩm</Link>
      </div>
      <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {data ? data.slice(0, 8).map((p) => <ProductCard key={p.id} p={p} />)
          : Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
      </div>
    </section>
  );
}

export function TradeInTeaser() {
  return (
    <section className="bg-white">
      <div className="mx-auto grid max-w-page items-center gap-10 px-4 py-20 md:grid-cols-2 md:px-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tightest md:text-6xl">Máy cũ của bạn đáng giá bao nhiêu?</h2>
          <p className="mt-4 max-w-md text-lg text-graphite">
            Chọn model, tình trạng và pin. AI của ReTech so với giá các máy đang bán và đưa ra mức thu mua trong khoảng 10 giây.
          </p>
          <Link href="/thu-cu" className="btn-primary mt-8">Định giá máy của tôi</Link>
        </div>
        <div className="rounded-xl3 bg-paper p-6 md:p-8">
          <p className="text-sm text-graphite">Ví dụ: iPhone 14 Pro Max 256GB · mua 2022 · tốt 90% · pin 84%</p>
          <p className="mt-6 text-sm text-graphite">ReTech thu mua</p>
          <p className="text-5xl font-extrabold tracking-tightest">10,6 – 11,7 tr</p>
          <div className="mt-6 space-y-2 text-[15px]">
            {[["Tuổi máy 4 năm", "−62%"], ["Ngoại hình tốt 90%", "−15%"], ["Pin 84%", "−7%"], ["Đủ hộp, sạc", "+3%"]].map(([k, v]) => (
              <div key={k} className="flex justify-between border-b border-mist/70 pb-2"><span>{k}</span><span className="font-semibold tabular-nums">{v}</span></div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export function Promotions() {
  const { data } = useSWR<Promotion[]>("/api/content/promotions", fetcher);
  if (!data?.length) return null;
  return (
    <section className="mx-auto max-w-page px-4 py-16 md:px-6">
      <h2 className="text-3xl font-bold tracking-tightest md:text-5xl">Mã giảm giá đang chạy.</h2>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {data.map((p) => (
          <div key={p.code} className="flex flex-col rounded-xl2 border-2 border-dashed border-cobalt/30 bg-white p-6">
            <p className="text-2xl font-extrabold tracking-tight text-cobalt">{p.code}</p>
            <p className="mt-2 font-semibold">{p.name}</p>
            <p className="mt-1 text-sm text-graphite">{p.description} {p.minOrderValue > 0 && `· Đơn từ ${vnd(p.minOrderValue)}`}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function Pledges() {
  const items = [
    ["Bảo hành 12 tháng", "Máy ảnh 6 tháng. Lỗi phần cứng trong 30 ngày đầu được đổi máy khác."],
    ["Đổi trả trong 7 ngày", "Không ưng thì trả lại, chỉ cần máy còn nguyên như lúc nhận."],
    ["Giao 2 giờ nội thành", "Miễn phí giao cho đơn từ 2 triệu, toàn quốc 2–4 ngày."],
    ["Quét QR là xong", "Chuyển khoản qua PayOS, đơn được xác nhận tự động khi tiền về."],
  ];
  return (
    <section className="mx-auto max-w-page px-4 pb-20 md:px-6">
      <div className="grid gap-x-8 gap-y-6 border-t border-mist pt-10 md:grid-cols-4">
        {items.map(([t, d]) => (
          <div key={t}>
            <p className="text-lg font-semibold">{t}</p>
            <p className="mt-1 text-[15px] leading-relaxed text-graphite">{d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
