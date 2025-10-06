import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

interface SearchProps {
    query: string;
    onQueryChange: (query: string) => void;
}

const SearchBar: React.FC<SearchProps> = ({ 
    query, 
    onQueryChange
}) => {
    return (
        <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-grow">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    value={query}
                    onChange={(e) => onQueryChange(e.target.value)}
                    className="w-full bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-gray-500 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all duration-200"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                />
            </div>
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg px-4 py-2 w-full sm:w-auto md:w-52 text-sm">
                <span>Tất cả trung tâm</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </div>
            <div className="flex items-center justify-between bg-white/80 backdrop-blur-sm border border-gray-200/50 rounded-lg px-4 py-2 w-full sm:w-auto md:w-52 text-sm">
                <span>Tất cả vai trò</span>
                <ChevronDown className="w-4 h-4 opacity-50" />
            </div>
        </div>
    );
};

export default SearchBar;
