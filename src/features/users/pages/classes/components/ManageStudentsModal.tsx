import React, { useState, useEffect } from 'react';
import { X, Plus, Eye, UserMinus, Settings, ChevronDown } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StudentDetailsModal from './StudentDetailsModal';
import AddStudentModal from './AddStudentModal';
import {
    getClassStudents,
    enrollStudent,
    updateEnrollment,
    revokeEnrollment
} from '@/api/class-students';
import type { EnrollmentResponse } from '@/shared/types/classes';
import { useToast } from '@/shared/hooks/useToast';
import {
    ENROLLMENT_STATUS_LABEL,
    ENROLLMENT_STATUS_CLASS,
    ENROLLMENT_STATUS_API
} from '@/shared/constants/enrollment-status';

type Instructor = {
    id: string;
    name: string;
    initial: string;
    avatar?: string;
};

type Class = {
    id: string;
    name: string;
    description: string;
    program: string;
    startDate: string;
    schedule: string;
    location: string;
    students: number;
    maxStudents: number;
    instructors: Instructor[];
    status: 'Chuẩn bị' | 'Đang học' | 'Hoàn thành' | 'Tạm dừng';
};

type StudentEnrollment = EnrollmentResponse & {
    initial: string;
};

interface ManageStudentsModalProps {
    classItem: Class;
    onClose?: () => void;
}

const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ classItem, onClose }) => {
    const [selectedStudent, setSelectedStudent] = useState<StudentEnrollment | null>(null);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [rows, setRows] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const { success, error } = useToast();

    // Load students when modal opens or filter changes
    useEffect(() => {
        loadStudents();
    }, [classItem.id, statusFilter]);

    const loadStudents = async () => {
        try {
            setLoading(true);
            const statusParam = ENROLLMENT_STATUS_API[statusFilter] || '';
            const res = await getClassStudents(Number(classItem.id), {
                status: statusParam,
                page: 0,
                size: 50,
                sort: 'student.fullName,asc'
            });
            setRows(res.items ?? []);            // ✅ luôn có mảng
        } catch (e) {
            console.error('Error loading students:', e);
            setRows([]);                         // ✅ fallback rỗng
        } finally {
            setLoading(false);
        }
    };

    const handleAddStudents = async (studentIds: string[]) => {
        try {
            // Enroll each selected student
            const enrollPromises = studentIds.map(studentId =>
                enrollStudent(Number(classItem.id), {
                    studentId: Number(studentId),
                    enrolledAt: new Date().toISOString().split('T')[0],
                    note: "Ghi danh từ giao diện quản lý"
                })
            );

            await Promise.all(enrollPromises);

            success(`Đã thêm ${studentIds.length} học viên vào lớp`);

            // Reload students list
            await loadStudents();
            setOpenAddStudent(false);
        } catch (error) {
            console.error('Error enrolling students:', error);
            error("Không thể thêm học viên vào lớp");
        }
    };

    const handleViewDetails = (student: StudentEnrollment) => {
        setSelectedStudent(student);
    };

    const handleRemoveFromClass = async (student: StudentEnrollment) => {
        try {
            await revokeEnrollment(Number(classItem.id), student.enrollmentId);
            success(`Đã xóa học viên ${student.studentName} khỏi lớp`);
            // Reload students list
            await loadStudents();
        } catch (error) {
            console.error('Error removing student:', error);
            error("Không thể xóa học viên khỏi lớp");
        }
    };

    const handleAddStudent = () => {
        setOpenAddStudent(true);
    };

    return (
        <div className="bg-white rounded-lg">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Quản lý Học viên - {classItem.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Xem và quản lý danh sách học viên của lớp học
                    </p>
                </div>
                <button
                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                    onClick={() => {
                        console.log('Close button clicked');
                        onClose?.();
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Filter and Actions */}
            <div className="px-4 py-3 border-b space-y-3">
                <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Sĩ số: {rows.length}/{classItem.maxStudents} học viên
                    </div>
                    <button
                        onClick={handleAddStudent}
                        className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                    >
                        <Plus size={16} />
                        Thêm học viên
                    </button>
                </div>

                {/* Status Filter Dropdown */}
                <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Lọc theo trạng thái:</label>
                    <div className="relative">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="h-9 rounded-md border px-3 text-sm bg-white pr-8 appearance-none focus:ring-2 focus:ring-blue-200"
                        >
                            <option>Tất cả trạng thái</option>
                            <option>Đang học</option>
                            <option>Bảo lưu</option>
                            <option>Đã thôi học</option>
                        </select>
                        <ChevronDown size={16} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                    </div>
                </div>
            </div>

            {/* Students List */}
            <div className="max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b bg-gray-50 text-xs text-gray-500 grid grid-cols-12 gap-4">
                    <div className="col-span-6">Học viên</div>
                    <div className="col-span-3">Trạng thái</div>
                    <div className="col-span-3">Thao tác</div>
                </div>

                <div className="divide-y">
                    {(rows ?? []).map((student) => {
                        const initial = student.studentName?.charAt(0)?.toUpperCase() || '?';
                        return (
                            <div key={student.enrollmentId} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                                {/* Student Info */}
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-medium">
                                        {initial}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{student.studentName}</div>
                                        <div className="text-xs text-gray-500">{student.studentEmail}</div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-3">
                                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${ENROLLMENT_STATUS_CLASS[student.status] || 'bg-gray-50 text-gray-700'}`}>
                                        {ENROLLMENT_STATUS_LABEL[student.status] || student.status}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-400">⋯</span>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48">
                                            <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                                <Eye size={14} className="mr-2" />
                                                Xem chi tiết
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => handleRemoveFromClass(student)}
                                                className="text-red-600"
                                            >
                                                <UserMinus size={14} className="mr-2" />
                                                Xóa khỏi lớp
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t flex justify-end">
                <button
                    onClick={() => {
                        console.log('Close footer button clicked');
                        onClose?.();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Đóng
                </button>
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <StudentDetailsModal
                        student={selectedStudent}
                        onClose={() => setSelectedStudent(null)}
                    />
                </div>
            )}

            <AddStudentModal
                open={openAddStudent}
                onClose={() => setOpenAddStudent(false)}
                classItem={classItem}
                onAddStudents={handleAddStudents}
            />
        </div>
    );
};

export default ManageStudentsModal;
