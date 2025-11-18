import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu, Bell, Settings, Search } from 'lucide-react';
import { useUserProfile } from '@/stores/userProfile';
import CenterSwitcher from './CenterSwitcher';

interface TopNavBarProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
}

export default function TopNavBar({ sidebarCollapsed, onToggleSidebar }: TopNavBarProps) {
    const { me } = useUserProfile();
    const location = useLocation();
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

                    {/* Notifications */}
                    <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
                        <Bell size={20} className="text-gray-700" />
                        <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
                    </button>

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
