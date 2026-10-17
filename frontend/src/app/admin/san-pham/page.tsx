"use client";
import { useState } from "react";
import Link from "next/link";
import useSWR from "swr";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { api, fetcher } from "@/lib/api";
import { vnd } from "@/lib/format";
import { conditionOf, type Page, type Product } from "@/lib/types";
import ProductImage from "@/components/ProductImage";
import { Badge, Skeleton } from "@/components/ui";
import { useToast } from "@/components/Toast";

export default function AdminProducts() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("");
  const [page, setPage] = useState(0);
  const toast = useToast();
  const key = `/api/admin/products?q=${encodeURIComponent(q)}&category=${cat}&page=${page}&size=20`;
  const { data, mutate } = useSWR<Page<Product>>(key, fetcher, { keepPreviousData: true });

  const del = async (p: Product) => {
    if (!confirm(`Xóa "${p.name}"? Thao tác không thể hoàn tác.`)) return;
    try { await api(`/api/admin/products/${p.id}`, { method: "DELETE" }); toast("Đã xóa sản phẩm", "success"); mutate(); }
    catch (e) { toast((e as Error).message, "error"); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-3xl font-bold tracking-tight">Sản phẩm</h1>
        <Link href="/admin/san-pham/moi" className="btn-primary"><Plus size={18} />Thêm sản phẩm</Link>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-60 flex-1"><Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-graphite" />
          <input className="input pl-10" value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Tìm theo tên, hãng, model" aria-label="Tìm sản phẩm" /></div>
        <select className="input w-auto" value={cat} onChange={(e) => { setCat(e.target.value); setPage(0); }} aria-label="Danh mục">
          <option value="">Tất cả danh mục</option>
          {[["dien-thoai", "Điện thoại"], ["laptop", "Laptop"], ["may-anh", "Máy ảnh"], ["tai-nghe", "Tai nghe"], ["dong-ho", "Đồng hồ"], ["phu-kien", "Phụ kiện"]].map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
      </div>
      <div className="overflow-x-auto rounded-xl2 bg-white">
        {!data ? <Skeleton className="h-96" /> : (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="border-b border-mist text-left text-graphite"><tr>
              <th className="px-4 py-3 font-medium">Sản phẩm</th><th className="font-medium">Tình trạng</th><th className="text-right font-medium">Giá bán</th>
              <th className="text-right font-medium">Kho</th><th className="text-right font-medium">Đã bán</th><th className="pl-4 font-medium">Trạng thái</th><th />
            </tr></thead>
            <tbody className="divide-y divide-mist/70">
              {data.content.map((p) => (
                <tr key={p.id}>
                  <td className="px-4 py-3"><div className="flex items-center gap-3"><ProductImage p={p} className="h-11 w-14 shrink-0" />
                    <div><p className="font-medium">{p.name}</p><p className="text-xs text-graphite">{p.variant}</p></div></div></td>
                  <td>{conditionOf(p.condition)?.label}</td>
                  <td className="text-right tabular-nums">{vnd(p.price)}</td>
                  <td className={`text-right tabular-nums ${p.stock <= 1 ? "font-semibold text-danger" : ""}`}>{p.stock}</td>
                  <td className="text-right tabular-nums">{p.soldCount}</td>
                  <td className="pl-4">{p.active ? <Badge tone="bg-grade-soft text-grade">Đang bán</Badge> : <Badge tone="bg-paper text-graphite">Ẩn</Badge>}</td>
                  <td className="pr-3 text-right whitespace-nowrap">
                    <Link href={`/admin/san-pham/${p.id}`} className="icon-btn inline-grid" aria-label={`Sửa ${p.name}`}><Pencil size={15} /></Link>
                    <button onClick={() => del(p)} className="icon-btn inline-grid text-danger" aria-label={`Xóa ${p.name}`}><Trash2 size={15} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {data && data.totalPages > 1 && (
        <div className="flex justify-center gap-2">{Array.from({ length: data.totalPages }).map((_, i) => <button key={i} onClick={() => setPage(i)} className={`h-9 w-9 rounded-full text-sm ${i === page ? "bg-ink text-white" : "bg-white"}`}>{i + 1}</button>)}</div>
      )}
    </div>
  );
}
