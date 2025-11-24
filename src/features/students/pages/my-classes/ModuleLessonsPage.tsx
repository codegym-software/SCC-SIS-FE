import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, ArrowRight, BookOpen } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { getModulesByProgram, type ModuleResponse } from '@/shared/api/modules';
import { getMyClasses, type ClassDto } from '@/shared/api/classes';
import { useUserProfile } from '@/stores/userProfile';

interface ModuleWithStatus extends ModuleResponse {
    status?: 'Hoàn thành' | 'Đang học' | 'Chưa học';
}

interface LessonItem {
    id: string;
    title: string;
    duration?: string; // e.g. "10m"
    completed: boolean;
}

// Mock lesson generator (since backend for lessons not yet defined)
const generateMockLessons = (count: number): LessonItem[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `L${i + 1}`,
        title: `Bài học ${i + 1}`,
        duration: `${8 + i}m`,
        // Simple pattern: first two completed, rest incomplete except mark some pattern
        completed: i < 2,
    }));
};

export default function ModuleLessonsPage() {
    const { classId, moduleId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { me } = useUserProfile();

    const [cls, setCls] = useState<ClassDto | null>(null);
    const [module, setModule] = useState<ModuleWithStatus | null>(null);
    const [lessons, setLessons] = useState<LessonItem[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const classesRes = await getMyClasses();
                const foundClass = classesRes.data.find((c: ClassDto) => c.classId.toString() === classId);
                setCls(foundClass || null);
                if (!foundClass) return;
                if (foundClass.programId) {
                    const modulesRes = await getModulesByProgram({ programId: foundClass.programId });
                    const modulesData: ModuleWithStatus[] = modulesRes.data.map((m: ModuleResponse, index: number) => ({
                        ...m,
                        status: index === 0 ? 'Đang học' : index < 2 ? 'Hoàn thành' : 'Chưa học',
                    }));
                    const foundModule = modulesData.find((m) => m.moduleId.toString() === moduleId);
                    setModule(foundModule || null);
                    if (foundModule) {
                        // For demo: number of lessons derived from credits or fallback
                        const lessonCount = foundModule.credits ? Math.min(8, foundModule.credits * 2) : 6;
                        setLessons(generateMockLessons(lessonCount));
                    }
                }
            } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        if (me?.userId) run();
    }, [me?.userId, classId, moduleId]);

    const nextIncomplete = lessons.find((l) => !l.completed);
    const completedCount = lessons.filter((l) => l.completed).length;

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px] text-sm text-gray-600">Đang tải...</div>;
    }

    if (!cls || !module) {
        return (
            <div className="space-y-4">
                <button
                    onClick={() => navigate(`/my-classes/${classId}/modules`)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                >
                    <ArrowLeft size={16} /> Quay lại
                </button>
                <div className="text-sm text-gray-500">Không tìm thấy dữ liệu.</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate(`/my-classes/${classId}/modules`)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft size={16} /> Quay lại danh sách module
            </button>

            <div className="bg-white rounded-xl border p-6 space-y-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{module.name}</h1>
                        <p className="text-sm text-gray-500">
                            Module #{module.moduleId} • Lớp #{cls.classId}
                        </p>
                    </div>
                    {module.status === 'Hoàn thành' ? (
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-green-100 text-green-700">
                            Hoàn thành
                        </span>
                    ) : module.status === 'Đang học' ? (
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                            Đang học
                        </span>
                    ) : (
                        <span className="px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                            Chưa học
                        </span>
                    )}
                </div>
                <p className="text-sm text-gray-600">{module.description || 'Không có mô tả'}</p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                    <span>Mã: {module.code}</span>
                    <span>Tín chỉ: {module.credits}</span>
                    {module.level && <span>Cấp độ: {module.level}</span>}
                </div>
                <div className="text-xs text-gray-600">
                    Tiến độ:{' '}
                    <span className="font-medium text-gray-900">
                        {completedCount}/{lessons.length}
                    </span>{' '}
                    bài học hoàn thành
                </div>
                {nextIncomplete && (
                    <button
                        onClick={() => {
                            /* Placeholder for actual lesson navigation */
                        }}
                        className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm flex items-center gap-2"
                    >
                        <ArrowRight size={16} /> Tiếp tục: {nextIncomplete.title}
                    </button>
                )}
            </div>

            {/* Lessons */}
            <div className="space-y-4">
                <h2 className="text-lg font-semibold">Danh sách bài học</h2>
                <div className="space-y-2">
                    {lessons.map((l) => {
                        const done = l.completed;
                        return (
                            <div
                                key={l.id}
                                className="flex items-center justify-between bg-white border rounded-md p-3 text-sm"
                            >
                                <div className="flex items-center gap-3">
                                    {done ? (
                                        <CheckCircle className="text-green-600" size={20} />
                                    ) : (
                                        <div className="w-5 h-5 rounded-full bg-gray-200" />
                                    )}
                                    <div>
                                        <div className="font-medium">{l.title}</div>
                                        <div className="text-xs text-gray-500">Thời lượng ~ {l.duration}</div>
                                    </div>
                                </div>
                                <button
                                    className={`px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1 ${done ? 'bg-green-50 text-green-700' : 'bg-gray-900 text-white'}`}
                                >
                                    {done ? (
                                        'Đã học'
                                    ) : (
                                        <>
                                            <BookOpen size={14} /> Học ngay
                                        </>
                                    )}
                                </button>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
