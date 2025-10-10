import { useState, useEffect, useRef } from 'react'
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Users } from 'lucide-react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
import { classesApi, type Class, type LecturerInfo, type CreateClassRequest, type UpdateClassRequest, type AssignLecturerRequest } from '../services/classes.api'

// Component Modal
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
        {children}
      </div>
    </div>
  )
}

export default function ClassesPage() {
  const toast = useToast()
  const { can } = usePermission()
  
  // States
  const [classes, setClasses] = useState<Class[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('active')
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Class | null>(null)
  const [viewing, setViewing] = useState<Class | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [centers, setCenters] = useState<Array<{centerId: number, name: string}>>([])
  const lecturersSectionRef = useRef<HTMLDivElement | null>(null)
  const [focusLecturers, setFocusLecturers] = useState(false)

  // Lecturer management states (used in edit mode)
  const [newLecturerId, setNewLecturerId] = useState<number | ''>('')
  const [newLecturerName, setNewLecturerName] = useState('')
  const [newLecturerEmail, setNewLecturerEmail] = useState('')
  const [newLecturerRole, setNewLecturerRole] = useState<'MAIN' | 'ASSISTANT' | 'COORDINATOR'>('MAIN')
  const [lecturerSubmitting, setLecturerSubmitting] = useState(false)
  
  // Form validation states
  const [formErrors, setFormErrors] = useState<Record<string, string>>({})
  const [isValidating, setIsValidating] = useState(false)

  // Load data
  const loadClasses = async () => {
    try {
      setLoading(true)
      const isDeleted = statusFilter === 'deleted'
      const response = await classesApi.getAll(isDeleted)
      
      // Handle both ApiResponse format and direct array format
      if (response.data.success && response.data.data) {
        setClasses(response.data.data)
        toast.success('Thành công', response.data.message)
      } else if (Array.isArray(response.data)) {
        // Direct array format
        setClasses(response.data)
        toast.success('Thành công', 'Tải danh sách lớp học thành công')
      } else {
        toast.error('Lỗi', response.data.message || 'Không thể tải danh sách lớp học')
      }
    } catch (error: any) {
      console.error('Error loading classes:', error)
      const message = error.response?.data?.message || error.message || 'Không thể tải danh sách lớp học'
      toast.error('Lỗi', message)
    } finally {
      setLoading(false)
    }
  }

  // Load centers for dropdown
  const loadCenters = async () => {
    try {
      // Mock data - trong thực tế sẽ gọi API lấy danh sách trung tâm
      setCenters([
        { centerId: 1, name: 'Trung tâm Hà Nội' },
        { centerId: 2, name: 'Trung tâm TP.HCM' },
        { centerId: 3, name: 'Trung tâm Đà Nẵng' }
      ])
    } catch (error) {
      console.error('Error loading centers:', error)
    }
  }

  // Real-time validation functions
  const validateField = async (field: string, value: string) => {
    const errors = { ...formErrors }
    
    switch (field) {
      case 'code':
        if (!value.trim()) {
          errors.code = 'Mã lớp không được để trống'
        } else if (value.length > 50) {
          errors.code = 'Mã lớp không được quá 50 ký tự'
        } else {
          // Check if code exists (only for new classes)
          if (!editing) {
            try {
              setIsValidating(true)
              const response = await classesApi.checkCode(value)
              if (response.data) {
                errors.code = 'Mã lớp đã tồn tại'
              } else {
                delete errors.code
              }
            } catch (error) {
              console.error('Error checking code:', error)
            } finally {
              setIsValidating(false)
            }
          } else {
            delete errors.code
          }
        }
        break
        
      case 'name':
        if (!value.trim()) {
          errors.name = 'Tên lớp không được để trống'
        } else if (value.length > 255) {
          errors.name = 'Tên lớp không được quá 255 ký tự'
        } else {
          // Check if name exists (only for new classes)
          if (!editing) {
            try {
              setIsValidating(true)
              const response = await classesApi.checkName(value)
              if (response.data.success && response.data.data) {
                errors.name = 'Tên lớp đã tồn tại'
              } else {
                delete errors.name
              }
            } catch (error) {
              console.error('Error checking name:', error)
            } finally {
              setIsValidating(false)
            }
          } else {
            delete errors.name
          }
        }
        break
        
      case 'maxStudents':
        const maxStudents = parseInt(value)
        if (isNaN(maxStudents) || maxStudents < 0) {
          errors.maxStudents = 'Số học viên tối đa phải là số dương'
        } else {
          delete errors.maxStudents
        }
        break
        
      case 'currentStudents':
        const currentStudents = parseInt(value)
        if (isNaN(currentStudents) || currentStudents < 0) {
          errors.currentStudents = 'Số học viên hiện tại phải là số dương'
        } else {
          // Check if current students <= max students
          const maxStudents = parseInt((document.querySelector('input[name="maxStudents"]') as HTMLInputElement)?.value || '0')
          if (currentStudents > maxStudents) {
            errors.currentStudents = 'Số học viên hiện tại không được vượt quá số học viên tối đa'
          } else {
            delete errors.currentStudents
          }
        }
        break
        
      case 'startDate':
        if (value) {
          const startDate = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          
          if (startDate < today) {
            errors.startDate = 'Ngày bắt đầu không được là ngày quá khứ'
          } else {
            delete errors.startDate
          }
        } else {
          delete errors.startDate
        }
        break
        
      case 'endDate':
        if (value) {
          const endDate = new Date(value)
          const startDate = new Date((document.querySelector('input[name="startDate"]') as HTMLInputElement)?.value || '')
          
          if (startDate && endDate <= startDate) {
            errors.endDate = 'Ngày kết thúc phải sau ngày bắt đầu'
          } else {
            delete errors.endDate
          }
        } else {
          delete errors.endDate
        }
        break
    }
    
    setFormErrors(errors)
  }

  // Check if form is valid
  const isFormValid = () => {
    return Object.keys(formErrors).length === 0 && 
           !isValidating &&
           (editing || (document.querySelector('input[name="code"]') as HTMLInputElement)?.value?.trim())
  }

  useEffect(() => {
    loadClasses()
    loadCenters()
  }, [statusFilter])

  // Filter classes
  const filtered = classes.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         c.centerName.toLowerCase().includes(searchTerm.toLowerCase())
    return matchesSearch
  })

  // Form handlers
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    try {
      if (editing) {
        // Update class
        const updateData: UpdateClassRequest = {
          name: formData.get('name') as string,
          description: formData.get('description') as string || undefined,
          maxStudents: parseInt(formData.get('maxStudents') as string) || 0,
          currentStudents: parseInt(formData.get('currentStudents') as string) || 0,
          startDate: formData.get('startDate') as string || undefined,
          endDate: formData.get('endDate') as string || undefined
        }
        
        const response = await classesApi.update(editing.classId, updateData)
        toast.success('Thành công', `Cập nhật lớp học "${response.data.name}" thành công!`)
      } else {
        // Create class
        const createData: CreateClassRequest = {
          code: formData.get('code') as string,
          name: formData.get('name') as string,
          description: formData.get('description') as string || undefined,
          centerId: parseInt(formData.get('centerId') as string),
          maxStudents: parseInt(formData.get('maxStudents') as string) || 0,
          currentStudents: parseInt(formData.get('currentStudents') as string) || 0,
          startDate: formData.get('startDate') as string || undefined,
          endDate: formData.get('endDate') as string || undefined
        }
        
        const response = await classesApi.create(createData)
        toast.success('Thành công', `Tạo lớp học "${response.data.name}" thành công!`)
      }
      
      setOpenModal(false)
      setEditing(null)
      setViewing(null)
      loadClasses()
    } catch (error: any) {
      console.error('Error saving class:', error)
      const message = error.response?.data?.message || error.message || 'Có lỗi xảy ra'
      toast.error('Lỗi', message)
    }
  }

  // Action handlers
  function openCreate() {
    setEditing(null)
    setViewing(null)
    setOpenModal(true)
    setFocusLecturers(false)
  }

  function openEdit(cls: Class) {
    setEditing(cls)
    setViewing(null)
    setOpenModal(true)
    setFocusLecturers(false)
  }

  function openAssignLecturers(cls: Class) {
    openEdit(cls)
    setFocusLecturers(true)
    // Scroll to lecturers section after modal renders
    setTimeout(() => {
      lecturersSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
  }

  function openViewDetails(cls: Class) {
    setViewing(cls)
    setEditing(null)
    setOpenModal(true)
  }

  const softDeleteClass = async (cls: Class) => {
    try {
      await classesApi.deactivate(cls.classId)
      toast.success('Thành công', 'Đã vô hiệu hóa lớp học')
      loadClasses()
    } catch (error: any) {
      console.error('Error deactivating class:', error)
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error('Lỗi', message)
    }
  }

  const restoreClass = async (cls: Class) => {
    try {
      await classesApi.activate(cls.classId)
      toast.success('Thành công', 'Đã kích hoạt lớp học')
      loadClasses()
    } catch (error: any) {
      console.error('Error activating class:', error)
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error('Lỗi', message)
    }
  }

  // Reload currently editing class from API (to refresh lecturers list)
  const reloadEditing = async () => {
    if (!editing) return
    try {
      const response = await classesApi.getById(editing.classId)
      if (response.data.success) {
        setEditing(response.data.data)
      }
    } catch (error) {
      // ignore, keep current editing state
    }
  }

  // Lecturer actions (only for edit mode)
  const handleAssignLecturer = async () => {
    if (!editing) return
    if (!newLecturerId && !newLecturerName) {
      toast.error('Lỗi', 'Nhập ít nhất ID hoặc Tên giảng viên')
      return
    }
    try {
      setLecturerSubmitting(true)
      await classesApi.assignLecturer(editing.classId, {
        lecturerId: typeof newLecturerId === 'number' ? newLecturerId : 0,
        lecturerName: newLecturerName,
        lecturerEmail: newLecturerEmail || undefined,
        role: newLecturerRole
      })
      toast.success('Thành công', 'Đã gán giảng viên vào lớp')
      // clear form
      setNewLecturerId('')
      setNewLecturerName('')
      setNewLecturerEmail('')
      setNewLecturerRole('MAIN')
      await reloadEditing()
      await loadClasses()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Không thể gán giảng viên'
      toast.error('Lỗi', message)
    } finally {
      setLecturerSubmitting(false)
    }
  }

  const handleRemoveLecturer = async (lecturerId: number) => {
    if (!editing) return
    try {
      setLecturerSubmitting(true)
      await classesApi.removeLecturer(editing.classId, lecturerId)
      toast.success('Thành công', 'Đã gỡ giảng viên khỏi lớp')
      await reloadEditing()
      await loadClasses()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Không thể gỡ giảng viên'
      toast.error('Lỗi', message)
    } finally {
      setLecturerSubmitting(false)
    }
  }

  const handleChangeLecturerRole = async (lecturerId: number, role: 'MAIN' | 'ASSISTANT' | 'COORDINATOR') => {
    if (!editing) return
    try {
      setLecturerSubmitting(true)
      await classesApi.updateLecturerRole(editing.classId, lecturerId, role)
      toast.success('Thành công', 'Đã cập nhật vai trò giảng viên')
      await reloadEditing()
      await loadClasses()
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || 'Không thể cập nhật vai trò'
      toast.error('Lỗi', message)
    } finally {
      setLecturerSubmitting(false)
    }
  }

  // Get status display
  const getStatusDisplay = (status: string) => {
    const statusMap = {
      'PLANNING': { text: 'Đang lên kế hoạch', color: 'bg-blue-50 text-blue-700' },
      'RECRUITING': { text: 'Đang tuyển sinh', color: 'bg-yellow-50 text-yellow-700' },
      'ONGOING': { text: 'Đang diễn ra', color: 'bg-green-50 text-green-700' },
      'COMPLETED': { text: 'Đã hoàn thành', color: 'bg-gray-50 text-gray-700' },
      'CANCELLED': { text: 'Đã hủy', color: 'bg-red-50 text-red-700' }
    }
    return statusMap[status as keyof typeof statusMap] || { text: status, color: 'bg-gray-50 text-gray-700' }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quản lý lớp học</h1>
          <p className="text-gray-600">Quản lý lớp học và phân công giảng viên</p>
        </div>
        {can('classes:create') && (
          <button
            onClick={openCreate}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Tạo lớp mới
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg border p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã lớp hoặc trung tâm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-200"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'all' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'active' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đang hoạt động
            </button>
            <button
              onClick={() => setStatusFilter('deleted')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                statusFilter === 'deleted' 
                  ? 'bg-blue-100 text-blue-700' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Đã xóa
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Lớp học</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trung tâm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Học viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Giảng viên</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                    <p className="mt-2">Đang tải...</p>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <Users className="h-12 w-12 mx-auto text-gray-300 mb-4" />
                    <p className="text-lg font-medium">Không có lớp học nào</p>
                    <p className="text-sm">Hãy tạo lớp học đầu tiên</p>
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const statusInfo = getStatusDisplay(c.status)
                  return (
                    <tr key={c.classId} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{c.name}</div>
                          <div className="text-sm text-gray-500">{c.code}</div>
                          {c.description && (
                            <div className="text-xs text-gray-400 max-w-xs truncate">
                              {c.description}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{c.centerName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div>{c.currentStudents || 0} / {c.maxStudents || 0}</div>
                          <div className="text-xs text-gray-500">học viên</div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">
                          <div className="flex items-center">
                            <Users className="h-4 w-4 mr-1" />
                            {c.lecturers?.length || 0} giảng viên
                          </div>
                          {c.lecturers && c.lecturers.length > 0 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {c.lecturers.slice(0, 2).map(l => l.lecturerName).join(', ')}
                              {c.lecturers.length > 2 && ` +${c.lecturers.length - 2}`}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${statusInfo.color}`}>
                          {statusInfo.text}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === c.classId ? null : c.classId)}
                            className="p-1 rounded hover:bg-gray-100"
                          >
                            <MoreHorizontal className="h-4 w-4" />
                          </button>
                          {openMenuId === c.classId && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                              {!c.deletedAt ? (
                                <>
                                  {can('classes:read') && (
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center" onClick={() => {
                                      setOpenMenuId(null)
                                      openViewDetails(c)
                                    }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Xem chi tiết
                                    </button>
                                  )}
                                  {can('classes:update') && (
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => {
                                      setOpenMenuId(null)
                                      openEdit(c)
                                    }}>
                                      <Edit className="h-4 w-4 mr-2" />
                                      Chỉnh sửa
                                    </button>
                                  )}
                                  {can('classes:update') && (
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => {
                                      setOpenMenuId(null)
                                      openAssignLecturers(c)
                                    }}>
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Phân công giảng viên
                                    </button>
                                  )}
                                  {can('classes:delete') && (
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600" onClick={() => {
                                      setOpenMenuId(null)
                                      if(confirm(`Vô hiệu hóa lớp học ${c.name}?`)){
                                        softDeleteClass(c)
                                      }
                                    }}>
                                      <Trash2 className="h-4 w-4 mr-2" />
                                      Vô hiệu hóa
                                    </button>
                                  )}
                                </>
                              ) : (
                                <>
                                  {can('classes:read') && (
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center" onClick={() => {
                                      setOpenMenuId(null)
                                      openViewDetails(c)
                                    }}>
                                      <Eye className="h-4 w-4 mr-2" />
                                      Xem chi tiết
                                    </button>
                                  )}
                                  {can('classes:delete') && (
                                    <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-green-600" onClick={() => {
                                      setOpenMenuId(null)
                                      if(confirm(`Kích hoạt lớp học ${c.name}?`)){
                                        restoreClass(c)
                                      }
                                    }}>
                                      <UserPlus className="h-4 w-4 mr-2" />
                                      Kích hoạt
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      <Modal open={openModal} onClose={() => {
        setOpenModal(false)
        setEditing(null)
        setViewing(null)
      }}>
        <div className="p-6 max-h-[90vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4">
            {viewing ? 'Chi tiết lớp học' : editing ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}
          </h2>
          {viewing ? (
            // View details mode
            <div className="space-y-6">
              {/* Basic info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tên lớp học</label>
                    <div className="text-sm text-gray-900">{viewing.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mã lớp</label>
                    <div className="text-sm text-gray-900">{viewing.code}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Trung tâm</label>
                    <div className="text-sm text-gray-900">{viewing.centerName}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Trạng thái</label>
                    <div className="text-sm text-gray-900">{getStatusDisplay(viewing.status).text}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả</label>
                    <div className="text-sm text-gray-900">{viewing.description || 'Chưa có mô tả'}</div>
                  </div>
                </div>
              </div>

              {/* Students info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin học viên</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Học viên hiện tại</label>
                    <div className="text-sm text-gray-900">{viewing.currentStudents || 0}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số chỗ tối đa</label>
                    <div className="text-sm text-gray-900">{viewing.maxStudents || 0}</div>
                  </div>
                </div>
              </div>

              {/* Time info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thời gian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày bắt đầu</label>
                    <div className="text-sm text-gray-900">
                      {viewing.startDate ? new Date(viewing.startDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày kết thúc</label>
                    <div className="text-sm text-gray-900">
                      {viewing.endDate ? new Date(viewing.endDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Lecturers management (only show in edit mode) */}
              {editing && (
                <div ref={lecturersSectionRef} className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Giảng viên</h3>

                  {/* Assign lecturer form */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảng viên (ID)</label>
                      <input
                        type="number"
                        value={newLecturerId}
                        onChange={(e) => setNewLecturerId(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="VD: 101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên giảng viên</label>
                      <input
                        value={newLecturerName}
                        onChange={(e) => setNewLecturerName(e.target.value)}
                        className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newLecturerEmail}
                        onChange={(e) => setNewLecturerEmail(e.target.value)}
                        className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="gv@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select
                          value={newLecturerRole}
                          onChange={(e) => setNewLecturerRole(e.target.value as 'MAIN' | 'ASSISTANT' | 'COORDINATOR')}
                          className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="MAIN">Chính</option>
                          <option value="ASSISTANT">Trợ giảng</option>
                          <option value="COORDINATOR">Điều phối</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAssignLecturer}
                        disabled={lecturerSubmitting}
                        className="h-9 mt-6 bg-indigo-600 text-white px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {lecturerSubmitting ? 'Đang gán...' : 'Gán giảng viên'}
                      </button>
                    </div>
                  </div>

                  {/* Lecturers list */}
                  <div className="space-y-2">
                    {(editing.lecturers && editing.lecturers.length > 0) ? (
                      editing.lecturers.map((lec) => (
                        <div key={lec.lecturerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lec.lecturerName}</div>
                            <div className="text-xs text-gray-500">{lec.roleDisplayName}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <select
                              value={lec.role}
                              onChange={(e) => handleChangeLecturerRole(lec.lecturerId, e.target.value as 'MAIN' | 'ASSISTANT' | 'COORDINATOR')}
                              disabled={lecturerSubmitting}
                              className="h-8 rounded-md border px-2 text-sm"
                            >
                              <option value="MAIN">Chính</option>
                              <option value="ASSISTANT">Trợ giảng</option>
                              <option value="COORDINATOR">Điều phối</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveLecturer(lec.lecturerId)}
                              disabled={lecturerSubmitting}
                              className="h-8 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                            >
                              Gỡ
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">Chưa có giảng viên nào</div>
                    )}
                  </div>
                </div>
              )}

              {/* Lecturers info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Giảng viên</h3>
                {viewing.lecturers && viewing.lecturers.length > 0 ? (
                  <div className="space-y-2">
                    {viewing.lecturers.map((lecturer, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{lecturer.lecturerName}</div>
                          <div className="text-xs text-gray-500">{lecturer.roleDisplayName}</div>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          lecturer.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {lecturer.isActive ? 'Hoạt động' : 'Không hoạt động'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">Chưa có giảng viên nào được gán</div>
                )}
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpenModal(false)
                    setViewing(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Đóng
                </button>
              </div>
            </div>
          ) : (
            // Create/Edit form
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Lecturers management priority (when focusing) */}
              {editing && focusLecturers && (
                <div ref={lecturersSectionRef} className="space-y-4 ring-2 ring-indigo-200 rounded-lg p-3">
                  <h3 className="text-sm font-medium text-gray-700">Giảng viên</h3>

                  {/* Assign lecturer form */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảng viên (ID)</label>
                      <input
                        type="number"
                        value={newLecturerId}
                        onChange={(e) => setNewLecturerId(e.target.value ? parseInt(e.target.value, 10) : '')}
                        className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="VD: 101"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Tên giảng viên</label>
                      <input
                        value={newLecturerName}
                        onChange={(e) => setNewLecturerName(e.target.value)}
                        className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="Nguyễn Văn A"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input
                        type="email"
                        value={newLecturerEmail}
                        onChange={(e) => setNewLecturerEmail(e.target.value)}
                        className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        placeholder="gv@example.com"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 items-end">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Vai trò</label>
                        <select
                          value={newLecturerRole}
                          onChange={(e) => setNewLecturerRole(e.target.value as 'MAIN' | 'ASSISTANT' | 'COORDINATOR')}
                          className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                        >
                          <option value="MAIN">Chính</option>
                          <option value="ASSISTANT">Trợ giảng</option>
                          <option value="COORDINATOR">Điều phối</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={handleAssignLecturer}
                        disabled={lecturerSubmitting}
                        className="h-9 mt-6 bg-indigo-600 text-white px-4 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {lecturerSubmitting ? 'Đang gán...' : 'Gán giảng viên'}
                      </button>
                    </div>
                  </div>

                  {/* Lecturers list */}
                  <div className="space-y-2">
                    {(editing.lecturers && editing.lecturers.length > 0) ? (
                      editing.lecturers.map((lec) => (
                        <div key={lec.lecturerId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{lec.lecturerName}</div>
                            <div className="text-xs text-gray-500">{lec.roleDisplayName}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <select
                              value={lec.role}
                              onChange={(e) => handleChangeLecturerRole(lec.lecturerId, e.target.value as 'MAIN' | 'ASSISTANT' | 'COORDINATOR')}
                              disabled={lecturerSubmitting}
                              className="h-8 rounded-md border px-2 text-sm"
                            >
                              <option value="MAIN">Chính</option>
                              <option value="ASSISTANT">Trợ giảng</option>
                              <option value="COORDINATOR">Điều phối</option>
                            </select>
                            <button
                              type="button"
                              onClick={() => handleRemoveLecturer(lec.lecturerId)}
                              disabled={lecturerSubmitting}
                              className="h-8 px-3 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 disabled:opacity-50"
                            >
                              Gỡ
                            </button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-sm text-gray-500">Chưa có giảng viên nào</div>
                    )}
                  </div>
                </div>
              )}
              {/* Basic info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tên lớp học *</label>
                    <input
                      name="name"
                      defaultValue={editing?.name}
                      required
                      onChange={(e) => validateField('name', e.target.value)}
                      className={`w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 ${
                        formErrors.name ? 'border-red-300 focus:ring-red-200' : ''
                      }`}
                      placeholder="Lớp Java cơ bản"
                    />
                    {formErrors.name && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.name}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã lớp *</label>
                    <input
                      name="code"
                      defaultValue={editing?.code}
                      required
                      disabled={!!editing}
                      onChange={(e) => validateField('code', e.target.value)}
                      className={`w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100 ${
                        formErrors.code ? 'border-red-300 focus:ring-red-200' : ''
                      }`}
                      placeholder="JAVA001"
                    />
                    {formErrors.code && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.code}</p>
                    )}
                    {isValidating && (
                      <p className="mt-1 text-xs text-blue-600">Đang kiểm tra...</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Trung tâm *</label>
                    <select
                      name="centerId"
                      defaultValue={editing?.centerId}
                      required
                      disabled={!!editing}
                      className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                    >
                      <option value="">Chọn trung tâm</option>
                      {centers.map(center => (
                        <option key={center.centerId} value={center.centerId}>
                          {center.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                    <textarea
                      name="description"
                      defaultValue={editing?.description}
                      rows={3}
                      className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                      placeholder="Mô tả về lớp học..."
                    />
                  </div>
                </div>
              </div>

              {/* Students info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin học viên</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Học viên hiện tại</label>
                    <input
                      name="currentStudents"
                      type="number"
                      defaultValue={editing?.currentStudents || 0}
                      onChange={(e) => validateField('currentStudents', e.target.value)}
                      className={`w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 ${
                        formErrors.currentStudents ? 'border-red-300 focus:ring-red-200' : ''
                      }`}
                      placeholder="0"
                    />
                    {formErrors.currentStudents && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.currentStudents}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ tối đa</label>
                    <input
                      name="maxStudents"
                      type="number"
                      defaultValue={editing?.maxStudents || 0}
                      onChange={(e) => validateField('maxStudents', e.target.value)}
                      className={`w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 ${
                        formErrors.maxStudents ? 'border-red-300 focus:ring-red-200' : ''
                      }`}
                      placeholder="0"
                    />
                    {formErrors.maxStudents && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.maxStudents}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Time info */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thời gian</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                    <input
                      type="date"
                      name="startDate"
                      defaultValue={editing?.startDate ? editing.startDate.split('T')[0] : ''}
                      onChange={(e) => validateField('startDate', e.target.value)}
                      className={`w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 ${
                        formErrors.startDate ? 'border-red-300 focus:ring-red-200' : ''
                      }`}
                    />
                    {formErrors.startDate && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.startDate}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày kết thúc</label>
                    <input
                      type="date"
                      name="endDate"
                      defaultValue={editing?.endDate ? editing.endDate.split('T')[0] : ''}
                      onChange={(e) => validateField('endDate', e.target.value)}
                      className={`w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 ${
                        formErrors.endDate ? 'border-red-300 focus:ring-red-200' : ''
                      }`}
                    />
                    {formErrors.endDate && (
                      <p className="mt-1 text-xs text-red-600">{formErrors.endDate}</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setOpenModal(false)
                    setEditing(null)
                    setViewing(null)
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  {editing ? 'Hủy' : 'Đóng'}
                </button>
                <button
                  type="submit"
                  disabled={!isFormValid()}
                  className={`px-4 py-2 text-sm font-medium rounded-md ${
                    isFormValid() 
                      ? 'text-white bg-blue-600 hover:bg-blue-700' 
                      : 'text-gray-400 bg-gray-200 cursor-not-allowed'
                  }`}
                >
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
              </div>
            </form>
          )}
        </div>
      </Modal>
    </div>
  )
}