"use client";
import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import { Spinner } from "@/components/ui";

interface Status { orderCode: number; total: number; paymentMethod: string; paymentStatus: string; status: string; checkoutUrl?: string }

function Result() {
  const sp = useSearchParams();
  const code = sp.get("orderCode");
  const cancel = sp.get("cancel") === "true";
  const [s, setS] = useState<Status | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!code) return;
    let n = 0, stop = false;
    const tick = async () => {
      try {
        const r = await api<Status>(`/api/payments/payos/${code}/status${cancel ? "?cancel=true" : ""}`);
        setS(r);
        // cho webhook/PayOS xac nhan toi da ~60s
        if (!stop && r.paymentMethod === "PAYOS" && r.paymentStatus === "UNPAID" && !cancel && ++n < 20) setTimeout(tick, 3000);
      } catch (e) { setErr((e as Error).message); }
    };
    tick();
    return () => { stop = true; };
  }, [code, cancel]);

  if (err) return <p className="text-danger">{err}</p>;
  if (!s) return <p className="flex items-center justify-center gap-2 text-graphite"><Spinner /> Đang kiểm tra đơn hàng…</p>;

  const paid = s.paymentStatus === "PAID";
  const cancelled = s.status === "CANCELLED" || s.paymentStatus === "CANCELLED";
  const cod = s.paymentMethod === "COD";
  const [Icon, color, title, desc] = paid
    ? [CheckCircle2, "text-grade", "Thanh toán thành công.", "Cảm ơn bạn! Đơn hàng đã được xác nhận và sẽ sớm được giao."]
    : cancelled ? [XCircle, "text-danger", "Đơn hàng đã hủy.", "Bạn chưa bị trừ tiền. Sản phẩm vẫn còn trong cửa hàng nếu bạn muốn đặt lại."]
    : cod ? [CheckCircle2, "text-grade", "Đặt hàng thành công.", "Bạn sẽ thanh toán khi nhận hàng. ReTech sẽ gọi xác nhận trong ít phút."]
    : [Clock, "text-amber", "Đang chờ thanh toán.", "Nếu bạn đã chuyển khoản, trang sẽ tự cập nhật khi ngân hàng báo về."];

  return (
    <div className="text-center">
      <Icon size={64} className={`mx-auto ${color}`} strokeWidth={1.5} />
      <h1 className="mt-6 text-4xl font-bold tracking-tightest">{title}</h1>
      <p className="mx-auto mt-3 max-w-md text-lg text-graphite">{desc}</p>
      <div className="mx-auto mt-8 max-w-sm rounded-xl2 bg-white p-5 text-left text-[15px]">
        <div className="flex justify-between"><span className="text-graphite">Mã đơn</span><b>#{s.orderCode}</b></div>
        <div className="mt-2 flex justify-between"><span className="text-graphite">Tổng tiền</span><b>{vnd(s.total)}</b></div>
      </div>
      <div className="mt-8 flex justify-center gap-3">
        {!paid && !cancelled && !cod && s.checkoutUrl && <a href={s.checkoutUrl} className="btn-primary">Mở lại trang thanh toán</a>}
        <Link href={`/tai-khoan/don-hang/${s.orderCode}`} className="btn-ghost">Xem đơn hàng</Link>
        <Link href="/san-pham" className="btn-dark">Tiếp tục mua sắm</Link>
      </div>
    </div>
  );
}

export default function Page() {
  return <div className="mx-auto max-w-2xl px-4 py-20"><Suspense><Result /></Suspense></div>;
}
