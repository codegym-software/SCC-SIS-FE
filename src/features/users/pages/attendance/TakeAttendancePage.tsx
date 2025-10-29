import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Calendar, CheckCircle, XCircle, Clock, AlertCircle, Users, Save, User } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';

// Mock student data with more entries
const generateMockStudents = (_classId: number) => {
    const firstNames = [
        'An',
        'Bình',
        'Cường',
        'Dũng',
        'Em',
        'Phương',
        'Giang',
        'Hà',
        'Hùng',
        'Khánh',
        'Linh',
        'Minh',
        'Nam',
        'Oanh',
        'Phúc',
        'Quân',
        'Trang',
        'Tuấn',
        'Vân',
        'Yến',
        'Long',
        'Mai',
        'Hương',
        'Đức',
        'Thảo',
        'Hoàng',
        'Lan',
        'Thanh',
        'Nhung',
        'Tâm',
    ];
    const lastNames = ['Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi', 'Đỗ', 'Hồ'];
    const middleNames = ['Văn', 'Thị', 'Đình', 'Hữu', 'Quang', 'Minh', 'Anh', 'Thanh', 'Tuấn', 'Hồng', 'Thu', 'Xuân'];

    const students = [];
    for (let i = 0; i < 35; i++) {
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const middleName = middleNames[Math.floor(Math.random() * middleNames.length)];
        const firstName = firstNames[i % firstNames.length];
        students.push({
            id: i + 1,
            studentCode: `BCS230${String(i + 1).padStart(3, '0')}`,
            lastName: lastName,
            middleName: middleName,
            firstName: firstName,
            fullName: `${lastName} ${middleName} ${firstName}`,
            email: `student${i + 1}@example.com`,
            phone: `098${String(1000000 + i).substring(1)}`,
        });
    }
    return students;
};

type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED' | null;

type AttendanceRecord = {
    studentId: number;
    status: AttendanceStatus;
    note: string;
};

export default function TakeAttendancePage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const { success: showSuccessToast, error: showErrorToast } = useToast();

    const classId = searchParams.get('classId') || '1';
    const className = searchParams.get('className') || 'Lớp học';
    const date = searchParams.get('date') || new Date().toISOString().split('T')[0];
    const timeRange = searchParams.get('timeRange') || '07:00 - 09:40';
    const room = searchParams.get('room') || 'VPC2-401';

    const [students] = useState(generateMockStudents(parseInt(classId)));
    const [attendanceRecords, setAttendanceRecords] = useState<Map<number, AttendanceRecord>>(
        new Map(students.map((s) => [s.id, { studentId: s.id, status: null, note: '' }])),
    );
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleStatusChange = (studentId: number, status: AttendanceStatus) => {
        setAttendanceRecords((prev) => {
            const newMap = new Map(prev);
            const record = newMap.get(studentId);
            if (record) {
                newMap.set(studentId, { ...record, status });
            }
            return newMap;
        });
    };

    const handleNoteChange = (studentId: number, note: string) => {
        setAttendanceRecords((prev) => {
            const newMap = new Map(prev);
            const record = newMap.get(studentId);
            if (record) {
                newMap.set(studentId, { ...record, note });
            }
            return newMap;
        });
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise((resolve) => setTimeout(resolve, 1000));
            showSuccessToast('Thành công', 'Đã lưu điểm danh');
            setTimeout(() => navigate('/attendance'), 500);
        } catch (error) {
            showErrorToast('Lỗi', 'Không thể lưu điểm danh');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleGoBack = () => {
        navigate('/attendance');
    };

    const StatusCheckbox = ({
        status,
        currentStatus,
        onClick,
        label,
    }: {
        status: AttendanceStatus;
        currentStatus: AttendanceStatus;
        onClick: () => void;
        label: string;
    }) => {
        const isChecked = currentStatus === status;
        return (
            <input
                type="checkbox"
                checked={isChecked}
                onChange={onClick}
                className="w-5 h-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                title={label}
            />
        );
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gray-50 z-50 overflow-y-auto"
        >
            {/* Header */}
            <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-b sticky top-0 z-10 shadow-sm"
            >
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleGoBack}
                                className="h-10 w-10 rounded-lg border bg-white hover:bg-gray-50 flex items-center justify-center"
                            >
                                <ArrowLeft size={20} />
                            </motion.button>
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center text-white shadow-md">
                                    <Users size={24} />
                                </div>
                                <div>
                                    <h1 className="text-xl font-semibold text-gray-900">{className}</h1>
                                    <div className="flex items-center gap-3 text-sm text-gray-600 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} />
                                            {new Date(date).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} />
                                            {timeRange}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <User size={14} />
                                            {room}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                        >
                            <Save size={18} />
                            <span>{isSubmitting ? 'Đang lưu...' : 'Lưu điểm danh'}</span>
                        </motion.button>
                    </div>
                </div>
            </motion.div>

            {/* Attendance Table */}
            <div className="max-w-7xl mx-auto px-6 py-6">
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-xl shadow-sm border overflow-hidden"
                >
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b">
                                <tr>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-20">
                                        <div className="flex items-center gap-2">
                                            <span>STT</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-32">
                                        <div className="flex items-center gap-2">
                                            <User size={16} />
                                            <span>Mã số</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                        <div className="flex items-center gap-2">
                                            <Users size={16} />
                                            <span>Họ đệm</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700">
                                        <span>Tên</span>
                                    </th>
                                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle size={16} className="text-green-600" />
                                            <span>Có mặt</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">
                                        <div className="flex items-center justify-center gap-2">
                                            <XCircle size={16} className="text-red-600" />
                                            <span>Vắng</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">
                                        <div className="flex items-center justify-center gap-2">
                                            <Clock size={16} className="text-amber-600" />
                                            <span>Trễ</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-center text-sm font-semibold text-gray-700 w-16">
                                        <div className="flex items-center justify-center gap-2">
                                            <AlertCircle size={16} className="text-blue-600" />
                                            <span>Phép</span>
                                        </div>
                                    </th>
                                    <th className="px-4 py-4 text-left text-sm font-semibold text-gray-700 w-64">
                                        <span>Ghi chú</span>
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                <AnimatePresence>
                                    {students.map((student, index) => {
                                        const record = attendanceRecords.get(student.id);
                                        return (
                                            <motion.tr
                                                key={student.id}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: index * 0.02 }}
                                                whileHover={{ backgroundColor: '#f9fafb' }}
                                                className="hover:bg-gray-50 transition-colors"
                                            >
                                                <td className="px-4 py-4 text-sm text-gray-900">{index + 1}</td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                    {student.studentCode}
                                                </td>
                                                <td className="px-4 py-4 text-sm text-gray-700">
                                                    {student.lastName} {student.middleName}
                                                </td>
                                                <td className="px-4 py-4 text-sm font-medium text-gray-900">
                                                    {student.firstName}
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusCheckbox
                                                            status="PRESENT"
                                                            currentStatus={record?.status || null}
                                                            onClick={() => handleStatusChange(student.id, 'PRESENT')}
                                                            label="Có mặt"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusCheckbox
                                                            status="ABSENT"
                                                            currentStatus={record?.status || null}
                                                            onClick={() => handleStatusChange(student.id, 'ABSENT')}
                                                            label="Vắng"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusCheckbox
                                                            status="LATE"
                                                            currentStatus={record?.status || null}
                                                            onClick={() => handleStatusChange(student.id, 'LATE')}
                                                            label="Trễ"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center">
                                                    <div className="flex justify-center">
                                                        <StatusCheckbox
                                                            status="EXCUSED"
                                                            currentStatus={record?.status || null}
                                                            onClick={() => handleStatusChange(student.id, 'EXCUSED')}
                                                            label="Phép"
                                                        />
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4">
                                                    <input
                                                        type="text"
                                                        value={record?.note || ''}
                                                        onChange={(e) => handleNoteChange(student.id, e.target.value)}
                                                        placeholder="Nhập ghi chú..."
                                                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                                    />
                                                </td>
                                            </motion.tr>
                                        );
                                    })}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </motion.div>

                {/* Footer Actions */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="mt-6 flex items-center justify-between"
                >
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleGoBack}
                        className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 flex items-center gap-2"
                    >
                        <ArrowLeft size={18} />
                        <span>Quay lại</span>
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-md"
                    >
                        <Save size={18} />
                        <span>{isSubmitting ? 'Đang lưu...' : 'Lưu điểm danh'}</span>
                    </motion.button>
                </motion.div>
            </div>
        </motion.div>
    );
}
