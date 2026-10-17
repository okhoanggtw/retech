"use client";
import Link from "next/link";
import { useStats } from "@/components/admin/useStats";
import { RevenueChart } from "@/components/admin/Charts";
import { ORDER_STATUS, date, vnd } from "@/lib/format";
import { Badge, Skeleton } from "@/components/ui";

function Kpi({ label, value, sub, href }: { label: string; value: string; sub?: string; href?: string }) {
  const body = (<><p className="text-sm text-graphite">{label}</p><p className="mt-1 text-2xl font-bold tabular-nums">{value}</p>{sub && <p className="mt-1 text-xs text-graphite">{sub}</p>}</>);
  return href ? <Link href={href} className="card hover:ring-2 hover:ring-cobalt/20">{body}</Link> : <div className="card">{body}</div>;
}

export default function AdminHome() {
  const { data: s } = useStats(30);
  if (!s) return <div className="grid gap-4 md:grid-cols-4">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-28" />)}</div>;
  const growth = s.revenueLastMonth ? Math.round(((s.revenueThisMonth - s.revenueLastMonth) / s.revenueLastMonth) * 100) : null;
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Tổng quan</h1>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi label="Doanh thu tháng này" value={vnd(s.revenueThisMonth)} sub={growth != null ? `${growth >= 0 ? "+" : ""}${growth}% so với tháng trước` : undefined} />
        <Kpi label="Đơn chờ xác nhận" value={String(s.pendingOrders)} sub={`/${s.totalOrders} đơn`} href="/admin/don-hang" />
        <Kpi label="Yêu cầu thu mua mới" value={String(s.newTradeIns)} sub={`/${s.tradeInRequests} yêu cầu`} href="/admin/thu-mua" />
        <Kpi label="Sản phẩm sắp hết" value={String(s.lowStockProducts)} sub={`/${s.totalProducts} sản phẩm`} href="/admin/san-pham" />
      </div>
      <div className="card">
        <div className="flex items-baseline justify-between"><h2 className="font-bold">Doanh thu 30 ngày</h2><p className="text-sm text-graphite">Tổng {vnd(s.revenueByDay.reduce((a, b) => a + b.revenue, 0))}</p></div>
        <div className="mt-4"><RevenueChart data={s.revenueByDay} /></div>
      </div>
      <div className="card">
        <div className="flex items-center justify-between"><h2 className="font-bold">Đơn hàng mới nhất</h2><Link href="/admin/don-hang" className="link text-sm">Tất cả đơn</Link></div>
        <div className="mt-3 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-graphite"><tr><th className="py-2 font-medium">Mã</th><th className="font-medium">Khách</th><th className="font-medium">Ngày</th><th className="font-medium">Trạng thái</th><th className="text-right font-medium">Tổng</th></tr></thead>
            <tbody className="divide-y divide-mist/70">
              {s.recentOrders.map((o) => (
                <tr key={o.id}><td className="py-2.5 font-medium">#{o.orderCode}</td><td>{o.shipping?.fullName}</td><td>{date(o.createdAt)}</td>
                  <td><Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge></td><td className="text-right tabular-nums">{vnd(o.total)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
