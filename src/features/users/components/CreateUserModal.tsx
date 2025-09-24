import React, { useState } from 'react'
import { X, Plus, Calendar, ChevronDown } from 'lucide-react'

interface CreateUserModalProps {
  open: boolean
  onClose: () => void
  onSubmit: (userData: any) => void
}

interface UserRole {
  id: string
  role: string
  center: string
}

export default function CreateUserModal({ open, onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn A',
    email: 'email@education.vn',
    phone: '090xxxxxxx',
    dateOfBirth: '',
    gender: 'Nam',
    idCard: '123456789012',
    startDate: '',
    specialization: 'Giáo dục',
    experience: '5 năm',
    address: '123 Đường ABC, Phường XYZ, Quận QWE',
    city: 'TP.HCM',
    district: 'Quận 1',
    ward: 'Phường ABC',
    educationLevel: 'Đại học',
    notes: 'Thông tin bổ sung...'
  })

  const [userRoles, setUserRoles] = useState<UserRole[]>([
    { id: '1', role: '', center: '' }
  ])

  const roles = [
    'Chọn vai trò',
    'Giảng viên',
    'Giáo vụ',
    'Quản lý đào tạo',
    'Super Admin'
  ]

  const centers = [
    'Chọn trung tâm',
    'Trung tâm Hà Nội 1',
    'Trung tâm TP.HCM 1',
    'Trung tâm Đà Nẵng 1'
  ]

  const genders = ['Nam', 'Nữ', 'Khác']

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleRoleChange = (index: number, field: 'role' | 'center', value: string) => {
    setUserRoles(prev => prev.map((role, i) => 
      i === index ? { ...role, [field]: value } : role
    ))
  }

  const addRole = () => {
    setUserRoles(prev => [...prev, { id: Date.now().toString(), role: '', center: '' }])
  }

  const removeRole = (id: string) => {
    if (userRoles.length > 1) {
      setUserRoles(prev => prev.filter(role => role.id !== id))
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...formData, roles: userRoles })
    onClose()
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl mx-auto my-8 relative flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 flex justify-between items-center">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Tạo Người dùng mới</h2>
            <p className="text-sm text-[#717182] mt-1">Nhập thông tin để tạo tài khoản người dùng mới.</p>
          </div>
          <button 
            className="text-gray-400 hover:text-gray-600"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body with Form */}
        <div className="p-6 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <fieldset>
              <legend className="text-sm font-medium text-[#717182] mb-4">Thông tin cơ bản</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium mb-1">Họ và tên *</label>
                  <input
                    type="text"
                    id="fullName"
                    value={formData.fullName}
                    onChange={(e) => handleInputChange('fullName', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Nguyễn Văn A"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">Email *</label>
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="email@education.vn"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-1">Số điện thoại *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="090xxxxxxx"
                  />
                </div>
                <div className="relative">
                  <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">Ngày sinh</label>
                  <input
                    type="date"
                    id="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute right-3 top-9 text-gray-400 pointer-events-none" />
                </div>
                <div className="relative">
                  <label htmlFor="gender" className="block text-sm font-medium mb-1">Giới tính</label>
                  <select
                    id="gender"
                    value={formData.gender}
                    onChange={(e) => handleInputChange('gender', e.target.value)}
                    className="appearance-none w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {genders.map(gender => (
                      <option key={gender} value={gender}>{gender}</option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-3 top-9 opacity-50 pointer-events-none" />
                </div>
                <div>
                  <label htmlFor="idCard" className="block text-sm font-medium mb-1">Số CMND/CCCD</label>
                  <input
                    type="text"
                    id="idCard"
                    value={formData.idCard}
                    onChange={(e) => handleInputChange('idCard', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="123456789012"
                  />
                </div>
              </div>
            </fieldset>

            {/* Role and Center */}
            <fieldset>
              <div className="flex justify-between items-center mb-4">
                <legend className="text-sm font-medium text-[#717182]">Vai trò và trung tâm</legend>
                <button
                  type="button"
                  onClick={addRole}
                  className="flex items-center gap-2 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-lg hover:bg-gray-50"
                >
                  <Plus className="w-4 h-4" />
                  <span>Thêm vai trò</span>
                </button>
              </div>
              {userRoles.map((userRole, index) => (
                <div key={userRole.id} className="border border-gray-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4">
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Vai trò *</label>
                    <select
                      value={userRole.role}
                      onChange={(e) => handleRoleChange(index, 'role', e.target.value)}
                      className="appearance-none w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {roles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-9 opacity-50 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <label className="block text-sm font-medium mb-1">Trung tâm *</label>
                    <select
                      value={userRole.center}
                      onChange={(e) => handleRoleChange(index, 'center', e.target.value)}
                      className="appearance-none w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {centers.map(center => (
                        <option key={center} value={center}>{center}</option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-9 opacity-50 pointer-events-none" />
                  </div>
                  {userRoles.length > 1 && (
                    <div className="col-span-2 flex justify-end">
                      <button
                        type="button"
                        onClick={() => removeRole(userRole.id)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Xóa vai trò
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </fieldset>

            {/* Work Information */}
            <fieldset>
              <legend className="text-sm font-medium text-[#717182] mb-4">Thông tin công việc</legend>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                <div className="relative">
                  <label htmlFor="startDate" className="block text-sm font-medium mb-1">Ngày bắt đầu</label>
                  <input
                    type="date"
                    id="startDate"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <Calendar className="w-3.5 h-3.5 absolute right-3 top-9 text-gray-400 pointer-events-none" />
                </div>
                <div>
                  <label htmlFor="specialization" className="block text-sm font-medium mb-1">Chuyên môn</label>
                  <input
                    type="text"
                    id="specialization"
                    value={formData.specialization}
                    onChange={(e) => handleInputChange('specialization', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Giáo dục"
                  />
                </div>
                <div>
                  <label htmlFor="experience" className="block text-sm font-medium mb-1">Kinh nghiệm</label>
                  <input
                    type="text"
                    id="experience"
                    value={formData.experience}
                    onChange={(e) => handleInputChange('experience', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="5 năm"
                  />
                </div>
              </div>
            </fieldset>

            {/* Address and Other Info */}
            <fieldset>
              <legend className="text-sm font-medium text-[#717182] mb-4">Địa chỉ & thông tin khác</legend>
              <div className="space-y-4">
                <div>
                  <label htmlFor="address" className="block text-sm font-medium mb-1">Địa chỉ</label>
                  <input
                    type="text"
                    id="address"
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="123 Đường ABC, Phường XYZ, Quận QWE"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-1">Tỉnh/Thành phố</label>
                    <input
                      type="text"
                      id="city"
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="TP.HCM"
                    />
                  </div>
                  <div>
                    <label htmlFor="district" className="block text-sm font-medium mb-1">Quận/Huyện</label>
                    <input
                      type="text"
                      id="district"
                      value={formData.district}
                      onChange={(e) => handleInputChange('district', e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Quận 1"
                    />
                  </div>
                  <div>
                    <label htmlFor="ward" className="block text-sm font-medium mb-1">Phường/Xã</label>
                    <input
                      type="text"
                      id="ward"
                      value={formData.ward}
                      onChange={(e) => handleInputChange('ward', e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Phường ABC"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="educationLevel" className="block text-sm font-medium mb-1">Trình độ học vấn</label>
                    <input
                      type="text"
                      id="educationLevel"
                      value={formData.educationLevel}
                      onChange={(e) => handleInputChange('educationLevel', e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Đại học"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label htmlFor="notes" className="block text-sm font-medium mb-1">Ghi chú</label>
                    <input
                      type="text"
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => handleInputChange('notes', e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Thông tin bổ sung..."
                    />
                  </div>
                </div>
              </div>
            </fieldset>
          </form>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 mt-auto flex justify-end gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-[#030213] rounded-lg hover:bg-black"
          >
            Tạo Người dùng
          </button>
        </div>
      </div>
    </div>
  )
}
