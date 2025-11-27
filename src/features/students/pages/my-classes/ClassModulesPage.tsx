import { useEffect, useState, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Users, CheckCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { getMyClasses, type ClassDto } from '@/shared/api/classes';
import { getModulesByProgram, type ModuleResponse } from '@/shared/api/modules';
import { useUserProfile } from '@/stores/userProfile';
import { useProgressStore } from '../../hooks/useProgressStore';

// Augment module with status used elsewhere
interface ModuleWithStatus extends ModuleResponse {
    status?: 'Hoàn thành' | 'Đang học' | 'Chưa học';
}

interface LessonItem {
    id: string;
    title: string;
    duration?: string;
    type?: 'video' | 'article' | 'quiz';
}

// Mock lesson generator (replace with real API later)
const generateMockLessons = (moduleId: number, count: number): LessonItem[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `M${moduleId}-L${i + 1}`,
        title: `Bài học ${i + 1}`,
        duration: `${8 + (i % 5)}m`,
        type: i % 3 === 0 ? 'video' : i % 3 === 1 ? 'article' : 'quiz',
    }));
};

const getStudyTimeRange = (studyTime?: string): string => {
    const timeMap: Record<string, string> = {
        MORNING: '08:00 - 11:00',
        AFTERNOON: '14:00 - 17:00',
        EVENING: '18:00 - 21:00',
    };
    return studyTime ? timeMap[studyTime] || studyTime : '';
};

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

export default function ClassModulesPage() {
    const { classId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const toast = useToast();
    const { me } = useUserProfile();
    const { getLessonStatus, getModuleProgress } = useProgressStore();

    const [loading, setLoading] = useState(false);
    const [cls, setCls] = useState<ClassDto | null>(null);
    const [modules, setModules] = useState<ModuleWithStatus[]>([]);
    const [moduleLessons, setModuleLessons] = useState<Record<number, LessonItem[]>>({});

    // Ref to track if we already fetched to prevent re-fetch on re-render
    const hasFetchedRef = useRef(false);

    // Reset fetch flag when classId changes
    useEffect(() => {
        hasFetchedRef.current = false;
    }, [classId]);

    useEffect(() => {
        // Prevent multiple fetches
        if (hasFetchedRef.current) return;

        const run = async () => {
            try {
                setLoading(true);

                // Try to get class data from navigation state first (faster)
                const passedClass = location.state?.classData as ClassDto | undefined;
                let found: ClassDto | undefined = passedClass;

                // If no state passed, fetch from API
                if (!found) {
                    const classesRes = await getMyClasses();
                    found = classesRes.data.find((c: ClassDto) => c.classId.toString() === classId);
                }

                if (!found) {
                    toast.error('Không tìm thấy lớp học');
                    return;
                }
                setCls(found);
                if (found.programId) {
                    const mRes = await getModulesByProgram({ programId: found.programId });
                    const modulesData: ModuleWithStatus[] = mRes.data.map((m: ModuleResponse) => ({
                        ...m,
                        status: 'Chưa học', // Will update based on progress
                    }));
                    setModules(modulesData);
                    // Generate mock lessons for each module
                    const lessonsMap: Record<number, LessonItem[]> = {};
                    modulesData.forEach((m) => {
                        const lessonCount = m.credits ? Math.min(10, m.credits * 2) : 6;
                        lessonsMap[m.moduleId] = generateMockLessons(m.moduleId, lessonCount);
                    });
                    setModuleLessons(lessonsMap);
                }

                // Mark as fetched
                hasFetchedRef.current = true;
            } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        if (me?.userId && !hasFetchedRef.current) {
            // Mark as fetched BEFORE running to avoid repeated retries on error
            hasFetchedRef.current = true;
            run();
        }
    }, [me?.userId, classId]);

    const getClassStatus = (status?: string) => {
        switch (status) {
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

    const handleLessonClick = (moduleId: number, lessonId: string) => {
        navigate(`/my-classes/${classId}/modules/${moduleId}/lessons/${lessonId}`);
    };

    // Memoize module progress to prevent recalculation on every render
    const moduleProgressMap = useMemo(() => {
        const map: Record<number, { total: number; completed: number; percentage: number }> = {};
        modules.forEach((module) => {
            const lessons = moduleLessons[module.moduleId] || [];
            const progress = classId
                ? getModuleProgress(
                      classId,
                      module.moduleId.toString(),
                      lessons.map((l) => l.id),
                  )
                : { total: 0, completed: 0, percentage: 0 };
            map[module.moduleId] = progress;
        });
        return map;
    }, [modules, moduleLessons, classId, getModuleProgress]);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-6">
                <div className="max-w-6xl mx-auto">
                    {/* Header skeleton */}
                    <div className="h-8 bg-gray-200 rounded w-32 mb-6 animate-pulse"></div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg p-8 mb-6">
                        <div className="h-8 bg-gray-200 rounded w-2/3 mb-4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                    </div>
                    {/* Modules skeleton */}
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white rounded-xl mb-4 p-4 animate-pulse">
                            <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!cls) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate('/my-classes')}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>
                <div className="text-sm text-gray-500">Không tìm thấy lớp học.</div>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto space-y-6 p-6">
            <button
                onClick={() => navigate('/my-classes')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition"
            >
                <ArrowLeft size={16} /> Quay lại danh sách lớp
            </button>

            {/* Class header */}
            <div className="bg-gradient-to-r from-blue-600 to-cyan-500 rounded-xl p-8 text-white shadow-lg">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">{cls.name}</h1>
                        <p className="text-blue-100 text-sm">Mã lớp: #{cls.classId}</p>
                    </div>
                    <span className="px-4 py-2 rounded-full text-sm font-medium bg-white/20 backdrop-blur-sm">
                        {getClassStatus(cls.status)}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center gap-3">
                        <BookOpen size={20} className="text-blue-200" />
                        <div>
                            <p className="text-blue-100 text-xs">Chương trình</p>
                            <p className="font-medium">{cls.programName}</p>
                        </div>
                    </div>
                    {(cls.studyDays || cls.studyTime) && (
                        <div className="flex items-center gap-3">
                            <Calendar size={20} className="text-blue-200" />
                            <div>
                                <p className="text-blue-100 text-xs">Lịch học</p>
                                <p className="font-medium">
                                    {cls.studyDays?.map(getStudyDayLabel).join(', ')} •{' '}
                                    {getStudyTimeRange(cls.studyTime)}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modules list */}
            <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Nội dung khóa học</h2>
                <div className="space-y-3">
                    {modules.map((module, idx) => {
                        const lessons = moduleLessons[module.moduleId] || [];
                        const progress = moduleProgressMap[module.moduleId] || {
                            total: 0,
                            completed: 0,
                            percentage: 0,
                        };

                        return (
                            <div
                                key={module.moduleId}
                                className="bg-white border-2 border-gray-200 rounded-xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                                onClick={() =>
                                    navigate(
                                        `/my-classes/${classId}/modules/${module.moduleId}?programId=${cls?.programId}`,
                                    )
                                }
                            >
                                <div className="px-6 py-4">
                                    <div className="flex items-start gap-4">
                                        <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center text-white font-bold shadow-md">
                                            {idx + 1}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-1">
                                                <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition">
                                                    {module.name}
                                                </h3>
                                                {progress.percentage === 100 && (
                                                    <CheckCircle size={18} className="text-green-600 flex-shrink-0" />
                                                )}
                                            </div>
                                            <p className="text-xs text-gray-500 mb-2">
                                                {module.code} • {module.credits} tín chỉ
                                            </p>
                                            <div className="flex items-center gap-4 text-xs text-gray-600">
                                                <span>{lessons.length} bài học</span>
                                                <span className="font-medium text-blue-600">
                                                    {progress.completed}/{progress.total} hoàn thành
                                                </span>
                                            </div>
                                            {/* Progress bar */}
                                            <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5 overflow-hidden">
                                                <div
                                                    className="bg-gradient-to-r from-blue-500 to-cyan-400 h-full transition-all duration-500"
                                                    style={{ width: `${progress.percentage}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
