import React, { useState, useEffect } from 'react';
import { Play, FileText } from 'lucide-react';
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

    // Fetch classes based on role
    useEffect(() => {
        const fetchClasses = async () => {
            if (!userProfile) return;

            try {
                setIsLoading(true);
                
                // Check if user is SUPER_ADMIN
                const isSuperAdmin = userProfile.roles.some(role => role.code === 'SUPER_ADMIN');
                
                let endpoint = '/api/classes';
                
                // Nếu không phải SUPER_ADMIN, chỉ lấy lớp được gán cho giảng viên
                if (!isSuperAdmin && userProfile.userId) {
                    endpoint = `/api/lecturers/${userProfile.userId}/classes`;
                }
                
                const response = await http.get(endpoint);
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
    }, [userProfile]);

    // Fetch modules when class changes
    useEffect(() => {
        const fetchModules = async () => {
            if (!selectedClass) {
                setModules([]);
                return;
            }

            // TODO: Backend API /api/classes/{id}/modules chưa implement
            // Tạm thời dùng mock data
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

            /* API call - sẽ enable sau khi backend implement
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
            }
            */
        };

        fetchModules();
    }, [selectedClass]);

    const handleModuleStart = async (moduleId: number) => {
        // TODO: Backend API chưa implement
        showErrorToast('Chức năng chưa khả dụng', 'API bắt đầu module chưa được implement');
        return;
        
        /* API call - sẽ enable sau khi backend implement
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
        */
    };

    const handleModuleComplete = async (moduleId: number) => {
        // TODO: Backend API chưa implement
        showErrorToast('Chức năng chưa khả dụng', 'API kết thúc module chưa được implement');
        return;
        
        /* API call - sẽ enable sau khi backend implement
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
        */
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">Đang tải dữ liệu...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-lg font-semibold">Giảng dạy & Tương tác</h1>
                    <p className="text-xs text-gray-500">Quản lý tiến độ module và nhật ký lớp học</p>
                </div>
            </div>

            {/* Tabs Navigation */}
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

            {/* Class Selection Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <label className="block text-sm font-medium text-gray-900 mb-3">Lớp học đang giảng dạy</label>
                <select
                    value={selectedClass?.classId || ''}
                    onChange={(e) => {
                        const classId = parseInt(e.target.value);
                        const classItem = classes.find(c => c.classId === classId);
                        setSelectedClass(classItem || null);
                    }}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                    {classes.map((classItem) => (
                        <option key={classItem.classId} value={classItem.classId}>
                            {classItem.name} - {classItem.programName}
                        </option>
                    ))}
                </select>
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
                <ClassLogTab selectedClass={selectedClass} />
            )}
        </div>
    );
};

export default TeachingInteractionPage;