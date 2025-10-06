import React from 'react';
import { X, Mail, Phone, Calendar, User } from 'lucide-react';

type Student = {
    id: string;
    name: string;
    email: string;
    phone: string;
    initial: string;
    status: 'Đang học' | 'Tạm dừng' | 'Hoàn thành';
    registrationDate: string;
};

interface StudentDetailsModalProps {
    student: Student;
    onClose?: () => void;
}

const StudentDetailsModal: React.FC<StudentDetailsModalProps> = ({ student, onClose }) => {
    return (
        <div className="bg-white rounded-lg max-w-md w-full">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                        <User size={16} />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Chi tiết Học viên</h2>
                        <p className="text-sm text-gray-500">Thông tin chi tiết của học viên</p>
                    </div>
                </div>
                <button 
                    className="text-gray-400 hover:text-gray-600"
                    onClick={onClose}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Student Profile */}
            <div className="px-4 py-4">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-2xl font-bold">
                        {student.initial}
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            student.status === 'Đang học' 
                                ? 'bg-green-50 text-green-700' 
                                : student.status === 'Tạm dừng'
                                ? 'bg-yellow-50 text-yellow-700'
                                : 'bg-gray-50 text-gray-700'
                        }`}>
                            {student.status}
                        </span>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-3">
                    {/* Email */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 text-gray-600 grid place-items-center">
                            <Mail size={14} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Email</div>
                            <div className="text-sm font-medium text-gray-900">{student.email}</div>
                        </div>
                    </div>

                    {/* Phone */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 text-gray-600 grid place-items-center">
                            <Phone size={14} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Điện thoại</div>
                            <div className="text-sm font-medium text-gray-900">{student.phone}</div>
                        </div>
                    </div>

                    {/* Registration Date */}
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-gray-50 text-gray-600 grid place-items-center">
                            <Calendar size={14} />
                        </div>
                        <div>
                            <div className="text-xs text-gray-500">Ngày đăng ký</div>
                            <div className="text-sm font-medium text-gray-900">{student.registrationDate}</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t flex justify-end">
                <button
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Đóng
                </button>
            </div>
        </div>
    );
};

export default StudentDetailsModal;
