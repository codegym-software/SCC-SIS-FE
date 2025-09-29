import React, { useMemo, useState, useEffect } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
import { Building2, Eye, MoreHorizontal, Users2, MapPin, Phone, Mail, Globe, User2, Sparkles, Zap, Star, TrendingUp } from 'lucide-react'

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
  const [isLoaded, setIsLoaded] = useState(false)
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

  useEffect(() => {
    setIsLoaded(true)
  }, [])

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
    <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/5 via-blue-600/5 to-purple-600/5 rounded-2xl"></div>
        <div className="relative flex items-center justify-between p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Building2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Quản lý Trung tâm
                </h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-indigo-500" />
                  Quản lý thông tin các trung tâm trong hệ thống với giao diện hiện đại
                </p>
              </div>
            </div>
          </div>
          {can('centers:create') && (
            <button 
              className="group relative overflow-hidden inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-sm px-6 py-3 hover:from-indigo-700 hover:to-blue-700 focus:ring-2 focus:ring-indigo-300 transition-all duration-300 hover:scale-105 hover:shadow-xl" 
              onClick={openCreate}
            >
              <div className="h-5 w-5 rounded-lg bg-white/20 grid place-items-center">
                <Building2 size={14} />
              </div>
              <span className="font-semibold">Thêm Trung tâm mới</span>
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            </button>
          )}
        </div>
      </div>

      {/* Modern Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {[
          { 
            label: 'Tổng số Trung tâm', 
            value: centers.length, 
            sub: '+2 tháng này', 
            icon: Building2, 
            color: 'from-indigo-500 to-blue-500',
            bgGradient: 'from-indigo-50 to-blue-50',
            glowColor: 'shadow-indigo-200'
          },
          { 
            label: 'Đang hoạt động', 
            value: centers.filter(c=>c.status==='Hoạt động').length, 
            sub: 'Trung tâm hoạt động', 
            icon: Eye, 
            color: 'from-green-500 to-emerald-500',
            bgGradient: 'from-green-50 to-emerald-50',
            glowColor: 'shadow-green-200'
          },
          { 
            label: 'Tổng Học viên', 
            value: centers.reduce((s,c)=>s+c.students,0), 
            sub: '+45 tuần này', 
            icon: Users2, 
            color: 'from-purple-500 to-violet-500',
            bgGradient: 'from-purple-50 to-violet-50',
            glowColor: 'shadow-purple-200'
          }
        ].map((stat, index) => {
          const IconComponent = stat.icon
          return (
            <div 
              key={stat.label}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${stat.bgGradient} p-6 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl ${stat.glowColor} hover:shadow-xl`}
              style={{
                animationDelay: `${index * 150}ms`,
                animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">{stat.label}</div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${stat.color} grid place-items-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={18} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.sub}</div>
              </div>
            </div>
          )
        })}
      </section>

      {/* Modern Data Table */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 border border-gray-200/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/3 via-blue-500/3 to-purple-500/3"></div>
        <div className="relative z-10">
          <div className="px-6 py-4 border-b border-gray-100/50 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <input
                className="w-full h-11 rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 text-sm font-medium shadow-lg ring-1 ring-gray-200/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200"
                placeholder="Tìm theo tên hoặc mã trung tâm..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div className="relative">
              <select 
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 text-sm font-medium shadow-lg ring-1 ring-gray-200/50 focus:ring-2 focus:ring-indigo-500/20 focus:outline-none transition-all duration-200"
              >
                <option>Tất cả trạng thái</option>
                <option>Hoạt động</option>
                <option>Không hoạt động</option>
              </select>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <TrendingUp className="h-4 w-4 text-indigo-500" />
              <span>Hiển thị {filtered.length} trung tâm</span>
            </div>
          </div>

          <div className="grid grid-cols-12 gap-4 px-6 py-4 text-xs text-gray-600 border-b border-gray-100/50 font-semibold uppercase tracking-wide">
            <div className="col-span-3">Tên Trung tâm</div>
            <div className="col-span-3">Địa chỉ</div>
            <div className="col-span-2">Liên hệ</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-1">Học viên</div>
            <div className="col-span-1">Giảng viên</div>
            <div className="col-span-0 md:col-span-0"></div>
          </div>

          <div className="divide-y divide-gray-100/50">
            {filtered.map((c, index) => (
              <div 
                key={c.id} 
                className="group grid grid-cols-12 gap-4 px-6 py-6 items-center hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white/50 transition-all duration-300 hover:shadow-sm"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                }}
              >
                <div className="col-span-12 md:col-span-3">
                  <div className="flex items-start gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0 group-hover:scale-110 transition-transform duration-300 shadow-lg">
                      <Building2 size={20} />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">{c.name}</div>
                      <div className="text-xs text-gray-500 mt-1">Mã: {c.code}</div>
                      <div className="text-xs text-gray-500">Tạo: 2024-01-15</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-3 text-sm">
                  <div className="flex items-center gap-2 text-gray-700"><MapPin size={16}/> {c.address}</div>
                  <div className="text-xs text-gray-500 mt-1">{[c.ward,c.district,c.city].filter(Boolean).join(', ')}</div>
                </div>
                <div className="col-span-12 md:col-span-2 text-sm">
                  <div className="flex items-center gap-2"><Phone size={16}/> {c.phone}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600 mt-1"><Mail size={16}/> {c.email}</div>
                  <div className="flex items-center gap-2 text-xs text-gray-600"><Globe size={16}/> {c.website?.replace('https://','')}</div>
                </div>
                <div className="col-span-6 md:col-span-2">
                  <span className={`inline-flex items-center h-7 px-3 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-300 ${
                    c.status === 'Hoạt động' 
                      ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                      : 'bg-gray-100 text-gray-600 border border-gray-200'
                  }`}>
                    {c.status}
                  </span>
                </div>
                <div className="col-span-3 md:col-span-1">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold"><Users2 size={16}/> {c.students} <span className="text-xs text-gray-500">/{c.studentsCapacity}</span></div>
                </div>
                <div className="col-span-3 md:col-span-1 relative">
                  <div className="inline-flex items-center gap-2 text-sm font-semibold"><User2 size={16}/> {c.teachers}</div>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2">
                    <div className="relative z-40">
                      <button className="h-9 w-9 rounded-xl border border-gray-200 bg-white/80 backdrop-blur-sm hover:bg-gray-50 hover:scale-110 transition-all duration-200 inline-flex items-center justify-center shadow-lg" onClick={()=> setOpenMenuId(openMenuId === c.id ? null : c.id)}>
                        <MoreHorizontal size={16}/>
                      </button>
                      {openMenuId===c.id && (
                        <>
                          <div className="fixed inset-0 z-10" onClick={()=>setOpenMenuId(null)}/>
                          <div className="absolute right-0 mt-2 w-48 rounded-2xl border border-gray-200/50 bg-white/95 backdrop-blur-sm shadow-xl z-[70] overflow-hidden">
                            <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium">
                              Xem chi tiết
                            </button>
                            {can('centers:update') && (
                              <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium" onClick={()=>{ setOpenMenuId(null); openEdit(c) }}>
                                Chỉnh sửa
                              </button>
                            )}
                            {can('centers:disable') && (
                              <button className="w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors font-medium" onClick={()=>{
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


