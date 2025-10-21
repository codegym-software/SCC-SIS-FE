import React, { useState, useEffect } from 'react';
import { Search, Plus, Calendar, Clock, FileText, BookOpen, X } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import http from '@/shared/api/http';

type Class = {
    classId: number;
    name: string;
    programName: string;
    centerName: string;
    status: string;
};

type ClassLog = {
    logId: number;
    title: string;
    content: string;
    type: 'LEARNING_PROGRESS' | 'HOMEWORK' | 'ANNOUNCEMENT' | 'OTHER';
    date: string;
    time: string;
    author: string;
    moduleCode?: string;
};

type LogType = 'LEARNING_PROGRESS' | 'HOMEWORK' | 'ANNOUNCEMENT' | 'OTHER';

interface ClassLogTabProps {
    selectedClass: Class | null;
}

const ClassLogTab: React.FC<ClassLogTabProps> = ({ selectedClass }) => {
    const { success: showSuccessToast, error: showErrorToast } = useToast();
    const [logs, setLogs] = useState<ClassLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<string>('all');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Form state
    const [formData, setFormData] = useState({
        title: '',
        content: '',
        type: 'LEARNING_PROGRESS' as LogType,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        moduleCode: ''
    });

    // Fetch logs
    useEffect(() => {
        const fetchLogs = async () => {
            if (!selectedClass) return;

            try {
                setIsLoading(true);
                const response = await http.get(`/api/classes/${selectedClass.classId}/logs`);
                const logsData = response.data;
                
                const mappedLogs: ClassLog[] = logsData.map((item: any) => ({
                    logId: item.logId,
                    title: item.title,
                    content: item.content,
                    type: item.type,
                    date: item.date,
                    time: item.time,
                    author: item.author,
                    moduleCode: item.moduleCode
                }));

                setLogs(mappedLogs);
            } catch (error) {
                console.error('Error fetching logs:', error);
                // Mock data for demonstration
                setLogs([
                    {
                        logId: 1,
                        title: 'Bài học về OOP trong Java',
                        content: 'Hôm nay chúng ta đã học về khái niệm lập trình hướng đối tượng. Các học viên đã nắm được cơ bản về class, object, inheritance.',
                        type: 'LEARNING_PROGRESS',
                        date: '2024-12-19',
                        time: '19:00',
                        author: 'Nguyễn Văn A',
                        moduleCode: 'JAVA101'
                    },
                    {
                        logId: 2,
                        title: 'Thông báo bài tập về nhà',
                        content: 'Các em làm bài tập chương 3, nộp trước thứ 6 tuần tới. Ai có thắc mắc liên hệ qua email.',
                        type: 'HOMEWORK',
                        date: '2024-12-18',
                        time: '20:30',
                        author: 'Nguyễn Văn A',
                        moduleCode: 'JAVA101'
                    },
                    {
                        logId: 3,
                        title: 'Cập nhật lịch học',
                        content: 'Lịch học tuần tới sẽ có thay đổi. Buổi học thứ 3 sẽ được dời sang thứ 4.',
                        type: 'ANNOUNCEMENT',
                        date: '2024-12-17',
                        time: '14:15',
                        author: 'Nguyễn Văn A'
                    }
                ]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchLogs();
    }, [selectedClass]);

    const handleCreateLog = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedClass) return;

        setIsSubmitting(true);
        try {
            const response = await http.post(`/api/classes/${selectedClass.classId}/logs`, {
                title: formData.title,
                content: formData.content,
                type: formData.type,
                date: formData.date,
                time: formData.time,
                moduleCode: formData.moduleCode || null
            });

            const newLog: ClassLog = {
                logId: response.data.logId || Date.now(),
                title: formData.title,
                content: formData.content,
                type: formData.type,
                date: formData.date,
                time: formData.time,
                author: 'Current User',
                moduleCode: formData.moduleCode || undefined
            };

            setLogs(prev => [newLog, ...prev]);
            showSuccessToast('Tạo nhật ký thành công', 'Nhật ký đã được tạo');
            
            // Reset form
            setFormData({
                title: '',
                content: '',
                type: 'LEARNING_PROGRESS',
                date: new Date().toISOString().split('T')[0],
                time: new Date().toTimeString().slice(0, 5),
                moduleCode: ''
            });
            setShowCreateModal(false);
        } catch (error) {
            console.error('Error creating log:', error);
            showErrorToast('Lỗi tạo nhật ký', 'Không thể tạo nhật ký');
        } finally {
            setIsSubmitting(false);
        }
    };

    const getTypeLabel = (type: LogType) => {
        switch (type) {
            case 'LEARNING_PROGRESS':
                return 'Tiến độ học tập';
            case 'HOMEWORK':
                return 'Bài tập';
            case 'ANNOUNCEMENT':
                return 'Thông báo';
            case 'OTHER':
                return 'Khác';
            default:
                return type;
        }
    };

    const getTypeColor = (type: LogType) => {
        switch (type) {
            case 'LEARNING_PROGRESS':
                return 'bg-blue-100 text-blue-800';
            case 'HOMEWORK':
                return 'bg-green-100 text-green-800';
            case 'ANNOUNCEMENT':
                return 'bg-orange-100 text-orange-800';
            case 'OTHER':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredLogs = logs.filter(log => {
        const matchesSearch = log.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            log.content.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesFilter = filterType === 'all' || log.type === filterType;
        return matchesSearch && matchesFilter;
    });

    return (
        <div className="space-y-6">
            {/* Action Bar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Tìm kiếm nhật ký..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="all">Tất cả loại</option>
                            <option value="LEARNING_PROGRESS">Tiến độ học tập</option>
                            <option value="HOMEWORK">Bài tập</option>
                            <option value="ANNOUNCEMENT">Thông báo</option>
                            <option value="OTHER">Khác</option>
                        </select>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        <Plus size={16} className="mr-2" />
                        Viết Nhật ký mới
                    </button>
                </div>
            </div>

            {/* Logs List */}
            <div className="space-y-4">
                {isLoading ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Đang tải nhật ký...</p>
                    </div>
                ) : filteredLogs.length > 0 ? (
                    filteredLogs.map((log) => (
                        <div key={log.logId} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{log.title}</h3>
                                    <div className="flex items-center gap-2 mb-3">
                                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(log.type)}`}>
                                            {getTypeLabel(log.type)}
                                        </span>
                                        {log.moduleCode && (
                                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                                {log.moduleCode}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <p className="text-gray-700 mb-4 leading-relaxed">{log.content}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Calendar size={14} />
                                    {new Date(log.date).toLocaleDateString('vi-VN')}
                                </div>
                                <div className="flex items-center gap-1">
                                    <Clock size={14} />
                                    {log.time}
                                </div>
                                <div className="flex items-center gap-1">
                                    <FileText size={14} />
                                    {log.author}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                        <div className="text-gray-400 mb-4">
                            <FileText size={48} className="mx-auto" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có nhật ký nào</h3>
                        <p className="text-gray-600 mb-4">Hãy tạo nhật ký đầu tiên cho lớp học này.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                            <Plus size={16} className="mr-2" />
                            Viết Nhật ký mới
                        </button>
                    </div>
                )}
            </div>

            {/* Create Log Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center" style={{backgroundColor: 'rgba(0, 0, 0, 0.5)'}}>
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" style={{boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'}}>
                        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900">Viết Nhật ký Lớp học mới</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    Ghi lại tiến độ, thông báo hoặc ghi chú về lớp học.
                                </p>
                            </div>
                            <button
                                onClick={() => setShowCreateModal(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        <form onSubmit={handleCreateLog} className="px-6 py-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Tiêu đề
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Tiêu đề nhật ký"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Nội dung
                                </label>
                                <textarea
                                    value={formData.content}
                                    onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                                    placeholder="Nội dung chi tiết..."
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại
                                </label>
                                <select
                                    value={formData.type}
                                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as LogType }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="LEARNING_PROGRESS">Tiến độ học tập</option>
                                    <option value="HOMEWORK">Bài tập</option>
                                    <option value="ANNOUNCEMENT">Thông báo</option>
                                    <option value="OTHER">Khác</option>
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Ngày
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="date"
                                            value={formData.date}
                                            onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Giờ
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="time"
                                            value={formData.time}
                                            onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                        <Clock size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Module liên quan (tùy chọn)
                                </label>
                                <select
                                    value={formData.moduleCode}
                                    onChange={(e) => setFormData(prev => ({ ...prev, moduleCode: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Không liên quan đến module cụ thể</option>
                                    <option value="JAVA101">JAVA101 - Lập trình Java Cơ bản</option>
                                    <option value="JAVA201">JAVA201 - Lập trình Java Nâng cao</option>
                                </select>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="flex-1 px-4 py-2 border border-transparent text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Đang tạo...' : 'Tạo Nhật ký'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClassLogTab;