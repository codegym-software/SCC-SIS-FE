import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, BarChart3 } from 'lucide-react';
import { useUserProfile } from '@/stores/userProfile';
import { getLecturerSchedule, type LecturerScheduleDto } from '@/shared/api/attendance';

// Session type matching API
type Session = LecturerScheduleDto;

// Helper functions
function getMonday(d: Date): Date {
    const date = new Date(d);
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

function formatDate(date: Date): string {
    return date.toISOString().split('T')[0];
}

// Mock data generator (fallback khi API lỗi)
function generateMockSessions(startDate: Date): Session[] {
    const sessions: Session[] = [];
    const classes = [
        { id: 1, name: 'An toàn thông tin', room: 'VPC2-401', program: 'An toàn thông tin 1-3-24(N01)/23CS1' },
        {
            id: 2,
            name: 'Phân tích và thiết kế giải thuật',
            room: 'VPC2-401',
            program: 'Phân tích và thiết kế giải thuật-1-3-24(N01)/23CS1',
        },
        { id: 3, name: 'Đồ họa máy tính', room: 'VPC2-302', program: 'Đồ họa máy tính-1-3-24(N01)/23CS1' },
        { id: 4, name: 'Điện toán đám mây', room: 'VPC2-305', program: 'Điện toán đám mây-1-3-24(N01)/23CS1' },
    ];

    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + dayOffset);
        const dateStr = formatDate(d);
        const dayOfWeek = d.getDay();

        if (dayOfWeek === 1) {
            // Monday
            sessions.push({
                scheduleId: parseInt(`${dateStr.replace(/-/g, '')}1`),
                date: dateStr,
                studyTime: 'MORNING',
                timeRange: '07:00 - 09:40 (Tiết 1-3)',
                classId: classes[0].id,
                className: classes[0].name,
                room: classes[0].room,
                programName: classes[0].program,
                isAttended: true,
            });
            sessions.push({
                scheduleId: parseInt(`${dateStr.replace(/-/g, '')}2`),
                date: dateStr,
                studyTime: 'AFTERNOON',
                timeRange: '09:45 - 12:25 (Tiết 4-6)',
                classId: classes[3].id,
                className: classes[3].name,
                room: classes[3].room,
                programName: classes[3].program,
                isAttended: false,
            });
        }
        if (dayOfWeek === 2) {
            // Tuesday
            sessions.push({
                scheduleId: parseInt(`${dateStr.replace(/-/g, '')}3`),
                date: dateStr,
                studyTime: 'MORNING',
                timeRange: '07:00 - 09:40 (Tiết 1-3)',
                classId: classes[1].id,
                className: classes[1].name,
                room: classes[1].room,
                programName: classes[1].program,
                isAttended: true,
            });
            sessions.push({
                scheduleId: parseInt(`${dateStr.replace(/-/g, '')}4`),
                date: dateStr,
                studyTime: 'AFTERNOON',
                timeRange: '09:45 - 12:25 (Tiết 4-6)',
                classId: classes[2].id,
                className: classes[2].name,
                room: classes[2].room,
                programName: classes[2].program,
                isAttended: false,
            });
        }
        if (dayOfWeek === 3) {
            // Wednesday
            sessions.push({
                scheduleId: parseInt(`${dateStr.replace(/-/g, '')}5`),
                date: dateStr,
                studyTime: 'MORNING',
                timeRange: '07:00 - 09:40 (Tiết 1-3)',
                classId: classes[1].id,
                className: classes[1].name,
                room: classes[1].room,
                programName: classes[1].program,
                isAttended: false,
            });
        }
        if (dayOfWeek === 4) {
            // Thursday
            sessions.push({
                scheduleId: parseInt(`${dateStr.replace(/-/g, '')}6`),
                date: dateStr,
                studyTime: 'MORNING',
                timeRange: '07:00 - 09:40 (Tiết 1-3)',
                classId: classes[1].id,
                className: classes[1].name,
                room: classes[1].room,
                programName: classes[1].program,
                isAttended: false,
            });
        }
        if (dayOfWeek === 5) {
            // Friday
            sessions.push({
                scheduleId: parseInt(`${dateStr.replace(/-/g, '')}7`),
                date: dateStr,
                studyTime: 'MORNING',
                timeRange: '07:00 - 09:40 (Tiết 1-3)',
                classId: classes[1].id,
                className: classes[1].name,
                room: classes[1].room,
                programName: classes[1].program,
                isAttended: false,
            });
        }
    }
    return sessions;
}

const TIME_SLOTS = [
    { id: '7:00', label: '7:00' },
    { id: '8:00', label: '8:00' },
    { id: '9:00', label: '9:00' },
    { id: '10:00', label: '10:00' },
    { id: '11:00', label: '11:00' },
    { id: '12:00', label: '12:00' },
    { id: '13:00', label: '13:00' },
    { id: '14:00', label: '14:00' },
];

export default function AttendancePage() {
    const { me } = useUserProfile();
    const navigate = useNavigate();
    const isLecturer = me?.roles?.some((r) => r.code === 'LECTURER');
    const [anchor, setAnchor] = useState<Date>(() => getMonday(new Date()));
    const [activeTab, setActiveTab] = useState<'schedule' | 'history' | 'stats'>('schedule');
    const [sessions, setSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(false);

    // Fetch schedule khi tuần thay đổi
    useEffect(() => {
        if (!isLecturer) return;

        const fetchSchedule = async () => {
            setLoading(true);
            try {
                const weekEnd = new Date(anchor);
                weekEnd.setDate(anchor.getDate() + 6);

                const startDate = formatDate(anchor);
                const endDate = formatDate(weekEnd);

                const response = await getLecturerSchedule(startDate, endDate);
                setSessions(response.data);
            } catch (error) {
                console.error('Failed to fetch schedule:', error);
                // Fallback to mock data if API fails
                setSessions(generateMockSessions(anchor));
            } finally {
                setLoading(false);
            }
        };

        fetchSchedule();
    }, [anchor, isLecturer]);

    const weekDays = useMemo(() => {
        return Array.from({ length: 7 }).map((_, i) => {
            const d = new Date(anchor);
            d.setDate(anchor.getDate() + i);
            return d;
        });
    }, [anchor]);

    const handleWeekChange = (offset: number) => {
        const newAnchor = new Date(anchor);
        newAnchor.setDate(anchor.getDate() + offset * 7);
        setAnchor(newAnchor);
    };

    if (!isLecturer) {
        return (
            <div className="p-6">
                <div className="text-sm text-gray-600">Mục này chỉ dành cho tài khoản Giảng viên.</div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Page header */}
            <div className="bg-white rounded-xl border p-6">
                <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-lg bg-green-600 flex items-center justify-center text-white">
                        <CalendarIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Quản lý Điểm danh</h1>
                        <p className="text-sm text-gray-600">Điểm danh học viên và thống kê chuyên cần</p>
                    </div>
                </div>
            </div>

            {/* Tab navigation */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-lg border w-fit">
                <button
                    onClick={() => setActiveTab('schedule')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                        activeTab === 'schedule'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <CalendarIcon size={16} />
                    <span>Lịch học</span>
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                        activeTab === 'history'
                            ? 'bg-white text-gray-900 shadow-sm'
                            : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <Users size={16} />
                    <span>Lịch sử điểm danh</span>
                </button>
                <button
                    onClick={() => setActiveTab('stats')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm transition-colors ${
                        activeTab === 'stats' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                    }`}
                >
                    <BarChart3 size={16} />
                    <span>Thống kê Chuyên cần</span>
                </button>
            </div>

            {/* Schedule tab content */}
            {activeTab === 'schedule' && (
                <div className="space-y-4">
                    {/* Month/week navigation */}
                    <div className="flex items-center justify-between">
                        <button
                            className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 flex items-center justify-center"
                            onClick={() => handleWeekChange(-1)}
                            title="Tuần trước"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <div className="px-3 py-1 text-sm font-medium">
                            Tháng {anchor.getMonth() + 1}-{anchor.getFullYear()}
                        </div>
                        <button
                            className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 flex items-center justify-center"
                            onClick={() => handleWeekChange(1)}
                            title="Tuần sau"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Legend */}
                    <div className="flex items-center gap-6 text-xs">
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-green-500"></div>
                            <span className="text-gray-600">Đã điểm danh</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-orange-500"></div>
                            <span className="text-gray-600">Chưa điểm danh</span>
                        </div>
                    </div>

                    {loading && <div className="text-center text-sm text-gray-500 py-4">Đang tải lịch học...</div>}

                    {/* Calendar grid */}
                    {!loading && (
                        <div className="bg-white border rounded-lg overflow-hidden">
                            {/* Header row */}
                            <div className="grid grid-cols-8 border-b bg-gray-50">
                                <div className="px-2 py-2 text-xs text-gray-500 flex items-center gap-1">
                                    <div className="rotate-12">⏰</div>
                                    <span>GMT+7</span>
                                </div>
                                {weekDays.map((d, idx) => {
                                    const date = d.getDate();
                                    const month = d.getMonth() + 1;
                                    const year = d.getFullYear();
                                    const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()];
                                    return (
                                        <div key={idx} className="px-2 py-2 border-l text-center">
                                            <div className="text-xs text-gray-600">
                                                {date}/{month}/{year}
                                            </div>
                                            <div className="text-xs font-medium text-gray-900">{dayName}</div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Time rows */}
                            {TIME_SLOTS.map((slot) => (
                                <div key={slot.id} className="grid grid-cols-8 border-b min-h-[80px]">
                                    <div className="px-2 py-2 text-xs text-gray-500 border-r bg-gray-50">
                                        {slot.label}
                                    </div>
                                    {weekDays.map((d, dayIdx) => {
                                        const dateStr = formatDate(d);
                                        const daySessions = sessions.filter((s) => s.date === dateStr);
                                        const slotHour = parseInt(slot.id.split(':')[0], 10);
                                        let relevantSessions: Session[] = [];
                                        if (slotHour === 7) {
                                            relevantSessions = daySessions.filter((s) => s.studyTime === 'MORNING');
                                        } else if (slotHour === 9) {
                                            relevantSessions = daySessions.filter((s) => s.studyTime === 'AFTERNOON');
                                        }

                                        return (
                                            <div key={dayIdx} className="border-l p-1 relative">
                                                {relevantSessions.map((session) => (
                                                    <button
                                                        key={session.scheduleId}
                                                        onClick={() => {
                                                            const params = new URLSearchParams({
                                                                scheduleId: session.scheduleId.toString(),
                                                                classId: session.classId.toString(),
                                                                className: session.className,
                                                                date: session.date,
                                                                timeRange: session.timeRange,
                                                                room: session.room,
                                                                programName: session.programName || '',
                                                            });
                                                            navigate(`/attendance/take?${params.toString()}`);
                                                        }}
                                                        className={`w-full text-left p-2 rounded-md text-xs mb-1 transition-colors ${
                                                            session.isAttended
                                                                ? 'bg-green-100 border border-green-300 hover:bg-green-200'
                                                                : 'bg-orange-100 border border-orange-300 hover:bg-orange-200'
                                                        }`}
                                                    >
                                                        <div className="font-medium text-gray-900 line-clamp-1">
                                                            {session.className}
                                                        </div>
                                                        <div className="text-[10px] text-gray-600">
                                                            {session.timeRange}
                                                        </div>
                                                        <div className="text-[10px] text-gray-500">{session.room}</div>
                                                        <div className="text-[10px] text-gray-500 line-clamp-1">
                                                            {session.programName?.split('-')[0]}
                                                        </div>
                                                    </button>
                                                ))}
                                            </div>
                                        );
                                    })}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* History tab placeholder */}
            {activeTab === 'history' && (
                <div className="bg-white border rounded-lg p-6">
                    <p className="text-sm text-gray-600">Lịch sử điểm danh sẽ được cập nhật sau</p>
                </div>
            )}

            {/* Stats tab placeholder */}
            {activeTab === 'stats' && (
                <div className="bg-white border rounded-lg p-6">
                    <p className="text-sm text-gray-600">Thống kê chuyên cần sẽ được cập nhật sau</p>
                </div>
            )}
        </div>
    );
}
