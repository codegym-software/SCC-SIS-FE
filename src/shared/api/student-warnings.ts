// src/shared/api/student-warnings.ts
import http from './http';
import { getAllStudentsWithEnrollments } from './students';
import { getStudentAttendanceHistory } from './attendance';
import { getStudentGradesByStudentId } from './grade-entries';

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

export const studentWarningsApi = {
    /**
     * GET /api/student-warnings?centerId={centerId}
     * Lấy danh sách học sinh bị cảnh báo theo trung tâm
     * Tổng hợp từ attendance (vắng mặt) và grades (thi trượt)
     */
    getStudentWarnings: async (centerId?: number): Promise<StudentWarningsResponse> => {
        try {
            // Try backend API first
            const params = centerId ? { centerId } : {};
            const response = await http.get<StudentWarningsResponse>('/api/student-warnings', { params });
            return response.data;
        } catch (error) {
            // Fallback: Calculate warnings from attendance and grades
            console.warn('Student warnings API not available, calculating from attendance & grades:', error);
            
            try {
                const studentsResponse = await getAllStudentsWithEnrollments();
                const students = studentsResponse.data;
                const warnings: StudentWarning[] = [];
                
                const now = new Date();
                const currentMonth = now.getMonth() + 1;
                const currentYear = now.getFullYear();
                
                await Promise.all(
                    students.map(async (student) => {
                        try {
                            // Only check students with active enrollments
                            const activeEnrollments = student.enrollments.filter(e => e.status === 'ACTIVE');
                            if (activeEnrollments.length === 0) return;
                            
                            for (const enrollment of activeEnrollments) {
                                // Load attendance
                                const attendanceResponse = await getStudentAttendanceHistory(
                                    student.studentId,
                                    enrollment.classId
                                );
                                
                                // Load grades
                                const gradesResponse = await getStudentGradesByStudentId(student.studentId);
                                
                                // Count absences in current month
                                const absences = (attendanceResponse.data.records || []).filter((record: any) => {
                                    const date = new Date(record.attendanceDate);
                                    return (
                                        date.getMonth() + 1 === currentMonth &&
                                        date.getFullYear() === currentYear &&
                                        record.status === 'ABSENT'
                                    );
                                }).length;
                                
                                // Count failed exams in current month
                                const failedExams = (gradesResponse || []).filter((grade: any) => {
                                    if (!grade.entryDate) return false;
                                    const date = new Date(grade.entryDate);
                                    return (
                                        date.getMonth() + 1 === currentMonth &&
                                        date.getFullYear() === currentYear &&
                                        grade.passStatus === 'FAIL'
                                    );
                                }).length;
                                
                                // Add warning if absences >= 2 or failed >= 2
                                if (absences >= 2 || failedExams >= 2) {
                                    let reason = '';
                                    let detail = '';
                                    let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
                                    
                                    if (absences >= 5 || failedExams >= 3) {
                                        severity = 'HIGH';
                                    }
                                    
                                    if (absences >= 2 && failedExams >= 2) {
                                        reason = 'Nghỉ học nhiều & Thi trượt';
                                        detail = `Vắng ${absences} buổi học, trượt ${failedExams} bài thi`;
                                    } else if (absences >= 2) {
                                        reason = 'Nghỉ học nhiều';
                                        detail = `Đã nghỉ ${absences} buổi học trong tháng`;
                                    } else {
                                        reason = 'Điểm số thấp';
                                        detail = `Trượt ${failedExams} bài thi trong tháng`;
                                    }
                                    
                                    warnings.push({
                                        studentId: student.studentId,
                                        code: `HV${String(student.studentId).padStart(3, '0')}`,
                                        name: student.fullName,
                                        reason,
                                        detail,
                                        program: enrollment.programName,
                                        classCode: enrollment.className,
                                        severity,
                                    });
                                    
                                    break; // Only add once per student
                                }
                            }
                        } catch (err) {
                            console.error(`Error loading warnings for student ${student.studentId}:`, err);
                        }
                    })
                );
                
                return {
                    warnings,
                    totalCount: warnings.length,
                };
            } catch (err) {
                console.error('Failed to calculate warnings from data:', err);
                // Return empty if all fails
                return {
                    warnings: [],
                    totalCount: 0,
                };
            }
        }
    },
};
