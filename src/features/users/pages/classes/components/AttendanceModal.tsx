import React, { useState, useEffect } from 'react';
import { Calendar, Users, CheckCircle, XCircle, Clock, AlertCircle, X } from 'lucide-react';
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
}

const AttendanceModal: React.FC<AttendanceModalProps> = ({ classItem, onClose }) => {
    const { success: showSuccessToast, error: showErrorToast } = useToast();
    const [students, setStudents] = useState<Student[]>([]);
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
                    phone: enrollment.student.phone
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
                    note: record.note
                }));

                setAttendanceRecords(attendanceData);
            } catch (error) {
                console.error('Error fetching attendance:', error);
                // Initialize with default records if no data
                const defaultRecords: AttendanceRecord[] = students.map(student => ({
                    id: 0,
                    studentId: student.id,
                    studentName: student.fullName,
                    date: selectedDate,
                    status: 'PRESENT',
                    note: ''
                }));
                setAttendanceRecords(defaultRecords);
            }
        };

        if (students.length > 0) {
            fetchAttendance();
        }
    }, [selectedDate, students, classItem.id]);

    const handleStatusChange = (studentId: number, status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED') => {
        setAttendanceRecords(prev => 
            prev.map(record => 
                record.studentId === studentId 
                    ? { ...record, status }
                    : record
            )
        );
    };

    const handleNoteChange = (studentId: number, note: string) => {
        setAttendanceRecords(prev => 
            prev.map(record => 
                record.studentId === studentId 
                    ? { ...record, note }
                    : record
            )
        );
    };

    const handleSubmit = async () => {
        try {
            setIsSubmitting(true);
            
            const attendanceData = attendanceRecords.map(record => ({
                studentId: record.studentId,
                date: selectedDate,
                status: record.status,
                note: record.note || null
            }));

            await http.post(`/api/classes/${classItem.id}/attendance`, {
                date: selectedDate,
                records: attendanceData
            });

            showSuccessToast('Lưu điểm danh thành công', 'Điểm danh đã được lưu');
        } catch (error) {
            console.error('Error saving attendance:', error);
            showErrorToast('Lỗi lưu điểm danh', 'Không thể lưu điểm danh');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'ABSENT':
                return <XCircle size={16} className="text-red-600" />;
            case 'LATE':
                return <Clock size={16} className="text-yellow-600" />;
            case 'EXCUSED':
                return <AlertCircle size={16} className="text-blue-600" />;
            default:
                return <CheckCircle size={16} className="text-gray-400" />;
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case 'PRESENT':
                return 'Có mặt';
            case 'ABSENT':
                return 'Vắng mặt';
            case 'LATE':
                return 'Đi muộn';
            case 'EXCUSED':
                return 'Có phép';
            default:
                return status;
        }
    };

    const getStatusCounts = () => {
        const counts = {
            present: 0,
            absent: 0,
            late: 0,
            excused: 0
        };

        attendanceRecords.forEach(record => {
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
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">Điểm danh lớp học</h2>
                    <p className="text-sm text-gray-600 mt-1">{classItem.name}</p>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Date Selection */}
            <div className="px-6 py-4 border-b border-gray-200">
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

            {/* Statistics */}
            <div className="px-6 py-4 border-b border-gray-200">
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

            {/* Attendance List */}
            <div className="px-6 py-4">
                {isLoading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải danh sách học viên...</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {attendanceRecords.map((record) => (
                            <div key={record.studentId} className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg">
                                <div className="flex-shrink-0">
                                    {getStatusIcon(record.status)}
                                </div>
                                
                                <div className="flex-1">
                                    <div className="font-medium text-gray-900">{record.studentName}</div>
                                </div>

                                <div className="flex items-center gap-2">
                                    <select
                                        value={record.status}
                                        onChange={(e) => handleStatusChange(record.studentId, e.target.value as any)}
                                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="PRESENT">Có mặt</option>
                                        <option value="ABSENT">Vắng mặt</option>
                                        <option value="LATE">Đi muộn</option>
                                        <option value="EXCUSED">Có phép</option>
                                    </select>
                                </div>

                                <div className="flex-1">
                                    <input
                                        type="text"
                                        value={record.note || ''}
                                        onChange={(e) => handleNoteChange(record.studentId, e.target.value)}
                                        placeholder="Ghi chú..."
                                        className="w-full px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-200 flex gap-3">
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