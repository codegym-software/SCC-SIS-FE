import React, { useState } from 'react';
import { X, Plus, GraduationCap, Check, Edit } from 'lucide-react';
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
    startDate?: string;
    note?: string;
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
    const [instructorDetails, setInstructorDetails] = useState<{[key: string]: {startDate: string, note: string}}>({});
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingInstructor, setEditingInstructor] = useState<ClassInstructor | null>(null);
    const [editFormData, setEditFormData] = useState({startDate: '', note: ''});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    
    // Mock data for instructors - 36 instructors
    const [instructors, setInstructors] = useState<Instructor[]>([
        { id: '1', name: 'Nguyễn Văn A', email: 'a.nguyen@education.vn', specialization: 'Java Programming', initial: 'N', assigned: false },
        { id: '2', name: 'Trần Thị B', email: 'b.tran@education.vn', specialization: 'Web Development', initial: 'T', assigned: true },
        { id: '3', name: 'Lê Văn C', email: 'c.le@education.vn', specialization: 'Database Management', initial: 'L', assigned: false },
        { id: '4', name: 'Võ Thị D', email: 'd.vo@education.vn', specialization: 'Mobile Development', initial: 'V', assigned: false },
        { id: '5', name: 'Phạm Văn E', email: 'e.pham@education.vn', specialization: 'Python Programming', initial: 'P', assigned: false },
        { id: '6', name: 'Hoàng Thị F', email: 'f.hoang@education.vn', specialization: 'React Development', initial: 'H', assigned: false },
        { id: '7', name: 'Đỗ Văn G', email: 'g.do@education.vn', specialization: 'Node.js Development', initial: 'Đ', assigned: false },
        { id: '8', name: 'Bùi Thị H', email: 'h.bui@education.vn', specialization: 'Vue.js Development', initial: 'B', assigned: false },
        { id: '9', name: 'Ngô Văn I', email: 'i.ngo@education.vn', specialization: 'Angular Development', initial: 'N', assigned: false },
        { id: '10', name: 'Dương Thị J', email: 'j.duong@education.vn', specialization: 'PHP Development', initial: 'D', assigned: false },
        { id: '11', name: 'Vũ Văn K', email: 'k.vu@education.vn', specialization: 'Laravel Development', initial: 'V', assigned: false },
        { id: '12', name: 'Lý Thị L', email: 'l.ly@education.vn', specialization: 'Django Development', initial: 'L', assigned: false },
        { id: '13', name: 'Trịnh Văn M', email: 'm.trinh@education.vn', specialization: 'Spring Boot', initial: 'T', assigned: false },
        { id: '14', name: 'Đinh Thị N', email: 'n.dinh@education.vn', specialization: 'ASP.NET Core', initial: 'Đ', assigned: false },
        { id: '15', name: 'Phan Văn O', email: 'o.phan@education.vn', specialization: 'Ruby on Rails', initial: 'P', assigned: false },
        { id: '16', name: 'Tôn Thị P', email: 'p.ton@education.vn', specialization: 'Flutter Development', initial: 'T', assigned: false },
        { id: '17', name: 'Lưu Văn Q', email: 'q.luu@education.vn', specialization: 'React Native', initial: 'L', assigned: false },
        { id: '18', name: 'Cao Thị R', email: 'r.cao@education.vn', specialization: 'Xamarin Development', initial: 'C', assigned: false },
        { id: '19', name: 'Đặng Văn S', email: 's.dang@education.vn', specialization: 'Unity Development', initial: 'Đ', assigned: false },
        { id: '20', name: 'Bạch Thị T', email: 't.bach@education.vn', specialization: 'Game Development', initial: 'B', assigned: false },
        { id: '21', name: 'Lâm Văn U', email: 'u.lam@education.vn', specialization: 'Machine Learning', initial: 'L', assigned: false },
        { id: '22', name: 'Hồ Thị V', email: 'v.ho@education.vn', specialization: 'Deep Learning', initial: 'H', assigned: false },
        { id: '23', name: 'Mai Văn W', email: 'w.mai@education.vn', specialization: 'Data Science', initial: 'M', assigned: false },
        { id: '24', name: 'Lê Thị X', email: 'x.le@education.vn', specialization: 'Big Data', initial: 'L', assigned: false },
        { id: '25', name: 'Nguyễn Văn Y', email: 'y.nguyen@education.vn', specialization: 'Cloud Computing', initial: 'N', assigned: false },
        { id: '26', name: 'Trần Thị Z', email: 'z.tran@education.vn', specialization: 'DevOps', initial: 'T', assigned: false },
        { id: '27', name: 'Phạm Văn AA', email: 'aa.pham@education.vn', specialization: 'Docker', initial: 'P', assigned: false },
        { id: '28', name: 'Hoàng Thị BB', email: 'bb.hoang@education.vn', specialization: 'Kubernetes', initial: 'H', assigned: false },
        { id: '29', name: 'Đỗ Văn CC', email: 'cc.do@education.vn', specialization: 'AWS', initial: 'Đ', assigned: false },
        { id: '30', name: 'Bùi Thị DD', email: 'dd.bui@education.vn', specialization: 'Azure', initial: 'B', assigned: false },
        { id: '31', name: 'Ngô Văn EE', email: 'ee.ngo@education.vn', specialization: 'Google Cloud', initial: 'N', assigned: false },
        { id: '32', name: 'Dương Thị FF', email: 'ff.duong@education.vn', specialization: 'Cybersecurity', initial: 'D', assigned: false },
        { id: '33', name: 'Vũ Văn GG', email: 'gg.vu@education.vn', specialization: 'Network Security', initial: 'V', assigned: false },
        { id: '34', name: 'Lý Thị HH', email: 'hh.ly@education.vn', specialization: 'Ethical Hacking', initial: 'L', assigned: false },
        { id: '35', name: 'Trịnh Văn II', email: 'ii.trinh@education.vn', specialization: 'Blockchain', initial: 'T', assigned: false },
        { id: '36', name: 'Đinh Thị JJ', email: 'jj.dinh@education.vn', specialization: 'Cryptocurrency', initial: 'Đ', assigned: false }
    ]);

    const assignedInstructors = instructors.filter(i => i.assigned);
    const filteredInstructors = instructors.filter(i => 
        !i.assigned && 
        (i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
         i.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
         i.specialization.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    
    // Pagination logic
    const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const availableInstructors = filteredInstructors.slice(startIndex, endIndex);

    const handleAssignInstructor = () => {
        setShowAssignModal(true);
        setCurrentPage(1); // Reset to first page when opening modal
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        setCurrentPage(1); // Reset to first page when searching
    };

    const handleSelectInstructor = (instructorId: string) => {
        setSelectedInstructors(prev => 
            prev.includes(instructorId) 
                ? prev.filter(id => id !== instructorId)
                : [...prev, instructorId]
        );
    };

    const handleConfirmAssign = () => {
        // Update instructor assignment status with details
        setInstructors(prev => 
            prev.map(instructor => 
                selectedInstructors.includes(instructor.id)
                    ? { 
                        ...instructor, 
                        assigned: true,
                        startDate: instructorDetails[instructor.id]?.startDate || '',
                        note: instructorDetails[instructor.id]?.note || ''
                    }
                    : instructor
            )
        );
        
        // Clear selection and details
        setSelectedInstructors([]);
        setInstructorDetails({});
        setShowAssignModal(false);
        
        console.log('Instructors updated:', instructors);
    };

    const handleEditInstructor = (instructorId: string) => {
        const instructor = instructors.find(inst => inst.id === instructorId);
        if (instructor) {
            setEditingInstructor(instructor);
            setEditFormData({
                startDate: instructor.startDate || '',
                note: instructor.note || ''
            });
            setShowEditModal(true);
        }
    };

    const handleSaveEdit = () => {
        if (editingInstructor) {
            setInstructors(prev => 
                prev.map(instructor => 
                    instructor.id === editingInstructor.id
                        ? { ...instructor, startDate: editFormData.startDate, note: editFormData.note }
                        : instructor
                )
            );
            setShowEditModal(false);
            setEditingInstructor(null);
            setEditFormData({startDate: '', note: ''});
        }
    };

    const handleRemoveInstructor = (instructorId: string) => {
        setInstructors(prev => 
            prev.map(instructor => 
                instructor.id === instructorId
                    ? { ...instructor, assigned: false, startDate: '', note: '' }
                    : instructor
            )
        );
        
        // Also clear from instructorDetails if exists
        setInstructorDetails(prev => {
            const newDetails = { ...prev };
            delete newDetails[instructorId];
            return newDetails;
        });
    };

    return (
        <>
            <div className="bg-white rounded-lg max-w-6xl w-full">
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
                    <div className="px-6 py-3 border-b bg-gray-50 text-sm font-medium text-gray-700 grid grid-cols-12 gap-6">
                        <div className="col-span-4">Giảng viên</div>
                        <div className="col-span-2">Chuyên môn</div>
                        <div className="col-span-2">Ngày bắt đầu</div>
                        <div className="col-span-3">Ghi chú</div>
                        <div className="col-span-1">Thao tác</div>
                    </div>

                    <div className="divide-y">
                        {assignedInstructors.map((instructor) => (
                            <div key={instructor.id} className="px-6 py-4 grid grid-cols-12 gap-6 items-center hover:bg-gray-50">
                                {/* Instructor Info */}
                                <div className="col-span-4 flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 grid place-items-center text-sm font-medium">
                                        {instructor.initial}
                                    </div>
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                        <div className="text-xs text-gray-500">{instructor.email}</div>
                                    </div>
                                </div>

                                {/* Specialization */}
                                <div className="col-span-2">
                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-700 font-medium">
                                        {instructor.specialization}
                                    </span>
                                </div>

                                {/* Start Date */}
                                <div className="col-span-2">
                                    <div className="px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                                        {instructor.startDate ? (
                                            <span className="text-gray-900">
                                                {new Date(instructor.startDate).toLocaleDateString('vi-VN')}
                                            </span>
                                        ) : (
                                            <span className="text-gray-400 italic">Chưa có ngày bắt đầu</span>
                                        )}
                                    </div>
                                </div>

                                {/* Note */}
                                <div className="col-span-3">
                                    <div className="px-3 py-2 text-sm text-gray-900 bg-gray-50 rounded-md min-h-[40px] flex items-center">
                                        {instructor.note ? (
                                            <span className="text-gray-900">{instructor.note}</span>
                                        ) : (
                                            <span className="text-gray-400 italic">Chưa có ghi chú</span>
                                        )}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="col-span-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center">
                                            <span className="text-gray-400">⋯</span>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent className="w-48">
                                            <DropdownMenuItem 
                                                onClick={() => handleEditInstructor(instructor.id)}
                                                className="text-blue-600"
                                            >
                                                <Edit size={14} className="mr-2" />
                                                Chỉnh sửa thông tin
                                            </DropdownMenuItem>
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
                    <div className="bg-white rounded-lg max-w-6xl w-full mx-4">
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
                            <div className="flex items-center justify-between mb-3">
                                <div className="text-sm text-gray-600">
                                    Có {availableInstructors.length} giảng viên có thể phân công cho lớp
                                </div>
                            </div>
                            
                            {/* Search Box */}
                            <div className="relative">
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm giảng viên theo tên, email hoặc chuyên môn..."
                                    value={searchTerm}
                                    onChange={(e) => handleSearchChange(e.target.value)}
                                    className="w-full px-4 py-2 pl-10 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                />
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </div>
                                {searchTerm && (
                                    <button
                                        onClick={() => handleSearchChange('')}
                                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    >
                                        <X size={16} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto">
                            {availableInstructors.length === 0 ? (
                                <div className="px-6 py-8 text-center">
                                    <div className="text-gray-400 mb-2">
                                        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                        </svg>
                                    </div>
                                    <p className="text-sm text-gray-500">
                                        {searchTerm ? 'Không tìm thấy giảng viên phù hợp' : 'Không có giảng viên khả dụng'}
                                    </p>
                                    {searchTerm && (
                                        <button
                                            onClick={() => handleSearchChange('')}
                                            className="mt-2 text-sm text-purple-600 hover:text-purple-700"
                                        >
                                            Xóa bộ lọc
                                        </button>
                                    )}
                                </div>
                            ) : (
                                <div className="divide-y">
                                    {availableInstructors.map((instructor) => (
                                    <div key={instructor.id}>
                                        <div className="px-6 py-4 flex items-center gap-6">
                                            {/* Checkbox */}
                                            <div className="flex items-center">
                                                <button
                                                    onClick={() => handleSelectInstructor(instructor.id)}
                                                    className={`h-6 w-6 rounded border-2 flex items-center justify-center ${
                                                        selectedInstructors.includes(instructor.id)
                                                            ? 'bg-red-500 border-red-500 text-white'
                                                            : 'border-gray-300 hover:border-red-400'
                                                    }`}
                                                >
                                                    {selectedInstructors.includes(instructor.id) && (
                                                        <Check size={14} />
                                                    )}
                                                </button>
                                            </div>

                                            {/* Instructor Info */}
                                            <div className="flex items-center gap-4 flex-1">
                                                <div className="h-10 w-10 rounded-full bg-purple-100 text-purple-700 grid place-items-center text-sm font-medium">
                                                    {instructor.initial}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-sm font-medium text-gray-900">{instructor.name}</div>
                                                    <div className="text-xs text-gray-500">{instructor.email}</div>
                                                </div>
                                            </div>

                                            {/* Specialization */}
                                            <div>
                                                <span className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-purple-50 text-purple-700 font-medium">
                                                    {instructor.specialization}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Form for selected instructor */}
                                        {selectedInstructors.includes(instructor.id) && (
                                            <div className="px-6 py-4 bg-gray-50 border-l-4 border-red-500">
                                                <div className="grid grid-cols-3 gap-6">
                                                    <div>
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Ngày bắt đầu
                                                        </label>
                                                        <input
                                                            type="date"
                                                            value={instructorDetails[instructor.id]?.startDate || ''}
                                                            onChange={(e) => setInstructorDetails(prev => ({
                                                                ...prev,
                                                                [instructor.id]: {
                                                                    ...prev[instructor.id],
                                                                    startDate: e.target.value
                                                                }
                                                            }))}
                                                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                        />
                                                    </div>
                                                    <div className="col-span-2">
                                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                                            Ghi chú
                                                        </label>
                                                        <input
                                                            type="text"
                                                            value={instructorDetails[instructor.id]?.note || ''}
                                                            onChange={(e) => setInstructorDetails(prev => ({
                                                                ...prev,
                                                                [instructor.id]: {
                                                                    ...prev[instructor.id],
                                                                    note: e.target.value
                                                                }
                                                            }))}
                                                            className="w-full px-4 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                            placeholder="Nhập ghi chú cho giảng viên..."
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                                </div>
                            )}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="px-4 py-3 border-t bg-gray-50">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        Hiển thị {startIndex + 1} - {Math.min(endIndex, filteredInstructors.length)} trong số {filteredInstructors.length} giảng viên
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => handlePageChange(currentPage - 1)}
                                            disabled={currentPage === 1}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Previous
                                        </button>
                                        
                                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-1 text-sm border rounded ${
                                                    currentPage === page
                                                        ? 'bg-purple-600 text-white border-purple-600'
                                                        : 'border-gray-300 hover:bg-gray-100'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                        
                                        <button
                                            onClick={() => handlePageChange(currentPage + 1)}
                                            disabled={currentPage === totalPages}
                                            className="px-3 py-1 text-sm border border-gray-300 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Next
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

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

            {/* Edit Instructor Modal */}
            {showEditModal && editingInstructor && (
                <div className="fixed inset-0 z-50">
                    <div className="fixed inset-0 bg-black/30" onClick={() => setShowEditModal(false)} />
                    <div className="fixed inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border">
                            {/* Header */}
                            <div className="px-6 py-4 border-b flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 rounded-lg bg-purple-100 text-purple-700 grid place-items-center">
                                        <Edit size={16} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-900">Chỉnh sửa thông tin giảng viên</h3>
                                        <p className="text-sm text-gray-500">Cập nhật ngày bắt đầu và ghi chú</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center"
                                >
                                    <X size={16} />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="px-6 py-6">
                                {/* Instructor Info */}
                                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <div className="h-12 w-12 rounded-full bg-purple-100 text-purple-700 grid place-items-center text-lg font-medium">
                                            {editingInstructor.initial}
                                        </div>
                                        <div>
                                            <div className="text-lg font-medium text-gray-900">{editingInstructor.name}</div>
                                            <div className="text-sm text-gray-500">Giảng viên đã được phân công</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Form */}
                                <div className="space-y-6">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ngày bắt đầu
                                        </label>
                                        <input
                                            type="date"
                                            value={editFormData.startDate}
                                            onChange={(e) => setEditFormData(prev => ({...prev, startDate: e.target.value}))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Ghi chú
                                        </label>
                                        <textarea
                                            value={editFormData.note}
                                            onChange={(e) => setEditFormData(prev => ({...prev, note: e.target.value}))}
                                            placeholder="Nhập ghi chú cho giảng viên..."
                                            rows={4}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-end gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveEdit}
                                    className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AssignInstructorModal;
