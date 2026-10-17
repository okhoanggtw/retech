"use client";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";
import { Field, Skeleton, Spinner } from "@/components/ui";
import { useToast } from "@/components/Toast";

const SOCIALS = ["facebook", "instagram", "tiktok", "youtube", "zalo"];

export default function SettingsPage() {
  const { data } = useSWR<SiteSettings>("/api/admin/settings", fetcher);
  const [s, setS] = useState<SiteSettings | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  useEffect(() => { if (data) setS(data); }, [data]);
  if (!s) return <Skeleton className="h-96" />;
  const t = (k: keyof SiteSettings) => ({ value: (s[k] as string) ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => setS({ ...s, [k]: e.target.value }) });
  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true);
    try { setS(await api<SiteSettings>("/api/admin/settings", { method: "PUT", json: s })); toast("Đã lưu cài đặt", "success"); }
    catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };
  const confirmWebhook = async () => {
    try { await api("/api/admin/payos/confirm-webhook", { method: "POST" }); toast("Đã đăng ký webhook với PayOS", "success"); }
    catch (e) { toast((e as Error).message, "error"); }
  };
  return (
    <form onSubmit={save} className="max-w-3xl space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Cài đặt cửa hàng</h1>
      <section className="card grid gap-4 md:grid-cols-2">
        <Field label="Tên cửa hàng"><input className="input" {...t("storeName")} /></Field>
        <Field label="Khẩu hiệu"><input className="input" {...t("slogan")} /></Field>
        <Field label="Hotline"><input className="input" {...t("hotline")} /></Field>
        <Field label="Email"><input className="input" {...t("email")} /></Field>
        <Field label="Địa chỉ"><input className="input" {...t("address")} /></Field>
        <Field label="Giờ mở cửa"><input className="input" {...t("workingHours")} /></Field>
        <Field label="Phí giao hàng (₫)"><input className="input" type="number" value={s.shippingFee} onChange={(e) => setS({ ...s, shippingFee: Number(e.target.value) })} /></Field>
        <Field label="Miễn phí giao từ (₫)"><input className="input" type="number" value={s.freeShipThreshold} onChange={(e) => setS({ ...s, freeShipThreshold: Number(e.target.value) })} /></Field>
        <div className="md:col-span-2"><Field label="Link nhúng Google Maps"><input className="input" {...t("mapEmbedUrl")} /></Field></div>
      </section>
      <section className="card space-y-4">
        <h2 className="font-bold">Liên kết mạng xã hội</h2>
        {SOCIALS.map((k) => (
          <Field key={k} label={k[0].toUpperCase() + k.slice(1)}>
            <input className="input" value={s.socials?.[k] ?? ""} onChange={(e) => setS({ ...s, socials: { ...s.socials, [k]: e.target.value } })} placeholder="https://" />
          </Field>
        ))}
      </section>
      <div className="flex flex-wrap gap-3">
        <button disabled={busy} className="btn-primary">{busy && <Spinner />}Lưu cài đặt</button>
        <button type="button" onClick={confirmWebhook} className="btn-ghost">Đăng ký webhook PayOS</button>
      </div>
    </form>
  );
}
