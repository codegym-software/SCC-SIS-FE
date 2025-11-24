import { useEffect, useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, Calendar, Users, CheckCircle, ArrowRight } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { getMyClasses, type ClassDto } from '@/shared/api/classes';
import { getModulesByProgram, type ModuleResponse } from '@/shared/api/modules';
import { useUserProfile } from '@/stores/userProfile';

// Augment module with status used elsewhere
interface ModuleWithStatus extends ModuleResponse {
    status?: 'Hoàn thành' | 'Đang học' | 'Chưa học';
}

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
    const toast = useToast();
    const { me } = useUserProfile();

    const [loading, setLoading] = useState(false);
    const [cls, setCls] = useState<ClassDto | null>(null);
    const [modules, setModules] = useState<ModuleWithStatus[]>([]);

    useEffect(() => {
        const run = async () => {
            try {
                setLoading(true);
                const classesRes = await getMyClasses();
                const found = classesRes.data.find((c: ClassDto) => c.classId.toString() === classId);
                if (!found) {
                    toast.error('Không tìm thấy lớp học');
                    return;
                }
                setCls(found);
                if (found.programId) {
                    const mRes = await getModulesByProgram({ programId: found.programId });
                    const modulesData: ModuleWithStatus[] = mRes.data.map((m: ModuleResponse, index: number) => ({
                        ...m,
                        status: index === 0 ? 'Đang học' : index < 2 ? 'Hoàn thành' : 'Chưa học',
                    }));
                    setModules(modulesData);
                }
            } catch (e: any) {
                toast.error(e?.response?.data?.message || 'Không thể tải dữ liệu');
            } finally {
                setLoading(false);
            }
        };
        if (me?.userId) run();
    }, [me?.userId, classId]);

    const groupedBySemester = useMemo(() => {
        const g: Record<number, ModuleWithStatus[]> = {};
        modules.forEach((m) => {
            const s = m.semester || 1;
            if (!g[s]) g[s] = [];
            g[s].push(m);
        });
        return g;
    }, [modules]);

    const continueModule =
        modules.find((m) => m.status === 'Đang học') || modules.find((m) => m.status !== 'Hoàn thành');

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

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px] text-sm text-gray-600">Đang tải...</div>;
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
        <div className="space-y-6">
            <button
                onClick={() => navigate('/my-classes')}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
            >
                <ArrowLeft size={16} /> Quay lại danh sách lớp
            </button>

            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">{cls.name}</h1>
                        <p className="text-sm text-gray-500">Mã lớp: #{cls.classId}</p>
                    </div>
                    <span
                        className={`px-3 py-1.5 rounded-full text-sm font-medium ${getClassStatus(cls.status) === 'Đang học' ? 'bg-blue-100 text-blue-700' : getClassStatus(cls.status) === 'Hoàn thành' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}
                    >
                        {getClassStatus(cls.status)}
                    </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-3">
                        <BookOpen className="text-gray-400" size={20} />
                        <div>
                            <p className="text-xs text-gray-500">Chương trình</p>
                            <p className="text-sm font-medium text-gray-900">{cls.programName}</p>
                        </div>
                    </div>
                    {(cls.studyDays || cls.studyTime) && (
                        <div className="flex items-center gap-3">
                            <Calendar className="text-gray-400" size={20} />
                            <div className="flex-1">
                                <p className="text-xs text-gray-500 mb-1">Lịch học</p>
                                {cls.studyDays && (
                                    <div className="text-sm font-medium text-gray-900">
                                        {cls.studyDays.map(getStudyDayLabel).join(', ')}
                                    </div>
                                )}
                                {cls.studyTime && (
                                    <div className="text-sm font-semibold text-blue-600">
                                        {getStudyTimeRange(cls.studyTime)}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    {cls.room && (
                        <div className="flex items-center gap-3">
                            <Users className="text-gray-400" size={20} />
                            <div>
                                <p className="text-xs text-gray-500">Phòng học</p>
                                <p className="text-sm font-medium text-gray-900">{cls.room}</p>
                            </div>
                        </div>
                    )}
                </div>
                {continueModule && (
                    <button
                        onClick={() => navigate(`/my-classes/${cls.classId}/modules/${continueModule.moduleId}`)}
                        className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm flex items-center gap-2"
                    >
                        <ArrowRight size={16} /> Tiếp tục học
                    </button>
                )}
            </div>

            {/* Full modules listing */}
            <div className="space-y-6">
                {Object.keys(groupedBySemester).length === 0 ? (
                    <div className="text-center text-sm text-gray-500 py-12">Chưa có module nào.</div>
                ) : (
                    Object.keys(groupedBySemester)
                        .sort((a, b) => parseInt(a) - parseInt(b))
                        .map((sem) => {
                            const semesterModules = groupedBySemester[parseInt(sem)];
                            return (
                                <div key={sem} className="space-y-3">
                                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
                                        <h3 className="font-bold text-base">
                                            Học kỳ {sem}{' '}
                                            <span className="ml-2 text-sm font-normal">
                                                ({semesterModules.length} module)
                                            </span>
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {semesterModules.map((m) => {
                                            const done = m.status === 'Hoàn thành';
                                            return (
                                                <div
                                                    key={m.moduleId}
                                                    className="border rounded-lg bg-white p-4 hover:shadow-md transition-shadow flex flex-col"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h4 className="font-medium text-sm pr-2 line-clamp-2">
                                                            {m.name}
                                                        </h4>
                                                        {done ? (
                                                            <CheckCircle size={18} className="text-green-600" />
                                                        ) : (
                                                            <div className="w-4 h-4 rounded-full bg-gray-200" />
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-gray-600 line-clamp-3 mb-3">
                                                        {m.description || 'Không có mô tả'}
                                                    </p>
                                                    <div className="text-[11px] text-gray-500 mb-3 flex flex-wrap gap-2">
                                                        <span>Mã: {m.code}</span>
                                                        <span>• {m.credits} tín chỉ</span>
                                                    </div>
                                                    <div className="mt-auto flex items-center justify-between">
                                                        <span
                                                            className={`text-[11px] px-2 py-0.5 rounded-full ${m.status === 'Hoàn thành' ? 'bg-green-100 text-green-700' : m.status === 'Đang học' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700'}`}
                                                        >
                                                            {m.status || 'Chưa học'}
                                                        </span>
                                                        <button
                                                            onClick={() =>
                                                                navigate(
                                                                    `/my-classes/${cls.classId}/modules/${m.moduleId}`,
                                                                )
                                                            }
                                                            className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                                                        >
                                                            Chi tiết <ArrowRight size={12} />
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            );
                        })
                )}
            </div>
        </div>
    );
}
