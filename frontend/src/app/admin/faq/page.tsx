"use client";
import CrudPage from "@/components/admin/CrudPage";
export default function Page() {
  return <CrudPage title="Hỏi đáp (FAQ)" endpoint="/api/admin/faqs" addLabel="Thêm câu hỏi"
    defaults={{ question: "", answer: "", topic: "", sortOrder: 10 }}
    fields={[{ key: "question", label: "Câu hỏi", required: true }, { key: "answer", label: "Trả lời", type: "textarea", required: true, hint: "Chatbot AI cũng dùng nội dung này để trả lời khách" },
      { key: "topic", label: "Chủ đề" }, { key: "sortOrder", label: "Thứ tự", type: "number" }]}
    columns={[{ label: "#", render: (r) => r.sortOrder as number }, { label: "Câu hỏi", render: (r) => <b>{r.question as string}</b> }, { label: "Chủ đề", render: (r) => r.topic as string }]} />;
}
