"use client";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { SlidersHorizontal } from "lucide-react";
import { fetcher } from "@/lib/api";
import { CONDITIONS, type BrandInfo, type Page, type Product } from "@/lib/types";
import ProductCard from "./ProductCard";
import { Empty, Skeleton } from "./ui";

const PRICES = [
  { label: "Dưới 5 triệu", min: "", max: "5000000" },
  { label: "5 – 10 triệu", min: "5000000", max: "10000000" },
  { label: "10 – 20 triệu", min: "10000000", max: "20000000" },
  { label: "Trên 20 triệu", min: "20000000", max: "" },
];
const SORTS = [
  { v: "newest", l: "Mới nhất" }, { v: "bestseller", l: "Bán chạy" },
  { v: "price_asc", l: "Giá thấp → cao" }, { v: "price_desc", l: "Giá cao → thấp" },
];

export default function ProductBrowser({ category }: { category?: string }) {
  const sp = useSearchParams();
  const router = useRouter();
  const q = sp.get("q") ?? "";
  const brand = sp.get("brand") ?? "";
  const condition = sp.get("condition") ?? "";
  const minPrice = sp.get("minPrice") ?? "";
  const maxPrice = sp.get("maxPrice") ?? "";
  const sort = sp.get("sort") ?? "newest";
  const page = Number(sp.get("page") ?? 0);

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (category) params.set("category", category);
  if (brand) params.set("brand", brand);
  if (condition) params.set("condition", condition);
  if (minPrice) params.set("minPrice", minPrice);
  if (maxPrice) params.set("maxPrice", maxPrice);
  params.set("sort", sort); params.set("page", String(page)); params.set("size", "12");

  const { data, isLoading } = useSWR<Page<Product>>(`/api/products?${params}`, fetcher, { keepPreviousData: true });
  const { data: brands } = useSWR<BrandInfo[]>(`/api/brands${category ? `?category=${category}` : ""}`, fetcher);

  const set = (patch: Record<string, string>) => {
    const n = new URLSearchParams(sp.toString());
    Object.entries(patch).forEach(([k, v]) => (v ? n.set(k, v) : n.delete(k)));
    if (!("page" in patch)) n.delete("page");
    router.replace(`?${n}`, { scroll: false });
  };
  const toggleList = (key: string, current: string, v: string) => {
    const list = current ? current.split(",") : [];
    set({ [key]: (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]).join(",") });
  };

  return (
    <div className="mx-auto max-w-page px-4 pb-20 md:px-6">
      <div className="flex flex-col gap-4 border-b border-mist pb-6">
        <div className="flex flex-wrap items-center gap-2">
          <SlidersHorizontal size={16} className="mr-1 text-graphite" aria-hidden />
          {(brands ?? []).map((b) => (
            <button key={b.name} onClick={() => toggleList("brand", brand, b.name)}
              className={`chip ${brand.split(",").includes(b.name) ? "chip-on" : ""}`} aria-pressed={brand.split(",").includes(b.name)}>
              {b.name} <span className="opacity-50">{b.productCount}</span>
            </button>
          ))}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {PRICES.map((p) => {
            const on = minPrice === p.min && maxPrice === p.max;
            return <button key={p.label} onClick={() => set(on ? { minPrice: "", maxPrice: "" } : { minPrice: p.min, maxPrice: p.max })} className={`chip ${on ? "chip-on" : ""}`} aria-pressed={on}>{p.label}</button>;
          })}
          <span className="mx-1 hidden h-5 w-px bg-mist md:block" />
          {CONDITIONS.slice(0, 4).map((c) => {
            const on = condition.split(",").includes(c.value);
            return <button key={c.value} onClick={() => toggleList("condition", condition, c.value)} className={`chip ${on ? "chip-on" : ""}`} aria-pressed={on}>{c.label}</button>;
          })}
        </div>
      </div>

      <div className="flex items-center justify-between py-5 text-sm">
        <p className="text-graphite">
          {q && <>Kết quả cho “<b className="text-ink">{q}</b>” · </>}
          {data ? `${data.totalElements} sản phẩm` : "Đang tải…"}
        </p>
        <select value={sort} onChange={(e) => set({ sort: e.target.value })} className="rounded-full border border-mist bg-white px-4 py-2" aria-label="Sắp xếp">
          {SORTS.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
        </select>
      </div>

      {isLoading && !data ? (
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-80" />)}</div>
      ) : data && data.content.length > 0 ? (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{data.content.map((p) => <ProductCard key={p.id} p={p} />)}</div>
          {data.totalPages > 1 && (
            <nav className="mt-10 flex justify-center gap-2" aria-label="Phân trang">
              {Array.from({ length: data.totalPages }).map((_, i) => (
                <button key={i} onClick={() => { set({ page: String(i) }); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  className={`h-10 w-10 rounded-full text-sm font-medium ${i === page ? "bg-ink text-white" : "bg-white hover:bg-black/5"}`} aria-current={i === page}>{i + 1}</button>
              ))}
            </nav>
          )}
        </>
      ) : (
        <Empty title="Chưa có máy nào khớp bộ lọc này. Thử bỏ bớt điều kiện hoặc hỏi ReTech AI." action="Xem tất cả sản phẩm" href="/san-pham" />
      )}
    </div>
  );
}
