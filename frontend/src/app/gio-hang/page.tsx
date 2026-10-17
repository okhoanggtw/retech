"use client";
import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { vnd } from "@/lib/format";
import ProductImage from "@/components/ProductImage";
import GradeRing from "@/components/GradeRing";
import { Empty, PageTitle, Skeleton } from "@/components/ui";

export default function CartPage() {
  const { user, loading } = useAuth();
  const { cart, update } = useCart();

  if (!loading && !user) return <><PageTitle title="Giỏ hàng." /><div className="mx-auto max-w-page px-4 pb-20 md:px-6"><Empty title="Đăng nhập để xem giỏ hàng của bạn." action="Đăng nhập" href="/dang-nhap?next=/gio-hang" /></div></>;

  return (
    <>
      <PageTitle title="Giỏ hàng." sub={cart ? `${cart.totalQuantity} sản phẩm` : undefined} />
      <div className="mx-auto grid max-w-page gap-8 px-4 pb-20 md:grid-cols-[1fr_360px] md:px-6">
        <div className="space-y-3">
          {!cart ? <Skeleton className="h-40" /> : cart.items.length === 0 ? (
            <Empty title="Giỏ hàng đang trống." action="Tiếp tục mua sắm" href="/san-pham" />
          ) : cart.items.map(({ product: p, quantity, lineTotal, available }) => (
            <div key={p.id} className="flex gap-4 rounded-xl2 bg-white p-4 md:gap-6 md:p-5">
              <Link href={`/san-pham/${p.slug}`} className="h-24 w-28 shrink-0 md:h-28 md:w-36"><ProductImage p={p} className="h-full w-full" /></Link>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <Link href={`/san-pham/${p.slug}`} className="font-semibold hover:underline">{p.name}</Link>
                    <p className="text-sm text-graphite">{p.variant}</p>
                  </div>
                  <GradeRing condition={p.condition} size={36} />
                </div>
                {!available && <p className="mt-1 text-sm text-danger">Chỉ còn {p.stock} máy, vui lòng giảm số lượng</p>}
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full bg-paper">
                    <button onClick={() => update(p.id, quantity - 1)} className="icon-btn" aria-label="Giảm"><Minus size={15} /></button>
                    <span className="w-7 text-center text-sm font-semibold tabular-nums">{quantity}</span>
                    <button onClick={() => update(p.id, quantity + 1)} className="icon-btn" aria-label="Tăng"><Plus size={15} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold tabular-nums">{vnd(lineTotal)}</p>
                    <button onClick={() => update(p.id, 0)} className="icon-btn text-graphite" aria-label={`Xóa ${p.name}`}><Trash2 size={16} /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {cart && cart.items.length > 0 && (
          <aside className="h-fit rounded-xl2 bg-white p-6 md:sticky md:top-20">
            <div className="flex justify-between text-[15px]"><span className="text-graphite">Tạm tính</span><span className="font-semibold tabular-nums">{vnd(cart.subtotal)}</span></div>
            <p className="mt-2 text-sm text-graphite">Phí giao hàng và mã giảm giá được tính ở bước tiếp theo.</p>
            <Link href="/dat-hang" className="btn-primary mt-6 w-full">Tiến hành đặt hàng</Link>
          </aside>
        )}
      </div>
    </>
  );
}
