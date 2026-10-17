"use client";
import { useState } from "react";
import { useStats } from "@/components/admin/useStats";
import { HBar, RevenueChart } from "@/components/admin/Charts";
import { ORDER_STATUS, vnd } from "@/lib/format";
import { Skeleton } from "@/components/ui";

export default function StatsPage() {
  const [days, setDays] = useState(30);
  const { data: s } = useStats(days);
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Thống kê</h1>
        <div className="flex gap-2">{[7, 30, 90].map((d) => <button key={d} onClick={() => setDays(d)} className={`chip ${days === d ? "chip-on" : ""}`}>{d} ngày</button>)}</div>
      </div>
      {!s ? <Skeleton className="h-96" /> : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[["Tổng doanh thu", vnd(s.revenue)], ["Tổng đơn hàng", s.totalOrders], ["Khách hàng", `${s.totalUsers} (+${s.newUsersThisMonth} tháng này)`], ["Câu hỏi cho chatbot", s.chatbotQuestions]].map(([l, v]) => (
              <div key={l as string} className="card"><p className="text-sm text-graphite">{l}</p><p className="mt-1 text-xl font-bold tabular-nums">{v}</p></div>
            ))}
          </div>
          <div className="card"><h2 className="font-bold">Doanh thu theo ngày</h2><div className="mt-4"><RevenueChart data={s.revenueByDay} /></div></div>
          <div className="grid gap-6 lg:grid-cols-2">
            <div className="card"><h2 className="font-bold">Doanh thu theo danh mục</h2><HBar data={s.revenueByCategory} /></div>
            <div className="card"><h2 className="font-bold">Doanh thu theo hãng</h2><HBar data={s.revenueByBrand} /></div>
            <div className="card"><h2 className="font-bold">Đơn hàng theo trạng thái</h2><HBar money={false} data={s.ordersByStatus.map((x) => ({ name: ORDER_STATUS[x.name]?.label ?? x.name, value: x.value }))} /></div>
            <div className="card"><h2 className="font-bold">Phương thức thanh toán</h2><HBar money={false} height={140} data={s.paymentMethods.map((x) => ({ name: x.name === "PAYOS" ? "QR PayOS" : "COD", value: x.value }))} /></div>
          </div>
          <div className="card">
            <h2 className="font-bold">Top sản phẩm bán chạy</h2>
            <table className="mt-3 w-full text-sm">
              <thead className="text-left text-graphite"><tr><th className="py-2 font-medium">Sản phẩm</th><th className="text-right font-medium">Đã bán</th><th className="text-right font-medium">Doanh thu</th></tr></thead>
              <tbody className="divide-y divide-mist/70">{s.topProducts.map((t) => <tr key={t.productId}><td className="py-2.5">{t.name}</td><td className="text-right tabular-nums">{t.quantity}</td><td className="text-right tabular-nums">{vnd(t.revenue)}</td></tr>)}</tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
