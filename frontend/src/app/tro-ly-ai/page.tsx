import ChatPanel from "@/components/ChatPanel";
export const metadata = { title: "Trợ lý AI" };

export default function AiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pt-12 md:pt-16">
      <h1 className="text-4xl font-bold tracking-tightest md:text-6xl">ReTech AI.</h1>
      <p className="mt-3 text-lg text-graphite">Kể nhu cầu và ngân sách, trợ lý gợi ý đúng những máy đang có hàng, kèm giá thật.</p>
      <div className="mt-8 h-[min(640px,calc(100svh-260px))] overflow-hidden rounded-xl3 bg-white">
        <ChatPanel />
      </div>
      <div className="h-16" />
    </div>
  );
}
