import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    CheckCircle,
    PlayCircle,
    FileText,
    Video,
    ClipboardList,
    PenTool,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { useProgressStore } from '../../hooks/useProgressStore';
import { getLessonById, updateLessonProgress, getLessonsByClass, getLessonsByModule } from '@/shared/api/lessons';
import { getModulesByProgram } from '@/shared/api/modules';
import type { Lesson } from '@/shared/types/lesson';
import type { ModuleResponse } from '@/shared/types/module';

interface LessonsByModule {
    module: ModuleResponse;
    lessons: Lesson[];
}

interface ModulesBySemester {
    [key: string]: LessonsByModule[];
}

export default function LessonViewerPage() {
    const { classId, moduleId, lessonId } = useParams();
    const navigate = useNavigate();
    const toast = useToast();
    const progressStore = useProgressStore();

    const [lesson, setLesson] = useState<Lesson | null>(null);
    const [allLessons, setAllLessons] = useState<Lesson[]>([]);
    const [modulesBySemester, setModulesBySemester] = useState<ModulesBySemester>({});
    const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({});
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState<'not-started' | 'in-progress' | 'completed'>('not-started');
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [videoProgress, setVideoProgress] = useState(0);
    const [lastWatchedPosition, setLastWatchedPosition] = useState(0);

    useEffect(() => {
        const loadLesson = async () => {
            if (!classId || !moduleId || !lessonId) return;

            try {
                setLoading(true);

                // Load all lessons in class grouped by module/semester
                try {
                    const classLessonsResponse = await getLessonsByClass(parseInt(classId));
                    const allClassLessons: Lesson[] = classLessonsResponse.data;
                    setAllLessons(allClassLessons);

                    // Group lessons: class lessons API được trả về theo cấu trúc: [Lesson]
                    // Với frontend cần tự group theo Module + Semester
                    // NOTA BENE: Backend chưa có API trả về modules với lessons theo semester
                    // Tạm thời vẫn load lessons by module như cũ, sẽ refactor sau khi backend có API
                    const lessonsInCurrentModule = allClassLessons.filter(l => l.moduleId === parseInt(moduleId));
                    const sortedLessons = lessonsInCurrentModule.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
                    
                    // Initialize expanded state for current module's semester as true
                    setExpandedSemesters({ '1': true }); // Default expand semester 1
                } catch (error) {
                    // Fallback: nếu API getLessonsByClass không có, dùng getLessonsByModule
                    const lessonsResponse = await getLessonsByModule(parseInt(moduleId));
                    const lessons = lessonsResponse.data.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
                    setAllLessons(lessons);
                    setExpandedSemesters({ '1': true });
                }

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
                message: error?.message,
            });
            toast.error(
                'Không thể cập nhật tiến độ: ' +
                    (error?.response?.data?.message || error?.message || 'Lỗi không xác định'),
            );
        }
    };

    const getLessonTypeIcon = (type: string) => {
        switch (type) {
            case 'VIDEO':
                return <Video size={16} className="text-[#0277BD]" />;
            case 'DOCUMENT':
                return <FileText size={16} className="text-[#2E7D32]" />;
            case 'QUIZ':
                return <ClipboardList size={16} className="text-[#6A1B9A]" />;
            case 'ASSIGNMENT':
                return <PenTool size={16} className="text-[#E65100]" />;
            default:
                return <FileText size={16} className="text-gray-600" />;
        }
    };

    const handleLessonClick = (selectedLessonId: string, lessonType: string) => {
        if (lessonType === 'QUIZ') {
            navigate(`/my-classes/${classId}/modules/${moduleId}/lessons/${selectedLessonId}/quiz`);
        } else {
            navigate(`/my-classes/${classId}/modules/${moduleId}/lessons/${selectedLessonId}`);
        }
    };

    const getLessonStatus = (lessonIdToCheck: string) => {
        if (!classId || !moduleId) return 'not-started';
        return progressStore.getLessonStatus(classId, moduleId, lessonIdToCheck);
    };

    // Function to convert Vimeo URL to embed URL
    const getVimeoEmbedUrl = (url: string): string => {
        // Extract video ID from various Vimeo URL formats
        const patterns = [
            /vimeo\.com\/(\d+)/, // https://vimeo.com/123456789
            /player\.vimeo\.com\/video\/(\d+)/, // https://player.vimeo.com/video/123456789
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                // Add timestamp parameter if there's a saved position
                const baseUrl = `https://player.vimeo.com/video/${match[1]}`;
                if (lastWatchedPosition > 0) {
                    return `${baseUrl}#t=${Math.floor(lastWatchedPosition)}s`;
                }
                return baseUrl;
            }
        }

        // If already embed URL, return as is
        if (url.includes('player.vimeo.com')) {
            return url;
        }

        return url;
    };

    // Track video progress
    const handleVideoMessage = (event: MessageEvent) => {
        try {
            const data = JSON.parse(event.data);

            if (data.event === 'timeupdate') {
                const currentTime = data.data.seconds;
                const duration = data.data.duration;

                if (duration > 0) {
                    const progress = Math.round((currentTime / duration) * 100);
                    setVideoProgress(progress);
                    setLastWatchedPosition(currentTime);

                    // Auto-save progress every 10 seconds
                    if (Math.floor(currentTime) % 10 === 0 && lessonId) {
                        updateLessonProgress(parseInt(lessonId), {
                            progressPercentage: progress,
                            lastWatchedPosition: currentTime,
                            timeSpentSeconds: Math.floor(currentTime),
                        }).catch(console.error);
                    }

                    // Auto-complete if watched > 90%
                    if (progress >= 90 && currentStatus !== 'completed') {
                        handleComplete();
                    }
                }
            }
        } catch (e) {
            // Ignore non-JSON messages
        }
    };

    useEffect(() => {
        window.addEventListener('message', handleVideoMessage);
        return () => window.removeEventListener('message', handleVideoMessage);
    }, [currentStatus, lessonId]);

    if (loading || !lesson) {
        return (
            <div className="fixed inset-0 bg-gray-50 flex items-center justify-center">
                <div className="text-sm text-gray-600">Đang tải bài học...</div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#FAFAFA] overflow-hidden flex">
            {/* Sidebar - Lessons list */}
            <div
                className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col overflow-hidden ${
                    sidebarOpen ? 'w-80' : 'w-0'
                }`}
                style={{ height: '100vh' }}
            >
                {sidebarOpen && (
                    <>
                        {/* Sidebar header */}
                        <div className="px-4 py-4 border-b bg-gradient-to-br from-[#003366] to-[#00556B] flex-shrink-0">
                            <h2 className="font-bold text-white text-lg flex items-center gap-2">
                                <PlayCircle size={20} />
                                Danh sách bài học
                            </h2>
                            <p className="text-sm text-white/90 mt-1">{allLessons.length} bài học</p>
                        </div>

                        {/* Lessons by semester - Accordion */}
                        <div className="flex-1 overflow-y-auto">
                            {Object.entries(
                                allLessons.reduce(
                                    (acc, lesson) => {
                                        const semesterKey = '1'; // TODO: nhóm theo semester thực từ moduleInfo
                                        if (!acc[semesterKey]) {
                                            acc[semesterKey] = [];
                                        }
                                        acc[semesterKey].push(lesson);
                                        return acc;
                                    },
                                    {} as Record<string, Lesson[]>,
                                ),
                            )
                                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                                .map(([semester, lessonsInSemester]) => {
                                    const isExpanded = expandedSemesters[semester] !== false; // Default expanded
                                    const sortedLessons = lessonsInSemester.sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));

                                    return (
                                        <div key={semester} className="border-b border-gray-200">
                                            {/* Semester header - accordion button */}
                                            <button
                                                onClick={() =>
                                                    setExpandedSemesters((prev) => ({
                                                        ...prev,
                                                        [semester]: !prev[semester],
                                                    }))
                                                }
                                                className="w-full px-4 py-3 bg-gradient-to-r from-blue-50 to-teal-50 hover:from-blue-100 hover:to-teal-100 transition-colors flex items-center justify-between"
                                            >
                                                <span className="font-semibold text-gray-800 text-sm">
                                                    {semester === 'Chưa phân kỳ' ? semester : `Kỳ ${semester}`}
                                                </span>
                                                <span className="text-xs font-medium text-gray-600 bg-white px-2 py-1 rounded mr-2">
                                                    {sortedLessons.length} bài
                                                </span>
                                                {isExpanded ? (
                                                    <ChevronUp size={18} className="text-gray-600" />
                                                ) : (
                                                    <ChevronDown size={18} className="text-gray-600" />
                                                )}
                                            </button>

                                            {/* Lessons list - collapsible */}
                                            {isExpanded && (
                                                <div className="p-2 space-y-1">
                                                    {sortedLessons.map((item) => {
                                                        const isActive = String(item.lessonId) === lessonId;
                                                        const status = getLessonStatus(String(item.lessonId));

                                                        return (
                                                            <button
                                                                key={item.lessonId}
                                                                onClick={() => handleLessonClick(String(item.lessonId), item.lessonType)}
                                                                className={`w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group ${
                                                                    isActive
                                                                        ? 'bg-[#E8F4F8] border-2 border-[#00796B] shadow-sm'
                                                                        : 'hover:bg-gray-50 border-2 border-transparent hover:border-gray-200'
                                                                }`}
                                                            >
                                                                <div className="flex items-start gap-3">
                                                                    <div className="flex-shrink-0 mt-0.5">
                                                                        {getLessonTypeIcon(item.lessonType)}
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="flex items-center gap-2 mb-1">
                                                                            <span
                                                                                className={`text-xs font-bold ${
                                                                                    isActive
                                                                                        ? 'text-[#00796B]'
                                                                                        : 'text-gray-500 group-hover:text-gray-700'
                                                                                }`}
                                                                            >
                                                                                Bài {item.lessonOrder}
                                                                            </span>
                                                                            {status === 'completed' && (
                                                                                <CheckCircle
                                                                                    size={14}
                                                                                    className="text-[#2E7D32] flex-shrink-0"
                                                                                />
                                                                            )}
                                                                            {status === 'in-progress' && !isActive && (
                                                                                <div
                                                                                    className="w-2 h-2 bg-[#F57C00] rounded-full flex-shrink-0"
                                                                                    title="Đang học"
                                                                                />
                                                                            )}
                                                                            {item.lessonType === 'QUIZ' && (
                                                                                <span className="text-xs px-1.5 py-0.5 bg-[#F3E5F5] text-[#6A1B9A] rounded font-medium">
                                                                                    Quiz
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                        <p
                                                                            className={`text-sm font-medium line-clamp-2 ${
                                                                                isActive
                                                                                    ? 'text-gray-900'
                                                                                    : 'text-gray-700 group-hover:text-gray-900'
                                                                            }`}
                                                                        >
                                                                            {item.lessonTitle}
                                                                        </p>
                                                                        {item.durationMinutes && (
                                                                            <p className="text-xs text-gray-500 mt-1">
                                                                                ⏱️ {item.durationMinutes} phút
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </button>
                                                        );
                                                    })}
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                        </div>
                    </>
                )}
            </div>

            {/* Toggle sidebar button */}
            <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="absolute left-0 top-20 z-20 bg-white border border-gray-200 rounded-r-lg shadow-md hover:shadow-lg transition-all duration-200 p-2"
                style={{
                    left: sidebarOpen ? '320px' : '0px',
                    transition: 'left 0.3s ease-in-out',
                }}
                title={sidebarOpen ? 'Ẩn danh sách' : 'Hiện danh sách'}
            >
                {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>

            {/* Main content area */}
            <div className="flex-1 overflow-y-auto">
                {/* Top navigation bar */}
                <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
                    <div className="px-6 py-4 flex items-center justify-between">
                        <button
                            onClick={() => navigate(`/my-classes/${classId}/modules`)}
                            className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition font-medium"
                        >
                            <ArrowLeft size={18} /> Quay lại
                        </button>
                        <div className="flex items-center gap-4">
                            {currentStatus === 'completed' ? (
                                <div className="flex items-center gap-2 text-sm text-[#2E7D32] font-medium">
                                    <CheckCircle size={18} /> Đã hoàn thành
                                </div>
                            ) : (
                                <button
                                    onClick={handleComplete}
                                    className="px-6 py-2 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-lg text-sm font-medium transition flex items-center gap-2 shadow-md"
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
                        {lesson.description && <p className="text-gray-600">{lesson.description}</p>}
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                            <span>📘 {lesson.lessonType}</span>
                            {lesson.durationMinutes && <span>⏱️ {lesson.durationMinutes} phút</span>}
                            {lesson.contentType && <span>📺 {lesson.contentType}</span>}
                        </div>
                    </div>

                    {/* Video player - Vimeo */}
                    {lesson.contentUrl && lesson.lessonType === 'VIDEO' && (
                        <div className="space-y-4">
                            <div
                                className="bg-black rounded-xl overflow-hidden shadow-2xl"
                                style={{ aspectRatio: '16/9' }}
                            >
                                <iframe
                                    src={getVimeoEmbedUrl(lesson.contentUrl)}
                                    title={lesson.lessonTitle}
                                    className="w-full h-full"
                                    allow="autoplay; fullscreen; picture-in-picture"
                                    allowFullScreen
                                    id="vimeo-player"
                                />
                            </div>

                            {/* Video Progress Bar */}
                            {videoProgress > 0 && videoProgress < 100 && (
                                <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium text-gray-700">Tiến độ xem video</span>
                                        <span className="text-sm font-bold text-[#00796B]">{videoProgress}%</span>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-[#00796B] to-[#004D40] transition-all duration-300"
                                            style={{ width: `${videoProgress}%` }}
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">
                                        Video sẽ tự động hoàn thành khi xem đủ 90%
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Document viewer for other content types */}
                    {lesson.contentUrl && lesson.lessonType === 'DOCUMENT' && (
                        <div className="bg-white rounded-xl p-8 shadow-sm mb-8 border border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Tài liệu học tập</h2>
                            <a
                                href={lesson.contentUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[#0277BD] hover:text-[#01579B] hover:underline font-medium"
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
                                className="px-8 py-4 bg-[#2E7D32] hover:bg-[#1B5E20] text-white rounded-xl text-lg font-medium transition flex items-center gap-3 shadow-lg hover:shadow-xl"
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
