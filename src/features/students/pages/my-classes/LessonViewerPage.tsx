import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, PlayCircle } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { useProgressStore } from '../../hooks/useProgressStore';
import { getLessonById, updateLessonProgress } from '@/shared/api/lessons';
import type { Lesson } from '@/shared/types/lesson';

export default function LessonViewerPage() {
    const { classId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const progressStore = useProgressStore();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');

    useEffect(() => {
        const loadLesson = async () => {
            if (!classId || !moduleId || !lessonId) return;

            try {
                setLoading(true);
                
                // Load lesson from backend
                const response = await getLessonById(parseInt(lessonId));
                setLesson(response.data);

                // Get current status from local store
                const status = progressStore.getLessonStatus(classId, moduleId, lessonId);
                setCurrentStatus(status);

                // If not started, mark as in-progress and save to backend
                if (status === 'not-started') {
                    console.log('📚 Học viên bắt đầu xem bài học lần đầu, tạo progress...');
                    try {
                        // Call API to create progress record in backend
                        await updateLessonProgress(parseInt(lessonId), {
                            progressPercentage: 0, // Chưa hoàn thành
                            lastWatchedPosition: 0,
                            timeSpentSeconds: 0,
                        });
                        console.log('✅ Progress record created in backend');
                    } catch (error: any) {
                        console.error('⚠️ Failed to create initial progress:', error);
                        // Continue anyway, will try again on complete
                    }
                    
                    // Update local state
                    progressStore.setLessonStatus(classId, moduleId, lessonId, 'in-progress');
                    setCurrentStatus('in-progress');
                }
            } catch (error: any) {
                console.error('Failed to load lesson:', error);
                toast.error(error?.response?.data?.message || 'Không thể tải bài học');
            } finally {
                setLoading(false);
            }
        };

        loadLesson();
    }, [classId, moduleId, lessonId]);

    const handleComplete = async () => {
        if (!classId || !moduleId || !lessonId) return;

        console.log('🎯 Completing lesson:', { classId, moduleId, lessonId });
        console.log('📤 Calling API: POST /api/lessons/' + lessonId + '/progress with progressPercentage: 100');

        try {
            // Call API to save progress to backend
            const response = await updateLessonProgress(parseInt(lessonId), {
                progressPercentage: 100,
                lastWatchedPosition: 0,
                timeSpentSeconds: 0,
            });
            console.log('✅ Progress saved to backend successfully!', response.data);

            // Update progress store (local state)
            progressStore.setLessonStatus(classId, moduleId, lessonId, 'completed');

            // Update local state immediately
            setCurrentStatus('completed');

            console.log('✅ Lesson marked as completed');
            toast.success('Đã hoàn thành bài học!');

            // Delay navigation to show completed state
            setTimeout(() => {
                console.log('🔙 Navigating back to modules page...');
                navigate(`/my-classes/${classId}/modules`);
            }, 1500);
        } catch (error: any) {
            console.error('❌ Failed to update lesson progress:', error);
            console.error('❌ Error details:', {
                status: error?.response?.status,
                statusText: error?.response?.statusText,
                data: error?.response?.data,
                message: error?.message
            });
            toast.error('Không thể cập nhật tiến độ: ' + (error?.response?.data?.message || error?.message || 'Lỗi không xác định'));
        }
    };

    // Function to convert Vimeo URL to embed URL
    const getVimeoEmbedUrl = (url: string): string => {
        // Extract video ID from various Vimeo URL formats
        const patterns = [
            /vimeo\.com\/(\d+)/,           // https://vimeo.com/123456789
            /player\.vimeo\.com\/video\/(\d+)/, // https://player.vimeo.com/video/123456789
        ];
        
        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                return `https://player.vimeo.com/video/${match[1]}`;
            }
        }
        
        // If already embed URL, return as is
        if (url.includes('player.vimeo.com')) {
            return url;
        }
        
        return url;
    };

    if (loading || !lesson) {
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
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">{lesson.lessonTitle}</h1>
                        {lesson.description && (
                            <p className="text-gray-600">{lesson.description}</p>
                        )}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>📘 {lesson.lessonType}</span>
                            {lesson.durationMinutes && (
                                <span>⏱️ {lesson.durationMinutes} phút</span>
                            )}
                            {lesson.contentType && (
                                <span>📺 {lesson.contentType}</span>
                            )}
                        </div>
                    </div>

                    {/* Video player - Vimeo */}
                    {lesson.contentUrl && lesson.lessonType === 'VIDEO' && (
                        <div
                            className="bg-black rounded-xl overflow-hidden shadow-2xl mb-8"
                            style={{ aspectRatio: '16/9' }}
                        >
                            <iframe
                                src={getVimeoEmbedUrl(lesson.contentUrl)}
                                title={lesson.lessonTitle}
                                className="w-full h-full"
                                allow="autoplay; fullscreen; picture-in-picture"
                                allowFullScreen
                            />
                        </div>
                    )}

                    {/* Document viewer for other content types */}
                    {lesson.contentUrl && lesson.lessonType === 'DOCUMENT' && (
                        <div className="bg-white rounded-xl p-8 shadow-sm mb-8">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Tài liệu học tập</h2>
                            <a 
                                href={lesson.contentUrl} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                            >
                                Xem tài liệu →
                            </a>
                        </div>
                    )}

                    {/* Lesson content */}
                    {lesson.description && (
                        <div className="bg-white rounded-xl p-8 shadow-sm">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Nội dung bài học</h2>
                            <div className="prose max-w-none text-gray-700">
                                <p className="whitespace-pre-wrap">{lesson.description}</p>
                            </div>
                        </div>
                    )}

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
