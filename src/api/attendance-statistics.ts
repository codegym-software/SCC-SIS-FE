// API for Attendance Statistics
import api from '../shared/api/http';

export type AttendanceStatisticsParams = {
    classId: string;
    month?: number;
    year: number;
    viewType?: 'daily' | 'monthly';
};

export type DailyAttendanceData = {
    date: string; // Format: YYYY-MM-DD
    attendanceRate: number; // 0-100
    totalStudents: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
};

export type MonthlyAttendanceData = {
    month: number;
    year: number;
    attendanceRate: number; // 0-100
    totalSessions: number;
    averagePresent: number;
};

export type StudentAttendanceDetail = {
    studentId: string;
    studentCode: string;
    fullName: string;
    totalSessions: number;
    presentCount: number;
    absentCount: number;
    lateCount: number;
    attendanceRate: number;
};

export type AttendanceStatisticsResponse = {
    classId: string;
    className: string;
    period: {
        month?: number;
        year: number;
    };
    overallRate: number;
    dailyData?: DailyAttendanceData[];
    monthlyData?: MonthlyAttendanceData[];
    studentDetails: StudentAttendanceDetail[];
    summary: {
        totalSessions: number;
        totalStudents: number;
        excellentStudents: number; // >= 90%
        goodStudents: number; // 80-89%
        averageStudents: number; // 70-79%
        needSupportStudents: number; // < 70%
    };
};

// Get attendance statistics
export const getAttendanceStatistics = async (
    params: AttendanceStatisticsParams,
): Promise<{ data: AttendanceStatisticsResponse }> => {
    try {
        const response = await api.get('/attendance/statistics', { params });
        return response.data;
    } catch (error) {
        console.warn('Backend not available, using mock data');
        return generateMockStatistics(params);
    }
};

// Mock data generator
function generateMockStatistics(params: AttendanceStatisticsParams): { data: AttendanceStatisticsResponse } {
    const { classId, month, year, viewType = 'daily' } = params;

    // Generate daily data for the month
    const dailyData: DailyAttendanceData[] = [];
    if (viewType === 'daily' && month) {
        const daysInMonth = new Date(year, month, 0).getDate();
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month - 1, day);
            // Skip weekends
            if (date.getDay() === 0 || date.getDay() === 6) continue;

            const totalStudents = 8;
            const presentCount = Math.floor(Math.random() * 3) + 6; // 6-8
            const absentCount = Math.floor(Math.random() * 2); // 0-1
            const lateCount = totalStudents - presentCount - absentCount;

            dailyData.push({
                date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
                attendanceRate: (presentCount / totalStudents) * 100,
                totalStudents,
                presentCount,
                absentCount,
                lateCount,
            });
        }
    }

    // Generate monthly data for the year
    const monthlyData: MonthlyAttendanceData[] = [];
    if (viewType === 'monthly') {
        for (let m = 1; m <= 12; m++) {
            monthlyData.push({
                month: m,
                year,
                attendanceRate: 70 + Math.random() * 25, // 70-95%
                totalSessions: Math.floor(Math.random() * 5) + 18, // 18-22
                averagePresent: 6 + Math.random() * 2, // 6-8
            });
        }
    }

    // Generate student details
    const students = [
        { id: 'HV001', name: 'Lê Thị Lan' },
        { id: 'HV002', name: 'Hoàng Thị Mai' },
        { id: 'HV003', name: 'Vũ Đình Nam' },
        { id: 'HV004', name: 'Nguyễn Thu Hằng' },
        { id: 'HV005', name: 'Phạm Minh Đức' },
        { id: 'HV006', name: 'Đỗ Minh Tuấn' },
        { id: 'HV007', name: 'Trần Văn Hùng' },
        { id: 'HV008', name: 'Bùi Thị Hoa' },
    ];

    const totalSessions = dailyData.length || 21;
    const studentDetails: StudentAttendanceDetail[] = students.map((student) => {
        const presentCount = Math.floor(Math.random() * 6) + (totalSessions - 5); // High attendance
        const absentCount = Math.floor(Math.random() * 3);
        const lateCount = totalSessions - presentCount - absentCount;

        return {
            studentId: student.id,
            studentCode: student.id,
            fullName: student.name,
            totalSessions,
            presentCount,
            absentCount,
            lateCount,
            attendanceRate: (presentCount / totalSessions) * 100,
        };
    });

    // Calculate summary
    const excellentStudents = studentDetails.filter((s) => s.attendanceRate >= 90).length;
    const goodStudents = studentDetails.filter((s) => s.attendanceRate >= 80 && s.attendanceRate < 90).length;
    const averageStudents = studentDetails.filter((s) => s.attendanceRate >= 70 && s.attendanceRate < 80).length;
    const needSupportStudents = studentDetails.filter((s) => s.attendanceRate < 70).length;

    const overallRate = studentDetails.reduce((sum, s) => sum + s.attendanceRate, 0) / studentDetails.length;

    return {
        data: {
            classId,
            className: `Lập trình Web cơ bản - Sáng T2,T4,T6`,
            period: { month, year },
            overallRate,
            dailyData: viewType === 'daily' ? dailyData : undefined,
            monthlyData: viewType === 'monthly' ? monthlyData : undefined,
            studentDetails,
            summary: {
                totalSessions,
                totalStudents: students.length,
                excellentStudents,
                goodStudents,
                averageStudents,
                needSupportStudents,
            },
        },
    };
}
