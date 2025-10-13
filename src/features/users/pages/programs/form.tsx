import React, { useState } from 'react';
import { BookOpen, Clock, Calendar, X } from 'lucide-react';

type Program = {
    id: string;
    name: string;
    description: string;
    category: string;
    duration: string;
    startDate: string;
    status: 'Đang hoạt động' | 'Tạm dừng' | 'Hoàn thành';
};

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
        category?: string;
        duration?: string;
    }>({});

    return (
        <form
            onSubmit={(e) => {
                e.preventDefault();
                const form = new FormData(e.currentTarget as HTMLFormElement);
                const formData = {
                    name: form.get('name'),
                    description: form.get('description'),
                    category: form.get('category'),
                    duration: form.get('duration'),
                    startDate: form.get('startDate'),
                    status: form.get('status'),
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
                                name="category"
                                defaultValue={editing?.category}
                                required
                                className={`w-full h-8 rounded-md border px-2 text-xs ${errors.category ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                            >
                                <option value="">Chọn danh mục</option>
                                <option>Kỹ thuật</option>
                                <option>Lập trình</option>
                                <option>Thiết kế</option>
                                <option>Kinh doanh</option>
                            </select>
                            {errors.category && <div className="text-xs text-red-600 mt-1">{errors.category}</div>}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Thời gian *</label>
                            <input
                                name="duration"
                                defaultValue={editing?.duration}
                                required
                                className={`w-full h-8 rounded-md border px-2 text-xs ${errors.duration ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                placeholder="18 tháng"
                            />
                            {errors.duration && <div className="text-xs text-red-600 mt-1">{errors.duration}</div>}
                        </div>
                        <div>
                            <label className="block text-xs text-gray-600 mb-1">Ngày bắt đầu</label>
                            <input
                                name="startDate"
                                type="date"
                                defaultValue={editing?.startDate}
                                className="w-full h-8 rounded-md border px-2 text-xs"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
                        <textarea
                            name="description"
                            defaultValue={editing?.description}
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
                                name="status"
                                defaultValue={editing?.status ?? 'Đang hoạt động'}
                                className="w-full h-8 rounded-md border px-2 text-xs"
                            >
                                <option>Đang hoạt động</option>
                                <option>Tạm dừng</option>
                                <option>Hoàn thành</option>
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
                    className="h-9 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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

