import { useState, useEffect } from 'react';
import {
    Search,
    Eye,
    ArrowLeft,
    BookOpen,
    Users,
    Calendar,
    Loader2,
    CheckCircle,
    ArrowRight,
    ArrowUpDown,
    PlayCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useUserProfile } from '@/stores/userProfile';
import { getMyClasses, type ClassDto } from '@/shared/api/classes';
import { getModulesByProgram, type ModuleResponse } from '@/shared/api/modules';
import { useToast } from '@/shared/hooks/useToast';
import { useProgressStore } from '../../hooks/useProgressStore';

// Types
type ClassStatus = 'Đang học' | 'Hoàn thành' | 'Sắp học';

// Module with resource info
type ModuleWithStatus = ModuleResponse & {
    status?: 'Hoàn thành' | 'Đang học' | 'Chưa học';
};

// Helper: Map StudyTime enum to time range
const getStudyTimeRange = (studyTime?: string): string => {
    const timeMap: Record<string, string> = {
        MORNING: '08:00 - 11:00',
        AFTERNOON: '14:00 - 17:00',
        EVENING: '18:00 - 21:00',
    };
    return studyTime ? timeMap[studyTime] || studyTime : '';
};

// Helper: Map StudyDay enum to Vietnamese
const getStudyDayLabel = (day: string): string => {
    const dayMap: Record<string, string> = {
        MONDAY: 'Thứ 2',
        TUESDAY: 'Thứ 3',
        WEDNESDAY: 'Thứ 4',
        THURSDAY: 'Thứ 5',
        FRIDAY: 'Thứ 6',
        SATURDAY: 'Thứ 7',
        SUNDAY: 'CN',
    };
    return dayMap[day] || day;
};

export default function MyClassesPage() {
    const toast = useToast();
    const navigate = useNavigate();
    const { me, loading: profileLoading } = useUserProfile();
    const { getLessonStatus, progress } = useProgressStore();

    const [view, setView] = useState<'list' | 'detail'>('list');
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('Tất cả');
    const [selectedClass, setSelectedClass] = useState<ClassDto | null>(null);

    // Data states
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [modules, setModules] = useState<ModuleWithStatus[]>([]);
    const [loading, setLoading] = useState(false);

    // Document viewer
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string>('');

    // Continue learning state
    const [continueLesson, setContinueLesson] = useState<{
        classId: number;
        className: string;
        moduleId: number;
        moduleName: string;
        lessonId: string;
        lessonTitle: string;
    } | null>(null);

    // Load classes when user profile is ready
    useEffect(() => {
        if (me?.userId) {
            loadClasses();
        }
    }, [me?.userId]);

    // Load classes for student
    const loadClasses = async () => {
        try {
            setLoading(true);
            const response = await getMyClasses();
            setClasses(response.data);

            // Find the most recent in-progress lesson
            await findContinueLesson(response.data);
        } catch (error: any) {
            toast.error(error?.response?.data?.message || 'Không thể tải danh sách lớp học');
            console.error('Error loading classes:', error);
        } finally {
            setLoading(false);
        }
    };

    // Find most recent in-progress lesson across all classes
    const findContinueLesson = async (classList: ClassDto[]) => {
        // Mock lesson generator (should match ClassModulesPage)
        const generateMockLessons = (moduleId: number, count: number) => {
            return Array.from({ length: count }).map((_, i) => ({
                id: `M${moduleId}-L${i + 1}`,
                title: `Bài học ${i + 1}`,
            }));
        };

        for (const cls of classList) {
            if (!cls.programId) continue;

            try {
                const modulesRes = await getModulesByProgram({ programId: cls.programId });

                for (const module of modulesRes.data) {
                    const lessonCount = module.credits ? Math.min(10, module.credits * 2) : 6;
                    const lessons = generateMockLessons(module.moduleId, lessonCount);

                    for (const lesson of lessons) {
                        const status = getLessonStatus(cls.classId.toString(), module.moduleId.toString(), lesson.id);
                        if (status === 'in-progress') {
                            setContinueLesson({
                                classId: cls.classId,
                                className: cls.name,
                                moduleId: module.moduleId,
                                moduleName: module.name,
                                lessonId: lesson.id,
                                lessonTitle: lesson.title,
                            });
                            return; // Found! Stop searching
                        }
                    }
                }
            } catch (e) {
                // Skip this class if error
                continue;
            }
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
                status:
                    index === 0 ? ('Đang học' as const) : index < 2 ? ('Hoàn thành' as const) : ('Chưa học' as const),
            }));

            setModules(modulesData);
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

    // Helper to check if class has any progress
    const hasClassProgress = (classId: number): boolean => {
        const classKey = classId.toString();

        // Check if there's any progress for this class
        for (const key in progress) {
            if (key.startsWith(`${classKey}:`)) {
                return true;
            }
        }
        return false;
    };

    // Helper to convert class status
    const getClassStatus = (classDto: ClassDto): ClassStatus => {
        // First check if user has started learning (has progress)
        if (hasClassProgress(classDto.classId)) {
            return 'Đang học';
        }

        // Otherwise use API status
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

    const handleEnterClassroom = async (cls: ClassDto) => {
        // Click vào thẻ class → Vào trang module Khan Academy style
        // Truyền class data qua state để tránh fetch lại
        navigate(`/my-classes/${cls.classId}/modules`, {
            state: { classData: cls },
        });
    };

    const handleViewClassDetail = async (cls: ClassDto) => {
        // Click nút Eye → Xem chi tiết inline với module overview
        setSelectedClass(cls);
        if (cls.programId) {
            await loadModules(cls.programId);
        }
        setView('detail');
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
            <div className="space-y-6 max-w-[1200px] mx-auto">
                {/* Hero Banner with Wave Background */}
                <div className="relative rounded-2xl overflow-hidden shadow-xl h-48">
                    {/* Wave Background Image */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `linear-gradient(135deg, #60a5fa 0%, #93c5fd 25%, #bfdbfe 50%, #dbeafe 75%, #eff6ff 100%)`,
                        }}
                    >
                        {/* Wave Pattern Overlay */}
                        <svg
                            className="absolute inset-0 w-full h-full opacity-30"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 1440 320"
                            preserveAspectRatio="none"
                        >
                            <path
                                fill="rgba(255,255,255,0.1)"
                                d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,112C672,96,768,96,864,112C960,128,1056,160,1152,160C1248,160,1344,128,1392,112L1440,96L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            ></path>
                            <path
                                fill="rgba(255,255,255,0.05)"
                                d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
                            ></path>
                        </svg>
                    </div>

                    {/* Content */}
                    <div className="relative h-full flex items-center px-8">
                        <div className="flex items-center justify-between w-full">
                            <div>
                                <h1 className="text-4xl font-bold text-blue-900 mb-2 tracking-tight drop-shadow-sm">
                                    Lớp học của tôi
                                </h1>
                                <p className="text-blue-700 text-lg drop-shadow-sm">
                                    Quản lý và theo dõi tiến độ học tập của bạn
                                </p>
                            </div>
                            <div className="hidden md:block">
                                <BookOpen className="w-20 h-20 text-blue-300/60 drop-shadow-md" strokeWidth={1.5} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Continue Learning Card - Hidden */}

                {/* Section Title - removed per request */}

                {/* Class List View */}
                <div className="space-y-3">
                    {filteredClasses.length === 0 ? (
                        <div className="text-center py-12 text-gray-500">
                            <p>Không tìm thấy lớp học nào.</p>
                        </div>
                    ) : (
                        filteredClasses.map((cls) => {
                            const classStatus = getClassStatus(cls);
                            return (
                                <div
                                    key={cls.classId}
                                    className="bg-white border border-blue-100 rounded-xl overflow-hidden hover:shadow-lg transition-all hover:scale-[1.01]"
                                >
                                    {/* Class Header */}
                                    <div className="flex items-center gap-4 p-5 bg-gradient-to-r from-blue-50/50 to-cyan-50/30 border-b border-blue-100">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-md">
                                            <BookOpen className="w-7 h-7 text-white" />
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-base font-semibold text-gray-900 truncate">
                                                {cls.name}
                                            </h3>
                                            <p className="text-sm text-gray-500">3 CHƯƠNG • 40 BÀI HỌC</p>
                                        </div>

                                        {/* View All Link (per class) */}
                                        <button
                                            onClick={() => navigate(`/all-courses/${cls.classId}`)}
                                            className="flex-shrink-0 text-sm text-blue-600 hover:text-blue-700 font-medium mr-2"
                                        >
                                            Xem tất cả (3)
                                        </button>

                                        {/* Action Button */}
                                        <button
                                            onClick={() => handleEnterClassroom(cls)}
                                            className={`flex-shrink-0 px-5 py-2 rounded-lg text-sm font-medium transition border ${
                                                classStatus === 'Đang học'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                                            }`}
                                        >
                                            {classStatus === 'Đang học' ? 'Tiếp tục' : 'Bắt đầu'}
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        );
    }

    // Render Class Detail (inline module overview + actions)
    if (view === 'detail' && selectedClass) {
        // Determine "tiếp tục" module (first Đang học or first Chưa học)
        const continueModule =
            modules.find((m) => m.status === 'Đang học') || modules.find((m) => m.status !== 'Hoàn thành');
        return (
            <div className="space-y-6">
                <button
                    onClick={handleBackToList}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <ArrowLeft size={16} />
                    <span>Quay lại danh sách lớp</span>
                </button>

                <div className="bg-white rounded-xl border border-gray-200 p-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">{selectedClass.name}</h1>
                            <p className="text-sm text-gray-500">Mã lớp: #{selectedClass.classId}</p>
                        </div>
                        <span
                            className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                                getClassStatus(selectedClass) === 'Đang học'
                                    ? 'bg-blue-100 text-blue-700'
                                    : getClassStatus(selectedClass) === 'Hoàn thành'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                            }`}
                        >
                            {getClassStatus(selectedClass)}
                        </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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
                    {/* Actions */}
                    <div className="flex flex-wrap gap-3">
                        {continueModule && (
                            <button
                                onClick={() =>
                                    navigate(`/my-classes/${selectedClass.classId}/modules/${continueModule.moduleId}`)
                                }
                                className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm flex items-center gap-2"
                            >
                                <ArrowRight size={16} />
                                Tiếp tục
                            </button>
                        )}
                        <button
                            onClick={() => navigate(`/my-classes/${selectedClass.classId}/modules`)}
                            className="px-4 py-2 rounded-md border text-sm flex items-center gap-2 hover:bg-gray-50"
                        >
                            <BookOpen size={16} />
                            Xem tất cả module
                        </button>
                        {/* TODO: Tạo trang riêng cho sắp xếp module với drag-drop */}
                        <button
                            onClick={() => toast.info('Chức năng sắp xếp module đang được phát triển')}
                            className="px-4 py-2 rounded-md border text-sm flex items-center gap-2 hover:bg-gray-50"
                            title="Chức năng này sẽ cho phép bạn sắp xếp lại thứ tự các module không bắt buộc"
                        >
                            <ArrowUpDown size={16} />
                            Sắp xếp module
                        </button>
                    </div>
                </div>

                {/* Inline module overview (limit 6) */}
                <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Tổng quan module</h2>
                    {modules.length === 0 ? (
                        <div className="text-sm text-gray-500 py-8 text-center">Chưa có module nào.</div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {modules.slice(0, 6).map((m) => {
                                const completed = m.status === 'Hoàn thành';
                                return (
                                    <div
                                        key={m.moduleId}
                                        className="group border rounded-lg bg-white p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-medium text-sm line-clamp-2 pr-2">{m.name}</h3>
                                            {completed ? (
                                                <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                                            ) : (
                                                <div className="w-4 h-4 rounded-full bg-gray-200 flex-shrink-0" />
                                            )}
                                        </div>
                                        <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                                            {m.description || 'Không có mô tả'}
                                        </p>
                                        <div className="flex items-center gap-2 mb-3 text-[11px] text-gray-500">
                                            <span>Mã: {m.code}</span>
                                            <span>• {m.credits} tín chỉ</span>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span
                                                className={`text-[11px] px-2 py-0.5 rounded-full ${
                                                    m.status === 'Hoàn thành'
                                                        ? 'bg-green-100 text-green-700'
                                                        : m.status === 'Đang học'
                                                          ? 'bg-blue-100 text-blue-700'
                                                          : 'bg-gray-100 text-gray-700'
                                                }`}
                                            >
                                                {m.status || 'Chưa học'}
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return null;
}
