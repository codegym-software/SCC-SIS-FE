import React from 'react';
import { Search, Filter, Upload, Plus } from 'lucide-react';

interface StudentSearchProps {
    query: string;
    onQueryChange: (query: string) => void;
    statusFilter: string;
    onStatusFilterChange: (filter: string) => void;
    programFilter: string;
    onProgramFilterChange: (filter: string) => void;
    onCreate: () => void;
    onImport: () => void;
}

const StudentSearch: React.FC<StudentSearchProps> = ({
    query,
    onQueryChange,
    statusFilter,
    onStatusFilterChange,
    programFilter,
    onProgramFilterChange,
    onCreate,
    onImport
}) => {
    return (
        <div className="space-y-4">
            {/* Search and Filter Row */}
            <div className="flex items-center gap-4">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => onQueryChange(e.target.value)}
                        className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-200"
                        placeholder="Tìm kiếm theo tên, email, mã SV..."
                    />
                </div>

                {/* Status Filter */}
                <div className="relative">
                    <select
                        value={statusFilter}
                        onChange={(e) => onStatusFilterChange(e.target.value)}
                        className="h-9 px-3 pr-8 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-200 appearance-none bg-white"
                    >
                        <option>Tất cả trạng thái</option>
                        <option>Đang học</option>
                        <option>Bảo lưu</option>
                        <option>Tốt nghiệp</option>
                        <option>Tạm dừng</option>
                    </select>
                    <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>

                {/* Program Filter */}
                <div className="relative">
                    <select
                        value={programFilter}
                        onChange={(e) => onProgramFilterChange(e.target.value)}
                        className="h-9 px-3 pr-8 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-200 appearance-none bg-white"
                    >
                        <option>Tất cả chương trình</option>
                        <option>Công nghệ Thông tin</option>
                        <option>Digital Marketing</option>
                        <option>Thiết kế Đồ họa</option>
                        <option>Kế toán</option>
                    </select>
                    <Filter size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
            </div>

            {/* Action Buttons Row */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <button
                        onClick={onImport}
                        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        <Upload size={16} />
                        Import Excel
                    </button>
                </div>

                <button
                    onClick={onCreate}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-black"
                >
                    <Plus size={16} />
                    Thêm Học viên mới
                </button>
            </div>
        </div>
    );
};

export default StudentSearch;
