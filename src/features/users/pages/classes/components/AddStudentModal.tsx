import React, { useState, useEffect } from 'react';
import { X, Search, User, Mail, Phone, Check, Loader2 } from 'lucide-react';
import { getStudentsByCenter } from '@/api/user-views';
import { getClassStudents, enrollStudent } from '@/api/class-students';
import { useToast } from '@/shared/hooks/useToast';
import type { UserView } from '@/api/user-views';

type StudentCandidate = UserView & {
    initial: string;
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
    const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(false);
    const [candidates, setCandidates] = useState<StudentCandidate[]>([]);
    const [activeStudentIds, setActiveStudentIds] = useState<number[]>([]);
    const { success, error } = useToast();

    // Load candidates and active students when modal opens
    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open, classItem.id]);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1) active trong lớp để loại trừ
            const active = await getClassStudents(Number(classItem.id), { status: 'ACTIVE', page: 0, size: 200 });
            const activeIds = new Set((active.items ?? []).map(x => x.studentId));

            // 2) candidates theo center
            const candidates = await getStudentsByCenter(Number(classItem.id), query); // LIST
            const filtered = (candidates ?? []).filter(u => !activeIds.has(u.userId));

            const candidatesWithInitials = filtered.map(candidate => ({
                ...candidate,
                initial: candidate.fullName.charAt(0).toUpperCase()
            }));
            setCandidates(candidatesWithInitials);

        } catch (error) {
            console.error('Error loading data:', error);
            error('Không thể tải danh sách học viên');
        } finally {
            setLoading(false);
        }
    };

    // Filter candidates to exclude active students in current class
    const availableCandidates = candidates.filter(candidate =>
        !activeStudentIds.includes(candidate.userId)
    );

    // Filter based on search query
    const filteredStudents = availableCandidates.filter(candidate => {
        const matchesQuery = query === '' ||
            candidate.fullName.toLowerCase().includes(query.toLowerCase()) ||
            candidate.email.toLowerCase().includes(query.toLowerCase());

        return matchesQuery;
    });

    const handleStudentSelect = (studentId: string) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };

    const handleSelectAll = () => {
        if (selectedStudents.length === (candidates ?? []).length) {
            setSelectedStudents([]);
        } else {
            setSelectedStudents((candidates ?? []).map(s => s.userId.toString()));
        }
    };

    const handleSubmit = async () => {
        if (selectedStudents.length === 0) return;

        setIsSubmitting(true);

        try {
            const today = new Date().toISOString().slice(0, 10);
            const tasks = selectedStudents.map(id => enrollStudent(Number(classItem.id), {
                studentId: Number(id),
                enrolledAt: today,
                note: null
            }).catch(err => err));                 // nuốt lỗi để tiếp tục

            const results = await Promise.all(tasks);
            const created = results.filter(r => !(r instanceof Error)).length;
            const skipped = results.length - created;

            success(`Đã thêm ${created} học viên${skipped ? `, bỏ qua ${skipped}` : ''}`);

            // Close modal and reload parent
            onAddStudents(selectedStudents);
            onClose();

        } catch (error) {
            console.error('Error enrolling students:', error);
            error('Có lỗi xảy ra khi thêm học viên');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        setSelectedStudents([]);
        setQuery('');
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

                    {/* Search */}
                    <div className="px-6 py-4 border-b space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-200"
                                    placeholder="Tìm kiếm theo tên, email, mã học viên..."
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handleSelectAll}
                                    className="text-sm text-blue-600 hover:text-blue-700"
                                >
                                    {selectedStudents.length === (candidates ?? []).length ? 'Bỏ chọn tất cả' : 'Chọn tất cả'}
                                </button>
                                <span className="text-sm text-gray-500">
                                    ({selectedStudents.length} học viên đã chọn)
                                </span>
                            </div>
                            {loading && (
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <Loader2 size={14} className="animate-spin" />
                                    Đang tải...
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Student List */}
                    <div className="px-6 py-4 max-h-96 overflow-y-auto">
                        <div className="space-y-2">
                            {(candidates ?? []).map((student) => (
                                <div
                                    key={student.userId}
                                    className={`p-3 rounded-lg border cursor-pointer transition-colors ${selectedStudents.includes(student.userId.toString())
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                    onClick={() => handleStudentSelect(student.userId.toString())}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium ${selectedStudents.includes(student.userId.toString())
                                            ? 'bg-gray-900 text-white'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {selectedStudents.includes(student.userId.toString()) ? (
                                                <Check size={16} />
                                            ) : (
                                                student.initial
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="font-medium">{student.fullName}</h3>
                                                <span className="text-xs text-gray-500">(ID: {student.userId})</span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Mail size={12} />
                                                    {student.email}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                                                Chưa trong lớp
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(candidates ?? []).length === 0 && !loading && (
                            <div className="text-center py-8 text-gray-500">
                                {query ? 'Không tìm thấy học viên nào' : 'Không có học viên nào khả dụng'}
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

