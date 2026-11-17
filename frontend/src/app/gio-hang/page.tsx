"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  const router = useRouter();
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    if (cart && cart.items.length > 0) {
      // Mac dinh chon tat ca san pham con hang
      setSelectedIds((prev) => {
        if (prev.length === 0) {
          return cart.items.filter((i) => i.available).map((i) => i.product.id);
        }
        // Giu lai cac id van con trong gio
        return prev.filter((id) => cart.items.some((i) => i.product.id === id));
      });
    }
  }, [cart]);

  if (!loading && !user) return <><PageTitle title="Giỏ hàng." /><div className="mx-auto max-w-page px-4 pb-20 md:px-6"><Empty title="Đăng nhập để xem giỏ hàng của bạn." action="Đăng nhập" href="/dang-nhap?next=/gio-hang" /></div></>;

  const availableItems = cart?.items.filter((i) => i.available) || [];
  const allSelected = availableItems.length > 0 && availableItems.every((i) => selectedIds.includes(i.product.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds([]);
    } else {
      setSelectedIds(availableItems.map((i) => i.product.id));
    }
  };

  const toggleItem = (productId: string) => {
    setSelectedIds((prev) =>
      prev.includes(productId) ? prev.filter((id) => id !== productId) : [...prev, productId]
    );
  };

  const selectedItems = cart?.items.filter((i) => selectedIds.includes(i.product.id)) || [];
  const selectedSubtotal = selectedItems.reduce((sum, i) => sum + (i.available ? i.lineTotal : 0), 0);
  const selectedQuantity = selectedItems.reduce((sum, i) => sum + (i.available ? i.quantity : 0), 0);

  const handleCheckout = () => {
    if (selectedIds.length === 0) return;
    if (typeof window !== "undefined") {
      sessionStorage.setItem("retech_selected_items", JSON.stringify(selectedIds));
    }
    router.push(`/dat-hang?items=${selectedIds.join(",")}`);
  };

  return (
    <>
      <PageTitle title="Giỏ hàng." sub={cart ? `${cart.totalQuantity} sản phẩm` : undefined} />
      <div className="mx-auto grid max-w-page gap-8 px-4 pb-20 md:grid-cols-[1fr_360px] md:px-6">
        <div className="space-y-3">
          {!cart ? <Skeleton className="h-40" /> : cart.items.length === 0 ? (
            <Empty title="Giỏ hàng đang trống." action="Tiếp tục mua sắm" href="/san-pham" />
          ) : (
            <>
              <div className="flex items-center justify-between rounded-xl2 bg-white px-5 py-3.5">
                <label className="flex items-center gap-3 cursor-pointer select-none font-medium text-sm">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={toggleAll}
                    className="h-4 w-4 rounded border-mist text-cobalt focus:ring-cobalt cursor-pointer"
                  />
                  <span>Chọn tất cả ({cart.items.length} sản phẩm)</span>
                </label>
                {selectedQuantity > 0 && (
                  <span className="text-xs text-graphite font-medium">
                    Đã chọn {selectedQuantity} sản phẩm
                  </span>
                )}
              </div>

              {cart.items.map(({ product: p, quantity, lineTotal, available }) => (
                <div key={p.id} className="flex items-center gap-3 rounded-xl2 bg-white p-4 md:gap-5 md:p-5">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(p.id)}
                    disabled={!available}
                    onChange={() => toggleItem(p.id)}
                    className="h-5 w-5 shrink-0 rounded border-mist text-cobalt focus:ring-cobalt cursor-pointer disabled:opacity-30"
                    aria-label={`Chọn ${p.name}`}
                  />
                  <Link href={`/san-pham/${p.slug}`} className="h-24 w-28 shrink-0 md:h-28 md:w-36">
                    <ProductImage p={p} className="h-full w-full" />
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col self-stretch">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link href={`/san-pham/${p.slug}`} className="font-semibold hover:underline line-clamp-1">{p.name}</Link>
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
            </>
          )}
        </div>
        {cart && cart.items.length > 0 && (
          <aside className="h-fit rounded-xl2 bg-white p-6 md:sticky md:top-20">
            <div className="flex justify-between text-[15px]">
              <span className="text-graphite">Tạm tính ({selectedQuantity} sản phẩm)</span>
              <span className="font-semibold tabular-nums">{vnd(selectedSubtotal)}</span>
            </div>
            <p className="mt-2 text-sm text-graphite">Phí giao hàng và mã giảm giá được tính ở bước tiếp theo.</p>
            <button
              onClick={handleCheckout}
              disabled={selectedQuantity === 0}
              className="btn-primary mt-6 w-full disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {selectedQuantity > 0 ? `Tiến hành đặt hàng (${selectedQuantity})` : "Chọn sản phẩm để đặt hàng"}
            </button>
          </aside>
        )}
      </div>
    </>
  );
}
