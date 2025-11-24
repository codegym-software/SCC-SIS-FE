import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Trophy, TrendingUp, Bell, Settings, LogOut, Search, Menu, X } from 'lucide-react';
import { keycloak } from '../../keycloak';
import { useUserProfile } from '../../stores/userProfile';

type StudentLayoutProps = {
    children: React.ReactNode;
};

export default function StudentLayout({ children }: StudentLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const { me, loading } = useUserProfile();
    const navigate = useNavigate();

    // Load user avatar
    useEffect(() => {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            setUserAvatar(savedAvatar);
        }
    }, []);

    const handleLogout = () => {
        keycloak.logout({ redirectUri: window.location.origin });
    };

    const getUserInitials = () => {
        if (!me?.fullName) return '?';
        const names = me.fullName.split(' ');
        return names.length >= 2
            ? `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase()
            : names[0][0].toUpperCase();
    };

    const navigationItems = [
        { name: 'Lớp học của tôi', path: '/my-classes', icon: BookOpen },
        { name: 'Tiến trình', path: '/progress', icon: TrendingUp },
        { name: 'Thành tích', path: '/achievements', icon: Trophy },
    ];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-white shadow-sm">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Logo and Brand */}
                        <div className="flex items-center">
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="mr-4 rounded-lg p-2 hover:bg-gray-100 lg:hidden"
                            >
                                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                            </button>
                            <button
                                onClick={() => navigate('/my-classes')}
                                className="group flex items-center space-x-2 rounded-md px-2 py-1 transition-colors hover:bg-gray-100"
                                aria-label="Trang chủ eduMange"
                            >
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-800 text-white transition-colors group-hover:bg-gray-700">
                                    <span className="text-lg font-bold">E</span>
                                </div>
                                <span className="text-xl font-semibold tracking-tight text-gray-900 group-hover:text-gray-800">
                                    eduMange
                                </span>
                            </button>
                        </div>

                        {/* Search Bar - Hidden on mobile */}
                        <div className="hidden flex-1 px-8 md:block lg:max-w-md">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm"
                                    className="w-full rounded-full border border-gray-300 py-2 pl-10 pr-4 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                                />
                            </div>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-4">
                            {/* Notifications */}
                            <button className="relative rounded-full p-2 hover:bg-gray-100" aria-label="Thông báo">
                                <Bell className="h-6 w-6 text-gray-600" />
                                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-blue-500"></span>
                            </button>

                            {/* User Menu */}
                            <div className="relative">
                                <button 
                                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                                    className="flex items-center space-x-3 rounded-full p-1 hover:bg-gray-100"
                                >
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt="Avatar"
                                            className="h-8 w-8 rounded-full object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-sm font-semibold text-white">
                                            {getUserInitials()}
                                        </div>
                                    )}
                                    <span className="hidden text-sm font-medium text-gray-700 lg:block">
                                        {me?.fullName}
                                    </span>
                                </button>

                                {/* Dropdown Menu */}
                                {userMenuOpen && (
                                    <div className="absolute right-0 mt-2 w-48 rounded-lg bg-white py-2 shadow-lg ring-1 ring-black/5">
                                        <NavLink
                                            to="/settings"
                                            onClick={() => setUserMenuOpen(false)}
                                            className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                                        >
                                            <Settings className="mr-3 h-4 w-4" />
                                            Cài đặt
                                        </NavLink>
                                        <hr className="my-1 border-gray-100" />
                                        <button
                                            onClick={handleLogout}
                                            className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                                        >
                                            <LogOut className="mr-3 h-4 w-4" />
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Navigation */}
                {mobileMenuOpen && (
                    <div className="border-t border-gray-200 bg-white lg:hidden">
                        <nav className="space-y-1 px-4 py-4">
                            {navigationItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setMobileMenuOpen(false)}
                                    className={({ isActive }) =>
                                        `flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                                            isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </div>
                )}
            </header>

            {/* Main Content Area */}
            <div className="mx-auto max-w-7xl">
                <div className="flex">
                    {/* Left Sidebar - Desktop Only */}
                    <aside className="hidden w-64 shrink-0 lg:block">
                        <nav className="sticky top-20 space-y-1 p-4">
                            <div className="mb-4 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                                Quá trình tự học
                            </div>
                            {navigationItems.map((item) => (
                                <NavLink
                                    key={item.path}
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `flex items-center rounded-md px-4 py-2.5 text-sm font-medium transition-colors ${
                                            isActive ? 'bg-gray-200 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                                        }`
                                    }
                                >
                                    <item.icon className="mr-3 h-5 w-5" />
                                    {item.name}
                                </NavLink>
                            ))}
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="min-h-[calc(100vh-4rem)] flex-1 px-4 py-6 sm:px-6 lg:px-8">{children}</main>
                </div>
            </div>
        </div>
    );
}
