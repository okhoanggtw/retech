"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowUp, Sparkles } from "lucide-react";
import { api } from "@/lib/api";
import { vnd } from "@/lib/format";
import ProductImage from "./ProductImage";
import type { ChatMsg, Product } from "@/lib/types";

const STORAGE = "retech_chat";
const GREETING: ChatMsg = {
  role: "model",
  content: "Chào bạn 👋 Mình là **ReTech AI**. Bạn cần tìm máy gì, ngân sách bao nhiêu? Mình gợi ý ngay từ hàng đang có sẵn.",
  suggestions: ["Điện thoại chụp ảnh đẹp dưới 15 triệu", "Laptop cho sinh viên IT", "Tai nghe chống ồn tốt nhất"],
};

/** Hien thi **dam** va gach dau dong don gian */
function Rich({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, i) => {
        const bullet = /^\s*[-*•]\s+/.test(line);
        const parts = line.replace(/^\s*[-*•]\s+/, "").split(/(\*\*[^*]+\*\*)/g).map((p, j) =>
          p.startsWith("**") ? <strong key={j}>{p.slice(2, -2)}</strong> : <span key={j}>{p}</span>);
        return bullet ? <p key={i} className="pl-4 -indent-3">• {parts}</p> : <p key={i} className={line ? "" : "h-2"}>{parts}</p>;
      })}
    </>
  );
}

export default function ChatPanel({ compact = false }: { compact?: boolean }) {
  const [msgs, setMsgs] = useState<ChatMsg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const sessionId = useRef<string>("");
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(STORAGE);
      if (saved) setMsgs(JSON.parse(saved));
      sessionId.current = sessionStorage.getItem(STORAGE + "_id") || crypto.randomUUID();
      sessionStorage.setItem(STORAGE + "_id", sessionId.current);
    } catch { sessionId.current = String(Date.now()); }
  }, []);
  useEffect(() => {
    try { sessionStorage.setItem(STORAGE, JSON.stringify(msgs.slice(-30))); } catch {}
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [msgs]);

  const send = async (text: string) => {
    const t = text.trim();
    if (!t || busy) return;
    const next: ChatMsg[] = [...msgs, { role: "user", content: t }];
    setMsgs(next); setInput(""); setBusy(true);
    try {
      const r = await api<{ reply: string; products: Product[]; suggestions: string[] }>("/api/ai/chat", {
        method: "POST",
        json: { sessionId: sessionId.current, messages: next.map((m) => ({ role: m.role, content: m.content })) },
      });
      setMsgs([...next, { role: "model", content: r.reply, products: r.products, suggestions: r.suggestions }]);
    } catch (e) {
      setMsgs([...next, { role: "model", content: (e as Error).message }]);
    } finally { setBusy(false); }
  };

  const last = msgs[msgs.length - 1];
  return (
    <div className="flex h-full flex-col">
      <div className={`flex-1 space-y-4 overflow-y-auto ${compact ? "p-4" : "p-2 md:p-4"}`}>
        {msgs.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : ""}>
            <div className={`max-w-[88%] space-y-1 rounded-2xl px-4 py-3 text-[15px] leading-relaxed ${m.role === "user" ? "bg-cobalt text-white" : "bg-paper text-ink"}`}>
              <Rich text={m.content} />
            </div>
            {!!m.products?.length && (
              <div className="mt-2 grid max-w-[88%] gap-2">
                {m.products.map((p) => (
                  <Link key={p.id} href={`/san-pham/${p.slug}`} className="flex items-center gap-3 rounded-xl border border-black/5 bg-white p-2 pr-4 hover:border-cobalt">
                    <ProductImage p={p} className="h-14 w-16 shrink-0" />
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold">{p.name}</p>
                      <p className="text-sm text-graphite">{vnd(p.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        ))}
        {busy && (
          <div className="inline-flex items-center gap-2 rounded-2xl bg-paper px-4 py-3 text-sm text-graphite">
            <Sparkles size={15} className="animate-pulse text-cobalt" /> Đang tìm máy phù hợp…
          </div>
        )}
        {!busy && !!last?.suggestions?.length && last.role === "model" && (
          <div className="flex flex-wrap gap-2">
            {last.suggestions.map((s) => (
              <button key={s} onClick={() => send(s)} className="rounded-full border border-cobalt/30 px-3 py-1.5 text-sm text-cobalt hover:bg-cobalt-soft">{s}</button>
            ))}
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="border-t border-black/5 p-3">
        <div className="flex items-center gap-2 rounded-full bg-paper py-1.5 pl-4 pr-1.5">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Hỏi về máy, giá, bảo hành…" aria-label="Tin nhắn"
            className="w-full bg-transparent text-[15px] outline-none placeholder:text-graphite" maxLength={500} />
          <button type="submit" disabled={busy || !input.trim()} aria-label="Gửi"
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-cobalt text-white disabled:bg-mist"><ArrowUp size={17} /></button>
        </div>
      </form>
    </div>
  );
}
