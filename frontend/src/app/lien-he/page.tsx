"use client";
import { useState } from "react";
import useSWR from "swr";
import { api, ApiError, fetcher } from "@/lib/api";
import type { SiteSettings } from "@/lib/types";
import { Field, PageTitle, Spinner } from "@/components/ui";

export default function ContactPage() {
  const { data: s } = useSWR<SiteSettings>("/api/content/settings", fetcher);
  const [f, setF] = useState({ fullName: "", email: "", phone: "", subject: "", message: "" });
  const [err, setErr] = useState<Record<string, string>>({});
  const [done, setDone] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr({});
    try { const r = await api<{ message: string }>("/api/content/contact", { method: "POST", json: f }); setDone(r.message); }
    catch (e) { setErr((e as ApiError).details ?? { message: (e as Error).message }); } finally { setBusy(false); }
  };
  const bind = (k: keyof typeof f) => ({ value: f[k], onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => setF({ ...f, [k]: e.target.value }) });
  return (
    <>
      <PageTitle title="Liên hệ." sub="Ghé cửa hàng để xem máy tận tay, hoặc nhắn cho chúng tôi." />
      <div className="mx-auto grid max-w-page gap-8 px-4 pb-20 md:grid-cols-2 md:px-6">
        <div className="space-y-4">
          <div className="card space-y-2 text-[15px]">
            <p><span className="text-graphite">Hotline</span><br /><a href={`tel:${s?.hotline?.replace(/\s/g, "")}`} className="text-2xl font-bold">{s?.hotline}</a></p>
            <p><span className="text-graphite">Email</span><br /><a href={`mailto:${s?.email}`} className="font-semibold">{s?.email}</a></p>
            <p><span className="text-graphite">Địa chỉ</span><br /><b>{s?.address}</b></p>
            <p><span className="text-graphite">Giờ mở cửa</span><br /><b>{s?.workingHours}</b></p>
          </div>
          {s?.mapEmbedUrl && <iframe title="Bản đồ cửa hàng" src={s.mapEmbedUrl} className="h-72 w-full rounded-xl2 border-0" loading="lazy" />}
        </div>
        {done ? (
          <div className="card grid place-items-center text-center"><p className="text-2xl font-bold">Đã gửi.</p><p className="mt-2 text-graphite">{done}</p></div>
        ) : (
          <form onSubmit={submit} className="card space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Họ tên" error={err.fullName}><input className="input" required {...bind("fullName")} /></Field>
              <Field label="Số điện thoại"><input className="input" type="tel" {...bind("phone")} /></Field>
            </div>
            <Field label="Email" error={err.email}><input className="input" type="email" required {...bind("email")} /></Field>
            <Field label="Chủ đề"><input className="input" {...bind("subject")} placeholder="Hỏi về đơn hàng, bảo hành…" /></Field>
            <Field label="Nội dung" error={err.message}><textarea className="input min-h-36" required {...bind("message")} /></Field>
            <button disabled={busy} className="btn-primary">{busy && <Spinner />}Gửi tin nhắn</button>
          </form>
        )}
      </div>
    </>
  );
}
