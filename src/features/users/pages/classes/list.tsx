import { BookOpen, Calendar, MapPin } from 'lucide-react';
import { useMemo, useState } from 'react';
import ClassActions from '@/features/users/pages/classes/components/actions.tsx';

interface ClassListProps {
    classes: any[];
    statusFilter: string;
    query: string;
    setOpenAssignInstructor: (classItem: any) => void;
    onEdit?: (classItem: any) => void;
    onManageStudents?: (classItem: any) => void;
}

const ClassList: React.FC<ClassListProps> = ({ 
    classes, 
    statusFilter, 
    query, 
    setOpenAssignInstructor,
    onEdit,
    onManageStudents
}) => {
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);

    const filtered = useMemo(() => {
        let result = classes.filter(
            (c) =>
                c.name.toLowerCase().includes(query.toLowerCase()) ||
                c.description.toLowerCase().includes(query.toLowerCase()),
        );

        if (statusFilter !== 'Tất cả trạng thái') {
            result = result.filter((c) => c.status === statusFilter);
        }

        return result;
    }, [classes, query, statusFilter]);

    return (
        <>
            <section className="rounded-2xl border border-gray-200 bg-white">
                <div className="px-3 py-3 border-b flex items-start gap-2">
                    <div>
                        <div className="text-sm font-medium">Danh sách Lớp học</div>
                        <div className="text-xs text-gray-500">
                            Quản lý tất cả lớp học trong hệ thống ({filtered.length} kết quả)
                        </div>
                    </div>
                </div>

                <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-10 gap-3">
                    <div className="col-span-3">Lớp học</div>
                    <div className="col-span-2">Chương trình</div>
                    <div className="col-span-2">Thời gian</div>
                    <div className="col-span-1">Địa điểm</div>
                    <div className="col-span-1">Trạng thái</div>
                    <div className="col-span-1"></div>
                </div>

                <div className="divide-y">
                    {filtered.map((c) => (
                        <div
                            key={c.id}
                            className="px-3 py-3 pr-12 grid grid-cols-10 gap-3 items-center border-t first:border-t-0 relative"
                        >
                            <div className="col-span-12 md:col-span-3">
                                <div className="flex items-start gap-3">
                                    <div>
                                        <div className="text-sm font-medium">{c.name}</div>
                                        <div className="text-xs text-gray-500">{c.description}</div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">
                                    {c.program}
                                </span>
                            </div>
                            <div className="col-span-12 md:col-span-2">
                                <div className="flex items-center gap-1 text-sm">
                                    <Calendar size={14} className="text-gray-500" />
                                    {c.startDate}
                                </div>
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                    <Calendar size={12} className="text-gray-400" />
                                    {c.schedule}
                                </div>
                            </div>
                            <div className="col-span-6 md:col-span-1 text-sm flex items-center gap-1 pl-4">
                                <MapPin size={14} className="text-gray-500" />
                                {c.location}
                            </div>
                            <div className="col-span-6 md:col-span-1 pl-4">
                                <span
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                        c.status === 'Đang học'
                                            ? 'bg-green-50 text-green-700'
                                            : c.status === 'Chuẩn bị'
                                              ? 'bg-blue-50 text-blue-700'
                                              : c.status === 'Hoàn thành'
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-50 text-gray-700'
                                    }`}
                                >
                                    {c.status}
                                </span>
                            </div>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40">
                                <ClassActions 
                                    onEdit={() => onEdit?.(c)}
                                    onManageStudents={() => onManageStudents?.(c)}
                                    onAssignInstructor={() => setOpenAssignInstructor(c)}
                                />
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
                        <button className="h-8 px-3 rounded-md bg-blue-600 text-white text-sm">1</button>
                        <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">2</button>
                        <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">Next</button>
                    </div>
                </div>
            </section>
        </>
    );
};

export default ClassList;
