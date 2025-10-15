import React, { useEffect, useState } from "react";
import axios from "axios";
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

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/exams`);
      setExams(res.data);
    } catch (err) {
      console.error("❌ Lỗi khi tải danh sách đề thi:", err);
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
          <h1 className="text-2xl font-bold text-gray-800">📚 Danh sách đề thi</h1>
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
                {exam.credits && <p className="text-gray-600">Tín chỉ: {exam.credits}</p>}
                {exam.durationMin && <p className="text-gray-600">Thời lượng: {exam.durationMin} phút</p>}
                <p className="text-sm mt-2 text-gray-500 italic">Trạng thái: {exam.status}</p>
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

export default ExamsPage;
