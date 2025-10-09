import React, { useState } from 'react';
import { X, Plus, GraduationCap, Check } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

type ClassInstructor = {
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
    instructors: ClassInstructor[];
    status: 'Chuẩn bị' | 'Đang học' | 'Hoàn thành' | 'Tạm dừng';
};

type Instructor = {
    id: string;
    name: string;
    email: string;
    specialization: string;
    initial: string;
    assigned: boolean;
};

interface AssignInstructorModalProps {
    classItem: Class;
    onClose?: () => void;
}

const AssignInstructorModal: React.FC<AssignInstructorModalProps> = ({ classItem, onClose }) => {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    
    // Mock data for instructors
    const [instructors, setInstructors] = useState<Instructor[]>([
        {
            id: '1',
            name: 'Nguyễn Văn A',
            email: 'a.nguyen@education.vn',
            specialization: 'Java Programming',
            initial: 'N',
            assigned: false
        },
        {
            id: '2',
            name: 'Trần Thị B',
            email: 'b.tran@education.vn',
            specialization: 'Web Development',
            initial: 'T',
            assigned: true
        },
        {
            id: '3',
            name: 'Lê Văn C',
            email: 'c.le@education.vn',
            specialization: 'Database Management',
            initial: 'L',
            assigned: false
        },
        {
            id: '4',
            name: 'Võ Thị D',
            email: 'd.vo@education.vn',
            specialization: 'Mobile Development',
            initial: 'V',
            assigned: false
        }
    ]);

    const assignedInstructors = instructors.filter(i => i.assigned);
    const availableInstructors = instructors.filter(i => !i.assigned);

    const handleAssignInstructor = () => {
        setShowAssignModal(true);
    };

    const handleSelectInstructor = (instructorId: string) => {
        setSelectedInstructors(prev => 
            prev.includes(instructorId) 
                ? prev.filter(id => id !== instructorId)
                : [...prev, instructorId]
        );
    };

    const handleConfirmAssign = () => {
        // Update instructor assignment status
        setInstructors(prev => 
            prev.map(instructor => 
                selectedInstructors.includes(instructor.id)
                    ? { ...instructor, assigned: true }
                    : instructor
            )
        );
        
        setSelectedInstructors([]);
        setShowAssignModal(false);
    };

    const handleRemoveInstructor = (instructorId: string) => {
        setInstructors(prev => 
            prev.map(instructor => 
                instructor.id === instructorId
                    ? { ...instructor, assigned: false }
                    : instructor
            )
        );
    };

    return (
        <>
            <div className="bg-white rounded-lg">
                {/* Modal Header */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 grid place-items-center">
                            <GraduationCap size={16} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">
                                Phân công Giảng viên - {classItem.name}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                Xem và quản lý danh sách giảng viên được phân công cho lớp học
                            </p>
                        </div>
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

                {/* Instructor Count and Assign Button */}
                <div className="px-4 py-3 border-b flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                        Giảng viên: {assignedInstructors.length} người
                    </div>
                    <button
                        onClick={handleAssignInstructor}
                        className="flex items-center gap-2 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium"
                    >
                        <Plus size={16} />
                        Phân công giảng viên
                    </button>
                </div>

                {/* Instructors List */}
                <div className="max-h-96 overflow-y-auto">
                    <div className="px-4 py-2 border-b bg-gray-50 text-xs text-gray-500 grid grid-cols-12 gap-4">
                        <div className="col-span-6">Giảng viên</div>
                        <div className="col-span-3">Chuyên môn</div>
                        <div className="col-span-3">Thao tác</div>
                    </div>

                    <div className="divide-y">
                        {assignedInstructors.map((instructor) => (
                            <div key={instructor.id} className="px-4 py-3 grid grid-cols-12 gap-4 items-center">
                                {/* Instructor Info */}
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 grid place-items-center text-sm font-medium">
                                        {instructor.initial}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                        <div className="text-xs text-gray-500">{instructor.email}</div>
                                    </div>
                                </div>

                                {/* Specialization */}
                                <div className="col-span-3">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700">
                                        {instructor.specialization}
                                    </span>
                                </div>

                                {/* Actions */}
                                <div className="col-span-3">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <button className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center">
                                                <span className="text-gray-400">⋯</span>
                                            </button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48">
                                            <DropdownMenuItem 
                                                onClick={() => handleRemoveInstructor(instructor.id)}
                                                className="text-red-600"
                                            >
                                                <X size={14} className="mr-2" />
                                                Hủy phân công
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
            </div>

            {/* Assign Instructor Selection Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50">
                    <div className="bg-white rounded-lg max-w-2xl w-full mx-4">
                        {/* Selection Modal Header */}
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Phân công Giảng viên cho Lớp</h3>
                                <p className="text-sm text-gray-500 mt-1">
                                    Chọn giảng viên để phân công cho lớp {classItem.name}
                                </p>
                            </div>
                            <button 
                                className="text-gray-400 hover:text-gray-600 p-1 rounded hover:bg-gray-100"
                                onClick={() => setShowAssignModal(false)}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Available Instructors */}
                        <div className="px-4 py-3 border-b">
                            <div className="text-sm text-gray-600">
                                Có {availableInstructors.length} giảng viên có thể phân công cho lớp
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            <div className="divide-y">
                                {availableInstructors.map((instructor) => (
                                    <div key={instructor.id} className="px-4 py-3 flex items-center gap-4">
                                        {/* Checkbox */}
                                        <div className="flex items-center">
                                            <button
                                                onClick={() => handleSelectInstructor(instructor.id)}
                                                className={`h-5 w-5 rounded border-2 flex items-center justify-center ${
                                                    selectedInstructors.includes(instructor.id)
                                                        ? 'bg-red-500 border-red-500 text-white'
                                                        : 'border-gray-300 hover:border-red-400'
                                                }`}
                                            >
                                                {selectedInstructors.includes(instructor.id) && (
                                                    <Check size={12} />
                                                )}
                                            </button>
                                        </div>

                                        {/* Instructor Info */}
                                        <div className="flex items-center gap-3 flex-1">
                                            <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-700 grid place-items-center text-sm font-medium">
                                                {instructor.initial}
                                            </div>
                                            <div className="flex-1">
                                                <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                                <div className="text-xs text-gray-500">{instructor.email}</div>
                                            </div>
                                        </div>

                                        {/* Specialization */}
                                        <div>
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-purple-50 text-purple-700">
                                                {instructor.specialization}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Selection Modal Footer */}
                        <div className="px-4 py-3 border-t flex justify-end gap-2">
                            <button
                                onClick={() => setShowAssignModal(false)}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleConfirmAssign}
                                disabled={selectedInstructors.length === 0}
                                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
                            >
                                Phân công {selectedInstructors.length} giảng viên
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignInstructorModal;
