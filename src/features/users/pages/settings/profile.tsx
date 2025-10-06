import React from 'react';
import { User, Mail, Phone, User2 } from 'lucide-react';

interface ProfileData {
    fullName: string;
    email: string;
    phone: string;
    bio: string;
}

interface ProfileProps {
    formData: ProfileData;
    onInputChange: (field: string, value: string) => void;
    onSave: () => void;
    isSaving?: boolean;
}

const Profile: React.FC<ProfileProps> = ({ formData, onInputChange, onSave, isSaving = false }) => {
    return (
        <div className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h3>
                    <p className="text-xs text-gray-500 mt-1">
                        Cập nhật thông tin hồ sơ và chi tiết liên hệ của bạn
                    </p>
                </div>

                {/* User Info Card */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-full bg-blue-500 text-white grid place-items-center text-lg font-bold shadow-md">
                            N
                        </div>
                        <div className="flex-1">
                            <h4 className="text-lg font-bold text-gray-900 mb-1">{formData.fullName}</h4>
                            <div className="flex items-center gap-2 mb-1">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                    Super Admin
                                </span>
                            </div>
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                                <Mail size={12} className="text-gray-400" />
                                {formData.email}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Họ và tên
                            </label>
                            <input
                                type="text"
                                value={formData.fullName}
                                onChange={(e) => onInputChange('fullName', e.target.value)}
                                className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Nhập họ và tên"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => onInputChange('email', e.target.value)}
                                className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Nhập email"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-semibold text-gray-700 mb-1">
                                Số điện thoại
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => onInputChange('phone', e.target.value)}
                                className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                placeholder="Nhập số điện thoại"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-semibold text-gray-700 mb-1">
                            Giới thiệu bản thân
                        </label>
                        <textarea
                            value={formData.bio}
                            onChange={(e) => onInputChange('bio', e.target.value)}
                            className="w-full h-20 rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                            placeholder="Viết một vài dòng giới thiệu về bản thân..."
                        />
                    </div>
                </div>
            </div>

            {/* Save Button */}
            <div className="flex items-center justify-end">
                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    {isSaving ? (
                        <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                            Đang lưu...
                        </>
                    ) : (
                        <>
                            <User size={16} />
                            Lưu thay đổi
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

export default Profile;

