"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import useSWR from "swr";
import gsap from "gsap";
import { Sparkles, Check } from "lucide-react";
import { api, ApiError, fetcher } from "@/lib/api";
import { vnd } from "@/lib/format";
import { useAuth } from "@/lib/auth";
import { CONDITIONS, type AiPrice, type Condition, type Page, type Product } from "@/lib/types";
import { Field, Spinner } from "@/components/ui";
import DeviceArt from "@/components/DeviceArt";

const CATS = [
  { slug: "dien-thoai", name: "Điện thoại", brands: ["Apple", "Samsung", "Xiaomi"], battery: true },
  { slug: "laptop", name: "Laptop", brands: ["Apple", "Samsung", "Xiaomi"], battery: true },
  { slug: "may-anh", name: "Máy ảnh", brands: ["Sony", "Canon"], battery: false },
  { slug: "tai-nghe", name: "Tai nghe", brands: ["Apple", "Sony", "Samsung", "Xiaomi"], battery: false },
  { slug: "dong-ho", name: "Đồng hồ", brands: ["Apple", "Samsung", "Xiaomi"], battery: true },
];
const ISSUES = ["Màn hình ám/sọc/chấm", "Face ID / vân tay lỗi", "Camera / ống kính lỗi", "Loa / mic rè", "Đã thay linh kiện", "Bể kính lưng"];
const ACCS = ["Hộp", "Sạc / cáp", "Hóa đơn", "Phụ kiện kèm theo"];
const YEAR = new Date().getFullYear();

function CountUp({ value }: { value: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const o = { v: 0 };
    const t = gsap.to(o, { v: value, duration: 1.2, ease: "power3.out", onUpdate: () => { if (ref.current) ref.current.textContent = vnd(Math.round(o.v / 100000) * 100000); } });
    return () => { t.kill(); };
  }, [value]);
  return <span ref={ref}>{vnd(value)}</span>;
}

export default function TradeInPage() {
  const { user } = useAuth();
  const [cat, setCat] = useState(CATS[0]);
  const [d, setD] = useState({ brand: "Apple", model: "", storage: "", purchaseYear: YEAR - 2, condition: "GOOD" as Condition, batteryHealth: 88, referenceNewPrice: "" , note: ""});
  const [issues, setIssues] = useState<string[]>([]);
  const [accs, setAccs] = useState<string[]>(["Hộp", "Sạc / cáp"]);
  const [res, setRes] = useState<AiPrice | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const [contact, setContact] = useState({ contactName: "", contactPhone: "", contactEmail: "" });
  const [sent, setSent] = useState(false);
  const resRef = useRef<HTMLDivElement>(null);

  const { data: models } = useSWR<Page<Product>>(`/api/products?category=${cat.slug}&brand=${d.brand}&size=60`, fetcher);
  const modelList = useMemo(() => Array.from(new Set((models?.content ?? []).map((p) => p.model || p.name))), [models]);

  useEffect(() => { if (user) setContact((c) => ({ contactName: c.contactName || user.fullName, contactPhone: c.contactPhone || user.phone || "", contactEmail: c.contactEmail || user.email })); }, [user]);

  const device = () => ({
    category: cat.slug, brand: d.brand, model: d.model, storage: d.storage || null, purchaseYear: d.purchaseYear,
    condition: d.condition, batteryHealth: cat.battery ? d.batteryHealth : null, issues, accessories: accs,
    referenceNewPrice: d.referenceNewPrice ? Number(d.referenceNewPrice.replace(/\D/g, "")) : null, note: d.note || null,
  });

  const estimate = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr(""); setRes(null); setSent(false);
    try {
      setRes(await api<AiPrice>("/api/ai/price-estimate", { method: "POST", json: device() }));
      setTimeout(() => resRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    } catch (e) { setErr((e as ApiError).message); } finally { setBusy(false); }
  };
  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setBusy(true); setErr("");
    try { await api("/api/trade-ins", { method: "POST", json: { device: device(), ...contact } }); setSent(true); }
    catch (e) { setErr((e as ApiError).message); } finally { setBusy(false); }
  };
  const toggle = (list: string[], set: (x: string[]) => void, v: string) => set(list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  return (
    <>
      <section className="bg-black text-white">
        <div className="mx-auto grid max-w-page items-center gap-8 px-4 py-16 md:grid-cols-[1.2fr_1fr] md:px-6 md:py-24">
          <div>
            <h1 className="text-5xl font-extrabold tracking-tightest md:text-7xl">Bán máy cũ.<br /><span className="text-white/55">Biết giá ngay.</span></h1>
            <p className="mt-5 max-w-lg text-lg text-white/70">AI của ReTech so sánh máy của bạn với giá các máy cùng đời đang bán, tính khấu hao theo tuổi, ngoại hình, pin và lỗi. Kết quả có lý do cụ thể, không phải con số đoán mò.</p>
          </div>
          <DeviceArt category={cat.slug} variant="Bạc" className="mx-auto h-56 w-full max-w-sm" />
        </div>
      </section>

      <div className="mx-auto grid max-w-page gap-8 px-4 py-12 md:grid-cols-[1fr_420px] md:px-6">
        <form onSubmit={estimate} className="space-y-6">
          <section className="card space-y-5">
            <h2 className="text-xl font-bold">Máy của bạn</h2>
            <div className="flex flex-wrap gap-2">
              {CATS.map((c) => <button type="button" key={c.slug} onClick={() => { setCat(c); setD({ ...d, brand: c.brands[0], model: "" }); }} className={`chip ${cat.slug === c.slug ? "chip-on" : ""}`}>{c.name}</button>)}
            </div>
            <div className="flex flex-wrap gap-2">
              {cat.brands.map((b) => <button type="button" key={b} onClick={() => setD({ ...d, brand: b, model: "" })} className={`chip ${d.brand === b ? "chip-on" : ""}`}>{b}</button>)}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Tên model" hint="Gõ hoặc chọn gợi ý">
                <input className="input" required list="models" value={d.model} onChange={(e) => setD({ ...d, model: e.target.value })} placeholder={cat.slug === "dien-thoai" ? "iPhone 14 Pro Max" : "Model"} />
                <datalist id="models">{modelList.map((m) => <option key={m} value={m} />)}</datalist>
              </Field>
              <Field label="Phiên bản / dung lượng"><input className="input" value={d.storage} onChange={(e) => setD({ ...d, storage: e.target.value })} placeholder="256GB" /></Field>
              <Field label="Năm mua">
                <select className="input" value={d.purchaseYear} onChange={(e) => setD({ ...d, purchaseYear: Number(e.target.value) })}>
                  {Array.from({ length: 9 }).map((_, i) => <option key={i} value={YEAR - i}>{YEAR - i}</option>)}
                </select>
              </Field>
              <Field label="Giá máy mới tham khảo (không bắt buộc)" hint="Điền nếu model chưa có trong dữ liệu">
                <input className="input" inputMode="numeric" value={d.referenceNewPrice} onChange={(e) => setD({ ...d, referenceNewPrice: e.target.value })} placeholder="VD: 25000000" />
              </Field>
            </div>
          </section>

          <section className="card space-y-5">
            <h2 className="text-xl font-bold">Tình trạng</h2>
            <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3" role="radiogroup">
              {CONDITIONS.map((c) => (
                <button type="button" role="radio" aria-checked={d.condition === c.value} key={c.value} onClick={() => setD({ ...d, condition: c.value })}
                  className={`rounded-xl border-2 p-3 text-left text-sm ${d.condition === c.value ? "border-cobalt bg-cobalt-soft/40" : "border-mist"}`}>
                  <b>{c.label}</b>
                </button>
              ))}
            </div>
            {cat.battery && (
              <Field label={`Dung lượng pin: ${d.batteryHealth}%`}>
                <input type="range" min={60} max={100} value={d.batteryHealth} onChange={(e) => setD({ ...d, batteryHealth: Number(e.target.value) })} className="w-full accent-cobalt" />
              </Field>
            )}
            <div>
              <p className="mb-2 text-sm font-medium">Lỗi đang gặp (nếu có)</p>
              <div className="flex flex-wrap gap-2">{ISSUES.map((i) => <button type="button" key={i} onClick={() => toggle(issues, setIssues, i)} className={`chip ${issues.includes(i) ? "chip-on" : ""}`} aria-pressed={issues.includes(i)}>{i}</button>)}</div>
            </div>
            <div>
              <p className="mb-2 text-sm font-medium">Phụ kiện còn giữ</p>
              <div className="flex flex-wrap gap-2">{ACCS.map((i) => <button type="button" key={i} onClick={() => toggle(accs, setAccs, i)} className={`chip ${accs.includes(i) ? "chip-on" : ""}`} aria-pressed={accs.includes(i)}>{i}</button>)}</div>
            </div>
          </section>
          {err && <p className="rounded-xl bg-danger-soft px-4 py-3 text-sm text-danger" role="alert">{err}</p>}
          <button disabled={busy} className="btn-primary w-full md:w-auto">{busy ? <Spinner /> : <Sparkles size={18} />}{busy ? "AI đang phân tích…" : "Định giá bằng AI"}</button>
        </form>

        <aside ref={resRef} className="md:sticky md:top-20 md:self-start">
          {!res ? (
            <div className="rounded-xl2 border-2 border-dashed border-mist p-8 text-center text-graphite">
              <Sparkles className="mx-auto text-cobalt" />
              <p className="mt-3">Điền thông tin máy rồi bấm <b className="text-ink">Định giá bằng AI</b>. Kết quả hiện ở đây.</p>
            </div>
          ) : (
            <div className="rounded-xl2 bg-white p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-graphite">ReTech có thể thu mua</p>
                <span className="rounded-full bg-cobalt-soft px-2.5 py-0.5 text-xs font-semibold text-cobalt">{res.source === "GEMINI" ? "Gemini AI" : "Công thức nội bộ"}</span>
              </div>
              <p className="mt-2 text-3xl font-extrabold tracking-tight md:text-4xl"><CountUp value={res.buyPriceLow} /></p>
              <p className="text-lg font-semibold text-graphite">đến {vnd(res.buyPriceHigh)}</p>
              <p className="mt-3 text-sm text-graphite">Giá bán lại ước tính {vnd(res.minPrice)} – {vnd(res.maxPrice)} · Độ tin cậy {Math.round(res.confidence * 100)}%</p>
              <ul className="mt-5 space-y-2 border-t border-mist pt-4 text-sm">
                {res.factors.map((f) => (
                  <li key={f.name} className="flex justify-between gap-3"><span><b>{f.name}</b> <span className="text-graphite">{f.note}</span></span><span className={`shrink-0 font-semibold tabular-nums ${f.impact.startsWith("+") ? "text-grade" : f.impact.startsWith("-") || f.impact.startsWith("−") ? "text-danger" : ""}`}>{f.impact}</span></li>
                ))}
              </ul>
              <p className="mt-4 text-sm leading-relaxed text-graphite">{res.explanation}</p>

              {sent ? (
                <div className="mt-6 flex items-start gap-3 rounded-xl bg-grade-soft p-4 text-sm text-grade"><Check size={18} className="mt-0.5 shrink-0" />Đã gửi yêu cầu. Nhân viên ReTech sẽ gọi cho bạn trong vòng 30 phút (giờ làm việc).</div>
              ) : (
                <form onSubmit={submit} className="mt-6 space-y-3 border-t border-mist pt-5">
                  <p className="font-semibold">Gửi yêu cầu bán máy</p>
                  <input className="input" required placeholder="Họ tên" value={contact.contactName} onChange={(e) => setContact({ ...contact, contactName: e.target.value })} aria-label="Họ tên" />
                  <input className="input" required type="tel" placeholder="Số điện thoại" value={contact.contactPhone} onChange={(e) => setContact({ ...contact, contactPhone: e.target.value })} aria-label="Số điện thoại" />
                  <button disabled={busy} className="btn-dark w-full">Gửi yêu cầu bán máy</button>
                </form>
              )}
            </div>
          )}
        </aside>
      </div>
    </>
  );
}
