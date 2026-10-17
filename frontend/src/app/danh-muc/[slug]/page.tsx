"use client";
import { Suspense } from "react";
import useSWR from "swr";
import ProductBrowser from "@/components/ProductBrowser";
import { PageTitle } from "@/components/ui";
import { fetcher } from "@/lib/api";
import type { Category } from "@/lib/types";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const { data } = useSWR<Category[]>("/api/categories", fetcher);
  const c = data?.find((x) => x.slug === params.slug);
  return (
    <>
      <PageTitle title={c ? `${c.name}.` : " "} sub={c?.description} />
      <Suspense><ProductBrowser category={params.slug} /></Suspense>
    </>
  );
}
