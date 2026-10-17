import { conditionOf, type Condition } from "@/lib/types";

/** Vong tron tinh trang may - "dau an" thiet ke cua ReTech */
export default function GradeRing({ condition, size = 44, showLabel = false }: { condition: Condition; size?: number; showLabel?: boolean }) {
  const c = conditionOf(condition);
  const pct = c?.percent ?? 90;
  const r = 16, len = 2 * Math.PI * r;
  const color = pct >= 95 ? "#12A150" : pct >= 90 ? "#2F4BFF" : "#C77C02";
  return (
    <div className="flex items-center gap-2" title={c?.label}>
      <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
        <circle cx="20" cy="20" r={r} fill="none" stroke="#E5E5EA" strokeWidth="4" />
        <circle cx="20" cy="20" r={r} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round"
          strokeDasharray={`${(len * pct) / 100} ${len}`} transform="rotate(-90 20 20)" />
        <text x="20" y="24" textAnchor="middle" fontSize="11" fontWeight="700" fill="#1D1D1F">{pct}</text>
      </svg>
      {showLabel && <span className="text-sm text-graphite">{c?.label}</span>}
    </div>
  );
}
