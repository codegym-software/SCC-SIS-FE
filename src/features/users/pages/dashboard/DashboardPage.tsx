import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

// Import APIs
import { listActiveCenters } from '../../../../shared/api/centers';
import { listUserViews } from '../../../../shared/api/userViews';
import { getRoles } from '../../../../shared/api/roles';
import { useUserProfile } from '../../../../stores/userProfile';

export default function DashboardPage() {
    const navigate = useNavigate();
    const { me, loading: userLoading } = useUserProfile();
    
    // All hooks must be declared before any conditional returns
    const [isLoaded, setIsLoaded] = useState(false);
    const [backgroundImage, setBackgroundImage] = useState<string | null>(null);

    // State for API data
    const [centersCount, setCentersCount] = useState<number>(0);
    const [activeUsersCount, setActiveUsersCount] = useState<number>(0);
    const [rolesCount, setRolesCount] = useState<number>(0);
    
    // Redirect students and lecturers to their respective pages
    useEffect(() => {
        if (!userLoading && me) {
            const isStudent = me.roles?.some((role) => role.code === 'STUDENT') ?? false;
            const isLecturer = me.roles?.some((role) => role.code === 'LECTURER') ?? false;
            
            if (isStudent) {
                navigate('/my-classes', { replace: true });
            } else if (isLecturer) {
                navigate('/classes', { replace: true });
            }
        }
    }, [me, userLoading, navigate]);

    // Function to fetch dashboard data from APIs
    const fetchDashboardData = async () => {
        try {
            // Add a small delay to ensure authentication is ready
            await new Promise(resolve => setTimeout(resolve, 100));

            // Fetch centers count
            try {
                const centersResponse = await listActiveCenters();

                if (centersResponse && centersResponse.data) {
                    const data = centersResponse.data as any;

                    // Handle different response structures
                    let count = 0;
                    if (Array.isArray(data)) {
                        count = data.length;
                    } else if (data.items && Array.isArray(data.items)) {
                        count = data.items.length;
                    } else if (data.total !== undefined) {
                        count = data.total;
                    }

                    setCentersCount(count);
                } else {
                    setCentersCount(0);
                }
            } catch (centersError) {
                setCentersCount(0);
            }

            // Fetch users count
            try {
                const usersResponse = await listUserViews();

                if (usersResponse && usersResponse.data) {
                    const data = usersResponse.data as any;

                    // Handle different response structures like UsersPage does
                    let count = 0;
                    if (Array.isArray(data)) {
                        count = data.length;
                    } else if (data.items && Array.isArray(data.items)) {
                        count = data.items.length;
                    } else if (data.total !== undefined) {
                        count = data.total;
                    }

                    setActiveUsersCount(count);
                } else {
                    setActiveUsersCount(0);
                }
            } catch (usersError) {
                setActiveUsersCount(0);
            }

            // Fetch roles count
            try {
                const rolesResponse = await getRoles();

                if (rolesResponse && rolesResponse.data) {
                    const data = rolesResponse.data as any;

                    // Handle different response structures
                    let count = 0;
                    if (Array.isArray(data)) {
                        count = data.length;
                    } else if (data.items && Array.isArray(data.items)) {
                        count = data.items.length;
                    } else if (data.total !== undefined) {
                        count = data.total;
                    }

                    setRolesCount(count);
                } else {
                    setRolesCount(0);
                }
            } catch (rolesError) {
                setRolesCount(0);
            }

        } catch (error) {

            // Set default values in case of error (based on actual API responses)
            setCentersCount(5);
            setActiveUsersCount(20); // Updated to match UsersPage
            setRolesCount(7);
        }
    };


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

        // Fetch dashboard data from APIs
        fetchDashboardData();
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
            value: centersCount.toString(),
            sub: `${centersCount} trung tâm hoạt động`,
            change: null,
            changeType: 'neutral' as const,
            icon: Building2 as React.ComponentType<{ size?: number }>,
            iconColor: 'from-blue-500 to-cyan-500',
            bgGradient: 'from-blue-50 to-cyan-50',
            glowColor: 'shadow-blue-200',
        },
        {
            label: 'Người dùng đang hoạt động',
            value: activeUsersCount.toString(),
            sub: `${activeUsersCount} người dùng trong hệ thống`,
            change: null,
            changeType: 'neutral' as const,
            icon: Users as React.ComponentType<{ size?: number }>,
            iconColor: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-50 to-emerald-50',
            glowColor: 'shadow-green-200',
        },
        {
            label: 'Vai trò được định nghĩa',
            value: rolesCount.toString(),
            sub: `${rolesCount} vai trò trong hệ thống`,
            change: null,
            changeType: 'neutral' as const,
            icon: Shield as React.ComponentType<{ size?: number }>,
            iconColor: 'from-purple-500 to-violet-500',
            bgGradient: 'from-purple-50 to-violet-50',
            glowColor: 'shadow-purple-200',
        },
    ];



    const systemServices = [
        {
            icon: Building2 as React.ComponentType<{ size?: number }>,
            label: 'Trung tâm',
            status: 'Hoạt động bình thường',
            color: 'from-green-500 to-emerald-500',
        },
        {
            icon: Users as React.ComponentType<{ size?: number }>,
            label: 'Người dùng',
            status: 'Hoạt động bình thường',
            color: 'from-blue-500 to-cyan-500',
        },
        {
            icon: BookOpen as React.ComponentType<{ size?: number }>,
            label: 'Lớp học',
            status: 'Hoạt động bình thường',
            color: 'from-purple-500 to-violet-500',
        },
    ];

    // Show loading while checking user role
    if (userLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Đang tải...</p>
                </div>
            </div>
        );
    }

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
