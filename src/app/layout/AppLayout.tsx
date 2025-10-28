import React, { useState, useEffect } from 'react';
import {
    Home,
    Building2,
    Users2,
    Shield,
    BookOpen,
    GraduationCap,
    User,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { keycloak } from '../../keycloak';
import { NavLink } from 'react-router-dom';
import { useUserProfile } from '../../stores/userProfile';
import { roleDisplay } from '../../utils/roleLabel';

function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html>
            <body className="text-base antialiased font-sans">{children}</body>
        </html>
    );
}

type AppLayoutProps = {
    children: React.ReactNode;
};

type MenuItem = {
    id: string;
    label: string;
    path: string;
    icon: LucideIcon;
    end?: boolean;
};

type MenuGroup = {
    id: string;
    label?: string;
    items: MenuItem[];
};

function AppLayout({ children }: AppLayoutProps) {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
        // Load sidebar state from localStorage
        const saved = localStorage.getItem('sidebarCollapsed');
        return saved ? JSON.parse(saved) : false;
    });

    const [userAvatar, setUserAvatar] = useState<string | null>(null);

    // Save sidebar state to localStorage when it changes
    useEffect(() => {
        localStorage.setItem('sidebarCollapsed', JSON.stringify(sidebarCollapsed));
    }, [sidebarCollapsed]);

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

    // Get user profile data
    const { me, loading } = useUserProfile();
    const mainRole = me?.roles?.[0];

    // Check if user is STUDENT
    const isStudent = me?.roles?.some((role) => role.code === 'STUDENT') ?? false;

    // Menu configuration - easily extensible
    const menuGroups: MenuGroup[] = [
        {
            id: 'main',
            items: [
                {
                    id: 'dashboard',
                    label: 'Tổng quan',
                    path: '/',
                    icon: Home,
                    end: true,
                },
                {
                    id: 'users',
                    label: 'Quản lý Người dùng',
                    path: '/users',
                    icon: Users2,
                },
                {
                    id: 'centers',
                    label: 'Quản lý Trung tâm',
                    path: '/centers',
                    icon: Building2,
                },
                {
                    id: 'roles',
                    label: 'Vai trò & Phân quyền',
                    path: '/roles',
                    icon: Shield,
                },
                {
                    id: 'programs',
                    label: 'Chương trình & Module',
                    path: '/programs',
                    icon: BookOpen,
                },
                {
                    id: 'classes',
                    label: 'Quản lý Lớp học',
                    path: '/classes',
                    icon: GraduationCap,
                },
                {
                    id: 'students',
                    label: 'Hồ sơ Học viên',
                    path: '/students',
                    icon: User,
                },
                // Menu cho Học viên
                ...(isStudent
                    ? [
                          {
                              id: 'my-classes',
                              label: 'Lớp học của tôi',
                              path: '/my-classes',
                              icon: GraduationCap,
                          },
                      ]
                    : []),
            ],
        },
        // Có thể thêm group khác như:
        // {
        //   id: 'reports',
        //   label: 'Báo cáo',
        //   items: [
        //     { id: 'analytics', label: 'Phân tích', path: '/analytics', icon: BarChart3 },
        //     { id: 'exports', label: 'Xuất dữ liệu', path: '/exports', icon: Download }
        //   ]
        // }
    ];

    const bottomMenuItems: MenuItem[] = [
        {
            id: 'settings',
            label: 'Cài đặt',
            path: '/settings',
            icon: Settings,
        },
    ];

    return (
        <div className="min-h-screen bg-white text-gray-900 m-0 p-0">
            <div className="flex min-h-screen m-0 p-0">
                {/* Sidebar */}
                <aside
                    className={`${sidebarCollapsed ? 'w-16' : 'w-64'} border-r bg-white hidden md:flex md:flex-col sticky top-0 h-screen overflow-y-auto z-10 transition-all duration-300 relative`}
                >
                    <div className="px-4 py-5 border-b">
                        {!sidebarCollapsed && (
                            <>
                                <div className="text-xs text-gray-500 mb-2">Hệ thống Giáo dục Số</div>
                                <div className="flex items-center gap-3">
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt="User Avatar"
                                            className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md"
                                        />
                                    ) : (
                                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                            NV
                                        </div>
                                    )}
                                    <div>
                                        <div className="text-sm font-medium">
                                            {loading ? 'Đang tải...' : (me?.fullName ?? me?.keycloak?.username ?? '—')}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {loading ? '...' : mainRole ? roleDisplay(mainRole) : '—'}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                        {sidebarCollapsed &&
                            (userAvatar ? (
                                <img
                                    src={userAvatar}
                                    alt="User Avatar"
                                    className="h-10 w-10 rounded-full object-cover border-2 border-white shadow-md mx-auto"
                                />
                            ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium mx-auto">
                                    NV
                                </div>
                            ))}
                    </div>

                    {/* Toggle button - positioned inside sidebar */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="absolute top-1/2 right-2 w-6 h-6 rounded-full bg-white border border-gray-200 shadow-md hover:bg-gray-50 flex items-center justify-center transition-colors z-20 transform -translate-y-1/2"
                    >
                        {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
                    </button>

                    <nav className="flex-1 px-2 py-3 space-y-1">
                        {menuGroups.map((group) => (
                            <div key={group.id}>
                                {group.label && !sidebarCollapsed && (
                                    <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                                        {group.label}
                                    </div>
                                )}
                                {group.items.map((item) => {
                                    const IconComponent = item.icon;
                                    return (
                                        <NavLink
                                            key={item.id}
                                            to={item.path}
                                            end={item.end}
                                            className={({ isActive }) =>
                                                `flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'gap-2 px-2'} py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
                                            }
                                            title={sidebarCollapsed ? item.label : undefined}
                                        >
                                            <IconComponent size={16} />
                                            {!sidebarCollapsed && <span>{item.label}</span>}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto border-t p-3 sticky bottom-0 bg-white z-10">
                        {bottomMenuItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `block w-full text-left text-sm px-2 py-2 rounded-md flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'} ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
                                    }
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    <IconComponent size={16} />
                                    {!sidebarCollapsed && <span>{item.label}</span>}
                                </NavLink>
                            );
                        })}
                        <button
                            onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
                            className={`mt-2 w-full text-left text-sm px-2 py-2 rounded-md hover:bg-gray-50 flex items-center ${sidebarCollapsed ? 'justify-center' : 'gap-2'}`}
                            title={sidebarCollapsed ? 'Đăng xuất' : undefined}
                        >
                            <LogOut size={16} />
                            {!sidebarCollapsed && <span>Đăng xuất</span>}
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex-1 flex flex-col min-h-screen">
                    <main className="flex-1 w-full min-h-screen p-6">{children}</main>
                </div>
            </div>
        </div>
    );
}

export { RootLayout };
export default AppLayout;
