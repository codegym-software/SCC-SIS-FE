import React, { useState, useEffect } from 'react';
import {
    Building2,
    Users,
    Shield,
    Activity,
    UserPlus,
    Settings,
    BookOpen,
    Sparkles,
    Zap,
    Star,
} from 'lucide-react';

// Import components
import Stats from './components/stats';
import QuickActions from './components/quick-actions';
import Activities from './components/activities';
import SystemStatus from './components/system-status';

export default function DashboardPage() {
    const [selectedPeriod, setSelectedPeriod] = useState('7 ngày qua');
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        setIsLoaded(true);
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
        {
            label: 'Hoạt động hôm nay',
            value: '342',
            sub: 'Đăng nhập trong 24h qua',
            change: '-8% so với hôm qua',
            changeType: 'negative' as const,
            icon: Activity,
            iconColor: 'from-orange-500 to-amber-500',
            bgGradient: 'from-orange-50 to-amber-50',
            glowColor: 'shadow-orange-200',
        },
    ];

    const activities = [
        {
            title: 'Tạo Trung tâm mới',
            desc: 'Trung tâm Hà Nội 3 đã được thêm vào hệ thống',
            time: '2 giờ trước',
            color: 'bg-sky-500',
            icon: Building2,
            type: 'center',
        },
        {
            title: 'Thêm người dùng',
            desc: '15 giảng viên mới được thêm vào hệ thống',
            time: '4 giờ trước',
            color: 'bg-emerald-500',
            icon: UserPlus,
            type: 'user',
        },
        {
            title: 'Cập nhật vai trò',
            desc: 'Gán quyền "Quản lý lớp học" cho vai trò Giảng viên',
            time: '6 giờ trước',
            color: 'bg-violet-500',
            icon: Settings,
            type: 'role',
        },
        {
            title: 'Tạo lớp học mới',
            desc: 'Lớp "Lập trình Java Cơ bản - K15" đã được tạo',
            time: '8 giờ trước',
            color: 'bg-orange-500',
            icon: BookOpen,
            type: 'class',
        },
        {
            title: 'Cập nhật hệ thống',
            desc: 'Phiên bản mới 2.1.0 đã được triển khai',
            time: '12 giờ trước',
            color: 'bg-indigo-500',
            icon: Sparkles,
            type: 'system',
        },
    ];

    const quickActions = [
        {
            label: 'Tạo Trung tâm',
            color: 'bg-gradient-to-br from-blue-500 to-cyan-500',
            icon: Building2,
            onClick: () => console.log('Navigate to create center'),
        },
        {
            label: 'Thêm Người dùng',
            color: 'bg-gradient-to-br from-green-500 to-emerald-500',
            icon: UserPlus,
            onClick: () => console.log('Navigate to create user'),
        },
        {
            label: 'Quản lý Vai trò',
            color: 'bg-gradient-to-br from-purple-500 to-violet-500',
            icon: Shield,
            onClick: () => console.log('Navigate to roles'),
        },
        {
            label: 'Tạo Lớp học',
            color: 'bg-gradient-to-br from-orange-500 to-amber-500',
            icon: BookOpen,
            onClick: () => console.log('Navigate to create class'),
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
        <div className="space-y-8 p-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-600">Tổng quan hệ thống quản lý giáo dục</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-gray-200 bg-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        <option value="7 ngày qua">7 ngày qua</option>
                        <option value="30 ngày qua">30 ngày qua</option>
                        <option value="3 tháng qua">3 tháng qua</option>
                        <option value="1 năm qua">1 năm qua</option>
                    </select>
                </div>
            </div>

            {/* Stats */}
            <Stats stats={stats} isLoaded={isLoaded} />

            {/* Quick Actions */}
            <QuickActions actions={quickActions} isLoaded={isLoaded} />

            {/* Activities */}
            <Activities activities={activities} isLoaded={isLoaded} />

            {/* System Status */}
            <SystemStatus services={systemServices} isLoaded={isLoaded} />
        </div>
    );
}
