import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, X } from 'lucide-react';
import type { Program } from '../../../../shared/api/programs';

interface ProgramFormProps {
    open?: boolean;
    onClose?: () => void;
    editing?: Program | null;
    onSubmit: (formData: any) => void;
    onCancel: () => void;
    isSubmitting?: boolean;
}

const ProgramForm: React.FC<ProgramFormProps> = ({ 
    open = true,
    onClose,
    editing, 
    onSubmit, 
    onCancel, 
    isSubmitting = false 
}) => {
    if (!open) return null;
    
    const [errors, setErrors] = useState<{
        name?: string;
        code?: string;
        categoryCode?: string;
        durationHours?: string;
    }>({});

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget as HTMLFormElement);
                const formData = {
                    code: form.get('code') as string,
                    name: form.get('name') as string,
                    description: form.get('description') as string,
                    categoryCode: form.get('categoryCode') as string,
                    durationHours: parseInt(form.get('durationHours') as string),
                    deliveryMode: form.get('deliveryMode') as 'ONLINE' | 'OFFLINE' | 'HYBRID',
                    isActive: form.get('isActive') === 'true',
                };
                onSubmit(formData);
            }}
        >
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="font-medium">{editing ? 'Chỉnh sửa Chương trình' : 'Tạo Chương trình mới'}</div>
                <button
                    type="button"
                    className="h-8 w-8 rounded hover:bg-gray-100"
                    onClick={onCancel}
                >
                    <X size={16} />
                </button>
            </div>

            <div className="p-4 space-y-6">
                {/* Thông tin cơ bản */}
                <div className="space-y-3">
                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                        <div className="h-5 w-5 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                            <BookOpen size={12} />
                        </div>
                        <h3 className="text-xs font-medium text-gray-900">Thông tin cơ bản</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Mã chương trình *</label>
                            <input
                                name="code"
                                defaultValue={editing?.code}
                                required
                                disabled={!!editing}
                                className={`w-full h-8 rounded-md border px-2 text-xs ${errors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${editing ? 'bg-gray-100' : ''}`}
                                placeholder="CNTT-2024"
                            />
                            {errors.code && <div className="text-xs text-red-600 mt-1">{errors.code}</div>}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Tên chương trình *</label>
                            <input
                                name="name"
                                defaultValue={editing?.name}
                                required
                                className={`w-full h-8 rounded-md border px-2 text-xs ${errors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                placeholder="Công nghệ Thông tin"
                            />
                            {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Danh mục *</label>
                            <select
                                name="categoryCode"
                                defaultValue={editing?.categoryCode}
                                required
                                className={`w-full h-8 rounded-md border px-2 text-xs ${errors.categoryCode ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            >
                                <option value="">Chọn danh mục</option>
                                <option value="IT">IT</option>
                                <option value="PROGRAMMING">PROGRAMMING</option>
                                <option value="DESIGN">DESIGN</option>
                                <option value="BUSINESS">BUSINESS</option>
                            </select>
                            {errors.categoryCode && <div className="text-xs text-red-600 mt-1">{errors.categoryCode}</div>}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Thời gian (giờ) *</label>
                            <input
                                name="durationHours"
                                defaultValue={editing?.durationHours}
                                required
                                type="number"
                                min="1"
                                className={`w-full h-8 rounded-md border px-2 text-xs ${errors.durationHours ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                placeholder="480"
                            />
                            <div className="text-xs text-gray-500 mt-1">Nhập số giờ (VD: 480)</div>
                            {errors.durationHours && <div className="text-xs text-red-600 mt-1">{errors.durationHours}</div>}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Hình thức học *</label>
                            <select
                                name="deliveryMode"
                                defaultValue={editing?.deliveryMode ?? 'OFFLINE'}
                                required
                                className="w-full h-8 rounded-md border px-2 text-xs"
                            >
                                <option value="">Chọn hình thức học</option>
                                <option value="ONLINE">ONLINE</option>
                                <option value="OFFLINE">OFFLINE</option>
                                <option value="HYBRID">HYBRID</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
                        <textarea
                            name="description"
                            defaultValue={editing?.description || ''}
                            className="w-full h-16 rounded-md border px-2 py-1 text-xs resize-none"
                            placeholder="Mô tả chi tiết về chương trình đào tạo..."
                        />
                    </div>
                </div>


                {/* Trạng thái - chỉ hiển thị khi editing */}
                {editing && (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                            <div className="h-5 w-5 rounded-lg bg-green-50 text-green-600 grid place-items-center">
                                <Clock size={12} />
                            </div>
                            <h3 className="text-xs font-medium text-gray-900">Trạng thái</h3>
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Trạng thái chương trình</label>
                            <select
                                name="isActive"
                                defaultValue={editing?.isActive ? 'true' : 'false'}
                                className="w-full h-8 rounded-md border px-2 text-xs"
                            >
                                <option value="true">Đang hoạt động</option>
                                <option value="false">Tạm dừng</option>
                            </select>
                        </div>
                    </div>
                )}
            </div>

            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                <button 
                    type="button" 
                    className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" 
                    onClick={onCancel}
                >
                    Hủy
                </button>
                <button
                    type="submit"
                    className="h-9 px-3 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50 flex items-center gap-2"
                    disabled={isSubmitting}
                >
                    {isSubmitting && (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {isSubmitting
                        ? (editing ? 'Đang cập nhật...' : 'Đang tạo...')
                        : (editing ? 'Lưu thay đổi' : 'Tạo Chương trình')
                    }
                </button>
            </div>
        </form>
    );
};

export default ProgramForm;

