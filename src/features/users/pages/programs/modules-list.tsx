import { FolderOpen, Clock, GraduationCap, FileText } from 'lucide-react';
import { useMemo } from 'react';
import ProgramActions from './components/actions';

type Module = {
    id: string;
    name: string;
    moduleId: string;
    field: string;
    credits: number;
    duration: string;
    prerequisite: string;
    syllabus: 'Có' | 'Chưa có';
    status: 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành';
};

interface ModulesListProps {
    modules: Module[];
    query: string;
    statusFilter: string;
    onView: (module: Module) => void;
    onEdit: (module: Module) => void;
    onDelete: (module: Module) => void;
    onCreate: () => void;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const ModulesList: React.FC<ModulesListProps> = ({ 
    modules, 
    query, 
    statusFilter, 
    onView, 
    onEdit, 
    onDelete, 
    onCreate,
    currentPage,
    itemsPerPage,
    onPageChange
}) => {
    const filtered = useMemo(() => {
        let result = modules.filter(
            (m) =>
                m.name.toLowerCase().includes(query.toLowerCase()) ||
                m.moduleId.toLowerCase().includes(query.toLowerCase()) ||
                m.field.toLowerCase().includes(query.toLowerCase()),
        );

        if (statusFilter !== 'Tất cả') {
            result = result.filter((m) => m.status === statusFilter);
        }

        return result;
    }, [modules, query, statusFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedModules = filtered.slice(startIndex, endIndex);

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            {/* Header card */}
            <div className="px-3 py-3 border-b flex items-start gap-2">
                <div>
                    <div className="text-sm font-medium">Danh sách Module</div>
                    <div className="text-xs text-gray-500">
                        Quản lý tất cả module học trong hệ thống ({modules.length} module)
                    </div>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 text-white text-xs px-2.5 py-1.5 hover:bg-black"
                    >
                        <span>Tạo module mới</span>
                    </button>
                </div>
            </div>

            <div className="px-3 py-2 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                <div className="flex gap-2 w-full md:max-w-xl">
                    <input
                        value={query}
                        onChange={(e) => {
                            // This will be handled by parent component
                        }}
                        className="flex-1 h-8 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Tìm kiếm module..."
                        readOnly
                    />
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            // This will be handled by parent component
                        }}
                        className="h-8 rounded-md border px-2 text-sm"
                        disabled
                    >
                        <option>Tất cả</option>
                        <option>Hoạt động</option>
                        <option>Tạm dừng</option>
                        <option>Hoàn thành</option>
                    </select>
                </div>
            </div>

            {/* Header columns */}
            <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
                <div className="col-span-4">Module</div>
                <div className="col-span-2">Danh mục</div>
                <div className="col-span-2">Thời gian</div>
                <div className="col-span-2">Tín chỉ</div>
                <div className="col-span-1">Trạng thái</div>
                <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
                {paginatedModules.map((module) => (
                    <div
                        key={module.id}
                        className="px-3 py-3 pr-12 grid grid-cols-12 gap-3 items-center border-t first:border-t-0 relative"
                    >
                        <div className="col-span-12 md:col-span-4">
                            <div className="flex items-start gap-3">
                                <div>
                                    <div className="text-sm font-medium">{module.name}</div>
                                    <div className="text-xs text-gray-500">ID: {module.moduleId}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                                            {module.field}
                                        </span>
                                        {module.syllabus === 'Có' && (
                                            <span className="px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs">
                                                <FileText size={10} className="inline mr-1" />
                                                Có giáo trình
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-2">
                            <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                                {module.field}
                            </span>
                        </div>
                        <div className="col-span-12 md:col-span-2">
                            <div className="flex items-center gap-1 text-sm">
                                <Clock size={14} className="text-gray-500" />
                                {module.duration}
                            </div>
                        </div>
                        <div className="col-span-6 md:col-span-2 text-sm flex items-center gap-1">
                            <GraduationCap size={14} className="text-gray-500" />
                            {module.credits} tín chỉ
                        </div>
                        <div className="col-span-6 md:col-span-1">
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    module.status === 'Hoạt động'
                                        ? 'bg-green-50 text-green-700'
                                        : module.status === 'Tạm dừng'
                                          ? 'bg-yellow-50 text-yellow-700'
                                          : 'bg-gray-50 text-gray-700'
                                }`}
                            >
                                {module.status}
                            </span>
                        </div>
                        <div className="col-span-6 md:col-span-1">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40">
                                <ProgramActions
                                    onView={() => onView(module)}
                                    onEdit={() => onEdit(module)}
                                    onDelete={() => onDelete(module)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="px-3 py-3 border-t flex items-center justify-between text-sm text-gray-500">
                    <div>
                        Hiển thị {startIndex + 1} - {Math.min(endIndex, filtered.length)} trong số {filtered.length} kết quả
                    </div>
                    <div className="flex items-center gap-2">
                        <button 
                            onClick={() => onPageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => onPageChange(page)}
                                className={`h-8 px-3 rounded-md text-sm ${
                                    currentPage === page 
                                        ? 'bg-gray-900 text-white' 
                                        : 'border bg-white hover:bg-gray-50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
                        
                        <button 
                            onClick={() => onPageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
};

export default ModulesList;

