"use client";
import { useId } from "react";
/**
 * Hinh minh hoa thiet bi chung (khong mo phong thiet ke cua hang nao) dung khi san pham chua co anh that.
 * Mau lay theo ten bien the (Den, Trang, Xanh, Tim, Titan...).
 */
const COLORS: [RegExp, string, string][] = [
  [/sa mạc|desert/i, "#C8A98A", "#8E715A"],
  [/titan tự nhiên|natural/i, "#BDB6AA", "#7E786D"],
  [/titan trắng|trắng|starlight|white/i, "#ECE9E2", "#B9B4AA"],
  [/đen|black|midnight|space/i, "#3A3B40", "#18191C"],
  [/hồng|pink/i, "#F2C9CF", "#C98E98"],
  [/tím|purple/i, "#B7A6D6", "#7D6AA6"],
  [/mint/i, "#BFE3D3", "#7FB39C"],
  [/xanh|blue|green/i, "#9DB7D3", "#5C7C9E"],
  [/bạc|silver|xám|gray|grey/i, "#D9DADD", "#9EA0A6"],
];

export function tint(variant?: string, name?: string): [string, string] {
  const s = `${variant ?? ""} ${name ?? ""}`;
  for (const [re, a, b] of COLORS) if (re.test(s)) return [a, b];
  return ["#C9CBD1", "#8D9098"];
}

export default function DeviceArt({ category, variant, name, tags = [], className = "" }:
  { category: string; variant?: string; name?: string; tags?: string[]; className?: string }) {
  const [c1, c2] = tint(variant, name);
  const id = "g" + useId().replace(/:/g, "");
  const screen = (
    <linearGradient id={`${id}s`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor="#2F4BFF" />
      <stop offset="0.55" stopColor="#8A5CF6" />
      <stop offset="1" stopColor="#F59E9E" />
    </linearGradient>
  );
  const body = (
    <linearGradient id={`${id}b`} x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stopColor={c1} />
      <stop offset="1" stopColor={c2} />
    </linearGradient>
  );
  const isOverEar = tags.includes("chup tai") || /WH-|headphone/i.test(name ?? "");

  let art: React.ReactNode;
  switch (category) {
    case "laptop":
      art = (<>
        <rect x="58" y="40" width="284" height="180" rx="12" fill={`url(#${id}b)`} />
        <rect x="68" y="50" width="264" height="160" rx="4" fill={`url(#${id}s)`} />
        <path d="M30 228 h340 l-14 16 H44 Z" fill={`url(#${id}b)`} />
        <rect x="170" y="228" width="60" height="5" rx="2.5" fill="#00000022" />
      </>);
      break;
    case "may-anh":
      art = (<>
        <rect x="70" y="92" width="260" height="140" rx="22" fill={`url(#${id}b)`} />
        <rect x="96" y="70" width="80" height="30" rx="8" fill={`url(#${id}b)`} />
        <rect x="70" y="92" width="58" height="140" rx="22" fill="#00000026" />
        <circle cx="225" cy="162" r="58" fill="#1b1c20" />
        <circle cx="225" cy="162" r="44" fill="#2a2c33" />
        <circle cx="225" cy="162" r="30" fill={`url(#${id}s)`} opacity="0.85" />
        <circle cx="212" cy="150" r="7" fill="#ffffff66" />
        <circle cx="300" cy="80" r="9" fill={`url(#${id}b)`} />
      </>);
      break;
    case "tai-nghe":
      art = isOverEar ? (<>
        <path d="M110 170 C110 70 290 70 290 170" fill="none" stroke={c2} strokeWidth="18" strokeLinecap="round" />
        <rect x="80" y="150" width="70" height="100" rx="32" fill={`url(#${id}b)`} />
        <rect x="250" y="150" width="70" height="100" rx="32" fill={`url(#${id}b)`} />
        <rect x="92" y="164" width="22" height="72" rx="11" fill="#00000022" />
        <rect x="286" y="164" width="22" height="72" rx="11" fill="#00000022" />
      </>) : (<>
        <rect x="120" y="100" width="160" height="130" rx="48" fill={`url(#${id}b)`} />
        <line x1="124" y1="140" x2="276" y2="140" stroke="#00000022" strokeWidth="2" />
        <circle cx="200" cy="186" r="4" fill="#12A150" />
        <ellipse cx="168" cy="82" rx="22" ry="26" fill={`url(#${id}b)`} />
        <ellipse cx="232" cy="82" rx="22" ry="26" fill={`url(#${id}b)`} />
      </>);
      break;
    case "dong-ho":
      art = (<>
        <rect x="160" y="20" width="80" height="80" rx="18" fill={c2} />
        <rect x="160" y="200" width="80" height="80" rx="18" fill={c2} />
        <rect x="128" y="74" width="144" height="152" rx="40" fill={`url(#${id}b)`} />
        <rect x="140" y="86" width="120" height="128" rx="30" fill="#0b0c10" />
        <circle cx="200" cy="150" r="40" fill="none" stroke={`url(#${id}s)`} strokeWidth="9" strokeDasharray="190 260" strokeLinecap="round" transform="rotate(-90 200 150)" />
        <rect x="272" y="120" width="8" height="26" rx="4" fill={c2} />
      </>);
      break;
    case "phu-kien":
      art = (<>
        <path d="M100 90 L300 70 L310 230 L110 250 Z" fill={`url(#${id}b)`} />
        <path d="M100 90 L300 70 L290 110 L96 128 Z" fill="#ffffff33" />
        <path d="M150 120 L280 106 M140 170 L292 156 M126 214 L300 198" stroke="#00000014" strokeWidth="6" strokeLinecap="round" />
      </>);
      break;
    default: // dien thoai
      art = (<>
        <rect x="128" y="18" width="144" height="264" rx="30" fill={`url(#${id}b)`} />
        <rect x="136" y="26" width="128" height="248" rx="23" fill="#0b0c10" />
        <rect x="140" y="30" width="120" height="240" rx="20" fill={`url(#${id}s)`} />
        <circle cx="200" cy="44" r="4.5" fill="#0b0c10" />
        <rect x="272" y="86" width="4" height="40" rx="2" fill={c2} />
      </>);
  }
  return (
    <svg viewBox="0 0 400 300" className={className} role="img" aria-label={name ?? "Hình minh họa sản phẩm"}>
      <defs>{screen}{body}</defs>
      <ellipse cx="200" cy="288" rx="130" ry="8" fill="#00000014" />
      {art}
    </svg>
  );
}
