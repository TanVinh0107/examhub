import React from "react";
import Link from "next/link";

const Navbar: React.FC = () => {
  return (
    <nav className="bg-blue-600 text-white px-6 py-3 shadow">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-lg font-semibold">
          ExamHub
        </Link>
        <div className="flex gap-4">
          <Link href="/exams" className="hover:underline">
            Đề thi
          </Link>
          <Link href="/login" className="hover:underline">
            Đăng nhập
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
