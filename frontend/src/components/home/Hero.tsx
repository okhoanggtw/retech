"use client";
import { useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import DeviceArt from "../DeviceArt";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const CHECKS = ["Màn hình không điểm chết", "Pin còn 98%", "Camera, loa, mic hoạt động", "Vân tay / Face ID nhạy", "Tài khoản đã gỡ sạch"];

/**
 * Khoanh khac chu dao cua trang: cuon xuong -> may duoc "kiem dinh":
 * tia quet chay qua, cac hang muc lan luot duoc tick, vong tinh trang lap day 99.
 */
export default function Hero() {
  const root = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add(
      { desktop: "(min-width: 768px) and (prefers-reduced-motion: no-preference)",
        mobile: "(max-width: 767px) and (prefers-reduced-motion: no-preference)",
        reduce: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as Record<string, boolean>;
        const num = root.current!.querySelector(".ring-num")!;
        if (reduce) {
          gsap.set(".hero-copy", { opacity: 0 });
          gsap.set(".hero-device", window.innerWidth >= 768 ? { xPercent: -28, scale: 0.86 } : { yPercent: -62, scale: 0.6 });
          num.textContent = "99";
          return;
        }
        gsap.from(".hero-line", { yPercent: 110, duration: 1.1, ease: "expo.out", stagger: 0.12 });
        gsap.from(".hero-device-inner", { y: 80, opacity: 0, scale: 0.92, duration: 1.4, ease: "expo.out", delay: 0.2 });

        const ring = root.current!.querySelector<SVGCircleElement>(".ring-fill")!;
        const len = 2 * Math.PI * 52;
        const counter = { v: 0 };
        num.textContent = "0";
        const tl = gsap.timeline({
          scrollTrigger: { trigger: root.current, start: "top top", end: "+=1600", scrub: 0.6, pin: true },
        });
        tl.to(".hero-copy", { opacity: 0, y: -60, duration: 0.6 })
          .fromTo(".hero-device", { yPercent: desktop ? 24 : 18, scale: desktop ? 0.78 : 0.9 },
                   desktop ? { yPercent: 0, xPercent: -28, scale: 0.86, rotate: -6, duration: 1 }
                           : { yPercent: -62, scale: 0.6, duration: 1 }, "<")
          .from(".hero-panel", { opacity: 0, duration: 0.4 }, "<0.5")
          .fromTo(".scan", { top: "4%", opacity: 0 }, { opacity: 1, duration: 0.1 }, "<")
          .to(".scan", { top: "92%", duration: 1.6, ease: "none" })
          .from(".check", { opacity: 0, x: 30, stagger: 0.3, duration: 0.3 }, "<")
          .from(".check-tick", { scale: 0, stagger: 0.3, duration: 0.3, ease: "back.out(3)" }, "<")
          .to(".scan", { opacity: 0, duration: 0.2 })
          .fromTo(ring, { strokeDasharray: `0 ${len}` }, { strokeDasharray: `${len * 0.99} ${len}`, duration: 1 }, "<")
          .to(counter, { v: 99, duration: 1, onUpdate: () => { num.textContent = String(Math.round(counter.v)); } }, "<")
          .from(".hero-final", { opacity: 0, y: 30, duration: 0.6 });
      });
  }, { scope: root });

  const len = 2 * Math.PI * 52;
  return (
    <section ref={root} className="relative h-[100svh] min-h-[640px] overflow-hidden bg-black text-white">
      <div className="mx-auto grid h-full max-w-page grid-cols-1 items-center px-4 md:grid-cols-2 md:px-6">
        {/* Thiet bi + tia quet */}
        <div className="hero-device relative mx-auto aspect-[4/3] w-[86%] max-w-[560px] md:col-span-2 md:row-start-1 md:col-start-1"><div className="hero-device-inner absolute inset-0">
          <div className="absolute inset-[8%] rounded-full bg-[radial-gradient(closest-side,rgba(47,75,255,0.45),transparent)] blur-2xl" />
          <DeviceArt category="dien-thoai" variant="Titan Sa Mạc" className="relative h-full w-full" />
          <div className="scan pointer-events-none absolute inset-x-[20%] top-[4%] h-[3px] rounded-full bg-[#7CF4C0] opacity-0 shadow-[0_0_24px_6px_rgba(124,244,192,0.55)]" />
        </div></div>

        {/* Loi mo dau */}
        <div className="hero-copy pointer-events-none absolute inset-x-0 top-[12%] text-center md:top-[14%]">
          <h1 className="text-[clamp(44px,8vw,96px)] font-extrabold leading-[1.04] tracking-tightest">
            <span className="block overflow-hidden"><span className="hero-line block">Máy cũ.</span></span>
            <span className="block overflow-hidden"><span className="hero-line block text-white/55">Chuẩn như mới.</span></span>
          </h1>
        </div>

        {/* Bang kiem dinh */}
        <div className="hero-panel absolute inset-x-6 top-[44%] md:inset-x-auto md:right-6 md:top-1/2 md:w-[360px] md:-translate-y-1/2">
          <ul className="space-y-2.5 md:space-y-3">
            {CHECKS.map((c) => (
              <li key={c} className="check flex items-center gap-3 text-sm text-white/85 md:text-lg">
                <span className="check-tick grid h-6 w-6 shrink-0 place-items-center rounded-full bg-[#7CF4C0] text-black">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.5"><path d="M5 12l5 5L20 7" /></svg>
                </span>
                {c}
              </li>
            ))}
          </ul>
          <div className="mt-8 hidden items-center gap-4 md:flex">
            <svg width="120" height="120" viewBox="0 0 120 120" aria-label="Tình trạng 99%">
              <circle cx="60" cy="60" r="52" fill="none" stroke="rgba(255,255,255,0.12)" strokeWidth="8" />
              <circle className="ring-fill" cx="60" cy="60" r="52" fill="none" stroke="#7CF4C0" strokeWidth="8" strokeLinecap="round"
                strokeDasharray={`${len * 0.99} ${len}`} transform="rotate(-90 60 60)" />
              <text className="ring-num" x="60" y="70" textAnchor="middle" fontSize="34" fontWeight="800" fill="#fff">99</text>
            </svg>
            <p className="text-sm leading-snug text-white/70">Điểm tình trạng<br />sau kiểm định</p>
          </div>
        </div>

        <div className="hero-final absolute inset-x-0 bottom-[7%] px-4 text-center">
          <p className="text-2xl font-bold tracking-tight md:text-4xl">Kiểm định 30 bước. Bảo hành 12 tháng.</p>
          <div className="pointer-events-auto mt-6 flex flex-wrap justify-center gap-3">
            <Link href="/san-pham" className="btn-primary">Xem máy đang bán</Link>
            <Link href="/thu-cu" className="inline-flex items-center rounded-full border border-white/30 px-6 py-3 text-[15px] font-semibold text-white hover:border-white">Định giá máy của bạn</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
