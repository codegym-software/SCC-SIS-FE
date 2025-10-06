import React, { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Plus, Search, Users, X } from 'lucide-react';
import ClassList from '@/features/users/pages/classes/list.tsx';
import ManageStudentsModal from '@/features/users/pages/classes/components/ManageStudentsModal';
import AssignInstructorModal from '@/features/users/pages/classes/components/AssignInstructorModal';

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
    instructor: string;
    instructorInitial: string;
    status: 'Chuẩn bị' | 'Đang học' | 'Hoàn thành' | 'Tạm dừng';
};

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
                <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function ClassesPage() {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState<Class | null>(null);
    const [openManageStudents, setOpenManageStudents] = useState<Class | null>(null);
    const [openAssignInstructor, setOpenAssignInstructor] = useState<Class | null>(null);

    const [classes, setClasses] = useState<Class[]>([
        {
            id: '1',
            name: 'Lập trình Java Cơ bản - K15',
            description: 'Khóa học Java dành cho người mới bắt đầu',
            program: 'Công nghệ Thông tin',
            startDate: '2024-12-25',
            schedule: 'Thứ 2, 4, 6 - 19:00-21:30',
            location: 'Phòng A101',
            students: 28,
            maxStudents: 30,
            instructor: 'Nguyễn Văn A',
            instructorInitial: 'N',
            status: 'Chuẩn bị',
        },
        {
            id: '2',
            name: 'Web Development - K08',
            description: 'Phát triển ứng dụng web hiện đại',
            program: 'Công nghệ Thông tin',
            startDate: '2024-11-20',
            schedule: 'Thứ 3, 5, 7 - 18:30-21:00',
            location: 'Phòng B201',
            students: 22,
            maxStudents: 25,
            instructor: 'Trần Thị B',
            instructorInitial: 'T',
            status: 'Đang học',
        },
        {
            id: '3',
            name: 'Python Programming - K12',
            description: 'Học lập trình Python từ cơ bản đến nâng cao',
            program: 'Công nghệ Thông tin',
            startDate: '2024-12-01',
            schedule: 'Thứ 2, 4 - 18:00-20:30',
            location: 'Phòng C301',
            students: 30,
            maxStudents: 35,
            instructor: 'Lê Văn C',
            instructorInitial: 'L',
            status: 'Đang học',
        },
        {
            id: '4',
            name: 'Digital Marketing - K05',
            description: 'Chiến lược marketing số toàn diện',
            program: 'Digital Marketing',
            startDate: '2024-10-15',
            schedule: 'Thứ 3, 6 - 19:00-21:30',
            location: 'Phòng D401',
            students: 18,
            maxStudents: 20,
            instructor: 'Nguyễn Văn A',
            instructorInitial: 'N',
            status: 'Đang học',
        },
        {
            id: '5',
            name: 'React Native - K03',
            description: 'Phát triển ứng dụng di động với React Native',
            program: 'Công nghệ Thông tin',
            startDate: '2025-01-15',
            schedule: 'Thứ 7, CN - 08:00-12:00',
            location: 'Phòng E501',
            students: 0,
            maxStudents: 15,
            instructor: 'Trần Thị B',
            instructorInitial: 'T',
            status: 'Chuẩn bị',
        },
    ]);

    // AssignInstructorModal function removed - using component instead

    function CreateEditForm({ editing }: { editing?: Class | null }) {
        const [errors, setErrors] = useState<{
            name?: string;
            program?: string;
            startDate?: string;
            schedule?: string;
            location?: string;
            maxStudents?: string;
        }>({});

        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget as HTMLFormElement);
                    const payload: Class = {
                        id: editing?.id ?? String(Date.now()),
                        name: String(form.get('name') || ''),
                        description: String(form.get('description') || ''),
                        program: String(form.get('program') || ''),
                        startDate: String(form.get('startDate') || ''),
                        schedule: String(form.get('schedule') || ''),
                        location: String(form.get('location') || ''),
                        students: editing?.students ?? 0, // Giữ nguyên số học viên hiện tại khi chỉnh sửa
                        maxStudents: Number(form.get('maxStudents') || 0),
                        instructor: editing?.instructor ?? 'Chưa phân công', // Giữ nguyên giảng viên hiện tại
                        instructorInitial: editing?.instructorInitial ?? '?',
                        status: String(form.get('status') || 'Chuẩn bị') as Class['status'],
                    };

                    const newErrors: typeof errors = {};

                    // Validation
                    if (!payload.name || payload.name.trim().length < 3) {
                        newErrors.name = 'Tên lớp học tối thiểu 3 ký tự';
                    }
                    if (!payload.program) {
                        newErrors.program = 'Vui lòng chọn chương trình';
                    }
                    if (!payload.startDate) {
                        newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
                    }
                    if (!payload.schedule || payload.schedule.trim().length < 5) {
                        newErrors.schedule = 'Lịch học tối thiểu 5 ký tự';
                    }
                    if (!payload.location || payload.location.trim().length < 2) {
                        newErrors.location = 'Địa điểm tối thiểu 2 ký tự';
                    }
                    if (!payload.maxStudents || payload.maxStudents < 1) {
                        newErrors.maxStudents = 'Sĩ số tối đa phải lớn hơn 0';
                    }

                    setErrors(newErrors);

                    if (Object.keys(newErrors).length > 0) return;

                    setClasses((prev) =>
                        editing ? prev.map((x) => (x.id === editing.id ? payload : x)) : [payload, ...prev],
                    );
                    editing ? setOpenEdit(null) : setOpenCreate(false);
                }}
            >
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div>
                        <div className="font-medium">{editing ? 'Chỉnh sửa Lớp học' : 'Tạo lớp học mới'}</div>
                        {editing && (
                            <div className="text-xs text-gray-500">Cập nhật thông tin lớp học {editing.name}.</div>
                        )}
                    </div>
                    <button
                        type="button"
                        className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
                        onClick={() => (editing ? setOpenEdit(null) : setOpenCreate(false))}
                    >
                        <X size={16} />
                    </button>
                </div>
                <div className="p-4 space-y-4">
                    <div>
                        <h3 className="text-sm font-medium mb-3">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Tên lớp học *</label>
                                <input
                                    name="name"
                                    defaultValue={editing?.name}
                                    required
                                    className={`w-full h-9 rounded-md border px-3 text-sm ${errors.name ? 'border-red-500' : ''}`}
                                    placeholder="Lập trình Java Cơ bản - K15"
                                />
                                {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Chương trình học *</label>
                                <select
                                    name="program"
                                    defaultValue={editing?.program}
                                    required
                                    className={`w-full h-9 rounded-md border px-2 text-sm ${errors.program ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Chọn chương trình</option>
                                    <option>Công nghệ Thông tin</option>
                                    <option>Digital Marketing</option>
                                    <option>Thiết kế Đồ họa</option>
                                    <option>Kinh doanh</option>
                                </select>
                                {errors.program && <div className="text-xs text-red-600 mt-1">{errors.program}</div>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
                                <textarea
                                    name="description"
                                    defaultValue={editing?.description}
                                    className="w-full h-20 rounded-md border px-3 py-2 text-sm"
                                    placeholder="Khóa học Java dành cho người mới bắt đầu"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Ngày bắt đầu *</label>
                                <input
                                    name="startDate"
                                    type="date"
                                    defaultValue={editing?.startDate}
                                    required
                                    className={`w-full h-9 rounded-md border px-3 text-sm ${errors.startDate ? 'border-red-500' : ''}`}
                                />
                                {errors.startDate && (
                                    <div className="text-xs text-red-600 mt-1">{errors.startDate}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Ngày kết thúc</label>
                                <input
                                    name="endDate"
                                    type="date"
                                    className="w-full h-9 rounded-md border px-3 text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Lịch học *</label>
                                <input
                                    name="schedule"
                                    defaultValue={editing?.schedule}
                                    required
                                    className={`w-full h-9 rounded-md border px-3 text-sm ${errors.schedule ? 'border-red-500' : ''}`}
                                    placeholder="Thứ 2, 4, 6 - 19:00-21:30"
                                />
                                {errors.schedule && <div className="text-xs text-red-600 mt-1">{errors.schedule}</div>}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Địa điểm *</label>
                                <input
                                    name="location"
                                    defaultValue={editing?.location}
                                    required
                                    className={`w-full h-9 rounded-md border px-3 text-sm ${errors.location ? 'border-red-500' : ''}`}
                                    placeholder="Phòng A101"
                                />
                                {errors.location && <div className="text-xs text-red-600 mt-1">{errors.location}</div>}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Sĩ số tối đa *</label>
                                <input
                                    name="maxStudents"
                                    type="number"
                                    defaultValue={editing?.maxStudents ?? 30}
                                    required
                                    className={`w-full h-9 rounded-md border px-3 text-sm ${errors.maxStudents ? 'border-red-500' : ''}`}
                                />
                                {errors.maxStudents && (
                                    <div className="text-xs text-red-600 mt-1">{errors.maxStudents}</div>
                                )}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
                                <select
                                    name="status"
                                    defaultValue={editing?.status ?? 'Chuẩn bị'}
                                    className="w-full h-9 rounded-md border px-2 text-sm"
                                >
                                    <option>Chuẩn bị</option>
                                    <option>Đang học</option>
                                    <option>Hoàn thành</option>
                                    <option>Tạm dừng</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50"
                        onClick={() => (editing ? setOpenEdit(null) : setOpenCreate(false))}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="h-9 px-3 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                    >
                        {editing ? 'Cập nhật' : 'Tạo lớp học'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-white">
                        <BookOpen size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Quản lý Lớp học</h1>
                        <p className="text-xs text-gray-500">Quản lý thông tin lớp học và danh sách học viên</p>
                    </div>
                </div>
                <button
                    onClick={() => setOpenCreate(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-sm px-3 py-2 hover:from-blue-700 hover:to-indigo-700 transition-all duration-300"
                >
                    + Tạo Lớp học mới
                </button>
            </div>

            {/* Search and Filter */}
            <div className="flex items-center gap-4">
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Tìm kiếm lớp học..."
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="h-9 rounded-md border px-3 text-sm"
                >
                    <option>Tất cả trạng thái</option>
                    <option>Chuẩn bị</option>
                    <option>Đang học</option>
                    <option>Hoàn thành</option>
                    <option>Tạm dừng</option>
                </select>
            </div>

            {/* Classes List */}
            <ClassList
                classes={classes}
                query={query}
                statusFilter={statusFilter}
                setOpenAssignInstructor={setOpenAssignInstructor}
                onEdit={setOpenEdit}
                onManageStudents={setOpenManageStudents}
            />
            {/* Create Modal */}
            <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
                <CreateEditForm />
            </Modal>

            {/* Edit Modal */}
            <Modal open={!!openEdit} onClose={() => setOpenEdit(null)}>
                {openEdit && <CreateEditForm editing={openEdit} />}
            </Modal>

            {/* Manage Students Modal */}
            <Modal open={!!openManageStudents} onClose={() => setOpenManageStudents(null)}>
                {openManageStudents && (
                    <ManageStudentsModal 
                        classItem={openManageStudents} 
                        onClose={() => setOpenManageStudents(null)}
                    />
                )}
            </Modal>

            {/* Assign Instructor Modal */}
            <Modal open={!!openAssignInstructor} onClose={() => setOpenAssignInstructor(null)}>
                {openAssignInstructor && (
                    <AssignInstructorModal 
                        classItem={openAssignInstructor} 
                        onClose={() => setOpenAssignInstructor(null)}
                    />
                )}
            </Modal>
        </div>
    );
}
