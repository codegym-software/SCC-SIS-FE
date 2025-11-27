import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, PlayCircle, CheckCircle, FileText, Video, ClipboardList, PenTool } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { getModulesByProgram, type ModuleResponse } from '@/shared/api/modules';
import { getLessonsByModule } from '@/shared/api/lessons';
import type { Lesson } from '@/shared/types/lesson';
import { useProgressStore } from '../../hooks/useProgressStore';

export default function ModuleLessonsListPage() {
    const { classId, moduleId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const { getLessonStatus } = useProgressStore();

    const [loading, setLoading] = useState(false);
    const [module, setModule] = useState<ModuleResponse | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);

    useEffect(() => {
        const loadData = async () => {
            if (!classId || !moduleId) return;

            try {
                setLoading(true);
                
                // Load module info
                const urlParams = new URLSearchParams(window.location.search);
                const programId = urlParams.get('programId');

                if (programId) {
                    const moduleResponse = await getModulesByProgram({ programId: parseInt(programId) });
                    const foundModule = moduleResponse.data.find((m: ModuleResponse) => m.moduleId.toString() === moduleId);

                    if (foundModule) {
                        setModule(foundModule);
                        
                        // Load lessons from backend
                        try {
                            const lessonsResponse = await getLessonsByModule(parseInt(moduleId));
                            setLessons(lessonsResponse.data || []);
                        } catch (lessonError) {
                            console.error('Failed to load lessons:', lessonError);
                            toast.error('Không thể tải danh sách bài học');
                            setLessons([]);
                        }
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

        loadData();
    }, [classId, moduleId]);

    const handleLessonClick = (lesson: Lesson) => {
        // Nếu là QUIZ, chuyển đến trang quiz
        if (lesson.lessonType === 'QUIZ') {
            navigate(`/my-classes/${classId}/modules/${moduleId}/lessons/${lesson.lessonId}/quiz`);
        } else {
            // Các loại khác (VIDEO, DOCUMENT, etc.) vào lesson viewer
            navigate(`/my-classes/${classId}/modules/${moduleId}/lessons/${lesson.lessonId}`);
        }
    };
    
    const getLessonTypeIcon = (type: string) => {
        switch (type) {
            case 'VIDEO': return <Video size={16} className="text-blue-600" />;
            case 'DOCUMENT': return <FileText size={16} className="text-green-600" />;
            case 'QUIZ': return <ClipboardList size={16} className="text-purple-600" />;
            case 'ASSIGNMENT': return <PenTool size={16} className="text-orange-600" />;
            default: return <FileText size={16} className="text-gray-600" />;
        }
    };
    
    const formatDuration = (minutes?: number): string => {
        if (!minutes) return '';
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
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
                    {lessons.length === 0 ? (
                        <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                            <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                            <p className="text-sm text-gray-600">Module này chưa có bài học nào</p>
                        </div>
                    ) : (
                        lessons.map((lesson, idx) => {
                            const lessonIdStr = lesson.lessonId.toString();
                            const status = classId ? getLessonStatus(classId, moduleId!, lessonIdStr) : 'not-started';
                            const isCompleted = status === 'completed';
                            const isInProgress = status === 'in-progress';

                            return (
                                <div
                                    key={lesson.lessonId}
                                    onClick={() => handleLessonClick(lesson)}
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
                                                    {lesson.lessonOrder}
                                                </div>
                                            )}
                                        </div>

                                        {/* Lesson info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition">
                                                    {lesson.lessonTitle}
                                                </h3>
                                                {lesson.isMandatory && (
                                                    <span className="text-xs px-2 py-0.5 bg-red-100 text-red-700 rounded-full font-medium">
                                                        Bắt buộc
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-xs text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    {getLessonTypeIcon(lesson.lessonType)}
                                                    {lesson.lessonType}
                                                </span>
                                                {lesson.durationMinutes && (
                                                    <span>⏱️ {formatDuration(lesson.durationMinutes)}</span>
                                                )}
                                                {lesson.contentType && (
                                                    <span>📺 {lesson.contentType}</span>
                                                )}
                                            </div>
                                            {lesson.description && (
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                                                    {lesson.description}
                                                </p>
                                            )}
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
                        })
                    )}
                </div>
            </div>
        </div>
    );
}
