import React, { useEffect, useState } from "react";
import { api } from "../../lib/api"; // ✅ Dùng axios instance có token
import { withAuth } from "../../lib/withAuth"; // ✅ Chặn truy cập nếu chưa login

import CreateExamModal from "@/components/exams/CreateExamModal";
import Navbar from "@/components/Layout/Navbar";

interface Exam {
  id: string;
  title: string;
  year: number;
  credits: number | null;
  durationMin: number | null;
  status: string;
}

const ExamsPage: React.FC = () => {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // ✅ Hàm gọi API (có interceptor tự động gắn token)
  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await api.get("/exams"); // KHÔNG dùng axios.get
      setExams(res.data.data ?? res.data); // fallback nếu backend trả { data: [] }
    } catch (err: any) {
      console.error("❌ Lỗi khi tải danh sách đề thi:", err);
      if (err.response?.status === 401) {
        alert("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!");
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-5xl mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            📚 Danh sách đề thi
          </h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
          >
            + Tạo đề thi
          </button>
        </div>

        {loading ? (
          <p>Đang tải...</p>
        ) : exams.length === 0 ? (
          <p className="text-gray-500">Chưa có đề thi nào.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {exams.map((exam) => (
              <div
                key={exam.id}
                className="p-4 bg-white rounded-lg shadow hover:shadow-md transition"
              >
                <h3 className="font-semibold text-lg">{exam.title}</h3>
                <p className="text-gray-600">Năm: {exam.year}</p>
                {exam.credits && (
                  <p className="text-gray-600">Tín chỉ: {exam.credits}</p>
                )}
                {exam.durationMin && (
                  <p className="text-gray-600">
                    Thời lượng: {exam.durationMin} phút
                  </p>
                )}
                <p className="text-sm mt-2 text-gray-500 italic">
                  Trạng thái: {exam.status}
                </p>
              </div>
            ))}
          </div>
        )}

        {showModal && (
          <CreateExamModal
            onClose={() => setShowModal(false)}
            onCreated={fetchExams}
          />
        )}
      </div>
    </div>
  );
};

// ✅ Bảo vệ route — chỉ vào được nếu có access_token
export default withAuth(ExamsPage);
