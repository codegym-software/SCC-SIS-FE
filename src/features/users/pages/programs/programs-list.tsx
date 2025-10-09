import { BookOpen, Calendar, Clock } from 'lucide-react';
import { useMemo } from 'react';
import ProgramActions from './components/actions';

type Program = {
    id: string;
    name: string;
    description: string;
    category: string;
    duration: string;
    startDate: string;
    status: 'Đang hoạt động' | 'Tạm dừng' | 'Hoàn thành';
};

interface ProgramsListProps {
    programs: Program[];
    query: string;
    categoryFilter: string;
    statusFilter: string;
    onView: (program: Program) => void;
    onEdit: (program: Program) => void;
    onDelete: (program: Program) => void;
    onCreate: () => void;
}

const ProgramsList: React.FC<ProgramsListProps> = ({ 
    programs, 
    query, 
    categoryFilter, 
    statusFilter, 
    onView, 
    onEdit, 
    onDelete, 
    onCreate 
}) => {
    const filtered = useMemo(() => {
        let result = programs.filter(
            (p) =>
                p.name.toLowerCase().includes(query.toLowerCase()) ||
                p.description.toLowerCase().includes(query.toLowerCase()) ||
                p.category.toLowerCase().includes(query.toLowerCase()),
        );

        if (categoryFilter !== 'Tất cả') {
            result = result.filter((p) => p.category === categoryFilter);
        }

        if (statusFilter !== 'Tất cả') {
            result = result.filter((p) => p.status === statusFilter);
        }

        return result;
    }, [programs, query, categoryFilter, statusFilter]);

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            {/* Header card */}
            <div className="px-3 py-3 border-b flex items-start gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 grid place-items-center text-white flex-shrink-0">
                    <BookOpen size={16} />
                </div>
                <div>
                    <div className="text-sm font-medium">Danh sách Chương trình</div>
                    <div className="text-xs text-gray-500">
                        Quản lý tất cả chương trình đào tạo trong hệ thống ({programs.length} chương trình)
                    </div>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-1.5 rounded-md bg-purple-600 text-white text-xs px-2.5 py-1.5 hover:bg-purple-700"
                    >
                        <BookOpen size={16} /> <span>Tạo chương trình mới</span>
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
                        className="flex-1 h-8 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-purple-200"
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
                <div className="col-span-2">Thời gian</div>
                <div className="col-span-1">Trạng thái</div>
                <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
                {filtered.map((program) => (
                    <div
                        key={program.id}
                        className="px-3 py-3 pr-12 grid grid-cols-8 gap-3 items-center border-t first:border-t-0 relative"
                    >
                        <div className="col-span-12 md:col-span-4">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 grid place-items-center text-white flex-shrink-0">
                                    <BookOpen size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{program.name}</div>
                                    <div className="text-xs text-gray-500">{program.description}</div>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 text-xs">
                                            {program.category}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-2">
                            <div className="flex items-center gap-1 text-sm">
                                <Clock size={14} className="text-gray-500" />
                                {program.duration}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Calendar size={12} className="text-gray-400" />
                                {new Date(program.startDate).toLocaleDateString('vi-VN')}
                            </div>
                        </div>
                        <div className="col-span-6 md:col-span-1">
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    program.status === 'Đang hoạt động'
                                        ? 'bg-green-50 text-green-700'
                                        : program.status === 'Tạm dừng'
                                          ? 'bg-yellow-50 text-yellow-700'
                                          : 'bg-gray-50 text-gray-700'
                                }`}
                            >
                                {program.status}
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
            <div className="px-3 py-3 border-t flex items-center justify-between text-sm text-gray-500">
                <div>
                    Hiển thị 1 - {Math.min(5, filtered.length)} trong số {filtered.length} kết quả
                </div>
                <div className="flex items-center gap-2">
                    <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">
                        Previous
                    </button>
                    <button className="h-8 px-3 rounded-md bg-purple-600 text-white text-sm">1</button>
                    <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">2</button>
                    <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">Next</button>
                </div>
            </div>
        </section>
    );
};

export default ProgramsList;

