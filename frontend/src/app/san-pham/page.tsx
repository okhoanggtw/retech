import { Suspense } from "react";
import ProductBrowser from "@/components/ProductBrowser";
import { PageTitle } from "@/components/ui";

export const metadata = { title: "Tất cả sản phẩm" };

export default function ProductsPage() {
  return (
    <>
      <PageTitle title="Tất cả sản phẩm." sub="Mỗi máy đều có điểm tình trạng sau kiểm định và bảo hành tại ReTech." />
      <Suspense><ProductBrowser /></Suspense>
    </>
  );
}
