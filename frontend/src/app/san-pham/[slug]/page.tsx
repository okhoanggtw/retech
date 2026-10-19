"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { BatteryMedium, ShieldCheck, Truck, RotateCcw, Minus, Plus } from "lucide-react";
import { fetcher } from "@/lib/api";
import { vnd } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { conditionOf, type Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import GradeRing from "@/components/GradeRing";
import ProductCard from "@/components/ProductCard";
import BuyTogether from "@/components/BuyTogether";
import { Empty, Skeleton } from "@/components/ui";

const CAT_NAMES: Record<string, string> = { "dien-thoai": "Điện thoại", laptop: "Laptop", "may-anh": "Máy ảnh", "tai-nghe": "Tai nghe", "dong-ho": "Đồng hồ", "phu-kien": "Phụ kiện" };

export default function ProductDetail({ params }: { params: { slug: string } }) {
  const { data, error } = useSWR<{ product: Product; related: Product[]; addOns?: Product[] }>(`/api/products/${params.slug}`, fetcher);
  const { add } = useCart();
  const router = useRouter();
  const [qty, setQty] = useState(1);
  const [img, setImg] = useState(0);
  const [busy, setBusy] = useState(false);

  if (error) return <div className="mx-auto max-w-page px-4 py-20"><Empty title="Không tìm thấy sản phẩm này, có thể máy đã được bán." action="Xem máy khác" href="/san-pham" /></div>;
  if (!data) return <div className="mx-auto grid max-w-page gap-8 px-4 py-12 md:grid-cols-2 md:px-6"><Skeleton className="h-[480px]" /><Skeleton className="h-[480px]" /></div>;

  const p = data.product;
  const cond = conditionOf(p.condition);
  const save = p.originalPrice - p.price;
  const buy = async (now: boolean) => {
    setBusy(true);
    const ok = await add(p.id, qty);
    setBusy(false);
    if (ok && now) router.push("/gio-hang");
  };

  return (
    <>
      <div className="border-b border-black/5 bg-white/70">
        <div className="mx-auto flex max-w-page items-center gap-2 px-4 py-3 text-sm text-graphite md:px-6">
          <Link href="/san-pham" className="hover:text-ink">Sản phẩm</Link><span>/</span>
          <Link href={`/danh-muc/${p.category}`} className="hover:text-ink">{CAT_NAMES[p.category] ?? p.category}</Link><span>/</span>
          <span className="truncate text-ink">{p.name}</span>
        </div>
      </div>

      <section className="mx-auto grid max-w-page gap-10 px-4 py-10 md:grid-cols-[1.15fr_1fr] md:px-6 md:py-14">
        <div className="md:sticky md:top-20 md:self-start">
          <div className="grid aspect-square place-items-center rounded-xl3 bg-white p-8">
            <ProductImage p={p} index={img} className="h-full w-full" />
          </div>
          {p.images.length > 1 && (
            <div className="mt-3 flex gap-2">
              {p.images.map((_, i) => (
                <button key={i} onClick={() => setImg(i)} aria-label={`Ảnh ${i + 1}`}
                  className={`h-20 w-20 rounded-xl bg-white p-2 ${i === img ? "ring-2 ring-cobalt" : ""}`}><ProductImage p={p} index={i} className="h-full w-full" /></button>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="text-graphite">{p.brand}</p>
          <h1 className="mt-1 text-4xl font-bold tracking-tightest md:text-5xl">{p.name}</h1>
          {p.variant && <p className="mt-2 text-lg text-graphite">{p.variant}</p>}

          <div className="mt-6 flex items-center gap-4 rounded-xl2 bg-white p-4">
            <GradeRing condition={p.condition} size={56} />
            <div>
              <p className="font-semibold">Tình trạng: {cond?.label}</p>
              <p className="text-sm text-graphite">Đã kiểm định 30 bước · {p.releaseYear > 0 ? `Ra mắt ${p.releaseYear}` : "Máy chính hãng"}</p>
            </div>
          </div>

          <div className="mt-6">
            <p className="text-4xl font-extrabold tracking-tight">{vnd(p.price)}</p>
            {save > 0 && <p className="mt-1 text-graphite">Máy mới {vnd(p.originalPrice)} · <span className="font-semibold text-grade">rẻ hơn {vnd(save)}</span></p>}
          </div>

          <ul className="mt-6 grid grid-cols-2 gap-3 text-sm">
            {p.batteryHealth != null && <li className="flex items-center gap-2"><BatteryMedium size={18} className="text-grade" /> Pin {p.batteryHealth}%</li>}
            {p.warrantyMonths > 0 && <li className="flex items-center gap-2"><ShieldCheck size={18} className="text-cobalt" /> Bảo hành {p.warrantyMonths} tháng</li>}
            <li className="flex items-center gap-2"><RotateCcw size={18} className="text-cobalt" /> Đổi trả 7 ngày</li>
            <li className="flex items-center gap-2"><Truck size={18} className="text-cobalt" /> {p.freeShipping ? "Miễn phí giao hàng" : "Giao 2h nội thành"}</li>
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-full bg-white">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="icon-btn" aria-label="Giảm"><Minus size={16} /></button>
              <span className="w-8 text-center font-semibold tabular-nums" aria-live="polite">{qty}</span>
              <button onClick={() => setQty((q) => Math.min(p.stock, q + 1))} className="icon-btn" aria-label="Tăng"><Plus size={16} /></button>
            </div>
            <p className="text-sm text-graphite">{p.stock > 0 ? `Còn ${p.stock} máy` : "Hết hàng"}</p>
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <button disabled={busy || p.stock <= 0} onClick={() => buy(true)} className="btn-primary">Mua ngay</button>
            <button disabled={busy || p.stock <= 0} onClick={() => buy(false)} className="btn-ghost">Thêm vào giỏ</button>
          </div>

          {p.highlights.length > 0 && (
            <div className="mt-10">
              <h2 className="text-xl font-bold">Điểm nổi bật</h2>
              <ul className="mt-3 space-y-2 text-[15px]">
                {p.highlights.map((h) => <li key={h} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cobalt" />{h}</li>)}
              </ul>
            </div>
          )}

          <div className="mt-10">
            <h2 className="text-xl font-bold">Thông số</h2>
            <dl className="mt-3 divide-y divide-mist/70 rounded-xl2 bg-white px-5">
              {Object.entries(p.specs).map(([k, v]) => (
                <div key={k} className="grid grid-cols-[130px_1fr] gap-4 py-3 text-[15px]"><dt className="text-graphite">{k}</dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
          {p.description && <p className="mt-8 leading-relaxed text-graphite">{p.description}</p>}
        </div>
      </section>

      {!!data.addOns?.length && p.stock > 0 && <BuyTogether key={p.id} main={p} addOns={data.addOns} />}

      {data.related.length > 0 && (
        <section className="mx-auto max-w-page px-4 pb-20 md:px-6">
          <h2 className="text-3xl font-bold tracking-tightest">Có thể bạn cũng thích.</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">{data.related.slice(0, 4).map((r) => <ProductCard key={r.id} p={r} />)}</div>
        </section>
      )}
    </>
  );
}
