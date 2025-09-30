import React, { useMemo, useState, useEffect } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
<<<<<<< Updated upstream
import { Building2, Eye, MoreHorizontal, Users2 } from 'lucide-react'
=======
import { Building2, Eye, MoreHorizontal, Users2, Search, Calendar, FileText } from 'lucide-react'
>>>>>>> Stashed changes
import { Center, centersApi } from '../services/centers.api'

type CenterUI = Center & {
  address?: string
  phone?: string
  students?: number
  studentsCapacity?: number
  teachers?: number
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function CentersPage() {
  const toast = useToast()
  const { can } = usePermission()
  const [centers, setCenters] = useState<CenterUI[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
<<<<<<< Updated upstream
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<CenterUI | null>(null)
=======
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'deleted'>('all')
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<CenterUI | null>(null)
  const [viewing, setViewing] = useState<CenterUI | null>(null)
>>>>>>> Stashed changes
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)

  // Load centers from API
  useEffect(() => {
    loadCenters()
  }, [statusFilter])

  const loadCenters = async () => {
    try {
      setLoading(true)
      let response
      
      // Tạm thời dùng test endpoint để bypass authentication
      try {
        response = await centersApi.getTest()
      } catch (error) {
        console.log('Test endpoint failed, trying authenticated endpoint...')
        if (can('centers:admin')) {
          // Super Admin có thể xem tất cả centers
          if (statusFilter === 'active') {
<<<<<<< Updated upstream
            response = await centersApi.getAll(true)
          } else if (statusFilter === 'inactive') {
            response = await centersApi.getAll(false)
          } else {
            response = await centersApi.getAll()
=======
            response = await centersApi.getAll(false) // isDeleted = false
          } else if (statusFilter === 'deleted') {
            response = await centersApi.getAll(true) // isDeleted = true
          } else {
            response = await centersApi.getAll() // Tất cả
>>>>>>> Stashed changes
          }
        } else {
          // User thường chỉ xem centers active
          response = await centersApi.getAllActive()
        }
      }

<<<<<<< Updated upstream
      // Filter theo trạng thái nếu cần
      if (statusFilter === 'active') {
        response.data = response.data.filter((center: any) => center.isActive)
      } else if (statusFilter === 'inactive') {
        response.data = response.data.filter((center: any) => !center.isActive)
=======
      // Filter theo trạng thái nếu cần (moved from backend to frontend for test endpoint)
      if (statusFilter === 'active') {
        response.data = response.data.filter((center: any) => !center.deletedAt)
      } else if (statusFilter === 'deleted') {
        response.data = response.data.filter((center: any) => center.deletedAt)
>>>>>>> Stashed changes
      }

      const centersWithUI: CenterUI[] = response.data.map(center => ({
        ...center,
        // Mock data cho các field UI (có thể lấy từ API khác)
<<<<<<< Updated upstream
        address: 'Địa chỉ trung tâm',
        phone: '024-1234-5678',
        students: Math.floor(Math.random() * 500) + 100,
        studentsCapacity: 500,
        teachers: Math.floor(Math.random() * 30) + 10
=======
        address: center.addressLine || 'Địa chỉ trung tâm',
        phone: center.phone || '024-1234-5678',
        students: center.currentStudents || Math.floor(Math.random() * 500) + 100,
        studentsCapacity: center.maxStudents || 500,
        teachers: center.lecturerCount || Math.floor(Math.random() * 30) + 10
>>>>>>> Stashed changes
      }))
      
      setCenters(centersWithUI)
    } catch (error) {
      console.error('Error loading centers:', error)
      toast.error('Lỗi', 'Không thể tải danh sách trung tâm')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(
    () => centers.filter((c) => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.code.toLowerCase().includes(query.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(query.toLowerCase()))
    ),
    [centers, query]
  )

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    
    const data = {
      name: String(form.get('name') || ''),
      code: String(form.get('code') || ''),
<<<<<<< Updated upstream
    }

    try {
      if (editing) {
        // Update center
        await centersApi.update(editing.centerId, data)
        toast.success('Thành công', 'Đã cập nhật trung tâm')
      } else {
        // Create center - dùng test endpoint
        try {
          await centersApi.createTest(data)
          toast.success('Thành công', 'Đã tạo trung tâm mới')
        } catch (error) {
          console.log('Test create failed, trying authenticated endpoint...')
          await centersApi.create(data)
          toast.success('Thành công', 'Đã tạo trung tâm mới')
        }
      }
      
      setOpenModal(false)
      setEditing(null)
      loadCenters() // Reload data
    } catch (error: any) {
      console.error('Error saving center:', error)
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error('Lỗi', message)
    }
=======
      description: String(form.get('description') || ''),
      establishedDate: String(form.get('establishedDate') || '') || undefined,
      
      // Thông tin địa chỉ
      addressLine: String(form.get('addressLine') || ''),
      province: String(form.get('province') || ''),
      district: String(form.get('district') || ''),
      ward: String(form.get('ward') || ''),
      
      // Thông tin liên hệ
      phone: String(form.get('phone') || '') || undefined,
      email: String(form.get('email') || '') || undefined,
      website: String(form.get('website') || '') || undefined,
      
      // Thông tin thống kê
      currentStudents: Number(form.get('currentStudents') || 0),
      maxStudents: Number(form.get('maxStudents') || 0),
      lecturerCount: Number(form.get('lecturerCount') || 0),
      courseCount: Number(form.get('courseCount') || 0),
      
      // Thông tin quản lý
      managerId: String(form.get('managerId') || '') || undefined,
      managerName: String(form.get('managerName') || '') || undefined,
    }

    try {
      if (editing) {
        // Update center
        await centersApi.update(editing.centerId, data)
        toast.success('Thành công', 'Đã cập nhật trung tâm')
      } else {
        // Create center - dùng test endpoint
        try {
          await centersApi.createTest(data)
          toast.success('Thành công', 'Đã tạo trung tâm mới')
        } catch (error) {
          console.log('Test create failed, trying authenticated endpoint...')
          await centersApi.create(data)
          toast.success('Thành công', 'Đã tạo trung tâm mới')
        }
      }
      
      setOpenModal(false)
      setEditing(null)
      loadCenters() // Reload data
    } catch (error: any) {
      console.error('Error saving center:', error)
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error('Lỗi', message)
    }
>>>>>>> Stashed changes
  }

  function openCreate() {
    setEditing(null)
    setViewing(null)
    setOpenModal(true)
  }

  function openEdit(center: CenterUI) {
    setEditing(center)
    setViewing(null)
    setOpenModal(true)
  }

<<<<<<< Updated upstream
  const toggleDisable = async (center: CenterUI) => {
    try {
      if (center.isActive) {
        await centersApi.deactivate(center.centerId)
        toast.success('Thành công', 'Đã vô hiệu hóa trung tâm')
      } else {
        await centersApi.activate(center.centerId)
        toast.success('Thành công', 'Đã kích hoạt trung tâm')
      }
      loadCenters() // Reload data
    } catch (error: any) {
      console.error('Error toggling center status:', error)
=======
  function openViewDetails(center: CenterUI) {
    setViewing(center)
    setEditing(null)
    setOpenModal(true)
  }

  const softDeleteCenter = async (center: CenterUI) => {
    try {
      await centersApi.deactivate(center.centerId)
      toast.success('Thành công', 'Đã vô hiệu hóa trung tâm')
      loadCenters() // Reload data
    } catch (error: any) {
      console.error('Error deactivating center:', error)
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error('Lỗi', message)
    }
  }

  const restoreCenter = async (center: CenterUI) => {
    try {
      await centersApi.activate(center.centerId)
      toast.success('Thành công', 'Đã kích hoạt trung tâm')
      loadCenters() // Reload data
    } catch (error: any) {
      console.error('Error activating center:', error)
>>>>>>> Stashed changes
      const message = error.response?.data?.message || 'Có lỗi xảy ra'
      toast.error('Lỗi', message)
    }
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Quản lý Trung tâm</h1>
        <p className="text-gray-600">Quản lý thông tin các trung tâm trong hệ thống</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-blue-600" />
            <div className="ml-3">
              <div className="text-sm text-gray-500">Tổng trung tâm</div>
              <div className="mt-3 text-2xl font-semibold">{centers.length}</div>
            </div>
          </div>
        </div>
<<<<<<< Updated upstream
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2"><Eye size={16}/> Đang hoạt động</div>
          <div className="mt-3 text-2xl font-semibold">{centers.filter(c=>c.isActive).length}</div>
          <div className="text-xs text-gray-500 mt-1">Trung tâm hoạt động</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2"><Users2 size={16}/> Tổng Học viên</div>
          <div className="mt-3 text-2xl font-semibold">{centers.reduce((s,c)=>s+(c.students||0),0)}</div>
          <div className="text-xs text-emerald-600 mt-1">+45 tuần này</div>
=======
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-green-600" />
            <div className="ml-3">
              <div className="text-sm text-gray-500">Đang hoạt động</div>
              <div className="mt-3 text-2xl font-semibold">{centers.filter(c => !c.deletedAt).length}</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Users2 className="h-8 w-8 text-purple-600" />
            <div className="ml-3">
              <div className="text-sm text-gray-500">Tổng học viên</div>
              <div className="mt-3 text-2xl font-semibold">{centers.reduce((s,c)=>s+(c.students||0),0)}</div>
            </div>
          </div>
>>>>>>> Stashed changes
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center">
            <Building2 className="h-8 w-8 text-red-600" />
            <div className="ml-3">
              <div className="text-sm text-gray-500">Đã xóa</div>
              <div className="mt-3 text-2xl font-semibold">{centers.filter(c => c.deletedAt).length}</div>
            </div>
          </div>
        </div>
      </div>

<<<<<<< Updated upstream
      <div className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            className="h-9 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="Tìm theo tên hoặc mã trung tâm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select 
            className="h-9 rounded-md border px-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'inactive')}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Không hoạt động</option>
=======
      {/* Filters and Actions */}
      <div className="bg-white p-4 rounded-lg border mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, mã hoặc mô tả..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Status Filter */}
          <select 
            className="h-9 rounded-md border px-2 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'deleted')}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="deleted">Đã xóa</option>
>>>>>>> Stashed changes
          </select>

          {/* Create Button */}
          {can('centers:create') && (
            <button
              onClick={openCreate}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500"
            >
              Tạo trung tâm mới
            </button>
          )}
        </div>
      </div>

<<<<<<< Updated upstream
        <div className="divide-y">
          {loading ? (
            <div className="px-4 py-8 text-center text-gray-500">Đang tải...</div>
          ) : filtered.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">Không có dữ liệu</div>
          ) : (
            filtered.map((c) => (
              <div key={c.centerId} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
                <div className="col-span-12 md:col-span-4">
                  <div className="text-sm font-medium">{c.name} <span className="text-xs text-gray-500 font-normal">• Mã: {c.code}</span></div>
                  <div className="text-xs text-gray-500">Tạo: {new Date(c.createdAt).toLocaleDateString('vi-VN')}</div>
                </div>
                <div className="col-span-12 md:col-span-3 text-sm">{c.address || 'Chưa có địa chỉ'}</div>
                <div className="col-span-12 md:col-span-2 text-sm">
                  <div>{c.phone || 'Chưa có SĐT'}</div>
                  <div className="text-xs text-gray-500">{c.code.toLowerCase()}@education.vn</div>
                </div>
                <div className="col-span-6 md:col-span-1">
                  <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${c.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                    {c.isActive ? 'Hoạt động' : 'Không hoạt động'}
                  </span>
                </div>
                <div className="col-span-3 md:col-span-1">
                  <div className="inline-flex items-center gap-1 text-sm"><Users2 size={14}/> {c.students || 0} <span className="text-xs text-gray-500">/{c.studentsCapacity || 0}</span></div>
                </div>
                <div className="col-span-3 md:col-span-1 text-right relative">
                  <div className="text-sm">{c.teachers || 0}</div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="relative">
                    <button className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center" onClick={()=> setOpenMenuId(p=>p===c.centerId?null:c.centerId)}>
                      <MoreHorizontal size={16}/>
                    </button>
                    {openMenuId===c.centerId && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={()=>setOpenMenuId(null)}/>
                        <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-white shadow-lg z-20">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">Xem chi tiết</button>
                          {can('centers:update') && (
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{ setOpenMenuId(null); openEdit(c) }}>Chỉnh sửa</button>
                          )}
                          {can('centers:disable') && (
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{
                              setOpenMenuId(null)
                              const action = c.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'
                              if(confirm(`${action} ${c.name}?`)){
                                toggleDisable(c)
                              }
                            }}>
                              {c.isActive ? 'Vô hiệu hóa' : 'Kích hoạt'}
                            </button>
                          )}
=======
      {/* Table */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trung tâm</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Địa chỉ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Liên hệ</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Thống kê</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Hành động</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Đang tải...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Không có trung tâm nào
                  </td>
                </tr>
              ) : (
                filtered.map((c) => (
                  <tr key={c.centerId} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{c.name}</div>
                        <div className="text-sm text-gray-500">{c.code}</div>
                        <div className="text-xs text-gray-400 max-w-xs truncate">
                          {c.description || 'Chưa có mô tả'}
>>>>>>> Stashed changes
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div className="max-w-xs truncate">{c.addressLine || 'Chưa có địa chỉ'}</div>
                        <div className="text-xs text-gray-500">
                          {c.ward && c.district && c.province 
                            ? `${c.ward}, ${c.district}, ${c.province}`
                            : 'Chưa có thông tin'
                          }
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{c.phone || 'Chưa có SĐT'}</div>
                        <div className="text-xs text-gray-500">{c.email || 'Chưa có email'}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        <div>{c.currentStudents || 0} học viên</div>
                        <div className="text-xs text-gray-500">
                          {c.lecturerCount || 0} GV • {c.courseCount || 0} khóa
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${
                        c.deletedAt 
                          ? 'bg-red-50 text-red-700' 
                          : 'bg-green-50 text-green-700'
                      }`}>
                        {c.deletedAt ? 'Đã xóa' : 'Hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenuId(openMenuId === c.centerId ? null : c.centerId)}
                          className="p-1 rounded hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </button>
                        {openMenuId === c.centerId && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            {!c.deletedAt ? (
                              <>
                                {can('centers:read') && (
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center" onClick={() => {
                                    setOpenMenuId(null)
                                    openViewDetails(c)
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem chi tiết
                                  </button>
                                )}
                                {can('centers:update') && (
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => {
                                    setOpenMenuId(null)
                                    openEdit(c)
                                  }}>
                                    Chỉnh sửa
                                  </button>
                                )}
                                {can('centers:delete') && (
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-red-600" onClick={() => {
                                    setOpenMenuId(null)
                                    if(confirm(`Vô hiệu hóa trung tâm ${c.name}?`)){
                                      softDeleteCenter(c)
                                    }
                                  }}>
                                    Vô hiệu hóa
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {can('centers:read') && (
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center" onClick={() => {
                                    setOpenMenuId(null)
                                    openViewDetails(c)
                                  }}>
                                    <Eye className="h-4 w-4 mr-2" />
                                    Xem chi tiết
                                  </button>
                                )}
                                {can('centers:delete') && (
                                  <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-green-600" onClick={() => {
                                    setOpenMenuId(null)
                                    if(confirm(`Kích hoạt trung tâm ${c.name}?`)){
                                      restoreCenter(c)
                                    }
                                  }}>
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
                ))
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
            {viewing ? 'Chi tiết trung tâm' : editing ? 'Chỉnh sửa trung tâm' : 'Tạo trung tâm mới'}
          </h2>
          {viewing ? (
            <div className="space-y-6">
              {/* Thông tin cơ bản */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin cơ bản</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tên trung tâm</label>
                    <div className="text-sm text-gray-900">{viewing.name}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mã</label>
                    <div className="text-sm text-gray-900">{viewing.code}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Ngày thành lập</label>
                    <div className="text-sm text-gray-900">
                      {viewing.establishedDate ? new Date(viewing.establishedDate).toLocaleDateString('vi-VN') : 'Chưa xác định'}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Mô tả</label>
                    <div className="text-sm text-gray-900">{viewing.description || 'Chưa có mô tả'}</div>
                  </div>
                </div>
              </div>

              {/* Địa chỉ */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Địa chỉ</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Địa chỉ</label>
                    <div className="text-sm text-gray-900">{viewing.addressLine || 'Chưa có địa chỉ'}</div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Tỉnh/Thành phố</label>
                      <div className="text-sm text-gray-900">{viewing.province || 'Chưa có thông tin'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Quận/Huyện</label>
                      <div className="text-sm text-gray-900">{viewing.district || 'Chưa có thông tin'}</div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-500 mb-1">Phường/Xã</label>
                      <div className="text-sm text-gray-900">{viewing.ward || 'Chưa có thông tin'}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Thông tin liên hệ */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin liên hệ</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số điện thoại</label>
                    <div className="text-sm text-gray-900">{viewing.phone || 'Chưa có SĐT'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Email</label>
                    <div className="text-sm text-gray-900">{viewing.email || 'Chưa có email'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Website</label>
                    <div className="text-sm text-gray-900">{viewing.website || 'Chưa có website'}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin thống kê */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin thống kê</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Học viên hiện tại</label>
                    <div className="text-sm text-gray-900">{viewing.currentStudents || 0}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số chỗ học viên</label>
                    <div className="text-sm text-gray-900">{viewing.maxStudents || 0}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số giảng viên</label>
                    <div className="text-sm text-gray-900">{viewing.lecturerCount || 0}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Số khóa học</label>
                    <div className="text-sm text-gray-900">{viewing.courseCount || 0}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin quản lý */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin quản lý</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">ID Quản lý</label>
                    <div className="text-sm text-gray-900">{viewing.managerId || 'Chưa có thông tin'}</div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Tên Quản lý</label>
                    <div className="text-sm text-gray-900">{viewing.managerName || 'Chưa có thông tin'}</div>
                  </div>
                </div>
              </div>

              {/* Thông tin hệ thống */}
              <div className="space-y-4">
                <h3 className="text-sm font-medium text-gray-700">Thông tin hệ thống</h3>
                <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                  <div>Ngày tạo: {new Date(viewing.createdAt).toLocaleDateString('vi-VN')}</div>
                  <div>Cập nhật lần cuối: {new Date(viewing.updatedAt).toLocaleDateString('vi-VN')}</div>
                  <div>Trạng thái: <span className={viewing.deletedAt ? 'text-red-600' : 'text-green-600'}>
                    {viewing.deletedAt ? 'Đã xóa' : 'Hoạt động'}
                  </span></div>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
            {/* Thông tin cơ bản */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Thông tin cơ bản</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên trung tâm *</label>
                  <input
                    name="name"
                    defaultValue={editing?.name}
                    required
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="Trung tâm Hà Nội 1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mã *</label>
                  <input
                    name="code"
                    defaultValue={editing?.code}
                    required
                    disabled={!!editing} // Không cho sửa mã khi edit
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200 disabled:bg-gray-100"
                    placeholder="HN1"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thành lập</label>
                  <input
                    type="date"
                    name="establishedDate"
                    defaultValue={editing?.establishedDate ? editing.establishedDate.split('T')[0] : ''}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea
                    name="description"
                    defaultValue={editing?.description}
                    rows={3}
                    className="w-full rounded-md border px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="Mô tả về trung tâm..."
                  />
                </div>
              </div>
            </div>

            {/* Địa chỉ */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Địa chỉ</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ *</label>
                  <input
                    name="addressLine"
                    defaultValue={editing?.addressLine}
                    required
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="123 Đường ABC, Phường XYZ, Quận QWE"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
                    <input
                      name="province"
                      defaultValue={editing?.province}
                      required
                      className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                      placeholder="Hà Nội"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Quận/Huyện *</label>
                    <input
                      name="district"
                      defaultValue={editing?.district}
                      required
                      className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                      placeholder="Hai Bà Trưng"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phường/Xã *</label>
                    <input
                      name="ward"
                      defaultValue={editing?.ward}
                      required
                      className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                      placeholder="Bùi Thị Xuân"
                    />
                  </div>
                </div>
              </div>
            </div>
<<<<<<< Updated upstream
            ))
          )}
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={handleSubmit}>
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-medium">{editing ? 'Sửa Trung tâm' : 'Tạo Trung tâm mới'}</div>
            <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => setOpenModal(false)}>×</button>
          </div>
          <div className="p-4 space-y-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tên Trung tâm *</label>
              <input 
                name="name" 
                defaultValue={editing?.name} 
                required 
                className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200" 
                placeholder="Trung tâm Hà Nội 1" 
              />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Mã Trung tâm *</label>
              <input 
                name="code" 
                defaultValue={editing?.code} 
                required 
                className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200" 
                placeholder="HN01" 
              />
=======

            {/* Thông tin liên hệ */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Thông tin liên hệ</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                  <input
                    name="phone"
                    defaultValue={editing?.phone}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="024-1234-5678"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input
                    name="email"
                    type="email"
                    defaultValue={editing?.email}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="center@education.vn"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  <input
                    name="website"
                    defaultValue={editing?.website}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="https://center.edu"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin thống kê */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Thông tin thống kê</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Học viên hiện tại</label>
                  <input
                    name="currentStudents"
                    type="number"
                    defaultValue={editing?.currentStudents || 0}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số chỗ học viên</label>
                  <input
                    name="maxStudents"
                    type="number"
                    defaultValue={editing?.maxStudents || 0}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số giảng viên</label>
                  <input
                    name="lecturerCount"
                    type="number"
                    defaultValue={editing?.lecturerCount || 0}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Số khóa học</label>
                  <input
                    name="courseCount"
                    type="number"
                    defaultValue={editing?.courseCount || 0}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Thông tin quản lý */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-700">Thông tin quản lý</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID Quản lý</label>
                  <input
                    name="managerId"
                    defaultValue={editing?.managerId}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="QL-001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tên Quản lý</label>
                  <input
                    name="managerName"
                    defaultValue={editing?.managerName}
                    className="w-full h-9 rounded-md border px-3 text-sm focus:ring-2 focus:ring-indigo-200"
                    placeholder="Nguyễn Vân A"
                  />
                </div>
              </div>
>>>>>>> Stashed changes
            </div>
            {editing && (
              <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
                <div>Ngày tạo: {new Date(editing.createdAt).toLocaleDateString('vi-VN')}</div>
                <div>Cập nhật lần cuối: {new Date(editing.updatedAt).toLocaleDateString('vi-VN')}</div>
<<<<<<< Updated upstream
                <div>Trạng thái: <span className={editing.isActive ? 'text-green-600' : 'text-gray-600'}>{editing.isActive ? 'Hoạt động' : 'Không hoạt động'}</span></div>
              </div>
            )}
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
            <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenModal(false)}>Hủy</button>
            <button
              type="submit"
              className="h-9 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300"
            >
              {editing ? 'Lưu thay đổi' : 'Tạo Trung tâm'}
            </button>
          </div>
        </form>
=======
                <div>Trạng thái: <span className={editing.deletedAt ? 'text-red-600' : 'text-green-600'}>
                  {editing.deletedAt ? 'Đã xóa' : 'Hoạt động'}
                </span></div>
              </div>
            )}
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
                {viewing ? 'Đóng' : 'Hủy'}
              </button>
              {!viewing && (
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  {editing ? 'Cập nhật' : 'Tạo mới'}
                </button>
              )}
            </div>
          </form>
          )}
        </div>
>>>>>>> Stashed changes
      </Modal>
    </div>
  )
}