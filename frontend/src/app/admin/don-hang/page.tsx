"use client";
import { useState } from "react";
import useSWR from "swr";
import { X } from "lucide-react";
import { api, fetcher } from "@/lib/api";
import { ORDER_STATUS, PAYMENT_STATUS, dateTime, vnd } from "@/lib/format";
import type { Order, OrderStatus } from "@/lib/types";
import { Badge, Skeleton } from "@/components/ui";
import { useToast } from "@/components/Toast";

const FLOW: OrderStatus[] = ["PENDING", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];

export default function AdminOrders() {
  const { data, mutate } = useSWR<Order[]>("/api/admin/orders", fetcher);
  const [filter, setFilter] = useState<string>("");
  const [sel, setSel] = useState<Order | null>(null);
  const toast = useToast();
  const list = (data ?? []).filter((o) => !filter || o.status === filter);

  const setStatus = async (o: Order, status: OrderStatus) => {
    try {
      const u = await api<Order>(`/api/admin/orders/${o.orderCode}/status`, { method: "PUT", json: { status, note: "Cập nhật bởi admin" } });
      setSel(u); mutate(); toast("Đã cập nhật trạng thái", "success");
    } catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Đơn hàng</h1>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilter("")} className={`chip ${!filter ? "chip-on" : ""}`}>Tất cả {data && `(${data.length})`}</button>
        {FLOW.map((s) => <button key={s} onClick={() => setFilter(s)} className={`chip ${filter === s ? "chip-on" : ""}`}>{ORDER_STATUS[s].label} {data && `(${data.filter((o) => o.status === s).length})`}</button>)}
      </div>
      <div className="overflow-x-auto rounded-xl2 bg-white">
        {!data ? <Skeleton className="h-96" /> : (
          <table className="w-full min-w-[820px] text-sm">
            <thead className="border-b border-mist text-left text-graphite"><tr><th className="px-4 py-3 font-medium">Mã đơn</th><th className="font-medium">Khách hàng</th><th className="font-medium">Ngày đặt</th><th className="font-medium">Thanh toán</th><th className="font-medium">Trạng thái</th><th className="pr-4 text-right font-medium">Tổng</th></tr></thead>
            <tbody className="divide-y divide-mist/70">
              {list.map((o) => (
                <tr key={o.id} onClick={() => setSel(o)} className="cursor-pointer hover:bg-paper">
                  <td className="px-4 py-3 font-medium">#{o.orderCode}</td>
                  <td>{o.shipping?.fullName}<p className="text-xs text-graphite">{o.shipping?.phone}</p></td>
                  <td>{dateTime(o.createdAt)}</td>
                  <td><span className="mr-2">{o.paymentMethod === "PAYOS" ? "QR" : "COD"}</span><Badge tone={PAYMENT_STATUS[o.paymentStatus].tone}>{PAYMENT_STATUS[o.paymentStatus].label}</Badge></td>
                  <td><Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge></td>
                  <td className="pr-4 text-right font-semibold tabular-nums">{vnd(o.total)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {sel && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30" onClick={() => setSel(null)}>
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-6" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={`Đơn ${sel.orderCode}`}>
            <div className="flex items-center justify-between"><h2 className="text-2xl font-bold">Đơn #{sel.orderCode}</h2><button onClick={() => setSel(null)} className="icon-btn" aria-label="Đóng"><X size={18} /></button></div>
            <p className="mt-1 text-sm text-graphite">{dateTime(sel.createdAt)}</p>
            <div className="mt-5 space-y-1 text-sm">
              <p><b>{sel.shipping.fullName}</b> · {sel.shipping.phone} · {sel.shipping.email}</p>
              <p className="text-graphite">{sel.shipping.address}</p>
              {sel.shipping.note && <p className="text-graphite">Ghi chú: {sel.shipping.note}</p>}
            </div>
            <ul className="mt-5 divide-y divide-mist/70 border-y border-mist/70 text-sm">
              {sel.items.map((i) => <li key={i.productId} className="flex justify-between py-2.5"><span>{i.name} <span className="text-graphite">x{i.quantity}</span></span><span className="tabular-nums">{vnd(i.price * i.quantity)}</span></li>)}
            </ul>
            <div className="mt-3 space-y-1 text-sm">
              {sel.discount > 0 && <p className="flex justify-between"><span>Giảm ({sel.promotionCode})</span><span>−{vnd(sel.discount)}</span></p>}
              <p className="flex justify-between"><span>Phí giao</span><span>{vnd(sel.shippingFee)}</span></p>
              <p className="flex justify-between text-base font-bold"><span>Tổng</span><span>{vnd(sel.total)}</span></p>
              <p className="pt-1">Thanh toán: {sel.paymentMethod === "PAYOS" ? "QR PayOS" : "COD"} · <Badge tone={PAYMENT_STATUS[sel.paymentStatus].tone}>{PAYMENT_STATUS[sel.paymentStatus].label}</Badge> {sel.paymentReference && <span className="text-graphite">Mã GD {sel.paymentReference}</span>}</p>
            </div>
            <h3 className="mt-6 font-semibold">Cập nhật trạng thái</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {FLOW.map((s) => <button key={s} disabled={sel.status === s || sel.status === "CANCELLED"} onClick={() => setStatus(sel, s)} className={`chip disabled:opacity-40 ${sel.status === s ? "chip-on" : ""}`}>{ORDER_STATUS[s].label}</button>)}
            </div>
            {sel.paymentMethod === "PAYOS" && sel.paymentStatus === "UNPAID" && (
              <button onClick={async () => { const u = await api<Order>(`/api/admin/orders/${sel.orderCode}/sync-payment`, { method: "POST" }); setSel(u); mutate(); }} className="link mt-3 text-sm">Kiểm tra lại với PayOS</button>
            )}
            <h3 className="mt-6 font-semibold">Lịch sử</h3>
            <ol className="mt-2 space-y-1.5 text-sm">{sel.history.map((h, i) => <li key={i}><b>{ORDER_STATUS[h.status]?.label ?? h.status}</b> <span className="text-graphite">· {dateTime(h.at)} · {h.note}</span></li>)}</ol>
          </div>
        </div>
      )}
    </div>
  );
}
