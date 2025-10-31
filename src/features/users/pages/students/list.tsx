import { User, Mail, Phone, Calendar, GraduationCap, Clock, CheckCircle, X } from 'lucide-react';
import { useMemo } from 'react';
import StudentActions from './components/actions';
import type { StudentEnrollment } from '@/shared/types/student';
import type { StudentUI } from '@/shared/types/student-ui';

interface StudentListProps {
    students: StudentUI[];
    totalStudents: number;
    currentPage: number;
    totalPages: number;
    onView?: (student: StudentUI) => void;
    onEdit?: (student: StudentUI) => void;
    onChangeStatus?: (student: StudentUI) => void;
    onDelete?: (student: StudentUI) => void;
    openMenuId?: string | null;
    onMenuToggle?: (id: string) => void;
    onPageChange?: (page: number) => void;
}

const StudentList: React.FC<StudentListProps> = ({ 
    students, 
    totalStudents,
    currentPage,
    totalPages,
    onView,
    onEdit,
    onChangeStatus,
    onDelete,
    openMenuId, 
    onMenuToggle,
    onPageChange
}) => {
    // Function để tính overall status từ enrollments
const calculateOverallStatus = (enrollments: StudentEnrollment[]): 'Đang chờ' | 'Đang học' | 'Nghỉ học' | 'Tốt nghiệp' => {
    if (enrollments.length === 0) return 'Đang chờ';
    
    const hasActive = enrollments.some(e => e.status === 'ACTIVE');
    const hasDropped = enrollments.some(e => e.status === 'DROPPED');
    const hasGraduated = enrollments.some(e => e.status === 'GRADUATED');
    const hasSuspended = enrollments.some(e => e.status === 'SUSPENDED');
    
    if (hasActive) return 'Đang học';
    if (hasDropped) return 'Nghỉ học';
    if (hasGraduated) return 'Tốt nghiệp';
    if (hasSuspended) return 'Đang chờ';
    
    return 'Đang chờ';
};

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Đang chờ':
                return <Clock size={14} className="text-yellow-600" />;
            case 'Đang học':
                return <CheckCircle size={14} className="text-green-600" />;
            case 'Nghỉ học':
                return <X size={14} className="text-red-600" />;
            case 'Tốt nghiệp':
                return <GraduationCap size={14} className="text-blue-600" />;
            default:
                return <Clock size={14} className="text-gray-600" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Đang chờ':
                return 'bg-yellow-50 text-yellow-700';
            case 'Đang học':
                return 'bg-green-50 text-green-700';
            case 'Nghỉ học':
                return 'bg-red-50 text-red-700';
            case 'Tốt nghiệp':
                return 'bg-blue-50 text-blue-700';
            default:
                return 'bg-gray-50 text-gray-700';
        }
    };

    const getEnrollmentStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700';
            case 'SUSPENDED':
                return 'bg-yellow-100 text-yellow-700';
            case 'DROPPED':
                return 'bg-red-100 text-red-700';
            case 'GRADUATED':
                return 'bg-blue-100 text-blue-700';
            default:
                return 'bg-gray-100 text-gray-700';
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

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="px-3 py-3 border-b flex items-start gap-2">
                <div>
                    <div className="text-sm font-medium">Danh sách Học viên</div>
                    <div className="text-xs text-gray-500">
                        Quản lý tất cả hồ sơ học viên ({totalStudents} kết quả)
                    </div>
                </div>
            </div>

            <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
                <div className="col-span-3">Học viên</div>
                <div className="col-span-3">Liên hệ</div>
                <div className="col-span-2">Ngày đăng ký</div>
                <div className="col-span-2">Lớp học</div>
                <div className="col-span-1">Trạng thái</div>
                <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
                {students.map((student) => (
                    <div
                        key={student.id}
                        className="px-3 py-3 grid grid-cols-12 gap-3 items-center relative"
                    >
                        {/* Student Info */}
                        <div className="col-span-3 flex items-center gap-3">
                            {student.avatar ? (
                                <img
                                    src={student.avatar}
                                    alt={student.name}
                                    className="h-8 w-8 rounded-full object-cover border border-gray-200"
                                />
                            ) : (
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-medium">
                                    {student.initial}
                                </div>
                            )}
                            <div>
                                <div className="text-sm font-medium">{student.name}</div>
                                <div className="text-xs text-gray-500">({student.studentId})</div>
                            </div>
                        </div>

                        {/* Contact Info */}
                        <div className="col-span-3 space-y-1">
                            <div className="text-sm flex items-center gap-2">
                                <Mail size={12} className="text-gray-400" />
                                <span className="text-xs">{student.email}</span>
                            </div>
                            <div className="text-sm flex items-center gap-2">
                                <Phone size={12} className="text-gray-400" />
                                <span className="text-xs">{student.phone}</span>
                            </div>
                        </div>

                        {/* Registration Date */}
                        <div className="col-span-2 flex items-center gap-2">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-sm">{student.registrationDate}</span>
                        </div>

                        {/* Classes - chỉ hiển thị tên lớp và chương trình */}
                        <div className="col-span-2">
                            {student.enrollments && student.enrollments.length > 0 ? (
                                <div className="flex flex-col gap-1.5">
                                    {student.enrollments.slice(0, 2).map((enrollment, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-900">
                                                {enrollment.className}
                                            </span>
                                            <span className="text-[10px] text-gray-500">
                                                {enrollment.programName}
                                            </span>
                                        </div>
                                    ))}
                                    {student.enrollments.length > 2 && (
                                        <span className="text-xs text-[#717182]">
                                            +{student.enrollments.length - 2} lớp nữa
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div className="text-sm text-gray-500">Chưa có lớp</div>
                            )}
                        </div>

                        {/* Overall Status */}
                        <div className="col-span-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                                student.status === 'Đang học' ? 'bg-green-50 text-green-700' :
                                student.status === 'Đang chờ' ? 'bg-yellow-50 text-yellow-700' :
                                student.status === 'Nghỉ học' ? 'bg-red-50 text-red-700' :
                                'bg-blue-50 text-blue-700'
                            }`}>
                                {student.status === 'Đang học' ? <CheckCircle size={14} className="text-green-600" /> :
                                 student.status === 'Đang chờ' ? <Clock size={14} className="text-yellow-600" /> :
                                 student.status === 'Nghỉ học' ? <X size={14} className="text-red-600" /> :
                                 <GraduationCap size={14} className="text-blue-600" />}
                                {student.status}
                            </span>
                        </div>

                        {/* Actions */}
                        <div className="col-span-1">
                            <StudentActions 
                                onView={() => onView?.(student)}
                                onEdit={() => onEdit?.(student)}
                                onChangeStatus={() => onChangeStatus?.(student)}
                                onRemove={() => onDelete?.(student)}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            <div className="px-3 py-3 border-t flex items-center justify-between text-sm text-gray-500">
                <div>
                    Hiển thị {((currentPage - 1) * 8) + 1} - {Math.min(currentPage * 8, totalStudents)} trong số {totalStudents} kết quả
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => onPageChange?.(currentPage - 1)}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    
                    {/* Page numbers */}
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                        <button
                            key={page}
                            onClick={() => onPageChange?.(page)}
                            className={`px-2 py-1 text-xs rounded ${
                                currentPage === page 
                                    ? 'bg-gray-900 text-white' 
                                    : 'border hover:bg-gray-50'
                            }`}
                        >
                            {page}
                        </button>
                    ))}
                    
                    <button 
                        onClick={() => onPageChange?.(currentPage + 1)}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs border rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
            </div>
        </section>
    );
};

export default StudentList;
