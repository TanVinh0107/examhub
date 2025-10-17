import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { api } from "@/lib/api"; // ✅ axios instance có token (baseURL đã config sẵn)

interface ExamFormData {
  title: string;
  year: number;
  credits: number;
  durationMin: number;
  file: FileList;
}

interface CreateExamModalProps {
  onClose: () => void;
  onCreated: () => void;
}

const CreateExamModal: React.FC<CreateExamModalProps> = ({ onClose, onCreated }) => {
  const { register, handleSubmit, reset } = useForm<ExamFormData>();
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: ExamFormData) => {
    try {
      setLoading(true);

      const file = data.file?.[0];
      if (!file) {
        alert("⚠️ Vui lòng chọn tệp!");
        return;
      }

      // ✅ B1: Gọi API /uploads/presign để lấy URL upload
      const presignRes = await api.post("/uploads/presign", {
        fileName: file.name,
        fileType: file.type,
        schoolId: "1", // 🔹 tạm thời fix cứng
        departmentId: "1",
        subjectId: "1",
        year: Number(data.year),
        credits: data.credits ? Number(data.credits) : undefined,
        durationMin: data.durationMin ? Number(data.durationMin) : undefined,
      });

      const { presignedUrl, key } = presignRes.data;

      // ✅ B2: Upload file thực lên MinIO (bằng presigned URL)
      await fetch(presignedUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      console.log("✅ Uploaded file to MinIO:", key);

      // ✅ B3: Gọi API tạo đề thi
      await api.post("/exams", {
        title: data.title,
        year: Number(data.year),
        credits: data.credits ? Number(data.credits) : null,
        durationMin: data.durationMin ? Number(data.durationMin) : null,
        fileKey: key,
        subjectId: "1", // 🔹 tạm thời, có thể cho chọn sau
      });

      alert("🎉 Tạo đề thi thành công!");
      reset();
      onCreated();
      onClose();
    } catch (err: any) {
      console.error("❌ Upload failed:", err.response?.data || err.message);
      if (err.response?.status === 401) {
        alert("⚠️ Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại!");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      } else {
        alert("❌ Lỗi khi tạo đề thi!");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg w-96 shadow-xl animate-fadeIn">
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
