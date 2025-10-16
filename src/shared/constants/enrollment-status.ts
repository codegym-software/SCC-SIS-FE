// src/shared/constants/enrollment-status.ts
export const ENROLLMENT_STATUS_LABEL: Record<string, string> = {
    ACTIVE: 'Đang học',
    SUSPENDED: 'Bảo lưu',
    DROPPED: 'Đã thôi học',
};

export const ENROLLMENT_STATUS_CLASS: Record<string, string> = {
    ACTIVE: 'bg-green-100 text-green-700',
    SUSPENDED: 'bg-amber-100 text-amber-700',
    DROPPED: 'bg-gray-200 text-gray-600',
};

export const ENROLLMENT_STATUS_API: Record<string, string> = {
    'Tất cả trạng thái': '',
    'Đang học': 'ACTIVE',
    'Bảo lưu': 'SUSPENDED',
    'Đã thôi học': 'DROPPED',
};

export const ENROLLMENT_STATUS_UI: Record<string, string> = {
    'ACTIVE': 'Đang học',
    'SUSPENDED': 'Bảo lưu',
    'DROPPED': 'Đã thôi học',
    '': 'Tất cả trạng thái',
};