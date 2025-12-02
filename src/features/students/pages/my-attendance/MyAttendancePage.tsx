import { Calendar } from 'lucide-react';

export default function MyAttendancePage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-700" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Điểm danh của tôi</h1>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6">
                <p className="text-sm text-gray-600">
                    Đây là trang điểm danh của bạn. Dữ liệu sẽ hiển thị khi giáo viên ghi nhận điểm danh. Trong thời
                    gian chờ, bạn có thể tiếp tục học trong "Lớp học của tôi".
                </p>
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border border-gray-200 p-4">
                            <div className="text-sm text-gray-500">Tuần {i}</div>
                            <div className="mt-1 text-xl font-semibold text-gray-900">—</div>
                            <div className="mt-2 h-2 bg-gray-100 rounded-full">
                                <div className="h-2 bg-green-200 rounded-full w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
