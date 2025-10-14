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
    registrationDate: string;
    status: 'Đang học' | 'Bảo lưu' | 'Tốt nghiệp' | 'Tạm dừng';
};

interface StudentListProps {
    students: Student[];
    onView?: (student: Student) => void;
    onEdit?: (student: Student) => void;
    onChangeStatus?: (student: Student) => void;
    onDelete?: (student: Student) => void;
    openMenuId?: string | null;
    onMenuToggle?: (id: string) => void;
}

const StudentList: React.FC<StudentListProps> = ({ 
    students, 
    onView, 
    onEdit,
    onChangeStatus,
    onDelete,
    openMenuId, 
    onMenuToggle 
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
                        Quản lý tất cả hồ sơ học viên ({students.length} kết quả)
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
                            <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-medium">
                                {student.initial}
                            </div>
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

                        {/* Class Info */}
                        <div className="col-span-2">
                            <div className="text-sm font-medium">{student.class}</div>
                            <div className="text-xs text-gray-500">{student.program}</div>
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
                    Hiển thị 1 - {students.length} trong số {students.length} kết quả
                </div>
                <div className="flex items-center gap-2">
                    <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Previous</button>
                    <button className="px-2 py-1 text-xs bg-gray-900 text-white rounded">1</button>
                    <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">2</button>
                    <button className="px-2 py-1 text-xs border rounded hover:bg-gray-50">Next</button>
                </div>
            </div>
        </section>
    );
};

export default StudentList;
