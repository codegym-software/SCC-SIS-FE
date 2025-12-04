import { Trophy } from 'lucide-react';

export default function MyGradesPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-purple-700" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Điểm của tôi</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-600">
                    Đây là trang bảng điểm của bạn. Dữ liệu sẽ được hiển thị khi giáo viên nhập điểm. Trong thời gian
                    chờ, bạn có thể mở một lớp trong "Lớp học của tôi" để tiếp tục học.
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-4">
                            <div className="text-sm text-gray-500">Môn học {i}</div>
                            <div className="mt-1 text-xl font-semibold text-gray-900">—</div>
                            <div className="mt-2 h-2 bg-gray-100 rounded-full">
                                <div className="h-2 bg-purple-200 rounded-full w-1/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
