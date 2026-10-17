"use client";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import type { Product } from "@/lib/types";
import ProductForm from "@/components/admin/ProductForm";
import { Skeleton } from "@/components/ui";

export default function EditProduct({ params }: { params: { id: string } }) {
  const { data } = useSWR<Product>(`/api/admin/products/${params.id}`, fetcher, { revalidateOnFocus: false });
  return <div className="space-y-5"><h1 className="text-3xl font-bold tracking-tight">Sửa sản phẩm</h1>{data ? <ProductForm initial={data} /> : <Skeleton className="h-96" />}</div>;
}
