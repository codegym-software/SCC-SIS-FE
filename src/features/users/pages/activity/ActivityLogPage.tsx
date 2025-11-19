import React, { useEffect, useState } from 'react';
import { notificationsApi } from '@/shared/api/notifications';
import type { NotificationItem, NotificationType } from '@/shared/api/notifications';
import { useCenterSelection } from '@/stores/centerSelection';
import { Clock, Filter, Bell } from 'lucide-react';

const typeLabels: Record<NotificationType, string> = {
    STUDENT_WARNING: 'Cảnh báo học viên',
    GRADE_UPDATE: 'Cập nhật điểm',
    SYSTEM_ANNOUNCEMENT: 'Thông báo hệ thống',
    CLASS_ACTIVITY: 'Hoạt động lớp học',
    ATTENDANCE_ALERT: 'Cảnh báo điểm danh',
    ACTION_REQUIRED: 'Yêu cầu xử lý',
};

export default function ActivityLogPage() {
    const centerId = useCenterSelection((s) => s.selectedCenterId);
    const [loading, setLoading] = useState(false);
    const [items, setItems] = useState<NotificationItem[]>([]);
    const [filterType, setFilterType] = useState<NotificationType | 'ALL'>('ALL');
    const [showUnreadOnly, setShowUnreadOnly] = useState(false);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            const res = await notificationsApi.fetchNotifications(centerId);
            setItems(
                res.notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
            );
            setLoading(false);
        };
        load();
    }, [centerId]);

    const filtered = items.filter((i) => {
        if (filterType !== 'ALL' && i.type !== filterType) return false;
        if (showUnreadOnly && !i.unread) return false;
        return true;
    });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center gap-2">
                    <Bell className="text-blue-600" size={24} /> Activity Log
                </h1>
                <div className="flex items-center gap-3">
                    <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value as any)}
                        className="border rounded-md text-sm px-2 py-1"
                    >
                        <option value="ALL">Tất cả loại</option>
                        {Object.entries(typeLabels).map(([t, l]) => (
                            <option key={t} value={t}>
                                {l}
                            </option>
                        ))}
                    </select>
                    <label className="flex items-center gap-1 text-xs text-gray-600">
                        <input
                            type="checkbox"
                            checked={showUnreadOnly}
                            onChange={(e) => setShowUnreadOnly(e.target.checked)}
                        />
                        Chưa đọc
                    </label>
                </div>
            </div>

            {loading && <div className="text-sm text-gray-500">Đang tải...</div>}
            {!loading && filtered.length === 0 && <div className="text-sm text-gray-500">Không có hoạt động nào.</div>}

            <ul className="space-y-4">
                {filtered.map((item) => {
                    const time = new Date(item.createdAt);
                    const timeStr = time.toLocaleString();
                    return (
                        <li
                            key={item.id}
                            className="relative bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                                            {typeLabels[item.type]}
                                        </span>
                                        {item.unread && (
                                            <span className="text-[10px] font-semibold text-red-600">CHƯA ĐỌC</span>
                                        )}
                                    </div>
                                    <h2 className="text-sm font-medium text-gray-900 line-clamp-1">{item.title}</h2>
                                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">{item.message}</p>
                                    {item.severity && (
                                        <div className="mt-2 text-[11px] font-medium text-gray-500">
                                            Độ ưu tiên: {item.severity}
                                        </div>
                                    )}
                                </div>
                                <div className="flex flex-col items-end gap-1 text-right">
                                    <div className="flex items-center gap-1 text-[11px] text-gray-500">
                                        <Clock size={12} />
                                        {timeStr}
                                    </div>
                                    {item.relatedId && (
                                        <button
                                            onClick={() => console.log('Navigate to related', item.relatedId)}
                                            className="text-[11px] text-blue-600 hover:text-blue-700"
                                        >
                                            Chi tiết
                                        </button>
                                    )}
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
