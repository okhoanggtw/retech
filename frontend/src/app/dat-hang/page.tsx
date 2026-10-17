"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { QrCode, Banknote } from "lucide-react";
import { api, ApiError } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { vnd } from "@/lib/format";
import type { Order, Quote } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import { Empty, Field, PageTitle, Spinner } from "@/components/ui";

export default function CheckoutPage() {
  const { user, loading } = useAuth();
  const { cart, mutate } = useCart();
  const router = useRouter();
  const [ship, setShip] = useState({ fullName: "", phone: "", email: "", address: "", note: "" });
  const [method, setMethod] = useState<"PAYOS" | "COD">("PAYOS");
  const [code, setCode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [err, setErr] = useState<Record<string, string>>({});
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (user) setShip((s) => ({ ...s, fullName: s.fullName || user.fullName, phone: s.phone || user.phone || "", email: s.email || user.email, address: s.address || user.address || "" }));
  }, [user]);
  useEffect(() => { if (user) api<Quote>("/api/orders/quote", { method: "POST", json: {} }).then(setQuote).catch(() => {}); }, [user, cart?.subtotal]);
  useEffect(() => { if (!loading && !user) router.replace("/dang-nhap?next=/dat-hang"); }, [loading, user, router]);

  const applyCode = async () => setQuote(await api<Quote>("/api/orders/quote", { method: "POST", json: { promotionCode: code } }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true); setErr({}); setMsg("");
    try {
      const o = await api<Order>("/api/orders", { method: "POST", json: { shipping: ship, paymentMethod: method, promotionCode: quote?.promotionCode || null } });
      mutate();
      if (o.paymentMethod === "PAYOS" && o.checkoutUrl) window.location.href = o.checkoutUrl;
      else router.push(`/checkout/result?orderCode=${o.orderCode}`);
    } catch (e) {
      const a = e as ApiError;
      setMsg(a.message);
      const d: Record<string, string> = {};
      Object.entries(a.details ?? {}).forEach(([k, v]) => (d[k.replace("shipping.", "")] = v));
      setErr(d);
      setBusy(false);
    }
  };
  const bind = (k: keyof typeof ship) => ({ value: ship[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setShip({ ...ship, [k]: e.target.value }) });

  if (cart && cart.items.length === 0) return <><PageTitle title="Xác nhận đặt hàng." /><div className="mx-auto max-w-page px-4 pb-20 md:px-6"><Empty title="Giỏ hàng trống, chưa có gì để đặt." action="Chọn sản phẩm" href="/san-pham" /></div></>;

  return (
    <>
      <PageTitle title="Xác nhận đặt hàng." sub="Kiểm tra thông tin nhận hàng và chọn cách thanh toán." />
      <form onSubmit={submit} className="mx-auto grid max-w-page gap-8 px-4 pb-20 md:grid-cols-[1fr_400px] md:px-6">
        <div className="space-y-6">
          <section className="card space-y-4">
            <h2 className="text-xl font-bold">Thông tin nhận hàng</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Họ tên người nhận" error={err.fullName}><input className="input" required {...bind("fullName")} /></Field>
              <Field label="Số điện thoại" error={err.phone}><input className="input" type="tel" required {...bind("phone")} /></Field>
            </div>
            <Field label="Email nhận hóa đơn" error={err.email}><input className="input" type="email" {...bind("email")} /></Field>
            <Field label="Địa chỉ giao hàng" error={err.address}><input className="input" required placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành" {...bind("address")} /></Field>
            <Field label="Ghi chú"><textarea className="input min-h-20" placeholder="Ví dụ: giao giờ hành chính" {...bind("note")} /></Field>
          </section>

          <section className="card">
            <h2 className="text-xl font-bold">Hình thức thanh toán</h2>
            <div className="mt-4 grid gap-3 md:grid-cols-2" role="radiogroup">
              {([
                ["PAYOS", <QrCode key="q" size={22} />, "Chuyển khoản QR (PayOS)", "Quét mã bằng app ngân hàng bất kỳ, xác nhận tự động"],
                ["COD", <Banknote key="b" size={22} />, "Thanh toán khi nhận hàng", "Trả tiền mặt cho nhân viên giao hàng"],
              ] as const).map(([v, icon, t, d]) => (
                <button type="button" key={v} role="radio" aria-checked={method === v} onClick={() => setMethod(v)}
                  className={`rounded-xl2 border-2 p-4 text-left transition-colors ${method === v ? "border-cobalt bg-cobalt-soft/40" : "border-mist hover:border-ink/30"}`}>
                  <span className={method === v ? "text-cobalt" : "text-graphite"}>{icon}</span>
                  <p className="mt-2 font-semibold">{t}</p>
                  <p className="text-sm text-graphite">{d}</p>
                </button>
              ))}
            </div>
          </section>
        </div>

        <aside className="h-fit space-y-4 rounded-xl2 bg-white p-6 md:sticky md:top-20">
          <h2 className="text-xl font-bold">Đơn hàng</h2>
          <ul className="space-y-3">
            {cart?.items.map(({ product: p, quantity, lineTotal }) => (
              <li key={p.id} className="flex items-center gap-3">
                <ProductImage p={p} className="h-14 w-16 shrink-0" />
                <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{p.name}</p><p className="text-xs text-graphite">x{quantity}</p></div>
                <p className="text-sm font-semibold tabular-nums">{vnd(lineTotal)}</p>
              </li>
            ))}
          </ul>
          <div className="flex gap-2">
            <input className="input py-2.5" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder="Mã giảm giá" aria-label="Mã giảm giá" />
            <button type="button" onClick={applyCode} disabled={!code} className="btn-dark shrink-0 px-5 py-2.5">Áp dụng</button>
          </div>
          {quote?.promotionMessage && <p className={`text-sm ${quote.promotionCode ? "text-grade" : "text-danger"}`}>{quote.promotionMessage}</p>}
          {quote && (
            <dl className="space-y-2 border-t border-mist pt-4 text-[15px]">
              <div className="flex justify-between"><dt className="text-graphite">Tạm tính</dt><dd className="tabular-nums">{vnd(quote.subtotal)}</dd></div>
              {quote.discount > 0 && <div className="flex justify-between"><dt className="text-graphite">Giảm giá</dt><dd className="tabular-nums text-grade">−{vnd(quote.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-graphite">Phí giao hàng</dt><dd className="tabular-nums">{quote.shippingFee ? vnd(quote.shippingFee) : "Miễn phí"}</dd></div>
              <div className="flex justify-between border-t border-mist pt-3 text-lg font-bold"><dt>Tổng cộng</dt><dd className="tabular-nums">{vnd(quote.total)}</dd></div>
            </dl>
          )}
          {msg && <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">{msg}</p>}
          <button disabled={busy || !cart} className="btn-primary w-full">{busy && <Spinner />}{method === "PAYOS" ? "Đặt hàng và quét QR" : "Đặt hàng"}</button>
        </aside>
      </form>
    </>
  );
}
