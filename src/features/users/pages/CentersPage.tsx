import React, { useMemo, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
import { Building2, Eye, MoreHorizontal, Users2, MapPin, Phone, Mail, Globe, User2 } from 'lucide-react'

type Center = {
  id: string
  name: string
  code: string
  address: string
  phone: string
  status: 'Hoạt động' | 'Không hoạt động'
  students: number
  studentsCapacity: number
  teachers: number
  city?: string
  district?: string
  ward?: string
  email?: string
  website?: string
  description?: string
  managerId?: string
  managerName?: string
  classesCount?: number
  founded?: string
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
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
  const [centers, setCenters] = useState<Center[]>([
    { id: '1', name: 'Trung tâm Hà Nội 1', code: 'HN01', address: '123 Nguyễn Du, Hai Bà Trưng, Hà Nội', city: 'Hà Nội', district: 'Hai Bà Trưng', ward: 'Bùi Thị Xuân', phone: '024-3943-1234', email: 'hanoi1@education.vn', website: 'https://hanoi1.education.vn', status: 'Hoạt động', students: 450, studentsCapacity: 500, teachers: 25, managerId: 'QL-001', managerName: 'Nguyễn Văn A', classesCount: 15, description: 'Trung tâm đào tạo công nghệ thông tin hàng đầu tại Hà Nội' },
    { id: '2', name: 'Trung tâm TP.HCM 1', code: 'HCM01', address: '456 Lê Lợi, Quận 1, TP.HCM', city: 'TP.HCM', district: 'Quận 1', ward: 'Bến Nghé', phone: '028-3822-5678', email: 'hcm1@education.vn', website: 'https://hcm1.education.vn', status: 'Hoạt động', students: 680, studentsCapacity: 800, teachers: 35, managerId: 'QL-002', managerName: 'Trần Thị B', classesCount: 20, description: '' },
    { id: '3', name: 'Trung tâm Đà Nẵng', code: 'DN01', address: '789 Hùng Vương, Hải Châu, Đà Nẵng', city: 'Đà Nẵng', district: 'Hải Châu', ward: 'Thạch Thang', phone: '0236-3567-890', email: 'danang@education.vn', website: 'https://danang.education.vn', status: 'Không hoạt động', students: 90, studentsCapacity: 300, teachers: 0, managerId: 'QL-003', managerName: 'Lê Văn C', classesCount: 8, description: '' },
  ])
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái')
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Center | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filtered = useMemo(() => {
    let result = centers.filter((c) => 
      c.name.toLowerCase().includes(query.toLowerCase()) || 
      c.code.toLowerCase().includes(query.toLowerCase())
    )
    
    if (statusFilter !== 'Tất cả trạng thái') {
      result = result.filter(c => c.status === statusFilter)
    }
    
    return result
  }, [centers, query, statusFilter])

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload: Center = {
      id: editing?.id ?? String(Date.now()),
      name: String(form.get('name') || ''),
      code: String(form.get('code') || ''),
      address: String(form.get('address') || ''),
      phone: String(form.get('phone') || ''),
      status: (String(form.get('status') || 'Hoạt động') as Center['status']) ?? 'Hoạt động',
      students: Number(form.get('students') || 0),
      studentsCapacity: Number(form.get('studentsCapacity') || 0),
      teachers: Number(form.get('teachers') || 0),
      founded: String(form.get('founded') || ''),
    }
    setCenters((prev) => {
      const exists = prev.some((c) => c.id === payload.id)
      return exists ? prev.map((c) => (c.id === payload.id ? payload : c)) : [payload, ...prev]
    })
    setOpenModal(false)
    setEditing(null)
  }

  function openCreate() {
    setEditing(null)
    setOpenModal(true)
  }

  function openEdit(center: Center) {
    setEditing(center)
    setOpenModal(true)
  }

  function toggleDisable(center: Center) {
    setCenters((prev) => prev.map((c) => (c.id === center.id ? { ...c, status: c.status === 'Hoạt động' ? 'Không hoạt động' : 'Hoạt động' } : c)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Quản lý Trung tâm</h1>
            <p className="text-xs text-gray-500">Quản lý thông tin các trung tâm trong hệ thống</p>
          </div>
        </div>
        {can('centers:create') && (
          <button className="inline-flex items-center gap-2 rounded-md bg-indigo-600 text-white text-sm px-3 py-2 hover:bg-indigo-700 focus:ring-2 focus:ring-indigo-300" onClick={openCreate}>
            + Thêm Trung tâm mới
          </button>
        )}
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2"><Building2 size={16}/> Tổng số Trung tâm</div>
          <div className="mt-3 text-2xl font-semibold">{centers.length}</div>
          <div className="text-xs text-emerald-600 mt-1">+2 tháng này</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2"><Eye size={16}/> Đang hoạt động</div>
          <div className="mt-3 text-2xl font-semibold">{centers.filter(c=>c.status==='Hoạt động').length}</div>
          <div className="text-xs text-gray-500 mt-1">Trung tâm hoạt động</div>
        </div>
        <div className="rounded-lg border bg-white p-4">
          <div className="text-xs text-gray-500 flex items-center gap-2"><Users2 size={16}/> Tổng Học viên</div>
          <div className="mt-3 text-2xl font-semibold">{centers.reduce((s,c)=>s+c.students,0)}</div>
          <div className="text-xs text-emerald-600 mt-1">+45 tuần này</div>
        </div>
      </section>

      <div className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            className="h-9 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="Tìm theo tên hoặc mã trung tâm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 rounded-md border px-2 text-sm"
          >
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Không hoạt động</option>
          </select>
        </div>

        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs text-gray-500 border-b">
          <div className="col-span-3">Tên Trung tâm</div>
          <div className="col-span-3">Địa chỉ</div>
          <div className="col-span-2">Liên hệ</div>
          <div className="col-span-2">Trạng thái</div>
          <div className="col-span-1">Học viên</div>
          <div className="col-span-1">Giảng viên</div>
          <div className="col-span-0 md:col-span-0"></div>
        </div>

        <div className="divide-y">
          {filtered.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
              <div className="col-span-12 md:col-span-3">
                <div className="flex items-start gap-3">
                  <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">Mã: {c.code}</div>
                    <div className="text-xs text-gray-500">Tạo: 2024-01-15</div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-3 text-sm">
                <div className="flex items-center gap-2 text-gray-700"><MapPin size={14}/> {c.address}</div>
                <div className="text-xs text-gray-500">{[c.ward,c.district,c.city].filter(Boolean).join(', ')}</div>
              </div>
              <div className="col-span-12 md:col-span-2 text-sm">
                <div className="flex items-center gap-2"><Phone size={14}/> {c.phone}</div>
                <div className="flex items-center gap-2 text-xs text-gray-600"><Mail size={14}/> {c.email}</div>
                <div className="flex items-center gap-2 text-xs text-gray-600"><Globe size={14}/> {c.website?.replace('https://','')}</div>
              </div>
              <div className="col-span-6 md:col-span-2">
                <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs whitespace-nowrap ${c.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
              </div>
              <div className="col-span-3 md:col-span-1">
                <div className="inline-flex items-center gap-1 text-sm"><Users2 size={14}/> {c.students} <span className="text-xs text-gray-500">/{c.studentsCapacity}</span></div>
              </div>
              <div className="col-span-3 md:col-span-1 relative">
                <div className="inline-flex items-center gap-1 text-sm"><User2 size={14}/> {c.teachers}</div>
                <div className="absolute right-0 top-1/2 -translate-y-1/2">
                  <div className="relative z-40">
                    <button className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center" onClick={()=> setOpenMenuId(openMenuId === c.id ? null : c.id)}>
                      <MoreHorizontal size={16}/>
                    </button>
                    {openMenuId===c.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={()=>setOpenMenuId(null)}/>
                        <div className="absolute right-0 mt-1 w-40 rounded-lg border bg-white shadow-lg z-[70]">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50">
                            Xem chi tiết
                          </button>
                          {can('centers:update') && (
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{ setOpenMenuId(null); openEdit(c) }}>
                              Chỉnh sửa
                            </button>
                          )}
                          {can('centers:disable') && (
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{
                              setOpenMenuId(null)
                              const action = c.status==='Hoạt động' ? 'Vô hiệu hóa' : 'Kích hoạt'
                              if(confirm(`${action} ${c.name}?`)){
                                toggleDisable(c)
                                toast.success(`${action} thành công`, `${c.name} đã được cập nhật`)
                              }
                            }}>
                              {c.status==='Hoạt động'?'Vô hiệu hóa':'Kích hoạt'}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={onSubmit}>
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div>
              <div className="font-medium">{editing ? 'Sửa Trung tâm' : 'Tạo Trung tâm mới'}</div>
              <div className="text-xs text-gray-500 mt-1">Nhập thông tin để tạo một trung tâm mới trong hệ thống.</div>
            </div>
            <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => setOpenModal(false)}>×</button>
          </div>
          <div className="p-4 space-y-4">
            {/* Thông tin cơ bản */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="h-5 w-5 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                  <Building2 size={12} />
                </div>
                <h3 className="text-xs font-medium text-gray-900">Thông tin cơ bản</h3>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tên trung tâm *</label>
                  <input name="name" defaultValue={editing?.name} required className="w-full h-8 rounded-md border px-2 text-xs" placeholder="Trung tâm Hà Nội 2" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Mã trung tâm *</label>
                  <input name="code" defaultValue={editing?.code} required className="w-full h-8 rounded-md border px-2 text-xs" placeholder="HN02" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Ngày thành lập</label>
                  <input name="founded" type="date" defaultValue={editing?.founded} className="w-full h-8 rounded-md border px-2 text-xs text-gray-700" />
                </div>
              </div>
            </div>

            {/* Thông tin địa chỉ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="h-5 w-5 rounded-lg bg-green-50 text-green-600 grid place-items-center">
                  <MapPin size={12} />
                </div>
                <h3 className="text-xs font-medium text-gray-900">Thông tin địa chỉ</h3>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Địa chỉ đầy đủ *</label>
                <input name="address" defaultValue={editing?.address} required className="w-full h-8 rounded-md border px-2 text-xs" placeholder="123 Nguyễn Du, Phường Bùi Thị Xuân, Quận Hai Bà Trưng" />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Tỉnh/Thành phố *</label>
                  <select name="city" defaultValue={editing?.city} required className="w-full h-8 rounded-md border px-2 text-xs">
                    <option value="">Chọn tỉnh/thành phố</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="TP.HCM">TP.HCM</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Quận/Huyện *</label>
                  <input name="district" defaultValue={editing?.district} required className="w-full h-8 rounded-md border px-2 text-xs" placeholder="Hai Bà Trưng" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Phường/Xã *</label>
                  <input name="ward" defaultValue={editing?.ward} required className="w-full h-8 rounded-md border px-2 text-xs" placeholder="Phường Bùi Thị Xuân" />
                </div>
              </div>
            </div>

            {/* Thông tin liên hệ */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="h-5 w-5 rounded-lg bg-purple-50 text-purple-600 grid place-items-center">
                  <Phone size={12} />
                </div>
                <h3 className="text-xs font-medium text-gray-900">Thông tin liên hệ</h3>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Số điện thoại *</label>
                  <input name="phone" defaultValue={editing?.phone} required className="w-full h-8 rounded-md border px-2 text-xs" placeholder="024-3943-1234" />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Email *</label>
                  <input name="email" type="email" defaultValue={editing?.email} required className="w-full h-8 rounded-md border px-2 text-xs" placeholder="contact@education.vn" />
                </div>
              </div>
            </div>

            {/* Mô tả */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                <div className="h-5 w-5 rounded-lg bg-orange-50 text-orange-600 grid place-items-center">
                  <Globe size={12} />
                </div>
                <h3 className="text-xs font-medium text-gray-900">Mô tả</h3>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Mô tả trung tâm</label>
                <textarea name="description" defaultValue={editing?.description} className="w-full h-16 rounded-md border px-2 py-1 text-xs resize-none" placeholder="Mô tả ngắn gọn về trung tâm..."></textarea>
              </div>
            </div>
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
            <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenModal(false)}>Hủy</button>
            <button
              type="submit"
              className="h-9 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              onClick={() => toast.success(editing ? 'Đã lưu thay đổi' : 'Đã tạo Trung tâm')}
            >
              {editing ? 'Lưu thay đổi' : 'Tạo Trung tâm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


