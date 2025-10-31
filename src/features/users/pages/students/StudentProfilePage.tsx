import React, { useState, useEffect } from 'react';
import StudentSearch from './search';
import StudentList from './list';
import StudentView from './view';
import StudentEdit from './edit';
import CreateStudentModal from './create';
import ChangeStatusModal from './components/ChangeStatusModal';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import ImportStudentsModal from './components/ImportStudentsModal';
import { updateStudent, deleteStudent, searchStudents, exportStudents, getAllStudentsWithEnrollments, getStudentWithEnrollmentsById } from '@/shared/api/students';
import { getPrograms } from '@/shared/api/programs';
import type { UpdateStudentDto, StudentWithEnrollmentsDto } from '@/shared/types/student';
import type { StudentUI } from '@/shared/types/student-ui';
import { useToast } from '@/shared/hooks/useToast';

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60]">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-2xl rounded-lg bg-white shadow-xl border max-h-[90vh] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

function StatusModal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-[60]">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="w-96 max-w-sm">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function StudentProfilePage() {
    const toast = useToast();
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [programFilter, setProgramFilter] = useState('Tất cả chương trình');
    const [openView, setOpenView] = useState<StudentUI | null>(null);
    const [openEdit, setOpenEdit] = useState<StudentUI | null>(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<StudentUI | null>(null);
    const [openChangeStatus, setOpenChangeStatus] = useState<StudentUI | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 8;

    const [students, setStudents] = useState<StudentUI[]>([]);
    const [openImport, setOpenImport] = useState(false);
    const [exportConfirm, setExportConfirm] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [programs, setPrograms] = useState<Array<{ programId: number; name: string }>>([]);

    // Helper function: Convert StudentWithEnrollmentsDto từ BE sang StudentUI type của FE
    const mapStudentWithEnrollmentsDtoToStudent = (dto: StudentWithEnrollmentsDto): StudentUI => {
        return {
            id: dto.studentId.toString(),
            studentId: `SV${String(dto.studentId).padStart(3, '0')}`,
            name: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            initial: dto.fullName.split(' ').map(n => n[0]).join(''),
            registrationDate: dto.createdAt.split('T')[0],
            status: (dto.overallStatus === 'PENDING' ? 'Đang chờ' :
                     dto.overallStatus === 'ACTIVE' ? 'Đang học' : 
                     dto.overallStatus === 'DROPPED' ? 'Nghỉ học' :
                     dto.overallStatus === 'GRADUATED' ? 'Tốt nghiệp' :
                     'Đang chờ') as StudentUI['status'],
            avatar: loadStudentAvatar(dto.studentId.toString()),
            dob: dto.dob || null,
            address: dto.addressLine || null,
            gender: dto.gender || null,
            nationalIdNo: dto.nationalIdNo || null,
            enrollments: dto.enrollments || []
        };
    };

    // Load students from API (hoặc search nếu có keyword)
    const fetchStudents = async (keyword?: string) => {
        try {
            let response;
            if (keyword && keyword.trim()) {
                // Nếu có keyword → gọi API search (vẫn dùng API cũ vì search chưa có enrollments)
                const searchResponse = await searchStudents(keyword.trim());
                // Map từ StudentDto sang Student (không có enrollments)
                const studentsData = searchResponse.data.map(dto => ({
                    id: dto.studentId.toString(),
                    studentId: `SV${String(dto.studentId).padStart(3, '0')}`,
                    name: dto.fullName,
                    email: dto.email,
                    phone: dto.phone,
                    initial: dto.fullName.split(' ').map(n => n[0]).join(''),
                    registrationDate: dto.createdAt.split('T')[0],
                    status: (dto.overallStatus === 'PENDING' ? 'Đang chờ' :
                             dto.overallStatus === 'ACTIVE' ? 'Đang học' : 
                             dto.overallStatus === 'DROPPED' ? 'Nghỉ học' :
                             dto.overallStatus === 'GRADUATED' ? 'Tốt nghiệp' :
                             'Đang chờ') as StudentUI['status'],
                    avatar: loadStudentAvatar(dto.studentId.toString()),
                    dob: dto.dob || null,
                    address: dto.addressLine || null,
                    gender: dto.gender || null,
                    nationalIdNo: dto.nationalIdNo || null,
                    enrollments: [] // Empty enrollments for search results
                }));
                setStudents(studentsData);
            } else {
                // Nếu không có keyword → load all với enrollments
                response = await getAllStudentsWithEnrollments();
                const studentsData = response.data.map(dto => mapStudentWithEnrollmentsDtoToStudent(dto));
                console.log('🔍 Reloaded students data:', studentsData.length, 'students');
                setStudents(studentsData);
            }
        } catch (error) {
            console.error('Error fetching students:', error);
            toast.error('Lỗi tải dữ liệu', 'Không thể tải danh sách học viên');
        }
    };

    // Load programs
    const loadPrograms = async () => {
        try {
            const response = await getPrograms();
            const programList = response.data.map(p => ({
                programId: p.programId,
                name: p.name
            }));
            setPrograms(programList);
        } catch (error) {
            console.error('Error loading programs:', error);
        }
    };

    // Load programs và students on mount
    useEffect(() => {
        const initData = async () => {
            setIsLoading(true);
            await Promise.all([
                loadPrograms(), // Load programs
            ]);
            await fetchStudents(); // Load students với enrollments
            setIsLoading(false);
        };
        initData();
    }, []);


    // Tự động tìm kiếm khi thay đổi query (debounce)
    useEffect(() => {
        const handler = setTimeout(() => {
            fetchStudents(query);
            setCurrentPage(1);
        }, 500);
        return () => clearTimeout(handler);
    }, [query]);

    // Function to load avatar from localStorage
    const loadStudentAvatar = (studentId: string) => {
        return localStorage.getItem(`student_avatar_${studentId}`) || '';
    };

    const handleView = async (student: StudentUI) => {
        try {
            // Load full student details with enrollments from API
            const response = await getStudentWithEnrollmentsById(parseInt(student.id));
            const fullStudent = mapStudentWithEnrollmentsDtoToStudent(response.data);
            setOpenView(fullStudent);
        } catch (error) {
            console.error('Error fetching student details:', error);
            // Fallback to showing current student data
            setOpenView(student);
        }
    };

    const handleEdit = (student: StudentUI) => {
        setOpenEdit(student);
    };

    const handleSaveEdit = async (updatedStudent: StudentUI) => {
        try {
            // Prepare update payload (only 5 fields allowed)
            const updatePayload: UpdateStudentDto = {
                fullName: updatedStudent.name,
                email: updatedStudent.email,
                phone: updatedStudent.phone,
                dob: updatedStudent.dob || null,
                addressLine: updatedStudent.address || null
            };

            // Call API to update
            await updateStudent(parseInt(updatedStudent.id), updatePayload);

            toast.success('Cập nhật thành công!', `Thông tin học viên ${updatedStudent.name} đã được cập nhật`);
            
            // Reload all data
            await reloadAllData();
            setOpenEdit(null);
        } catch (error: any) {
            console.error('Error updating student:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật thông tin học viên';
            toast.error('Cập nhật thất bại', errorMessage);
        }
    };

    const handleCreate = () => {
        setOpenCreate(true);
    };

    const handleImport = () => {
        setOpenImport(true);
    };

    const handleExport = () => {
        setExportConfirm(true);
    };

    // Helper: Convert frontend status to backend status
    const mapStatusToBackend = (frontendStatus: string): string | undefined => {
        switch (frontendStatus) {
            case 'Đang học': return 'ACTIVE';
            case 'Tốt nghiệp': return 'GRADUATED';
            case 'Bảo lưu': return 'SUSPENDED';
            case 'Tạm dừng': return 'INACTIVE';
            case 'Tất cả trạng thái': return undefined;
            default: return undefined;
        }
    };

    const confirmExport = async () => {
        try {
            // Lấy backend status từ filter
            const backendStatus = mapStatusToBackend(statusFilter);
            
            const response = await exportStudents(backendStatus);
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            
            // Đặt tên file theo status filter
            const fileName = backendStatus 
                ? `students_${backendStatus.toLowerCase()}.xlsx`
                : 'students_all.xlsx';
            a.download = fileName;
            
            a.click();
            URL.revokeObjectURL(url);
            
            const statusText = statusFilter === 'Tất cả trạng thái' ? 'tất cả' : statusFilter.toLowerCase();
            toast.success('Xuất file thành công', `Đã tải danh sách học viên ${statusText} dưới dạng file Excel`);
            setExportConfirm(false);
        } catch (err) {
            toast.error('Lỗi xuất file', 'Không thể tải file Excel');
            setExportConfirm(false);
        }
    };

    const handleMenuToggle = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleDeleteStudent = (student: StudentUI) => {
        setDeleteConfirm(student);
    };

    const reloadAllData = async () => {
        setIsLoading(true);
        try {
            // Reload với query hiện tại (nếu có)
            await fetchStudents(query || undefined);
        } catch (error) {
            console.error('Error reloading data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const confirmDeleteStudent = async () => {
        if (!deleteConfirm) return;

        try {
            // Call API to soft delete student (sẽ tự động đổi status sang INACTIVE)
            await deleteStudent(parseInt(deleteConfirm.id));
            
            toast.success('Xóa thành công!', `Học viên ${deleteConfirm.name} đã được xóa khỏi hệ thống`);
            
            // Reload all data
            await reloadAllData();
            setDeleteConfirm(null);
        } catch (error: any) {
            console.error('Error deleting student:', error);
            const errorMessage = error?.response?.data?.message || 'Có lỗi xảy ra khi xóa học viên';
            toast.error('Xóa thất bại', errorMessage);
        }
    };

    const handleChangeStatus = (student: StudentUI) => {
        setOpenChangeStatus(student);
    };

    const handleSaveStatusChange = async (studentId: string, newStatus: StudentUI['status']) => {
        try {
            console.log('🔄 Starting status change for student:', studentId, 'to:', newStatus);
            
            // Reload all data to get updated status FIRST
            await reloadAllData();
            
            console.log('✅ Data reloaded');
            
            // Reset filter về "Tất cả trạng thái" để học viên vẫn hiển thị sau khi đổi trạng thái
            setStatusFilter('Tất cả trạng thái');
            
            // Show success message
            toast.success('Cập nhật trạng thái thành công!', `Trạng thái học viên đã được đổi sang ${newStatus}`);
            
            setOpenChangeStatus(null);
        } catch (error) {
            console.error('Error updating student status:', error);
            toast.error('Cập nhật trạng thái thất bại!', 'Có lỗi xảy ra khi cập nhật trạng thái học viên');
        }
    };

    // Filter students client-side (chỉ filter theo status và program, query đã filter từ BE)
    const filteredStudents = students.filter(student => {
        const matchesStatus = statusFilter === 'Tất cả trạng thái' || student.status === statusFilter;
        
        // Check if student has any enrollment matching the program filter
        const matchesProgram = programFilter === 'Tất cả chương trình' || 
            student.enrollments.some(enrollment => enrollment.programName === programFilter);
        
        return matchesStatus && matchesProgram;
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
    const startIndex = (currentPage - 1) * studentsPerPage;
    const endIndex = startIndex + studentsPerPage;
    const currentStudents = filteredStudents.slice(startIndex, endIndex);

    // Reset to first page when status/program filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [statusFilter, programFilter]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Hồ sơ Học viên</h1>
                        <p className="text-xs text-gray-500">Quản lý thông tin và hồ sơ học viên</p>
                    </div>
                </div>
            </div>

            {/* Search and Filters */}
            <StudentSearch
                query={query}
                onQueryChange={setQuery}
                statusFilter={statusFilter}
                onStatusFilterChange={setStatusFilter}
                programFilter={programFilter}
                onProgramFilterChange={setProgramFilter}
                programs={programs}
                onCreate={handleCreate}
                onImport={handleImport}
                onExport={handleExport}
            />

            {/* Students List */}
            {isLoading ? (
                <div className="bg-white rounded-lg border p-8 text-center">
                    <div className="text-gray-500">Đang tải danh sách học viên...</div>
                </div>
            ) : (
                <StudentList
                    students={currentStudents}
                    totalStudents={filteredStudents.length}
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onView={handleView}
                    onEdit={handleEdit}
                    onChangeStatus={handleChangeStatus}
                    onDelete={handleDeleteStudent}
                    openMenuId={openMenuId}
                    onMenuToggle={handleMenuToggle}
                    onPageChange={handlePageChange}
                />
            )}

            {/* View Modal */}
            <Modal open={!!openView} onClose={() => setOpenView(null)}>
                {openView && (
                    <StudentView
                        student={openView}
                        onClose={() => setOpenView(null)}
                    />
                )}
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!openEdit} onClose={() => setOpenEdit(null)}>
                {openEdit && (
                    <StudentEdit
                        student={openEdit}
                        onClose={() => setOpenEdit(null)}
                        onSave={handleSaveEdit}
                    />
                )}
            </Modal>

            {/* Create Modal */}
            <CreateStudentModal
                open={openCreate}
                onClose={() => setOpenCreate(false)}
                onSuccess={async () => {
                    await fetchStudents();
                }}
            />

            {/* Import Students Modal */}
            <ImportStudentsModal
                open={openImport}
                onClose={() => setOpenImport(false)}
                onSuccess={async () => {
                    setOpenImport(false);
                    await fetchStudents();
                }}
            />

            {/* Change Status Modal */}
            <StatusModal open={!!openChangeStatus} onClose={() => setOpenChangeStatus(null)}>
                {openChangeStatus && (
                    <ChangeStatusModal
                        student={openChangeStatus}
                        onClose={() => setOpenChangeStatus(null)}
                        onSave={handleSaveStatusChange}
                    />
                )}
            </StatusModal>

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDeleteStudent}
                title="Xác nhận xóa học viên"
                description={`Bạn có chắc chắn muốn xóa học viên "${deleteConfirm?.name}" khỏi hệ thống? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />

            {/* Export Confirmation Dialog */}
            <ConfirmDialog
                open={exportConfirm}
                onClose={() => setExportConfirm(false)}
                onConfirm={confirmExport}
                title="Xác nhận xuất danh sách"
                description={
                    statusFilter === 'Tất cả trạng thái'
                        ? 'Bạn có muốn tải xuống danh sách TẤT CẢ học viên ra file Excel? File sẽ chứa đầy đủ thông tin của các học viên hiện tại.'
                        : `Bạn có muốn tải xuống danh sách học viên đang ở trạng thái "${statusFilter}" ra file Excel? Chỉ những học viên có trạng thái này sẽ được xuất.`
                }
                confirmText="Xuất file"
                cancelText="Hủy"
                variant="primary"
            />
        </div>
    );
}
