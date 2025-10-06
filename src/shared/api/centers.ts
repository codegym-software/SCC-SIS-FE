import http from './http'
import type { CenterDto, CreateCenterDto, UpdateCenterDto } from '../types/centers'

export const listAllCenters = async (): Promise<CenterDto[]> => {
  try {
    const response = await http.get('/centers')
    return response.data
  } catch (error) {
    console.error('API Error in listAllCenters:', error)
    throw error
  }
}

export const createCenter = async (data: CreateCenterDto): Promise<CenterDto> => {
  const response = await http.post('/centers', data)
  return response.data
}

export const updateCenter = async (id: number, data: UpdateCenterDto): Promise<CenterDto> => {
  const response = await http.put(`/centers/${id}`, data)
  return response.data
}

export const deactivateCenter = async (id: number): Promise<void> => {
  await http.delete(`/centers/${id}`)
}

export const reactivateCenter = async (id: number): Promise<CenterDto> => {
  const response = await http.post(`/centers/${id}/reactivate`)
  return response.data
}
