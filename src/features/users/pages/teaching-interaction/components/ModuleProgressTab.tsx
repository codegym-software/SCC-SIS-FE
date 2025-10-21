import React from 'react';
import { Play, Square, AlertCircle } from 'lucide-react';

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

interface ModuleProgressTabProps {
    selectedClass: Class | null;
    modules: Module[];
    onModuleStart: (moduleId: number) => void;
    onModuleComplete: (moduleId: number) => void;
}

const ModuleProgressTab: React.FC<ModuleProgressTabProps> = ({
    selectedClass,
    modules,
    onModuleStart,
    onModuleComplete
}) => {
    const getStatusBadge = (module: Module) => {
        switch (module.status) {
            case 'IN_PROGRESS':
                return (
                    <div className="flex gap-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            <Play size={12} className="mr-1" />
                            Đang học
                        </span>
                        {module.isCurrent && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Module hiện tại
                            </span>
                        )}
                    </div>
                );
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <Square size={12} className="mr-1" />
                        Hoàn thành
                    </span>
                );
            case 'NOT_STARTED':
            default:
                return (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        <AlertCircle size={12} className="mr-1" />
                        Chưa bắt đầu
                    </span>
                );
        }
    };

    const getActionButton = (module: Module) => {
        switch (module.status) {
            case 'IN_PROGRESS':
                return (
                    <button
                        onClick={() => onModuleComplete(module.moduleId)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Square size={14} className="mr-1" />
                        Kết thúc
                    </button>
                );
            case 'NOT_STARTED':
                return (
                    <button
                        onClick={() => onModuleStart(module.moduleId)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        <Play size={14} className="mr-1" />
                        Bắt đầu
                    </button>
                );
            case 'COMPLETED':
                return (
                    <span className="text-sm text-gray-500 italic">Đã hoàn thành</span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">
                    Tiến độ Module - {selectedClass?.name}
                </h2>
                <p className="text-sm text-gray-600 mt-1">
                    Quản lý việc bắt đầu và kết thúc từng module trong chương trình học.
                </p>
            </div>

            {/* Modules List */}
            <div className="divide-y divide-gray-200">
                {modules.map((module, index) => (
                    <div key={module.moduleId} className="px-6 py-6">
                        <div className="flex items-start justify-between">
                            {/* Module Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-4 mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-lg font-medium text-gray-900">{module.name}</h3>
                                        <p className="text-sm text-gray-500">{module.code}</p>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="mb-4">
                                    {getStatusBadge(module)}
                                </div>

                                {/* Progress Bar */}
                                {module.status === 'IN_PROGRESS' && (
                                    <div className="mb-4">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-medium text-gray-700">
                                                Tiến độ {module.progress}%
                                            </span>
                                            <span className="text-sm text-gray-500">{module.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                style={{ width: `${module.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Module Dates */}
                                <div className="text-sm text-gray-600 space-y-1">
                                    {module.startDate && (
                                        <p>Bắt đầu: {new Date(module.startDate).toLocaleDateString('vi-VN')}</p>
                                    )}
                                    {module.endDate && (
                                        <p>Kết thúc: {new Date(module.endDate).toLocaleDateString('vi-VN')}</p>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="ml-6 flex-shrink-0">
                                {getActionButton(module)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {modules.length === 0 && (
                <div className="px-6 py-12 text-center">
                    <div className="text-gray-400 mb-4">
                        <Play size={48} className="mx-auto" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có module nào</h3>
                    <p className="text-gray-600">Lớp học này chưa có module được thiết lập.</p>
                </div>
            )}
        </div>
    );
};

export default ModuleProgressTab;