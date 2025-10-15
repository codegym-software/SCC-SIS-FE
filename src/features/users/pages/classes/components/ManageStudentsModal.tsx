import React, { useState } from 'react';
import { X, Plus, Eye, UserMinus } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StudentDetailsModal from './StudentDetailsModal';
import AddStudentModal from './AddStudentModal';

type Instructor = {
    id: string;
    name: string;
    initial: string;
    avatar?: string;
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
    instructors: Instructor[];
    status: 'Chuẩn bị' | 'Đang học' | 'Hoàn thành' | 'Tạm dừng';
};

type Student = {
    id: string;
    name: string;
    email: string;
    phone: string;
    initial: string;
    status: 'Đang học' | 'Tạm dừng' | 'Hoàn thành';
    registrationDate: string;
};

interface ManageStudentsModalProps {
    classItem: Class;
    onClose?: () => void;
}

const ManageStudentsModal: React.FC<ManageStudentsModalProps> = ({ classItem, onClose }) => {
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
    const [openAddStudent, setOpenAddStudent] = useState(false);
    
    // Mock data for students
    const [students, setStudents] = useState<Student[]>([
        {
            id: '1',
            name: 'Phạm Minh Đức',
            email: 'duc.pham@student.edu',
            phone: '0911111111',
            initial: 'P',
            status: 'Đang học',
            registrationDate: '2024-01-15'
        },
        {
            id: '2',
            name: 'Hoàng Thị Mai',
            email: 'mai.hoang@student.edu',
            phone: '0922222222',
            initial: 'H',
            status: 'Đang học',
            registrationDate: '2024-01-16'
        },
        {
            id: '3',
            name: 'Nguyễn Văn An',
            email: 'an.nguyen@student.edu',
            phone: '0933333333',
            initial: 'N',
            status: 'Đang học',
            registrationDate: '2024-01-17'
        },
        {
            id: '4',
            name: 'Trần Thị Bình',
            email: 'binh.tran@student.edu',
            phone: '0944444444',
            initial: 'T',
            status: 'Đang học',
            registrationDate: '2024-01-18'
        },
        {
            id: '5',
            name: 'Lê Văn Cường',
            email: 'cuong.le@student.edu',
            phone: '0955555555',
            initial: 'L',
            status: 'Đang học',
            registrationDate: '2024-01-19'
        },
        {
            id: '6',
            name: 'Võ Thị Dung',
            email: 'dung.vo@student.edu',
            phone: '0966666666',
            initial: 'V',
            status: 'Đang học',
            registrationDate: '2024-01-20'
        }
    ]);

    const handleAddStudents = (studentIds: string[]) => {
        // Mock data for available students (from student profiles)
        const availableStudents = [
            {
                id: '7',
                name: 'Nguyễn Văn An',
                email: 'an.nguyen@student.edu',
                phone: '0977777777',
                initial: 'N',
                status: 'Đang học' as const,
                registrationDate: '2024-02-01'
            },
            {
                id: '8',
                name: 'Trần Thị Bích',
                email: 'bich.tran@student.edu',
                phone: '0988888888',
                initial: 'T',
                status: 'Đang học' as const,
                registrationDate: '2024-02-02'
            },
            {
                id: '9',
                name: 'Lê Văn Cường',
                email: 'cuong.le2@student.edu',
                phone: '0999999999',
                initial: 'L',
                status: 'Đang học' as const,
                registrationDate: '2024-02-03'
            }
        ];

        // Add selected students to the class
        const newStudents = availableStudents.filter(student => 
            studentIds.includes(student.id)
        );
        
        setStudents(prev => [...prev, ...newStudents]);
        setOpenAddStudent(false);
    };

    const handleViewDetails = (student: Student) => {
        setSelectedStudent(student);
    };

    const handleRemoveFromClass = (student: Student) => {
        console.log('Remove from class:', student.name);
        // TODO: Implement remove student from class
        setStudents(prev => prev.filter(s => s.id !== student.id));
    };

    const handleAddStudent = () => {
        setOpenAddStudent(true);
    };

    return (
        <div className="bg-white rounded-lg">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                        Quản lý Học viên - {classItem.name}
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                        Xem và quản lý danh sách học viên của lớp học
                    </p>
                </div>
                <button 
                    className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                    onClick={() => {
                        console.log('Close button clicked');
                        onClose?.();
                    }}
                >
                    <X size={20} />
                </button>
            </div>

            {/* Student Count and Add Button */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
                <div className="text-sm text-gray-600">
                    Sĩ số: {students.length}/{classItem.maxStudents} học viên
                </div>
                <button
                    onClick={handleAddStudent}
                    className="flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                    <Plus size={16} />
                    Thêm học viên
                </button>
            </div>

            {/* Students List */}
            <div className="max-h-96 overflow-y-auto">
                <div className="px-4 py-2 border-b bg-gray-50 text-xs text-gray-500 grid grid-cols-12 gap-4">
                    <div className="col-span-6">Học viên</div>
                    <div className="col-span-3">Trạng thái</div>
                    <div className="col-span-3">Thao tác</div>
                </div>

                <div className="divide-y">
                    {students.map((student) => (
                        <div key={student.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                            {/* Student Info */}
                            <div className="col-span-6 flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-medium">
                                    {student.initial}
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                    <div className="text-xs text-gray-500">{student.email}</div>
                                </div>
                            </div>

                            {/* Status */}
                            <div className="col-span-3">
                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-50 text-green-700">
                                    {student.status}
                                </span>
                            </div>

                            {/* Actions */}
                            <div className="col-span-3">
                                <DropdownMenu>
                                    <DropdownMenuTrigger className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center">
                                        <span className="text-gray-400">⋯</span>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent className="w-48">
                                        <DropdownMenuItem onClick={() => handleViewDetails(student)}>
                                            <Eye size={14} className="mr-2" />
                                            Xem chi tiết
                                        </DropdownMenuItem>
                                        <DropdownMenuItem 
                                            onClick={() => handleRemoveFromClass(student)}
                                            className="text-red-600"
                                        >
                                            <UserMinus size={14} className="mr-2" />
                                            Xóa khỏi lớp
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t flex justify-end">
                <button
                    onClick={() => {
                        console.log('Close footer button clicked');
                        onClose?.();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                    Đóng
                </button>
            </div>

            {/* Student Details Modal */}
            {selectedStudent && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50">
                    <StudentDetailsModal
                        student={selectedStudent}
                        onClose={() => setSelectedStudent(null)}
                    />
                </div>
            )}

            <AddStudentModal
                open={openAddStudent}
                onClose={() => setOpenAddStudent(false)}
                classItem={classItem}
                onAddStudents={handleAddStudents}
            />
        </div>
    );
};

export default ManageStudentsModal;
