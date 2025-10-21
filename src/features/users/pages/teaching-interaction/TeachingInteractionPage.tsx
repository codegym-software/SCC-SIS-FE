import React, { useState, useEffect } from 'react';
import { Play, Square, AlertCircle, Search, Plus, Calendar, Clock, FileText, BookOpen } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { useUserProfile } from '@/stores/userProfile';
import http from '@/shared/api/http';
import ModuleProgressTab from './components/ModuleProgressTab';
import ClassLogTab from './components/ClassLogTab';

type Class = {
    classId: number;
    name: string;
    programName: string;
    centerName: string;
    status: string;
};

type Module = {
    moduleId: number;
    name: string;
    code: string;
    status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number;
    startDate?: string;
    endDate?: string;
    isCurrent: boolean;
};

const TeachingInteractionPage: React.FC = () => {
    const { success: showSuccessToast, error: showErrorToast } = useToast();
    const { me: userProfile } = useUserProfile();
    const [selectedClass, setSelectedClass] = useState<Class | null>(null);
    const [classes, setClasses] = useState<Class[]>([]);
    const [modules, setModules] = useState<Module[]>([]);
    const [activeTab, setActiveTab] = useState<'progress' | 'log'>('progress');
    const [isLoading, setIsLoading] = useState(true);

    // Fetch classes
    useEffect(() => {
        const fetchClasses = async () => {
            try {
                setIsLoading(true);
                const response = await http.get('/api/classes');
                const classesData = response.data;
                
                const mappedClasses: Class[] = classesData.map((item: any) => ({
                    classId: item.classId,
                    name: item.name,
                    programName: item.programName,
                    centerName: item.centerName,
                    status: item.status
                }));

                setClasses(mappedClasses);
                
                // Set first class as default
                if (mappedClasses.length > 0) {
                    setSelectedClass(mappedClasses[0]);
                }
            } catch (error) {
                console.error('Error fetching classes:', error);
                showErrorToast('Lỗi tải dữ liệu', 'Không thể tải danh sách lớp học');
            } finally {
                setIsLoading(false);
            }
        };

        fetchClasses();
    }, []);

    // Fetch modules when class changes
    useEffect(() => {
        const fetchModules = async () => {
            if (!selectedClass) return;

            try {
                const response = await http.get(`/api/classes/${selectedClass.classId}/modules`);
                const modulesData = response.data;
                
                const mappedModules: Module[] = modulesData.map((item: any) => ({
                    moduleId: item.moduleId,
                    name: item.name,
                    code: item.code,
                    status: item.status,
                    progress: item.progress || 0,
                    startDate: item.startDate,
                    endDate: item.endDate,
                    isCurrent: item.isCurrent || false
                }));

                setModules(mappedModules);
            } catch (error) {
                console.error('Error fetching modules:', error);
                // Mock data for demonstration
                setModules([
                    {
                        moduleId: 1,
                        name: 'Lập trình Java Cơ bản',
                        code: 'JAVA101',
                        status: 'IN_PROGRESS',
                        progress: 65,
                        startDate: '2024-12-20',
                        isCurrent: true
                    },
                    {
                        moduleId: 2,
                        name: 'Lập trình Java Nâng cao',
                        code: 'JAVA201',
                        status: 'NOT_STARTED',
                        progress: 0,
                        isCurrent: false
                    }
                ]);
            }
        };

        fetchModules();
    }, [selectedClass]);

    const handleModuleStart = async (moduleId: number) => {
        try {
            await http.post(`/api/classes/${selectedClass?.classId}/modules/${moduleId}/start`);
            
            setModules(prev => prev.map(module => 
                module.moduleId === moduleId 
                    ? { ...module, status: 'IN_PROGRESS', startDate: new Date().toISOString().split('T')[0], isCurrent: true }
                    : { ...module, isCurrent: false }
            ));

            showSuccessToast('Bắt đầu module thành công', 'Module đã được bắt đầu');
        } catch (error) {
            console.error('Error starting module:', error);
            showErrorToast('Lỗi bắt đầu module', 'Không thể bắt đầu module');
        }
    };

    const handleModuleComplete = async (moduleId: number) => {
        try {
            await http.post(`/api/classes/${selectedClass?.classId}/modules/${moduleId}/complete`);
            
            setModules(prev => prev.map(module => 
                module.moduleId === moduleId 
                    ? { ...module, status: 'COMPLETED', endDate: new Date().toISOString().split('T')[0], progress: 100 }
                    : module
            ));

            showSuccessToast('Kết thúc module thành công', 'Module đã được hoàn thành');
        } catch (error) {
            console.error('Error completing module:', error);
            showErrorToast('Lỗi kết thúc module', 'Không thể kết thúc module');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Giảng dạy & Tương tác</h1>
                    </div>
                    <div className="text-right">
                        <p className="text-sm text-gray-600">Xin chào, {userProfile?.fullName || 'Người dùng'}</p>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="px-6 py-6">
                {/* Class Selection */}
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Lớp học:</label>
                    <select
                        value={selectedClass?.classId || ''}
                        onChange={(e) => {
                            const classId = parseInt(e.target.value);
                            const classItem = classes.find(c => c.classId === classId);
                            setSelectedClass(classItem || null);
                        }}
                        className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                        {classes.map((classItem) => (
                            <option key={classItem.classId} value={classItem.classId}>
                                {classItem.name}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Tabs */}
                <div className="mb-6">
                    <div className="flex space-x-2 bg-gray-100 p-2 rounded-lg w-full">
                        <button
                            onClick={() => setActiveTab('progress')}
                            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-md text-base font-medium transition-colors flex-1 ${
                                activeTab === 'progress'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <Play size={20} />
                            Tiến độ Module
                        </button>
                        <button
                            onClick={() => setActiveTab('log')}
                            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-md text-base font-medium transition-colors flex-1 ${
                                activeTab === 'log'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                            }`}
                        >
                            <FileText size={20} />
                            Nhật ký Lớp học
                        </button>
                    </div>
                </div>

                {/* Tab Content */}
                {activeTab === 'progress' && (
                    <ModuleProgressTab
                        selectedClass={selectedClass}
                        modules={modules}
                        onModuleStart={handleModuleStart}
                        onModuleComplete={handleModuleComplete}
                    />
                )}

                {activeTab === 'log' && (
                    <ClassLogTab
                        selectedClass={selectedClass}
                    />
                )}
            </div>
        </div>
    );
};

export default TeachingInteractionPage;