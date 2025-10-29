import React, { useState, useEffect } from 'react';
import { Calendar, CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import http from '@/shared/api/http';

type Class = {
    id: number;
    name: string;
    programName: string;
    centerName: string;
    status: string;
};

type Student = {
    id: number;
    fullName: string;
    studentCode: string;
    email: string;
    phone: string;
};

type AttendanceRecord = {
    id: number;
    studentId: number;
    studentName: string;
    date: string;
    status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
    note?: string;
};

interface AttendanceModalProps {
    classItem: Class;
    onClose: () => void;
    initialDate?: string; // yyyy-mm-dd, optional preset for selected date
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ classItem, onClose, initialDate }) => {
    const { success: showSuccessToast, error: showErrorToast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [selectedDate, setSelectedDate] = useState(initialDate || new Date().toISOString().split('T')[0]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch students
    useEffect(() => {
        const fetchStudents = async () => {
            try {
                setIsLoading(true);
                const response = await http.get(`/api/classes/${classItem.id}/enrollments`);
                const enrollments = response.data.items || response.data;

                const studentsData: Student[] = enrollments.map((enrollment: any) => ({
                    id: enrollment.student.id,
                    fullName: enrollment.student.fullName,
                    studentCode: enrollment.student.studentCode,
                    email: enrollment.student.email,
                    phone: enrollment.student.phone,
                }));

                setStudents(studentsData);
            } catch (error) {
                console.error('Error fetching students:', error);
                showErrorToast('Lỗi tải dữ liệu', 'Không thể tải danh sách học viên');
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, [classItem.id]);

    // Fetch attendance records for selected date
    useEffect(() => {
        const fetchAttendance = async () => {
            if (!selectedDate) return;

            try {
                const response = await http.get(`/api/classes/${classItem.id}/attendance?date=${selectedDate}`);
                const records = response.data.items || response.data;

                const attendanceData: AttendanceRecord[] = records.map((record: any) => ({
                    id: record.id,
                    studentId: record.studentId,
                    studentName: record.studentName,
                    date: record.date,
                    status: record.status,
                    note: record.note,
                }));

                setAttendanceRecords(attendanceData);
            } catch (error) {
                console.error('Error fetching attendance:', error);
                // Initialize with default records if no data
                const defaultRecords: AttendanceRecord[] = students.map((student) => ({
                    id: 0,
                    studentId: student.id,
                    studentName: student.fullName,
                    date: selectedDate,
                    status: 'PRESENT',
                    note: '',
                }));
                setAttendanceRecords(defaultRecords);
            }
        };

        if (students.length > 0) {
            fetchAttendance();
        }
    }, [selectedDate, students, classItem.id]);

    const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
        setAttendanceRecords((prev) =>
            prev.map((record) => (record.studentId === studentId ? { ...record, status } : record)),
        );
    };

    const handleNoteChange = (studentId: number, note: string) => {
        setAttendanceRecords((prev) =>
            prev.map((record) => (record.studentId === studentId ? { ...record, note } : record)),
        );
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);

            const attendanceData = attendanceRecords.map((record) => ({
                studentId: record.studentId,
                date: selectedDate,
                status: record.status,
                note: record.note || null,
            }));

            await http.post(`/api/classes/${classItem.id}/attendance`, {
                date: selectedDate,
                records: attendanceData,
            });

            showSuccessToast('Lưu điểm danh thành công', 'Điểm danh đã được lưu');
        } catch (error) {
            console.error('Error saving attendance:', error);
            showErrorToast('Lỗi lưu điểm danh', 'Không thể lưu điểm danh');
        } finally {
            setIsSubmitting(false);
        }
    };

    // icon helper removed in table layout; keeping statuses via colored toggles

    // status label helper (currently unused in table version; keep for future)

    const getStatusCounts = () => {
        const counts = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0,
        };

        attendanceRecords.forEach((record) => {
            switch (record.status) {
                case 'PRESENT':
                    counts.present++;
                    break;
                case 'ABSENT':
                    counts.absent++;
                    break;
                case 'LATE':
                    counts.late++;
                    break;
                case 'EXCUSED':
                    counts.excused++;
                    break;
            }
        });

        return counts;
    };

    const counts = getStatusCounts();

    return (
        <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full mx-4 max-h-[85vh] flex flex-col">
            {/* Header - fixed at top */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Điểm danh lớp học</h2>
                    <p className="text-sm text-gray-600 mt-1">{classItem.name}</p>
                </div>
                <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                    <X size={20} />
                </button>
            </div>

            {/* Date Selection - fixed at top */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Calendar size={16} className="text-gray-500" />
                        <label className="text-sm font-medium text-gray-700">Ngày điểm danh:</label>
                    </div>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                </div>
            </div>

            {/* Statistics - fixed at top */}
            <div className="px-6 py-4 border-b border-gray-200 flex-shrink-0">
                <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-green-600 mb-1">
                            <CheckCircle size={16} />
                            <span className="text-sm font-medium">Có mặt</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{counts.present}</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-red-600 mb-1">
                            <XCircle size={16} />
                            <span className="text-sm font-medium">Vắng mặt</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{counts.absent}</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-yellow-600 mb-1">
                            <Clock size={16} />
                            <span className="text-sm font-medium">Đi muộn</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{counts.late}</div>
                    </div>
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-1 text-blue-600 mb-1">
                            <AlertCircle size={16} />
                            <span className="text-sm font-medium">Có phép</span>
                        </div>
                        <div className="text-lg font-semibold text-gray-900">{counts.excused}</div>
                    </div>
                </div>
            </div>

            {/* Attendance List - scrollable content */}
            <div className="px-6 py-4 flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải danh sách học viên...</p>
                    </div>
                ) : (
                    <div className="overflow-auto">
                        <table className="min-w-full border border-gray-200 rounded-lg overflow-hidden">
                            <thead className="bg-gray-50">
                                <tr className="text-left text-sm text-gray-600">
                                    <th className="px-3 py-2 border-b w-14">STT</th>
                                    <th className="px-3 py-2 border-b w-40">Mã số</th>
                                    <th className="px-3 py-2 border-b">Họ đệm</th>
                                    <th className="px-3 py-2 border-b w-40">Tên</th>
                                    <th className="px-3 py-2 border-b text-center w-24">Có mặt</th>
                                    <th className="px-3 py-2 border-b text-center w-24">Vắng</th>
                                    <th className="px-3 py-2 border-b text-center w-24">Trễ</th>
                                    <th className="px-3 py-2 border-b text-center w-24">Phép</th>
                                    <th className="px-3 py-2 border-b min-w-[220px]">Ghi chú</th>
                                </tr>
                            </thead>
                            <tbody>
                                {attendanceRecords.map((record, idx) => {
                                    const student = students.find((s) => s.id === record.studentId);
                                    const code = student?.studentCode || '';
                                    const full = record.studentName || '';
                                    const parts = full.trim().split(/\s+/);
                                    const first = parts.length ? parts[parts.length - 1] : '';
                                    const last = parts.slice(0, -1).join(' ');

                                    const cellBtn = (
                                        active: boolean,
                                        color: string,
                                        onClick: () => void,
                                        label: string,
                                    ) => (
                                        <button
                                            type="button"
                                            title={label}
                                            onClick={onClick}
                                            className={`mx-auto block h-6 w-6 rounded-md border transition-colors ${
                                                active
                                                    ? `${color} text-white border-transparent`
                                                    : 'bg-white text-gray-400 border-gray-300 hover:bg-gray-50'
                                            }`}
                                        >
                                            {active ? '✓' : ''}
                                        </button>
                                    );

                                    return (
                                        <tr key={record.studentId} className="text-sm">
                                            <td className="px-3 py-2 border-b text-gray-600">{idx + 1}</td>
                                            <td className="px-3 py-2 border-b font-medium text-gray-900">{code}</td>
                                            <td className="px-3 py-2 border-b text-gray-900">{last}</td>
                                            <td className="px-3 py-2 border-b font-medium text-gray-900">{first}</td>
                                            <td className="px-3 py-2 border-b text-center">
                                                {cellBtn(
                                                    record.status === 'PRESENT',
                                                    'bg-green-600 hover:bg-green-700',
                                                    () => handleStatusChange(record.studentId, 'PRESENT'),
                                                    'Có mặt',
                                                )}
                                            </td>
                                            <td className="px-3 py-2 border-b text-center">
                                                {cellBtn(
                                                    record.status === 'ABSENT',
                                                    'bg-red-600 hover:bg-red-700',
                                                    () => handleStatusChange(record.studentId, 'ABSENT'),
                                                    'Vắng',
                                                )}
                                            </td>
                                            <td className="px-3 py-2 border-b text-center">
                                                {cellBtn(
                                                    record.status === 'LATE',
                                                    'bg-amber-500 hover:bg-amber-600',
                                                    () => handleStatusChange(record.studentId, 'LATE'),
                                                    'Trễ',
                                                )}
                                            </td>
                                            <td className="px-3 py-2 border-b text-center">
                                                {cellBtn(
                                                    record.status === 'EXCUSED',
                                                    'bg-blue-600 hover:bg-blue-700',
                                                    () => handleStatusChange(record.studentId, 'EXCUSED'),
                                                    'Phép',
                                                )}
                                            </td>
                                            <td className="px-3 py-2 border-b">
                                                <input
                                                    type="text"
                                                    value={record.note || ''}
                                                    onChange={(e) => handleNoteChange(record.studentId, e.target.value)}
                                                    placeholder="Nhập ghi chú..."
                                                    className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                />
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Footer - fixed at bottom */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3 flex-shrink-0">
                <button
                    onClick={onClose}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    Đóng
                </button>
                <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="flex-1 px-4 py-2 border border-transparent text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Đang lưu...' : 'Lưu điểm danh'}
                </button>
            </div>
        </div>
    );
};

export default AttendanceModal;
