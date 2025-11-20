import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search, AlertTriangle } from 'lucide-react';
import { useUserProfile } from '@/stores/userProfile';
import CenterSwitcher from './CenterSwitcher';
import { useCenterSelection } from '@/stores/centerSelection';
import { studentWarningsApi } from '@/shared/api/student-warnings';
import type { StudentWarning } from '@/shared/api/student-warnings';
import { notificationsApi } from '@/shared/api/notifications';
import type { NotificationItem } from '@/shared/api/notifications';

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
    const [warnings, setWarnings] = useState<StudentWarning[]>([]);
    const [notifications, setNotifications] = useState<NotificationItem[]>([]);
    const [activeTab, setActiveTab] = useState<'warnings' | 'all'>('warnings');
    const [loading, setLoading] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const notifRef = useRef<HTMLDivElement | null>(null);

    // Fetch student warnings from API (with mock fallback)
    useEffect(() => {
        const fetchWarnings = async () => {
            setLoading(true);
            try {
                const response = await studentWarningsApi.getStudentWarnings(selectedCenterId);
                setWarnings(response.warnings);
                setWarningCount(response.totalCount);
            } catch (error) {
                console.error('Failed to fetch student warnings:', error);
                // Fallback to mock data on error
                const mock = studentWarningsApi.getMockWarnings();
                setWarnings(mock);
                setWarningCount(mock.length);
            } finally {
                setLoading(false);
            }
        };

        fetchWarnings();
    }, [selectedCenterId]);

    // Fetch generalized notifications (with mock fallback)
    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const res = await notificationsApi.fetchNotifications(selectedCenterId);
                setNotifications(res.notifications);
            } catch (error) {
                console.error('Failed to fetch notifications:', error);
                setNotifications(notificationsApi.getMock());
            }
        };
        fetchNotifications();
    }, [selectedCenterId]);

    // Load user avatar from localStorage
    useEffect(() => {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            setUserAvatar(savedAvatar);
        }
    }, []);

    // Listen for avatar changes
    useEffect(() => {
        const handleStorageChange = () => {
            const savedAvatar = localStorage.getItem('userAvatar');
            setUserAvatar(savedAvatar);
        };

        const handleAvatarUpdate = (event: CustomEvent) => {
            setUserAvatar(event.detail.avatar);
        };

        window.addEventListener('storage', handleStorageChange);
        window.addEventListener('avatarUpdated', handleAvatarUpdate as EventListener);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
            window.removeEventListener('avatarUpdated', handleAvatarUpdate as EventListener);
        };
    }, []);

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

                {/* Center: Empty spacer */}
                <div className="flex-1" />

                {/* Right: Notifications + Settings + Avatar */}
                <div className="flex items-center gap-3">
                    {/* Center Switcher - chỉ hiển thị cho CENTER_MANAGER/SUPER_ADMIN */}
                    {showCenterSwitcher && <CenterSwitcher />}
                    
                    {/* Language Selector */}
                    <button className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <span className="text-sm font-medium text-gray-700">VN</span>
                    </button>

                    {/* Notifications dropdown with tabs */}
                    <div className="relative" ref={notifRef}>
                        <button
                            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
                            onClick={() => setShowNotifications((s) => !s)}
                            aria-haspopup="menu"
                            aria-expanded={showNotifications}
                        >
                            <Bell size={20} className="text-gray-700" />
                            {(warningCount > 0 || notifications.length > 0) && (
                                <span className="absolute -top-1 -right-1 min-w-5 h-5 px-1 grid place-items-center text-[10px] font-semibold bg-red-600 text-white rounded-full shadow">
                                    {warningCount + notifications.length}
                                </span>
                            )}
                        </button>
                        {showNotifications && (
                            <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden">
                                <div className="flex border-b bg-gray-50 text-xs">
                                    <button
                                        onClick={() => setActiveTab('warnings')}
                                        className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'warnings' ? 'bg-white text-red-600 border-b-2 border-red-500' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Cảnh báo ({warningCount})
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('all')}
                                        className={`flex-1 px-3 py-2 font-medium transition-colors ${activeTab === 'all' ? 'bg-white text-blue-600 border-b-2 border-blue-500' : 'text-gray-600 hover:text-gray-800'}`}
                                    >
                                        Hoạt động ({notifications.length})
                                    </button>
                                </div>
                                <div className="max-h-96 overflow-auto">
                                    {activeTab === 'warnings' && (
                                        <div>
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
                                    )}
                                    {activeTab === 'all' && (
                                        <div>
                                            <div className="px-4 py-2 text-xs font-medium text-gray-500">
                                                Hoạt động gần đây
                                            </div>
                                            {notifications.length === 0 && (
                                                <div className="px-4 py-6 text-sm text-gray-500">
                                                    Không có hoạt động.
                                                </div>
                                            )}
                                            {notifications.slice(0, 6).map((n) => (
                                                <div
                                                    key={n.id}
                                                    className="px-4 py-3 border-b last:border-b-0 hover:bg-gray-50"
                                                >
                                                    <div className="text-xs text-gray-500 flex justify-between">
                                                        <span>{new Date(n.createdAt).toLocaleTimeString()}</span>
                                                        {n.unread && (
                                                            <span className="text-red-600 font-semibold">Mới</span>
                                                        )}
                                                    </div>
                                                    <div className="text-sm font-medium text-gray-900 line-clamp-1">
                                                        {n.title}
                                                    </div>
                                                    <div className="text-xs text-gray-600 line-clamp-2">
                                                        {n.message}
                                                    </div>
                                                </div>
                                            ))}
                                            {notifications.length > 0 && (
                                                <div className="px-4 py-2">
                                                    <button
                                                        onClick={() => {
                                                            setShowNotifications(false);
                                                            navigate('/activity-log');
                                                        }}
                                                        className="w-full text-sm font-semibold text-blue-700 hover:text-blue-800"
                                                    >
                                                        Xem Activity Log
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Avatar - Click to go to Settings */}
                    <button 
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {userAvatar ? (
                            <img 
                                src={userAvatar} 
                                alt="Avatar" 
                                className="h-9 w-9 rounded-full object-cover shadow-md"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-semibold text-sm shadow-md">
                                {me?.fullName
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2) || 'U'}
                            </div>
                        )}
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
