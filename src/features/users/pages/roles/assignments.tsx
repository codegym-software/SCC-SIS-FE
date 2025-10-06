import { Users2 } from 'lucide-react';
import { useMemo } from 'react';

type Assignment = {
    id: string;
    user: string;
    email: string;
    role: string;
    center: string;
    date: string;
    by: string;
};

interface AssignmentsProps {
    assignments: Assignment[];
    query: string;
    filter: string;
    onEdit: (assignment: Assignment) => void;
    onRevoke: (assignment: Assignment) => void;
    onAssign: () => void;
}

const Assignments: React.FC<AssignmentsProps> = ({ 
    assignments, 
    query, 
    filter, 
    onEdit, 
    onRevoke, 
    onAssign 
}) => {
    const filteredAssignments = useMemo(
        () =>
            assignments.filter((a) => {
                const matchesText = (a.user + a.email).toLowerCase().includes(query.toLowerCase());
                const matchesRole = filter === 'Tất cả vai trò' || a.role === filter;
                return matchesText && matchesRole;
            }),
        [assignments, query, filter],
    );

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="px-3 py-3 border-b flex items-start gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0">
                    <Users2 size={16} />
                </div>
                <div className="flex-1">
                    <div className="text-sm font-medium">Phân quyền Người dùng</div>
                    <div className="text-xs text-gray-500">Quản lý vai trò được gán cho từng người dùng</div>
                </div>
                <button
                    className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white text-sm px-3 py-2 hover:bg-emerald-700"
                    onClick={onAssign}
                >
                    Gán vai trò
                </button>
            </div>

            <div className="px-3 py-2 border-b flex items-center gap-2">
                <input
                    value={query}
                    onChange={(e) => {
                        // This will be handled by parent component
                    }}
                    className="flex-1 h-8 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                    placeholder="Tìm kiếm theo tên hoặc email..."
                    readOnly
                />
                <select
                    className="h-8 rounded-md border px-2 text-sm"
                    value={filter}
                    onChange={(e) => {
                        // This will be handled by parent component
                    }}
                    disabled
                >
                    <option>Tất cả vai trò</option>
                    <option>Giáo vụ</option>
                    <option>Giảng viên</option>
                    <option>Trưởng phòng</option>
                </select>
            </div>

            <div className="p-3">
                <div className="rounded-xl border border-gray-200">
                    <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
                        <div className="col-span-4">Người dùng</div>
                        <div className="col-span-2">Vai trò</div>
                        <div className="col-span-3">Trung tâm</div>
                        <div className="col-span-1">Ngày gán</div>
                        <div className="col-span-1">Được gán bởi</div>
                        <div className="col-span-1"></div>
                    </div>
                    <div className="divide-y">
                        {filteredAssignments.map((a) => (
                            <div key={a.id} className="px-3 py-3 grid grid-cols-12 gap-3 items-center relative">
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-700 grid place-items-center">
                                        {a.user.split(' ').pop()?.[0]}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium">{a.user}</div>
                                        <div className="text-xs text-gray-500">{a.email}</div>
                                    </div>
                                </div>
                                <div className="col-span-2">
                                    <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[11px]">
                                        {a.role}
                                    </span>
                                </div>
                                <div className="col-span-3 text-sm">{a.center}</div>
                                <div className="col-span-1 text-sm">
                                    {new Date(a.date).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="col-span-1 text-sm">{a.by}</div>
                                <div className="col-span-1 flex justify-end">
                                    <div className="relative z-40">
                                        <button
                                            className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                                            onClick={() => {
                                                // This will be handled by parent component
                                            }}
                                        >
                                            ⋯
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default Assignments;
