"use client";
import useSWR from "swr";
import { api, fetcher } from "@/lib/api";
import { dateTime } from "@/lib/format";
import type { ContactMessage } from "@/lib/types";
import { Badge, Skeleton } from "@/components/ui";

export default function AdminContacts() {
  const { data, mutate } = useSWR<ContactMessage[]>("/api/admin/contacts", fetcher);
  return (
    <div className="space-y-5">
      <h1 className="text-3xl font-bold tracking-tight">Tin nhắn liên hệ</h1>
      {!data ? <Skeleton className="h-80" /> : data.length === 0 ? <p className="card text-graphite">Chưa có tin nhắn nào.</p> : data.map((c) => (
        <div key={c.id} className="card text-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p><b>{c.fullName}</b> · <a className="link" href={`mailto:${c.email}`}>{c.email}</a> {c.phone && `· ${c.phone}`}</p>
            <p className="text-graphite">{dateTime(c.createdAt)}</p>
          </div>
          {c.subject && <p className="mt-2 font-semibold">{c.subject}</p>}
          <p className="mt-1 whitespace-pre-line text-graphite">{c.message}</p>
          <div className="mt-3">{c.handled ? <Badge tone="bg-grade-soft text-grade">Đã xử lý</Badge> :
            <button onClick={async () => { await api(`/api/admin/contacts/${c.id}/handled`, { method: "PUT" }); mutate(); }} className="btn-ghost px-4 py-1.5 text-sm">Đánh dấu đã xử lý</button>}</div>
        </div>
      ))}
    </div>
  );
}
