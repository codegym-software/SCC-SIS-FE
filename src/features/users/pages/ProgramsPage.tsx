import React, { useMemo, useState, useEffect } from 'react'
import { BookOpen, GraduationCap, Clock, Calendar, MoreHorizontal, Search, Plus, Eye, Edit, FolderOpen, Trash2, X, Sparkles, Zap, Star, TrendingUp } from 'lucide-react'

type Program = {
  id: string
  name: string
  description: string
  category: string
  duration: string
  modules: number
  credits: number
  startDate: string
  status: 'Đang hoạt động' | 'Tạm dừng' | 'Hoàn thành'
}

type Module = {
  id: string
  name: string
  moduleId: string
  field: string
  credits: number
  duration: string
  prerequisite: string
  syllabus: 'Có' | 'Chưa có'
  status: 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành'
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function ProgramsPage() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState<'programs' | 'modules'>('programs')
  const [query, setQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('Tất cả')
  const [statusFilter, setStatusFilter] = useState('Tất cả')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<Program | null>(null)
  const [openView, setOpenView] = useState<Program | null>(null)

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  const [programs, setPrograms] = useState<Program[]>([
    {
      id: '1',
      name: 'Công nghệ Thông tin',
      description: 'Chương trình đào tạo toàn diện về CNTT từ cơ bản đến nâng cao',
      category: 'Kỹ thuật',
      duration: '18 tháng',
      modules: 4,
      credits: 14,
      startDate: '2024-01-10',
      status: 'Đang hoạt động'
    },
    {
      id: '2',
      name: 'Lập trình Java',
      description: 'Chuyên sâu về lập trình Java và các ứng dụng thực tế',
      category: 'Lập trình',
      duration: '8 tháng',
      modules: 2,
      credits: 7,
      startDate: '2024-01-25',
      status: 'Đang hoạt động'
    }
  ])

  const [modules, setModules] = useState<Module[]>([
    {
      id: '1',
      name: 'Lập trình Java Cơ bản',
      moduleId: 'JAVA101',
      field: 'Lập trình',
      credits: 3,
      duration: '12 tuần',
      prerequisite: 'Không có',
      syllabus: 'Có',
      status: 'Hoạt động'
    },
    {
      id: '2',
      name: 'Lập trình Java Nâng cao',
      moduleId: 'JAVA201',
      field: 'Lập trình',
      credits: 4,
      duration: '16 tuần',
      prerequisite: 'JAVA101',
      syllabus: 'Có',
      status: 'Hoạt động'
    },
    {
      id: '3',
      name: 'Cơ sở dữ liệu',
      moduleId: 'DB101',
      field: 'Dữ liệu',
      credits: 3,
      duration: '12 tuần',
      prerequisite: 'Không có',
      syllabus: 'Chưa có',
      status: 'Hoạt động'
    },
    {
      id: '4',
      name: 'Phát triển Web Frontend',
      moduleId: 'WEB101',
      field: 'Web Development',
      credits: 4,
      duration: '14 tuần',
      prerequisite: 'Không có',
      syllabus: 'Chưa có',
      status: 'Hoạt động'
    }
  ])

  const stats = useMemo(() => [
    {
      label: 'Chương trình',
      value: String(programs.length),
      icon: GraduationCap,
      iconColor: 'from-purple-500 to-violet-500',
      change: '+2 hoạt động',
      changeColor: 'text-green-600 bg-green-50'
    },
    {
      label: 'Module',
      value: String(modules.length),
      icon: BookOpen,
      iconColor: 'from-blue-500 to-cyan-500',
      change: '+4 sẵn sàng',
      changeColor: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Tổng tín chỉ',
      value: String(programs.reduce((sum, p) => sum + p.credits, 0)),
      icon: Clock,
      iconColor: 'from-green-500 to-emerald-500',
      change: 'Tổng tín chỉ hệ thống',
      changeColor: 'text-green-600 bg-green-50'
    },
    {
      label: 'Lĩnh vực',
      value: String(new Set(programs.map(p => p.category)).size),
      icon: BookOpen,
      iconColor: 'from-orange-500 to-red-500',
      change: 'Đa dạng',
      changeColor: 'text-orange-600 bg-orange-50'
    }
  ], [programs, modules])

  const filteredPrograms = useMemo(() => {
    let result = programs.filter(p => 
      p.name.toLowerCase().includes(query.toLowerCase()) ||
      p.description.toLowerCase().includes(query.toLowerCase())
    )
    
    if (categoryFilter !== 'Tất cả') {
      result = result.filter(p => p.category === categoryFilter)
    }
    
    if (statusFilter !== 'Tất cả') {
      result = result.filter(p => p.status === statusFilter)
    }
    
    return result
  }, [programs, query, categoryFilter, statusFilter])

  const filteredModules = useMemo(() => {
    let result = modules.filter(m => 
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.moduleId.toLowerCase().includes(query.toLowerCase()) ||
      m.field.toLowerCase().includes(query.toLowerCase())
    )
    
    if (statusFilter !== 'Tất cả') {
      result = result.filter(m => m.status === statusFilter)
    }
    
    return result
  }, [modules, query, statusFilter])

  function ViewProgramModal({ program }: { program: Program }) {
    const programModules = modules.filter(m => m.field === program.category || m.field === 'Lập trình')
    
    return (
      <>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 grid place-items-center text-white">
              <GraduationCap size={16} />
            </div>
            <div>
              <div className="font-medium">Chi tiết Chương trình: {program.name}</div>
              <div className="text-xs text-gray-500">Xem thông tin chi tiết về chương trình đào tạo và danh sách module.</div>
            </div>
          </div>
          <button className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center" onClick={() => setOpenView(null)}>
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-6">
        {/* Program Details */}
        <div>
          <h3 className="text-sm font-medium mb-3">Thông tin chương trình</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tên chương trình</label>
              <div className="text-sm font-medium">{program.name}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Thời gian</label>
              <div className="text-sm">{program.duration}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tổng tín chỉ</label>
              <div className="text-sm">{program.credits} tín chỉ</div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Lĩnh vực</label>
              <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                {program.category}
              </span>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Số module</label>
              <div className="text-sm">{program.modules} module</div>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                program.status === 'Đang hoạt động' ? 'bg-green-50 text-green-700' :
                program.status === 'Tạm dừng' ? 'bg-yellow-50 text-yellow-700' :
                'bg-gray-50 text-gray-700'
              }`}>
                {program.status}
              </span>
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-xs text-gray-500 mb-1">Mô tả</label>
            <div className="text-sm text-gray-700">{program.description}</div>
          </div>
        </div>

        {/* Module List */}
        <div>
          <h3 className="text-sm font-medium mb-3">Danh sách Module ({programModules.length})</h3>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {programModules.map((module) => (
              <div key={module.id} className="flex items-center gap-3 p-3 border rounded-lg">
                <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white flex-shrink-0">
                  <BookOpen size={14} />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium">{module.name}</div>
                  <div className="text-xs text-gray-500">{module.moduleId}</div>
                </div>
                <div className="text-xs text-gray-500">{module.credits} tín chỉ</div>
                <div className="text-xs text-gray-500">{module.duration}</div>
              </div>
            ))}
          </div>
        </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end">
          <button className="h-9 px-4 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenView(null)}>
            Đóng
          </button>
        </div>
      </>
    )
  }

  function CreateEditForm({ editing }: { editing?: Program | null }) {
    const [errors, setErrors] = useState<{name?: string; description?: string}>({})
    
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget as HTMLFormElement)
          const payload: Program = {
            id: editing?.id ?? String(Date.now()),
            name: String(form.get('name') || ''),
            description: String(form.get('description') || ''),
            category: String(form.get('category') || ''),
            duration: String(form.get('duration') || ''),
            modules: Number(form.get('modules') || 0),
            credits: Number(form.get('credits') || 0),
            startDate: String(form.get('startDate') || ''),
            status: (String(form.get('status') || 'Đang hoạt động') as Program['status'])
          }
          
          const newErrors: typeof errors = {}
          if (!payload.name || payload.name.trim().length < 3) newErrors.name = 'Tên chương trình tối thiểu 3 ký tự'
          if (!payload.description || payload.description.trim().length < 10) newErrors.description = 'Mô tả tối thiểu 10 ký tự'
          setErrors(newErrors)
          
          if (Object.keys(newErrors).length > 0) return
          
          setPrograms(prev => editing ? prev.map(x => x.id === editing.id ? payload : x) : [payload, ...prev])
          editing ? setOpenEdit(null) : setOpenCreate(false)
        }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <div className="font-medium">{editing ? 'Chỉnh sửa Chương trình' : 'Tạo chương trình mới'}</div>
            {editing && <div className="text-xs text-gray-500">Cập nhật thông tin chương trình {editing.name}.</div>}
          </div>
          <button type="button" className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center" onClick={() => editing ? setOpenEdit(null) : setOpenCreate(false)}>
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-3">Thông tin cơ bản</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tên chương trình *</label>
                <input name="name" defaultValue={editing?.name} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.name ? 'border-red-500' : ''}`} placeholder="Công nghệ Thông tin" />
                {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Thời gian (tháng) *</label>
                <input name="duration" type="number" defaultValue={editing?.duration?.replace(' tháng', '')} required className="w-full h-9 rounded-md border px-3 text-sm" placeholder="18" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Lĩnh vực *</label>
                <select name="category" defaultValue={editing?.category} required className="w-full h-9 rounded-md border px-2 text-sm">
                  <option value="">Chọn lĩnh vực</option>
                  <option>Kỹ thuật</option>
                  <option>Lập trình</option>
                  <option>Thiết kế</option>
                  <option>Kinh doanh</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
                <select name="status" defaultValue={editing?.status ?? 'Đang hoạt động'} className="w-full h-9 rounded-md border px-2 text-sm">
                  <option>Đang hoạt động</option>
                  <option>Tạm dừng</option>
                  <option>Hoàn thành</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Mô tả *</label>
                <textarea name="description" defaultValue={editing?.description} required className={`w-full h-20 rounded-md border px-3 py-2 text-sm ${errors.description ? 'border-red-500' : ''}`} placeholder="Chương trình đào tạo toàn diện về CNTT từ cơ bản đến nâng cao" />
                {errors.description && <div className="text-xs text-red-600 mt-1">{errors.description}</div>}
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => editing ? setOpenEdit(null) : setOpenCreate(false)}>Hủy</button>
          <button type="submit" className="h-9 px-3 rounded-md bg-purple-600 text-white hover:bg-purple-700">{editing ? 'Cập nhật' : 'Tạo chương trình'}</button>
        </div>
      </form>
    )
  }

  return (
    <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Modern Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 via-violet-600/5 to-pink-600/5 rounded-2xl"></div>
        <div className="relative flex items-center justify-between p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                <BookOpen className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Chương trình & Module
                </h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-purple-500" />
                  Quản lý chương trình đào tạo và module học tập với giao diện hiện đại
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, index) => {
          const IconComponent = s.icon
          return (
            <div 
              key={s.label} 
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-6 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-purple-200`}
              style={{
                animationDelay: `${index * 100}ms`,
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
                  <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">{s.label}</div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.iconColor} grid place-items-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={18} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">{s.value}</div>
                {s.change && (
                  <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${s.changeColor}`}>
                    {s.change}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </section>

      {/* Modern Tabs */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 border border-gray-200/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/3 via-violet-500/3 to-pink-500/3"></div>
        <div className="relative z-10 flex gap-1 p-2">
          <button
            onClick={() => setActiveTab('programs')}
            className={`group flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'programs' 
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <GraduationCap size={18} className={activeTab === 'programs' ? 'text-white' : 'text-purple-500'} />
            <span>Chương trình Đào tạo</span>
            {activeTab === 'programs' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
          </button>
          <button
            onClick={() => setActiveTab('modules')}
            className={`group flex-1 flex items-center justify-center gap-3 py-4 px-6 rounded-xl text-sm font-semibold transition-all duration-300 ${
              activeTab === 'modules' 
                ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg scale-105' 
                : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
            }`}
          >
            <BookOpen size={18} className={activeTab === 'modules' ? 'text-white' : 'text-purple-500'} />
            <span>Module / Học phần</span>
            {activeTab === 'modules' && (
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            )}
          </button>
        </div>
      </div>

      {/* Content */}
      {activeTab === 'programs' ? (
        <>
          {/* Programs Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap size={20} className="text-purple-600" />
                Chương trình Đào tạo
              </h2>
              <p className="text-sm text-gray-500">Tạo và quản lý các chương trình đào tạo</p>
            </div>
            <button 
              onClick={() => setOpenCreate(true)}
              className="inline-flex items-center gap-2 rounded-md bg-purple-600 text-white text-sm px-3 py-2 hover:bg-purple-700"
            >
              <Plus size={16} />
              Tạo Chương trình mới
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-purple-200"
                placeholder="Tìm kiếm chương trình..."
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-md border px-3 text-sm"
            >
              <option>Tất cả</option>
              <option>Kỹ thuật</option>
              <option>Lập trình</option>
              <option>Thiết kế</option>
              <option>Kinh doanh</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border px-3 text-sm"
            >
              <option>Tất cả</option>
              <option>Đang hoạt động</option>
              <option>Tạm dừng</option>
              <option>Hoàn thành</option>
            </select>
          </div>

          {/* Programs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredPrograms.map((program) => (
              <div key={program.id} className="rounded-xl border border-gray-200 bg-white p-6 relative">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 grid place-items-center text-white">
                      <GraduationCap size={18} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{program.name}</h3>
                      <span className="inline-flex items-center px-2 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-medium">
                        {program.category}
                      </span>
                    </div>
                  </div>
                  <div className="relative">
                    <button 
                      className="h-8 w-8 rounded-md hover:bg-gray-100 flex items-center justify-center"
                      onClick={() => setOpenMenuId(openMenuId === program.id ? null : program.id)}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === program.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 mt-1 w-48 rounded-lg border bg-white shadow-lg z-[70]">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenView(program) }}>
                            <Eye size={14} />
                            Xem chi tiết
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenEdit(program) }}>
                            <Edit size={14} />
                            Chỉnh sửa
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null) }}>
                            <FolderOpen size={14} />
                            Quản lý Module
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null) }}>
                            <Trash2 size={14} />
                            Xóa chương trình
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 mb-4">{program.description}</p>
                
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={14} />
                    {program.duration}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <BookOpen size={14} />
                    {program.modules} module
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <GraduationCap size={14} />
                    {program.credits} tín chỉ
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={14} />
                    {program.startDate}
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    program.status === 'Đang hoạt động' ? 'bg-green-50 text-green-700' :
                    program.status === 'Tạm dừng' ? 'bg-yellow-50 text-yellow-700' :
                    'bg-gray-50 text-gray-700'
                  }`}>
                    {program.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          {/* Modules Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen size={20} className="text-blue-600" />
                Module / Học phần
              </h2>
              <p className="text-sm text-gray-500">Quản lý các module và học phần trong hệ thống</p>
            </div>
            <button className="inline-flex items-center gap-2 rounded-md bg-blue-600 text-white text-sm px-3 py-2 hover:bg-blue-700">
              <Plus size={16} />
              Tạo Module mới
            </button>
          </div>

          {/* Search and Filter */}
          <div className="flex items-center gap-4">
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-blue-200"
                placeholder="Tìm kiếm module..."
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 rounded-md border px-3 text-sm"
            >
              <option>Tất cả</option>
              <option>Lập trình</option>
              <option>Dữ liệu</option>
              <option>Web Development</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-9 rounded-md border px-3 text-sm"
            >
              <option>Tất cả</option>
              <option>Hoạt động</option>
              <option>Tạm dừng</option>
              <option>Hoàn thành</option>
            </select>
          </div>

          {/* Modules Table */}
          <section className="rounded-2xl border border-gray-200 bg-white">
            <div className="px-3 py-3 border-b flex items-start gap-2">
              <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white flex-shrink-0">
                <BookOpen size={16} />
              </div>
              <div>
                <div className="text-sm font-medium">Danh sách Module</div>
                <div className="text-xs text-gray-500">Quản lý tất cả module và học phần ({filteredModules.length} kết quả)</div>
              </div>
            </div>

            <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
              <div className="col-span-3">Module</div>
              <div className="col-span-2">Lĩnh vực</div>
              <div className="col-span-1">Tín chỉ</div>
              <div className="col-span-1">Thời gian</div>
              <div className="col-span-2">Tiên quyết</div>
              <div className="col-span-1">Syllabus</div>
              <div className="col-span-1">Trạng thái</div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
              {filteredModules.map((module) => (
                <div key={module.id} className="px-3 py-3 pr-12 grid grid-cols-12 gap-3 items-center border-t first:border-t-0 relative">
                  <div className="col-span-12 md:col-span-3">
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white flex-shrink-0">
                        <BookOpen size={16} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{module.name}</div>
                        <div className="text-xs text-gray-500">{module.moduleId}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">{module.field}</span>
                  </div>
                  <div className="col-span-12 md:col-span-1 text-sm">
                    {module.credits} tín chỉ
                  </div>
                  <div className="col-span-12 md:col-span-1 text-sm flex items-center gap-1">
                    <Clock size={14} className="text-gray-500" />
                    {module.duration}
                  </div>
                  <div className="col-span-12 md:col-span-2">
                    {module.prerequisite === 'Không có' ? (
                      <span className="text-sm text-gray-500">{module.prerequisite}</span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">{module.prerequisite}</span>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-1 text-sm">
                    {module.syllabus === 'Có' ? (
                      <span className="text-blue-600 flex items-center gap-1 cursor-pointer hover:underline">
                        <BookOpen size={14} />
                        Xem
                      </span>
                    ) : (
                      <span className="text-gray-500">Chưa có</span>
                    )}
                  </div>
                  <div className="col-span-12 md:col-span-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      module.status === 'Hoạt động' ? 'bg-green-50 text-green-700' :
                      module.status === 'Tạm dừng' ? 'bg-yellow-50 text-yellow-700' :
                      'bg-gray-50 text-gray-700'
                    }`}>
                      {module.status}
                    </span>
                  </div>
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40">
                    <div className="relative z-40">
                      <button className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center" onClick={() => setOpenMenuId(openMenuId === module.id ? null : module.id)}>⋯</button>
                      {openMenuId === module.id && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                          <div className="absolute right-0 mt-1 w-36 rounded-lg border bg-white shadow-lg z-[70]">
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setOpenMenuId(null) }}>
                              Chỉnh sửa
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => setOpenMenuId(null)}>
                              Xem chi tiết
                            </button>
                            <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => setOpenMenuId(null)}>
                              Xóa module
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="px-3 py-3 border-t flex items-center justify-between text-sm text-gray-500">
              <div>Hiển thị 1 - {Math.min(4, filteredModules.length)} trong số {filteredModules.length} kết quả</div>
              <div className="flex items-center gap-2">
                <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">Previous</button>
                <button className="h-8 px-3 rounded-md bg-blue-600 text-white text-sm">1</button>
                <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">Next</button>
              </div>
            </div>
          </section>
        </>
      )}

      {/* Create Modal */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
        <CreateEditForm />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!openEdit} onClose={() => setOpenEdit(null)}>
        {openEdit && <CreateEditForm editing={openEdit} />}
      </Modal>

      {/* View Modal */}
      <Modal open={!!openView} onClose={() => setOpenView(null)}>
        {openView && <ViewProgramModal program={openView} />}
      </Modal>
    </div>
  )
}