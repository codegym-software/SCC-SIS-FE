import React, { useState, useEffect } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    Calendar,
    GraduationCap,
    Clock,
    CheckCircle,
    BookOpen,
    MapPin,
    Users,
    BarChart3,
    FileText,
} from 'lucide-react';
import { listClasses } from '@/shared/api/classes';
import { getClassStudents } from '@/shared/api/classes';
import { useToast } from '@/shared/hooks/useToast';
import ClassLogTab from '@/features/users/pages/classes/components/journals/ClassLogTab';
import StudentAttendanceTab from './components/StudentAttendanceTab';
import type { EnrollmentResponse } from '@/shared/types/classes';
import type { StudentEnrollment } from '@/shared/types/student';
import type { StudentUI } from '@/shared/types/student-ui';

interface StudentViewProps {
    student: StudentUI;
    onClose?: () => void;
}

const StudentView: React.FC<StudentViewProps> = ({ student, onClose }) => {
    const { error: showErrorToast } = useToast();
    const [activeTab, setActiveTab] = useState('info');
    const [selectedClass, setSelectedClass] = useState<any | null>(null);

    // Load student's enrollments when viewing classes tab
    useEffect(() => {
        // Auto-select first enrollment if available
        if (student.enrollments && student.enrollments.length > 0 && !selectedClass) {
            const firstEnrollment = student.enrollments[0];
            setSelectedClass({
                classId: firstEnrollment.classId,
                name: firstEnrollment.className,
                programName: firstEnrollment.programName,
                centerName: '',
                status: firstEnrollment.status,
            });
        }
    }, [student.enrollments, selectedClass]);

    // Function để tính overall status từ enrollments
    const calculateOverallStatus = (enrollments: StudentEnrollment[]): 'Đang chờ' | 'Đang học' | 'Nghỉ học' => {
        if (enrollments.length === 0) return 'Đang chờ';

        const hasActive = enrollments.some((e) => e.status === 'ACTIVE');
        const hasSuspended = enrollments.some((e) => e.status === 'SUSPENDED');
        const hasDropped = enrollments.some((e) => e.status === 'DROPPED');

        if (hasActive) return 'Đang học';
        if (hasSuspended) return 'Đang chờ';
        if (hasDropped) return 'Nghỉ học';

        return 'Đang chờ';
    };

    const getEnrollmentStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-50 text-green-700';
            case 'SUSPENDED':
                return 'bg-yellow-50 text-yellow-700';
            case 'DROPPED':
                return 'bg-red-50 text-red-700';
            case 'GRADUATED':
                return 'bg-blue-50 text-blue-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const getEnrollmentStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang học';
            case 'SUSPENDED':
                return 'Bảo lưu';
            case 'DROPPED':
                return 'Đã nghỉ';
            case 'GRADUATED':
                return 'Tốt nghiệp';
            default:
                return status;
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Đang học':
                return <CheckCircle size={16} className="text-green-600" />;
            case 'Bảo lưu':
                return <Clock size={16} className="text-orange-600" />;
            case 'Tốt nghiệp':
                return <GraduationCap size={16} className="text-blue-600" />;
            case 'Tạm dừng':
                return <Clock size={16} className="text-gray-600" />;
            default:
                return <Clock size={16} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Đang học':
                return 'bg-green-50 text-green-700';
            case 'Bảo lưu':
                return 'bg-orange-50 text-orange-700';
            case 'Tốt nghiệp':
                return 'bg-blue-50 text-blue-700';
            case 'Tạm dừng':
                return 'bg-gray-50 text-gray-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const tabs = [
        { id: 'info', label: 'Thông tin', icon: User },
        { id: 'classes', label: 'Lớp học', icon: BookOpen },
        { id: 'attendance', label: 'Điểm danh', icon: Users },
        { id: 'scores', label: 'Điểm thi', icon: BarChart3 },
        { id: 'logs', label: 'Nhật ký', icon: FileText },
    ];

    const renderTabContent = () => {
        switch (activeTab) {
            case 'info':
                return (
                    <div className="space-y-6">
                        {/* Personal Information */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Thông tin cá nhân</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Mail size={16} className="text-gray-500" />
                                    <span className="text-sm">{student.email}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Phone size={16} className="text-gray-500" />
                                    <span className="text-sm">{student.phone}</span>
                                </div>
                                {student.address && (
                                    <div className="flex items-center gap-3">
                                        <MapPin size={16} className="text-gray-500" />
                                        <span className="text-sm">{student.address}</span>
                                    </div>
                                )}
                                {student.dob && (
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span className="text-sm">Sinh: {student.dob}</span>
                                    </div>
                                )}
                                {student.gender && (
                                    <div className="flex items-center gap-3">
                                        <User size={16} className="text-gray-500" />
                                        <span className="text-sm">
                                            Giới tính:{' '}
                                            {student.gender === 'MALE'
                                                ? 'Nam'
                                                : student.gender === 'FEMALE'
                                                  ? 'Nữ'
                                                  : student.gender === 'OTHER'
                                                    ? 'Khác'
                                                    : student.gender}
                                        </span>
                                    </div>
                                )}
                                {student.nationalIdNo && (
                                    <div className="flex items-center gap-3">
                                        <Calendar size={16} className="text-gray-500" />
                                        <span className="text-sm">CMND/CCCD: {student.nationalIdNo}</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Academic Information */}
                        <div>
                            <h4 className="text-sm font-medium text-gray-900 mb-4">Thông tin học tập</h4>
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <Calendar size={16} className="text-gray-500" />
                                    <span className="text-sm">Đăng ký: {student.registrationDate}</span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={16} className="text-green-500" />
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            calculateOverallStatus(student.enrollments) === 'Đang học'
                                                ? 'bg-green-50 text-green-700'
                                                : calculateOverallStatus(student.enrollments) === 'Đang chờ'
                                                  ? 'bg-yellow-50 text-yellow-700'
                                                  : 'bg-red-50 text-red-700'
                                        }`}
                                    >
                                        {calculateOverallStatus(student.enrollments)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-3">
                                    <BookOpen size={16} className="text-gray-500" />
                                    <span className="text-sm">{student.enrollments.length} lớp học</span>
                                </div>
                            </div>
                        </div>
                    </div>
                );

            case 'classes':
                return (
                    <div className="space-y-4">
                        <h4 className="text-sm font-medium text-gray-900">Danh sách lớp học đã đăng ký</h4>

                        {student.enrollments.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">Chưa đăng ký lớp học nào</div>
                        ) : (
                            <div className="space-y-3">
                                {student.enrollments.map((enrollment) => (
                                    <div key={enrollment.enrollmentId} className="border rounded-lg p-4 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <h5 className="font-medium text-gray-900">{enrollment.className}</h5>
                                                <p className="text-sm text-gray-500">{enrollment.programName}</p>
                                                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                                                    <span>Đăng ký: {enrollment.enrolledAt}</span>
                                                    {enrollment.leftAt && <span>Kết thúc: {enrollment.leftAt}</span>}
                                                </div>
                                            </div>
                                            <span
                                                className={`px-2 py-1 rounded-full text-xs font-medium ${getEnrollmentStatusColor(enrollment.status)}`}
                                            >
                                                {getEnrollmentStatusText(enrollment.status)}
                                            </span>
                                        </div>

                                        {enrollment.enrollmentNote && (
                                            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                                                Ghi chú: {enrollment.enrollmentNote}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                );

            case 'attendance':
                return <StudentAttendanceTab student={student} />;

            case 'scores':
                return (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h4 className="text-sm font-medium text-gray-900">Bảng điểm</h4>
                            <span className="text-sm text-gray-600">Điểm trung bình: 8.75</span>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b">
                                        <th className="text-left py-2">Module</th>
                                        <th className="text-left py-2">Loại thi</th>
                                        <th className="text-left py-2">Lý thuyết</th>
                                        <th className="text-left py-2">Thực hành</th>
                                        <th className="text-left py-2">Tổng kết</th>
                                        <th className="text-left py-2">Ngày thi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr className="border-b">
                                        <td className="py-2">JAVA101 (Java Cơ bản)</td>
                                        <td className="py-2">Giữa kỳ</td>
                                        <td className="py-2">8.5</td>
                                        <td className="py-2">9.0</td>
                                        <td className="py-2 font-bold">8.8</td>
                                        <td className="py-2">2024-12-20</td>
                                    </tr>
                                    <tr className="border-b">
                                        <td className="py-2">JAVA101 (Java Cơ bản)</td>
                                        <td className="py-2">Bài tập lớn</td>
                                        <td className="py-2">8.0</td>
                                        <td className="py-2">9.5</td>
                                        <td className="py-2 font-bold">8.8</td>
                                        <td className="py-2">2024-12-15</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                );

            case 'logs':
                return (
                    <div className="space-y-4">
                        {/* Class Selector - Scrollable horizontal list */}
                        {student.enrollments && student.enrollments.length > 0 ? (
                            <div>
                                <label className="block text-sm font-medium text-gray-900 mb-3">
                                    Chọn lớp học để xem nhật ký
                                </label>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                                    {student.enrollments.map((enrollment) => (
                                        <button
                                            key={enrollment.classId}
                                            onClick={() =>
                                                setSelectedClass({
                                                    classId: enrollment.classId,
                                                    name: enrollment.className,
                                                    programName: enrollment.programName,
                                                    centerName: '',
                                                    status: enrollment.status,
                                                })
                                            }
                                            className={`flex-shrink-0 px-4 py-3 rounded-lg border-2 transition-all ${
                                                selectedClass?.classId === enrollment.classId
                                                    ? 'border-blue-500 bg-blue-50'
                                                    : 'border-gray-200 bg-white hover:border-blue-300'
                                            }`}
                                        >
                                            <div className="text-left">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {enrollment.className}
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                    {enrollment.programName}
                                                </div>
                                                <span className={`inline-block mt-1 px-2 py-0.5 rounded-full text-xs ${getEnrollmentStatusColor(enrollment.status)}`}>
                                                    {getEnrollmentStatusText(enrollment.status)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <BookOpen size={48} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-600">Học viên chưa được gán vào lớp học nào</p>
                            </div>
                        )}

                        {/* Journal List for Selected Class */}
                        {selectedClass && (
                            <div className="mt-4">
                                <ClassLogTab selectedClass={selectedClass} readOnly={true} />
                            </div>
                        )}
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg w-full">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                        <User size={16} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Hồ sơ Học viên - {student.name}</h2>
                        <p className="text-sm text-gray-500">{student.studentId}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100" onClick={onClose}>
                    <X size={20} />
                </button>
            </div>

            {/* Tabs Navigation */}
            <div className="px-4 py-2 border-b">
                <div className="flex space-x-1">
                    {tabs.map((tab) => {
                        const IconComponent = tab.icon;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                    activeTab === tab.id
                                        ? 'bg-gray-100 text-gray-900'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                }`}
                            >
                                <IconComponent size={14} />
                                {tab.label}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 py-4">{renderTabContent()}</div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default StudentView;
