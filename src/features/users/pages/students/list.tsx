import { User, Mail, Phone, Calendar, GraduationCap, Clock, CheckCircle } from 'lucide-react';
import { useMemo } from 'react';
import StudentActions from './components/actions';

type Student = {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    initial: string;
    class: string;
    program: string;
    classes: Array<{ className: string; programName: string }>; // Multiple classes
    registrationDate: string;
    status: 'Đang học' | 'Bảo lưu' | 'Tốt nghiệp' | 'Tạm dừng';
    avatar?: string;
};

interface StudentListProps {
    students: Student[];
    totalStudents: number;
    currentPage: number;
    totalPages: number;
    onView?: (student: Student) => void;
    onEdit?: (student: Student) => void;
    onChangeStatus?: (student: Student) => void;
    onDelete?: (student: Student) => void;
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
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Đang học':
                return <CheckCircle size={14} className="text-green-600" />;
            case 'Bảo lưu':
                return <Clock size={14} className="text-orange-600" />;
            case 'Tốt nghiệp':
                return <GraduationCap size={14} className="text-blue-600" />;
            case 'Tạm dừng':
                return <Clock size={14} className="text-gray-600" />;
            default:
                return <Clock size={14} className="text-gray-600" />;
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
                <div className="col-span-2">Lớp học</div>
                <div className="col-span-2">Ngày đăng ký</div>
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

                        {/* Class Info - Show multiple classes vertically */}
                        <div className="col-span-2">
                            {student.classes && student.classes.length > 0 ? (
                                <div className="flex flex-col gap-1.5">
                                    {student.classes.slice(0, 2).map((cls, idx) => (
                                        <div key={idx} className="flex flex-col">
                                            <span className="text-xs font-medium text-gray-900">{cls.className}</span>
                                            <span className="text-[10px] text-gray-500">{cls.programName}</span>
                                        </div>
                                    ))}
                                    {student.classes.length > 2 && (
                                        <span className="text-xs text-[#717182]">
                                            +{student.classes.length - 2} lớp nữa
                                        </span>
                                    )}
                                </div>
                            ) : (
                                <div>
                                    <div className="text-sm font-medium">{student.class}</div>
                                    <div className="text-xs text-gray-500">{student.program}</div>
                                </div>
                            )}
                        </div>

                        {/* Registration Date */}
                        <div className="col-span-2 flex items-center gap-2">
                            <Calendar size={12} className="text-gray-400" />
                            <span className="text-sm">{student.registrationDate}</span>
                        </div>

                        {/* Status */}
                        <div className="col-span-1">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(student.status)}`}>
                                {getStatusIcon(student.status)}
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
