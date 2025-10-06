import { Shield, Users2 } from 'lucide-react';
import { useMemo } from 'react';
import RoleActions from './components/actions';

type Role = {
    id: string;
    name: string;
    desc: string;
    permissions: string[];
    members: number;
    status: 'Hoạt động' | 'Không hoạt động';
    createdAt: string;
};

interface RoleListProps {
    roles: Role[];
    query: string;
    onEdit: (role: Role) => void;
    onDelete: (role: Role) => void;
    onCreate: () => void;
}

const RoleList: React.FC<RoleListProps> = ({ roles, query, onEdit, onDelete, onCreate }) => {
    const filtered = useMemo(
        () => roles.filter((r) => r.name.toLowerCase().includes(query.toLowerCase())),
        [roles, query],
    );

    return (
        <section className="rounded-2xl border border-gray-200 bg-white">
            {/* Header card */}
            <div className="px-3 py-3 border-b flex items-start gap-2">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0">
                    <Shield size={16} />
                </div>
                <div>
                    <div className="text-sm font-medium">Danh sách Vai trò</div>
                    <div className="text-xs text-gray-500">
                        Xem và quản lý tất cả các vai trò trong hệ thống ({roles.length} vai trò)
                    </div>
                </div>
                <div className="ml-auto">
                    <button
                        onClick={onCreate}
                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 text-white text-xs px-2.5 py-1.5 hover:bg-indigo-700"
                    >
                        <Users2 size={16} /> <span>Tạo vai trò mới</span>
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
                        placeholder="Tìm theo tên vai trò..."
                        readOnly
                    />
                    <select className="h-8 rounded-md border px-2 text-sm">
                        <option>Tất cả trạng thái</option>
                        <option>Hoạt động</option>
                        <option>Không hoạt động</option>
                    </select>
                </div>
            </div>

            {/* Header columns */}
            <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
                <div className="col-span-4">Vai trò</div>
                <div className="col-span-4">Quyền hạn</div>
                <div className="col-span-2">Người dùng</div>
                <div className="col-span-2">Ngày tạo</div>
            </div>

            <div className="divide-y">
                {filtered.map((r) => (
                    <div
                        key={r.id}
                        className="px-3 py-3 pr-12 grid grid-cols-12 gap-3 items-center border-t first:border-t-0 relative"
                    >
                        <div className="col-span-12 md:col-span-4">
                            <div className="flex items-start gap-3">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-white flex-shrink-0">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium">{r.name}</div>
                                    <div className="text-xs text-gray-500">{r.desc}</div>
                                </div>
                            </div>
                        </div>
                        <div className="col-span-12 md:col-span-4">
                            <div className="flex flex-wrap gap-1.5">
                                {r.permissions.slice(0, 4).map((p) => (
                                    <span
                                        key={p}
                                        className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px]"
                                    >
                                        {p}
                                    </span>
                                ))}
                                {r.permissions.length > 4 && (
                                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">
                                        +{r.permissions.length - 4} khác
                                    </span>
                                )}
                            </div>
                            <div className="text-[11px] text-gray-500 mt-1">
                                Tổng: {r.permissions.length} quyền
                            </div>
                        </div>
                        <div className="col-span-6 md:col-span-2 text-sm flex items-center gap-1">
                            <Users2 size={14} className="text-gray-500" /> {r.members}
                        </div>
                        <div className="col-span-6 md:col-span-2 text-sm text-gray-700">
                            {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                        {/* Actions aligned to far right without taking grid width */}
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40">
                            <RoleActions
                                onEdit={() => onEdit(r)}
                                onDelete={() => onDelete(r)}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
};

export default RoleList;
