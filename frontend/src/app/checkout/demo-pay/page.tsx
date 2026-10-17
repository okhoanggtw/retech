"use client";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Spinner } from "@/components/ui";

/** Trang gia lap PayOS - chi dung khi backend chua cau hinh key PayOS */
function DemoPay() {
  const sp = useSearchParams();
  const router = useRouter();
  const code = sp.get("orderCode");
  const [busy, setBusy] = useState(false);
  const pay = async () => {
    setBusy(true);
    try { await api(`/api/payments/demo/${code}/confirm`, { method: "POST" }); } catch {}
    router.push(`/checkout/result?orderCode=${code}`);
  };
  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center">
      <p className="inline-block rounded-full bg-amber-soft px-3 py-1 text-xs font-semibold text-amber">Chế độ thử nghiệm – chưa kết nối PayOS</p>
      <h1 className="mt-4 text-3xl font-bold tracking-tightest">Quét mã để thanh toán</h1>
      <div className="mx-auto mt-8 grid h-56 w-56 grid-cols-8 gap-1 rounded-xl2 bg-white p-4" aria-hidden>
        {Array.from({ length: 64 }).map((_, i) => <span key={i} className={(i * 7 + i * i) % 3 ? "bg-ink" : "bg-transparent"} />)}
      </div>
      <p className="mt-4 text-graphite">Đơn #{code}</p>
      <div className="mt-8 grid gap-3">
        <button onClick={pay} disabled={busy} className="btn-primary">{busy && <Spinner />}Giả lập: tôi đã chuyển khoản</button>
        <button onClick={() => router.push(`/checkout/result?cancel=true&orderCode=${code}`)} className="btn-ghost">Hủy thanh toán</button>
      </div>
    </div>
  );
}
export default function Page() { return <Suspense><DemoPay /></Suspense>; }
