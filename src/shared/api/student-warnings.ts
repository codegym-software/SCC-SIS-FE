// src/shared/api/student-warnings.ts
import http from './http';

export interface StudentWarning {
    studentId: number;
    code: string;
    name: string;
    reason: string;
    detail: string;
    program: string;
    classCode: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
}

export interface StudentWarningsResponse {
    warnings: StudentWarning[];
    totalCount: number;
}

// Mock data mặc định cho testing UI
const mockWarnings: StudentWarning[] = [
    {
        studentId: 1,
        code: 'HV001',
        name: 'Nguyễn Văn B',
        reason: 'Nghỉ học nhiều',
        detail: 'Đã nghỉ 5/12 buổi học',
        program: 'Java Cơ bản',
        classCode: 'K14',
        severity: 'HIGH',
    },
    {
        studentId: 2,
        code: 'HV002',
        name: 'Trần Thị C',
        reason: 'Điểm số thấp',
        detail: 'Điểm trung bình: 4.2/10',
        program: 'Python Data Science',
        classCode: 'K12',
        severity: 'HIGH',
    },
    {
        studentId: 3,
        code: 'HV003',
        name: 'Lê Văn D',
        reason: 'Chưa nộp bài tập',
        detail: 'Còn 3 bài tập chưa nộp',
        program: 'Digital Marketing',
        classCode: 'K08',
        severity: 'MEDIUM',
    },
];

export const studentWarningsApi = {
    /**
     * GET /api/student-warnings?centerId={centerId}
     * Lấy danh sách học sinh bị cảnh báo theo trung tâm
     * Fallback về mock data nếu API chưa sẵn sàng
     */
    getStudentWarnings: async (centerId?: number): Promise<StudentWarningsResponse> => {
        try {
            const params = centerId ? { centerId } : {};
            const response = await http.get<StudentWarningsResponse>('/api/student-warnings', { params });
            return response.data;
        } catch (error) {
            // Fallback to mock data if API not available
            console.warn('Student warnings API not available, using mock data:', error);
            return {
                warnings: mockWarnings,
                totalCount: mockWarnings.length,
            };
        }
    },

    /**
     * Mock data getter - dùng cho test UI
     */
    getMockWarnings: (): StudentWarning[] => mockWarnings,
};
