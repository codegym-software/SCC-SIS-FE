import api from '../../../shared/api/http'

export interface Center {
  centerId: number
  code: string
  name: string
<<<<<<< Updated upstream
  isActive: boolean
  createdAt: string
  updatedAt: string
=======
  description?: string
  establishedDate?: string
  deletedAt?: string
  createdAt: string
  updatedAt: string
  createdBy?: number
  updatedBy?: number
  
  // Thông tin địa chỉ
  addressLine: string
  province: string
  district: string
  ward: string
  
  // Thông tin liên hệ
  phone?: string
  email?: string
  website?: string
  
  // Thông tin thống kê
  currentStudents: number
  maxStudents: number
  lecturerCount: number
  courseCount: number
  
  // Thông tin quản lý
  managerId?: string
  managerName?: string
>>>>>>> Stashed changes
}

export interface CreateCenterRequest {
  code: string
  name: string
<<<<<<< Updated upstream
}

export interface UpdateCenterRequest {
  code: string
  name: string
=======
  description?: string
  establishedDate?: string
  
  // Thông tin địa chỉ
  addressLine: string
  province: string
  district: string
  ward: string
  
  // Thông tin liên hệ
  phone?: string
  email?: string
  website?: string
  
  // Thông tin thống kê
  currentStudents?: number
  maxStudents?: number
  lecturerCount?: number
  courseCount?: number
  
  // Thông tin quản lý
  managerId?: string
  managerName?: string
}

export interface UpdateCenterRequest {
  name: string
  description?: string
  establishedDate?: string
  
  // Thông tin địa chỉ
  addressLine: string
  province: string
  district: string
  ward: string
  
  // Thông tin liên hệ
  phone?: string
  email?: string
  website?: string
  
  // Thông tin thống kê
  currentStudents?: number
  maxStudents?: number
  lecturerCount?: number
  courseCount?: number
  
  // Thông tin quản lý
  managerId?: string
  managerName?: string
>>>>>>> Stashed changes
}

export interface CenterResponse {
  message: string
  center: Center
}

export const centersApi = {
<<<<<<< Updated upstream
  // Lấy danh sách centers đang hoạt động
=======
  // Lấy danh sách centers đang hoạt động (chưa bị xóa)
>>>>>>> Stashed changes
  getAllActive: () => api.get<Center[]>('/api/centers'),
  
  // Test endpoint - không cần authentication
  getTest: () => api.get<Center[]>('/api/centers/test'),
  
  // Test create - không cần authentication
  createTest: (data: CreateCenterRequest) => api.post<Center>('/api/centers/test', data),
  
<<<<<<< Updated upstream
  // Lấy tất cả centers (bao gồm inactive) - Super Admin only
  getAll: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?isActive=${isActive}` : ''
    return api.get<Center[]>(`/api/centers/all${params}`)
  },
  
  // Lấy center theo ID
  getById: (id: number) => api.get<Center>(`/api/centers/${id}`),
  
  // Lấy center theo ID (bao gồm inactive) - Super Admin only
=======
  // Lấy tất cả centers (bao gồm đã xóa) - Super Admin only
  getAll: (isDeleted?: boolean) => {
    const params = isDeleted !== undefined ? `?isDeleted=${isDeleted}` : ''
    return api.get<Center[]>(`/api/centers/all${params}`)
  },
  
  // Tìm kiếm centers theo keyword
  search: (keyword: string) => api.get<Center[]>(`/api/centers/search?keyword=${encodeURIComponent(keyword)}`),
  
  // Lấy center theo ID (chỉ centers chưa bị xóa)
  getById: (id: number) => api.get<Center>(`/api/centers/${id}`),
  
  // Lấy center theo ID (bao gồm đã xóa) - Super Admin only
>>>>>>> Stashed changes
  getByIdAdmin: (id: number) => api.get<Center>(`/api/centers/${id}/admin`),
  
  // Tạo center mới
  create: (data: CreateCenterRequest) => api.post<Center>('/api/centers', data),
  
  // Cập nhật center
  update: (id: number, data: UpdateCenterRequest) => api.put<Center>(`/api/centers/${id}`, data),
  
<<<<<<< Updated upstream
  // Vô hiệu hóa center
  deactivate: (id: number) => api.patch<CenterResponse>(`/api/centers/${id}/deactivate`),
  
  // Kích hoạt lại center
  activate: (id: number) => api.patch<CenterResponse>(`/api/centers/${id}/activate`),
  
=======
  // Xóa mềm center (soft delete)
  softDelete: (id: number) => api.delete<CenterResponse>(`/api/centers/${id}`),
  
  // Vô hiệu hóa center (soft delete)
  deactivate: (id: number) => api.patch<CenterResponse>(`/api/centers/${id}/deactivate`),
  
  // Kích hoạt center (restore)
  activate: (id: number) => api.patch<CenterResponse>(`/api/centers/${id}/activate`),
  
  // Khôi phục center đã xóa
  restore: (id: number) => api.patch<CenterResponse>(`/api/centers/${id}/restore`),
  
>>>>>>> Stashed changes
  // Kiểm tra mã center có sẵn không
  checkCodeAvailability: (code: string) => api.get<{available: boolean}>(`/api/centers/check-code/${code}`),
  
  // Kiểm tra tên center có sẵn không
  checkNameAvailability: (name: string) => api.get<{available: boolean}>(`/api/centers/check-name?name=${encodeURIComponent(name)}`)
}
