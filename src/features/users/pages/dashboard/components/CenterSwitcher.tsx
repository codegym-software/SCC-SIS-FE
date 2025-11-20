import React, { useEffect, useState, useRef } from 'react';
import { useCenterSelection } from '@/stores/centerSelection';
import { listActiveCenters } from '@/shared/api/centers';
import { Building2, ChevronDown, Check } from 'lucide-react';

interface CenterItem {
    id: number;
    name: string;
    city?: string | null;
}

const CenterSwitcher: React.FC = () => {
    const { selectedCenterId, selectedCenterName, setCenter } = useCenterSelection();
    const [centers, setCenters] = useState<CenterItem[]>([]);
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const loadCenters = async () => {
            setLoading(true);
            try {
                const res = await listActiveCenters();
                const data = res?.data as any;
                let items: any[] = [];
                if (Array.isArray(data)) items = data;
                else if (data?.items && Array.isArray(data.items)) items = data.items;
                else if (data?.content && Array.isArray(data.content)) items = data.content; // fallback shape
                const mapped: CenterItem[] = items.map((c) => ({
                    id: c.id ?? c.centerId ?? c.code ?? 0,
                    name: c.name ?? c.centerName ?? 'Trung tâm',
                    city: c.city ?? c.location ?? null,
                }));
                setCenters(mapped);
                // Default to "All centers" (null) if nothing selected yet
                // Don't auto-select first center
            } catch (err) {
                console.error('Load centers failed', err);
            } finally {
                setLoading(false);
            }
        };
        loadCenters();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    const currentLabel = selectedCenterName || 'Tất cả trung tâm';

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Trigger Button - Modern Design */}
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="group flex items-center gap-2.5 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 hover:border-blue-400 hover:shadow-md hover:shadow-blue-100/50 transition-all duration-200 min-w-[180px] md:min-w-[200px]"
            >
                {/* Icon with gradient background */}
                <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-transform duration-200">
                    <Building2 size={18} className="text-white" />
                </div>
                
                {/* Text Content - Hidden on small screens */}
                <div className="hidden md:flex flex-1 text-left min-w-0">
                    <div className="flex flex-col">
                        <span className="text-xs font-medium text-gray-500 mb-0.5">Trung tâm</span>
                        <span className="text-sm font-semibold text-gray-900 line-clamp-1">{currentLabel}</span>
                    </div>
                </div>
                
                {/* Chevron */}
                <ChevronDown 
                    size={16} 
                    className={`hidden md:block text-gray-600 transition-transform duration-200 ${open ? 'rotate-180' : ''}`} 
                />
            </button>

            {/* Dropdown Menu - Modern Design with Animation */}
            {open && (
                <>
                    {/* Backdrop for mobile */}
                    <div className="fixed inset-0 z-30 md:hidden" onClick={() => setOpen(false)} />
                    
                    {/* Dropdown */}
                    <div className="absolute right-0 z-40 mt-2 w-[280px] md:w-[320px] bg-white rounded-xl border border-gray-200 shadow-2xl shadow-blue-500/10 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Header */}
                        <div className="px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
                            <div className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                                <Building2 size={16} className="text-blue-600" />
                                <span>Chọn trung tâm</span>
                            </div>
                        </div>

                        {/* Centers List */}
                        <div className="max-h-[400px] overflow-y-auto">
                            {loading ? (
                                <div className="p-8 text-center">
                                    <div className="inline-block w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                    <p className="mt-3 text-sm text-gray-500">Đang tải...</p>
                                </div>
                            ) : centers.length > 0 ? (
                                <div className="p-2 space-y-1">
                                    {/* All Centers Option */}
                                    <button
                                        onClick={() => {
                                            setCenter(null, 'Tất cả trung tâm');
                                            setOpen(false);
                                        }}
                                        className={`w-full group px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-150 ${
                                            selectedCenterId === null
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-md' 
                                                : 'hover:bg-purple-50 text-gray-700'
                                        }`}
                                    >
                                        {/* Icon */}
                                        <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                            selectedCenterId === null
                                                ? 'bg-white/20' 
                                                : 'bg-gradient-to-br from-purple-100 to-pink-100 group-hover:from-purple-200 group-hover:to-pink-200'
                                        }`}>
                                            <Building2 size={18} className={selectedCenterId === null ? 'text-white' : 'text-purple-600'} />
                                        </div>

                                        {/* Center Info */}
                                        <div className="flex-1 text-left min-w-0">
                                            <div className={`text-sm font-semibold line-clamp-1 ${selectedCenterId === null ? 'text-white' : 'text-gray-900'}`}>
                                                Tất cả trung tâm
                                            </div>
                                            <div className={`text-xs line-clamp-1 mt-0.5 ${selectedCenterId === null ? 'text-purple-100' : 'text-gray-500'}`}>
                                                🌐 Xem tổng quan toàn hệ thống
                                            </div>
                                        </div>

                                        {/* Checkmark */}
                                        {selectedCenterId === null && (
                                            <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                <Check size={14} className="text-white" strokeWidth={3} />
                                            </div>
                                        )}
                                    </button>

                                    {/* Divider */}
                                    <div className="my-2 border-t border-gray-200"></div>

                                    {/* Individual Centers */}
                                    {centers.map((c) => {
                                        const active = c.id === selectedCenterId;
                                        return (
                                            <button
                                                key={c.id}
                                                onClick={() => {
                                                    setCenter(c.id, c.name);
                                                    setOpen(false);
                                                }}
                                                className={`w-full group px-3 py-2.5 rounded-lg flex items-center gap-3 transition-all duration-150 ${
                                                    active 
                                                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md' 
                                                        : 'hover:bg-blue-50 text-gray-700'
                                                }`}
                                            >
                                                {/* Icon */}
                                                <div className={`flex-shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
                                                    active 
                                                        ? 'bg-white/20' 
                                                        : 'bg-gradient-to-br from-blue-100 to-indigo-100 group-hover:from-blue-200 group-hover:to-indigo-200'
                                                }`}>
                                                    <Building2 size={18} className={active ? 'text-white' : 'text-blue-600'} />
                                                </div>

                                                {/* Center Info */}
                                                <div className="flex-1 text-left min-w-0">
                                                    <div className={`text-sm font-semibold line-clamp-1 ${active ? 'text-white' : 'text-gray-900'}`}>
                                                        {c.name}
                                                    </div>
                                                    {c.city && (
                                                        <div className={`text-xs line-clamp-1 mt-0.5 ${active ? 'text-blue-100' : 'text-gray-500'}`}>
                                                            📍 {c.city}
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Checkmark */}
                                                {active && (
                                                    <div className="flex-shrink-0 w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                                                        <Check size={14} className="text-white" strokeWidth={3} />
                                                    </div>
                                                )}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center">
                                    <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gray-100 flex items-center justify-center">
                                        <Building2 size={24} className="text-gray-400" />
                                    </div>
                                    <p className="text-sm text-gray-500">Không có trung tâm khả dụng</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default CenterSwitcher;
