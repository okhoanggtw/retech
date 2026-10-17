"use client";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { conditionOf, type TradeIn } from "@/lib/types";
import { dateTime, vnd } from "@/lib/format";
import { Skeleton } from "@/components/ui";
import { useToast } from "@/components/Toast";

const ST = { NEW: "Mới", CONTACTED: "Đã liên hệ", ACCEPTED: "Đã chốt", REJECTED: "Từ chối", COMPLETED: "Hoàn tất" } as const;

export default function AdminTradeIns() {
  const { data, mutate } = useSWR<TradeIn[]>("/api/admin/trade-ins", fetcher);
  const toast = useToast();
  const upd = async (t: TradeIn, body: Partial<TradeIn>) => {
    try { await api(`/api/admin/trade-ins/${t.id}`, { method: "PUT", json: body }); mutate(); toast("Đã cập nhật", "success"); } catch (e) { toast((e as Error).message, "error"); }
  };
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Yêu cầu thu mua</h1>
      {!data ? <Skeleton className="h-80" /> : data.length === 0 ? <p className="card text-graphite">Chưa có yêu cầu nào.</p> : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((t) => (
            <div key={t.id} className="card space-y-3 text-sm">
              <div className="flex justify-between gap-3">
                <div><p className="text-lg font-bold">{t.brand} {t.model} {t.storage}</p><p className="text-graphite">{dateTime(t.createdAt)} · {t.contactName} · <a className="link" href={`tel:${t.contactPhone}`}>{t.contactPhone}</a></p></div>
                <select value={t.status} onChange={(e) => upd(t, { status: e.target.value as TradeIn["status"] })} className="h-9 rounded-lg border border-mist px-2" aria-label="Trạng thái">
                  {Object.entries(ST).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <p>Mua năm {t.purchaseYear ?? "?"} · {conditionOf(t.condition)?.label}{t.batteryHealth ? ` · pin ${t.batteryHealth}%` : ""}{t.issues.length ? ` · Lỗi: ${t.issues.join(", ")}` : ""} · {t.accessories.length ? t.accessories.join(", ") : "chỉ có máy"}</p>
              {t.aiEstimate && (
                <div className="rounded-xl bg-paper p-3">
                  <p>AI ({t.aiEstimate.source === "GEMINI" ? "Gemini" : "Công thức"}): thu <b>{vnd(t.aiEstimate.buyPriceLow)} – {vnd(t.aiEstimate.buyPriceHigh)}</b>, bán lại ~{vnd(t.aiEstimate.suggestedPrice)}</p>
                  <p className="mt-1 text-graphite">{t.aiEstimate.explanation}</p>
                </div>
              )}
              <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); const v = new FormData(e.currentTarget).get("offer") as string; upd(t, { offerPrice: Number(v.replace(/\D/g, "")) }); }}>
                <input name="offer" defaultValue={t.offerPrice ?? ""} className="input py-2" placeholder="Giá chốt với khách (₫)" inputMode="numeric" aria-label="Giá chốt" />
                <button className="btn-dark shrink-0 px-4 py-2 text-sm">Lưu giá</button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
