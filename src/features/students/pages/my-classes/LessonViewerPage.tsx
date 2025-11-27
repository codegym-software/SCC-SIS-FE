import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { useProgressStore } from '../../hooks/useProgressStore';

// Mock lesson data
interface LessonContent {
    id: string;
    title: string;
    description: string;
    videoUrl?: string;
    duration?: string;
}

// Mock generator
const generateLessonContent = (lessonId: string, moduleId: string): LessonContent => {
    return {
        id: lessonId,
        title: `Bài học ${lessonId}`,
        description: `Nội dung chi tiết của bài học ${lessonId} thuộc module ${moduleId}. Đây là nội dung mẫu để minh họa giao diện học tập.`,
        videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', // Demo video
        duration: '10:30',
    };
};

export default function LessonViewerPage() {
    const { classId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const progressStore = useProgressStore();

    const [lesson, setLesson] = useState<LessonContent | null>(null);
    const [currentStatus, setCurrentStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

    useEffect(() => {
        if (!classId || !moduleId || !lessonId) return;

        // Load lesson (mock)
        const lessonData = generateLessonContent(lessonId, moduleId);
        setLesson(lessonData);

        // Get current status
        const status = progressStore.getLessonStatus(classId, moduleId, lessonId);
        console.log('🔍 Lesson status loaded:', { classId, moduleId, lessonId, status });
        setCurrentStatus(status);

        // If not started, mark as in-progress
        if (status === 'not-started') {
            progressStore.setLessonStatus(classId, moduleId, lessonId, 'in-progress');
            setCurrentStatus('in-progress');
            console.log('✅ Marked as in-progress');
        }
    }, [classId, moduleId, lessonId]); // Remove progressStore from deps

    const handleComplete = () => {
        if (!classId || !moduleId || !lessonId) return;

        console.log('🎯 Completing lesson:', { classId, moduleId, lessonId });

        // Update progress store
        progressStore.setLessonStatus(classId, moduleId, lessonId, 'completed');

        // Update local state immediately
        setCurrentStatus('completed');

        console.log('✅ Lesson marked as completed');
        toast.success('Đã hoàn thành bài học!');

        // Delay navigation to show completed state
        setTimeout(() => {
            navigate(`/my-classes/${classId}/modules`);
        }, 1500);
    };

    if (!lesson) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
                <div className="text-sm text-gray-600">Đang tải bài học...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-gray-50 overflow-y-auto">
            {/* Full screen layout - No sidebar */}
            <div className="min-h-screen">
                {/* Top navigation bar */}
                <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => navigate(`/my-classes/${classId}/modules`)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition font-medium"
                        >
                            <ArrowLeft size={18} /> Quay lại
                        </button>
                        <div className="flex items-center gap-4">
                            {currentStatus === 'completed' ? (
                                <div className="flex items-center gap-2 text-sm text-green-600 font-medium">
                                    <CheckCircle size={18} /> Đã hoàn thành
                                </div>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-md"
                                >
                                    <CheckCircle size={16} />
                                    Hoàn thành bài học
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className="max-w-6xl mx-auto px-6 py-8">
                    {/* Lesson title */}
                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.title}</h1>
                        <p className="text-gray-600">{lesson.description}</p>
                    </div>

                    {/* Video player */}
                    {lesson.videoUrl && (
                        <div
                            className="bg-black rounded-xl overflow-hidden shadow-2xl mb-8"
                            style={{ aspectRatio: '16/9' }}
                        >
                            <iframe
                                src={lesson.videoUrl}
                                title={lesson.title}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Lesson content */}
                    <div className="bg-white rounded-xl p-8 shadow-sm">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Nội dung bài học</h2>
                        <div className="prose max-w-none text-gray-700">
                            <p>{lesson.description}</p>
                            <p className="mt-4">
                                Đây là nội dung chi tiết của bài học. Trong thực tế, phần này sẽ chứa các tài liệu,
                                hướng dẫn, bài tập và các tài nguyên học tập khác.
                            </p>
                        </div>
                    </div>

                    {/* Complete button at bottom */}
                    {currentStatus !== 'completed' && (
                        <div className="mt-8 flex justify-center">
                            <button
                                onClick={handleComplete}
                                className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl text-lg font-medium transition flex items-center gap-3 shadow-lg hover:shadow-xl"
                            >
                                <CheckCircle size={24} />
                                Hoàn thành bài học và tiếp tục
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
