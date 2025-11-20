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

// Mock sample data for UI - Hoạt động gần đây
const now = Date.now();
const mockNotifications: NotificationItem[] = [
    {
        id: 'n1',
        type: 'STUDENT_WARNING',
        title: 'Cảnh báo học viên',
        message: 'Học viên Nguyễn Văn A (HV001) đã nghỉ học 5/12 buổi trong tháng này',
        createdAt: new Date(now - 5 * 60 * 1000).toISOString(),
        severity: 'HIGH',
        relatedId: 1,
        meta: { code: 'HV001' },
        unread: true,
    },
    {
        id: 'n2',
        type: 'GRADE_UPDATE',
        title: 'Cập nhật điểm số',
        message: 'Giáo viên Trần Thị B đã nhập điểm thi cuối kỳ cho lớp Java K14',
        createdAt: new Date(now - 15 * 60 * 1000).toISOString(),
        severity: 'MEDIUM',
        relatedId: 1014,
        unread: true,
    },
    {
        id: 'n3',
        type: 'CLASS_ACTIVITY',
        title: 'Lớp học mới được tạo',
        message: 'Lớp Python Data Science K30 đã được tạo thành công bởi Admin',
        createdAt: new Date(now - 45 * 60 * 1000).toISOString(),
        severity: 'LOW',
        unread: true,
    },
    {
        id: 'n4',
        type: 'ATTENDANCE_ALERT',
        title: 'Điểm danh hoàn tất',
        message: 'Giáo viên Lê Văn C đã hoàn tất điểm danh buổi học ngày 19/11/2025 - Lớp ReactJS K12',
        createdAt: new Date(now - 2 * 60 * 60 * 1000).toISOString(),
        severity: 'LOW',
        unread: false,
    },
    {
        id: 'n5',
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Thông báo bảo trì hệ thống',
        message: 'Hệ thống sẽ được bảo trì và nâng cấp vào 22:00 - 23:00 tối nay (19/11/2025)',
        createdAt: new Date(now - 3 * 60 * 60 * 1000).toISOString(),
        severity: 'MEDIUM',
        unread: false,
    },
    {
        id: 'n6',
        type: 'ACTION_REQUIRED',
        title: 'Cần phê duyệt học viên mới',
        message: '3 học viên mới đang chờ phê duyệt hồ sơ nhập học',
        createdAt: new Date(now - 4 * 60 * 60 * 1000).toISOString(),
        severity: 'HIGH',
        relatedId: 2001,
        unread: false,
    },
    {
        id: 'n7',
        type: 'CLASS_ACTIVITY',
        title: 'Học viên hoàn thành khóa học',
        message: 'Học viên Phạm Thị D đã hoàn thành khóa học Digital Marketing K08 với điểm xuất sắc',
        createdAt: new Date(now - 5 * 60 * 60 * 1000).toISOString(),
        severity: 'LOW',
        unread: false,
    },
    {
        id: 'n8',
        type: 'GRADE_UPDATE',
        title: 'Điểm thi đã được duyệt',
        message: 'Bảng điểm thi giữa kỳ lớp Spring Boot K15 đã được trưởng bộ môn phê duyệt',
        createdAt: new Date(now - 6 * 60 * 60 * 1000).toISOString(),
        severity: 'LOW',
        unread: false,
    },
    {
        id: 'n9',
        type: 'STUDENT_WARNING',
        title: 'Cảnh báo tiến độ học tập',
        message: 'Học viên Hoàng Văn E (HV025) có điểm trung bình thấp (4.2/10) cần hỗ trợ thêm',
        createdAt: new Date(now - 8 * 60 * 60 * 1000).toISOString(),
        severity: 'MEDIUM',
        relatedId: 25,
        unread: false,
    },
    {
        id: 'n10',
        type: 'CLASS_ACTIVITY',
        title: 'Lịch học được cập nhật',
        message: 'Lịch học lớp Python K29 đã được điều chỉnh: Thứ 3, 5, 7 (18:30 - 21:00)',
        createdAt: new Date(now - 12 * 60 * 60 * 1000).toISOString(),
        severity: 'LOW',
        unread: false,
    },
    {
        id: 'n11',
        type: 'ACTION_REQUIRED',
        title: 'Yêu cầu chuyển lớp',
        message: '2 học viên đã gửi yêu cầu chuyển lớp học, cần xử lý trong vòng 24h',
        createdAt: new Date(now - 18 * 60 * 60 * 1000).toISOString(),
        severity: 'HIGH',
        relatedId: 3001,
        unread: false,
    },
    {
        id: 'n12',
        type: 'SYSTEM_ANNOUNCEMENT',
        title: 'Tính năng mới',
        message: 'Hệ thống đã cập nhật tính năng xuất báo cáo điểm danh và thống kê học viên',
        createdAt: new Date(now - 24 * 60 * 60 * 1000).toISOString(),
        severity: 'LOW',
        unread: false,
    },
];

export const notificationsApi = {
    async getNotifications(centerId?: number): Promise<{ data: NotificationItem[] }> {
        try {
            const params = centerId ? { centerId } : {};
            const res = await http.get<NotificationsResponse>('/api/notifications', { params });
            return { data: res.data?.notifications || [] };
        } catch (e) {
            console.warn('[Notifications] API not available, using mock data', e);
            return { data: mockNotifications };
        }
    },
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
