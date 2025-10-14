import { useState, useEffect } from 'react'
import { X, Trash2 } from 'lucide-react'
import { getRoles } from '../../../shared/api/roles'
import { getCentersLite } from '../../../shared/api/centers'
import type { UserViewDto } from '../../../shared/types/userView'
import type { RoleDto } from '../../../shared/types/role'
import type { CenterLiteDto } from '../../../shared/types/centers'

interface AssignRoleModalProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  user: UserViewDto | null
}

interface ExistingAssignment {
  roleId: number
  roleName: string
  centerId: number | null
  centerName: string | null
  assignedAt?: string
  markedForRemoval: boolean // true = sẽ hủy, false = giữ nguyên
}

interface NewAssignment {
  id: string
  roleId: string
  centerId: number | null
}

export default function AssignRoleModal({ open, onClose, onSuccess, user }: AssignRoleModalProps) {
  const [roles, setRoles] = useState<RoleDto[]>([])
  const [centers, setCenters] = useState<CenterLiteDto[]>([])
  const [loading, setLoading] = useState(false)
  
  // Phần A: Vai trò hiện có
  const [existingAssignments, setExistingAssignments] = useState<ExistingAssignment[]>([])
  
  // Phần B: Vai trò mới
  const [newAssignments, setNewAssignments] = useState<NewAssignment[]>([])
  
  const [errors, setErrors] = useState<{ global?: string; newAssignments?: string[] }>({})

  // Load data khi modal mở
  useEffect(() => {
    if (!open || !user) return

    const loadData = async () => {
      setLoading(true)
      try {
        const [rolesRes, centersRes] = await Promise.all([getRoles(true), getCentersLite()])
        
        // Xử lý roles data structure
        let rolesData = []
        if (Array.isArray(rolesRes.data)) {
          rolesData = rolesRes.data
        } else if (rolesRes.data && typeof rolesRes.data === 'object') {
          const dataObj = rolesRes.data as any
          if (Array.isArray(dataObj.roles)) {
            rolesData = dataObj.roles
          } else if (Array.isArray(dataObj.data)) {
            rolesData = dataObj.data
          } else if (Array.isArray(dataObj.items)) {
            rolesData = dataObj.items
          }
        }

        setRoles(rolesData)
        setCenters(Array.isArray(centersRes.data) ? centersRes.data : [])

        // Khởi tạo existing assignments từ user
        if (user.assignments && user.assignments.length > 0) {
          const existing = user.assignments.map(a => {
            const role = rolesData.find((r: RoleDto) => r.roleId === a.roleId)
            const center = centersRes.data?.find((c: CenterLiteDto) => c.centerId === a.centerId)
            
            return {
              roleId: a.roleId,
              roleName: role?.name || a.roleName || 'Unknown Role',
              centerId: a.centerId,
              centerName: center?.name || null,
              assignedAt: a.assignedAt, // Lấy từ backend
              markedForRemoval: false
            }
          })
          setExistingAssignments(existing)
        } else {
          setExistingAssignments([])
        }

        // Reset new assignments
        setNewAssignments([])
        setErrors({})
      } catch (error) {
        console.error('[AssignRoleModal] Load data failed:', error)
        alert('Không thể tải danh sách vai trò/trung tâm')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [open, user])

  // Toggle trạng thái "Sẽ hủy" / "Hoàn tác"
  const toggleRemoval = (roleId: number) => {
    setExistingAssignments(prev => 
      prev.map(a => 
        a.roleId === roleId 
          ? { ...a, markedForRemoval: !a.markedForRemoval }
          : a
      )
    )
  }

  // Thêm hàng mới
  const addNewRow = () => {
    // Kiểm tra số lượng vai trò mới (chưa tính existing)
    if (newAssignments.length >= 3) {
      setErrors({ global: 'Chỉ được thêm tối đa 3 vai trò mới' })
      return
    }
    
    setNewAssignments([...newAssignments, { 
      id: String(Date.now()), 
      roleId: '', 
      centerId: null 
    }])
    setErrors({})
  }

  // Xóa hàng mới
  const removeNewRow = (id: string) => {
    setNewAssignments(newAssignments.filter(a => a.id !== id))
    setErrors({})
  }

  // Cập nhật hàng mới
  const updateNewAssignment = (id: string, field: 'roleId' | 'centerId', value: string | number | null) => {
    setNewAssignments(newAssignments.map(a => {
      if (a.id !== id) return a
      
      if (field === 'roleId') {
        const selectedRole = roles.find(r => String(r.roleId) === value)
        const isGlobal = selectedRole && (selectedRole.code === 'SA' || selectedRole.code === 'QLT')
        
        return {
          ...a,
          roleId: value as string,
          centerId: isGlobal ? null : a.centerId
        }
      }
      
      if (field === 'centerId') {
        return { ...a, centerId: value as number | null }
      }
      
      return a
    }))
    setErrors({})
  }

  // Validation
  const validate = () => {
    const newErrors: { global?: string; newAssignments?: string[] } = { newAssignments: [] }
    
    // Kiểm tra từng new assignment
    newAssignments.forEach((a, idx) => {
      if (!a.roleId) {
        newErrors.newAssignments![idx] = 'Vui lòng chọn vai trò'
      } else {
        const role = roles.find(r => String(r.roleId) === a.roleId)
        const isGlobal = role && (role.code === 'SA' || role.code === 'QLT')
        
        if (!isGlobal && !a.centerId) {
          newErrors.newAssignments![idx] = 'Vui lòng chọn trung tâm'
        }
      }
    })

    // Kiểm tra GLOBAL chỉ được 1
    const existingGlobalCount = existingAssignments.filter(a => {
      if (a.markedForRemoval) return false
      const role = roles.find(r => r.roleId === a.roleId)
      return role && (role.code === 'SA' || role.code === 'QLT')
    }).length

    const newGlobalCount = newAssignments.filter(a => {
      const role = roles.find(r => String(r.roleId) === a.roleId)
      return role && (role.code === 'SA' || role.code === 'QLT')
    }).length

    const totalGlobal = existingGlobalCount + newGlobalCount
    if (totalGlobal > 1) {
      newErrors.global = 'SA/Quản lý đào tạo chỉ được gán 1 vai trò GLOBAL'
    }

    // Kiểm tra CENTER tối đa 3
    const existingCenterCount = existingAssignments.filter(a => {
      if (a.markedForRemoval) return false
      const role = roles.find(r => r.roleId === a.roleId)
      return role && role.code !== 'SA' && role.code !== 'QLT'
    }).length

    const newCenterCount = newAssignments.filter(a => {
      const role = roles.find(r => String(r.roleId) === a.roleId)
      return role && role.code !== 'SA' && role.code !== 'QLT'
    }).length

    const totalCenter = existingCenterCount + newCenterCount
    if (totalCenter > 3) {
      newErrors.global = 'Vai trò CENTER tối đa 3'
    }

    // Kiểm tra duplicate (roleId + centerId)
    const allAssignments = [
      ...existingAssignments
        .filter(a => !a.markedForRemoval)
        .map(a => ({ roleId: String(a.roleId), centerId: a.centerId })),
      ...newAssignments.map(a => ({ roleId: a.roleId, centerId: a.centerId }))
    ]

    const seen = new Set<string>()
    allAssignments.forEach((a, idx) => {
      const key = `${a.roleId}-${a.centerId}`
      if (seen.has(key)) {
        if (idx >= existingAssignments.filter(e => !e.markedForRemoval).length) {
          const newIdx = idx - existingAssignments.filter(e => !e.markedForRemoval).length
          newErrors.newAssignments![newIdx] = 'Vai trò + Trung tâm đã tồn tại'
        }
      }
      seen.add(key)
    })

    setErrors(newErrors)
    return !newErrors.global && (!newErrors.newAssignments || newErrors.newAssignments.filter(Boolean).length === 0)
  }

  // Kiểm tra có thay đổi không
  const hasChanges = () => {
    const hasRemovals = existingAssignments.some(a => a.markedForRemoval)
    const hasNewAssignments = newAssignments.length > 0 && newAssignments.every(a => a.roleId)
    return hasRemovals || hasNewAssignments
  }

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasChanges()) {
      alert('Không có thay đổi nào')
      return
    }

    if (!validate()) return

    try {
      // Chuẩn bị data để gửi lên BE
      const removals = existingAssignments
        .filter(a => a.markedForRemoval)
        .map(a => ({ roleId: a.roleId, centerId: a.centerId }))

      const additions = newAssignments
        .filter(a => a.roleId)
        .map(a => ({ roleId: Number(a.roleId), centerId: a.centerId }))

      console.log('[AssignRoleModal] Submit:', {
        userId: user?.userId,
        removals,
        additions
      })

      // TODO: Gọi API cập nhật
      // await updateUserRoleAssignments(user.userId, { removals, additions })
      
      alert('Cập nhật vai trò thành công!')
      onSuccess()
      onClose()
    } catch (error) {
      console.error('[AssignRoleModal] Submit failed:', error)
      setErrors({ global: 'Có lỗi xảy ra khi cập nhật vai trò' })
    }
  }

  if (!open || !user) return null

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-4xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
          <form onSubmit={handleSubmit}>
            {/* Header */}
            <div className="px-6 py-4 border-b">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold">Cập nhật vai trò cho {user.fullName}</h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-sm text-gray-500">{user.email || 'Chưa có email'}</span>
                    {user.active !== undefined && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        user.active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {user.active ? 'Đang hoạt động' : 'Đã vô hiệu'}
                      </span>
                    )}
                  </div>
                </div>
                <button type="button" className="text-gray-400 hover:text-gray-600" onClick={onClose}>
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
                </div>
              ) : (
                <>
                  {/* Error global */}
                  {errors.global && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                      {errors.global}
                    </div>
                  )}

                  {/* (A) Danh sách vai trò hiện có */}
                  {existingAssignments.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3">Vai trò hiện có</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50 border-b">
                            <tr>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Vai trò</th>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Trung tâm</th>
                              <th className="text-left px-4 py-2 font-medium text-gray-600">Được cấp lúc</th>
                              <th className="text-right px-4 py-2 font-medium text-gray-600">Hành động</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y">
                            {existingAssignments.map((assignment, idx) => {
                              const role = roles.find(r => r.roleId === assignment.roleId)
                              const isGlobal = role && (role.code === 'SA' || role.code === 'QLT')
                              
                              return (
                                <tr 
                                  key={idx}
                                  className={assignment.markedForRemoval ? 'bg-gray-50' : ''}
                                >
                                  <td className={`px-4 py-3 ${assignment.markedForRemoval ? 'line-through text-gray-400' : ''}`}>
                                    <div className="flex items-center gap-2">
                                      {assignment.roleName}
                                      {assignment.markedForRemoval && (
                                        <span className="text-xs px-2 py-0.5 bg-red-100 text-red-600 rounded-full">
                                          Sẽ hủy
                                        </span>
                                      )}
                                    </div>
                                  </td>
                                  <td className={`px-4 py-3 ${assignment.markedForRemoval ? 'line-through text-gray-400' : ''}`}>
                                    {isGlobal || assignment.centerId === null
                                      ? <span className="text-blue-600">Tất cả trung tâm</span>
                                      : (assignment.centerName || `Center ID: ${assignment.centerId}`)
                                    }
                                  </td>
                                  <td className={`px-4 py-3 text-gray-500 ${assignment.markedForRemoval ? 'line-through text-gray-400' : ''}`}>
                                    {assignment.assignedAt 
                                      ? new Date(assignment.assignedAt).toLocaleDateString('vi-VN')
                                      : '—'
                                    }
                                  </td>
                                  <td className="px-4 py-3 text-right">
                                    <button
                                      type="button"
                                      onClick={() => toggleRemoval(assignment.roleId)}
                                      className={`text-xs px-3 py-1 rounded ${
                                        assignment.markedForRemoval
                                          ? 'bg-blue-50 text-blue-600 hover:bg-blue-100'
                                          : 'bg-red-50 text-red-600 hover:bg-red-100'
                                      }`}
                                    >
                                      {assignment.markedForRemoval ? 'Hoàn tác' : 'Hủy gán'}
                                    </button>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* (B) Thêm vai trò mới */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-sm font-medium">Thêm vai trò mới</h3>
                      <button
                        type="button"
                        onClick={addNewRow}
                        disabled={newAssignments.length >= 3}
                        className="text-sm text-blue-600 hover:text-blue-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                      >
                        + Thêm vai trò
                      </button>
                    </div>

                    {newAssignments.length === 0 ? (
                      <div className="border-2 border-dashed rounded-lg p-6 text-center text-gray-400 text-sm">
                        Nhấn "+ Thêm vai trò" để gán vai trò mới
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {newAssignments.map((assignment, idx) => {
                          const selectedRole = roles.find(r => String(r.roleId) === assignment.roleId)
                          const isGlobal = selectedRole && (selectedRole.code === 'SA' || selectedRole.code === 'QLT')

                          return (
                            <div key={assignment.id} className="border rounded-lg p-4">
                              <div className="flex gap-3 items-start">
                                {/* Role select */}
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 mb-1">Vai trò *</label>
                                  <select
                                    value={assignment.roleId}
                                    onChange={(e) => updateNewAssignment(assignment.id, 'roleId', e.target.value)}
                                    className={`w-full h-10 rounded-lg border px-3 text-sm ${
                                      errors.newAssignments?.[idx] ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                  >
                                    <option value="">-- Chọn vai trò --</option>
                                    <optgroup label="GLOBAL">
                                      {roles.filter(r => r.code === 'SA' || r.code === 'QLT').map(role => (
                                        <option key={role.roleId} value={role.roleId}>
                                          {role.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                    <optgroup label="CENTER">
                                      {roles.filter(r => r.code !== 'SA' && r.code !== 'QLT').map(role => (
                                        <option key={role.roleId} value={role.roleId}>
                                          {role.name}
                                        </option>
                                      ))}
                                    </optgroup>
                                  </select>
                                </div>

                                {/* Center select */}
                                <div className="flex-1">
                                  <label className="block text-xs text-gray-600 mb-1">Trung tâm {!isGlobal && '*'}</label>
                                  <select
                                    value={assignment.centerId === null ? '' : assignment.centerId}
                                    onChange={(e) => updateNewAssignment(assignment.id, 'centerId', e.target.value ? Number(e.target.value) : null)}
                                    disabled={isGlobal}
                                    className={`w-full h-10 rounded-lg border px-3 text-sm ${
                                      isGlobal ? 'bg-gray-100 cursor-not-allowed text-blue-600' : ''
                                    } ${errors.newAssignments?.[idx] ? 'border-red-500' : 'border-gray-300'}`}
                                  >
                                    <option value="">
                                      {isGlobal ? 'Tất cả trung tâm' : '-- Chọn trung tâm --'}
                                    </option>
                                    {!isGlobal && centers.map(center => (
                                      <option key={center.centerId} value={center.centerId}>
                                        {center.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Remove button */}
                                <div>
                                  <label className="block text-xs text-transparent mb-1">-</label>
                                  <button
                                    type="button"
                                    onClick={() => removeNewRow(assignment.id)}
                                    className="h-10 w-10 rounded-lg border border-gray-300 hover:bg-red-50 hover:border-red-300 hover:text-red-600 flex items-center justify-center"
                                    title="Xóa"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Error message */}
                              {errors.newAssignments?.[idx] && (
                                <div className="mt-2 text-xs text-red-600">
                                  {errors.newAssignments[idx]}
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t flex items-center justify-between">
              <div className="text-xs text-gray-500">
                GLOBAL chỉ được 1. CENTER tối đa 3.
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={loading || !hasChanges()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cập nhật vai trò
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
