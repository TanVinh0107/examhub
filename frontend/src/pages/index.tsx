import Link from "next/link";
import Navbar from "@/components/Layout/Navbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Navbar />

      <main className="flex flex-col items-center justify-center text-center py-20 px-4">
        <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">
          🎓 Examhub
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mb-8">
          Nền tảng quản lý và chia sẻ đề thi trực tuyến – giúp sinh viên, giảng viên và trường học lưu trữ, tìm kiếm và quản lý đề thi dễ dàng hơn.
        </p>

        <Link
          href="/exams"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg text-lg shadow hover:bg-blue-700 transition"
        >
          🚀 Vào danh sách đề thi
        </Link>
      </main>

      <footer className="text-center text-gray-500 py-6 border-t mt-10">
        © {new Date().getFullYear()} Examhub. Được phát triển bởi <span className="font-semibold text-blue-600">Team Vinh Dev</span>.
      </footer>
    </div>
  );
}
