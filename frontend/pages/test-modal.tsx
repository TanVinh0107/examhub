import { useState } from "react";
import CreateExamModal from "@/components/exams/CreateExamModal";

export default function TestModalPage() {
  const [show, setShow] = useState(false);
  return (
    <div className="p-8">
      <button
        type="button"
        onClick={() => setShow(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        + Tạo đề thi
      </button>

      {show && <CreateExamModal onClose={() => setShow(false)} onCreated={() => {}} />}
    </div>
  );
}
