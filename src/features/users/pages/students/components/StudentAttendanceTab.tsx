import React, { useState, useEffect } from 'react';
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

    const getAttendancePercentage = () => {
        if (!attendanceData || attendanceData.totalSessions === 0) return 0;
        return Math.round((attendanceData.presentCount / attendanceData.totalSessions) * 100);
    };

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
                            {/* Attendance Statistics */}
                            <div className="grid grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Tổng buổi</div>
                                    <div className="text-2xl font-semibold text-gray-900">{attendanceData.totalSessions}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Có mặt</div>
                                    <div className="text-2xl font-semibold text-green-600">{attendanceData.presentCount}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Vắng</div>
                                    <div className="text-2xl font-semibold text-red-600">{attendanceData.absentCount}</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200">
                                    <div className="text-xs font-medium text-gray-500 mb-2">Tỷ lệ tham dự</div>
                                    <div className="text-2xl font-semibold text-blue-600">{getAttendancePercentage()}%</div>
                                </div>
                            </div>

                            {/* Progress Bar */}
                            <div className="bg-gray-100 rounded-full h-2 overflow-hidden">
                                <div 
                                    className={`h-2 rounded-full transition-all ${
                                        getAttendancePercentage() >= 80 ? 'bg-green-500' :
                                        getAttendancePercentage() >= 60 ? 'bg-yellow-500' :
                                        'bg-red-500'
                                    }`}
                                    style={{ width: `${getAttendancePercentage()}%` }}
                                ></div>
                            </div>

                            {/* Detailed Records */}
                            {attendanceData.records.length > 0 ? (
                                <div>
                                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                                        Lịch sử điểm danh ({attendanceData.records.length} buổi)
                                    </h4>
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
                                                    {attendanceData.records.map((record) => (
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
                                                    ))}
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

