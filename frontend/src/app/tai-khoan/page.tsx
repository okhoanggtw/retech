"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { ORDER_STATUS, PAYMENT_STATUS, date, vnd } from "@/lib/format";
import type { Order, TradeIn } from "@/lib/types";
import { Badge, Empty, Field, PageTitle, Skeleton, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toast";

export default function AccountPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const toast = useToast();
  const [tab, setTab] = useState<"orders" | "tradeins" | "profile">("orders");
  const { data: orders } = useSWR<Order[]>(user ? "/api/orders" : null, fetcher);
  const { data: trades } = useSWR<TradeIn[]>(user ? "/api/trade-ins/mine" : null, fetcher);
  const [p, setP] = useState({ fullName: "", phone: "", address: "" });
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (!loading && !user) router.replace("/dang-nhap?next=/tai-khoan"); }, [loading, user, router]);
  useEffect(() => { if (user) setP({ fullName: user.fullName, phone: user.phone ?? "", address: user.address ?? "" }); }, [user]);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await api("/api/auth/me", { method: "PUT", json: p }); await refresh(); toast("Đã lưu thông tin", "success"); }
    catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };
  const changePw = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { await api("/api/auth/password", { method: "PUT", json: pw }); setPw({ currentPassword: "", newPassword: "" }); toast("Đã đổi mật khẩu", "success"); }
    catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };

  if (!user) return <div className="mx-auto max-w-page p-6"><Skeleton className="h-60" /></div>;
  return (
    <>
      <PageTitle title={`Chào ${user.fullName.split(" ").pop()}.`} sub={user.email} />
      <div className="mx-auto max-w-page px-4 pb-20 md:px-6">
        <div className="flex gap-2" role="tablist">
          {([["orders", "Đơn hàng"], ["tradeins", "Yêu cầu thu cũ"], ["profile", "Thông tin cá nhân"]] as const).map(([k, l]) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`chip ${tab === k ? "chip-on" : ""}`}>{l}</button>
          ))}
        </div>

        {tab === "orders" && (
          <div className="mt-6 space-y-3">
            {!orders ? <Skeleton className="h-32" /> : orders.length === 0 ? <Empty title="Bạn chưa có đơn hàng nào." action="Mua sắm ngay" href="/san-pham" /> :
              orders.map((o) => (
                <Link key={o.id} href={`/tai-khoan/don-hang/${o.orderCode}`} className="flex flex-col gap-3 rounded-xl2 bg-white p-5 hover:ring-2 hover:ring-cobalt/30 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="font-semibold">Đơn #{o.orderCode} <span className="font-normal text-graphite">· {date(o.createdAt)}</span></p>
                    <p className="mt-1 text-sm text-graphite">{o.items.map((i) => i.name).join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</Badge>
                    <Badge tone={PAYMENT_STATUS[o.paymentStatus].tone}>{PAYMENT_STATUS[o.paymentStatus].label}</Badge>
                    <p className="ml-2 font-bold tabular-nums">{vnd(o.total)}</p>
                  </div>
                </Link>
              ))}
          </div>
        )}

        {tab === "tradeins" && (
          <div className="mt-6 space-y-3">
            {!trades ? <Skeleton className="h-32" /> : trades.length === 0 ? <Empty title="Bạn chưa gửi yêu cầu thu cũ nào." action="Định giá máy cũ" href="/thu-cu" /> :
              trades.map((t) => (
                <div key={t.id} className="rounded-xl2 bg-white p-5">
                  <p className="font-semibold">{t.brand} {t.model} {t.storage}</p>
                  <p className="mt-1 text-sm text-graphite">Gửi ngày {date(t.createdAt)} · Trạng thái: {{ NEW: "Chờ liên hệ", CONTACTED: "Đã liên hệ", ACCEPTED: "Đã chốt giá", REJECTED: "Từ chối", COMPLETED: "Hoàn tất" }[t.status]}</p>
                  {t.aiEstimate && <p className="mt-2">AI định giá thu mua: <b>{vnd(t.aiEstimate.buyPriceLow)} – {vnd(t.aiEstimate.buyPriceHigh)}</b></p>}
                  {t.offerPrice && <p className="text-grade">Giá ReTech chốt: <b>{vnd(t.offerPrice)}</b></p>}
                </div>
              ))}
          </div>
        )}

        {tab === "profile" && (
          <div className="mt-6 grid gap-6 md:grid-cols-2">
            <form onSubmit={saveProfile} className="card space-y-4">
              <h2 className="text-xl font-bold">Thông tin cá nhân</h2>
              <Field label="Họ tên"><input className="input" value={p.fullName} onChange={(e) => setP({ ...p, fullName: e.target.value })} /></Field>
              <Field label="Số điện thoại"><input className="input" value={p.phone} onChange={(e) => setP({ ...p, phone: e.target.value })} /></Field>
              <Field label="Địa chỉ mặc định"><input className="input" value={p.address} onChange={(e) => setP({ ...p, address: e.target.value })} /></Field>
              <button disabled={busy} className="btn-primary">{busy && <Spinner />}Lưu thông tin</button>
            </form>
            <form onSubmit={changePw} className="card space-y-4">
              <h2 className="text-xl font-bold">Đổi mật khẩu</h2>
              <Field label="Mật khẩu hiện tại"><input type="password" className="input" required value={pw.currentPassword} onChange={(e) => setPw({ ...pw, currentPassword: e.target.value })} /></Field>
              <Field label="Mật khẩu mới" hint="Tối thiểu 6 ký tự"><input type="password" minLength={6} className="input" required value={pw.newPassword} onChange={(e) => setPw({ ...pw, newPassword: e.target.value })} /></Field>
              <button disabled={busy} className="btn-dark">Đổi mật khẩu</button>
            </form>
          </div>
        )}
      </div>
    </>
  );
}
