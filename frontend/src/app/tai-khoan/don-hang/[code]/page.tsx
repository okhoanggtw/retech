"use client";
import Link from "next/link";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { ORDER_STATUS, PAYMENT_STATUS, dateTime, vnd } from "@/lib/format";
import type { Order } from "@/lib/types";
import { Badge, Empty, Skeleton } from "@/components/ui";
import { useToast } from "@/components/Toast";

export default function OrderDetail({ params }: { params: { code: string } }) {
  const { data: o, error, mutate } = useSWR<Order>(`/api/orders/${params.code}`, fetcher);
  const toast = useToast();
  if (error) return <div className="mx-auto max-w-3xl px-4 py-20"><Empty title={error.message} action="Về tài khoản" href="/tai-khoan" /></div>;
  if (!o) return <div className="mx-auto max-w-3xl px-4 py-20"><Skeleton className="h-96" /></div>;

  const cancel = async () => {
    if (!confirm("Hủy đơn hàng này?")) return;
    try { mutate(await api<Order>(`/api/orders/${o.orderCode}/cancel`, { method: "POST" }), false); toast("Đã hủy đơn", "success"); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <Link href="/tai-khoan" className="link text-sm">Tất cả đơn hàng</Link>
      <h1 className="mt-3 text-4xl font-bold tracking-tightest">Đơn #{o.orderCode}</h1>
      <div className="mt-3 flex flex-wrap gap-2">
        <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
        <Badge tone={PAYMENT_STATUS[o.paymentStatus].tone}>{PAYMENT_STATUS[o.paymentStatus].label}</Badge>
        <Badge tone="bg-white text-ink">{o.paymentMethod === "PAYOS" ? "Chuyển khoản QR" : "COD"}</Badge>
      </div>

      <div className="mt-8 card">
        <ul className="divide-y divide-mist/70">
          {o.items.map((i) => (
            <li key={i.productId} className="flex justify-between gap-4 py-3">
              <div><Link href={`/san-pham/${i.slug}`} className="font-medium hover:underline">{i.name}</Link><p className="text-sm text-graphite">{i.condition} · x{i.quantity}</p></div>
              <p className="font-semibold tabular-nums">{vnd(i.price * i.quantity)}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-4 space-y-1 border-t border-mist pt-4 text-[15px]">
          <div className="flex justify-between"><dt className="text-graphite">Tạm tính</dt><dd>{vnd(o.subtotal)}</dd></div>
          {o.discount > 0 && <div className="flex justify-between"><dt className="text-graphite">Giảm giá ({o.promotionCode})</dt><dd className="text-grade">−{vnd(o.discount)}</dd></div>}
          <div className="flex justify-between"><dt className="text-graphite">Giao hàng</dt><dd>{o.shippingFee ? vnd(o.shippingFee) : "Miễn phí"}</dd></div>
          <div className="flex justify-between pt-2 text-lg font-bold"><dt>Tổng</dt><dd>{vnd(o.total)}</dd></div>
        </dl>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="card text-[15px]">
          <h2 className="font-bold">Giao tới</h2>
          <p className="mt-2">{o.shipping.fullName} · {o.shipping.phone}</p>
          <p className="text-graphite">{o.shipping.address}</p>
          {o.shipping.note && <p className="mt-1 text-sm text-graphite">Ghi chú: {o.shipping.note}</p>}
        </div>
        <div className="card text-[15px]">
          <h2 className="font-bold">Lịch sử</h2>
          <ol className="mt-2 space-y-2">
            {o.history.map((h, i) => (
              <li key={i} className="text-sm"><b>{ORDER_STATUS[h.status]?.label ?? (h.status === "PAID" ? "Đã thanh toán" : h.status)}</b> <span className="text-graphite">· {dateTime(h.at)}</span>{h.note && <p className="text-graphite">{h.note}</p>}</li>
            ))}
          </ol>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {o.paymentMethod === "PAYOS" && o.paymentStatus === "UNPAID" && o.status !== "CANCELLED" && o.checkoutUrl && <a href={o.checkoutUrl} className="btn-primary">Thanh toán ngay</a>}
        {o.status === "PENDING" && o.paymentStatus !== "PAID" && <button onClick={cancel} className="btn-ghost text-danger">Hủy đơn</button>}
      </div>
    </div>
  );
}
