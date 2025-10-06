import React from 'react';
import { Home, Building2, Users2, Shield, BookOpen, GraduationCap, User, Settings, LogOut } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { keycloak } from '../../keycloak';
import { NavLink } from 'react-router-dom';

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
        <div className="min-h-screen bg-white text-gray-900">
            <div className="flex min-h-screen">
                {/* Sidebar */}
                <aside className="w-64 border-r bg-white hidden md:flex md:flex-col sticky top-0 h-screen overflow-y-auto">
                    <div className="px-4 py-5 border-b">
                        <div className="text-xs text-gray-500 mb-2">Hệ thống Giáo dục Số</div>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">
                                NV
                            </div>
                            <div>
                                <div className="text-sm font-medium">Nguyễn Quang Hưng </div>
                                <div className="text-xs text-gray-500">Super Admin</div>
                            </div>
                        </div>
                    </div>

                    <nav className="flex-1 px-2 py-3 space-y-1">
                        {menuGroups.map((group) => (
                            <div key={group.id}>
                                {group.label && (
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
                                                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
                                            }
                                        >
                                            <IconComponent size={16} /> {item.label}
                                        </NavLink>
                                    );
                                })}
                            </div>
                        ))}
                    </nav>

                    <div className="mt-auto border-t p-3 sticky bottom-0 bg-white">
                        {bottomMenuItems.map((item) => {
                            const IconComponent = item.icon;
                            return (
                                <NavLink
                                    key={item.id}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `block w-full text-left text-sm px-2 py-2 rounded-md flex items-center gap-2 ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
                                    }
                                >
                                    <IconComponent size={16} /> {item.label}
                                </NavLink>
                            );
                        })}
                        <button
                            onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
                            className="mt-2 w-full text-left text-sm px-2 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2"
                        >
                            <LogOut size={16} /> Đăng xuất
                        </button>
                    </div>
                </aside>

                {/* Main */}
                <div className="flex-1 flex flex-col">
                    <main className="p-4 md:p-6 lg:p-8">{children}</main>
                </div>
            </div>
        </div>
    );
}

export { RootLayout };
export default AppLayout;
