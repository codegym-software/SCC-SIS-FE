import React, { useState, useEffect } from 'react';
import { User, Plus, Search, Filter, Upload } from 'lucide-react';
import StudentSearch from './search';
import StudentList from './list';
import StudentView from './view';
import StudentEdit from './edit';
import ChangeStatusModal from './components/ChangeStatusModal';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

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
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [programFilter, setProgramFilter] = useState('Tất cả chương trình');
    const [openView, setOpenView] = useState<Student | null>(null);
    const [openEdit, setOpenEdit] = useState<Student | null>(null);
    const [openCreate, setOpenCreate] = useState(false);
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<Student | null>(null);
    const [openChangeStatus, setOpenChangeStatus] = useState<Student | null>(null);

    // Generate additional students
    const generateAdditionalStudents = (): Student[] => {
        const firstNames = [
            'Nguyễn', 'Trần', 'Lê', 'Phạm', 'Hoàng', 'Phan', 'Vũ', 'Võ', 'Đặng', 'Bùi',
            'Đỗ', 'Hồ', 'Ngô', 'Dương', 'Lý', 'Đinh', 'Đào', 'Mai', 'Lâm', 'Thái',
            'Cao', 'Đinh', 'Lương', 'Tôn', 'Vương', 'Đinh', 'Lê', 'Phan', 'Võ', 'Bùi'
        ];
        
        const lastNames = [
            'Minh', 'Văn', 'Thị', 'Quốc', 'Đức', 'Hùng', 'Mai', 'Lan', 'Hương', 'Thu',
            'Anh', 'Tuấn', 'Nam', 'Hải', 'Long', 'Phong', 'Khang', 'Bảo', 'Đức', 'Thành',
            'Huy', 'Duy', 'Khoa', 'Linh', 'Nga', 'Hoa', 'Ly', 'My', 'Vy', 'Uyên'
        ];
        
        const classes = [
            'Lập trình Java Cơ bản - K15', 'Web Development - K08', 'Data Science - K01',
            'Python Programming - K12', 'Digital Marketing - K05', 'UI/UX Design - K03',
            'Mobile App Development - K07', 'Cloud Computing - K09', 'AI/ML - K11', 'Cybersecurity - K13'
        ];
        
        const programs = ['Công nghệ Thông tin', 'Digital Marketing', 'Thiết kế', 'Kinh doanh'];
        const statuses: Student['status'][] = ['Đang học', 'Bảo lưu', 'Tốt nghiệp', 'Tạm dừng'];
        
        return Array.from({ length: 50 }, (_, index) => {
            const studentNumber = index + 6; // Start from SV006
            const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
            const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
            const fullName = `${firstName} ${lastName}`;
            const initial = fullName.split(' ').map(n => n[0]).join('');
            
            const randomClass = classes[Math.floor(Math.random() * classes.length)];
            const randomProgram = programs[Math.floor(Math.random() * programs.length)];
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            
            // Generate random date between 2023-2025
            const year = 2023 + Math.floor(Math.random() * 3);
            const month = Math.floor(Math.random() * 12) + 1;
            const day = Math.floor(Math.random() * 28) + 1;
            const registrationDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            
            // Generate random phone number
            const phoneNumber = `09${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
            
            return {
                id: `student-${studentNumber}`,
                studentId: `SV${String(studentNumber).padStart(3, '0')}`,
                name: fullName,
                email: `${fullName.toLowerCase().replace(/\s+/g, '.')}@student.edu`,
                phone: phoneNumber,
                initial,
                class: randomClass,
                program: randomProgram,
                registrationDate,
                status: randomStatus
            };
        });
    };

    // Mock data for students
    const [students, setStudents] = useState<Student[]>([
        {
            id: '1',
            studentId: 'SV001',
            name: 'Pham Minh Đức',
            email: 'duc.pham@student.edu',
            phone: '0911111111',
            initial: 'P',
            class: 'Lập trình Java Cơ bản - K15',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-01-15',
            status: 'Đang học'
        },
        {
            id: '2',
            studentId: 'SV002',
            name: 'Hoàng Thị Mai',
            email: 'mai.hoang@student.edu',
            phone: '0922222222',
            initial: 'H',
            class: 'Lập trình Java Cơ bản - K15',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-01-15',
            status: 'Đang học'
        },
        {
            id: '3',
            studentId: 'SV003',
            name: 'Vũ Đình Nam',
            email: 'nam.vu@student.edu',
            phone: '0933333333',
            initial: 'V',
            class: 'Lập trình Java Cơ bản - K15',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-01-15',
            status: 'Bảo lưu'
        },
        {
            id: '4',
            studentId: 'SV004',
            name: 'Nguyễn Thu Hằng',
            email: 'hang.nguyen@student.edu',
            phone: '0944444444',
            initial: 'N',
            class: 'Web Development - K08',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-02-01',
            status: 'Đang học'
        },
        {
            id: '5',
            studentId: 'SV005',
            name: 'Trần Quốc Thành',
            email: 'thanh.tran@student.edu',
            phone: '0955555555',
            initial: 'T',
            class: 'Data Science - K01',
            program: 'Công nghệ Thông tin',
            registrationDate: '2023-09-01',
            status: 'Tốt nghiệp'
        },
        ...generateAdditionalStudents()
    ]);

    const handleView = (student: Student) => {
        setOpenView(student);
    };

    const handleEdit = (student: Student) => {
        setOpenEdit(student);
    };

    const handleSaveEdit = (updatedStudent: Student) => {
        setStudents(prev => 
            prev.map(s => s.id === updatedStudent.id ? updatedStudent : s)
        );
    };

    const handleCreate = () => {
        setOpenCreate(true);
    };

    const handleImport = () => {
        console.log('Import Excel');
        // TODO: Implement Excel import
    };

    const handleMenuToggle = (id: string) => {
        setOpenMenuId(openMenuId === id ? null : id);
    };

    const handleDeleteStudent = (student: Student) => {
        setDeleteConfirm(student);
    };

    const confirmDeleteStudent = () => {
        if (deleteConfirm) {
            setStudents(prev => prev.filter(s => s.id !== deleteConfirm.id));
            setDeleteConfirm(null);
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

    // Filter students based on query and filters
    const filteredStudents = students.filter(student => {
        const matchesQuery = !query || 
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.email.toLowerCase().includes(query.toLowerCase()) ||
            student.studentId.toLowerCase().includes(query.toLowerCase());
        
        const matchesStatus = statusFilter === 'Tất cả trạng thái' || student.status === statusFilter;
        const matchesProgram = programFilter === 'Tất cả chương trình' || student.program === programFilter;
        
        return matchesQuery && matchesStatus && matchesProgram;
    });

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
            />

            {/* Students List */}
            <StudentList
                students={filteredStudents}
                onView={handleView}
                onEdit={handleEdit}
                onChangeStatus={handleChangeStatus}
                onDelete={handleDeleteStudent}
                openMenuId={openMenuId}
                onMenuToggle={handleMenuToggle}
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

            {/* Create Modal - TODO: Implement */}
            <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
                <div className="p-6">
                    <h2 className="text-lg font-semibold mb-4">Thêm Học viên mới</h2>
                    <p className="text-gray-500">Chức năng đang được phát triển...</p>
                    <div className="mt-4 flex justify-end">
                        <button
                            onClick={() => setOpenCreate(false)}
                            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </Modal>

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
        </div>
    );
}
