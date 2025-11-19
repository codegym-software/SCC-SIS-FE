// src/shared/api/notifications.ts
import http from './http';

export type NotificationType =
    | 'STUDENT_WARNING'
    | 'GRADE_UPDATE'
    | 'SYSTEM_ANNOUNCEMENT'
    | 'CLASS_ACTIVITY'
    | 'ATTENDANCE_ALERT'
    | 'ACTION_REQUIRED';

export interface NotificationItem {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    createdAt: string; // ISO time
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    relatedId?: number; // e.g. studentId / classId
    meta?: Record<string, any>;
    unread?: boolean;
}

export interface NotificationsResponse {
    notifications: NotificationItem[];
    total: number;
}

// Mock sample data for UI while backend not ready
const now = Date.now();
const mockNotifications: NotificationItem[] = [
    {
        id: 'n1',
        type: 'STUDENT_WARNING',
        title: 'Cảnh báo học viên',
        message: 'HV001 nghỉ học 5/12 buổi',
        createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
        severity: 'HIGH',
        relatedId: 1,
        meta: { code: 'HV001' },
        unread: true,
    },
    {
        id: 'n2',
        type: 'GRADE_UPDATE',
        title: 'Giáo viên nhập điểm',
        message: 'Giáo viên A đã nhập điểm thi lớp K14',
        createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
        severity: 'MEDIUM',
        relatedId: 1014,
        unread: true,
    },
    {
        id: 'n3',
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Thông báo hệ thống',
        message: 'Hệ thống bảo trì 22:00 tối nay',
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'LOW',
        unread: false,
    },
    {
        id: 'n4',
        type: 'CLASS_ACTIVITY',
        title: 'Lớp mới tạo',
        message: 'Lớp Python K30 đã được tạo bởi Admin',
        createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        unread: false,
    },
];

export const notificationsApi = {
    async fetchNotifications(centerId?: number): Promise<NotificationsResponse> {
        try {
            const params = centerId ? { centerId } : {};
            const res = await http.get<NotificationsResponse>('/api/notifications', { params });
            return res.data;
        } catch (e) {
            console.warn('Notifications API not available, using mock data', e);
            return { notifications: mockNotifications, total: mockNotifications.length };
        }
    },
    getMock(): NotificationItem[] {
        return mockNotifications;
    },
};
