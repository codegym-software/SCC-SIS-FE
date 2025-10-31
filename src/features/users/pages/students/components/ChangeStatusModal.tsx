import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';
import { updateStudentStatus } from '@/shared/api/students';
import type { StudentUI } from '@/shared/types/student-ui';

interface ChangeStatusModalProps {
    student: StudentUI;
    onClose: () => void;
    onSave: (studentId: string, newStatus: StudentUI['status']) => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ student, onClose, onSave }) => {
    const [selectedStatus, setSelectedStatus] = useState<StudentUI['status']>(student.status);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string>('');

    // Map UI status to backend enum
    const mapStatusToAPI = (status: StudentUI['status']): string => {
        switch(status) {
            case 'Đang học': return 'ACTIVE';
            case 'Đang chờ': return 'PENDING';
            case 'Nghỉ học': return 'DROPPED';
            default: return 'PENDING';
        }
    };

    const handleSave = async () => {
        if (selectedStatus === student.status) {
            onClose();
            return;
        }

        try {
            setIsSubmitting(true);
            setError('');
            
            const apiStatus = mapStatusToAPI(selectedStatus);
            await updateStudentStatus(parseInt(student.id), apiStatus);
            
            // Gọi onSave và đợi nó hoàn thành trước khi đóng modal
            await onSave(student.id, selectedStatus);
            onClose();
        } catch (err: any) {
            console.error('Error updating student status:', err);
            setError(err?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật trạng thái');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Chỉ cho phép chuyển từ "Đang chờ" sang "Nghỉ học"
    const getAvailableStatusOptions = () => {
        if (student.status === 'Đang chờ') {
            return [
                {
                    value: 'Nghỉ học' as StudentUI['status'],
                    label: 'Nghỉ học',
                    description: 'Học viên không tiếp tục học tập'
                }
            ];
        }
        return []; // Không cho phép thay đổi trạng thái khác
    };

    const statusOptions = getAvailableStatusOptions();

    return (
        <div className="bg-white rounded-lg w-96 max-w-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 justify-center">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                        <UserCheck size={16} />
                    </div>
                    <div className="text-center">
                        <h3 className="text-lg font-semibold text-gray-900">Thay đổi trạng thái</h3>
                        <p className="text-sm text-gray-500">Cập nhật trạng thái học viên</p>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                >
                    <X size={16} />
                </button>
            </div>

            {/* Content */}
            <div className="px-6 py-6">
                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <p className="text-sm text-red-600">{error}</p>
                    </div>
                )}

                {/* Student Info */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4 justify-center">
                        <div className="h-12 w-12 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-lg font-medium">
                            {student.initial}
                        </div>
                        <div className="text-center">
                            <div className="text-lg font-medium text-gray-900">{student.name}</div>
                            <div className="text-sm text-gray-500">{student.studentId}</div>
                            <div className="text-sm text-gray-500">{student.email}</div>
                        </div>
                    </div>
                </div>

                {/* Status Selection */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                            Chọn trạng thái mới
                        </label>
                        {statusOptions.length > 0 ? (
                            <div className="space-y-3">
                                {statusOptions.map((option) => (
                                    <label
                                        key={option.value}
                                        className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors ${
                                            selectedStatus === option.value
                                                ? 'border-blue-500 bg-blue-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="status"
                                            value={option.value}
                                            checked={selectedStatus === option.value}
                                            onChange={(e) => setSelectedStatus(e.target.value as StudentUI['status'])}
                                            className="mt-1"
                                        />
                                        <div className="flex-1">
                                            <div className="font-medium text-gray-900">{option.label}</div>
                                            <div className="text-sm text-gray-500">{option.description}</div>
                                        </div>
                                    </label>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8 text-gray-500">
                                <p className="text-sm">Không thể thay đổi trạng thái từ "{student.status}"</p>
                                <p className="text-xs mt-1">Trạng thái này được quản lý tự động dựa trên lớp học</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                    Hủy
                </button>
                {statusOptions.length > 0 && (
                    <button
                        onClick={handleSave}
                        disabled={selectedStatus === student.status || isSubmitting}
                        className="px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-black disabled:bg-gray-300 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật trạng thái'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ChangeStatusModal;
