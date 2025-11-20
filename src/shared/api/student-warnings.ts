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
    classId: number;
    absences?: number;
    failedExams?: number;
}

export interface StudentWarningsResponse {
    warnings: StudentWarning[];
    totalCount: number;
}

/**
 * Tính toán cảnh báo cho một học viên trong tháng/năm hiện tại
 */
async function calculateStudentWarnings(
    studentId: number,
    classId: number,
    targetMonth: number,
    targetYear: number
): Promise<{ absences: number; failedExams: number }> {
    let absences = 0;
    let failedExams = 0;

    try {
        // Get attendance data
        const attendanceResponse = await getStudentAttendanceHistory(studentId, classId);
        const attendanceData = attendanceResponse.data;
        if (attendanceData && attendanceData.records) {
            absences = attendanceData.records.filter(record => {
                if (record.status !== 'ABSENT') return false;
                const recordDate = new Date(record.attendanceDate);
                return recordDate.getMonth() + 1 === targetMonth && 
                       recordDate.getFullYear() === targetYear;
            }).length;
        }
    } catch (err) {
        console.error('Error loading attendance for student:', studentId, err);
    }

    try {
        // Get grades data
        const gradesData = await getStudentGradesByStudentId(studentId);
        if (gradesData) {
            failedExams = gradesData.filter(grade => {
                if (grade.passStatus !== 'FAIL') return false;
                if (!grade.entryDate) return false;
                const [year, month] = grade.entryDate.split('-').map(Number);
                return month === targetMonth && year === targetYear;
            }).length;
        }
    } catch (err) {
        console.error('Error loading grades for student:', studentId, err);
    }

    return { absences, failedExams };
}

export const studentWarningsApi = {
    /**
     * Lấy danh sách học sinh bị cảnh báo theo trung tâm
     * Tính toán thực tế từ dữ liệu điểm danh và điểm thi
     * Cảnh báo nếu: nghỉ >= 2 buổi HOẶC trượt >= 2 bài trong tháng hiện tại
     */
    getWarnings: async (centerId?: number): Promise<{ data: StudentWarning[] }> => {
        try {
            console.log('[StudentWarnings] Starting to calculate warnings for centerId:', centerId);
            const now = new Date();
            const currentMonth = now.getMonth() + 1;
            const currentYear = now.getFullYear();
            console.log('[StudentWarnings] Current month/year:', currentMonth, currentYear);

            // Get all students with their enrollments
            const studentsResponse = await getAllStudentsWithEnrollments();
            const allStudents = Array.isArray(studentsResponse.data) ? studentsResponse.data : [];
            console.log('[StudentWarnings] Total students fetched:', allStudents.length);

            const warnings: StudentWarning[] = [];

            // Process each student
            for (const student of allStudents) {
                // Only check ACTIVE students
                if (student.overallStatus !== 'ACTIVE') continue;

                // Filter enrollments by center if specified
                const enrollments = student.enrollments?.filter(e => {
                    if (e.status !== 'ACTIVE') return false;
                    // Note: centerId filtering needs to be added to enrollment type or fetched separately
                    return true;
                }) || [];

                // Check each active enrollment
                for (const enrollment of enrollments) {
                    const { absences, failedExams } = await calculateStudentWarnings(
                        student.studentId,
                        enrollment.classId,
                        currentMonth,
                        currentYear
                    );

                    // Only add warning if meets threshold
                    if (absences >= 2 || failedExams >= 2) {
                        let reason = '';
                        let detail = '';
                        let severity: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';

                        if (absences >= 3 && failedExams >= 2) {
                            reason = 'Nghỉ và trượt nhiều';
                            detail = `Nghỉ ${absences} buổi, trượt ${failedExams} bài thi`;
                            severity = 'HIGH';
                        } else if (absences >= 3) {
                            reason = 'Nghỉ học nhiều';
                            detail = `Đã nghỉ ${absences} buổi trong tháng ${currentMonth}/${currentYear}`;
                            severity = 'HIGH';
                        } else if (failedExams >= 3) {
                            reason = 'Trượt nhiều bài thi';
                            detail = `Trượt ${failedExams} bài thi trong tháng ${currentMonth}/${currentYear}`;
                            severity = 'HIGH';
                        } else if (absences >= 2) {
                            reason = 'Nghỉ học';
                            detail = `Đã nghỉ ${absences} buổi trong tháng ${currentMonth}/${currentYear}`;
                            severity = 'MEDIUM';
                        } else if (failedExams >= 2) {
                            reason = 'Trượt bài thi';
                            detail = `Trượt ${failedExams} bài thi trong tháng ${currentMonth}/${currentYear}`;
                            severity = 'MEDIUM';
                        }

                        warnings.push({
                            studentId: student.studentId,
                            code: `HV${student.studentId}`,
                            name: student.fullName, // Sửa từ student.name thành student.fullName
                            reason,
                            detail,
                            program: enrollment.programName || 'N/A',
                            classCode: enrollment.className || 'N/A',
                            severity,
                            classId: enrollment.classId,
                            absences,
                            failedExams,
                        });

                        // Only show one warning per student (highest severity class)
                        break;
                    }
                }
            }

            // Sort by severity: HIGH > MEDIUM > LOW
            warnings.sort((a, b) => {
                const severityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
                return severityOrder[a.severity] - severityOrder[b.severity];
            });

            console.log('[StudentWarnings] Total warnings generated:', warnings.length);
            console.log('[StudentWarnings] Warnings:', warnings);

            return { data: warnings };
        } catch (error) {
            console.error('[StudentWarnings] Error calculating student warnings:', error);
            return { data: [] };
        }
    },
};
