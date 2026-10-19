"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Check } from "lucide-react";
import { vnd } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useToast } from "./Toast";
import type { Product } from "@/lib/types";
import ProductImage from "./ProductImage";

/** "Thường mua kèm": máy đang xem + các món đi kèm, tick chọn rồi thêm cả bộ vào giỏ */
export default function BuyTogether({ main, addOns }: { main: Product; addOns: Product[] }) {
  const { add } = useCart();
  const toast = useToast();
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>(addOns.map((a) => a.id));
  const [busy, setBusy] = useState(false);

  const chosen = addOns.filter((a) => picked.includes(a.id));
  const total = main.price + chosen.reduce((s, a) => s + a.price, 0);
  const toggle = (id: string) => setPicked((ps) => (ps.includes(id) ? ps.filter((x) => x !== id) : [...ps, id]));

  const addAll = async () => {
    setBusy(true);
    let n = 0;
    for (const id of [main.id, ...chosen.map((a) => a.id)]) {
      if (!(await add(id, 1, true))) break;
      n++;
    }
    setBusy(false);
    if (n === chosen.length + 1) { toast(`Đã thêm ${n} sản phẩm vào giỏ`, "success"); router.push("/gio-hang"); }
  };

  return (
    <section className="mx-auto max-w-page px-4 pb-14 md:px-6">
      <h2 className="text-3xl font-bold tracking-tightest">Thường mua kèm.</h2>
      <div className="mt-6 grid gap-6 rounded-xl3 bg-white p-5 md:p-6 lg:grid-cols-[1fr_280px]">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <li className="flex items-center gap-3 rounded-xl2 bg-paper p-3">
            <ProductImage p={main} className="h-16 w-16 shrink-0" />
            <div className="min-w-0 text-sm">
              <p className="text-graphite">Đang xem</p>
              <p className="line-clamp-1 font-semibold">{main.name}</p>
              <p className="font-bold tabular-nums">{vnd(main.price)}</p>
            </div>
          </li>
          {addOns.map((a) => {
            const on = picked.includes(a.id);
            return (
              <li key={a.id} className={`flex items-center gap-3 rounded-xl2 border p-3 transition-colors ${on ? "border-cobalt" : "border-mist"}`}>
                <button type="button" onClick={() => toggle(a.id)} aria-pressed={on} aria-label={`${on ? "Bỏ chọn" : "Chọn"} ${a.name}`}
                  className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border ${on ? "border-cobalt bg-cobalt text-white" : "border-mist"}`}>
                  {on ? <Check size={14} /> : <Plus size={14} />}
                </button>
                <ProductImage p={a} className="h-16 w-16 shrink-0" />
                <Link href={`/san-pham/${a.slug}`} className="min-w-0 text-sm hover:text-cobalt">
                  <p className="line-clamp-1 font-semibold">{a.name}</p>
                  {a.variant && <p className="line-clamp-1 text-graphite">{a.variant}</p>}
                  <p className="font-bold tabular-nums">{vnd(a.price)}</p>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="flex flex-col justify-center gap-3 lg:border-l lg:border-mist lg:pl-6">
          <p className="text-sm text-graphite">Tổng {chosen.length + 1} sản phẩm</p>
          <p className="text-3xl font-extrabold tabular-nums">{vnd(total)}</p>
          <button onClick={addAll} disabled={busy || main.stock <= 0} className="btn-primary">
            {chosen.length ? `Thêm cả ${chosen.length + 1} vào giỏ` : "Thêm vào giỏ"}
          </button>
        </div>
      </div>
    </section>
  );
}
