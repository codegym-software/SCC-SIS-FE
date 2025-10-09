import React, { useMemo, useState } from 'react';
import { 
  Shield, 
  Users2, 
  Settings
} from 'lucide-react';

// Import components
import RoleList from './list';
import Permissions from './permissions';

type Role = {
    id: string;
    name: string;
    code: string;
    permissions: string[];
    members: number;
    status: 'Hoạt động' | 'Không hoạt động';
    createdAt: string;
};


function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null;
    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
                <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default function RolesPage() {
    const [query] = useState('');
    const [tab, setTab] = useState<'permissions' | 'roles'>('roles');

    const PERMISSIONS: Record<string, string[]> = {
        'Trung tâm': ['Xem trung tâm', 'Tạo trung tâm', 'Chỉnh sửa trung tâm', 'Xóa trung tâm'],
        'Người dùng': ['Xem người dùng', 'Tạo người dùng', 'Chỉnh sửa người dùng', 'Xóa người dùng'],
        'Vai trò': ['Xem vai trò', 'Tạo vai trò', 'Chỉnh sửa vai trò', 'Gán vai trò'],
        'Lớp học': ['Xem lớp học', 'Tạo lớp học', 'Quản lý lớp học'],
    };

    const [roles, setRoles] = useState<Role[]>([
        {
            id: '1',
            name: 'Giáo vụ',
            code: 'GV',
            permissions: ['Xem lớp học', 'Xem người dùng', 'Chỉnh sửa người dùng', 'Xem trung tâm', 'Xem vai trò'],
            members: 15,
            status: 'Hoạt động',
            createdAt: '2024-01-10',
        },
        {
            id: '2',
            name: 'Giảng viên',
            code: 'GVI',
            permissions: ['Xem lớp học', 'Quản lý lớp học'],
            members: 45,
            status: 'Hoạt động',
            createdAt: '2024-01-10',
        },
        {
            id: '3',
            name: 'Trưởng phòng',
            code: 'TP',
            permissions: [
                'Xem vai trò',
                'Chỉnh sửa vai trò',
                'Xem người dùng',
                'Chỉnh sửa người dùng',
                'Xem trung tâm',
            ],
            members: 8,
            status: 'Hoạt động',
            createdAt: '2024-01-10',
        },
        {
            id: '4',
            name: 'Quản lý trung tâm',
            code: 'QLTT',
            permissions: [
                'Xem trung tâm',
                'Tạo trung tâm',
                'Chỉnh sửa trung tâm',
                'Xóa trung tâm',
                'Xem người dùng',
                'Tạo người dùng',
                'Chỉnh sửa người dùng',
                'Xóa người dùng',
                'Xem lớp học',
                'Tạo lớp học',
                'Quản lý lớp học',
            ],
            members: 3,
            status: 'Hoạt động',
            createdAt: '2024-01-10',
        },
    ]);


    const [openCreate, setOpenCreate] = useState(false);
    const [openEdit, setOpenEdit] = useState<Role | null>(null);
    const [openDelete, setOpenDelete] = useState<Role | null>(null);
    const [openViewDetails, setOpenViewDetails] = useState<Role | null>(null);

    const stats = useMemo(
        () => [
            {
                label: 'Tổng Vai trò',
                value: String(roles.length),
                icon: Shield,
                iconColor: 'from-violet-500 to-indigo-500',
                change: '+2 tháng này',
                changeColor: 'text-emerald-600 bg-emerald-50',
            },
            {
                label: 'Người dùng có vai trò',
                value: '71',
                icon: Users2,
                iconColor: 'from-blue-500 to-cyan-500',
                change: '+5 tuần này',
                changeColor: 'text-blue-600 bg-blue-50',
            },
            {
                label: 'Quyền hạn',
                value: String(roles.reduce((s, r) => s + r.permissions.length, 0)),
                icon: Settings,
                iconColor: 'from-orange-500 to-amber-500',
                change: null,
                changeColor: null,
            },
        ],
        [roles],
    );

    function CreateEditForm({ editing }: { editing?: Role | null }) {
        const [errors, setErrors] = useState<{
            name?: string;
            permissions?: string;
        }>({});
        const [selected, setSelected] = useState<Set<string>>(new Set(editing?.permissions || []));
        
        function togglePermission(key: string) {
            setSelected((prev) => {
                const next = new Set(prev);
                if (next.has(key)) next.delete(key);
                else next.add(key);
                return next;
            });
        }

        function toggleAllPermissions(items: string[]) {
            setSelected((prev) => {
                const next = new Set(prev);
                const allSelected = items.every(item => next.has(item));
                
                if (allSelected) {
                    // Nếu tất cả đã được chọn, bỏ chọn tất cả
                    items.forEach(item => next.delete(item));
                } else {
                    // Nếu chưa chọn hết, chọn tất cả
                    items.forEach(item => next.add(item));
                }
                return next;
            });
        }

        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    const form = new FormData(e.currentTarget as HTMLFormElement);
                    const payload: Role = {
                        id: editing?.id ?? String(Date.now()),
                        name: String(form.get('name') || ''),
                        code: String(form.get('code') || ''),
                        permissions: Array.from(selected),
                        members: editing?.members ?? 0,
                        status: 'Hoạt động',
                        createdAt: editing?.createdAt ?? new Date().toISOString().slice(0, 10),
                    };
                    
                    const newErrors: typeof errors = {};
                    if (!payload.name || payload.name.trim().length < 3)
                        newErrors.name = 'Tên vai trò tối thiểu 3 ký tự';
                    const nameExists = roles.some(
                        (r) => r.name.toLowerCase() === payload.name.toLowerCase() && r.id !== editing?.id,
                    );
                    if (nameExists) newErrors.name = 'Tên vai trò đã tồn tại';
                    if (payload.permissions.length === 0) newErrors.permissions = 'Chọn ít nhất 1 quyền';
                    setErrors(newErrors);
                    if (Object.keys(newErrors).length > 0) return;
                    
                    setRoles((prev) =>
                        editing ? prev.map((x) => (x.id === editing.id ? payload : x)) : [payload, ...prev],
                    );
                    editing ? setOpenEdit(null) : setOpenCreate(false);
                }}
            >
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div className="font-medium">{editing ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}</div>
                    <button
                        type="button"
                        className="h-8 w-8 rounded hover:bg-gray-100"
                        onClick={() => (editing ? setOpenEdit(null) : setOpenCreate(false))}
                    >
                        ×
                    </button>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Tên vai trò *</label>
                        <input
                            name="name"
                            defaultValue={editing?.name}
                            className={`w-full h-9 rounded-md border px-3 text-sm ${errors.name ? 'border-red-500' : ''}`}
                            placeholder="Giáo vụ"
                        />
                        {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Mã vai trò *</label>
                        <input
                            name="code"
                            defaultValue={editing?.code}
                            required
                            className="w-full h-9 rounded-md border px-3 text-sm"
                            placeholder="GV"
                        />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs text-gray-600 mb-2">Phân quyền</label>
                        {Object.entries(PERMISSIONS).map(([group, items]) => {
                            const count = items.filter((k) => selected.has(k)).length;
                            return (
                                <div key={group} className="mb-3 rounded-xl border border-gray-200">
                                    <div className="px-3 py-2 text-sm font-medium flex items-center justify-between">
                                        <span>{group}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs text-gray-500">
                                                {count}/{items.length}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() => toggleAllPermissions(items)}
                                                className={`px-2 py-1 text-xs rounded-md border ${
                                                    count === items.length
                                                        ? 'bg-gray-100 text-gray-700 border-gray-300'
                                                        : 'bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100'
                                                }`}
                                            >
                                                {count === items.length ? 'Bỏ chọn tất cả' : 'Tích tất cả'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                                        {items.map((key) => (
                                            <label
                                                key={key}
                                                className={`rounded-lg border ${selected.has(key) ? 'border-indigo-500 ring-2 ring-indigo-100' : 'border-gray-200'} bg-white p-3 flex items-start gap-2 cursor-pointer`}
                                            >
                                                <input
                                                    type="checkbox"
                                                    className="mt-0.5"
                                                    checked={selected.has(key)}
                                                    onChange={() => togglePermission(key)}
                                                />
                                                <div>
                                                    <div className="text-sm font-medium">{key}</div>
                                                    <div className="text-xs text-gray-500">
                                                        {key.includes('Xem')
                                                            ? 'Quyền xem thông tin'
                                                            : key.includes('Tạo')
                                                              ? 'Quyền tạo mới'
                                                              : key.includes('Chỉnh sửa')
                                                                ? 'Quyền chỉnh sửa thông tin'
                                                                : key.includes('Xóa')
                                                                  ? 'Quyền xóa dữ liệu'
                                                                  : key.includes('Quản lý')
                                                                    ? 'Quyền quản lý toàn diện'
                                                                    : key.includes('Gán')
                                                                      ? 'Quyền gán vai trò'
                                                                      : 'Quyền hệ thống'}
                                                    </div>
                                                </div>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            );
                        })}
                        {errors.permissions && <div className="text-xs text-red-600 mt-1">{errors.permissions}</div>}
                    </div>
                </div>
                <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                    <button
                        type="button"
                        className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50"
                        onClick={() => (editing ? setOpenEdit(null) : setOpenCreate(false))}
                    >
                        Hủy
                    </button>
                    <button type="submit" className="h-9 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">
                        {editing ? 'Lưu thay đổi' : 'Tạo vai trò'}
                    </button>
                </div>
            </form>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-white">
                        <Shield size={18} />
                    </div>
                    <div>
                        <h1 className="text-lg font-semibold">Vai trò & Phân quyền</h1>
                        <p className="text-xs text-gray-500">Tạo, chỉnh sửa vai trò và gán quyền trong hệ thống</p>
                    </div>
                </div>
            </div>

            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((s) => {
                    const IconComponent = s.icon;
                    return (
                        <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 relative">
                            <div className="text-xs text-gray-500 mb-3">{s.label}</div>
                            <div className="text-2xl font-semibold mb-2">{s.value}</div>
                            {s.change && (
                                <div
                                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${s.changeColor}`}
                                >
                                    {s.change}
                                </div>
                            )}
                            <div
                                className={`absolute top-4 right-4 h-8 w-8 rounded-lg bg-gradient-to-br ${s.iconColor} grid place-items-center text-white`}
                            >
                                <IconComponent size={16} />
                            </div>
                        </div>
                    );
                })}
            </section>

            {/* Tabs */}
            <div className="flex items-center gap-2 mt-4">
                <button
                    onClick={() => setTab('permissions')}
                    className={`px-4 h-9 rounded-full text-sm inline-flex items-center gap-2 ${tab === 'permissions' ? 'bg-gray-900 text-white' : 'bg-white border'}`}
                >
                    <Settings size={14} /> Quyền hạn
                </button>
                <button
                    onClick={() => setTab('roles')}
                    className={`px-4 h-9 rounded-full text-sm inline-flex items-center gap-2 ${tab === 'roles' ? 'bg-gray-900 text-white' : 'bg-white border'}`}
                >
                    <Shield size={14} /> Vai trò
                </button>
            </div>

            {/* Tab content */}
            {tab === 'roles' && (
                <RoleList
                    roles={roles}
                    query={query}
                    onEdit={setOpenEdit}
                    onDelete={setOpenDelete}
                    onCreate={() => setOpenCreate(true)}
                    onViewDetails={setOpenViewDetails}
                />
            )}

            {tab === 'permissions' && (
                <Permissions permissions={PERMISSIONS} />
            )}


            {/* Modals */}
            <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
                <CreateEditForm />
            </Modal>

            <Modal open={!!openEdit} onClose={() => setOpenEdit(null)}>
                {openEdit && <CreateEditForm editing={openEdit} />}
            </Modal>

            <Modal open={!!openDelete} onClose={() => setOpenDelete(null)}>
                {openDelete && (
                    <div>
                        <div className="px-4 py-3 border-b font-medium">Xác nhận xóa vai trò</div>
                        <div className="p-4">
                            <div className="text-sm mb-4">
                                Bạn có chắc chắn muốn xóa vai trò "{openDelete.name}" không? Hành động này không thể
                                hoàn tác.
                            </div>
                            {openDelete.members > 0 && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                                    <div className="h-5 w-5 rounded-full bg-red-100 text-red-600 grid place-items-center">
                                        <span className="text-xs font-bold">!</span>
                                    </div>
                                    <div className="text-sm text-red-700 font-medium">
                                        Có {openDelete.members} người dùng đang sử dụng vai trò này!
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                            <button
                                className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50"
                                onClick={() => setOpenDelete(null)}
                            >
                                Hủy
                            </button>
                            <button
                                className="h-9 px-3 rounded-md bg-red-600 text-white hover:bg-red-700"
                                onClick={() => {
                                    setRoles((prev) => prev.filter((x) => x.id !== openDelete.id));
                                    setOpenDelete(null);
                                }}
                            >
                                Xóa vai trò
                            </button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* View Details Modal */}
            <Modal open={!!openViewDetails} onClose={() => setOpenViewDetails(null)}>
                {openViewDetails && (
                    <div>
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-white">
                                    <Shield size={16} />
                                </div>
                                <div>
                                    <div className="font-medium">Chi tiết vai trò: {openViewDetails.name}</div>
                                    <div className="text-xs text-gray-500">Xem thông tin chi tiết về vai trò và quyền hạn</div>
                                </div>
                            </div>
                            <button
                                className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
                                onClick={() => setOpenViewDetails(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="p-4 space-y-6">
                            {/* Role Information */}
                            <div>
                                <h3 className="text-sm font-medium mb-3">Thông tin vai trò</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Tên vai trò</label>
                                        <div className="text-sm font-medium">{openViewDetails.name}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Mã vai trò</label>
                                        <div className="text-sm">{openViewDetails.code}</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Số người dùng</label>
                                        <div className="text-sm">{openViewDetails.members} người dùng</div>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                            openViewDetails.status === 'Hoạt động'
                                                ? 'bg-green-50 text-green-700'
                                                : 'bg-gray-50 text-gray-700'
                                        }`}>
                                            {openViewDetails.status}
                                        </span>
                                    </div>
                                    <div>
                                        <label className="block text-xs text-gray-500 mb-1">Ngày tạo</label>
                                        <div className="text-sm">{new Date(openViewDetails.createdAt).toLocaleDateString('vi-VN')}</div>
                                    </div>
                                </div>
                            </div>

                            {/* Permissions */}
                            <div>
                                <h3 className="text-sm font-medium mb-3">Quyền hạn ({openViewDetails.permissions.length} quyền)</h3>
                                <div className="space-y-3 max-h-60 overflow-y-auto">
                                    {Object.entries(PERMISSIONS).map(([group, items]) => {
                                        const rolePermissions = items.filter(item => openViewDetails.permissions.includes(item));
                                        if (rolePermissions.length === 0) return null;
                                        
                                        return (
                                            <div key={group} className="rounded-xl border border-gray-200">
                                                <div className="px-3 py-2 text-sm font-medium bg-gray-50 border-b">
                                                    {group} ({rolePermissions.length}/{items.length})
                                                </div>
                                                <div className="p-3">
                                                    <div className="flex flex-wrap gap-2">
                                                        {rolePermissions.map((permission) => (
                                                            <span
                                                                key={permission}
                                                                className="px-2 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-xs"
                                                            >
                                                                {permission}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                            <button
                                className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50"
                                onClick={() => setOpenViewDetails(null)}
                            >
                                Đóng
                            </button>
                            <button
                                className="h-9 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
                                onClick={() => {
                                    setOpenViewDetails(null);
                                    setOpenEdit(openViewDetails);
                                }}
                            >
                                Chỉnh sửa
                            </button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}