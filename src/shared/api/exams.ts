// TODO: Backend sẽ implement sau - Hiện tại dùng MOCK
// import api from './http';

export interface StudentScoreInput {
    studentId: number;
    theoryScore: number;
    practicalScore: number;
    note?: string;
}

export interface CreateExamResultRequest {
    classId: number;
    moduleId: number;
    examDate: string; // ISO date string
    studentScores: StudentScoreInput[];
}

export interface UpdateExamResultRequest {
    examDate?: string;
    studentScores?: StudentScoreInput[];
}

export interface StudentScoreResponse {
    studentId: number;
    studentCode: string;
    fullName: string;
    theoryScore: number;
    practicalScore: number;
    finalScore: number;
    status: 'PASS' | 'FAIL';
    note?: string;
}

export interface ExamResultResponse {
    examResultId: number;
    classId: number;
    className: string;
    moduleId: number;
    moduleName: string;
    examDate: string;
    createdBy: number;
    creatorName: string;
    createdAt: string;
    updatedAt: string;
    studentScores: StudentScoreResponse[];
}

/**
 * Tạo đợt nhập điểm mới (MOCK - Backend implement sau)
 */
export const createExamResult = async (request: CreateExamResultRequest): Promise<ExamResultResponse> => {
    // MOCK: Import từ exams.mock.ts
    const { createExamResult: mockCreate } = await import('./exams.mock');
    return mockCreate(request);
};

/**
 * Lấy danh sách đợt nhập điểm theo lớp (MOCK)
 */
export const getExamResultsByClass = async (classId: number): Promise<ExamResultResponse[]> => {
    const { getExamResultsByClass: mockGet } = await import('./exams.mock');
    return mockGet(classId);
};

/**
 * Lấy danh sách đợt nhập điểm theo lớp và module (MOCK)
 */
export const getExamResultsByClassAndModule = async (
    classId: number,
    moduleId: number,
): Promise<ExamResultResponse[]> => {
    const { getExamResultsByClassAndModule: mockGet } = await import('./exams.mock');
    return mockGet(classId, moduleId);
};

/**
 * Lấy chi tiết một đợt nhập điểm (MOCK)
 */
export const getExamResultById = async (examResultId: number): Promise<ExamResultResponse> => {
    const { getExamResultById: mockGet } = await import('./exams.mock');
    return mockGet(examResultId);
};

/**
 * Cập nhật đợt nhập điểm (MOCK)
 */
export const updateExamResult = async (
    examResultId: number,
    request: UpdateExamResultRequest,
): Promise<ExamResultResponse> => {
    const { updateExamResult: mockUpdate } = await import('./exams.mock');
    return mockUpdate(examResultId, request);
};

/**
 * Xóa đợt nhập điểm (MOCK)
 */
export const deleteExamResult = async (examResultId: number): Promise<void> => {
    const { deleteExamResult: mockDelete } = await import('./exams.mock');
    return mockDelete(examResultId);
};

/**
 * Lấy danh sách ngày nhập điểm của module trong lớp (MOCK)
 */
export const getExamDatesByClassAndModule = async (classId: number, moduleId: number): Promise<string[]> => {
    const { getExamDatesByClassAndModule: mockGet } = await import('./exams.mock');
    return mockGet(classId, moduleId);
};
