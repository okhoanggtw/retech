import Link from "next/link";
import { PageTitle } from "@/components/ui";
export const metadata = { title: "Hình thức thanh toán" };

const STEPS = [
  ["Chọn “Chuyển khoản QR” khi đặt hàng", "Hệ thống tạo mã VietQR riêng cho đơn của bạn qua cổng PayOS."],
  ["Mở app ngân hàng và quét mã", "Số tiền và nội dung chuyển khoản đã điền sẵn, bạn chỉ cần xác nhận."],
  ["Đơn được xác nhận tự động", "Khi tiền về, PayOS báo cho ReTech trong vài giây và đơn chuyển sang “Đã xác nhận”."],
];

export default function PaymentInfo() {
  return (
    <>
      <PageTitle title="Thanh toán." sub="Hai cách, đều an toàn và không mất phí." />
      <div className="mx-auto max-w-page space-y-4 px-4 pb-20 md:px-6">
        <section className="card md:p-10">
          <h2 className="text-2xl font-bold">Chuyển khoản QR qua PayOS</h2>
          <p className="mt-2 max-w-2xl text-graphite">Hỗ trợ hơn 40 ngân hàng tại Việt Nam. Mã QR hết hạn sau 15 phút; nếu quá hạn bạn có thể đặt lại.</p>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map(([t, d], i) => (
              <li key={t}>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-cobalt font-bold text-white">{i + 1}</span>
                <p className="mt-3 font-semibold">{t}</p>
                <p className="mt-1 text-[15px] text-graphite">{d}</p>
              </li>
            ))}
          </ol>
        </section>
        <section className="card md:p-10">
          <h2 className="text-2xl font-bold">Thanh toán khi nhận hàng (COD)</h2>
          <p className="mt-2 max-w-2xl text-graphite">Kiểm tra máy trước rồi trả tiền mặt cho nhân viên giao hàng. Áp dụng cho đơn dưới 50 triệu.</p>
        </section>
        <p className="pt-4 text-center"><Link href="/san-pham" className="btn-primary">Bắt đầu mua sắm</Link></p>
      </div>
    </>
  );
}
