import React, { useEffect, useState } from 'react';
import { useCenterSelection } from '@/stores/centerSelection';
import { listActiveCenters } from '@/shared/api/centers';
import { Building2, ChevronDown } from 'lucide-react';

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
                // If nothing selected yet, pick first
                if (!selectedCenterId && mapped.length > 0) {
                    setCenter(mapped[0].id, mapped[0].name);
                }
            } catch (err) {
                console.error('Load centers failed', err);
            } finally {
                setLoading(false);
            }
        };
        loadCenters();
    }, [selectedCenterId, setCenter]);

    const currentLabel = selectedCenterName || 'Tất cả trung tâm';

    return (
        <div className="relative inline-block text-left">
            <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                className="flex items-center gap-3 px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-blue-400 hover:shadow-md transition-colors min-w-[220px]"
            >
                <Building2 size={18} className="text-blue-600" />
                <div className="flex-1 text-left">
                    <div className="text-sm font-semibold text-gray-900 line-clamp-1">{currentLabel}</div>
                    <div className="text-xs text-gray-500 line-clamp-1">
                        {loading ? 'Đang tải...' : 'Chọn trung tâm'}
                    </div>
                </div>
                <ChevronDown size={16} className={`text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>
            {open && (
                <div className="absolute z-40 mt-2 w-[260px] bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden">
                    <div className="max-h-80 overflow-y-auto divide-y divide-gray-100">
                        {centers.map((c) => {
                            const active = c.id === selectedCenterId;
                            return (
                                <button
                                    key={c.id}
                                    onClick={() => {
                                        setCenter(c.id, c.name);
                                        setOpen(false);
                                    }}
                                    className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-blue-50 transition-colors ${active ? 'bg-blue-50' : ''}`}
                                >
                                    <Building2
                                        size={18}
                                        className={`mt-1 ${active ? 'text-blue-600' : 'text-gray-400'}`}
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-sm font-medium ${active ? 'text-blue-700' : 'text-gray-900'} line-clamp-1`}
                                            >
                                                {c.name}
                                            </span>
                                            {active && (
                                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-semibold">
                                                    Đang chọn
                                                </span>
                                            )}
                                        </div>
                                        {c.city && <div className="text-xs text-gray-500 line-clamp-1">{c.city}</div>}
                                    </div>
                                </button>
                            );
                        })}
                        {centers.length === 0 && !loading && (
                            <div className="p-4 text-sm text-gray-500">Không có trung tâm khả dụng</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CenterSwitcher;
