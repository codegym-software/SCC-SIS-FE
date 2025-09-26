import React, { useMemo, useState } from 'react'
import { BookOpen, Users, Calendar, MapPin, User, Search } from 'lucide-react'

type Class = {
  id: string
  name: string
  description: string
  program: string
  startDate: string
  schedule: string
  location: string
  students: number
  maxStudents: number
  instructor: string
  instructorInitial: string
  status: 'Chuẩn bị' | 'Đang học' | 'Hoàn thành' | 'Tạm dừng'
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

export default function ClassesPage() {
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<Class | null>(null)

  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: 'Lập trình Java Cơ bản - K15',
      description: 'Khóa học Java dành cho người mới bắt đầu',
      program: 'Công nghệ Thông tin',
      startDate: '2024-12-25',
      schedule: 'Thứ 2, 4, 6 - 19:00-21:30',
      location: 'Phòng A101',
      students: 28,
      maxStudents: 30,
      instructor: 'Nguyễn Văn A',
      instructorInitial: 'N',
      status: 'Chuẩn bị'
    },
    {
      id: '2',
      name: 'Web Development - K08',
      description: 'Phát triển ứng dụng web hiện đại',
      program: 'Công nghệ Thông tin',
      startDate: '2024-11-20',
      schedule: 'Thứ 3, 5, 7 - 18:30-21:00',
      location: 'Phòng B201',
      students: 22,
      maxStudents: 25,
      instructor: 'Trần Thị B',
      instructorInitial: 'T',
      status: 'Đang học'
    },
    {
      id: '3',
      name: 'Python Programming - K12',
      description: 'Học lập trình Python từ cơ bản đến nâng cao',
      program: 'Công nghệ Thông tin',
      startDate: '2024-12-01',
      schedule: 'Thứ 2, 4 - 18:00-20:30',
      location: 'Phòng C301',
      students: 30,
      maxStudents: 35,
      instructor: 'Lê Văn C',
      instructorInitial: 'L',
      status: 'Đang học'
    },
    {
      id: '4',
      name: 'Digital Marketing - K05',
      description: 'Chiến lược marketing số toàn diện',
      program: 'Digital Marketing',
      startDate: '2024-10-15',
      schedule: 'Thứ 3, 6 - 19:00-21:30',
      location: 'Phòng D401',
      students: 18,
      maxStudents: 20,
      instructor: 'Nguyễn Văn A',
      instructorInitial: 'N',
      status: 'Đang học'
    },
    {
      id: '5',
      name: 'React Native - K03',
      description: 'Phát triển ứng dụng di động với React Native',
      program: 'Công nghệ Thông tin',
      startDate: '2025-01-15',
      schedule: 'Thứ 7, CN - 08:00-12:00',
      location: 'Phòng E501',
      students: 0,
      maxStudents: 15,
      instructor: 'Trần Thị B',
      instructorInitial: 'T',
      status: 'Chuẩn bị'
    }
  ])

  const stats = useMemo(() => [
    {
      label: 'Tổng Lớp học',
      value: String(classes.length),
      icon: BookOpen,
      iconColor: 'from-green-500 to-emerald-500',
      change: '+3 tháng này',
      changeColor: 'text-green-600 bg-green-50'
    },
    {
      label: 'Đang hoạt động',
      value: String(classes.filter(c => c.status === 'Đang học').length),
      icon: Users,
      iconColor: 'from-green-500 to-emerald-500',
      change: 'Lớp đang học',
      changeColor: 'text-green-600 bg-green-50'
    },
    {
      label: 'Tổng Học viên',
      value: String(classes.reduce((sum, c) => sum + c.students, 0)),
      icon: Users,
      iconColor: 'from-blue-500 to-cyan-500',
      change: 'Đang học',
      changeColor: 'text-blue-600 bg-blue-50'
    },
    {
      label: 'Giảng viên',
      value: '3',
      icon: User,
      iconColor: 'from-purple-500 to-violet-500',
      change: 'Available',
      changeColor: 'text-purple-600 bg-purple-50'
    }
  ], [classes])

  const filtered = useMemo(() => {
    let result = classes.filter(c => 
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.description.toLowerCase().includes(query.toLowerCase())
    )
    
    if (statusFilter !== 'Tất cả trạng thái') {
      result = result.filter(c => c.status === statusFilter)
    }
    
    return result
  }, [classes, query, statusFilter])

  function CreateEditForm({ editing }: { editing?: Class | null }) {
    const [errors, setErrors] = useState<{name?: string; instructor?: string}>({})
    
    return (
      <form
        onSubmit={(e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget as HTMLFormElement)
          const payload: Class = {
            id: editing?.id ?? String(Date.now()),
            name: String(form.get('name') || ''),
            description: String(form.get('description') || ''),
            program: String(form.get('program') || ''),
            startDate: String(form.get('startDate') || ''),
            schedule: String(form.get('schedule') || ''),
            location: String(form.get('location') || ''),
            students: Number(form.get('students') || 0),
            maxStudents: Number(form.get('maxStudents') || 0),
            instructor: String(form.get('instructor') || ''),
            instructorInitial: String(form.get('instructor') || '').charAt(0).toUpperCase(),
            status: (String(form.get('status') || 'Chuẩn bị') as Class['status'])
          }
          
          const newErrors: typeof errors = {}
          if (!payload.name || payload.name.trim().length < 3) newErrors.name = 'Tên lớp học tối thiểu 3 ký tự'
          if (!payload.instructor || payload.instructor.trim().length < 2) newErrors.instructor = 'Tên giảng viên tối thiểu 2 ký tự'
          setErrors(newErrors)
          
          if (Object.keys(newErrors).length > 0) return
          
          setClasses(prev => editing ? prev.map(x => x.id === editing.id ? payload : x) : [payload, ...prev])
          editing ? setOpenEdit(null) : setOpenCreate(false)
        }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-medium">{editing ? 'Chỉnh sửa lớp học' : 'Tạo lớp học mới'}</div>
          <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => editing ? setOpenEdit(null) : setOpenCreate(false)}>×</button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tên lớp học *</label>
            <input name="name" defaultValue={editing?.name} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.name ? 'border-red-500' : ''}`} placeholder="Lập trình Java Cơ bản - K15" />
            {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Chương trình *</label>
            <select name="program" defaultValue={editing?.program} required className="w-full h-9 rounded-md border px-2 text-sm">
              <option value="">Chọn chương trình</option>
              <option>Công nghệ Thông tin</option>
              <option>Digital Marketing</option>
              <option>Thiết kế Đồ họa</option>
              <option>Kinh doanh</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
            <input name="description" defaultValue={editing?.description} className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Khóa học Java dành cho người mới bắt đầu" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Ngày bắt đầu *</label>
            <input name="startDate" type="date" defaultValue={editing?.startDate} required className="w-full h-9 rounded-md border px-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Lịch học *</label>
            <input name="schedule" defaultValue={editing?.schedule} required className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Thứ 2, 4, 6 - 19:00-21:30" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Địa điểm *</label>
            <input name="location" defaultValue={editing?.location} required className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Phòng A101" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Số học viên hiện tại</label>
            <input name="students" type="number" defaultValue={editing?.students ?? 0} className="w-full h-9 rounded-md border px-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Số học viên tối đa *</label>
            <input name="maxStudents" type="number" defaultValue={editing?.maxStudents ?? 30} required className="w-full h-9 rounded-md border px-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Giảng viên *</label>
            <input name="instructor" defaultValue={editing?.instructor} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.instructor ? 'border-red-500' : ''}`} placeholder="Nguyễn Văn A" />
            {errors.instructor && <div className="text-xs text-red-600 mt-1">{errors.instructor}</div>}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
            <select name="status" defaultValue={editing?.status ?? 'Chuẩn bị'} className="w-full h-9 rounded-md border px-2 text-sm">
              <option>Chuẩn bị</option>
              <option>Đang học</option>
              <option>Hoàn thành</option>
              <option>Tạm dừng</option>
            </select>
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => editing ? setOpenEdit(null) : setOpenCreate(false)}>Hủy</button>
          <button type="submit" className="h-9 px-3 rounded-md bg-green-600 text-white hover:bg-green-700">{editing ? 'Lưu thay đổi' : 'Tạo lớp học'}</button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 grid place-items-center text-white">
            <BookOpen size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Quản lý Lớp học</h1>
            <p className="text-xs text-gray-500">Quản lý thông tin lớp học và danh sách học viên</p>
          </div>
        </div>
        <button onClick={() => setOpenCreate(true)} className="inline-flex items-center gap-2 rounded-md bg-green-600 text-white text-sm px-3 py-2 hover:bg-green-700">
          + Tạo Lớp học mới
        </button>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => {
          const IconComponent = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5 relative">
              <div className="text-xs text-gray-500 mb-3">{s.label}</div>
              <div className="text-2xl font-semibold mb-2">{s.value}</div>
              {s.change && (
                <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${s.changeColor}`}>
                  {s.change}
                </div>
              )}
              <div className={`absolute top-4 right-4 h-8 w-8 rounded-lg bg-gradient-to-br ${s.iconColor} grid place-items-center text-white`}>
                <IconComponent size={16} />
              </div>
            </div>
          )
        })}
      </section>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full h-9 pl-10 pr-3 rounded-md border text-sm outline-none focus:ring-2 focus:ring-green-200"
            placeholder="Tìm kiếm lớp học..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 rounded-md border px-3 text-sm"
        >
          <option>Tất cả trạng thái</option>
          <option>Chuẩn bị</option>
          <option>Đang học</option>
          <option>Hoàn thành</option>
          <option>Tạm dừng</option>
        </select>
      </div>

      {/* Classes List */}
      <section className="rounded-2xl border border-gray-200 bg-white">
        <div className="px-3 py-3 border-b flex items-start gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 grid place-items-center text-white flex-shrink-0">
            <BookOpen size={16} />
          </div>
          <div>
            <div className="text-sm font-medium">Danh sách Lớp học</div>
            <div className="text-xs text-gray-500">Quản lý tất cả lớp học trong hệ thống ({filtered.length} kết quả)</div>
          </div>
        </div>

        <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
          <div className="col-span-3">Lớp học</div>
          <div className="col-span-2">Chương trình</div>
          <div className="col-span-2">Thời gian</div>
          <div className="col-span-1">Địa điểm</div>
          <div className="col-span-1">Học viên</div>
          <div className="col-span-1">Giảng viên</div>
          <div className="col-span-1">Trạng thái</div>
          <div className="col-span-1"></div>
        </div>

        <div className="divide-y">
          {filtered.map((c) => (
            <div key={c.id} className="px-3 py-3 pr-12 grid grid-cols-12 gap-3 items-center border-t first:border-t-0 relative">
              <div className="col-span-12 md:col-span-3">
                <div className="flex items-start gap-3">
                  <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-green-500 to-emerald-500 grid place-items-center text-white flex-shrink-0">
                    <BookOpen size={16} />
                  </div>
                  <div>
                    <div className="text-sm font-medium">{c.name}</div>
                    <div className="text-xs text-gray-500">{c.description}</div>
                  </div>
                </div>
              </div>
              <div className="col-span-12 md:col-span-2">
                <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs">{c.program}</span>
              </div>
              <div className="col-span-12 md:col-span-2">
                <div className="flex items-center gap-1 text-sm">
                  <Calendar size={14} className="text-gray-500" />
                  {c.startDate}
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Calendar size={12} className="text-gray-400" />
                  {c.schedule}
                </div>
              </div>
              <div className="col-span-6 md:col-span-1 text-sm flex items-center gap-1 pl-4">
                <MapPin size={14} className="text-gray-500" />
                {c.location}
              </div>
              <div className="col-span-6 md:col-span-1 text-sm flex items-center gap-1 pl-4">
                <Users size={14} className="text-gray-500" />
                {c.students}/{c.maxStudents}
              </div>
              <div className="col-span-6 md:col-span-1 text-sm flex items-center gap-2 pl-4">
                <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-medium">
                  {c.instructorInitial}
                </div>
                {c.instructor}
              </div>
              <div className="col-span-6 md:col-span-1 pl-4">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  c.status === 'Đang học' ? 'bg-green-50 text-green-700' :
                  c.status === 'Chuẩn bị' ? 'bg-blue-50 text-blue-700' :
                  c.status === 'Hoàn thành' ? 'bg-green-50 text-green-700' :
                  'bg-gray-50 text-gray-700'
                }`}>
                  {c.status}
                </span>
              </div>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40">
                <div className="relative z-40">
                  <button className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center" onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}>⋯</button>
                  {openMenuId === c.id && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setOpenMenuId(null)} />
                      <div className="absolute right-0 mt-1 w-36 rounded-lg border bg-white shadow-lg z-[70]">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setOpenMenuId(null); setOpenEdit(c) }}>
                          Chỉnh sửa
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={() => { setOpenMenuId(null) }}>
                          Xem chi tiết
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={() => { setOpenMenuId(null) }}>
                          Xóa lớp học
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
          <div>Hiển thị 1 - {Math.min(5, filtered.length)} trong số {filtered.length} kết quả</div>
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">Previous</button>
            <button className="h-8 px-3 rounded-md bg-green-600 text-white text-sm">1</button>
            <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">2</button>
            <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">Next</button>
          </div>
        </div>
      </section>

      {/* Create Modal */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
        <CreateEditForm />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!openEdit} onClose={() => setOpenEdit(null)}>
        {openEdit && <CreateEditForm editing={openEdit} />}
      </Modal>
    </div>
  )
}