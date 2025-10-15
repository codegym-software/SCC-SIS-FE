import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    Shield,
    UserPlus,
    Settings,
    BookOpen,
    Sparkles,
} from 'lucide-react';

// Import components
import Stats from './components/stats';
import SystemStatus from './components/system-status';

export default function DashboardPage() {
    const [isLoaded, setIsLoaded] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

    useEffect(() => {
        setIsLoaded(true);
        
        // Load background image from settings
        const savedAppearance = localStorage.getItem('appearanceSettings');
        if (savedAppearance) {
            const parsed = JSON.parse(savedAppearance);
            if (parsed.backgroundImage) {
                setBackgroundImage(parsed.backgroundImage);
            }
        }
    }, []);

    // Listen for changes in appearance settings
    useEffect(() => {
        const handleStorageChange = () => {
            const savedAppearance = localStorage.getItem('appearanceSettings');
            if (savedAppearance) {
                const parsed = JSON.parse(savedAppearance);
                setBackgroundImage(parsed.backgroundImage || null);
            }
        };

        window.addEventListener('storage', handleStorageChange);
        return () => window.removeEventListener('storage', handleStorageChange);
    }, []);

    const stats = [
        {
            label: 'Tổng số Trung tâm',
            value: '12',
            sub: '8 đang hoạt động',
            change: '+2 tháng này',
            changeType: 'positive' as const,
            icon: Building2,
            iconColor: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50',
            glowColor: 'shadow-blue-200',
        },
        {
            label: 'Người dùng đang hoạt động',
            value: '1,847',
            sub: '+12% so với tháng trước',
            change: '+156 tuần này',
            changeType: 'positive' as const,
            icon: Users,
            iconColor: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-50 to-emerald-50',
            glowColor: 'shadow-green-200',
        },
        {
            label: 'Vai trò được định nghĩa',
            value: '8',
            sub: 'Giáo vụ, Giảng viên, Quản lý...',
            change: null,
            changeType: 'neutral' as const,
            icon: Shield,
            iconColor: 'from-purple-500 to-violet-500',
            bgGradient: 'from-purple-50 to-violet-50',
            glowColor: 'shadow-purple-200',
        },
    ];



    const systemServices = [
        {
            icon: Building2,
            label: 'Trung tâm',
            status: 'Hoạt động bình thường',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: Users,
            label: 'Người dùng',
            status: 'Hoạt động bình thường',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: BookOpen,
            label: 'Lớp học',
            status: 'Hoạt động bình thường',
            color: 'from-purple-500 to-violet-500',
        },
    ];

    return (
        <div 
            className="dashboard-container space-y-8 px-6 pt-6 pb-8 w-full relative m-0"
            style={{
                minHeight: '100vh',
                backgroundImage: backgroundImage ? `url(${backgroundImage})` : 'none',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundAttachment: 'fixed'
            }}
        >
            {/* Background Overlay */}
            {backgroundImage && (
                <div className="fixed inset-0 bg-black/20 pointer-events-none z-0"></div>
            )}
            
            {/* Content */}
            <div className="relative z-20">
                {/* Header */}
                <div className="flex items-center justify-between">
                <div className="space-y-1 relative z-30">
                    <h1 className="text-3xl font-bold text-gray-900 bg-white px-4 py-2 rounded-lg">Dashboard</h1>
                    <p className="text-gray-600 bg-white px-4 py-1 rounded-lg">Tổng quan hệ thống quản lý giáo dục</p>
                </div>
            </div>

            {/* Stats */}
            <div className="mb-12 relative z-20">
                <Stats stats={stats} isLoaded={isLoaded} />
            </div>


            {/* System Status */}
            <div className="mb-8 relative z-20">
                <SystemStatus services={systemServices} isLoaded={isLoaded} />
            </div>
            </div>
        </div>
    );
}
