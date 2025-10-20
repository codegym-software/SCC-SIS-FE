// src/shared/api/students.ts
import api from './http';
import type { StudentDto, CreateStudentDto, UpdateStudentDto } from '../types/student';

/**
 * Tạo học viên mới
 * POST /api/students
 */
export const createStudent = (payload: CreateStudentDto) => 
    api.post<StudentDto>('/api/students', payload);

/**
 * Lấy danh sách tất cả học viên (chưa bị xóa mềm)
 * GET /api/students
 */
export const listStudents = () => api.get<StudentDto[]>('/api/students');

/**
 * Lấy chi tiết một học viên theo ID
 * GET /api/students/{id}
 */
export const getStudentById = (studentId: number) => api.get<StudentDto>(`/api/students/${studentId}`);

/**
 * Cập nhật thông tin học viên (chỉ 5 trường: fullName, email, phone, dob, addressLine)
 * PUT /api/students/{id}
 */
export const updateStudent = (studentId: number, payload: UpdateStudentDto) => 
    api.put<StudentDto>(`/api/students/${studentId}`, payload);

/**
 * Xóa mềm học viên (soft delete - đổi status sang INACTIVE)
 * DELETE /api/students/{id}
 */
export const deleteStudent = (studentId: number) => 
    api.delete(`/api/students/${studentId}`);

/**
 * Cập nhật trạng thái học viên
 * PATCH /api/students/{id}/status
 */
export const updateStudentStatus = (studentId: number, status: string) => 
    api.patch<StudentDto>(`/api/students/${studentId}/status`, { status });

/**
 * Tìm kiếm học viên theo tên hoặc email
 * GET /api/students/search?keyword={text}
 */
export const searchStudents = (keyword: string) => 
    api.get<StudentDto[]>(`/api/students/search?keyword=${encodeURIComponent(keyword)}`);
