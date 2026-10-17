"use client";
import { useState } from "react";
import useSWR from "swr";
import { Plus } from "lucide-react";
import Link from "next/link";
import { fetcher } from "@/lib/api";
import type { Faq } from "@/lib/types";
import { PageTitle, Skeleton } from "@/components/ui";

export default function FaqPage() {
  const { data } = useSWR<Faq[]>("/api/content/faqs", fetcher);
  const [open, setOpen] = useState<string | null>(null);
  return (
    <>
      <PageTitle title="Câu hỏi thường gặp." sub="Không thấy câu trả lời bạn cần? Hỏi ReTech AI ở góc phải màn hình hoặc gửi liên hệ." />
      <div className="mx-auto max-w-3xl px-4 pb-20">
        {!data ? <Skeleton className="h-80" /> : (
          <div className="divide-y divide-mist rounded-xl2 bg-white px-6">
            {data.map((f) => {
              const id = f.id ?? f.question, on = open === id;
              return (
                <div key={id}>
                  <button onClick={() => setOpen(on ? null : id)} aria-expanded={on} className="flex w-full items-center justify-between gap-4 py-5 text-left text-lg font-semibold">
                    {f.question}
                    <Plus size={20} className={`shrink-0 transition-transform duration-300 ${on ? "rotate-45" : ""}`} />
                  </button>
                  <div className={`grid transition-[grid-template-rows] duration-300 ${on ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}>
                    <p className="overflow-hidden pb-0 leading-relaxed text-graphite">{f.answer}<span className="block h-5" /></p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <p className="mt-8 text-center text-graphite">Vẫn cần hỗ trợ? <Link href="/lien-he" className="link">Liên hệ ReTech</Link></p>
      </div>
    </>
  );
}
