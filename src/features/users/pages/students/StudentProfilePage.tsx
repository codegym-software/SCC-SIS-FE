import React, { useState, useEffect } from 'react';
import StudentSearch from './search';
import StudentList from './list';
import StudentView from './view';
import StudentEdit from './edit';
import CreateStudentModal from './create';
import ChangeStatusModal from './components/ChangeStatusModal';
import ConfirmDialog from '@/shared/components/ConfirmDialog';
import { listStudents, getStudentById, updateStudent, deleteStudent, searchStudents, exportStudents } from '@/shared/api/students';
import type { StudentDto, UpdateStudentDto } from '@/shared/types/student';
import ImportStudentsModal from './components/ImportStudentsModal';
import { useToast } from '@/shared/hooks/useToast';

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
    avatar?: string;
    dob?: string | null;
    address?: string | null;
};

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
    const { success, error: showError } = useToast();
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [programFilter, setProgramFilter] = useState('Tất cả chương trình');
    const [openView, setOpenView] = useState<Student | null>(null);
    const [openEdit, setOpenEdit] = useState<Student | null>(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
    const [openChangeStatus, setOpenChangeStatus] = useState<Student | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const studentsPerPage = 8;

    const [students, setStudents] = useState<Student[]>([]);
    const [openImport, setOpenImport] = useState(false);
    const [exportConfirm, setExportConfirm] = useState(false);

    // Helper function: Convert StudentDto từ BE sang Student type của FE
    const mapStudentDtoToStudent = (dto: StudentDto): Student => {
        return {
            id: dto.studentId.toString(),
            studentId: `SV${String(dto.studentId).padStart(3, '0')}`,
            name: dto.fullName,
            email: dto.email,
            phone: dto.phone,
            initial: dto.fullName.split(' ').map(n => n[0]).join(''),
            class: 'N/A', // BE chưa có thông tin class
            program: 'N/A', // BE chưa có thông tin program
            registrationDate: dto.createdAt.split('T')[0], // Extract date from ISO string
            status: (dto.overallStatus === 'ACTIVE' ? 'Đang học' : 
                     dto.overallStatus === 'INACTIVE' ? 'Tạm dừng' : 
                     dto.overallStatus === 'GRADUATED' ? 'Tốt nghiệp' : 
                     'Bảo lưu') as Student['status'],
            avatar: loadStudentAvatar(dto.studentId.toString()),
            dob: dto.dob || null,
            address: dto.addressLine || null
        };
    };

    // Load students from API (hoặc search nếu có keyword)
    const fetchStudents = async (keyword?: string) => {
        try {
            let response;
            if (keyword && keyword.trim()) {
                // Nếu có keyword → gọi API search
                response = await searchStudents(keyword.trim());
            } else {
                // Nếu không có keyword → load all
                response = await listStudents();
            }
            const studentsData = response.data.map(mapStudentDtoToStudent);
            setStudents(studentsData);
        } catch (error) {
            console.error('Error fetching students:', error);
        }
    };

    // Load students on mount
    useEffect(() => {
        fetchStudents();
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

    const handleView = async (student: Student) => {
        try {
            // Load full student details from API
            const response = await getStudentById(parseInt(student.id));
            const fullStudent = mapStudentDtoToStudent(response.data);
            setOpenView(fullStudent);
        } catch (error) {
            console.error('Error fetching student details:', error);
            // Fallback to showing current student data
            setOpenView(student);
        }
    };

    const handleEdit = (student: Student) => {
        setOpenEdit(student);
    };

    const handleSaveEdit = async (updatedStudent: Student) => {
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

            // Reload students from server
            await fetchStudents();
        } catch (error) {
            console.error('Error updating student:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin học viên');
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

    const confirmExport = async () => {
        try {
            const response = await exportStudents();
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'students.xlsx';
            a.click();
            URL.revokeObjectURL(url);
            success('Tải xuống thành công', 'File Excel đã được tải về');
            setExportConfirm(false);
        } catch (err) {
            showError('Lỗi tải xuống', 'Không thể tải file Excel');
            setExportConfirm(false);
        }
    };

    const handleMenuToggle = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleDeleteStudent = (student: Student) => {
        setDeleteConfirm(student);
    };

    const confirmDeleteStudent = async () => {
        if (!deleteConfirm) return;

        try {
            // Call API to soft delete student
            await deleteStudent(parseInt(deleteConfirm.id));
            
            // Reload students from server
            await fetchStudents();
            setDeleteConfirm(null);
        } catch (error) {
            console.error('Error deleting student:', error);
            alert('Có lỗi xảy ra khi xóa học viên');
        }
    };

    const handleChangeStatus = (student: Student) => {
        setOpenChangeStatus(student);
    };

    const handleSaveStatusChange = (studentId: string, newStatus: Student['status']) => {
        setStudents(prev => 
            prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s)
        );
        setOpenChangeStatus(null);
    };

    // Filter students client-side (chỉ filter theo status và program, query đã filter từ BE)
    const filteredStudents = students.filter(student => {
        const matchesStatus = statusFilter === 'Tất cả trạng thái' || student.status === statusFilter;
        const matchesProgram = programFilter === 'Tất cả chương trình' || student.program === programFilter;
        
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
                onCreate={handleCreate}
                onImport={handleImport}
                onExport={handleExport}
            />

            {/* Students List */}
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
                description="Bạn có muốn tải xuống danh sách tất cả học viên ra file Excel? File sẽ chứa đầy đủ thông tin của các học viên hiện tại."
                confirmText="Tải xuống"
                cancelText="Hủy"
                variant="danger"
            />
        </div>
    );
}
