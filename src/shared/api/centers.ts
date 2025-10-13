import http from './http'
import type { CenterDto, CreateCenterDto, UpdateCenterDto } from '../types/centers'

export const listAllCenters = async (): Promise<CenterDto[]> => {
  try {
    const response = await http.get('/api/centers')
    console.log('Raw centers response:', response);
    console.log('Response data type:', typeof response.data);
    console.log('Response data value:', response.data);
    
    // Backend có thể trả về data ở format khác
    const data = response.data || response.data?.data || response.data?.content || [];
    console.log('Extracted centers from API:', data);
    return data;
  } catch (error) {
    console.error('API Error in listAllCenters:', error)
    throw error
  }
}

export const createCenter = async (data: CreateCenterDto): Promise<CenterDto> => {
  const response = await http.post('/api/centers', data)
  return response.data
}

export const updateCenter = async (id: number, data: UpdateCenterDto): Promise<CenterDto> => {
  const response = await http.put(`/api/centers/${id}`, data)
  return response.data
}

export const deactivateCenter = async (id: number): Promise<void> => {
  await http.delete(`/api/centers/${id}`)
}

export const reactivateCenter = async (id: number): Promise<CenterDto> => {
  const response = await http.post(`/api/centers/${id}/reactivate`)
  return response.data
}
