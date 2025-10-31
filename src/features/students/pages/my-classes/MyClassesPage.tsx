import { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    ArrowLeft,
    GripVertical,
    FileText,
    BookOpen,
    Users,
    Calendar,
    Loader2,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useUserProfile } from '@/stores/userProfile';
import { getMyClasses, type ClassDto } from '@/shared/api/classes';
import { getModulesByProgram, type ModuleResponse } from '@/shared/api/modules';
import { useToast } from '@/shared/hooks/useToast';
import DocumentViewer from '@/components/DocumentViewer';
import {
    DndContext,
    DragOverlay,
    PointerSensor,
    KeyboardSensor,
    useSensor,
    useSensors,
    closestCenter,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

// Types
type ClassStatus = 'Đang học' | 'Hoàn thành' | 'Sắp học';

// Module with resource info
type ModuleWithStatus = ModuleResponse & {
    status?: 'Hoàn thành' | 'Đang học' | 'Chưa học';
};

// Helper: Map StudyTime enum to time range
const getStudyTimeRange = (studyTime?: string): string => {
    const timeMap: Record<string, string> = {
        'MORNING': '08:00 - 11:00',
        'AFTERNOON': '14:00 - 17:00',
        'EVENING': '18:00 - 21:00',
    };
    return studyTime ? timeMap[studyTime] || studyTime : '';
};

// Helper: Map StudyDay enum to Vietnamese
const getStudyDayLabel = (day: string): string => {
    const dayMap: Record<string, string> = {
        'MONDAY': 'Thứ 2',
        'TUESDAY': 'Thứ 3',
        'WEDNESDAY': 'Thứ 4',
        'THURSDAY': 'Thứ 5',
        'FRIDAY': 'Thứ 6',
        'SATURDAY': 'Thứ 7',
        'SUNDAY': 'CN',
    };
    return dayMap[day] || day;
};

// Sortable Item Component
function SortableModuleItem({ 
    module, 
    index,
    onViewDocument 
}: { 
    module: ModuleWithStatus; 
    index: number;
    onViewDocument?: (resource: any) => void;
}) {
    const [isCollapsed, setIsCollapsed] = useState(false);
    
    // Chỉ môn BẮT BUỘC (isMandatory = true) mới KHÔNG được kéo thả
    const canDrag = !module.isMandatory;
    
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
        id: module.moduleId.toString(),
        disabled: !canDrag,
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            className={`
                flex items-start gap-3 p-4 rounded-lg
                ${canDrag ? 'bg-white' : 'bg-gray-100'}
                border-2 ${canDrag ? 'border-gray-200' : 'border-gray-400'}
                ${isDragging ? 'opacity-50 z-50' : canDrag ? 'hover:border-gray-300 hover:shadow-md' : ''}
                transition-all duration-500
            `}
        >
            {/* Số thứ tự */}
            <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-md">
                    {index + 1}
                </div>
            </div>

            {/* Drag Handle - Rộng hơn */}
            {canDrag ? (
            <div
                {...listeners}
                className="cursor-grab active:cursor-grabbing flex-shrink-0 px-3 py-2 -my-2 hover:bg-gray-50 rounded-lg transition-colors group"
            >
                <div className="flex flex-col items-center gap-1">
                    <GripVertical size={24} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                    <span className="text-[10px] text-gray-400 group-hover:text-gray-600 font-medium">KÉO</span>
                </div>
            </div>
            ) : (
                <div
                    className="flex-shrink-0 px-3 py-2 -my-2 rounded-lg transition-colors cursor-not-allowed"
                    title="Môn có điều kiện tiên quyết không thể sắp xếp"
                >
                    <div className="flex flex-col items-center gap-1">
                        <GripVertical size={24} className="text-gray-500 opacity-50" />
                        <span className="text-[10px] text-gray-600 font-bold">🔒</span>
                    </div>
                </div>
            )}

            {/* Status icon */}
            <div className="mt-1 flex-shrink-0">
                {module.status === 'Hoàn thành' ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center text-white text-xs">
                        ✓
                    </div>
                ) : module.status === 'Đang học' ? (
                    <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                        ⏵
                    </div>
                ) : (
                    <div className="w-5 h-5 rounded-full bg-gray-300" />
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                        <h4 className="font-semibold text-sm">{module.name}</h4>
                        {!isCollapsed && module.isMandatory && (
                            <div className="flex items-center gap-1 text-xs text-gray-700 mt-1 bg-gray-200 px-2 py-1 rounded-md border border-gray-400 w-fit">
                                <span>🔒</span>
                                <span className="font-semibold">Môn BẮT BUỘC - Không thể sắp xếp</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setIsCollapsed(!isCollapsed)}
                            className="p-1 rounded-md hover:bg-gray-100 transition-colors"
                            title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}
                        >
                            {isCollapsed ? (
                                <ChevronDown size={18} className="text-gray-500" />
                            ) : (
                                <ChevronUp size={18} className="text-gray-500" />
                            )}
                        </button>
                        <span
                            className={`px-2 py-0.5 rounded text-xs flex-shrink-0 ${
                                module.status === 'Hoàn thành'
                                    ? 'bg-green-100 text-green-700'
                                    : module.status === 'Đang học'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {module.status || 'Chưa học'}
                        </span>
                    </div>
                </div>

                {!isCollapsed && (
                    <>
                        {module.isMandatory === false && <div className="text-xs text-blue-600 mb-2">📌 Môn tự chọn</div>}

                        <p className="text-sm text-gray-600 mb-3">{module.description || 'Không có mô tả'}</p>

                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap mb-3">
                            <span>📘 Mã: {module.code}</span>
                            <span>⏱️ {module.credits} tín chỉ</span>
                            {module.durationHours && <span>📅 {module.durationHours}h</span>}
                            {module.level && <span>🎯 {module.level}</span>}
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                            <button className="px-3 py-1.5 text-xs rounded-md border hover:bg-gray-50 flex items-center gap-1">
                                <Eye size={12} />
                                Ôn tập
                            </button>
                        </div>

                        {/* Accordion Tài liệu */}
                        {module.resources && module.resources.length > 0 && (
                        <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value={`docs-${module.moduleId}`} className="border-0">
                                <AccordionTrigger className="px-3 py-2 text-xs hover:no-underline bg-gray-50 hover:bg-gray-100 rounded-md">
                                    <span className="flex items-center gap-2">
                                        <FileText size={12} />
                                            Xem tài liệu ({module.resources.length})
                                    </span>
                                </AccordionTrigger>
                                <AccordionContent className="pt-3 pb-0">
                                    <div className="space-y-2">
                                            {module.resources.map((resource, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center justify-between p-2 rounded-md hover:bg-gray-50 border border-gray-200 transition-colors group cursor-pointer"
                                                    onClick={() => onViewDocument && onViewDocument(resource)}
                                    >
                                        <div className="flex items-center gap-2">
                                            <FileText size={14} className="text-blue-600" />
                                            <div>
                                                        <div className="text-xs font-medium">{resource.fileName || 'Document'}</div>
                                                        <div className="text-[10px] text-gray-500">
                                                            {resource.fileType?.toUpperCase()} 
                                                            {resource.fileSize && ` • ${(resource.fileSize / 1024 / 1024).toFixed(1)} MB`}
                                        </div>
                                    </div>
                                        </div>
                                            <Eye size={14} className="text-gray-400 group-hover:text-blue-600" />
                                        </div>
                                            ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

export default function MyClassesPage() {
    const toast = useToast();
    const { me, loading: profileLoading } = useUserProfile();
    
    const [view, setView] = useState<'list' | 'detail' | 'module' | 'classroom'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
    const [selectedClass, setSelectedClass] = useState<ClassDto | null>(null);
    const [sortableModules, setSortableModules] = useState<ModuleWithStatus[]>([]);
    const [activeId, setActiveId] = useState<string | null>(null);

    // Data states
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [modules, setModules] = useState<ModuleWithStatus[]>([]);
    const [modulesBySemester, setModulesBySemester] = useState<Record<number, ModuleWithStatus[]>>({});
    const [loading, setLoading] = useState(false);
    
    // Document viewer
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string>('');

    // Load classes when user profile is ready
    useEffect(() => {
        if (me?.userId) {
            loadClasses();
        }
    }, [me?.userId]);

    // Update modulesBySemester when sortableModules changes
    useEffect(() => {
        const grouped: Record<number, ModuleWithStatus[]> = {};
        sortableModules.forEach(module => {
            const semester = module.semester || 1;
            if (!grouped[semester]) {
                grouped[semester] = [];
            }
            grouped[semester].push(module);
        });
        setModulesBySemester(grouped);
    }, [sortableModules]);

    // Load classes for student
    const loadClasses = async () => {
        try {
            setLoading(true);
            const response = await getMyClasses();
            setClasses(response.data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể tải danh sách lớp học');
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Load modules for selected class
    const loadModules = async (programId: number) => {
        try {
            setLoading(true);
            const response = await getModulesByProgram({ programId });
            
            // Map modules with status
            const modulesData = response.data.map((module, index) => ({
                ...module,
                // Giả sử module đầu tiên là đang học, các module trước đó hoàn thành, sau đó chưa học
                status: index === 0 ? 'Đang học' as const : 
                       index < 2 ? 'Hoàn thành' as const : 
                       'Chưa học' as const,
            }));
            
            setModules(modulesData);
            setSortableModules(modulesData);
            
            // Group modules by semester
            const grouped: Record<number, ModuleWithStatus[]> = {};
            modulesData.forEach(module => {
                const semester = module.semester || 1;
                if (!grouped[semester]) {
                    grouped[semester] = [];
                }
                grouped[semester].push(module);
            });
            setModulesBySemester(grouped);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể tải danh sách module');
            console.error('Error loading modules:', error);
        } finally {
            setLoading(false);
        }
    };

    // Handle view document
    const handleViewDocument = (resource: any) => {
        if (resource?.url) {
            setPreviewUrl(resource.url);
            setPreviewFileName(resource.fileName || 'Document');
        }
    };

    // Helper to convert class status
    const getClassStatus = (classDto: ClassDto): ClassStatus => {
        switch (classDto.status) {
            case 'ONGOING':
                return 'Đang học';
            case 'FINISHED':
                return 'Hoàn thành';
            case 'PLANNED':
                return 'Sắp học';
            default:
                return 'Đang học';
        }
    };

    // Filter classes
    const filteredClasses = classes.filter((cls) => {
        const matchesSearch =
            cls.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (cls.programName && cls.programName.toLowerCase().includes(searchQuery.toLowerCase()));

        const classStatus = getClassStatus(cls);
        const matchesStatus = statusFilter === 'Tất cả' || classStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleBackToList = () => {
        setSelectedClass(null);
        setModules([]);
        setView('list');
    };

    const handleBackToDetail = () => {
        setView('detail');
    };

    const handleEnterClassroom = async (cls: ClassDto) => {
        setSelectedClass(cls);
        if (cls.programId) {
            await loadModules(cls.programId);
        }
        setView('classroom');
    };

    const handleBackToListFromClassroom = () => {
        setSelectedClass(null);
        setSortableModules([]);
        setModules([]);
        setView('list');
    };

    // @dnd-kit sensors
    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        }),
    );

    const handleDragStart = (event: DragEndEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setSortableModules((items) => {
                const activeModule = items.find((item) => item.moduleId.toString() === active.id);
                const overModule = items.find((item) => item.moduleId.toString() === over.id);

                // 🔒 Kiểm tra: Modules chỉ có thể được di chuyển trong cùng một semester
                if (activeModule && overModule && activeModule.semester !== overModule.semester) {
                    toast.error(`🔒 Không thể di chuyển module giữa các học kỳ! Module thuộc học kỳ ${activeModule.semester} không thể di chuyển sang học kỳ ${overModule.semester}.`);
                    return items;
                }

                // 🔒 Kiểm tra: Module BẮT BUỘC không thể được di chuyển
                if (activeModule?.isMandatory) {
                    toast.error('🔒 Không thể sắp xếp module BẮT BUỘC! Các module bắt buộc có vị trí cố định.');
                    return items;
                }

                // 🔒 Kiểm tra: Không cho phép kéo qua module BẮT BUỘC
                const oldIndex = items.findIndex((item) => item.moduleId.toString() === active.id);
                const newIndex = items.findIndex((item) => item.moduleId.toString() === over.id);
                
                const start = Math.min(oldIndex, newIndex);
                const end = Math.max(oldIndex, newIndex);
                
                // Kiểm tra xem có module BẮT BUỘC nào trong khoảng di chuyển không
                const hasMandatoryInRange = items.slice(start, end + 1).some((item, idx) => {
                    const currentIndex = start + idx;
                    // Bỏ qua module đang được kéo và module đích
                    if (currentIndex === oldIndex || currentIndex === newIndex) {
                        return false;
                    }
                    return item.isMandatory; // Chỉ check môn BẮT BUỘC
                });

                if (hasMandatoryInRange) {
                    toast.error('🔒 Không thể di chuyển qua module BẮT BUỘC! Các module bắt buộc có vị trí cố định.');
                    return items; // Không cho phép di chuyển
                }

                return arrayMove(items, oldIndex, newIndex);
            });
        }

        setActiveId(null);
    };

    const handleDragCancel = () => {
        setActiveId(null);
    };

    // Show loading
    if (profileLoading || loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    // Render Class List
    if (view === 'list') {
        return (
            <div className="space-y-6">
                <div>
                    <h1 className="text-lg font-semibold">Lớp học của tôi</h1>
                </div>

                {/* Search and Filter */}
                <div className="flex items-center gap-4">
                    <div className="flex-1 relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Tìm kiếm theo tên lớp, mã lớp hoặc giảng viên..."
                            className="w-full h-10 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-gray-200"
                        />
                    </div>
                    <button className="h-10 px-4 rounded-md bg-gray-900 text-white text-sm font-medium">Tất cả</button>
                    <button className="h-10 px-4 rounded-md border text-sm">Đang học</button>
                    <button className="h-10 px-4 rounded-md border text-sm">Hoàn thành</button>
                    <button className="h-10 px-4 rounded-md border text-sm">Sắp học</button>
                </div>

                {/* Class Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredClasses.length === 0 ? (
                        <div className="col-span-3 text-center py-12 text-gray-500">
                            <p>Không tìm thấy lớp học nào.</p>
                        </div>
                    ) : (
                        filteredClasses.map((cls) => {
                            const classStatus = getClassStatus(cls);
                            return (
                                <div
                                    key={cls.classId}
                            className="bg-white border rounded-xl p-4 hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => handleEnterClassroom(cls)}
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-sm mb-1">{cls.name}</h3>
                                    <div className="flex items-center gap-2">
                                                <span className="text-xs font-medium">#{cls.classId}</span>
                                        <span
                                            className={`text-xs px-2 py-0.5 rounded-full ${
                                                        classStatus === 'Đang học'
                                                    ? 'bg-black text-white'
                                                            : classStatus === 'Hoàn thành'
                                                      ? 'bg-green-100 text-green-700'
                                                      : 'bg-gray-100 text-gray-700'
                                            }`}
                                        >
                                                    {classStatus}
                                        </span>
                                    </div>
                                </div>
                                {/* Eye icon to view details without entering class */}
                                <button
                                    title="Xem chi tiết"
                                    className="p-2 rounded hover:bg-gray-100 text-gray-600"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        setSelectedClass(cls);
                                        setView('detail');
                                    }}
                                >
                                    <Eye size={16} />
                                </button>
                            </div>

                            {/* Info */}
                            <div className="space-y-2 text-xs text-gray-600">
                                <div className="flex items-center gap-2">
                                            <span className="text-gray-400">📚</span>
                                            <span>Chương trình: {cls.programName}</span>
                                </div>
                                        {(cls.studyDays || cls.studyTime) && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📅</span>
                                                <span>
                                                    {cls.studyDays ? cls.studyDays.join(', ') : ''}
                                                    {cls.studyTime ? ` - ${cls.studyTime}` : ''}
                                                </span>
                                </div>
                                        )}
                                        {cls.room && (
                                <div className="flex items-center gap-2">
                                    <span className="text-gray-400">📍</span>
                                    <span>{cls.room}</span>
                                </div>
                                        )}
                                        {cls.startDate && (
                                    <div className="flex items-center gap-2 text-blue-600">
                                        <span className="text-blue-400">🕐</span>
                                                <span>Bắt đầu: {new Date(cls.startDate).toLocaleDateString('vi-VN')}</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    {cls.description && (
                                        <div className="mt-3 text-xs text-gray-600 line-clamp-2">
                                            {cls.description}
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }


    // Render Classroom View with Drag-Drop Modules
    if (view === 'classroom' && selectedClass) {
        return (
            <div className="space-y-6">
                {/* Back button */}
                <button
                    onClick={handleBackToListFromClassroom}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span>Quay lại danh sách lớp</span>
                </button>

                {/* Class Header */}
                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.name}</h1>
                            <p className="text-sm text-gray-500">Mã lớp: #{selectedClass.classId}</p>
                        </div>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                            getClassStatus(selectedClass) === 'Đang học' ? 'bg-blue-100 text-blue-700' :
                            getClassStatus(selectedClass) === 'Hoàn thành' ? 'bg-green-100 text-green-700' :
                            'bg-gray-100 text-gray-700'
                        }`}>
                            {getClassStatus(selectedClass)}
                        </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="flex items-center gap-3">
                            <BookOpen className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Chương trình</p>
                                <p className="text-sm font-medium text-gray-900">{selectedClass.programName}</p>
                            </div>
                        </div>
                        {(selectedClass.studyDays || selectedClass.studyTime) && (
                        <div className="flex items-center gap-3">
                            <Calendar className="text-gray-400" size={20} />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Lịch học</p>
                                {selectedClass.studyDays && (
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs text-gray-500">Ngày:</span>
                                        <span className="text-sm font-medium text-gray-900">
                                            {selectedClass.studyDays.map(getStudyDayLabel).join(', ')}
                                        </span>
                                    </div>
                                )}
                                {selectedClass.studyTime && (
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs text-gray-500">Giờ:</span>
                                        <span className="text-sm font-semibold text-blue-600">
                                            {getStudyTimeRange(selectedClass.studyTime)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        )}
                        {selectedClass.room && (
                        <div className="flex items-center gap-3">
                                <Users className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Phòng học</p>
                                <p className="text-sm font-medium text-gray-900">{selectedClass.room}</p>
                            </div>
                        </div>
                        )}
                    </div>
                </div>

                {/* Modules with Drag-Drop */}
                <div className="space-y-4">
                    <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-lg font-bold text-gray-900">Danh sách Module</h2>
                        <div className="text-sm text-gray-500">💡 Kéo thả để sắp xếp lại thứ tự module</div>
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-700 bg-gray-100 px-3 py-2 rounded-md border border-gray-400 w-fit">
                            <span>🔒</span>
                            <span className="font-semibold">Lưu ý: Môn BẮT BUỘC không được phép sắp xếp (vị trí cố định)</span>
                        </div>
                    </div>

                    {Object.keys(modulesBySemester).length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>Chưa có module nào trong chương trình học này.</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {Object.keys(modulesBySemester)
                                .sort((a, b) => parseInt(a) - parseInt(b))
                                .map((semester) => {
                                    const semesterModules = modulesBySemester[parseInt(semester)];
                                    const startIndex = sortableModules.findIndex(m => m.semester === parseInt(semester));
                                    
                                    return (
                                        <div key={semester} className="space-y-3">
                                            {/* Semester Header */}
                                            <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                                                <h3 className="font-bold text-base">
                                                    Học kỳ {semester}
                                                    <span className="ml-2 text-sm font-normal">
                                                        ({semesterModules.length} {semesterModules.length === 1 ? 'module' : 'modules'})
                                                    </span>
                                                </h3>
                                            </div>

                                            {/* Modules in this semester */}
                                            <DndContext
                                                sensors={sensors}
                                                collisionDetection={closestCenter}
                                                onDragStart={handleDragStart}
                                                onDragEnd={handleDragEnd}
                                                onDragCancel={handleDragCancel}
                                            >
                                                <SortableContext
                                                    items={semesterModules.map((m) => m.moduleId.toString())}
                                                    strategy={verticalListSortingStrategy}
                                                >
                                                    <div className="space-y-3 pl-4 border-l-2 border-gray-200 ml-2">
                                                        {semesterModules.map((module, idx) => {
                                                            const globalIndex = sortableModules.findIndex(m => m.moduleId === module.moduleId);
                                                            return (
                                                                <SortableModuleItem 
                                                                    key={module.moduleId} 
                                                                    module={module} 
                                                                    index={globalIndex}
                                                                    onViewDocument={handleViewDocument}
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                </SortableContext>

                                                <DragOverlay>
                                                    {activeId ? (
                                                        <div className="bg-white rounded-lg border-2 border-blue-500 p-4 shadow-lg opacity-90">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                                                    {sortableModules.findIndex((m) => m.moduleId.toString() === activeId) + 1}
                                                                </div>
                                                                <div className="flex-1">
                                                                    <h4 className="font-semibold text-sm">
                                                                        {sortableModules.find((m) => m.moduleId.toString() === activeId)?.name}
                                                                    </h4>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ) : null}
                                                </DragOverlay>
                                            </DndContext>
                                        </div>
                                    );
                                })}
                        </div>
                    )}
                </div>

                {/* Document Viewer Modal */}
                {previewUrl && (
                    <DocumentViewer
                        documentUrl={previewUrl}
                        fileName={previewFileName}
                        onClose={() => {
                            setPreviewUrl(null);
                            setPreviewFileName('');
                        }}
                    />
                )}
            </div>
        );
    }

    return null;
}
