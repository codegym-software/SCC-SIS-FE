import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { getModulesByProgram, type ModuleResponse } from '@/shared/api/modules';
import { useProgressStore } from '../../hooks/useProgressStore';

interface LessonItem {
    id: string;
    title: string;
    duration?: string;
    type?: 'video' | 'article' | 'quiz';
}

// Mock lesson generator
const generateMockLessons = (moduleId: number, count: number): LessonItem[] => {
    return Array.from({ length: count }).map((_, i) => ({
        id: `M${moduleId}-L${i + 1}`,
        title: `Bài học ${i + 1}`,
        duration: `${8 + (i % 5)}m`,
        type: (i % 3 === 0 ? 'video' : i % 3 === 1 ? 'article' : 'quiz') as 'video' | 'article' | 'quiz',
    }));
};

export default function ModuleLessonsListPage() {
    const { classId, moduleId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { getLessonStatus } = useProgressStore();

    const [loading, setLoading] = useState(false);
    const [module, setModule] = useState<ModuleResponse | null>(null);
    const [lessons, setLessons] = useState<LessonItem[]>([]);

    useEffect(() => {
        const loadModule = async () => {
            if (!classId || !moduleId) return;

            try {
                setLoading(true);
                // This would normally fetch single module, but we'll search through all
                // In real implementation, there should be a getModuleById endpoint
                const urlParams = new URLSearchParams(window.location.search);
                const programId = urlParams.get('programId');

                if (programId) {
                    const response = await getModulesByProgram({ programId: parseInt(programId) });
                    const foundModule = response.data.find((m: ModuleResponse) => m.moduleId.toString() === moduleId);

                    if (foundModule) {
                        setModule(foundModule);
                        const lessonCount = foundModule.credits ? Math.min(10, foundModule.credits * 2) : 6;
                        setLessons(generateMockLessons(foundModule.moduleId, lessonCount));
                    } else {
                        toast.error('Không tìm thấy module');
                    }
                }
            } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };

        loadModule();
    }, [classId, moduleId]);

    const handleLessonClick = (lessonId: string) => {
        navigate(`/my-classes/${classId}/modules/${moduleId}/lessons/${lessonId}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-sm text-gray-600">Đang tải...</div>
            </div>
        );
    }

    if (!module) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-sm text-gray-600">Không tìm thấy module</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-6 space-y-6">
                {/* Header */}
                <button
                    onClick={() => navigate(`/my-classes/${classId}/modules`)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition font-medium"
                >
                    <ArrowLeft size={18} /> Quay lại
                </button>

                {/* Module info card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{module.name}</h1>
                    <p className="text-sm text-gray-600 mb-4">{module.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>📘 {module.code}</span>
                        <span>⏱️ {module.credits} tín chỉ</span>
                        <span>📚 {lessons.length} bài học</span>
                    </div>
                </div>

                {/* Lessons list */}
                <div className="space-y-3">
                    {lessons.map((lesson, idx) => {
                        const status = classId ? getLessonStatus(classId, moduleId!, lesson.id) : 'not-started';
                        const isCompleted = status === 'completed';
                        const isInProgress = status === 'in-progress';

                        return (
                            <div
                                key={lesson.id}
                                onClick={() => handleLessonClick(lesson.id)}
                                className="bg-white rounded-lg border-2 border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer p-4 group"
                            >
                                <div className="flex items-center gap-4">
                                    {/* Number/Status icon */}
                                    <div className="flex-shrink-0">
                                        {isCompleted ? (
                                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                                <CheckCircle size={20} className="text-green-600" />
                                            </div>
                                        ) : isInProgress ? (
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                                                <PlayCircle size={20} className="text-blue-600" />
                                            </div>
                                        ) : (
                                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 font-semibold text-sm">
                                                {idx + 1}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lesson info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition mb-1">
                                            {lesson.title}
                                        </h3>
                                        <div className="flex items-center gap-3 text-xs text-gray-500">
                                            {lesson.type === 'video' && <span>🎥 Video</span>}
                                            {lesson.type === 'article' && <span>📄 Bài viết</span>}
                                            {lesson.type === 'quiz' && <span>✏️ Bài tập</span>}
                                            {lesson.duration && <span>⏱️ {lesson.duration}</span>}
                                        </div>
                                    </div>

                                    {/* Status badge */}
                                    {isCompleted && (
                                        <div className="flex-shrink-0 text-xs font-medium text-green-600">
                                            Đã hoàn thành
                                        </div>
                                    )}
                                    {isInProgress && (
                                        <div className="flex-shrink-0 text-xs font-medium text-blue-600">Đang học</div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
