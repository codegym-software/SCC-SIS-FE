import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Menu, Bell, Search } from 'lucide-react';
import { useUserProfile } from '@/stores/userProfile';
// import CenterSwitcher from './CenterSwitcher';

interface TopNavBarProps {
    sidebarCollapsed: boolean;
    onToggleSidebar: () => void;
}

export default function TopNavBar({ sidebarCollapsed, onToggleSidebar }: TopNavBarProps) {
    const { userProfile } = useUserProfile();
    const location = useLocation();
    const navigate = useNavigate();
    // Hiển thị CenterSwitcher trên trang tổng quan (path '/') cho các role có quyền xem số liệu theo trung tâm
    const canSelectCenter = userProfile?.roles?.[0]?.code && ['CENTER_MANAGER', 'SUPER_ADMIN'].includes(userProfile.roles[0].code);
    const showCenterSwitcher = canSelectCenter && location.pathname === '/';

    return (
        <div className="sticky top-0 left-0 right-0 z-40 bg-white border-b border-gray-200 shadow-sm">
            <div className="flex items-center px-4 sm:px-6 h-[56px]">
                {/* Left Section - Logo space (reserved for future logo) */}
                <div className={`${sidebarCollapsed ? 'w-16' : 'w-64'} flex-shrink-0 transition-all duration-300`} />
                
                {/* Middle Section - Left controls */}
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

                {/* Spacer to push right section to the end */}
                <div className="flex-1" />
                
                {/* Right Section - Notifications + Avatar */}
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

                    {/* Avatar */}
                    <button 
                        onClick={() => navigate('/settings')}
                        className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        {userProfile?.avatarUrl ? (
                            <img 
                                src={userProfile.avatarUrl} 
                                alt={userProfile.fullName}
                                className="h-9 w-9 rounded-full object-cover shadow-md border-2 border-white"
                            />
                        ) : (
                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 grid place-items-center text-white font-semibold text-sm shadow-md">
                                {userProfile?.fullName
                                    ?.split(' ')
                                    .map((n) => n[0])
                                    .join('')
                                    .toUpperCase()
                                    .slice(0, 2) || 'U'}
                            </div>
                        )}
                        <div className="hidden lg:block text-left">
                            <div className="text-sm font-semibold text-gray-900">{userProfile?.fullName || 'User'}</div>
                            <div className="text-xs text-gray-500">{userProfile?.roles?.[0]?.code || 'Quản lý Trung tâm'}</div>
                        </div>
                    </button>
                </div>
            </div>
        </div>
    );
}
