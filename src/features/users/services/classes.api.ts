import api from '../../../shared/api/http'

// Standardized API Response interface
export interface ApiResponse<T> {
  success: boolean
  message: string
  data: T
  error?: string
  errorCode?: string
  timestamp: string
  status?: number
}

export interface Class {
  classId: number
  code: string
  name: string
  description?: string
  centerId: number
  centerName: string
  maxStudents: number
  currentStudents: number
  startDate?: string
  endDate?: string
  status: 'PLANNING' | 'RECRUITING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED'
  deletedAt?: string
  createdBy?: number
  updatedBy?: number
  createdAt: string
  updatedAt: string
  lecturers: LecturerInfo[]
}

export interface LecturerInfo {
  lecturerId: number
  lecturerName: string
  lecturerEmail?: string
  role: 'MAIN' | 'ASSISTANT' | 'COORDINATOR'
  roleDisplayName: string
  assignedAt: string
  isActive: boolean
}

export interface CreateClassRequest {
  code: string
  name: string
  description?: string
  centerId: number
  maxStudents?: number
  currentStudents?: number
  startDate?: string
  endDate?: string
}

export interface UpdateClassRequest {
  name: string
  description?: string
  maxStudents?: number
  currentStudents?: number
  startDate?: string
  endDate?: string
}

export interface AssignLecturerRequest {
  lecturerId: number
  lecturerName: string
  lecturerEmail?: string
  role?: 'MAIN' | 'ASSISTANT' | 'COORDINATOR'
}

// Legacy interfaces for backward compatibility
export interface ClassResponse {
  success: boolean
  data: Class
  message?: string
}

export interface ClassesResponse {
  success: boolean
  data: Class[]
  message?: string
}

export const classesApi = {
  // Lấy tất cả lớp học
  getAll: (isDeleted?: boolean) => 
    api.get<ApiResponse<Class[]>>(`/api/classes${isDeleted !== undefined ? `?isDeleted=${isDeleted}` : ''}`),
  
  // Lấy lớp học theo trung tâm
  getByCenter: (centerId: number) => 
    api.get<ApiResponse<Class[]>>(`/api/classes/center/${centerId}`),
  
  // Tìm kiếm lớp học
  search: (keyword: string) => 
    api.get<ApiResponse<Class[]>>(`/api/classes/search?keyword=${encodeURIComponent(keyword)}`),
  
  // Lấy lớp học theo ID
  getById: (classId: number) => 
    api.get<ApiResponse<Class>>(`/api/classes/${classId}`),
  
  // Tạo lớp học mới
  create: (data: CreateClassRequest) => 
    api.post<ApiResponse<Class>>('/api/classes', data),
  
  // Cập nhật lớp học
  update: (classId: number, data: UpdateClassRequest) => 
    api.put<ApiResponse<Class>>(`/api/classes/${classId}`, data),
  
  // Vô hiệu hóa lớp học (soft delete)
  deactivate: (classId: number) => 
    api.patch<ApiResponse<Class>>(`/api/classes/${classId}/deactivate`),
  
  // Kích hoạt lớp học (restore)
  activate: (classId: number) => 
    api.patch<ApiResponse<Class>>(`/api/classes/${classId}/activate`),
  
  // Xóa vĩnh viễn lớp học
  delete: (classId: number) => 
    api.delete<ApiResponse<void>>(`/api/classes/${classId}`),
  
  // Kiểm tra mã lớp có tồn tại không
  checkCode: (code: string) => 
    api.get<ApiResponse<boolean>>(`/api/classes/check-code?code=${encodeURIComponent(code)}`),
  
  // Kiểm tra tên lớp có tồn tại không
  checkName: (name: string) => 
    api.get<ApiResponse<boolean>>(`/api/classes/check-name?name=${encodeURIComponent(name)}`),
  
  // Gán giảng viên vào lớp
  assignLecturer: (classId: number, data: AssignLecturerRequest) => 
    api.post<ApiResponse<Class>>(`/api/classes/${classId}/lecturers`, data),
  
  // Gỡ giảng viên khỏi lớp
  removeLecturer: (classId: number, lecturerId: number) => 
    api.delete<ApiResponse<Class>>(`/api/classes/${classId}/lecturers/${lecturerId}`),
  
  // Lấy danh sách giảng viên của lớp
  getLecturers: (classId: number) => 
    api.get<ApiResponse<LecturerInfo[]>>(`/api/classes/${classId}/lecturers`),
  
  // Cập nhật vai trò giảng viên trong lớp
  updateLecturerRole: (classId: number, lecturerId: number, role: string) => 
    api.patch<ApiResponse<Class>>(`/api/classes/${classId}/lecturers/${lecturerId}/role?role=${role}`),
  
  // Chuyển đổi trạng thái lớp
  transitionStatus: (classId: number, newStatus: string) => 
    api.patch<ApiResponse<Class>>(`/api/classes/${classId}/status/${newStatus}`),
  
  // Tự động cập nhật trạng thái lớp
  autoUpdateStatuses: () => 
    api.post<ApiResponse<void>>('/api/classes/auto-update-status'),
  
  // Lấy lớp sắp bắt đầu
  getStartingSoon: () => 
    api.get<ApiResponse<Class[]>>('/api/classes/starting-soon'),
  
  // Lấy lớp sắp kết thúc
  getEndingSoon: () => 
    api.get<ApiResponse<Class[]>>('/api/classes/ending-soon'),
  
  // Lấy lớp có capacity
  getWithCapacity: () => 
    api.get<ApiResponse<Class[]>>('/api/classes/with-capacity'),
  
  // Lấy lớp theo giảng viên
  getByLecturer: (lecturerId: number) => 
    api.get<ApiResponse<Class[]>>(`/api/classes/lecturer/${lecturerId}`),
  
  // Thống kê lớp theo trạng thái
  getStatsByStatus: (status: string) => 
    api.get<ApiResponse<number>>(`/api/classes/stats/status/${status}`),
  
  // Test endpoint
  test: () => 
    api.get<ApiResponse<string>>('/api/classes/test')
}
