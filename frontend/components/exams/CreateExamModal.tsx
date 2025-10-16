import React, { useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";

interface ExamFormData {
  title: string;
  year: number;
  credits: number;
  durationMin: number;
  file: FileList;
}

const CreateExamModal: React.FC<{ onClose: () => void; onCreated: () => void }> = ({
  onClose,
  onCreated,
}) => {
  const { register, handleSubmit, reset } = useForm<ExamFormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ExamFormData) => {
    try {
      setLoading(true);

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

      const file = data.file[0];
      if (!file) return alert("Chưa chọn file!");

      // 1️⃣ Gọi API lấy presigned URL (NestJS: /api/uploads/presign)
      const presignRes = await axios.post(`${API_URL}/uploads/presign`, {
        fileName: file.name,
        fileType: file.type,
        schoolId: "1", // ✅ TODO: thay bằng ID thật từ form hoặc user
        departmentId: "1",
        subjectId: "1",
        year: data.year,
        credits: data.credits,
        durationMin: data.durationMin,
      });

      const { presignedUrl, key, examId } = presignRes.data;

      // 2️⃣ Upload file thật lên MinIO qua presigned URL (PUT)
      await axios.put(presignedUrl, file, {
        headers: { "Content-Type": file.type },
      });

      console.log("✅ Uploaded file to MinIO:", key);

      // 3️⃣ Thông báo & reset
      alert("✅ Tạo đề thi thành công!");
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      alert("❌ Lỗi khi tạo đề thi!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl">
        <h2 className="text-xl font-semibold mb-4">Tạo đề thi mới</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <input
            {...register("title", { required: true })}
            placeholder="Tên đề thi"
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            {...register("year", { required: true })}
            placeholder="Năm"
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            {...register("credits")}
            placeholder="Số tín chỉ"
            className="w-full border p-2 rounded"
          />
          <input
            type="number"
            {...register("durationMin")}
            placeholder="Thời lượng (phút)"
            className="w-full border p-2 rounded"
          />
          <input
            type="file"
            {...register("file", { required: true })}
            className="w-full border p-2 rounded"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded"
            >
              {loading ? "Đang lưu..." : "Tạo"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateExamModal;
