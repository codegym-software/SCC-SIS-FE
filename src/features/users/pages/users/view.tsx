import React from 'react';
import { User, Mail, Phone, Shield, Building, GraduationCap, X } from 'lucide-react';

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

interface UserViewProps {
    open?: boolean;
    onClose?: () => void;
    user: UIUser;
    onEdit?: () => void;
    canEdit?: boolean;
}

const UserView: React.FC<UserViewProps> = ({ 
    open = true,
    onClose,
    user, 
    onEdit, 
    canEdit = true 
}) => {
    if (!open) return null;
    return (
        <div>
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white">
                        <User size={16} />
                    </div>
                    <div>
                        <div className="font-medium">Chi tiết Người dùng: {user.name}</div>
                        <div className="text-xs text-gray-500">
                            Xem thông tin chi tiết về người dùng trong hệ thống
                        </div>
                    </div>
                </div>
                <button
                    className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
                    onClick={onClose}
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* User Info */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Thông tin cá nhân</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Họ và tên</label>
                            <div className="text-sm font-medium">{user.name}</div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                            <div className="text-sm flex items-center gap-2">
                                <Mail size={14} className="text-gray-400" />
                                {user.email}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Số điện thoại</label>
                            <div className="text-sm flex items-center gap-2">
                                <Phone size={14} className="text-gray-400" />
                                {user.phone}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
                            <span
                                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                                    user.status === 'Hoạt động'
                                        ? 'bg-green-50 text-green-700'
                                        : 'bg-gray-50 text-gray-700'
                                }`}
                            >
                                {user.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Role & Center */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Vai trò & Trung tâm</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Vai trò</label>
                            <div className="text-sm flex items-center gap-2">
                                <Shield size={14} className="text-gray-400" />
                                <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-600 text-xs">
                                    {user.role}
                                </span>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Trung tâm</label>
                            <div className="text-sm flex items-center gap-2">
                                <Building size={14} className="text-gray-400" />
                                {user.center}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Professional Info */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Thông tin chuyên môn</h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Chuyên ngành</label>
                            <div className="text-sm flex items-center gap-2">
                                <GraduationCap size={14} className="text-gray-400" />
                                {user.major}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-500 mb-1">Kinh nghiệm</label>
                            <div className="text-sm">{user.exp}</div>
                        </div>
                    </div>
                </div>

                {/* Additional Info */}
                <div>
                    <h3 className="text-sm font-medium mb-3">Thông tin bổ sung</h3>
                    <div className="bg-gray-50 rounded-lg p-4">
                        <div className="text-xs text-gray-500 mb-2">ID Người dùng</div>
                        <div className="text-sm font-mono text-gray-700">{user.id}</div>
                    </div>
                </div>
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                <button
                    className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50"
                    onClick={onClose}
                >
                    Đóng
                </button>
                {onEdit && canEdit && (
                    <button
                        className="h-9 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                        onClick={onEdit}
                    >
                        Chỉnh sửa
                    </button>
                )}
            </div>
        </div>
    );
};

export default UserView;
