import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

type Module = {
    id: string;
    name: string;
    moduleId: string;
    field: string;
    credits: number;
    duration: string;
    prerequisite: string;
    syllabus: 'Có' | 'Chưa có';
    status: 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành';
};

interface ModuleFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<Module>) => void;
    onCancel: () => void;
    editing?: Module | null;
    isSubmitting?: boolean;
}

const ModuleForm: React.FC<ModuleFormProps> = ({
    open,
    onClose,
    onSubmit,
    onCancel,
    editing,
    isSubmitting = false,
}) => {
    const [formData, setFormData] = useState<Partial<Module>>({
        name: '',
        moduleId: '',
        field: '',
        credits: 0,
        duration: '',
        prerequisite: 'Không',
        syllabus: 'Chưa có',
        status: 'Hoạt động',
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    useEffect(() => {
        if (editing) {
            setFormData(editing);
        } else {
            setFormData({
                name: '',
                moduleId: '',
                field: '',
                credits: 0,
                duration: '',
                prerequisite: 'Không',
                syllabus: 'Chưa có',
                status: 'Hoạt động',
            });
        }
        setErrors({});
    }, [editing, open]);

    if (!open) return null;

    const handleChange = (field: keyof Module, value: any) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: '' }));
        }
    };

    const validate = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.name?.trim()) {
            newErrors.name = 'Tên module là bắt buộc';
        }
        if (!formData.moduleId?.trim()) {
            newErrors.moduleId = 'Mã module là bắt buộc';
        }
        if (!formData.field?.trim()) {
            newErrors.field = 'Lĩnh vực là bắt buộc';
        }
        if (!formData.credits || formData.credits <= 0) {
            newErrors.credits = 'Số tín chỉ phải lớn hơn 0';
        }
        if (!formData.duration?.trim()) {
            newErrors.duration = 'Thời lượng là bắt buộc';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validate()) {
            onSubmit(formData);
        }
    };

    return (
        <div>
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 grid place-items-center text-white">
                        <Save size={16} />
                    </div>
                    <div>
                        <div className="font-medium">{editing ? 'Chỉnh sửa Module' : 'Tạo Module mới'}</div>
                        <div className="text-xs text-gray-500">
                            {editing ? 'Cập nhật thông tin module' : 'Thêm module mới vào hệ thống'}
                        </div>
                    </div>
                </div>
                <button
                    className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
                    onClick={onClose}
                    disabled={isSubmitting}
                >
                    <X size={16} />
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-4">
                {/* Tên Module */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Tên Module <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.name || ''}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none ${
                            errors.name ? 'border-red-500' : ''
                        }`}
                        placeholder="Ví dụ: Lập trình Java Cơ bản"
                        disabled={isSubmitting}
                    />
                    {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
                </div>

                {/* Mã Module */}
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Mã Module <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        value={formData.moduleId || ''}
                        onChange={(e) => handleChange('moduleId', e.target.value)}
                        className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none ${
                            errors.moduleId ? 'border-red-500' : ''
                        }`}
                        placeholder="Ví dụ: JAVA101"
                        disabled={isSubmitting || !!editing}
                    />
                    {errors.moduleId && <p className="text-xs text-red-500 mt-1">{errors.moduleId}</p>}
                    {editing && <p className="text-xs text-gray-500 mt-1">Mã module không thể thay đổi</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Lĩnh vực */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Lĩnh vực <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={formData.field || ''}
                            onChange={(e) => handleChange('field', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none ${
                                errors.field ? 'border-red-500' : ''
                            }`}
                            disabled={isSubmitting}
                        >
                            <option value="">-- Chọn lĩnh vực --</option>
                            <option value="Kỹ thuật">Kỹ thuật</option>
                            <option value="Lập trình">Lập trình</option>
                            <option value="Thiết kế">Thiết kế</option>
                            <option value="Kinh doanh">Kinh doanh</option>
                        </select>
                        {errors.field && <p className="text-xs text-red-500 mt-1">{errors.field}</p>}
                    </div>

                    {/* Số tín chỉ */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Số tín chỉ <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            value={formData.credits || 0}
                            onChange={(e) => handleChange('credits', parseInt(e.target.value) || 0)}
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none ${
                                errors.credits ? 'border-red-500' : ''
                            }`}
                            placeholder="0"
                            min="0"
                            disabled={isSubmitting}
                        />
                        {errors.credits && <p className="text-xs text-red-500 mt-1">{errors.credits}</p>}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    {/* Thời lượng */}
                    <div>
                        <label className="block text-sm font-medium mb-1">
                            Thời lượng <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={formData.duration || ''}
                            onChange={(e) => handleChange('duration', e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none ${
                                errors.duration ? 'border-red-500' : ''
                            }`}
                            placeholder="Ví dụ: 4 tháng, 12 tuần"
                            disabled={isSubmitting}
                        />
                        {errors.duration && <p className="text-xs text-red-500 mt-1">{errors.duration}</p>}
                    </div>

                    {/* Trạng thái */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Trạng thái</label>
                        <select
                            value={formData.status || 'Hoạt động'}
                            onChange={(e) =>
                                handleChange('status', e.target.value as 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành')
                            }
                            className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                            disabled={isSubmitting}
                        >
                            <option value="Hoạt động">Hoạt động</option>
                            <option value="Tạm dừng">Tạm dừng</option>
                            <option value="Hoàn thành">Hoàn thành</option>
                        </select>
                    </div>
                </div>

                {/* Điều kiện tiên quyết */}
                <div>
                    <label className="block text-sm font-medium mb-1">Điều kiện tiên quyết</label>
                    <input
                        type="text"
                        value={formData.prerequisite || ''}
                        onChange={(e) => handleChange('prerequisite', e.target.value)}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                        placeholder="Ví dụ: Lập trình Cơ bản hoặc Không"
                        disabled={isSubmitting}
                    />
                    <p className="text-xs text-gray-500 mt-1">Để trống hoặc nhập "Không" nếu không có điều kiện</p>
                </div>

                {/* Đề cương */}
                <div>
                    <label className="block text-sm font-medium mb-1">Đề cương</label>
                    <select
                        value={formData.syllabus || 'Chưa có'}
                        onChange={(e) => handleChange('syllabus', e.target.value as 'Có' | 'Chưa có')}
                        className="w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-200 outline-none"
                        disabled={isSubmitting}
                    >
                        <option value="Có">Có</option>
                        <option value="Chưa có">Chưa có</option>
                    </select>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                        disabled={isSubmitting}
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                Đang lưu...
                            </>
                        ) : (
                            <>
                                <Save size={16} />
                                {editing ? 'Cập nhật' : 'Tạo mới'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ModuleForm;
