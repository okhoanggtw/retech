"use client";
import { createContext, useCallback, useContext, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";

type Tone = "info" | "success" | "error";
const Ctx = createContext<(msg: string, tone?: Tone) => void>(() => {});

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<{ id: number; msg: string; tone: Tone }[]>([]);
  const push = useCallback((msg: string, tone: Tone = "info") => {
    const id = Date.now() + Math.random();
    setItems((x) => [...x, { id, msg, tone }]);
    setTimeout(() => setItems((x) => x.filter((i) => i.id !== id)), 3200);
  }, []);
  return (
    <Ctx.Provider value={push}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 top-16 z-[100] flex flex-col items-center gap-2 px-4" aria-live="polite">
        {items.map((t) => (
          <div key={t.id} className="toast-in pointer-events-auto flex items-center gap-2 rounded-full bg-ink/90 px-5 py-3 text-sm text-white shadow-lg backdrop-blur">
            {t.tone === "success" ? <CheckCircle2 size={18} className="text-[#4ADE80]" /> : t.tone === "error" ? <AlertCircle size={18} className="text-[#FF6B6B]" /> : <Info size={18} />}
            {t.msg}
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}
export const useToast = () => useContext(Ctx);
