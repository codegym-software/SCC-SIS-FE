import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, FileText, Link2, Youtube, FolderOpen, ExternalLink, Trash2, Calendar, User, Download, Eye } from 'lucide-react';
import { useToast } from '@/shared/hooks/useToast';
import { attachResource, removeResourceByUrl } from '@/shared/api/modules';
import { uploadSyllabusFile } from '@/shared/api/files';
import type { ModuleResponse, ModuleResource } from '@/shared/types/module';
import DocumentViewer from '@/components/DocumentViewer';
import ConfirmDialog from '@/shared/components/ConfirmDialog';

type ResourceType = 'upload' | 'youtube' | 'drive' | 'link';

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
    const [isDeleting, setIsDeleting] = useState(false);
    const [showAttachForm, setShowAttachForm] = useState(false);
    const [activeTab, setActiveTab] = useState<ResourceType>('upload');
    const [resourceUrl, setResourceUrl] = useState('');
    const [currentModule, setCurrentModule] = useState(module);
    
    // State cho DocumentViewer
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [previewFileName, setPreviewFileName] = useState<string>('');
    
    // State cho ConfirmDialog
    const [deleteConfirm, setDeleteConfirm] = useState<ModuleResource | null>(null);

    // Reset khi module thay đổi
    useEffect(() => {
        setCurrentModule(module);
        setShowAttachForm(false);
        setResourceUrl('');
        
        // DEBUG: Log để kiểm tra
        console.log('📦 Module data:', module);
        console.log('📚 Resources:', module.resources);
    }, [module]);

    if (!open) return null;

    // Kiểm tra loại tài liệu dựa vào URL
    const getResourceType = (url: string): { type: string; icon: JSX.Element } => {
        if (!url) return { type: 'Chưa có', icon: <FileText size={20} className="text-gray-400" /> };
        
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
            return { type: 'YouTube', icon: <Youtube size={20} className="text-red-600" /> };
        }
        if (url.includes('drive.google.com')) {
            return { type: 'Google Drive', icon: <FolderOpen size={20} className="text-blue-600" /> };
        }
        if (url.endsWith('.pdf') || url.endsWith('.doc') || url.endsWith('.docx')) {
            return { type: 'File tải lên', icon: <Upload size={20} className="text-green-600" /> };
        }
        return { type: 'Link khác', icon: <Link2 size={20} className="text-purple-600" /> };
    };

    const formatDate = (dateString?: string): string => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toLocaleDateString('vi-VN', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const formatFileSize = (bytes?: number): string => {
        if (!bytes) return '';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Upload file → Lấy URL → Gắn vào module
    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0) return;

        const file = files[0];

        // Validate file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
            showError('Lỗi tải file', 'Kích thước file không được vượt quá 50MB');
            return;
        }

        try {
            setIsUploading(true);

            // Bước 1: Upload file lên server
            const uploadResponse = await uploadSyllabusFile(file);
            const fileUrl = uploadResponse.data.url;

            // Bước 2: Gắn URL vào module
            const attachResponse = await attachResource(currentModule.moduleId, { resourceUrl: fileUrl });
            setCurrentModule(attachResponse.data);
            
            showSuccess('Gắn tài liệu thành công', `File "${file.name}" đã được thêm vào module`);
            setShowAttachForm(false);
        } catch (error: any) {
            showError('Lỗi tải file', error?.message || 'Không thể tải file lên. Vui lòng thử lại');
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Gắn URL (YouTube, Drive, Link khác)
    const handleAttachUrl = async () => {
        if (!resourceUrl.trim()) {
            showError('Lỗi nhập liệu', 'Vui lòng nhập URL tài liệu');
            return;
        }

        // Validate URL format
        try {
            new URL(resourceUrl);
        } catch {
            showError('Lỗi định dạng URL', 'URL không hợp lệ. Vui lòng nhập URL đầy đủ (http:// hoặc https://)');
            return;
        }

        try {
            setIsUploading(true);
            const response = await attachResource(currentModule.moduleId, { resourceUrl });
            setCurrentModule(response.data);
            
            showSuccess('Gắn tài liệu thành công', 'Tài liệu đã được thêm vào module');
            setShowAttachForm(false);
            setResourceUrl('');
        } catch (error: any) {
            showError('Lỗi gắn tài liệu', error?.message || 'Không thể gắn tài liệu. Vui lòng thử lại');
        } finally {
            setIsUploading(false);
        }
    };

    // Mở confirm dialog để xóa tài liệu
    const handleDeleteResource = (resource: ModuleResource) => {
        setDeleteConfirm(resource);
    };

    // Thực hiện xóa tài liệu sau khi confirm
    const confirmDelete = async () => {
        if (!deleteConfirm) return;

        try {
            setIsDeleting(true);
            const response = await removeResourceByUrl(currentModule.moduleId, deleteConfirm.url);
            setCurrentModule(response.data);
            
            showSuccess('Xóa tài liệu thành công', 'Tài liệu đã được xóa khỏi module');
            setDeleteConfirm(null);
        } catch (error: any) {
            showError('Lỗi xóa tài liệu', error?.message || 'Không thể xóa tài liệu. Vui lòng thử lại');
            setDeleteConfirm(null);
        } finally {
            setIsDeleting(false);
        }
    };

    // Mở form đính kèm
    const handleOpenAttachForm = () => {
        setShowAttachForm(true);
        setResourceUrl('');
        setActiveTab('upload');
    };

    // Download file từ server
    const handleDownloadFile = (url: string, fileName?: string) => {
        // Tạo link download
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName || 'download';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Kiểm tra xem resource có phải là file đã upload không
    const isUploadedFile = (url: string): boolean => {
        return url.includes('/uploads/syllabus/');
    };

    // Kiểm tra file có thể preview không (PDF, DOCX, XLSX, PPTX)
    const canPreview = (url: string): boolean => {
        const previewableExtensions = ['.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'];
        return previewableExtensions.some(ext => url.toLowerCase().endsWith(ext));
    };

    // Mở DocumentViewer để preview file
    const handlePreview = (resource: ModuleResource) => {
        setPreviewUrl(resource.url);
        setPreviewFileName(resource.fileName || 'Document');
    };

    const resources = currentModule.resources || [];

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
                                <div className="font-semibold text-lg">{currentModule.name}</div>
                                <div className="text-sm text-gray-600">Mã module: {currentModule.code}</div>
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
                                    <div className="text-sm">{currentModule.programName}</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Số tín chỉ</label>
                                    <div className="text-sm">{currentModule.credits} tín chỉ</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Thời lượng</label>
                                    <div className="text-sm">{currentModule.durationHours} giờ</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Học kỳ</label>
                                    <div className="text-sm">Học kỳ {currentModule.semester}</div>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Loại môn học</label>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            currentModule.isMandatory
                                                ? 'bg-red-100 text-red-700'
                                                : 'bg-blue-100 text-blue-700'
                                        }`}
                                    >
                                        {currentModule.isMandatory ? 'Bắt buộc' : 'Tự chọn'}
                                    </span>
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-500 mb-1 font-medium">Trạng thái</label>
                                    <span
                                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                                            currentModule.isActive
                                                ? 'bg-green-100 text-green-700'
                                                : 'bg-gray-100 text-gray-700'
                                        }`}
                                    >
                                        {currentModule.isActive ? 'Hoạt động' : 'Tạm dừng'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Syllabus Section - SỬA MỚI */}
                        <div>
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-base font-semibold flex items-center gap-2">
                                    <FileText size={18} className="text-blue-600" />
                                    Tài liệu học tập
                                    {resources.length > 0 && (
                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                            {resources.length} tài liệu
                                        </span>
                                    )}
                                </h3>
                            </div>

                            {/* Danh sách tài liệu đã gắn */}
                            {resources.length > 0 && (
                                <div className="space-y-3 mb-4">
                                    {resources.map((resource, index) => {
                                        const typeInfo = getResourceType(resource.url);
                                        const isFile = isUploadedFile(resource.url);
                                        return (
                                            <div
                                                key={index}
                                                className="flex items-start gap-4 p-4 border-2 border-blue-200 bg-blue-50/50 rounded-lg hover:bg-blue-50 transition-colors"
                                            >
                                                <div className="flex-shrink-0 mt-1">
                                                    {typeInfo.icon}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-sm font-medium text-gray-700">
                                                            {resource.fileName || typeInfo.type}
                                                        </span>
                                                        {resource.fileType && (
                                                            <span className="text-xs bg-gray-200 text-gray-700 px-2 py-0.5 rounded">
                                                                {resource.fileType}
                                                            </span>
                                                        )}
                                                    </div>
                                                    
                                                    {/* Hiển thị link hoặc thông tin file */}
                                                    {isFile ? (
                                                        <div className="text-sm text-gray-600 mb-2 break-all">
                                                            📄 {resource.fileName || 'File đã tải lên'}
                                                        </div>
                                                    ) : (
                                                        <a
                                                            href={resource.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline break-all flex items-center gap-1 mb-2"
                                                        >
                                                            {resource.url}
                                                            <ExternalLink size={14} />
                                                        </a>
                                                    )}
                                                    
                                                    <div className="flex items-center gap-3 text-xs text-gray-500">
                                                        {resource.fileSize && (
                                                            <span className="flex items-center gap-1">
                                                                📦 {formatFileSize(resource.fileSize)}
                                                            </span>
                                                        )}
                                                        {resource.uploadedAt && (
                                                            <span className="flex items-center gap-1">
                                                                <Calendar size={12} />
                                                                {formatDate(resource.uploadedAt)}
                                                            </span>
                                                        )}
                                                        {resource.uploadedBy && (
                                                            <span className="flex items-center gap-1">
                                                                <User size={12} />
                                                                ID: {resource.uploadedBy}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                
                                                {/* Các nút action */}
                                                <div className="flex gap-2">
                                                    {/* Nút Preview (ưu tiên cho file có thể preview) */}
                                                    {isFile && canPreview(resource.url) && (
                                                        <button
                                                            onClick={() => handlePreview(resource)}
                                                            className="p-2 text-purple-600 hover:bg-purple-100 rounded-lg transition-colors"
                                                            title="Xem trước tài liệu"
                                                        >
                                                            <Eye size={18} />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Nút Download cho file đã upload */}
                                                    {isFile && (
                                                        <button
                                                            onClick={() => handleDownloadFile(resource.url, resource.fileName)}
                                                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition-colors"
                                                            title="Tải về máy tính"
                                                        >
                                                            <Download size={18} />
                                                        </button>
                                                    )}
                                                    
                                                    {/* Nút Xóa */}
                                                    <button
                                                        onClick={() => handleDeleteResource(resource)}
                                                        disabled={isDeleting}
                                                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition-colors disabled:opacity-50"
                                                        title="Xóa tài liệu"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* Form thêm tài liệu mới */}
                            {!showAttachForm ? (
                                // Nút "Thêm tài liệu"
                                <div 
                                    onClick={handleOpenAttachForm}
                                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-all"
                                >
                                    <Upload size={32} className="mx-auto text-gray-400 mb-2" />
                                    <p className="text-sm font-medium text-gray-700">
                                        {resources.length > 0 ? '+ Thêm tài liệu mới' : 'Chưa có tài liệu học tập'}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        Click để gắn tài liệu (File, YouTube, Google Drive, hoặc Link khác)
                                    </p>
                                </div>
                            ) : (
                                // Form gắn tài liệu (4 tabs)
                                <div className="border rounded-lg overflow-hidden">
                                    {/* Tabs */}
                                    <div className="flex border-b bg-gray-50">
                                        <button
                                            onClick={() => setActiveTab('upload')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                                activeTab === 'upload'
                                                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <Upload size={16} />
                                            Upload File
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('youtube')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                                activeTab === 'youtube'
                                                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <Youtube size={16} />
                                            YouTube
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('drive')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                                activeTab === 'drive'
                                                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <FolderOpen size={16} />
                                            Google Drive
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('link')}
                                            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${
                                                activeTab === 'link'
                                                    ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                                                    : 'text-gray-600 hover:text-gray-900'
                                            }`}
                                        >
                                            <Link2 size={16} />
                                            Link khác
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-6 bg-white">
                                        {activeTab === 'upload' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Hỗ trợ:</strong> PDF, Word, PowerPoint, Excel. Kích thước tối đa: 50MB.
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    disabled={isUploading}
                                                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                                                >
                                                    <Upload size={18} />
                                                    {isUploading ? 'Đang tải lên...' : 'Chọn file từ máy tính'}
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                                                    onChange={handleFileSelect}
                                                />
                                            </div>
                                        )}

                                        {activeTab === 'youtube' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                                    <p className="text-sm text-red-800">
                                                        <strong>Ví dụ:</strong> https://www.youtube.com/watch?v=xxxxx hoặc https://youtu.be/xxxxx
                                                    </p>
                                                </div>
                                                <input
                                                    type="url"
                                                    value={resourceUrl}
                                                    onChange={(e) => setResourceUrl(e.target.value)}
                                                    placeholder="Dán URL video YouTube vào đây"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={handleAttachUrl}
                                                    disabled={isUploading || !resourceUrl.trim()}
                                                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isUploading ? 'Đang xử lý...' : 'Gắn video YouTube'}
                                                </button>
                                            </div>
                                        )}

                                        {activeTab === 'drive' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                                    <p className="text-sm text-blue-800">
                                                        <strong>Ví dụ:</strong> https://drive.google.com/file/d/xxxxx/view
                                                    </p>
                                                </div>
                                                <input
                                                    type="url"
                                                    value={resourceUrl}
                                                    onChange={(e) => setResourceUrl(e.target.value)}
                                                    placeholder="Dán URL Google Drive vào đây"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={handleAttachUrl}
                                                    disabled={isUploading || !resourceUrl.trim()}
                                                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isUploading ? 'Đang xử lý...' : 'Gắn file Google Drive'}
                                                </button>
                                            </div>
                                        )}

                                        {activeTab === 'link' && (
                                            <div className="space-y-4">
                                                <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                                                    <p className="text-sm text-purple-800">
                                                        <strong>Lưu ý:</strong> URL phải bắt đầu bằng http:// hoặc https://
                                                    </p>
                                                </div>
                                                <input
                                                    type="url"
                                                    value={resourceUrl}
                                                    onChange={(e) => setResourceUrl(e.target.value)}
                                                    placeholder="Dán URL tài liệu vào đây"
                                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    onClick={handleAttachUrl}
                                                    disabled={isUploading || !resourceUrl.trim()}
                                                    className="w-full px-4 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    {isUploading ? 'Đang xử lý...' : 'Gắn tài liệu'}
                                                </button>
                                            </div>
                                        )}

                                        {/* Nút hủy */}
                                        <button
                                            onClick={() => {
                                                setShowAttachForm(false);
                                                setResourceUrl('');
                                            }}
                                            className="w-full mt-3 px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                        >
                                            Hủy
                                        </button>
                                    </div>
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
            
            {/* DocumentViewer Modal */}
            {previewUrl && (
                <DocumentViewer
                    documentUrl={previewUrl}
                    fileName={previewFileName}
                    onClose={() => setPreviewUrl(null)}
                />
            )}
            
            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={!!deleteConfirm}
                onClose={() => setDeleteConfirm(null)}
                onConfirm={confirmDelete}
                title="Xác nhận xóa tài liệu"
                description={`Bạn có chắc chắn muốn xóa tài liệu "${deleteConfirm?.fileName || 'này'}"? Hành động này không thể hoàn tác.`}
                confirmText="Xóa"
                cancelText="Hủy"
                variant="danger"
            />
        </div>
    );
};

export default ModuleDetailModal;
