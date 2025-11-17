import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { getStudentAttendanceHistory, type StudentAttendanceHistory } from '@/shared/api/attendance';
import type { StudentUI } from '@/shared/types/student-ui';

interface StudentAttendanceTabProps {
    student: StudentUI;
}

const StudentAttendanceTab: React.FC<StudentAttendanceTabProps> = ({ student }) => {
    const { error: showErrorToast } = useToast();
    const [selectedClass, setSelectedClass] = useState<any | null>(null);
    const [attendanceData, setAttendanceData] = useState<StudentAttendanceHistory | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    // Filter states
    const currentDate = new Date();
    const [selectedMonth, setSelectedMonth] = useState<number>(currentDate.getMonth() + 1); // 1-12
    const [selectedYear, setSelectedYear] = useState<number>(currentDate.getFullYear());

    // Auto-select first enrollment if available
    useEffect(() => {
        if (student.enrollments && student.enrollments.length > 0 && !selectedClass) {
            const firstEnrollment = student.enrollments[0];
            setSelectedClass({
                classId: firstEnrollment.classId,
                className: firstEnrollment.className,
            });
        }
    }, [student.enrollments, selectedClass]);

    // Fetch attendance data when class is selected
    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedClass) {
                setAttendanceData(null);
                return;
            }

            try {
                setIsLoading(true);
                const response = await getStudentAttendanceHistory(parseInt(student.id), selectedClass.classId);
                setAttendanceData(response.data);
            } catch (error: any) {
                console.error('Error fetching attendance:', error);
                // Silently handle 404 (no data yet), show error for other cases
                if (error.response?.status !== 404) {
                    showErrorToast('Lỗi tải dữ liệu', 'Không thể tải lịch sử điểm danh');
                }
                setAttendanceData(null);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttendance();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedClass, student.id]);

    // Filter records by selected month and year
    const filteredRecords = React.useMemo(() => {
        if (!attendanceData?.records) return [];
        
        return attendanceData.records.filter(record => {
            const recordDate = new Date(record.attendanceDate);
            return recordDate.getMonth() + 1 === selectedMonth && recordDate.getFullYear() === selectedYear;
        });
    }, [attendanceData, selectedMonth, selectedYear]);

    // Calculate statistics based on filtered data
    const filteredStats = React.useMemo(() => {
        const totalSessions = filteredRecords.length;
        const presentCount = filteredRecords.filter(r => r.status === 'PRESENT').length;
        const absentCount = filteredRecords.filter(r => r.status === 'ABSENT').length;
        const percentage = totalSessions > 0 ? Math.round((presentCount / totalSessions) * 100) : 0;

        return {
            totalSessions,
            presentCount,
            absentCount,
            percentage
        };
    }, [filteredRecords]);

    // Month options (1-12)
    const months = [
        { value: 1, label: 'Tháng 1' },
        { value: 2, label: 'Tháng 2' },
        { value: 3, label: 'Tháng 3' },
        { value: 4, label: 'Tháng 4' },
        { value: 5, label: 'Tháng 5' },
        { value: 6, label: 'Tháng 6' },
        { value: 7, label: 'Tháng 7' },
        { value: 8, label: 'Tháng 8' },
        { value: 9, label: 'Tháng 9' },
        { value: 10, label: 'Tháng 10' },
        { value: 11, label: 'Tháng 11' },
        { value: 12, label: 'Tháng 12' },
    ];

    // Generate available years from attendance data
    const availableYears = React.useMemo(() => {
        if (!attendanceData?.records || attendanceData.records.length === 0) {
            return [currentDate.getFullYear()];
        }

        const years = new Set<number>();
        attendanceData.records.forEach(record => {
            const year = new Date(record.attendanceDate).getFullYear();
            years.add(year);
        });

        return Array.from(years).sort((a, b) => b - a);
    }, [attendanceData]);

    return (
        <div className="space-y-5">
            {/* Class Selector */}
            {student.enrollments.length > 0 ? (
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                        Chọn lớp học
                    </label>
                    <div className="flex gap-3 overflow-x-auto pb-2">
                        {student.enrollments.map((enrollment) => (
                            <button
                                key={enrollment.classId}
                                onClick={() =>
                                    setSelectedClass({
                                        classId: enrollment.classId,
                                        className: enrollment.className,
                                    })
                                }
                                className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                                    selectedClass?.classId === enrollment.classId
                                        ? 'border-blue-600 bg-blue-50'
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                }`}
                            >
                                <div className="text-left">
                                    <div className="text-sm font-semibold text-gray-900">
                                        {enrollment.className}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {enrollment.programName}
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                    <p className="text-sm text-gray-600">Học viên chưa được gán vào lớp học nào</p>
                </div>
            )}

            {/* Attendance Data */}
            {selectedClass && (
                <div className="space-y-5">
                    {isLoading ? (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-200 border-t-blue-600 mx-auto mb-3"></div>
                            <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
                        </div>
                    ) : attendanceData ? (
                        <>
                            {/* Attendance Statistics Title */}
                            <h4 className="text-base font-semibold text-gray-900 mb-4">Thống kê điểm danh</h4>

                            {/* Attendance Statistics (Filtered) */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Tổng buổi</div>
                                    <div className="text-2xl font-semibold text-gray-900">{filteredStats.totalSessions}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Có mặt</div>
                                    <div className="text-2xl font-semibold text-green-600">{filteredStats.presentCount}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Vắng</div>
                                    <div className="text-2xl font-semibold text-red-600">{filteredStats.absentCount}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Tỷ lệ tham dự</div>
                                    <div className="text-2xl font-semibold text-blue-600">{filteredStats.percentage}%</div>
                                </div>
                            </div>

                            {/* Detailed Records */}
                            {attendanceData.records.length > 0 ? (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h4 className="text-sm font-medium text-gray-900">
                                            Lịch sử điểm danh ({filteredRecords.length} buổi)
                                        </h4>
                                        
                                        {/* Month and Year Filters */}
                                        <div className="flex gap-2">
                                            {/* Month Filter */}
                                            <select
                                                value={selectedMonth}
                                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value={0}>Tất cả tháng</option>
                                                {months.map((month) => (
                                                    <option key={month.value} value={month.value}>
                                                        {month.label}
                                                    </option>
                                                ))}
                                            </select>

                                            {/* Year Filter */}
                                            <select
                                                value={selectedYear}
                                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            >
                                                <option value={0}>Tất cả năm</option>
                                                {availableYears.map((year) => (
                                                    <option key={year} value={year}>
                                                        {year}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>
                                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                                        <div className="max-h-96 overflow-y-auto">
                                            <table className="w-full">
                                                <thead className="bg-gray-50 sticky top-0">
                                                    <tr>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                                                            Ngày điểm danh
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                                                            Trạng thái
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                                                            Giảng viên
                                                        </th>
                                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 border-b border-gray-200">
                                                            Ghi chú
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-100">
                                                    {filteredRecords.length > 0 ? (
                                                        filteredRecords.map((record) => (
                                                            <tr key={record.sessionId} className="hover:bg-gray-50 transition-colors">
                                                                <td className="px-4 py-3 text-sm text-gray-900">
                                                                    {new Date(record.attendanceDate).toLocaleDateString('vi-VN', {
                                                                        day: '2-digit',
                                                                        month: '2-digit',
                                                                        year: 'numeric'
                                                                    })}
                                                                </td>
                                                                <td className="px-4 py-3">
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                                                        record.status === 'PRESENT' 
                                                                            ? 'bg-green-100 text-green-700' 
                                                                            : 'bg-red-100 text-red-700'
                                                                    }`}>
                                                                        {record.status === 'PRESENT' ? '✓ Có mặt' : '✕ Vắng'}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-700">
                                                                    {record.teacherName || '—'}
                                                                </td>
                                                                <td className="px-4 py-3 text-sm text-gray-600">
                                                                    {record.notes || '—'}
                                                                </td>
                                                            </tr>
                                                        ))
                                                    ) : (
                                                        <tr>
                                                            <td colSpan={4} className="px-4 py-8 text-center text-sm text-gray-500">
                                                                Không có buổi điểm danh nào trong tháng này
                                                            </td>
                                                        </tr>
                                                    )}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                                    <p className="text-sm text-gray-600">Chưa có dữ liệu điểm danh</p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Giảng viên chưa điểm danh cho lớp này
                                    </p>
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm text-gray-600">Không tìm thấy dữ liệu điểm danh</p>
                            <p className="text-xs text-gray-500 mt-1">
                                Học viên chưa được điểm danh trong lớp này
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default StudentAttendanceTab;

