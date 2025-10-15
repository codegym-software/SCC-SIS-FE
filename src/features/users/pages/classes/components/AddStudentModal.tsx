import React, { useState, useEffect } from 'react';
import { X, Search, User, Mail, Phone, Check } from 'lucide-react';

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

type Class = {
    id: string;
    name: string;
    description: string;
    program: string;
    startDate: string;
    schedule: string;
    location: string;
    students: number;
    maxStudents: number;
    instructors: any[];
    status: 'Chuẩn bị' | 'Đang học' | 'Hoàn thành' | 'Tạm dừng';
};

interface AddStudentModalProps {
    open: boolean;
    onClose: () => void;
    classItem: Class;
    onAddStudents: (studentIds: string[]) => void;
}

const AddStudentModal: React.FC<AddStudentModalProps> = ({
    open,
    onClose,
    classItem,
    onAddStudents
}) => {
    const [query, setQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mock data for students (in real app, this would come from API)
    const [allStudents, setAllStudents] = useState<Student[]>([
        {
            id: '1',
            studentId: 'SV001',
            name: 'Pham Minh Đức',
            email: 'duc.pham@student.edu',
            phone: '0911111111',
            initial: 'P',
            class: '',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-01-15',
            status: 'Đang học',
        },
        {
            id: '2',
            studentId: 'SV002',
            name: 'Hoàng Thị Mai',
            email: 'mai.hoang@student.edu',
            phone: '0922222222',
            initial: 'H',
            class: '',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-01-15',
            status: 'Đang học',
        },
        {
            id: '3',
            studentId: 'SV003',
            name: 'Vũ Đình Nam',
            email: 'nam.vu@student.edu',
            phone: '0933333333',
            initial: 'V',
            class: '',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-01-15',
            status: 'Bảo lưu',
        },
        {
            id: '4',
            studentId: 'SV004',
            name: 'Nguyễn Thu Hằng',
            email: 'hang.nguyen@student.edu',
            phone: '0944444444',
            initial: 'N',
            class: '',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-02-01',
            status: 'Đang học',
        },
        {
            id: '5',
            studentId: 'SV005',
            name: 'Trần Văn Bình',
            email: 'binh.tran@student.edu',
            phone: '0955555555',
            initial: 'T',
            class: '',
            program: 'Digital Marketing',
            registrationDate: '2024-02-10',
            status: 'Đang học',
        },
        {
            id: '6',
            studentId: 'SV006',
            name: 'Lê Thị Cẩm',
            email: 'cam.le@student.edu',
            phone: '0966666666',
            initial: 'L',
            class: '',
            program: 'Thiết kế Đồ họa',
            registrationDate: '2024-02-15',
            status: 'Đang học',
        },
        {
            id: '7',
            studentId: 'SV007',
            name: 'Phạm Văn Dũng',
            email: 'dung.pham@student.edu',
            phone: '0977777777',
            initial: 'P',
            class: '',
            program: 'Công nghệ Thông tin',
            registrationDate: '2024-02-20',
            status: 'Tạm dừng',
        },
        {
            id: '8',
            studentId: 'SV008',
            name: 'Nguyễn Thị Em',
            email: 'em.nguyen@student.edu',
            phone: '0988888888',
            initial: 'N',
            class: '',
            program: 'Data Science',
            registrationDate: '2024-03-01',
            status: 'Đang học',
        },
    ]);

    // Filter students based on search and status
    const filteredStudents = allStudents.filter(student => {
        const matchesQuery = 
            student.name.toLowerCase().includes(query.toLowerCase()) ||
            student.email.toLowerCase().includes(query.toLowerCase()) ||
            student.studentId.toLowerCase().includes(query.toLowerCase());
        
        const matchesStatus = statusFilter === 'Tất cả trạng thái' || student.status === statusFilter;
        
        return matchesQuery && matchesStatus;
    });

    const handleStudentSelect = (studentId: string) => {
        setSelectedStudents(prev => 
            prev.includes(studentId) 
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === filteredStudents.length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents(filteredStudents.map(s => s.id));
        }
    };

    const handleSubmit = async () => {
        if (selectedStudents.length === 0) return;
        
        setIsSubmitting(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));
            onAddStudents(selectedStudents);
            onClose();
        } catch (error) {
            console.error('Error adding students:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedStudents([]);
        setQuery('');
        setStatusFilter('Tất cả trạng thái');
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70]">
            <div className="fixed inset-0 bg-black/50" onClick={handleClose} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="w-full max-w-4xl rounded-lg bg-white shadow-xl border max-h-[90vh] overflow-hidden">
                    {/* Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-semibold">Thêm học viên vào lớp</h2>
                            <p className="text-sm text-gray-500">{classItem.name}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
                        >
                            <X size={16} />
                        </button>
                    </div>

                    {/* Search and Filter */}
                    <div className="px-6 py-4 border-b space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Tìm kiếm theo tên, email, mã SV..."
                                />
                            </div>
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 rounded-md border px-3 text-sm"
                            >
                                <option>Tất cả trạng thái</option>
                                <option>Đang học</option>
                                <option>Bảo lưu</option>
                                <option>Tốt nghiệp</option>
                                <option>Tạm dừng</option>
                            </select>
                        </div>
                        
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    {selectedStudents.length === filteredStudents.length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                </button>
                                <span className="text-sm text-gray-500">
                                    ({selectedStudents.length} học viên đã chọn)
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="px-6 py-4 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                            {filteredStudents.map((student) => (
                                <div
                                    key={student.id}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                                        selectedStudents.includes(student.id)
                                            ? 'border-blue-500 bg-blue-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                    }`}
                                    onClick={() => handleStudentSelect(student.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${
                                            selectedStudents.includes(student.id)
                                                ? 'bg-gray-900 text-white'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}>
                                            {selectedStudents.includes(student.id) ? (
                                                <Check size={16} />
                                            ) : (
                                                student.initial
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{student.name}</h3>
                                                <span className="text-xs text-gray-500">({student.studentId})</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {student.email}
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Phone size={12} />
                                                    {student.phone}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                student.status === 'Đang học' ? 'bg-green-100 text-green-700' :
                                                student.status === 'Bảo lưu' ? 'bg-orange-100 text-orange-700' :
                                                student.status === 'Tốt nghiệp' ? 'bg-blue-100 text-blue-700' :
                                                'bg-gray-100 text-gray-700'
                                            }`}>
                                                {student.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        {filteredStudents.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                Không tìm thấy học viên nào
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t flex items-center justify-end gap-3">
                        <button
                            onClick={handleClose}
                            className="h-9 px-4 rounded-md border bg-white hover:bg-gray-50 text-sm"
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={selectedStudents.length === 0 || isSubmitting}
                            className="h-9 px-4 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                        >
                            {isSubmitting ? 'Đang thêm...' : `Thêm ${selectedStudents.length} học viên`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AddStudentModal;

