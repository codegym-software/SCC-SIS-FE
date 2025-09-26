import api from '../../../shared/api/http'

export interface Center {
  centerId: number
  code: string
  name: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface CreateCenterRequest {
  code: string
  name: string
}

export interface UpdateCenterRequest {
  code: string
  name: string
}

export interface CenterResponse {
  message: string
  center: Center
}

export const centersApi = {
  // Lấy danh sách centers đang hoạt động
  getAllActive: () => api.get<Center[]>('/api/centers'),
  
  // Test endpoint - không cần authentication
  getTest: () => api.get<Center[]>('/api/centers/test'),
  
  // Test create - không cần authentication
  createTest: (data: CreateCenterRequest) => api.post<Center>('/api/centers/test', data),
  
  // Lấy tất cả centers (bao gồm inactive) - Super Admin only
  getAll: (isActive?: boolean) => {
    const params = isActive !== undefined ? `?isActive=${isActive}` : ''
    return api.get<Center[]>(`/api/centers/all${params}`)
  },
  
  // Lấy center theo ID
  getById: (id: number) => api.get<Center>(`/api/centers/${id}`),
  
  // Lấy center theo ID (bao gồm inactive) - Super Admin only
  getByIdAdmin: (id: number) => api.get<Center>(`/api/centers/${id}/admin`),
  
  // Tạo center mới
  create: (data: CreateCenterRequest) => api.post<Center>('/api/centers', data),
  
  // Cập nhật center
  update: (id: number, data: UpdateCenterRequest) => api.put<Center>(`/api/centers/${id}`, data),
  
  // Vô hiệu hóa center
  deactivate: (id: number) => api.patch<CenterResponse>(`/api/centers/${id}/deactivate`),
  
  // Kích hoạt lại center
  activate: (id: number) => api.patch<CenterResponse>(`/api/centers/${id}/activate`),
  
  // Kiểm tra mã center có sẵn không
  checkCodeAvailability: (code: string) => api.get<{available: boolean}>(`/api/centers/check-code/${code}`),
  
  // Kiểm tra tên center có sẵn không
  checkNameAvailability: (name: string) => api.get<{available: boolean}>(`/api/centers/check-name?name=${encodeURIComponent(name)}`)
}
