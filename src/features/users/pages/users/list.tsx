import React from 'react';
import { ChevronDown } from 'lucide-react';
import UserActions from './components/actions';

type UIUser = {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
    center: string;
    major: string;
    exp: string;
    status: 'Hoạt động' | 'Không hoạt động';
};

interface UsersListProps {
    users: UIUser[];
    loading: boolean;
    error: string | null;
    page: number;
    pageSize: number;
    onPageChange: (page: number) => void;
    onView: (user: UIUser) => void;
    onEdit: (user: UIUser) => void;
    onToggleStatus: (user: UIUser) => void;
    openMenuId: string | null;
    onMenuToggle: (id: string | null) => void;
    canEdit?: boolean;
    canToggleStatus?: boolean;
}

const UsersList: React.FC<UsersListProps> = ({
    users,
    loading,
    error,
    page,
    pageSize,
    onPageChange,
    onView,
    onEdit,
    onToggleStatus,
    openMenuId,
    onMenuToggle,
    canEdit = true,
    canToggleStatus = true,
}) => {
    const totalPages = Math.max(1, Math.ceil(users.length / pageSize));
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const pageUsers = users.slice(startIndex, endIndex);

    return (
        <section className="bg-white border border-gray-200 rounded-2xl p-6">
            <div>
                <h3 className="text-base font-medium text-gray-900">Danh sách Người dùng</h3>
                <p className="text-sm text-gray-500 mt-1">
                    {loading
                        ? 'Đang tải...'
                        : error
                          ? error
                          : `Xem và quản lý tất cả người dùng trong hệ thống (${users.length} kết quả)`}
                </p>
            </div>
            
            <div className="mt-6 -mx-6">
                {/* Header */}
                <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-sm font-medium text-gray-500">
                    <div className="col-span-3">Người dùng</div>
                    <div className="col-span-3">Vai trò & Trung tâm</div>
                    <div className="col-span-2">Chuyên môn</div>
                    <div className="col-span-2">Trạng thái</div>
                    <div className="col-span-2 text-right"></div>
                </div>

                {/* Users List */}
                <div className="text-sm">
                    {pageUsers.map((user) => (
                        <div
                            key={user.id}
                            className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200"
                        >
                            <div className="col-span-3">
                                <p className="font-medium text-gray-900">{user.name}</p>
                                <p className="text-gray-500">{user.email}</p>
                                <p className="text-gray-500">{user.phone}</p>
                            </div>
                            <div className="col-span-3 flex flex-col gap-1.5">
                                <span className="text-xs font-medium self-start px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">
                                    {user.role}
                                </span>
                                <p className="text-xs text-gray-500">{user.center}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-gray-900">{user.major}</p>
                                <p className="text-xs text-gray-500">{user.exp}</p>
                            </div>
                            <div className="col-span-2">
                                <span
                                    className={`text-xs font-medium self-start px-2 py-0.5 rounded-md ${
                                        user.status === 'Hoạt động'
                                            ? 'bg-emerald-100 text-emerald-700'
                                            : 'bg-gray-100 text-gray-600'
                                    }`}
                                >
                                    {user.status}
                                </span>
                            </div>
                            <div className="col-span-2 flex justify-end">
                                <div className="relative">
                                    <button
                                        className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                                        onClick={() => onMenuToggle(openMenuId === user.id ? null : user.id)}
                                    >
                                        <UserActions
                                            onView={() => {
                                                onMenuToggle(null);
                                                onView(user);
                                            }}
                                            onEdit={() => {
                                                onMenuToggle(null);
                                                onEdit(user);
                                            }}
                                            onToggleStatus={() => {
                                                onMenuToggle(null);
                                                onToggleStatus(user);
                                            }}
                                            canEdit={canEdit}
                                            canToggleStatus={canToggleStatus}
                                            isActive={user.status === 'Hoạt động'}
                                        />
                                    </button>
                                    {openMenuId === user.id && (
                                        <>
                                            <div
                                                className="fixed inset-0 z-10"
                                                onClick={() => onMenuToggle(null)}
                                            />
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Pagination */}
            <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-500">
                    Hiển thị {startIndex + 1} - {Math.min(endIndex, users.length)} trong số {users.length} kết quả
                </div>
                <nav className="flex items-center gap-2">
                    <button
                        disabled={page === 1}
                        onClick={() => onPageChange(page - 1)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                        <ChevronDown className="w-4 h-4 rotate-90" />
                        <span>Previous</span>
                    </button>
                    <button
                        className={`w-9 h-9 flex items-center justify-center rounded-lg border ${page === 1 ? 'bg-white border-gray-200' : 'text-gray-900'}`}
                        onClick={() => onPageChange(1)}
                    >
                        1
                    </button>
                    {totalPages >= 2 && (
                        <button
                            className={`w-9 h-9 flex items-center justify-center rounded-lg ${page === 2 ? 'bg-white border border-gray-200' : 'text-gray-900'}`}
                            onClick={() => onPageChange(2)}
                        >
                            2
                        </button>
                    )}
                    <button
                        disabled={page === totalPages}
                        onClick={() => onPageChange(page + 1)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                        <span>Next</span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                </nav>
            </div>
        </section>
    );
};

export default UsersList;
