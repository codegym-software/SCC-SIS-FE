import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Settings, Search, AlertTriangle } from 'lucide-react';
import { useUserProfile } from '@/stores/userProfile';
import CenterSwitcher from './CenterSwitcher';
import { useCenterSelection } from '@/stores/centerSelection';

interface TopNavBarProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
}

export default function TopNavBar({ sidebarCollapsed, onToggleSidebar }: TopNavBarProps) {
    const { me } = useUserProfile();
    const location = useLocation();
    const navigate = useNavigate();
    const selectedCenterId = useCenterSelection((s) => s.selectedCenterId);
    const [showNotifications, setShowNotifications] = useState(false);
    const [warningCount, setWarningCount] = useState(0);
    const [warnings, setWarnings] = useState<
        Array<{
            studentId: number;
            code: string;
            name: string;
            reason: string;
            detail: string;
            program: string;
            classCode: string;
            severity: 'HIGH' | 'MEDIUM' | 'LOW';
        }>
    >([]);
    const notifRef = useRef<HTMLDivElement | null>(null);

    // Mock warnings (TODO: replace by API filtered by selectedCenterId)
    useEffect(() => {
        const mock = [
            {
                studentId: 1,
                code: 'HV001',
                name: 'Nguyễn Văn B',
                reason: 'Nghỉ học nhiều',
                detail: 'Đã nghỉ 5/12 buổi học',
                program: 'Java Cơ bản',
                classCode: 'K14',
                severity: 'HIGH' as const,
            },
            {
                studentId: 2,
                code: 'HV002',
                name: 'Trần Thị C',
                reason: 'Điểm số thấp',
                detail: 'Điểm trung bình: 4.2/10',
                program: 'Python Data Science',
                classCode: 'K12',
                severity: 'HIGH' as const,
            },
            {
                studentId: 3,
                code: 'HV003',
                name: 'Lê Văn D',
                reason: 'Chưa nộp bài tập',
                detail: 'Còn 3 bài tập chưa nộp',
                program: 'Digital Marketing',
                classCode: 'K08',
                severity: 'MEDIUM' as const,
            },
        ];
        setWarnings(mock);
        setWarningCount(mock.length);
    }, [selectedCenterId]);

    // Close dropdown on outside click
    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        }
        if (showNotifications) {
            document.addEventListener('mousedown', onDocClick);
        }
        return () => document.removeEventListener('mousedown', onDocClick);
    }, [showNotifications]);
    // Hiển thị CenterSwitcher trên trang tổng quan (path '/') cho các role có quyền xem số liệu theo trung tâm
    const canSelectCenter = me?.roles?.some((r) => ['CENTER_MANAGER', 'SUPER_ADMIN'].includes(r.code));
    const showCenterSwitcher = canSelectCenter && location.pathname === '/';

    return (
        <div className="sticky top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm flex items-center">
            {/* Left Section - Logo area aligned with sidebar width */}
            <div
                className={`${sidebarCollapsed ? 'w-16' : 'w-64'} hidden md:flex items-center justify-start px-4 transition-all duration-300`}
            >
                <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-full bg-blue-600 grid place-items-center text-white font-bold text-sm shadow-md">
                        E
                    </div>
                    {!sidebarCollapsed && <span className="text-base font-semibold text-gray-900">EduManage</span>}
                </div>
            </div>
            {/* Divider that lines up with the sidebar edge */}
            <div className="hidden md:block h-12 w-px bg-gray-200" />

            {/* Right Section - Rest of the navbar */}
            <div className="flex-1 flex items-center justify-between px-4 sm:px-6 py-3 gap-4">
                {/* Left controls in navbar */}
                <div className="flex items-center gap-1 sm:gap-2">
                    <button
                        onClick={onToggleSidebar}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                        aria-label="Toggle menu"
                    >
                        <Menu size={20} className="text-gray-700" />
                    </button>
                    <button
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:inline-flex"
                        aria-label="Search"
                    >
                        <Search size={20} className="text-gray-700" />
                    </button>
                </div>

                {/* Center: CenterSwitcher - chỉ hiển thị ở trang tổng quan cho CENTER_MANAGER */}
                <div className="flex-1 flex justify-center max-w-md">{showCenterSwitcher && <CenterSwitcher />}</div>

                {/* Right: Notifications + Settings + Avatar */}
                <div className="flex items-center gap-3">
                    {/* Language Selector */}
                    <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-medium text-gray-700">VN</span>
                    </button>

                    {/* Notifications with student warning count */}
                    <div className="relative" ref={notifRef}>
                        <button
                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setShowNotifications((s) => !s)}
                            aria-haspopup="menu"
                            aria-expanded={showNotifications}
                        >
                            <Bell size={20} className="text-gray-700" />
                            {warningCount > 0 && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center text-[10px] font-semibold bg-red-600 text-white rounded-full shadow">
                                    {warningCount}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="px-4 py-3 border-b flex items-center gap-2">
                                    <AlertTriangle size={16} className="text-red-600" />
                                    <div className="text-sm font-semibold text-gray-900">Thông báo</div>
                                    {warningCount > 0 && (
                                        <span className="ml-1 text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                                            {warningCount} cảnh báo
                                        </span>
                                    )}
                                </div>
                                <div className="max-h-96 overflow-auto">
                                    <div className="px-4 py-2 text-xs font-medium text-gray-500">
                                        Học sinh bị cảnh báo
                                    </div>
                                    {warnings.length === 0 && (
                                        <div className="px-4 py-6 text-sm text-gray-500">Chưa có cảnh báo.</div>
                                    )}
                                    {warnings.slice(0, 5).map((w) => (
                                        <button
                                            key={w.studentId}
                                            onClick={() => {
                                                setShowNotifications(false);
                                                navigate(`/students/${w.studentId}`);
                                            }}
                                            className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-start gap-3"
                                        >
                                            <div
                                                className={`mt-0.5 h-6 w-6 rounded-full grid place-items-center text-white text-[10px] font-semibold shadow ${
                                                    w.severity === 'HIGH'
                                                        ? 'bg-red-600'
                                                        : w.severity === 'MEDIUM'
                                                          ? 'bg-amber-500'
                                                          : 'bg-blue-500'
                                                }`}
                                            >
                                                !
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-sm font-medium text-gray-900 truncate">
                                                    {w.name} <span className="text-gray-500">#{w.code}</span>
                                                </div>
                                                <div className="text-xs text-red-600">{w.reason}</div>
                                                <div className="text-xs text-gray-600 truncate">
                                                    {w.detail} — {w.program} • {w.classCode}
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                    {warnings.length > 0 && (
                                        <div className="px-4 py-2">
                                            <button
                                                onClick={() => {
                                                    setShowNotifications(false);
                                                    navigate('/students');
                                                }}
                                                className="w-full text-sm font-semibold text-blue-700 hover:text-blue-800"
                                            >
                                                Xem tất cả học sinh cảnh báo
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Settings */}
                    <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Settings size={20} className="text-gray-700" />
                    </button>

                    {/* Avatar */}
                    <button className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-semibold text-sm shadow-md">
                            {me?.fullName
                                ?.split(' ')
                                .map((n) => n[0])
                                .join('')
                                .toUpperCase()
                                .slice(0, 2) || 'U'}
                        </div>
                        <div className="hidden lg:block text-left">
                            <div className="text-sm font-semibold text-gray-900">{me?.fullName || 'User'}</div>
                            <div className="text-xs text-gray-500">{me?.roles?.[0]?.code || 'Quản lý Trung tâm'}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
