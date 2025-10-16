import React, { useState, useEffect } from 'react';
import { X, Plus, GraduationCap, Check } from 'lucide-react';
import http from '@/shared/api/http';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

type ClassInstructor = {
    id: string;
    name: string;
    email: string;
    specialization: string;
    initial: string;
    assigned: boolean;
    avatar?: string;
    startDate?: string;
    note?: string;
};

interface APIClassInstructor {
    assignmentId: number;
    classId: number;
    lecturer: {
        id: number;
        fullName: string;
        email: string;
        avatarUrl?: string | null;
    };
    startDate: string;
    endDate?: string | null;
    active: boolean;
    note?: string | null;
    createdAt: string;
    assignedBy: string;
    revokedBy?: string | null;
    canEdit: boolean;
    canRemove: boolean;
}

interface APIAvailableLecturer {
    id: number;
    fullName: string;
    email: string;
    avatarUrl?: string | null;
}

type ClassItem = {
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
    classItem: ClassItem;
    onClose?: () => void;
    onUpdateInstructors?: (classId: string, updatedInstructors: Instructor[]) => void;
}

const AssignInstructorModal: React.FC<AssignInstructorModalProps> = ({ classItem, onClose, onUpdateInstructors }) => {
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedInstructors, setSelectedInstructors] = useState<string[]>([]);
    const [instructorDetails, setInstructorDetails] = useState<{ [key: string]: { startDate: string, note: string } }>({});
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;
    const [removeConfirm, setRemoveConfirm] = useState<Instructor | null>(null);

    // State to track assigned instructors locally for immediate UI updates
    const [localAssignedInstructors, setLocalAssignedInstructors] = useState<ClassInstructor[]>([]);

    // Fetch assigned instructors from API
    useEffect(() => {
        const fetchAssignedInstructors = async () => {
            try {
                const response = await http.get(`/api/classes/${classItem.id}/lecturers`);
                const apiData: APIClassInstructor[] = response.data.items;

                // Map API data to component format
                const mappedInstructors: ClassInstructor[] = apiData.map(item => ({
                    id: item.assignmentId.toString(),
                    name: item.lecturer.fullName,
                    email: item.lecturer.email,
                    specialization: '',
                    initial: item.lecturer.fullName.charAt(0).toUpperCase(),
                    assigned: item.active,
                    avatar: item.lecturer.avatarUrl || undefined,
                    startDate: item.startDate,
                    note: item.note || undefined
                }));

                setAssignedInstructorsFromAPI(mappedInstructors);
                setLocalAssignedInstructors(mappedInstructors);
            } catch (error) {
                console.error('Error fetching assigned instructors:', error);
                setAssignedInstructorsFromAPI([]);
                setLocalAssignedInstructors([]);
            }
        };

        if (classItem.id) {
            fetchAssignedInstructors();
        }
    }, [classItem.id]);

    // State for available instructors (for assignment selection)
    const [instructors, setInstructors] = useState<Instructor[]>([]);

    // State for assigned instructors (from API)
    const [assignedInstructorsFromAPI, setAssignedInstructorsFromAPI] = useState<ClassInstructor[]>([]);

    // Fetch available instructors for assignment from API
    useEffect(() => {
        const fetchAvailableInstructors = async () => {
            try {
                const response = await http.get(`/api/classes/${classItem.id}/lecturers/available`);
                const apiData: APIAvailableLecturer[] = response.data.items;

                // Map API data to component format
                const mappedInstructors: Instructor[] = apiData.map(item => ({
                    id: item.id.toString(),
                    name: item.fullName,
                    email: item.email,
                    specialization: '',
                    initial: item.fullName.charAt(0).toUpperCase(),
                    assigned: false
                }));

                setInstructors(mappedInstructors);
            } catch (error) {
                console.error('Error fetching available instructors:', error);
                setInstructors([]);
            }
        };

        if (classItem.id) {
            fetchAvailableInstructors();
        }
    }, [classItem.id]);

    // Use local state for immediate UI updates
    const assignedInstructors = localAssignedInstructors;
    const filteredInstructors = instructors.filter(i => {
        // Check if instructor is already assigned to this class
        const isAssignedToClass = assignedInstructorsFromAPI.some(assigned => assigned.id === i.id);
        return !isAssignedToClass &&
            (searchTerm === '' ||
                i.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                i.email.toLowerCase().includes(searchTerm.toLowerCase()));
    });

    // Pagination logic
    const totalPages = Math.ceil(filteredInstructors.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const availableInstructors = filteredInstructors.slice(startIndex, endIndex);

    const handleAssignInstructor = () => {
        setShowAssignModal(true);
        if (currentPage !== 1) {
            setCurrentPage(1); // Reset to first page when opening modal
        }
    };

    const handlePageChange = (page: number) => {
        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };

    const handleSearchChange = (value: string) => {
        setSearchTerm(value);
        if (value !== searchTerm) {
            setCurrentPage(1); // Reset to first page when searching
        }
    };

    const handleSelectInstructor = (instructorId: string) => {
        setSelectedInstructors(prev => {
            const isSelected = prev.includes(instructorId);
            return isSelected
                ? prev.filter(id => id !== instructorId)
                : [...prev, instructorId];
        });
    };

    const handleConfirmAssign = () => {
        // Get selected instructors with their details
        const newAssignedInstructors = selectedInstructors.map(instructorId => {
            const instructor = instructors.find(inst => inst.id === instructorId);
            const details = instructorDetails[instructorId] || { startDate: '', note: '' };
            return {
                id: instructorId,
                name: instructor?.name || '',
                initial: instructor?.initial || '',
                email: instructor?.email || '',
                specialization: '',
                assigned: true,
                startDate: details.startDate,
                note: details.note
            };
        });

        // Combine existing assigned instructors with new ones
        const updatedAssignedInstructors = [...assignedInstructorsFromAPI, ...newAssignedInstructors];

        // Update local state immediately for UI update
        setLocalAssignedInstructors(updatedAssignedInstructors);

        // Update parent component with all assigned instructors
        if (onUpdateInstructors) {
            onUpdateInstructors(classItem.id, updatedAssignedInstructors as Instructor[]);
        }

        // Clear selection and details
        setSelectedInstructors([]);
        setInstructorDetails({});
        setShowAssignModal(false);
        setSearchTerm('');

        console.log('Instructors assigned:', newAssignedInstructors);
    };


    const handleRemoveInstructor = (instructorId: string) => {
        const instructor = assignedInstructorsFromAPI.find(inst => inst.id === instructorId);
        if (instructor) {
            setRemoveConfirm(instructor);
        }
    };

    const confirmRemoveInstructor = () => {
        if (removeConfirm) {
            const updatedAssignedInstructors = assignedInstructorsFromAPI.filter(
                instructor => instructor.id !== removeConfirm.id
            );

            // Update local state immediately for UI update
            setLocalAssignedInstructors(updatedAssignedInstructors);

            // Update parent component with updated assigned instructors
            if (onUpdateInstructors) {
                onUpdateInstructors(classItem.id, updatedAssignedInstructors as Instructor[]);
            }

            // Also clear from instructorDetails if exists
            setInstructorDetails(prev => {
                const newDetails = { ...prev };
                delete newDetails[removeConfirm.id];
                return newDetails;
            });

            setRemoveConfirm(null);
        }
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
                        <div className="col-span-3">Ngày bắt đầu</div>
                        <div className="col-span-3">Ghi chú</div>
                        <div className="col-span-2">Thao tác</div>
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

                                {/* Start Date */}
                                <div className="col-span-3">
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
                                <div className="col-span-2 flex justify-center">
                                    <button
                                        onClick={() => handleRemoveInstructor(instructor.id)}
                                        className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded hover:bg-red-700 transition-colors whitespace-nowrap"
                                    >
                                        Hủy gán
                                    </button>
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
                                    placeholder="Tìm kiếm giảng viên theo tên hoặc email..."
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
                                                        className={`h-6 w-6 rounded border-2 flex items-center justify-center ${selectedInstructors.includes(instructor.id)
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
                                                className={`px-3 py-1 text-sm border rounded ${currentPage === page
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


            {/* Remove Confirmation Dialog */}
            <ConfirmDialog
                open={!!removeConfirm}
                onClose={() => setRemoveConfirm(null)}
                onConfirm={confirmRemoveInstructor}
                title="Xác nhận hủy phân công"
                description={`Bạn có chắc chắn muốn hủy phân công giảng viên "${removeConfirm?.name}" khỏi lớp học? Hành động này sẽ xóa tất cả thông tin phân công của giảng viên này.`}
                confirmText="Hủy phân công"
                cancelText="Đóng"
                variant="danger"
            />
        </>
    );
};

export default AssignInstructorModal;
