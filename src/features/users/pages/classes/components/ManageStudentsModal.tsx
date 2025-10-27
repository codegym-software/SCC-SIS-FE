import React, { useState, useEffect } from 'react';
import { X, Plus, Eye, UserMinus, Edit2 } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StudentDetailsModal from './StudentDetailsModal';
import AddStudentModal from './AddStudentModal';
import { getClassStudents, removeStudentFromClass, updateEnrollment } from '@/shared/api/classes';
import { useToast } from '@/shared/hooks/useToast';
import type { EnrollmentResponse } from '@/shared/types/classes';

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

type Student = {
    enrollmentId: number;
    studentId: number;
    name: string;
    email: string;
    phone?: string;
    initial: string;
    status: string;
    enrolledAt: string;
    leftAt?: string;
    note?: string;
};

interface ManageStudentsModalProps {
    classItem: Class;
    onClose?: () => void;
}

const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ classItem, onClose }) => {
    const { success: showSuccessToast, error: showErrorToast } = useToast();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStatus, setEditingStatus] = useState<number | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [newNote, setNewNote] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');

    // Load students from API
    useEffect(() => {
        loadStudents();
    }, [classItem.id]);

    const loadStudents = async () => {
        try {
            setIsLoading(true);
            // Load ALL students, not just ACTIVE
            const response = await getClassStudents(parseInt(classItem.id), {
                page: 0,
                size: 1000
            });
            
            const enrollments: EnrollmentResponse[] = response.data.content || response.data;
            const formattedStudents: Student[] = enrollments.map(enrollment => ({
                enrollmentId: enrollment.enrollmentId,
                studentId: enrollment.studentId,
                name: enrollment.studentName,
                email: enrollment.studentEmail,
                initial: enrollment.studentName.charAt(0).toUpperCase(),
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
                leftAt: enrollment.leftAt,
                note: enrollment.note
            }));
            
            setStudents(formattedStudents);
        } catch (error: any) {
            console.error('Error loading students:', error);
            showErrorToast(error?.response?.data?.message || 'Không thể tải danh sách học viên');
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddStudents = () => {
        // Reload the student list after adding
        loadStudents();
        setOpenAddStudent(false);
    };

    const handleViewDetails = (student: StudentEnrollment) => {
        setSelectedStudent(student);
    };

    const handleRemoveFromClass = async (student: Student) => {
        try {
            await removeStudentFromClass(
                parseInt(classItem.id), 
                student.enrollmentId,
                'Xóa bởi giáo viên/quản trị'
            );
            
            showSuccessToast(`Đã xóa học viên ${student.name} khỏi lớp`);
            // Reload the student list
            loadStudents();
        } catch (error: any) {
            console.error('Error removing student:', error);
            showErrorToast(error?.response?.data?.message || 'Có lỗi xảy ra khi xóa học viên');
        }
    };

    const handleAddStudent = () => {
        setOpenAddStudent(true);
    };

    const handleChangeStatus = async (student: Student) => {
        if (!newStatus) return;
        
        try {
            const payload: any = {
                status: newStatus
            };
            
            // Add note if changed or provided
            if (newNote.trim()) {
                payload.note = newNote.trim();
            }
            
            await updateEnrollment(parseInt(classItem.id), student.enrollmentId, payload);
            
            const statusText = newStatus === 'ACTIVE' ? 'Đang học' :
                             newStatus === 'SUSPENDED' ? 'Bảo lưu' :
                             newStatus === 'COMPLETED' ? 'Hoàn thành' :
                             newStatus === 'DROPPED' ? 'Đã nghỉ' : newStatus;
            
            showSuccessToast(`Đã cập nhật trạng thái thành ${statusText}`);
            setEditingStatus(null);
            setNewNote('');
            loadStudents();
        } catch (error: any) {
            console.error('Error updating status:', error);
            showErrorToast(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const getStatusText = (status: string) => {
        switch(status) {
            case 'ACTIVE': return 'Đang học';
            case 'SUSPENDED': return 'Bảo lưu';
            case 'COMPLETED': return 'Hoàn thành';
            case 'DROPPED': return 'Đã nghỉ';
            default: return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch(status) {
            case 'ACTIVE': return 'bg-green-100 text-green-700';
            case 'SUSPENDED': return 'bg-orange-100 text-orange-700';
            case 'COMPLETED': return 'bg-blue-100 text-blue-700';
            case 'DROPPED': return 'bg-gray-100 text-gray-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    // Filter students based on status filter
    const filteredStudents = statusFilter === 'ALL' 
        ? students 
        : students.filter(s => s.status === statusFilter);

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

            {/* Student Count and Add Button */}
            <div className="px-4 py-3 border-b flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Sĩ số: {students.filter(s => s.status === 'ACTIVE').length}/{classItem.maxStudents} học viên
                        <span className="text-gray-400 ml-2">(Tổng: {students.length})</span>
                    </div>
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="text-sm border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <option value="ALL">Tất cả trạng thái</option>
                        <option value="ACTIVE">Đang học</option>
                        <option value="SUSPENDED">Bảo lưu</option>
                        <option value="COMPLETED">Hoàn thành</option>
                        <option value="DROPPED">Đã nghỉ</option>
                    </select>
                </div>
            </div>

            {/* Students List */}
            <div className="max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b bg-gray-50 text-xs text-gray-500 grid grid-cols-12 gap-4">
                    <div className="col-span-5">Học viên</div>
                    <div className="col-span-4">Trạng thái</div>
                    <div className="col-span-3">Thao tác</div>
                </div>

                {isLoading ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                        Đang tải danh sách học viên...
                    </div>
                ) : filteredStudents.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                        {statusFilter === 'ALL' ? 'Chưa có học viên nào trong lớp' : `Không có học viên ${getStatusText(statusFilter)}`}
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredStudents.map((student) => (
                            <div key={student.enrollmentId} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                            {/* Student Info */}
                            <div className="col-span-5 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-medium">
                                    {student.initial}
                                </div>

                            {/* Status */}
                            <div className="col-span-4">
                                {editingStatus === student.enrollmentId ? (
                                    <div className="space-y-2">
                                        <select
                                            value={newStatus}
                                            onChange={(e) => setNewStatus(e.target.value)}
                                            className="w-full text-xs border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
                                            autoFocus
                                        >
                                            <option value="">Chọn trạng thái</option>
                                            <option value="ACTIVE">Đang học</option>
                                            <option value="SUSPENDED">Bảo lưu</option>
                                            <option value="COMPLETED">Hoàn thành</option>
                                            <option value="DROPPED">Đã nghỉ</option>
                                        </select>
                                        <textarea
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            placeholder="Ghi chú (tùy chọn)"
                                            className="w-full text-xs border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200 resize-none"
                                            rows={2}
                                        />
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleChangeStatus(student)}
                                                disabled={!newStatus || newStatus === student.status}
                                                className="flex-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                            >
                                                Lưu
                                            </button>
                                            <button
                                                onClick={() => {
                                                    setEditingStatus(null);
                                                    setNewNote('');
                                                }}
                                                className="flex-1 text-xs px-2 py-1 border rounded hover:bg-gray-50"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(student.status)}`}>
                                                {getStatusText(student.status)}
                                            </span>
                                            <button
                                                onClick={() => {
                                                    setEditingStatus(student.enrollmentId);
                                                    setNewStatus(student.status);
                                                    setNewNote(student.note || '');
                                                }}
                                                className="text-gray-400 hover:text-blue-600"
                                                title="Đổi trạng thái"
                                            >
                                                <Edit2 size={14} />
                                            </button>
                                        </div>
                                        {student.note && (
                                            <div className="text-xs text-gray-500 italic">
                                                Note: {student.note}
                                            </div>
                                        )}
                                    </div>
                                )}
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
                            </div>
                        ))}
                    </div>
                )}
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
                        classId={parseInt(classItem.id)}
                        onClose={() => setSelectedStudent(null)}
                        onStatusUpdated={loadStudents}
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
