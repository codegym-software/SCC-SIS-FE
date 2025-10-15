import React, { useState } from 'react';
import { X, UserCheck } from 'lucide-react';

type Student = {
    id: string;
    studentId: string;
    name: string;
    email: string;
    phone: string;
    initial: string;
    class: string;
    program: string;
    registrationDate: string;
    status: 'Đang học' | 'Bảo lưu' | 'Tốt nghiệp' | 'Tạm dừng';
};

interface ChangeStatusModalProps {
    student: Student;
    onClose: () => void;
    onSave: (studentId: string, newStatus: Student['status']) => void;
}

const ChangeStatusModal: React.FC<ChangeStatusModalProps> = ({ student, onClose, onSave }) => {
    const [selectedStatus, setSelectedStatus] = useState<Student['status']>(student.status);

    const handleSave = () => {
        if (selectedStatus !== student.status) {
            onSave(student.id, selectedStatus);
        }
        onClose();
    };

    const statusOptions: { value: Student['status']; label: string; description: string }[] = [
        {
            value: 'Đang học',
            label: 'Đang học',
            description: 'Học viên đang tham gia khóa học'
        },
        {
            value: 'Bảo lưu',
            label: 'Bảo lưu',
            description: 'Học viên tạm dừng học tập'
        },
        {
            value: 'Tốt nghiệp',
            label: 'Tốt nghiệp',
            description: 'Học viên đã hoàn thành khóa học'
        },
        {
            value: 'Tạm dừng',
            label: 'Tạm dừng',
            description: 'Học viên tạm dừng do lý do cá nhân'
        }
    ];

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
                                        onChange={(e) => setSelectedStatus(e.target.value as Student['status'])}
                                        className="mt-1"
                                    />
                                    <div className="flex-1">
                                        <div className="font-medium text-gray-900">{option.label}</div>
                                        <div className="text-sm text-gray-500">{option.description}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
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
                <button
                    onClick={handleSave}
                    disabled={selectedStatus === student.status}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                    Cập nhật trạng thái
                </button>
            </div>
        </div>
    );
};

export default ChangeStatusModal;
