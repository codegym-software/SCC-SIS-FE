import React, { useEffect, useMemo, useState } from 'react';
import { NotebookText, Plus, Search, Edit, Trash2, Calendar, BookOpen, Clock, Filter, FileText, Users, Bell, CheckCircle } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../../../components/ui/dialog';
import { Badge } from '../../../components/ui/badge';

type TeachingLog = {
    id: string;
    title: string;
    content: string;
    type: 'learning-progress' | 'homework' | 'announcement' | 'schedule';
    date: string; // YYYY-MM-DD
    time: string; // HH:mm
    author: string;
    module?: string;
    createdAt: string;
    updatedAt?: string;
};

function loadLogs(): TeachingLog[] {
    try {
        const raw = localStorage.getItem('teachingLogs');
        const logs = raw ? JSON.parse(raw) : [];
        
        // Add sample data if no logs exist
        if (logs.length === 0) {
            const sampleLogs: TeachingLog[] = [
                {
                    id: '1',
                    title: 'Bài học về OOP trong Java',
                    content: 'Hôm nay chúng ta đã học về khái niệm lập trình hướng đối tượng. Các học viên đã nắm được cơ bản về class, object, inheritance.',
                    type: 'learning-progress',
                    date: '2024-12-19',
                    time: '19:00',
                    author: 'Nguyễn Văn A',
                    module: 'JAVA101',
                    createdAt: '2024-12-19T19:00:00Z'
                },
                {
                    id: '2',
                    title: 'Thông báo bài tập về nhà',
                    content: 'Các em làm bài tập chương 3, nộp trước thứ 6 tuần tới. Ai có thắc mắc liên hệ qua email.',
                    type: 'homework',
                    date: '2024-12-18',
                    time: '20:30',
                    author: 'Nguyễn Văn A',
                    module: 'JAVA101',
                    createdAt: '2024-12-18T20:30:00Z'
                },
                {
                    id: '3',
                    title: 'Cập nhật lịch học',
                    content: 'Lịch học tuần tới sẽ có thay đổi. Lớp sẽ học vào thứ 3 và thứ 5 thay vì thứ 2 và thứ 4.',
                    type: 'schedule',
                    date: '2024-12-17',
                    time: '18:00',
                    author: 'Nguyễn Văn A',
                    module: 'JAVA101',
                    createdAt: '2024-12-17T18:00:00Z'
                }
            ];
            localStorage.setItem('teachingLogs', JSON.stringify(sampleLogs));
            return sampleLogs;
        }
        
        return logs;
    } catch {
        return [];
    }
}

function saveLogs(logs: TeachingLog[]) {
    localStorage.setItem('teachingLogs', JSON.stringify(logs));
}

export default function TeachingLogsPage() {
    const [logs, setLogs] = useState<TeachingLog[]>(() => loadLogs());
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TeachingLog | null>(null);

    useEffect(() => {
        saveLogs(logs);
    }, [logs]);

    const filtered = useMemo(() => {
        const q = search.trim().toLowerCase();
        if (!q) return logs;
        return logs.filter((l) =>
            l.title.toLowerCase().includes(q) ||
            l.content.toLowerCase().includes(q) ||
            l.author.toLowerCase().includes(q)
        );
    }, [logs, search]);

    const onCreate = () => {
        setEditing(null);
        setModalOpen(true);
    };

    const onEdit = (log: TeachingLog) => {
        setEditing(log);
        setModalOpen(true);
    };

    const onDelete = (id: string) => {
        if (!confirm('Xóa nhật ký này?')) return;
        setLogs((prev) => prev.filter((l) => l.id !== id));
    };

    const onSubmit = (data: { title: string; content: string; type: 'learning-progress' | 'homework' | 'announcement' | 'schedule'; date: string; time: string; author: string; module?: string }) => {
        if (editing) {
            setLogs((prev) => prev.map((l) => (l.id === editing.id ? { ...l, ...data, updatedAt: new Date().toISOString() } : l)));
        } else {
            const newLog: TeachingLog = {
                id: crypto.randomUUID(),
                ...data,
                createdAt: new Date().toISOString(),
            };
            setLogs((prev) => [newLog, ...prev]);
        }
        setModalOpen(false);
        setEditing(null);
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'learning-progress': return <CheckCircle className="h-4 w-4" />;
            case 'homework': return <FileText className="h-4 w-4" />;
            case 'announcement': return <Bell className="h-4 w-4" />;
            case 'schedule': return <Calendar className="h-4 w-4" />;
            default: return <FileText className="h-4 w-4" />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'learning-progress': return 'Tiến độ học tập';
            case 'homework': return 'Bài tập';
            case 'announcement': return 'Thông báo';
            case 'schedule': return 'Lịch học';
            default: return 'Khác';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'learning-progress': return 'bg-blue-100 text-blue-700';
            case 'homework': return 'bg-green-100 text-green-700';
            case 'announcement': return 'bg-orange-100 text-orange-700';
            case 'schedule': return 'bg-purple-100 text-purple-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200 px-6 py-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Giảng dạy & Tương tác</h1>
                </div>
            </div>

            <div className="px-6 py-6 space-y-6">
                {/* Class Selection */}
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center gap-4">
                        <label className="text-sm font-medium text-gray-700">Lớp học:</label>
                        <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                            <option>Lập trình Java Cơ bản - K15</option>
                            <option>React Advanced - K16</option>
                            <option>Python Basic - K17</option>
                        </select>
                    </div>
                </div>

                {/* Segmented tabs */}
                <div className="flex gap-1 bg-gray-100 p-2 rounded-xl w-full">
                    <button className="flex-1 px-6 py-3 text-base font-semibold text-gray-600 hover:text-gray-900 transition-colors">
                        <div className="flex items-center justify-center gap-2">
                            <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                            Tiến độ Module
                        </div>
                    </button>
                    <button className="flex-1 px-6 py-3 text-base font-semibold bg-white text-gray-900 rounded-lg shadow-sm">
                        <div className="flex items-center justify-center gap-2">
                            <FileText className="h-5 w-5" />
                            Nhật ký Lớp học
                        </div>
                    </button>
                </div>

                {/* Action Bar */}
                <div className="flex items-center gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Tìm kiếm nhật ký..."
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        />
                    </div>
                    <select className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white">
                        <option>Tất cả loại</option>
                        <option>Tiến độ học tập</option>
                        <option>Bài tập</option>
                        <option>Thông báo</option>
                        <option>Lịch học</option>
                    </select>
                    <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
                        <Plus className="h-4 w-4 mr-2" />
                        Viết Nhật ký mới
                    </Button>
                </div>

                {/* Logs List */}
                <div className="space-y-4">
                    {filtered.map((log) => (
                        <div key={log.id} className="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Badge className={`${getTypeColor(log.type)} text-xs px-2 py-1 rounded-full`}>
                                            {getTypeIcon(log.type)}
                                            <span className="ml-1">{getTypeLabel(log.type)}</span>
                                        </Badge>
                                        {log.module && (
                                            <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                                                {log.module}
                                            </Badge>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{log.title}</h3>
                                    <p className="text-gray-600 whitespace-pre-wrap leading-relaxed mb-4">{log.content}</p>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-4 w-4" />
                                            {new Date(log.date).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="h-4 w-4" />
                                            {log.time}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Users className="h-4 w-4" />
                                            {log.author}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onEdit(log)}
                                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                                    >
                                        <Edit className="h-4 w-4 mr-1" />
                                        Sửa
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => onDelete(log.id)}
                                        className="text-red-600 border-red-200 hover:bg-red-50"
                                    >
                                        <Trash2 className="h-4 w-4 mr-1" />
                                        Xóa
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    {filtered.length === 0 && (
                        <div className="text-center py-12">
                            <NotebookText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Chưa có nhật ký</h3>
                            <p className="text-gray-500 mb-4">Bắt đầu viết nhật ký giảng dạy đầu tiên của bạn</p>
                            <Button onClick={onCreate} className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="h-4 w-4 mr-2" />
                                Viết Nhật ký mới
                            </Button>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {modalOpen && (
                <LogFormModal
                    initial={editing ? { 
                        title: editing.title, 
                        content: editing.content, 
                        type: editing.type,
                        date: editing.date,
                        time: editing.time,
                        author: editing.author,
                        module: editing.module
                    } : undefined}
                    onClose={() => { setModalOpen(false); setEditing(null); }}
                    onSubmit={onSubmit}
                />
            )}
        </div>
    );
}

function LogFormModal({ initial, onClose, onSubmit }: {
    initial?: { title: string; content: string; type: 'learning-progress' | 'homework' | 'announcement' | 'schedule'; date: string; time: string; author: string; module?: string };
    onClose: () => void;
    onSubmit: (data: { title: string; content: string; type: 'learning-progress' | 'homework' | 'announcement' | 'schedule'; date: string; time: string; author: string; module?: string }) => void;
}) {
    const [title, setTitle] = useState(initial?.title ?? '');
    const [content, setContent] = useState(initial?.content ?? '');
    const [type, setType] = useState(initial?.type ?? 'learning-progress');
    const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0, 10));
    const [time, setTime] = useState(initial?.time ?? new Date().toTimeString().slice(0, 5));
    const [author, setAuthor] = useState(initial?.author ?? 'Lê Thị Hoa');
    const [module, setModule] = useState(initial?.module ?? '');

    const canSubmit = title.trim() && content.trim() && date && time && author.trim();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                {initial ? 'Sửa nhật ký lớp học' : 'Viết Nhật ký Lớp học mới'}
                            </h2>
                            <p className="text-sm text-gray-600 mt-1">
                                {initial ? 'Cập nhật thông tin nhật ký' : 'Ghi lại tiến độ, thông báo hoặc ghi chú về lớp học.'}
                            </p>
                        </div>
                        <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
                
                <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tiêu đề
                        </label>
                        <input 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            placeholder="Tiêu đề nhật ký" 
                        />
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nội dung
                        </label>
                        <textarea 
                            value={content} 
                            onChange={(e) => setContent(e.target.value)} 
                            className="w-full border border-gray-300 rounded-lg px-3 py-2 min-h-[150px] focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none" 
                            placeholder="Nội dung chi tiết..." 
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Loại
                            </label>
                            <select 
                                value={type} 
                                onChange={(e) => setType(e.target.value as 'learning-progress' | 'homework' | 'announcement' | 'schedule')} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="learning-progress">Tiến độ học tập</option>
                                <option value="homework">Bài tập</option>
                                <option value="announcement">Thông báo</option>
                                <option value="schedule">Lịch học</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Ngày
                            </label>
                            <input 
                                type="date" 
                                value={date} 
                                onChange={(e) => setDate(e.target.value)} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Giờ
                            </label>
                            <input 
                                type="time" 
                                value={time} 
                                onChange={(e) => setTime(e.target.value)} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tác giả
                            </label>
                            <input 
                                value={author} 
                                onChange={(e) => setAuthor(e.target.value)} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
                                placeholder="Tên tác giả" 
                            />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Module liên quan (tùy chọn)
                            </label>
                            <select 
                                value={module} 
                                onChange={(e) => setModule(e.target.value)} 
                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                            >
                                <option value="">Không liên quan đến module cụ thể</option>
                                <option value="JAVA101">JAVA101 - Lập trình Java Cơ bản</option>
                                <option value="REACT201">REACT201 - React Nâng cao</option>
                            </select>
                        </div>
                    </div>
                </div>
                
                <div className="bg-gray-50 px-6 py-4 flex justify-end gap-3 border-t border-gray-200">
                    <Button variant="outline" onClick={onClose}>
                        Hủy
                    </Button>
                    <Button 
                        disabled={!canSubmit} 
                        onClick={() => onSubmit({ title: title.trim(), content: content.trim(), type: type, date, time, author: author.trim(), module: module || undefined })}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:text-gray-500"
                    >
                        {initial ? 'Cập nhật' : 'Tạo Nhật ký'}
                    </Button>
                </div>
            </div>
        </div>
    );
}
