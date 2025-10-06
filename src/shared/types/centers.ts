export interface CenterDto {
  id: number
  name: string
  code: string
  email: string
  phone: string
  establishedDate?: string
  description?: string
  addressLine: string
  province: string
  district: string
  ward: string
  active: boolean
  createdAt: string
  updatedAt?: string
  createdBy?: number | null
  updatedBy?: number | null
  deletedAt?: string | null
}

export interface CreateCenterDto {
  name: string
  code: string
  email: string
  phone: string
  establishedDate?: string
  description?: string
  addressLine: string
  province: string
  district: string
  ward: string
}

export interface UpdateCenterDto {
  name?: string
  code?: string
  email?: string
  phone?: string
  establishedDate?: string
  description?: string
  addressLine?: string
  province?: string
  district?: string
  ward?: string
  active?: boolean
}
