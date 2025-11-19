import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { createClass } from '@/shared/api/classes';
import { getPrograms } from '@/shared/api/programs';
import { listActiveCenters } from '@/shared/api/centers';
import { useUserProfile } from '@/stores/userProfile';
import { useToast } from '@/shared/hooks/useToast';

interface CreateClassDialogProps {
    open: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CreateClassDialog({ open, onClose, onSuccess }: CreateClassDialogProps) {
    const { userProfile } = useUserProfile();
    const { toast } = useToast();
    
    const [loading, setLoading] = useState(false);
    const [programs, setPrograms] = useState<any[]>([]);
    const [centers, setCenters] = useState<any[]>([]);
    
    // Form fields
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [programId, setProgramId] = useState('');
    const [centerId, setCenterId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [room, setRoom] = useState('');
    const [capacity, setCapacity] = useState(30);

    const isSuperAdmin = userProfile?.roles?.[0]?.code === 'SUPER_ADMIN';

    useEffect(() => {
        if (open) {
            loadData();
        }
    }, [open]);

    const loadData = async () => {
        try {
            const [programsRes, centersRes] = await Promise.all([
                getPrograms(),
                isSuperAdmin ? listActiveCenters() : Promise.resolve(null)
            ]);

            if (programsRes?.data) {
                const progs = Array.isArray(programsRes.data) ? programsRes.data : programsRes.data.items || [];
                setPrograms(progs);
            }

            if (centersRes?.data && isSuperAdmin) {
                const ctrs = Array.isArray(centersRes.data) ? centersRes.data : centersRes.data.items || [];
                setCenters(ctrs);
            }
        } catch (error) {
            console.error('Error loading data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!name.trim() || !programId) {
            toast({ title: 'Lỗi', description: 'Vui lòng điền đầy đủ thông tin bắt buộc', variant: 'destructive' });
            return;
        }

        if (isSuperAdmin && !centerId) {
            toast({ title: 'Lỗi', description: 'Vui lòng chọn trung tâm', variant: 'destructive' });
            return;
        }

        setLoading(true);
        try {
            const payload: any = {
                name: name.trim(),
                programId: Number(programId),
            };

            if (isSuperAdmin && centerId) {
                payload.centerId = Number(centerId);
            }

            if (description.trim()) payload.description = description.trim();
            if (startDate) payload.startDate = startDate;
            if (endDate) payload.endDate = endDate;
            if (room.trim()) payload.room = room.trim();
            if (capacity > 0) payload.capacity = capacity;

            await createClass(payload);
            
            toast({ title: 'Thành công', description: 'Tạo lớp học thành công' });
            resetForm();
            onSuccess();
        } catch (error: any) {
            console.error('Create class error:', error);
            toast({ 
                title: 'Lỗi', 
                description: error?.response?.data?.message || 'Không thể tạo lớp học',
                variant: 'destructive'
            });
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setName('');
        setDescription('');
        setProgramId('');
        setCenterId('');
        setStartDate('');
        setEndDate('');
        setRoom('');
        setCapacity(30);
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto m-4">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-500 to-violet-600 text-white px-6 py-4 rounded-t-2xl flex items-center justify-between">
                    <h2 className="text-2xl font-bold">Tạo lớp học mới</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Tên lớp */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên lớp <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Nhập tên lớp học"
                            required
                        />
                    </div>

                    {/* Chương trình */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Chương trình <span className="text-red-500">*</span>
                        </label>
                        <select
                            value={programId}
                            onChange={(e) => setProgramId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            required
                        >
                            <option value="">-- Chọn chương trình --</option>
                            {programs.map((prog) => (
                                <option key={prog.programId} value={prog.programId}>
                                    {prog.name} ({prog.code})
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Trung tâm (chỉ cho Super Admin) */}
                    {isSuperAdmin && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Trung tâm <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={centerId}
                                onChange={(e) => setCenterId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                required
                            >
                                <option value="">-- Chọn trung tâm --</option>
                                {centers.map((center) => (
                                    <option key={center.id} value={center.id}>
                                        {center.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Mô tả */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Nhập mô tả lớp học"
                            rows={3}
                        />
                    </div>

                    {/* Ngày bắt đầu & kết thúc */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày bắt đầu</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Ngày kết thúc</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Phòng & Sức chứa */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Phòng học</label>
                            <input
                                type="text"
                                value={room}
                                onChange={(e) => setRoom(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                placeholder="Ví dụ: 101"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Sức chứa</label>
                            <input
                                type="number"
                                value={capacity}
                                onChange={(e) => setCapacity(Number(e.target.value))}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                                min={1}
                            />
                        </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            disabled={loading}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-lg hover:from-purple-600 hover:to-violet-700 transition-colors disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? 'Đang tạo...' : 'Tạo lớp học'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
