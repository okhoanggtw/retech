"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { Sparkles, Plus, Trash2, X } from "lucide-react";
import { api, ApiError, fetcher } from "@/lib/api";
import { vnd } from "@/lib/format";
import { CONDITIONS, type AiPrice, type Page, type Product } from "@/lib/types";
import { Field, Spinner } from "../ui";
import { useToast } from "../Toast";
import ImageUploader from "./ImageUploader";

const CATS = [["dien-thoai", "Điện thoại"], ["laptop", "Laptop"], ["may-anh", "Máy ảnh"], ["tai-nghe", "Tai nghe"], ["dong-ho", "Đồng hồ"], ["phu-kien", "Phụ kiện"]];
const BRANDS = ["Apple", "Samsung", "Xiaomi", "Sony", "Canon", "ReTech"];

export default function ProductForm({ initial }: { initial?: Product }) {
  const router = useRouter();
  const toast = useToast();
  const [p, setP] = useState({
    name: initial?.name ?? "", slug: initial?.slug ?? "", category: initial?.category ?? "dien-thoai", brand: initial?.brand ?? "Apple",
    model: initial?.model ?? "", variant: initial?.variant ?? "", condition: initial?.condition ?? "EXCELLENT",
    batteryHealth: initial?.batteryHealth?.toString() ?? "", price: initial?.price?.toString() ?? "", originalPrice: initial?.originalPrice?.toString() ?? "",
    stock: initial?.stock?.toString() ?? "1", warrantyMonths: initial?.warrantyMonths?.toString() ?? "12", releaseYear: initial?.releaseYear?.toString() ?? "",
    description: initial?.description ?? "", featured: initial?.featured ?? false, active: initial?.active ?? true, freeShipping: initial?.freeShipping ?? false,
  });
  const [images, setImages] = useState<string[]>(initial?.images ?? []);
  const [specs, setSpecs] = useState<[string, string][]>(Object.entries(initial?.specs ?? { "Màn hình": "", Chip: "" }));
  const [highlights, setHighlights] = useState((initial?.highlights ?? []).join("\n"));
  const [tags, setTags] = useState((initial?.tags ?? []).join(", "));
  const [ai, setAi] = useState<AiPrice | null>(initial?.aiSuggestion ?? null);
  const [addOnIds, setAddOnIds] = useState<string[]>(initial?.addOnIds ?? []);
  const [err, setErr] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [aiBusy, setAiBusy] = useState(false);
  const set = (k: keyof typeof p) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setP({ ...p, [k]: e.target.value });
  const num = (s: string) => (s ? Number(s.replace(/\D/g, "")) : 0);

  const suggest = async () => {
    setAiBusy(true);
    try {
      setAi(await api<AiPrice>("/api/admin/products/ai-suggest", { method: "POST", json: {
        category: p.category, brand: p.brand, model: p.model || p.name, storage: p.variant, purchaseYear: p.releaseYear ? num(p.releaseYear) : null,
        condition: p.condition, batteryHealth: p.batteryHealth ? num(p.batteryHealth) : null, issues: [], accessories: ["Hộp", "Sạc"],
        referenceNewPrice: p.originalPrice ? num(p.originalPrice) : null,
      } }));
    } catch (e) { toast((e as Error).message, "error"); } finally { setAiBusy(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr({});
    const body = {
      ...p, slug: p.slug || null, batteryHealth: p.batteryHealth ? num(p.batteryHealth) : null, price: num(p.price), originalPrice: num(p.originalPrice),
      stock: num(p.stock), warrantyMonths: num(p.warrantyMonths), releaseYear: num(p.releaseYear), images,
      specs: Object.fromEntries(specs.filter(([k, v]) => k.trim() && v.trim())),
      highlights: highlights.split("\n").map((x) => x.trim()).filter(Boolean),
      tags: tags.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean), addOnIds,
    };
    try {
      await api(initial ? `/api/admin/products/${initial.id}` : "/api/admin/products", { method: initial ? "PUT" : "POST", json: body });
      toast(initial ? "Đã lưu thay đổi" : "Đã thêm sản phẩm", "success");
      router.push("/admin/san-pham");
    } catch (e) { setErr((e as ApiError).details ?? {}); toast((e as Error).message, "error"); setBusy(false); }
  };

  return (
    <form onSubmit={save} className="grid gap-6 xl:grid-cols-[1fr_360px]">
      <div className="space-y-6">
        <section className="card space-y-4">
          <h2 className="font-bold">Thông tin cơ bản</h2>
          <Field label="Tên sản phẩm" error={err.name}><input className="input" required value={p.name} onChange={set("name")} placeholder="iPhone 15 Pro Max" /></Field>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Danh mục"><select className="input" value={p.category} onChange={set("category")}>{CATS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></Field>
            <Field label="Hãng"><select className="input" value={p.brand} onChange={set("brand")}>{BRANDS.map((b) => <option key={b}>{b}</option>)}</select></Field>
            <Field label="Model (để AI so sánh)"><input className="input" value={p.model} onChange={set("model")} placeholder="iPhone 15 Pro Max" /></Field>
            <Field label="Phiên bản / màu"><input className="input" value={p.variant} onChange={set("variant")} placeholder="256GB - Titan Tự Nhiên" /></Field>
            <Field label="Năm ra mắt"><input className="input" inputMode="numeric" value={p.releaseYear} onChange={set("releaseYear")} /></Field>
            <Field label="Đường dẫn (slug)" hint="Để trống = tự tạo"><input className="input" value={p.slug} onChange={set("slug")} /></Field>
          </div>
        </section>
        <section className="card space-y-4">
          <h2 className="font-bold">Tình trạng và giá</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <Field label="Tình trạng"><select className="input" value={p.condition} onChange={set("condition")}>{CONDITIONS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}</select></Field>
            <Field label="Pin (%)"><input className="input" inputMode="numeric" value={p.batteryHealth} onChange={set("batteryHealth")} placeholder="Bỏ trống nếu không có" /></Field>
            <Field label="Bảo hành (tháng)"><input className="input" inputMode="numeric" value={p.warrantyMonths} onChange={set("warrantyMonths")} /></Field>
            <Field label="Giá bán (₫)" error={err.price}><input className="input" required inputMode="numeric" value={p.price} onChange={set("price")} /></Field>
            <Field label="Giá máy mới (₫)"><input className="input" inputMode="numeric" value={p.originalPrice} onChange={set("originalPrice")} /></Field>
            <Field label="Tồn kho" error={err.stock}><input className="input" inputMode="numeric" value={p.stock} onChange={set("stock")} /></Field>
          </div>
        </section>
        <section className="card space-y-4">
          <h2 className="font-bold">Ảnh sản phẩm</h2>
          <ImageUploader value={images} onChange={setImages} />
        </section>
        <section className="card space-y-4">
          <h2 className="font-bold">Thông số</h2>
          {specs.map(([k, v], i) => (
            <div key={i} className="flex gap-2">
              <input className="input w-40 py-2" value={k} onChange={(e) => setSpecs(specs.map((s, j) => (j === i ? [e.target.value, s[1]] : s)))} placeholder="Tên" aria-label="Tên thông số" />
              <input className="input py-2" value={v} onChange={(e) => setSpecs(specs.map((s, j) => (j === i ? [s[0], e.target.value] : s)))} placeholder="Giá trị" aria-label="Giá trị" />
              <button type="button" onClick={() => setSpecs(specs.filter((_, j) => j !== i))} className="icon-btn shrink-0" aria-label="Xóa dòng"><Trash2 size={16} /></button>
            </div>
          ))}
          <button type="button" onClick={() => setSpecs([...specs, ["", ""]])} className="link inline-flex items-center gap-1 text-sm"><Plus size={14} />Thêm thông số</button>
          <Field label="Điểm nổi bật" hint="Mỗi dòng một ý"><textarea className="input min-h-24" value={highlights} onChange={(e) => setHighlights(e.target.value)} /></Field>
          <Field label="Mô tả"><textarea className="input min-h-24" value={p.description} onChange={set("description")} /></Field>
          <Field label="Từ khóa tìm kiếm" hint="Cách nhau dấu phẩy, giúp chatbot tìm đúng (vd: sinh vien, chup anh)"><input className="input" value={tags} onChange={(e) => setTags(e.target.value)} /></Field>
        </section>
        <AddOnPicker selfId={initial?.id} value={addOnIds} onChange={setAddOnIds} />
      </div>

      <aside className="space-y-4 xl:sticky xl:top-20 xl:self-start">
        <div className="card space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold">AI gợi ý giá bán</h2>
            <button type="button" onClick={suggest} disabled={aiBusy || !p.name} className="btn-dark px-4 py-2 text-sm">{aiBusy ? <Spinner /> : <Sparkles size={15} />}Gợi ý</button>
          </div>
          {ai ? (
            <div className="text-sm">
              <p className="text-2xl font-extrabold">{vnd(ai.suggestedPrice)}</p>
              <p className="text-graphite">Khoảng {vnd(ai.minPrice)} – {vnd(ai.maxPrice)} · {ai.source === "GEMINI" ? "Gemini" : "Công thức"}</p>
              <p className="mt-2 leading-relaxed text-graphite">{ai.explanation}</p>
              <button type="button" onClick={() => setP({ ...p, price: String(ai.suggestedPrice) })} className="link mt-2">Dùng giá này</button>
            </div>
          ) : <p className="text-sm text-graphite">Điền danh mục, hãng, model, tình trạng và giá máy mới rồi bấm Gợi ý.</p>}
        </div>
        <div className="card space-y-3">
          <label className="flex items-center gap-3"><input type="checkbox" checked={p.featured} onChange={(e) => setP({ ...p, featured: e.target.checked })} className="h-4 w-4 accent-cobalt" />Hiển thị ở mục nổi bật</label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={p.freeShipping} onChange={(e) => setP({ ...p, freeShipping: e.target.checked })} className="h-4 w-4 accent-cobalt" />Miễn phí giao hàng</label>
          <label className="flex items-center gap-3"><input type="checkbox" checked={p.active} onChange={(e) => setP({ ...p, active: e.target.checked })} className="h-4 w-4 accent-cobalt" />Đang bán</label>
          <button disabled={busy} className="btn-primary w-full">{busy && <Spinner />}{initial ? "Lưu thay đổi" : "Thêm sản phẩm"}</button>
        </div>
      </aside>
    </form>
  );
}

/** Chọn sản phẩm hiện ở mục "Thường mua kèm". Bỏ trống = hệ thống tự gợi ý theo đơn hàng và danh mục. */
function AddOnPicker({ selfId, value, onChange }: { selfId?: string; value: string[]; onChange: (v: string[]) => void }) {
  const { data } = useSWR<Page<Product>>("/api/products?size=60&sort=bestseller", fetcher);
  const [q, setQ] = useState("");
  const all = (data?.content ?? []).filter((x) => x.id !== selfId);
  const byId = new Map(all.map((x) => [x.id, x]));
  const key = q.trim().toLowerCase();
  const found = key ? all.filter((x) => !value.includes(x.id) && `${x.name} ${x.variant ?? ""} ${x.brand}`.toLowerCase().includes(key)).slice(0, 6) : [];
  return (
    <section className="card space-y-4">
      <div>
        <h2 className="font-bold">Sản phẩm mua kèm</h2>
        <p className="text-sm text-graphite">Hiện ở mục “Thường mua kèm” trên trang sản phẩm (tối đa 4). Bỏ trống thì hệ thống tự gợi ý.</p>
      </div>
      {value.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {value.map((id) => (
            <li key={id} className="chip chip-on inline-flex items-center gap-1.5">
              {byId.get(id)?.name ?? "Sản phẩm đã ẩn"}
              <button type="button" onClick={() => onChange(value.filter((x) => x !== id))} aria-label="Bỏ"><X size={14} /></button>
            </li>
          ))}
        </ul>
      )}
      {value.length < 4 && (
        <div>
          <input className="input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Gõ tên để tìm, vd: khăn lau, AirPods" aria-label="Tìm sản phẩm mua kèm" />
          {found.length > 0 && (
            <ul className="mt-2 divide-y divide-mist/70 rounded-xl border border-mist">
              {found.map((x) => (
                <li key={x.id}>
                  <button type="button" onClick={() => { onChange([...value, x.id]); setQ(""); }} className="flex w-full justify-between gap-3 px-4 py-2.5 text-left text-sm hover:bg-paper">
                    <span>{x.name} <span className="text-graphite">{x.variant}</span></span><span className="tabular-nums">{vnd(x.price)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  );
}
