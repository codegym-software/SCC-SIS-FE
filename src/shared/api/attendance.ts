// src/shared/api/attendance.ts
import api from './http';

export type AttendanceStatus = 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED';
export type StudyTime = 'MORNING' | 'AFTERNOON' | 'EVENING';

export type LecturerScheduleDto = {
    scheduleId: number;
    classId: number;
    className: string;
    programName: string;
    room: string;
    date: string; // yyyy-mm-dd
    studyTime: StudyTime;
    timeRange: string;
    isAttended: boolean; // đã điểm danh chưa
};

export type AttendanceRecordDto = {
    studentId: number;
    studentCode: string;
    studentName: string;
    email: string;
    phone: string;
    status: AttendanceStatus | null;
    note: string | null;
};

export type SaveAttendanceRequest = {
    scheduleId: number;
    records: {
        studentId: number;
        status: AttendanceStatus;
        note?: string;
    }[];
};

/**
 * Lấy lịch giảng dạy của giảng viên trong tuần
 * GET /api/attendance/schedule?startDate=2025-01-13&endDate=2025-01-19
 */
export const getLecturerSchedule = (startDate: string, endDate: string) =>
    api.get<LecturerScheduleDto[]>('/api/attendance/schedule', {
        params: { startDate, endDate },
    });

/**
 * Lấy danh sách học viên để điểm danh
 * GET /api/attendance/classes/{classId}/students?date=2025-01-15&studyTime=MORNING
 */
export const getAttendanceStudents = (classId: number, date: string, studyTime: StudyTime) =>
    api.get<AttendanceRecordDto[]>(`/api/attendance/classes/${classId}/students`, {
        params: { date, studyTime },
    });

/**
 * Lưu điểm danh
 * POST /api/attendance
 */
export const saveAttendance = (payload: SaveAttendanceRequest) => api.post('/api/attendance', payload);
