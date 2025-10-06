import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'warning' | 'info';
}

export default function ConfirmDialog({
    open,
    onClose,
    onConfirm,
    title,
    description,
    confirmText = 'Xác nhận',
    cancelText = 'Hủy',
    variant = 'warning',
}: ConfirmDialogProps) {
    if (!open) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    const getVariantStyles = () => {
        switch (variant) {
            case 'danger':
                return {
                    icon: 'text-red-600',
                    iconBg: 'bg-red-50',
                    button: 'bg-red-600 hover:bg-red-700 text-white',
                    border: 'border-red-200',
                };
            case 'warning':
                return {
                    icon: 'text-amber-600',
                    iconBg: 'bg-amber-50',
                    button: 'bg-amber-600 hover:bg-amber-700 text-white',
                    border: 'border-amber-200',
                };
            default:
                return {
                    icon: 'text-blue-600',
                    iconBg: 'bg-blue-50',
                    button: 'bg-blue-600 hover:bg-blue-700 text-white',
                    border: 'border-blue-200',
                };
        }
    };

    const styles = getVariantStyles();

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div
                className={`relative bg-white rounded-2xl shadow-2xl border ${styles.border} max-w-md w-full mx-4 overflow-hidden`}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100">
                    <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${styles.iconBg} flex items-center justify-center`}>
                            <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
                            <p className="text-sm text-gray-600 mt-1">{description}</p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="h-8 w-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
                    >
                        <X size={16} className="text-gray-400" />
                    </button>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-3 p-6 bg-gray-50/50">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {cancelText}
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${styles.button}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
