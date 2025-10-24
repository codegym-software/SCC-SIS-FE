import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, Trash2, Calendar, User, File } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import type { ModuleResponse } from '@/shared/types/module';

type SyllabusFile = {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedBy: string;
    uploadedAt: string;
    downloadUrl?: string;
};

type Module = ModuleResponse;

interface ModuleDetailModalProps {
    open: boolean;
    onClose: () => void;
    module: Module;
}

const ModuleDetailModal: React.FC<ModuleDetailModalProps> = ({ open, onClose, module }) => {
    const { success: showSuccess, error: showError } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    // Mock data - sẽ thay bằng API call thực tế
    const [syllabusFiles, setSyllabusFiles] = useState<SyllabusFile[]>([
        {
            id: '1',
            fileName: 'Giáo trình Java Cơ bản - Tuần 1-4.pdf',
            fileType: 'PDF',
            fileSize: 2.5 * 1024 * 1024, // 2.5 MB
            uploadedBy: 'Nguyễn Văn A',
            uploadedAt: '2024-12-19T10:30:00',
        },
        {
            id: '2',
            fileName: 'Bài tập thực hành OOP.docx',
            fileType: 'DOCX',
            fileSize: 856 * 1024, // 856 KB
            uploadedBy: 'Trần Thị B',
            uploadedAt: '2024-12-15T14:20:00',
        },
    ]);

    if (!open) return null;

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    const formatDate = (dateString: string): string => {
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const getFileIcon = (fileType: string) => {
        const iconMap: Record<string, string> = {
            PDF: '📄',
            DOCX: '📝',
            DOC: '📝',
            XLSX: '📊',
            XLS: '📊',
            PPTX: '📊',
            PPT: '📊',
        };
        return iconMap[fileType.toUpperCase()] || '📎';
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            showError('Lỗi', 'Kích thước file không được vượt quá 50MB');
            return;
        }

        // Validate file type
        const allowedTypes = [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            'application/vnd.ms-excel',
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-powerpoint',
            'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        ];

        if (!allowedTypes.includes(file.type)) {
            showError('Lỗi', 'Chỉ hỗ trợ file PDF, Word, Excel, PowerPoint');
            return;
        }

        try {
            setIsUploading(true);

            // Simulate upload - Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 1500));

            const newFile: SyllabusFile = {
                id: Date.now().toString(),
                fileName: file.name,
                fileType: file.name.split('.').pop()?.toUpperCase() || 'FILE',
                fileSize: file.size,
                uploadedBy: 'Người dùng hiện tại', // Get from user profile
                uploadedAt: new Date().toISOString(),
            };

            setSyllabusFiles([newFile, ...syllabusFiles]);
            showSuccess('Thành công', `Đã tải lên file "${file.name}"`);
        } catch (error) {
            showError('Lỗi', 'Không thể tải lên file. Vui lòng thử lại.');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleDeleteFile = async (fileId: string, fileName: string) => {
        if (!confirm(`Bạn có chắc chắn muốn xóa file "${fileName}"?`)) {
            return;
        }

        try {
            // Simulate delete - Replace with actual API call
            await new Promise((resolve) => setTimeout(resolve, 500));

            setSyllabusFiles(syllabusFiles.filter((f) => f.id !== fileId));
            showSuccess('Thành công', `Đã xóa file "${fileName}"`);
        } catch (error) {
            showError('Lỗi', 'Không thể xóa file. Vui lòng thử lại.');
        }
    };

    const handleDownloadFile = (file: SyllabusFile) => {
        // Simulate download - Replace with actual download logic
        showSuccess('Đang tải xuống', `Đang tải file "${file.fileName}"`);

        // Actual implementation would be:
        // window.open(file.downloadUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4 overflow-y-auto">
                <div className="w-full max-w-4xl rounded-lg bg-white shadow-lg border my-8">
                    {/* Header */}
                    <div className="px-6 py-4 border-b flex items-center justify-between bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 grid place-items-center text-white">
                                <FileText size={20} />
                            </div>
                            <div>
                                <div className="font-semibold text-lg">{module.name}</div>
                                <div className="text-sm text-gray-600">Mã module: {module.code}</div>
                            </div>
                        </div>
                        <button
                            className="h-8 w-8 rounded-lg hover:bg-white/50 flex items-center justify-center transition-colors"
                            onClick={onClose}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Module Information */}
                        <div>
                            <h3 className="text-base font-semibold mb-4 flex items-center gap-2">
                                <FileText size={18} className="text-blue-600" />
                                Thông tin Module
                            </h3>
                            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Chương trình</label>
                                    <div className="text-sm">{module.programName}</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Số tín chỉ</label>
                                    <div className="text-sm">{module.credits} tín chỉ</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Thời lượng</label>
                                    <div className="text-sm">{module.durationHours} giờ</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Học kỳ</label>
                                    <div className="text-sm">Học kỳ {module.semester}</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Loại môn học</label>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            module.isMandatory
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}
                                    >
                                        {module.isMandatory ? 'Bắt buộc' : 'Tự chọn'}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Trạng thái</label>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            module.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {module.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Syllabus Section */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold flex items-center gap-2">
                                    <Upload size={18} className="text-blue-600" />
                                    Đề cương chi tiết
                                </h3>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    <Upload size={16} />
                                    {isUploading ? 'Đang tải lên...' : 'Tải lên đề cương'}
                                </button>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    className="hidden"
                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                    onChange={handleFileSelect}
                                />
                            </div>

                            {/* Info Note */}
                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-sm text-blue-800">
                                    <strong>Lưu ý:</strong> Hỗ trợ các định dạng file: PDF, Word, PowerPoint, Excel.
                                    Kích thước tối đa: 50MB.
                                </p>
                            </div>

                            {/* Files List */}
                            {syllabusFiles.length === 0 ? (
                                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                    <FileText size={48} className="mx-auto text-gray-400 mb-3" />
                                    <p className="text-sm text-gray-500">
                                        Chưa có đề cương nào được tải lên. Click "Tải lên đề cương" để thêm file.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {syllabusFiles.map((file) => (
                                        <div
                                            key={file.id}
                                            className="flex items-center gap-4 p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex-shrink-0 text-3xl">{getFileIcon(file.fileType)}</div>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{file.fileName}</div>
                                                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                                                    <span className="flex items-center gap-1">
                                                        <File size={12} />
                                                        {file.fileType}
                                                    </span>
                                                    <span>{formatFileSize(file.fileSize)}</span>
                                                    <span className="flex items-center gap-1">
                                                        <User size={12} />
                                                        {file.uploadedBy}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <Calendar size={12} />
                                                        {formatDate(file.uploadedAt)}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDownloadFile(file)}
                                                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Tải xuống"
                                                >
                                                    <Download size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteFile(file.id, file.fileName)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-4 border-t bg-gray-50 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Đóng
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ModuleDetailModal;
