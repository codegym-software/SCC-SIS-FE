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
                        <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
                            <Play size={12} className="mr-1" />
                            Đang học
                        </span>
                        {module.isCurrent && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                                Module hiện tại
                            </span>
                        )}
                    </div>
                );
            case 'COMPLETED':
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                        <Square size={12} className="mr-1" />
                        Hoàn thành
                    </span>
                );
            case 'NOT_STARTED':
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-200">
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
                        className="inline-flex items-center gap-2 rounded-lg bg-blue-600 text-white text-sm font-medium px-4 py-2 hover:bg-blue-700 focus:ring-2 focus:ring-blue-300 transition-colors"
                    >
                        <Square size={16} />
                        Kết thúc
                    </button>
                );
            case 'NOT_STARTED':
                return (
                    <button
                        onClick={() => onModuleStart(module.moduleId)}
                        className="inline-flex items-center gap-2 rounded-lg bg-green-600 text-white text-sm font-medium px-4 py-2 hover:bg-green-700 focus:ring-2 focus:ring-green-300 transition-colors"
                    >
                        <Play size={16} />
                        Bắt đầu
                    </button>
                );
            case 'COMPLETED':
                return (
                    <span className="text-sm text-gray-500 font-medium italic">Đã hoàn thành</span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-2xl border border-gray-200">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-sm font-semibold text-gray-900">
                    Tiến độ Module - {selectedClass?.name}
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                    Quản lý việc bắt đầu và kết thúc từng module trong chương trình học
                </p>
            </div>

            {/* Modules List */}
            <div className="divide-y divide-gray-200">
                {modules.map((module, index) => (
                    <div key={module.moduleId} className="px-6 py-5 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between gap-6">
                            {/* Module Info */}
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="flex-shrink-0">
                                        <div className="h-9 w-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-semibold">
                                            {index + 1}
                                        </div>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 truncate">{module.name}</h3>
                                        <p className="text-xs text-gray-500 mt-0.5">{module.code}</p>
                                    </div>
                                </div>

                                {/* Status Badges */}
                                <div className="mb-3">
                                    {getStatusBadge(module)}
                                </div>

                                {/* Progress Bar */}
                                {module.status === 'IN_PROGRESS' && (
                                    <div className="mb-3">
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-medium text-gray-700">
                                                Tiến độ
                                            </span>
                                            <span className="text-xs font-semibold text-gray-900">{module.progress}%</span>
                                        </div>
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div
                                                className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                                                style={{ width: `${module.progress}%` }}
                                            ></div>
                                        </div>
                                    </div>
                                )}

                                {/* Module Dates */}
                                <div className="text-xs text-gray-500 space-y-0.5">
                                    {module.startDate && (
                                        <p>Bắt đầu: <span className="font-medium text-gray-900">{new Date(module.startDate).toLocaleDateString('vi-VN')}</span></p>
                                    )}
                                    {module.endDate && (
                                        <p>Kết thúc: <span className="font-medium text-gray-900">{new Date(module.endDate).toLocaleDateString('vi-VN')}</span></p>
                                    )}
                                </div>
                            </div>

                            {/* Action Button */}
                            <div className="flex-shrink-0">
                                {getActionButton(module)}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Empty State */}
            {modules.length === 0 && (
                <div className="px-6 py-12 text-center">
                    <div className="text-gray-300 mb-3">
                        <Play size={40} className="mx-auto" strokeWidth={1.5} />
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-1">Chưa có module nào</h3>
                    <p className="text-xs text-gray-500">Lớp học này chưa có module được thiết lập</p>
                </div>
            )}
        </div>
    );
};

export default ModuleProgressTab;