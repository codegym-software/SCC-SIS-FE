import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Plus, Eye, UserMinus, Edit2, AlertCircle } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StudentDetailsModal from './StudentDetailsModal';
import AddStudentModal from './AddStudentModal';
import { getClassStudents, removeStudentFromClass, updateEnrollment } from '@/shared/api/classes';
import { getStudentAttendanceHistory } from '@/shared/api/attendance';
import { getStudentGradesByStudentId } from '@/shared/api/grade-entries';
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
    studentOverallStatus: string;  // Trạng thái tổng quan của học viên
    status: string;  // Trạng thái enrollment
    enrolledAt: string;
    leftAt?: string;
    note?: string;
};

interface ManageStudentsModalProps {
    classItem: Class;
    onClose?: () => void;
    inlineMode?: boolean; // when true, render as inline panel (no close/footer)
    onStudentsChanged?: () => void; // callback when students list changes (add/remove/status)
    readOnly?: boolean; // when true, hide add/edit/delete buttons
}

const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({
    classItem,
    onClose,
    inlineMode = false,
    onStudentsChanged,
    readOnly = false,
}) => {
    const navigate = useNavigate();
    const { success: showSuccessToast, error: showErrorToast } = useToast();
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    const [students, setStudents] = useState<Student[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingStatus, setEditingStatus] = useState<number | null>(null);
    const [newStatus, setNewStatus] = useState<string>('');
    const [newNote, setNewNote] = useState<string>('');
    const [statusFilter, setStatusFilter] = useState<string>('ALL');
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1); // Current month
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Current year
    const [warningData, setWarningData] = useState<Record<number, { absences: number; failedExams: number }>>({});
    const [availableYears, setAvailableYears] = useState<number[]>([]);

    // Load students from API
    useEffect(() => {
        loadStudents();
    }, [classItem.id]);

    // Load warning data when students are loaded or month/year changes
    useEffect(() => {
        if (students.length > 0) {
            loadWarningData();
        }
    }, [students, selectedMonth, selectedYear]);

    // Auto-adjust selectedYear if not in availableYears
    useEffect(() => {
        if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
            setSelectedYear(availableYears[0]); // Set to most recent year
        }
    }, [availableYears]);

    const loadStudents = async () => {
        try {
            setIsLoading(true);
            console.log('[ManageStudentsModal] Loading ALL students (all statuses) for class:', classItem.id);

            // WORKAROUND: Backend có vấn đề với status filter
            // Khi update status sang SUSPENDED/DROPPED, API ?status=SUSPENDED trả về 0
            // Có thể backend đang soft delete thay vì chỉ update status
            // Thử gọi không có status param để xem có trả về tất cả không
            
            let allEnrollments: EnrollmentResponse[] = [];
            
            try {
                // Thử 1: Gọi KHÔNG có status param
                console.log('[ManageStudentsModal] Trying API call WITHOUT status filter...');
                const responseAll = await getClassStudents(parseInt(classItem.id), {
                    page: 0,
                    size: 1000,
                });
                
                if (responseAll.data) {
                    if (Array.isArray(responseAll.data)) {
                        allEnrollments = responseAll.data;
                    } else if (responseAll.data.content && Array.isArray(responseAll.data.content)) {
                        allEnrollments = responseAll.data.content;
                    }
                }
                
                console.log('[ManageStudentsModal] Without filter returned:', allEnrollments.length, 'students');
                
                // Nếu vẫn chỉ có ACTIVE, thì backend có vấn đề nghiêm trọng
                const hasNonActive = allEnrollments.some(e => e.status !== 'ACTIVE');
                if (!hasNonActive && allEnrollments.length > 0) {
                    console.warn('[ManageStudentsModal] ⚠️ BACKEND ISSUE: API only returns ACTIVE students even without status filter!');
                    console.warn('[ManageStudentsModal] ⚠️ Students with SUSPENDED/DROPPED/GRADUATED status are NOT being returned.');
                    console.warn('[ManageStudentsModal] ⚠️ Please check backend: enrollment may be soft deleted or filtered incorrectly.');
                }
            } catch (error) {
                console.error('[ManageStudentsModal] Failed to load without status filter:', error);
                
                // Fallback: Thử gọi với từng status
                console.log('[ManageStudentsModal] Fallback: Trying with individual status filters...');
                const statuses = ['ACTIVE', 'SUSPENDED', 'DROPPED', 'GRADUATED'];
                
                const responses = await Promise.all(
                    statuses.map(status => 
                        getClassStudents(parseInt(classItem.id), {
                            status,
                            page: 0,
                            size: 1000,
                        }).catch(err => {
                            console.warn(`[ManageStudentsModal] Failed to load ${status} students:`, err);
                            return { data: { content: [] } };
                        })
                    )
                );

                // Merge results
                responses.forEach((response, idx) => {
                    if (response.data) {
                        let enrollments: EnrollmentResponse[] = [];
                        if (Array.isArray(response.data)) {
                            enrollments = response.data;
                        } else if (response.data.content && Array.isArray(response.data.content)) {
                            enrollments = response.data.content;
                        }
                        allEnrollments.push(...enrollments);
                        console.log(`[ManageStudentsModal] ${statuses[idx]} students: ${enrollments.length}`);
                    }
                });
            }

            console.log('[ManageStudentsModal] Total enrollments (all statuses):', allEnrollments.length);
            
            // Log each enrollment with its status
            allEnrollments.forEach((e, idx) => {
                console.log(`[ManageStudentsModal] Enrollment ${idx}: ${e.studentName} - Status: ${e.status} - ID: ${e.enrollmentId}`);
            });

            const formattedStudents: Student[] = allEnrollments.map((enrollment) => ({
                enrollmentId: enrollment.enrollmentId,
                studentId: enrollment.studentId,
                name: enrollment.studentName,
                email: enrollment.studentEmail,
                initial: enrollment.studentName.charAt(0).toUpperCase(),
                studentOverallStatus: enrollment.studentOverallStatus,
                status: enrollment.status,
                enrolledAt: enrollment.enrolledAt,
                leftAt: enrollment.leftAt,
                note: enrollment.note,
            }));

            console.log('[ManageStudentsModal] Formatted students:', formattedStudents);
            console.log('[ManageStudentsModal] Student statuses:', formattedStudents.map(s => `${s.name}: ${s.status}`));
            setStudents(formattedStudents);
        } catch (error: any) {
            console.error('[ManageStudentsModal] Error loading students:', error);
            console.error('[ManageStudentsModal] Error response:', error?.response);
            showErrorToast(error?.response?.data?.message || 'Không thể tải danh sách học viên');
        } finally {
            setIsLoading(false);
        }
    };

    const loadWarningData = async () => {
        const warnings: Record<number, { absences: number; failedExams: number }> = {};
        const yearsSet = new Set<number>();
        
        for (const student of students) {
            try {
                let absences = 0;
                let failedExams = 0;

                // Get attendance data
                try {
                    const attendanceResponse = await getStudentAttendanceHistory(student.studentId, parseInt(classItem.id));
                    const attendanceData = attendanceResponse.data;
                    if (attendanceData && attendanceData.records) {
                        // Collect all years from attendance records
                        attendanceData.records.forEach(record => {
                            const recordDate = new Date(record.attendanceDate);
                            yearsSet.add(recordDate.getFullYear());
                        });

                        // Count absences for selected month/year
                        absences = attendanceData.records.filter(record => {
                            if (record.status !== 'ABSENT') return false;
                            const recordDate = new Date(record.attendanceDate);
                            return recordDate.getMonth() + 1 === selectedMonth && 
                                   recordDate.getFullYear() === selectedYear;
                        }).length;
                    }
                } catch (err) {
                    console.error('Error loading attendance for student:', student.studentId, err);
                }

                // Get grades data
                try {
                    const gradesData = await getStudentGradesByStudentId(student.studentId);
                    if (gradesData) {
                        // Collect all years from grade records
                        gradesData.forEach(grade => {
                            if (grade.entryDate) {
                                const [year] = grade.entryDate.split('-').map(Number);
                                yearsSet.add(year);
                            }
                        });

                        // Count failed exams for selected month/year
                        failedExams = gradesData.filter(grade => {
                            if (grade.passStatus !== 'FAIL') return false;
                            if (!grade.entryDate) return false;
                            const [year, month] = grade.entryDate.split('-').map(Number);
                            return month === selectedMonth && year === selectedYear;
                        }).length;
                    }
                } catch (err) {
                    console.error('Error loading grades for student:', student.studentId, err);
                }

                // Only store if there are warnings
                if (absences >= 2 || failedExams >= 2) {
                    warnings[student.studentId] = { absences, failedExams };
                }
            } catch (err) {
                console.error('Error loading warning data for student:', student.studentId, err);
            }
        }

        // Update available years (sorted descending)
        const years = Array.from(yearsSet).sort((a, b) => b - a);
        setAvailableYears(years);
        setWarningData(warnings);
    };

    const handleAddStudents = () => {
        // Reload the student list after adding
        loadStudents();
        setOpenAddStudent(false);
        onStudentsChanged?.(); // notify parent
    };

    const handleViewDetails = (student: Student) => {
        // Navigate to student detail page
        navigate(`/students/${student.studentId}`);
    };

    const handleRemoveFromClass = async (student: Student) => {
        try {
            await removeStudentFromClass(parseInt(classItem.id), student.enrollmentId, 'Xóa bởi giáo viên/quản trị');

            showSuccessToast(`Đã xóa học viên ${student.name} khỏi lớp`);
            // Reload the student list
            loadStudents();
            onStudentsChanged?.(); // notify parent
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
                status: newStatus,
            };

            // Add note if changed or provided
            if (newNote.trim()) {
                payload.note = newNote.trim();
            }

            await updateEnrollment(parseInt(classItem.id), student.enrollmentId, payload);

            const statusText =
                newStatus === 'ACTIVE'
                    ? 'Đang học'
                    : newStatus === 'SUSPENDED'
                      ? 'Bảo lưu'
                      : newStatus === 'GRADUATED'
                        ? 'Tốt nghiệp'
                        : newStatus === 'DROPPED'
                          ? 'Đã nghỉ'
                          : newStatus;

            showSuccessToast(`Đã cập nhật trạng thái thành ${statusText}`);
            setEditingStatus(null);
            setNewNote('');
            loadStudents();
            onStudentsChanged?.(); // notify parent
        } catch (error: any) {
            console.error('Error updating status:', error);
            showErrorToast(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        }
    };

    const getStatusText = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'Đang học';
            case 'SUSPENDED':
                return 'Bảo lưu';
            case 'GRADUATED':
                return 'Tốt nghiệp';
            case 'DROPPED':
                return 'Đã nghỉ';
            default:
                return status;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'bg-green-100 text-green-700';
            case 'SUSPENDED':
                return 'bg-yellow-100 text-yellow-700';
            case 'GRADUATED':
                return 'bg-blue-100 text-blue-700';
            case 'DROPPED':
                return 'bg-red-100 text-red-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    // Filter students based on status filter
    const filteredStudents = statusFilter === 'ALL' ? students : students.filter((s) => s.status === statusFilter);

    return (
        <div className="bg-white rounded-lg">
            {/* Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        {inlineMode ? 'Danh sách học viên' : `Quản lý Học viên - ${classItem.name}`}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {inlineMode
                            ? 'Danh sách học viên của lớp học và thêm mới'
                            : 'Xem và quản lý danh sách học viên của lớp học'}
                    </p>
                </div>
                {!inlineMode && (
                    <button
                        className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                        onClick={() => {
                            onClose?.();
                        }}
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Student Count and Add Button */}
            <div className="px-4 py-3 border-b flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-600">
                        Sĩ số: {students.filter((s) => s.status === 'ACTIVE').length}/{classItem.maxStudents} học viên
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
                        <option value="DROPPED">Đã nghỉ</option>
                        <option value="GRADUATED">Tốt nghiệp</option>
                    </select>

                    {/* Month Filter */}
                    <select
                        value={selectedMonth}
                        onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                        className="text-sm border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
                    >
                        <option value={1}>Tháng 1</option>
                        <option value={2}>Tháng 2</option>
                        <option value={3}>Tháng 3</option>
                        <option value={4}>Tháng 4</option>
                        <option value={5}>Tháng 5</option>
                        <option value={6}>Tháng 6</option>
                        <option value={7}>Tháng 7</option>
                        <option value={8}>Tháng 8</option>
                        <option value={9}>Tháng 9</option>
                        <option value={10}>Tháng 10</option>
                        <option value={11}>Tháng 11</option>
                        <option value={12}>Tháng 12</option>
                    </select>

                    {/* Year Filter */}
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="text-sm border rounded px-2 py-1 outline-none focus:ring-2 focus:ring-blue-200"
                        disabled={availableYears.length === 0}
                    >
                        {availableYears.length > 0 ? (
                            availableYears.map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))
                        ) : (
                            <option value={new Date().getFullYear()}>
                                {new Date().getFullYear()}
                            </option>
                        )}
                    </select>
                </div>
                {!readOnly && (
                    <button
                        onClick={handleAddStudent}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                        <Plus size={16} />
                        Thêm học viên
                    </button>
                )}
            </div>

            {/* Students List */}
            <div className="max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b bg-gray-50 text-xs text-gray-500 grid grid-cols-12 gap-4">
                    <div className="col-span-5">Học viên</div>
                    <div className="col-span-4">Trạng thái</div>
                    <div className="col-span-3">Thao tác</div>
                </div>

                {isLoading ? (
                    <div className="px-4 py-8 text-center text-gray-500">Đang tải danh sách học viên...</div>
                ) : filteredStudents.length === 0 ? (
                    <div className="px-4 py-8 text-center text-gray-500">
                        {statusFilter === 'ALL'
                            ? 'Chưa có học viên nào trong lớp'
                            : `Không có học viên ${getStatusText(statusFilter)}`}
                    </div>
                ) : (
                    <div className="divide-y">
                        {filteredStudents.map((student) => (
                            <div 
                                key={student.enrollmentId} 
                                className="px-4 py-3 grid grid-cols-12 gap-4 items-center cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => handleViewDetails(student)}
                            >
                                {/* Student Info */}
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-medium">
                                        {student.initial}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-1.5">
                                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                            {/* Warning Icon - right next to name */}
                                            {warningData[student.studentId] && (
                                                <div 
                                                    className="relative group flex-shrink-0"
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    <AlertCircle 
                                                        size={16} 
                                                        className="text-amber-500 cursor-help" 
                                                    />
                                                    {/* Tooltip */}
                                                    <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block z-[9999] w-64 p-3 bg-white text-gray-900 text-xs rounded-lg shadow-xl border border-gray-200 pointer-events-none">
                                                        <div className="font-semibold mb-2 text-amber-600">⚠️ Cảnh báo tháng {selectedMonth}/{selectedYear}</div>
                                                        <div className="space-y-1">
                                                            {warningData[student.studentId].absences >= 2 && (
                                                                <div>• Vắng: <span className="font-semibold text-red-600">{warningData[student.studentId].absences} buổi</span></div>
                                                            )}
                                                            {warningData[student.studentId].failedExams >= 2 && (
                                                                <div>• Thi trượt: <span className="font-semibold text-red-600">{warningData[student.studentId].failedExams} bài</span></div>
                                                            )}
                                                        </div>
                                                        {/* Arrow pointing down */}
                                                        <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1 w-2 h-2 bg-white border-r border-b border-gray-200 transform rotate-45"></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        <div className="text-xs text-gray-500">{student.email}</div>
                                    </div>
                                </div>

                                {/* Status */}
                                <div className="col-span-4" onClick={(e) => e.stopPropagation()}>
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
                                                <option value="DROPPED">Đã nghỉ</option>
                                                <option value="GRADUATED">Tốt nghiệp</option>
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
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
                                                        handleChangeStatus(student);
                                                    }}
                                                    disabled={!newStatus || newStatus === student.status}
                                                    className="flex-1 text-xs px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                                                >
                                                    Lưu
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Prevent row click
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
                                                <span
                                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${getStatusColor(student.status)}`}
                                                >
                                                    {getStatusText(student.status)}
                                                </span>
                                                {!readOnly && student.studentOverallStatus !== 'DROPPED' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation(); // Prevent row click
                                                            setEditingStatus(student.enrollmentId);
                                                            setNewStatus(student.status);
                                                            setNewNote(student.note || '');
                                                        }}
                                                        className="text-gray-400 hover:text-blue-600"
                                                        title="Đổi trạng thái"
                                                    >
                                                        <Edit2 size={14} />
                                                    </button>
                                                )}
                                            </div>
                                            {student.note && (
                                                <div className="text-xs text-gray-500 italic">Note: {student.note}</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-3" onClick={(e) => e.stopPropagation()}>
                                    {!readOnly && (
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
                                    )}
                                    {readOnly && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation(); // Prevent double navigation
                                                handleViewDetails(student);
                                            }}
                                            className="h-8 px-3 text-xs rounded border hover:bg-gray-50 flex items-center gap-1"
                                        >
                                            <Eye size={14} />
                                            Xem
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Footer */}
            {!inlineMode && (
                <div className="px-4 py-3 border-t flex justify-end">
                    <button
                        onClick={() => {
                            onClose?.();
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                        Đóng
                    </button>
                </div>
            )}

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
