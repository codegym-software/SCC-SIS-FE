import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import ClassList from '@/features/users/pages/classes/list.tsx';
import ManageStudentsModal from '@/features/users/pages/classes/components/ManageStudentsModal';
import AssignInstructorModal from '@/features/users/pages/classes/components/AssignInstructorModal';

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

// MultiSelect component for days and time selection
function MultiSelect({ 
    options, 
    selectedValues, 
    onChange, 
    placeholder, 
    name,
    error 
}: { 
    options: string[]; 
    selectedValues: string[]; 
    onChange: (values: string[]) => void; 
    placeholder: string;
    name: string;
    error?: string;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            onChange([...selectedValues, value]);
        }
    };

    const formatDisplayValue = (values: string[]) => {
        if (values.length === 0) return placeholder;
        if (values.length === 1) return values[0];
        if (values.length <= 3) return values.join(', ');
        return `${values.length} mục đã chọn`;
    };

    return (
        <div className="relative">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-9 rounded-md border px-3 text-sm text-left flex items-center justify-between ${
                    error ? 'border-red-500' : 'border-gray-300'
                }`}
            >
                <span className={selectedValues.length === 0 ? 'text-gray-400' : 'text-gray-900'}>
                    {formatDisplayValue(selectedValues)}
                </span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            
            {isOpen && (
                <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-auto">
                    {options.map((option) => (
                        <label
                            key={option}
                            className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={selectedValues.includes(option)}
                                onChange={() => handleToggle(option)}
                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-900">{option}</span>
                            {selectedValues.includes(option) && (
                                <Check size={16} className="text-blue-600 ml-auto" />
                            )}
                        </label>
                    ))}
                </div>
            )}
            
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
            
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={selectedValues.join(',')} />
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
    const [currentPage, setCurrentPage] = useState(1);
    const classesPerPage = 6;

    const handleUpdateInstructors = (classId: string, updatedInstructors: Instructor[]) => {
        setClasses(prev => 
            prev.map(cls => 
                cls.id === classId 
                    ? { ...cls, instructors: updatedInstructors }
                    : cls
            )
        );
    };

    const [classes, setClasses] = useState<Class[]>([
        {
            id: '1',
            name: 'Lập trình Java Cơ bản - K15',
            description: 'Khóa học Java dành cho người mới bắt đầu',
            program: 'Công nghệ Thông tin',
            startDate: '2024-12-25',
            schedule: 'Thứ 2, Thứ 4, Thứ 6 - 19:00-21:30',
            location: 'Phòng A101',
            students: 9,
            maxStudents: 30,
            instructors: [
                { id: '1', name: 'Nguyễn Văn A', initial: 'N' },
                { id: '2', name: 'Trần Thị B', initial: 'T' },
                { id: '3', name: 'Lê Văn C', initial: 'L' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '2',
            name: 'Web Development - K08',
            description: 'Phát triển ứng dụng web hiện đại',
            program: 'Công nghệ Thông tin',
            startDate: '2024-11-20',
            schedule: 'Thứ 3, Thứ 5, Thứ 7 - 18:30-21:00',
            location: 'Phòng B201',
            students: 22,
            maxStudents: 25,
            instructors: [
                { id: '4', name: 'Trần Thị B', initial: 'T' }
            ],
            status: 'Đang học',
        },
        {
            id: '3',
            name: 'Python Programming - K12',
            description: 'Học lập trình Python từ cơ bản đến nâng cao',
            program: 'Công nghệ Thông tin',
            startDate: '2024-12-01',
            schedule: 'Thứ 2, Thứ 4 - 18:00-20:30',
            location: 'Phòng C301',
            students: 30,
            maxStudents: 35,
            instructors: [
                { id: '5', name: 'Lê Văn C', initial: 'L' },
                { id: '6', name: 'Phạm Thị D', initial: 'P' }
            ],
            status: 'Đang học',
        },
        {
            id: '4',
            name: 'Digital Marketing - K05',
            description: 'Chiến lược marketing số toàn diện',
            program: 'Digital Marketing',
            startDate: '2024-10-15',
            schedule: 'Thứ 3, Thứ 6 - 19:00-21:30',
            location: 'Phòng D401',
            students: 18,
            maxStudents: 20,
            instructors: [
                { id: '7', name: 'Nguyễn Văn A', initial: 'N' }
            ],
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
            instructors: [
                { id: '8', name: 'Trần Thị B', initial: 'T' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '6',
            name: 'Lập trình Java Nâng Cao - K16',
            description: 'Khóa học Java nâng cao cho lập trình viên có kinh nghiệm',
            program: 'Công nghệ Thông tin',
            startDate: '2025-10-14',
            schedule: 'Thứ 2, Thứ 3, Thứ 4 - 19:00-21:30',
            location: 'Phòng A107',
            students: 12,
            maxStudents: 25,
            instructors: [
                { id: '9', name: 'Phạm Văn E', initial: 'P' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '7',
            name: 'Data Science - K09',
            description: 'Khoa học dữ liệu và phân tích dữ liệu',
            program: 'Công nghệ Thông tin',
            startDate: '2024-11-10',
            schedule: 'Thứ 2, Thứ 5 - 18:00-21:00',
            location: 'Phòng F601',
            students: 20,
            maxStudents: 30,
            instructors: [
                { id: '10', name: 'Hoàng Thị F', initial: 'H' }
            ],
            status: 'Đang học',
        },
        {
            id: '8',
            name: 'UI/UX Design - K11',
            description: 'Thiết kế giao diện và trải nghiệm người dùng',
            program: 'Thiết kế Đồ họa',
            startDate: '2024-12-15',
            schedule: 'Thứ 3, Thứ 6 - 19:00-21:30',
            location: 'Phòng G701',
            students: 15,
            maxStudents: 20,
            instructors: [
                { id: '11', name: 'Vũ Văn G', initial: 'V' }
            ],
            status: 'Đang học',
        },
        {
            id: '9',
            name: 'Mobile App Development - K13',
            description: 'Phát triển ứng dụng di động đa nền tảng',
            program: 'Công nghệ Thông tin',
            startDate: '2025-02-01',
            schedule: 'Thứ 4, Thứ 7 - 18:30-21:00',
            location: 'Phòng H801',
            students: 8,
            maxStudents: 25,
            instructors: [
                { id: '12', name: 'Đặng Thị H', initial: 'Đ' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '10',
            name: 'E-commerce Marketing - K07',
            description: 'Marketing thương mại điện tử và bán hàng online',
            program: 'Digital Marketing',
            startDate: '2024-11-05',
            schedule: 'Thứ 2, Thứ 4 - 19:30-21:30',
            location: 'Phòng I901',
            students: 25,
            maxStudents: 30,
            instructors: [
                { id: '13', name: 'Bùi Văn I', initial: 'B' }
            ],
            status: 'Đang học',
        },
        {
            id: '11',
            name: 'Cybersecurity - K14',
            description: 'An ninh mạng và bảo mật thông tin',
            program: 'Công nghệ Thông tin',
            startDate: '2025-03-10',
            schedule: 'Thứ 3, Thứ 5 - 18:00-20:30',
            location: 'Phòng J1001',
            students: 0,
            maxStudents: 20,
            instructors: [
                { id: '14', name: 'Lý Thị J', initial: 'L' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '12',
            name: 'Business Analytics - K06',
            description: 'Phân tích kinh doanh và ra quyết định dựa trên dữ liệu',
            program: 'Kinh doanh',
            startDate: '2024-10-20',
            schedule: 'Thứ 6, CN - 14:00-17:00',
            location: 'Phòng K1101',
            students: 18,
            maxStudents: 25,
            instructors: [
                { id: '15', name: 'Trịnh Văn K', initial: 'T' }
            ],
            status: 'Đang học',
        },
        {
            id: '13',
            name: 'Cloud Computing - K17',
            description: 'Điện toán đám mây và triển khai ứng dụng',
            program: 'Công nghệ Thông tin',
            startDate: '2025-04-15',
            schedule: 'Thứ 2, Thứ 4, Thứ 6 - 19:00-21:00',
            location: 'Phòng L1201',
            students: 0,
            maxStudents: 20,
            instructors: [
                { id: '16', name: 'Phan Thị L', initial: 'P' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '14',
            name: 'Social Media Marketing - K10',
            description: 'Marketing trên mạng xã hội và quảng cáo trực tuyến',
            program: 'Digital Marketing',
            startDate: '2024-12-10',
            schedule: 'Thứ 3, Thứ 5 - 19:00-21:30',
            location: 'Phòng M1301',
            students: 22,
            maxStudents: 30,
            instructors: [
                { id: '17', name: 'Ngô Văn M', initial: 'N' }
            ],
            status: 'Đang học',
        },
        {
            id: '15',
            name: 'Game Development - K18',
            description: 'Phát triển game và ứng dụng giải trí',
            program: 'Công nghệ Thông tin',
            startDate: '2025-05-20',
            schedule: 'Thứ 7, CN - 09:00-12:00',
            location: 'Phòng N1401',
            students: 0,
            maxStudents: 15,
            instructors: [
                { id: '18', name: 'Đinh Thị N', initial: 'Đ' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '16',
            name: 'Content Marketing - K19',
            description: 'Tạo nội dung marketing và chiến lược nội dung',
            program: 'Digital Marketing',
            startDate: '2025-01-25',
            schedule: 'Thứ 2, Thứ 4 - 18:30-20:30',
            location: 'Phòng O1501',
            students: 0,
            maxStudents: 25,
            instructors: [
                { id: '19', name: 'Võ Văn O', initial: 'V' }
            ],
            status: 'Chuẩn bị',
        },
        {
            id: '17',
            name: 'Machine Learning - K20',
            description: 'Học máy và trí tuệ nhân tạo cơ bản',
            program: 'Công nghệ Thông tin',
            startDate: '2025-06-01',
            schedule: 'Thứ 3, Thứ 5 - 19:00-21:30',
            location: 'Phòng P1601',
            students: 0,
            maxStudents: 20,
            instructors: [
                { id: '20', name: 'Lê Thị P', initial: 'L' }
            ],
            status: 'Chuẩn bị',
        }
    ]);

    // Filter classes based on search and status
    const filteredClasses = classes.filter(c => {
        const matchesSearch = c.name.toLowerCase().includes(query.toLowerCase()) ||
                            c.description.toLowerCase().includes(query.toLowerCase());
        const matchesStatus = statusFilter === 'Tất cả trạng thái' || c.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Calculate pagination
    const totalPages = Math.ceil(filteredClasses.length / classesPerPage);
    const startIndex = (currentPage - 1) * classesPerPage;
    const endIndex = startIndex + classesPerPage;
    const currentClasses = filteredClasses.slice(startIndex, endIndex);

    // Reset to first page when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [query, statusFilter]);

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

        // Parse existing schedule for editing
        const parseSchedule = (schedule: string) => {
            if (!schedule) return { days: [], times: [] };
            const [days, times] = schedule.split(' - ');
            return {
                days: days ? days.split(', ').filter(day => day.trim()) : [],
                times: times ? [times].filter(time => time.trim()) : []
            };
        };

        const initialSchedule = editing ? parseSchedule(editing.schedule) : { days: [], times: [] };
        const [selectedDays, setSelectedDays] = useState<string[]>(initialSchedule.days);
        const [selectedTime, setSelectedTime] = useState<string>(initialSchedule.times[0] || '');

        // Debug: Log the parsed schedule
        console.log('Editing schedule:', editing?.schedule);
        console.log('Parsed days:', initialSchedule.days);
        console.log('Parsed time:', initialSchedule.times[0]);

        // Options for days and times
        const dayOptions = [
            'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'
        ];

        const timeOptions = [
            '08:00-12:00', '14:00-17:00', '18:00-20:30', '18:30-21:00', 
            '19:00-21:30', '19:30-21:30', '08:00-11:00', '09:00-17:00'
        ];

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
                        schedule: `${selectedDays.join(', ')} - ${selectedTime}`,
                        location: String(form.get('location') || ''),
                        students: editing?.students ?? 0, // Giữ nguyên số học viên hiện tại khi chỉnh sửa
                        maxStudents: Number(form.get('maxStudents') || 0),
                        instructors: editing?.instructors ?? [], // Giữ nguyên danh sách giảng viên hiện tại
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
                    if (selectedDays.length === 0 || !selectedTime) {
                        newErrors.schedule = 'Vui lòng chọn đầy đủ ngày và giờ học';
                    }
                    if (!payload.location || payload.location.trim().length < 2) {
                        newErrors.location = 'Phòng học tối thiểu 2 ký tự';
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
                                <label className="block text-xs text-gray-600 mb-1">Ngày học *</label>
                                <MultiSelect
                                    options={dayOptions}
                                    selectedValues={selectedDays}
                                    onChange={setSelectedDays}
                                    placeholder="Chọn ngày học"
                                    name="scheduleDays"
                                    error={errors.schedule}
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Giờ học *</label>
                                <select
                                    name="scheduleTime"
                                    value={selectedTime}
                                    onChange={(e) => setSelectedTime(e.target.value)}
                                    className={`w-full h-9 rounded-md border px-3 text-sm ${errors.schedule ? 'border-red-500' : 'border-gray-300'}`}
                                >
                                    <option value="">Chọn giờ học</option>
                                    {timeOptions.map((time) => (
                                        <option key={time} value={time}>
                                            {time}
                                        </option>
                                    ))}
                                </select>
                                {errors.schedule && <div className="text-xs text-red-600 mt-1">{errors.schedule}</div>}
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Phòng học *</label>
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
                        className="h-9 px-3 rounded-md bg-gray-900 text-white hover:bg-black transition-all duration-300"
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
                    <div>
                        <h1 className="text-lg font-semibold">Quản lý Lớp học</h1>
                        <p className="text-xs text-gray-500">Quản lý thông tin lớp học và danh sách học viên</p>
                    </div>
                </div>
                <button
                    onClick={() => setOpenCreate(true)}
                    className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black transition-all duration-300"
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
                classes={currentClasses}
                query={query}
                statusFilter={statusFilter}
                setOpenAssignInstructor={setOpenAssignInstructor}
                onEdit={setOpenEdit}
                onManageStudents={setOpenManageStudents}
                totalClasses={filteredClasses.length}
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setCurrentPage}
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
                        onUpdateInstructors={handleUpdateInstructors}
                    />
                )}
            </Modal>
        </div>
    );
}
