import React, { useState, useEffect } from 'react';
import { Search, X, ChevronDown, Check } from 'lucide-react';
import ClassList from '@/features/users/pages/classes/list.tsx';
import ManageStudentsModal from '@/features/users/pages/classes/components/ManageStudentsModal';
import AssignInstructorModal from '@/features/users/pages/classes/components/AssignInstructorModal';
import { useToast } from '@/shared/hooks/useToast';
import { useUserProfile } from '@/stores/userProfile';
import { 
    listClasses, 
    createClass, 
    updateClass,
    getProgramsLite,
    type ClassDto,
    type ProgramLiteDto,
    type StudyDay,
    type StudyTime,
    type ClassStatus
} from '@/shared/api/classes';
import { getCentersLite } from '@/shared/api/centers';
import type { CenterLiteDto } from '@/shared/types/centers';

type Instructor = {
    id: string;
    name: string;
    initial: string;
    avatar?: string;
};

// Map ClassDto to UI Class type
type Class = {
    id: string;
    name: string;
    description: string;
    program: string;
    programId: number;
    startDate: string;
    endDate?: string;
    schedule: string;
    location: string;
    students: number;
    maxStudents: number;
    instructors: Instructor[];
    status: 'Chuẩn bị' | 'Đang học' | 'Hoàn thành' | 'Tạm dừng';
    studyDays?: StudyDay[];
    studyTime?: StudyTime;
    centerName?: string;
};

// Helper function to map API status to UI status
const mapStatusToUI = (status: ClassStatus): Class['status'] => {
    const statusMap: Record<ClassStatus, Class['status']> = {
        'PLANNED': 'Chuẩn bị',
        'ONGOING': 'Đang học',
        'FINISHED': 'Hoàn thành',
        'CANCELLED': 'Tạm dừng'
    };
    return statusMap[status];
};

// Helper function to map UI status to API status
const mapStatusToAPI = (status: Class['status']): ClassStatus => {
    const statusMap: Record<Class['status'], ClassStatus> = {
        'Chuẩn bị': 'PLANNED',
        'Đang học': 'ONGOING',
        'Hoàn thành': 'FINISHED',
        'Tạm dừng': 'CANCELLED'
    };
    return statusMap[status];
};

// Helper function to format schedule from API data
const formatSchedule = (studyDays?: StudyDay[] | null, studyTime?: StudyTime | null): string => {
    if (!studyDays || studyDays.length === 0) return '';
    
    const dayMap: Record<StudyDay, string> = {
        'MONDAY': 'Thứ 2',
        'TUESDAY': 'Thứ 3',
        'WEDNESDAY': 'Thứ 4',
        'THURSDAY': 'Thứ 5',
        'FRIDAY': 'Thứ 6',
        'SATURDAY': 'Thứ 7',
        'SUNDAY': 'CN'
    };
    
    const timeMap: Record<StudyTime, string> = {
        'MORNING': '08:00-11:00',
        'AFTERNOON': '14:00-17:00',
        'EVENING': '18:00-21:00'
    };
    
    const days = studyDays.map(d => dayMap[d]).join(', ');
    const time = studyTime ? timeMap[studyTime] : '';
    
    return time ? `${days} - ${time}` : days;
};

// Helper function to map ClassDto to UI Class
const mapClassDtoToUI = (dto: ClassDto): Class => {
    return {
        id: String(dto.classId),
        name: dto.name,
        description: dto.description || '',
        program: dto.programName,
        programId: dto.programId,
        startDate: dto.startDate || '',
        endDate: dto.endDate || '',
        schedule: formatSchedule(dto.studyDays, dto.studyTime),
        location: dto.room || '',
        students: 0, // TODO: Get from enrollment API
        maxStudents: dto.capacity || 0,
        instructors: [], // TODO: Get from lecturer API
        status: mapStatusToUI(dto.status),
        studyDays: dto.studyDays || undefined,
        studyTime: dto.studyTime || undefined,
        centerName: dto.centerName
    };
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
    error,
    maxSelection
}: { 
    options: string[]; 
    selectedValues: string[]; 
    onChange: (values: string[]) => void; 
    placeholder: string;
    name: string;
    error?: string;
    maxSelection?: number;
}) {
    const [isOpen, setIsOpen] = useState(false);

    const handleToggle = (value: string) => {
        if (selectedValues.includes(value)) {
            onChange(selectedValues.filter(v => v !== value));
        } else {
            // Check max selection limit
            if (maxSelection && selectedValues.length >= maxSelection) {
                return; // Don't add more if limit reached
            }
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
                    {options.map((option) => {
                        const isSelected = selectedValues.includes(option);
                        const isDisabled = !isSelected && maxSelection && selectedValues.length >= maxSelection;
                        
                        return (
                            <label
                                key={option}
                                className={`flex items-center gap-2 px-3 py-2 ${
                                    isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 cursor-pointer'
                                }`}
                            >
                                <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => handleToggle(option)}
                                    disabled={isDisabled}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:cursor-not-allowed"
                                />
                                <span className="text-sm text-gray-900">{option}</span>
                                {isSelected && (
                                    <Check size={16} className="text-blue-600 ml-auto" />
                                )}
                            </label>
                        );
                    })}
                </div>
            )}
            
            {error && <div className="text-xs text-red-600 mt-1">{error}</div>}
            
            {/* Hidden input for form submission */}
            <input type="hidden" name={name} value={selectedValues.join(',')} />
        </div>
    );
}

export default function ClassesPage() {
    const toast = useToast();
    const { me: userProfile } = useUserProfile();
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

    // State for classes and programs
    const [classes, setClasses] = useState<Class[]>([]);
    const [programs, setPrograms] = useState<ProgramLiteDto[]>([]);
    const [centers, setCenters] = useState<CenterLiteDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // Check if user has GLOBAL scope (can select center)
    const hasGlobalScope = !userProfile?.centerId;

    // Fetch classes and programs from API
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                
                // Always fetch classes and programs
                const [classesRes, programsRes] = await Promise.all([
                    listClasses(),
                    getProgramsLite()
                ]);
                
                const mappedClasses = classesRes.data.map(mapClassDtoToUI);
                setClasses(mappedClasses);
                setPrograms(programsRes.data);
                
                // Only fetch centers if user has GLOBAL scope
                if (hasGlobalScope) {
                    const centersRes = await getCentersLite();
                    setCenters(centersRes.data);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
                toast.error('Lỗi tải dữ liệu', 'Không thể tải danh sách lớp học');
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchData();
    }, [hasGlobalScope]);

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

        // Options for days and times
        const dayOptions = [
            'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'
        ];

        const timeOptions = [
            '08:00-11:00',
            '14:00-17:00', 
            '18:00-21:00'
        ];

        return (
            <form
                onSubmit={async (e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget as HTMLFormElement);
                    
                    const programId = Number(form.get('programId'));
                    
                    const newErrors: typeof errors = {};
                    
                    const name = String(form.get('name') || '');
                    const startDate = String(form.get('startDate') || '');
                    const endDate = String(form.get('endDate') || '');
                    const room = String(form.get('location') || '');
                    const capacity = Number(form.get('maxStudents') || 0);
                    const status = String(form.get('status') || 'Chuẩn bị') as Class['status'];

                    // Validation
                    if (!name || name.trim().length < 3) {
                        newErrors.name = 'Tên lớp học tối thiểu 3 ký tự';
                    }
                    if (!programId || isNaN(programId)) {
                        newErrors.program = 'Vui lòng chọn chương trình';
                    }
                    if (!startDate) {
                        newErrors.startDate = 'Vui lòng chọn ngày bắt đầu';
                    }
                    if (selectedDays.length === 0 || !selectedTime) {
                        newErrors.schedule = 'Vui lòng chọn đầy đủ ngày và giờ học';
                    }
                    
                    // Validate: Tối đa 2 ngày học
                    if (selectedDays.length > 2) {
                        newErrors.schedule = 'Chỉ được chọn tối đa 2 ngày học trong tuần';
                    }
                    
                    // Validate study days based on start/end date (only if < 7 days)
                    if (startDate && endDate && selectedDays.length > 0) {
                        const start = new Date(startDate);
                        const end = new Date(endDate);
                        const diffTime = Math.abs(end.getTime() - start.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                        // Only validate if duration < 7 days
                        if (diffDays < 7) {
                            const startDayOfWeek = start.getDay(); // 0 = CN, 1 = T2, ..., 6 = T7
                            const endDayOfWeek = end.getDay();
                            
                            const dayNumberMap: Record<string, number> = {
                                'CN': 0,
                                'Thứ 2': 1,
                                'Thứ 3': 2,
                                'Thứ 4': 3,
                                'Thứ 5': 4,
                                'Thứ 6': 5,
                                'Thứ 7': 6
                            };

                            const invalidDays = selectedDays.filter(day => {
                                const dayNum = dayNumberMap[day];
                                // Check if day is within start-end range
                                if (startDayOfWeek <= endDayOfWeek) {
                                    // Normal case: e.g., Thứ 4 -> CN (3 -> 0)
                                    return dayNum < startDayOfWeek || dayNum > endDayOfWeek;
                                } else {
                                    // Wrap around week: e.g., Thứ 6 -> Thứ 2 (5 -> 1)
                                    return dayNum < startDayOfWeek && dayNum > endDayOfWeek;
                                }
                            });

                            if (invalidDays.length > 0) {
                                const dayNames = dayOptions;
                                const startDayName = dayNames[startDayOfWeek === 0 ? 6 : startDayOfWeek - 1];
                                const endDayName = dayNames[endDayOfWeek === 0 ? 6 : endDayOfWeek - 1];
                                newErrors.schedule = `Lớp học < 7 ngày. Chỉ chọn ngày từ ${startDayName} đến ${endDayName}`;
                            }
                        }
                    }
                    
                    if (!room || room.trim().length < 2) {
                        newErrors.location = 'Phòng học tối thiểu 2 ký tự';
                    }
                    if (!capacity || capacity < 1) {
                        newErrors.maxStudents = 'Sĩ số tối đa phải lớn hơn 0';
                    }

                    setErrors(newErrors);
                    if (Object.keys(newErrors).length > 0) return;

                    // Map UI days to API StudyDay
                    const dayMap: Record<string, StudyDay> = {
                        'Thứ 2': 'MONDAY',
                        'Thứ 3': 'TUESDAY',
                        'Thứ 4': 'WEDNESDAY',
                        'Thứ 5': 'THURSDAY',
                        'Thứ 6': 'FRIDAY',
                        'Thứ 7': 'SATURDAY',
                        'CN': 'SUNDAY'
                    };
                    
                    // Map UI time to API StudyTime
                    const timeMap: Record<string, StudyTime> = {
                        '08:00-11:00': 'MORNING',
                        '14:00-17:00': 'AFTERNOON',
                        '18:00-21:00': 'EVENING'
                    };

                    const studyDays = selectedDays.map(d => dayMap[d]).filter(Boolean);
                    const studyTime = timeMap[selectedTime];

                    try {
                        if (editing) {
                            // Update existing class
                            const description = String(form.get('description') || '');
                            
                            // Build payload - always include programId and name
                            const updatePayload: any = {
                                programId, // Always include programId
                                name
                            };
                            
                            if (description.trim()) updatePayload.description = description.trim();
                            if (startDate) updatePayload.startDate = startDate;
                            if (endDate) updatePayload.endDate = endDate;
                            if (room.trim()) updatePayload.room = room.trim();
                            if (capacity > 0) updatePayload.capacity = capacity;
                            if (status) updatePayload.status = mapStatusToAPI(status);
                            if (studyDays.length > 0) updatePayload.studyDays = studyDays;
                            if (studyTime) updatePayload.studyTime = studyTime;
                            
                            const response = await updateClass(Number(editing.id), updatePayload);
                            const updatedClass = mapClassDtoToUI(response.data);
                            
                            setClasses(prev => prev.map(x => (x.id === editing.id ? updatedClass : x)));
                            setOpenEdit(null);
                            
                            toast.success('Cập nhật thành công!', `Lớp học ${name} đã được cập nhật`);
                        } else {
                            // Create new class
                            const description = String(form.get('description') || '');
                            const centerIdFromForm = form.get('centerId');
                            
                            // Build payload - only include fields with actual values
                            const createPayload: any = {
                                programId,
                                name
                            };
                            
                            // Add centerId based on user scope
                            if (hasGlobalScope) {
                                // GLOBAL scope: use selected center from dropdown
                                if (centerIdFromForm) {
                                    createPayload.centerId = Number(centerIdFromForm);
                                }
                            } else {
                                // CENTER scope: use user's centerId (backend will also validate this)
                                if (userProfile?.centerId) {
                                    createPayload.centerId = userProfile.centerId;
                                }
                            }
                            
                            if (description.trim()) createPayload.description = description.trim();
                            if (startDate) createPayload.startDate = startDate;
                            if (endDate) createPayload.endDate = endDate;
                            if (room.trim()) createPayload.room = room.trim();
                            if (capacity > 0) createPayload.capacity = capacity;
                            if (studyDays.length > 0) createPayload.studyDays = studyDays;
                            if (studyTime) createPayload.studyTime = studyTime;
                            
                            const response = await createClass(createPayload);
                            const newClass = mapClassDtoToUI(response.data);
                            
                            setClasses(prev => [newClass, ...prev]);
                            setOpenCreate(false);
                            
                            toast.success('Tạo thành công!', `Lớp học ${name} đã được thêm vào hệ thống`);
                        }
                    } catch (error: any) {
                        console.error('Failed to save class:', error);
                        console.error('Error response:', error.response?.data);
                        console.error('Error status:', error.response?.status);
                        console.error('Full error:', JSON.stringify({
                            message: error.message,
                            status: error.response?.status,
                            statusText: error.response?.statusText,
                            data: error.response?.data,
                            headers: error.response?.headers
                        }, null, 2));
                        
                        const errorMessage = error.response?.data?.message 
                            || error.response?.data?.error
                            || error.message
                            || 'Có lỗi xảy ra khi lưu lớp học';
                        
                        if (error.response?.status === 400) {
                            toast.error('Dữ liệu không hợp lệ', errorMessage);
                        } else if (error.response?.status === 409) {
                            toast.error('Trùng lặp dữ liệu', 'Tên lớp học đã tồn tại trong hệ thống');
                        } else if (error.response?.status === 500) {
                            toast.error('Lỗi hệ thống', 'Vui lòng kiểm tra lại thông tin hoặc liên hệ quản trị viên');
                        } else {
                            toast.error('Lỗi', errorMessage);
                        }
                    }
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
                                    name="programId"
                                    defaultValue={editing?.programId}
                                    required
                                    className={`w-full h-9 rounded-md border px-2 text-sm ${errors.program ? 'border-red-500' : ''}`}
                                >
                                    <option value="">Chọn chương trình</option>
                                    {programs.map(program => (
                                        <option key={program.programId} value={program.programId}>
                                            {program.name}
                                        </option>
                                    ))}
                                </select>
                                {errors.program && <div className="text-xs text-red-600 mt-1">{errors.program}</div>}
                            </div>
                            
                            {/* Center Field: Dropdown for GLOBAL scope, Read-only for CENTER scope */}
                            {hasGlobalScope ? (
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Trung tâm *</label>
                                    <select
                                        name="centerId"
                                        required
                                        className="w-full h-9 rounded-md border px-2 text-sm"
                                    >
                                        <option value="">Chọn trung tâm</option>
                                        {centers.map(center => (
                                            <option key={center.centerId} value={center.centerId}>
                                                {center.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            ) : (
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Trung tâm</label>
                                    <input
                                        type="text"
                                        value={userProfile?.centerName || ''}
                                        readOnly
                                        className="w-full h-9 rounded-md border px-3 text-sm bg-gray-50 text-gray-600 cursor-not-allowed"
                                    />
                                    <input type="hidden" name="centerId" value={userProfile?.centerId || ''} />
                                </div>
                            )}
                            
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
                                <label className="block text-xs text-gray-600 mb-1">Ngày học * (tối đa 2 ngày)</label>
                                <MultiSelect
                                    options={dayOptions}
                                    selectedValues={selectedDays}
                                    onChange={setSelectedDays}
                                    placeholder="Chọn ngày học"
                                    name="scheduleDays"
                                    error={errors.schedule}
                                    maxSelection={2}
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

            {/* Loading State */}
            {isLoading ? (
                <div className="rounded-2xl border border-gray-200 bg-white p-8 text-center">
                    <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
                </div>
            ) : (
                /* Classes List */
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
            )}
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
