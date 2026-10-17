"use client";
import { useState } from "react";
import useSWR from "swr";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import { api, fetcher } from "@/lib/api";
import { Field, Skeleton, Spinner } from "../ui";
import { useToast } from "../Toast";
import ImageUploader from "./ImageUploader";

export interface FieldSpec {
  key: string; label: string; type?: "text" | "textarea" | "number" | "checkbox" | "select" | "datetime" | "image";
  options?: [string, string][]; required?: boolean; hint?: string;
}
type Row = Record<string, unknown> & { id?: string };

/** Trang CRUD dung chung cho banner, menu, khuyen mai, FAQ */
export default function CrudPage({ title, endpoint, fields, columns, defaults, addLabel }: {
  title: string; endpoint: string; fields: FieldSpec[]; addLabel: string;
  columns: { label: string; render: (r: Row) => React.ReactNode }[]; defaults: Row;
}) {
  const { data, mutate } = useSWR<Row[]>(endpoint, fetcher);
  const [edit, setEdit] = useState<Row | null>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); if (!edit) return; setBusy(true);
    try {
      await api(edit.id ? `${endpoint}/${edit.id}` : endpoint, { method: edit.id ? "PUT" : "POST", json: edit });
      toast("Đã lưu", "success"); setEdit(null); mutate();
    } catch (e) { toast((e as Error).message, "error"); } finally { setBusy(false); }
  };
  const del = async (r: Row) => {
    if (!confirm("Xóa mục này?")) return;
    await api(`${endpoint}/${r.id}`, { method: "DELETE" }); mutate(); toast("Đã xóa", "success");
  };
  const toLocal = (v: unknown) => (typeof v === "string" && v ? new Date(v).toISOString().slice(0, 16) : "");

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <button onClick={() => setEdit({ ...defaults })} className="btn-primary"><Plus size={18} />{addLabel}</button>
      </div>
      <div className="overflow-x-auto rounded-xl2 bg-white">
        {!data ? <Skeleton className="h-60" /> : (
          <table className="w-full min-w-[640px] text-sm">
            <thead className="border-b border-mist text-left text-graphite"><tr>{columns.map((c) => <th key={c.label} className="px-4 py-3 font-medium">{c.label}</th>)}<th /></tr></thead>
            <tbody className="divide-y divide-mist/70">
              {data.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => <td key={c.label} className="px-4 py-3">{c.render(r)}</td>)}
                  <td className="whitespace-nowrap pr-3 text-right">
                    <button onClick={() => setEdit({ ...r })} className="icon-btn inline-grid" aria-label="Sửa"><Pencil size={15} /></button>
                    <button onClick={() => del(r)} className="icon-btn inline-grid text-danger" aria-label="Xóa"><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {edit && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4" onClick={() => setEdit(null)}>
          <form onSubmit={save} onClick={(e) => e.stopPropagation()} className="max-h-[90vh] w-full max-w-lg space-y-4 overflow-y-auto rounded-xl2 bg-white p-6" role="dialog">
            <div className="flex items-center justify-between"><h2 className="text-xl font-bold">{edit.id ? "Sửa" : addLabel}</h2><button type="button" onClick={() => setEdit(null)} className="icon-btn" aria-label="Đóng"><X size={18} /></button></div>
            {fields.map((f) => {
              const v = edit[f.key];
              const set = (val: unknown) => setEdit({ ...edit, [f.key]: val });
              if (f.type === "checkbox") return <label key={f.key} className="flex items-center gap-3"><input type="checkbox" className="h-4 w-4 accent-cobalt" checked={!!v} onChange={(e) => set(e.target.checked)} />{f.label}</label>;
              return (
                <Field key={f.key} label={f.label} hint={f.hint}>
                  {f.type === "textarea" ? <textarea className="input min-h-28" required={f.required} value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} />
                    : f.type === "select" ? <select className="input" value={(v as string) ?? ""} onChange={(e) => set(e.target.value)}>{f.options!.map(([o, l]) => <option key={o} value={o}>{l}</option>)}</select>
                    : f.type === "number" ? <input className="input" type="number" required={f.required} value={(v as number) ?? 0} onChange={(e) => set(Number(e.target.value))} />
                    : f.type === "datetime" ? <input className="input" type="datetime-local" value={toLocal(v)} onChange={(e) => set(e.target.value ? new Date(e.target.value).toISOString() : null)} />
                    : f.type === "image" ? <ImageUploader multiple={false} value={v ? [v as string] : []} onChange={(x) => set(x[0] ?? null)} />
                    : <input className="input" required={f.required} value={(v as string) ?? ""} onChange={(e) => set(e.target.value)} />}
                </Field>
              );
            })}
            <button disabled={busy} className="btn-primary w-full">{busy && <Spinner />}Lưu</button>
          </form>
        </div>
      )}
    </div>
  );
}
