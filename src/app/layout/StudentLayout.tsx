import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { BookOpen, Bell, Settings, LogOut, Search, Menu, X } from 'lucide-react';
import { keycloak } from '../../keycloak';
import { useUserProfile } from '../../stores/userProfile';
import { getMyClasses, type ClassDto } from '@/shared/api/classes';

type StudentLayoutProps = {
    children: React.ReactNode;
};

export default function StudentLayout({ children }: StudentLayoutProps) {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [userAvatar, setUserAvatar] = useState<string | null>(null);
    const [classes, setClasses] = useState<ClassDto[]>([]);
    const [loadingClasses, setLoadingClasses] = useState(false);
    const { me, loading } = useUserProfile();
    const navigate = useNavigate();

    // Load user avatar
    useEffect(() => {
        const savedAvatar = localStorage.getItem('userAvatar');
        if (savedAvatar) {
            setUserAvatar(savedAvatar);
        }
    }, []);

    // Load classes for sidebar
    useEffect(() => {
        if (me?.userId) {
            loadClasses();
        }
    }, [me?.userId]);

    const loadClasses = async () => {
        try {
            setLoadingClasses(true);
            const response = await getMyClasses();
            setClasses(response.data);
        } catch (error) {
            console.error('Error loading classes for sidebar:', error);
        } finally {
            setLoadingClasses(false);
        }
    };

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

    const navigationItems = [{ name: 'Lớp học của tôi', path: '/my-classes', icon: BookOpen }];

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
            {/* Top Navigation Bar */}
            <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-50 to-cyan-50 shadow-sm backdrop-blur-sm bg-opacity-95">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="flex h-16 items-center justify-between">
                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            className="mr-4 rounded-lg p-2 hover:bg-gray-100 lg:hidden"
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>

                        {/* Logo and Brand - Centered */}
                        <div className="flex-1 flex justify-center">
                            <button
                                onClick={() => navigate('/my-classes')}
                                className="group flex items-center space-x-3 rounded-md px-3 py-1.5 transition-colors hover:bg-white/50"
                                aria-label="Trang chủ Education Management"
                            >
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 text-white shadow-md transition-all group-hover:shadow-xl group-hover:from-purple-600 group-hover:to-pink-500 group-hover:scale-110">
                                    <span className="text-xl font-bold">EM</span>
                                </div>
                                <div className="text-left">
                                    <div className="text-lg font-bold tracking-tight text-gray-900 group-hover:text-blue-600 transition-colors">
                                        Education Management
                                    </div>
                                    <div className="text-xs text-gray-500 group-hover:text-blue-500 transition-colors">
                                        Student Portal
                                    </div>
                                </div>
                            </button>
                        </div>

                        {/* Right Side Actions */}
                        <div className="flex items-center space-x-3">
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
                    <div className="border-t border-blue-100 bg-white/95 backdrop-blur-sm lg:hidden">
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
            <div className="mx-auto max-w-[1600px] px-4">
                <div className="flex">
                    {/* Left Sidebar - Desktop Only - Increased width */}
                    <aside className="hidden w-80 shrink-0 border-r border-blue-100 bg-white/50 backdrop-blur-sm lg:block">
                        <nav className="sticky top-20 space-y-8 p-8">
                            {/* User Profile Section */}
                            <div className="space-y-5">
                                <div className="flex items-center gap-4">
                                    {userAvatar ? (
                                        <img
                                            src={userAvatar}
                                            alt="Avatar"
                                            className="h-16 w-16 rounded-full object-cover ring-2 ring-blue-200"
                                        />
                                    ) : (
                                        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 text-xl font-bold text-white ring-2 ring-blue-200 shadow-md">
                                            {getUserInitials()}
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <p className="text-base font-bold text-gray-900 truncate">
                                            {me?.fullName || 'Student'}
                                        </p>
                                        <p className="text-sm text-gray-500 mt-0.5">Học viên</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/settings')}
                                    className="w-full rounded-lg border border-purple-200 bg-purple-50 px-5 py-2.5 text-sm font-medium text-purple-700 transition hover:bg-purple-100"
                                >
                                    Chỉnh sửa hồ sơ
                                </button>
                            </div>

                            {/* Navigation Links */}
                            <div>
                                <h4 className="mb-4 px-4 text-xs font-bold uppercase tracking-wider text-gray-500">
                                    Học tập
                                </h4>
                                <div className="space-y-2">
                                    <NavLink
                                        to="/my-classes"
                                        className={({ isActive }) =>
                                            `flex items-center rounded-xl px-4 py-3 text-base font-semibold transition-all ${
                                                isActive
                                                    ? 'bg-blue-50 text-blue-700 shadow-sm'
                                                    : 'text-gray-700 hover:bg-gray-50'
                                            }`
                                        }
                                    >
                                        <BookOpen className="mr-4 h-6 w-6" />
                                        Lớp học của tôi
                                    </NavLink>
                                </div>
                            </div>
                        </nav>
                    </aside>

                    {/* Main Content */}
                    <main className="min-h-[calc(100vh-4rem)] flex-1 px-6 py-8 sm:px-8 lg:px-12 relative">
                        {/* Decorative Elements */}
                        <div className="absolute top-10 right-10 w-64 h-64 bg-blue-200/20 rounded-full blur-3xl pointer-events-none"></div>
                        <div className="absolute bottom-20 left-10 w-48 h-48 bg-cyan-200/20 rounded-full blur-3xl pointer-events-none"></div>

                        {/* Content */}
                        <div className="relative z-10">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}
