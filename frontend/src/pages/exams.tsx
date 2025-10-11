import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { api } from "../lib/api";

interface Exam {
  id: string;
  title: string;
  year: number;
  views: number;
  status: string;
  description?: string;
  fileUrl?: string;
  fileType?: string;
}

export default function ExamsPage() {
  const [exams, setExams] = useState<Exam[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

useEffect(() => {
  const fetchExams = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) {
        router.push("/login");
        return;
      }

      const res = await api.get("/exams");

      // 👇 Thêm dòng này để debug kết quả trả về
      console.log("Danh sách đề thi:", res.data.data);

      if (Array.isArray(res.data?.data)) {
        setExams(res.data.data);
      } else {
        console.warn("API trả về không phải là mảng:", res.data);
        setExams([]);
      }
    } catch (err: any) {
      console.error("Lỗi khi fetch exams:", err);
      if (err.response?.status === 401) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        router.push("/login");
      } else {
        setError("Không thể tải danh sách đề thi.");
      }
    } finally {
      setLoading(false);
    }
  };

  fetchExams();
}, [router]);


  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-gray-500">Đang tải danh sách đề thi...</p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <p className="text-red-500">{error}</p>
      </div>
    );

  return (
    <div className="min-h-screen bg-gray-100 py-10 px-4">
      <div className="max-w-4xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-700 mb-6 text-center">
          📚 Danh sách đề thi
        </h1>

        {exams.length === 0 ? (
          <p className="text-gray-600 text-center">Chưa có đề thi nào.</p>
        ) : (
          <ul className="space-y-4">
            {exams.map((exam) => (
              <li
                key={exam.id}
                className="border p-4 rounded-lg hover:shadow-md transition"
              >
                <h2 className="text-xl font-semibold text-blue-600 mb-1">
                  {exam.title}
                </h2>
                <p className="text-gray-600 text-sm mb-1">
                  <strong>Năm:</strong> {exam.year} &nbsp;|&nbsp;
                  <strong>Lượt xem:</strong> {exam.views}
                </p>
                <p className="text-gray-500 text-sm mb-2">
                  <strong>Trạng thái:</strong> {exam.status}
                </p>
                {exam.description && (
                  <p className="text-gray-700 text-sm mb-2">
                    {exam.description.slice(0, 120)}...
                  </p>
                )}
                {exam.fileUrl && (
                  <a href={exam.fileUrl} target="_blank">📥 Tải đề</a>

                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
