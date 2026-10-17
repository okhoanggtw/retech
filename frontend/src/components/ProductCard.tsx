import Link from "next/link";
import ProductImage from "./ProductImage";
import GradeRing from "./GradeRing";
import { vnd } from "@/lib/format";
import type { Product } from "@/lib/types";

export default function ProductCard({ p }: { p: Product }) {
  const off = p.originalPrice > p.price ? Math.round((100 * (p.originalPrice - p.price)) / p.originalPrice) : 0;
  return (
    <Link href={`/san-pham/${p.slug}`} className="group flex flex-col rounded-xl2 bg-white p-5 transition-shadow hover:shadow-[0_12px_40px_-12px_rgba(29,29,31,0.18)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-cobalt">
      <div className="relative aspect-[4/3] overflow-hidden">
        <ProductImage p={p} className="h-full w-full transition-transform duration-500 group-hover:scale-[1.04]" />
        {p.stock <= 0 && <span className="absolute left-0 top-0 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">Hết hàng</span>}
      </div>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-graphite">{p.brand}</p>
          <h3 className="mt-0.5 line-clamp-2 font-semibold leading-snug text-ink">{p.name}</h3>
          {p.variant && <p className="mt-0.5 line-clamp-1 text-sm text-graphite">{p.variant}</p>}
        </div>
        <GradeRing condition={p.condition} size={40} />
      </div>
      <div className="mt-auto pt-4">
        <p className="text-lg font-bold text-ink">{vnd(p.price)}</p>
        {off > 0 && (
          <p className="text-sm text-graphite">
            <span className="line-through">{vnd(p.originalPrice)}</span>
            <span className="ml-2 font-medium text-grade">Tiết kiệm {off}%</span>
          </p>
        )}
      </div>
    </Link>
  );
}
