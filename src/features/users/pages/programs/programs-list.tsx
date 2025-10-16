import { BookOpen, Calendar, Clock } from 'lucide-react';
import { useMemo } from 'react';
import ProgramActions from './components/actions';
import type { Program as ProgramDto } from '../../../../shared/api/programs';

type Program = ProgramDto;

interface ProgramsListProps {
    programs: Program[];
    query: string;
    categoryFilter: string;
    statusFilter: string;
    onView: (program: Program) => void;
    onEdit: (program: Program) => void;
    onDelete: (program: Program) => void;
    onCreate: () => void;
    currentPage: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
}

const ProgramsList: React.FC<ProgramsListProps> = ({ 
    programs, 
    query, 
    categoryFilter, 
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
        let result = programs.filter(
            (p) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                (p.description && p.description.toLowerCase().includes(query.toLowerCase())) ||
                p.categoryCode.toLowerCase().includes(query.toLowerCase()),
        );

        if (categoryFilter !== 'Tất cả') {
            result = result.filter((p) => p.categoryCode === categoryFilter);
        }

        if (statusFilter !== 'Tất cả') {
            if (statusFilter === 'Đang hoạt động') {
                result = result.filter((p) => p.isActive === true);
            } else {
                result = result.filter((p) => p.isActive === false);
            }
        }

        return result;
    }, [programs, query, categoryFilter, statusFilter]);

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedPrograms = filtered.slice(startIndex, endIndex);

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            {/* Header card */}
            <div className="px-3 py-3 border-b flex items-start gap-2">
                <div>
                    <div className="text-sm font-medium">Danh sách Chương trình</div>
                    <div className="text-xs text-gray-500">
                        Quản lý tất cả chương trình đào tạo trong hệ thống ({programs.length} chương trình)
                    </div>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black"
                    >
                        <span>Tạo chương trình mới</span>
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
                        className="flex-1 h-8 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                        placeholder="Tìm kiếm chương trình..."
                        readOnly
                    />
                    <select
                        value={categoryFilter}
                        onChange={(e) => {
                            // This will be handled by parent component
                        }}
                        className="h-8 rounded-md border px-2 text-sm"
                        disabled
                    >
                        <option>Tất cả</option>
                        <option>Kỹ thuật</option>
                        <option>Lập trình</option>
                        <option>Thiết kế</option>
                        <option>Kinh doanh</option>
                    </select>
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            // This will be handled by parent component
                        }}
                        className="h-8 rounded-md border px-2 text-sm"
                        disabled
                    >
                        <option>Tất cả</option>
                        <option>Đang hoạt động</option>
                        <option>Tạm dừng</option>
                        <option>Hoàn thành</option>
                    </select>
                </div>
            </div>

            {/* Header columns */}
            <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-8 gap-3">
                <div className="col-span-4">Chương trình</div>
                <div className="col-span-2">Tổng thời lượng</div>
                <div className="col-span-1">Trạng thái</div>
                <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
                {paginatedPrograms.map((program) => (
                    <div
                        key={program.programId}
                        className="px-3 py-3 pr-12 grid grid-cols-8 gap-3 items-center border-t first:border-t-0 relative"
                    >
                        <div className="col-span-12 md:col-span-4">
                            <div className="flex items-start gap-3">
                                <div>
                                    <div className="text-sm font-medium">{program.name}</div>
                                    <div className="text-xs text-gray-500">{program.description || 'Không có mô tả'}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 text-xs">
                                            {program.categoryCode}
                                        </span>
                                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">
                                            {program.deliveryMode}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-2">
                            <div className="flex items-center gap-1 text-sm">
                                <Clock size={14} className="text-gray-500" />
                                {program.durationHours} giờ
                            </div>
                        </div>
                        <div className="col-span-6 md:col-span-1">
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    program.isActive
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-50 text-gray-700'
                                }`}
                            >
                                {program.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                            </span>
                        </div>
                        <div className="col-span-6 md:col-span-1">
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40">
                                <ProgramActions
                                    onView={() => onView(program)}
                                    onEdit={() => onEdit(program)}
                                    onDelete={() => onDelete(program)}
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

export default ProgramsList;

