"use client";
import { useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, X, Maximize2 } from "lucide-react";
import Link from "next/link";
import ChatPanel from "./ChatPanel";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  if (path.startsWith("/admin") || path === "/tro-ly-ai") return null;
  return (
    <>
      {open && (
        <div className="chat-pop fixed bottom-24 right-4 z-[60] flex h-[min(600px,calc(100vh-140px))] w-[min(400px,calc(100vw-32px))] flex-col overflow-hidden rounded-xl3 border border-black/5 bg-white shadow-[0_24px_80px_-20px_rgba(0,0,0,0.35)]">
          <div className="flex items-center justify-between border-b border-black/5 px-4 py-3">
            <div>
              <p className="font-semibold">ReTech AI</p>
              <p className="text-xs text-graphite">Tư vấn máy theo hàng đang có</p>
            </div>
            <div className="flex gap-1">
              <Link href="/tro-ly-ai" className="icon-btn" aria-label="Mở toàn màn hình"><Maximize2 size={16} /></Link>
              <button onClick={() => setOpen(false)} className="icon-btn" aria-label="Đóng"><X size={18} /></button>
            </div>
          </div>
          <ChatPanel compact />
        </div>
      )}
      <button onClick={() => setOpen((o) => !o)} aria-label={open ? "Đóng trợ lý" : "Mở trợ lý AI"}
        className="fixed bottom-6 right-4 z-[60] flex h-14 items-center gap-2 rounded-full bg-ink pl-4 pr-5 text-white shadow-xl transition-transform hover:scale-105">
        {open ? <X size={20} /> : <MessageCircle size={20} />}
        <span className="text-sm font-semibold">{open ? "Đóng" : "Hỏi ReTech AI"}</span>
      </button>
    </>
  );
}
