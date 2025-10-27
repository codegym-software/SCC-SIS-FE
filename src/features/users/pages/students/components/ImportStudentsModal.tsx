import React, { useState } from 'react';
import { X, Upload } from 'lucide-react';
import { importStudentsFromExcel } from '@/shared/api/students';
import { useToast } from '@/shared/hooks/useToast';

type Props = { open: boolean; onClose: () => void; onSuccess: () => void; };

export default function ImportStudentsModal({ open, onClose, onSuccess }: Props) {
    const { success, error, info } = useToast();
    const [file, setFile] = useState<File | null>(null);
    const [importing, setImporting] = useState(false);

    const handleImport = async () => {
        if (!file) {
            error('Chưa chọn file', 'Vui lòng chọn file Excel để import');
            return;
        }

        setImporting(true);

        try {
            // Call import API with the file
            const response = await importStudentsFromExcel(file);
            const created = response.data;
            
            setImporting(false);
            
            success('Import hoàn tất', `Đã tạo thành công ${created.length} học viên`);
            onSuccess();
        } catch (e: any) {
            setImporting(false);
            const msg = e?.response?.data?.message || 'Có lỗi xảy ra khi import';
            error('Import thất bại', msg);
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/50" onClick={onClose} />
            <div className="fixed inset-0 flex items-center justify-center p-4">
                <div className="bg-white rounded-xl shadow-lg w-full max-w-2xl relative">
                    <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Import Học viên từ Excel</h2>
                            <p className="text-sm text-gray-500 mt-1">Tải mẫu Excel, điền dữ liệu và upload để tạo nhiều hồ sơ cùng lúc.</p>
                        </div>
                        <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="p-6 space-y-6">
                        {/* Instructions */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="text-sm font-medium text-blue-900 mb-2">📋 Hướng dẫn</h3>
                            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                                <li>Sử dụng nút "Export Excel" ở trang chính để tải danh sách hiện tại làm mẫu</li>
                                <li>Điền thông tin học viên vào file (các cột bắt buộc: Họ tên, Email, SĐT)</li>
                                <li>Chọn file đã điền và bấm "Import"</li>
                                <li>Hệ thống sẽ tự động tạo hồ sơ và bỏ qua các dòng lỗi</li>
                            </ol>
                        </div>

                        {/* Actions */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <label className="flex items-center gap-2 px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                                    <Upload className="w-4 h-4" />
                                    {file ? file.name : 'Chọn file Excel'}
                                    <input
                                        type="file"
                                        accept=".xlsx,.xls"
                                        hidden
                                        disabled={importing}
                                        onChange={(e) => {
                                            const f = e.target.files?.[0];
                                            if (f) {
                                                setFile(f);
                                                info('Đã chọn file', f.name);
                                            }
                                        }}
                                    />
                                </label>
                            </div>

                            {file && (
                                <div className="bg-gray-50 rounded-lg p-3 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                                            <Upload className="w-4 h-4 text-green-600" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{file.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {(file.size / 1024).toFixed(2)} KB
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setFile(null)}
                                        disabled={importing}
                                        className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Progress */}
                        {importing && (
                            <div className="space-y-2">
                                <div className="flex items-center justify-between text-sm">
                                    <span className="text-gray-600">Đang xử lý...</span>
                                </div>
                                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 rounded-full animate-pulse" style={{ width: '100%' }} />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="p-6 border-t border-gray-200 flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={importing}
                            className="px-6 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100 disabled:opacity-50"
                        >
                            Đóng
                        </button>
                        <button
                            type="button"
                            onClick={handleImport}
                            disabled={importing || !file}
                            className="px-6 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg hover:bg-black disabled:opacity-50"
                        >
                            {importing ? 'Đang import...' : 'Import ngay'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}


