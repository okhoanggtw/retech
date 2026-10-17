"use client";
import { useState } from "react";
import DeviceArt from "./DeviceArt";
import { imgUrl } from "@/lib/api";
import type { Product } from "@/lib/types";

/**
 * Thu tu tim anh:
 * 1. Anh admin upload (product.images)
 * 2. File trong frontend/public/products/<slug>.png | .jpg | .webp
 * 3. Hinh minh hoa chung (DeviceArt)
 */
const EXTS = ["png", "jpg", "webp"];

export default function ProductImage({ p, index = 0, className = "" }: { p: Product; index?: number; className?: string }) {
  const uploaded = imgUrl(p.images?.[index]);
  const [try_, setTry] = useState(0);
  const [uploadFailed, setUploadFailed] = useState(false);
  const useUpload = uploaded && !uploadFailed;
  const src = useUpload ? uploaded : try_ < EXTS.length ? `/products/${p.slug}.${EXTS[try_]}` : undefined;
  if (!src) return <DeviceArt category={p.category} variant={p.variant} name={p.name} tags={p.tags} className={className} />;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={p.name} loading="lazy" className={`object-contain ${className}`}
      onError={() => (useUpload ? setUploadFailed(true) : setTry((t) => t + 1))} />
  );
}
