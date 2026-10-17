"use client";
import { useState } from "react";
import { Upload, X } from "lucide-react";
import { api, imgUrl } from "@/lib/api";
import { Spinner } from "../ui";

export default function ImageUploader({ value, onChange, multiple = true }: { value: string[]; onChange: (v: string[]) => void; multiple?: boolean }) {
  const [busy, setBusy] = useState(false);
  const [url, setUrl] = useState("");
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true);
    const out: string[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData(); fd.append("file", f);
      try { out.push((await api<{ url: string }>("/api/admin/uploads", { method: "POST", body: fd })).url); } catch (e) { alert((e as Error).message); }
    }
    onChange(multiple ? [...value, ...out] : out.slice(0, 1));
    setBusy(false);
  };
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {value.map((v, i) => (
          <div key={v + i} className="relative h-20 w-20 rounded-xl border border-mist bg-white p-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imgUrl(v)} alt="" className="h-full w-full object-contain" />
            <button type="button" onClick={() => onChange(value.filter((_, j) => j !== i))} className="absolute -right-2 -top-2 grid h-5 w-5 place-items-center rounded-full bg-ink text-white" aria-label="Xóa ảnh"><X size={12} /></button>
          </div>
        ))}
        <label className="grid h-20 w-20 cursor-pointer place-items-center rounded-xl border-2 border-dashed border-mist text-graphite hover:border-cobalt hover:text-cobalt">
          {busy ? <Spinner /> : <Upload size={18} />}
          <input type="file" accept="image/*" multiple={multiple} className="sr-only" onChange={(e) => upload(e.target.files)} />
        </label>
      </div>
      <div className="mt-2 flex gap-2">
        <input className="input py-2 text-sm" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="Hoặc dán link ảnh https://…" />
        <button type="button" onClick={() => { if (url) { onChange(multiple ? [...value, url] : [url]); setUrl(""); } }} className="btn-ghost shrink-0 px-4 py-2 text-sm">Thêm</button>
      </div>
    </div>
  );
}
