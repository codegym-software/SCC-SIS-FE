import React, { useMemo, useState, useEffect } from 'react'
import { BookOpen, Users, Calendar, MapPin, User, Search, Edit, UserCheck, GraduationCap, X, Plus } from 'lucide-react'

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
  const [openManageStudents, setOpenManageStudents] = useState<Class | null>(null)
  const [openAssignInstructor, setOpenAssignInstructor] = useState<Class | null>(null)

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

  function ManageStudentsModal({ classItem }: { classItem: Class }) {
    const [students, setStudents] = useState([
      { id: '1', name: 'Phạm Minh Đức', email: 'duc.pham@student.edu', status: 'Đang học' },
      { id: '2', name: 'Hoàng Thị Mai', email: 'mai.hoang@student.edu', status: 'Đang học' },
      { id: '3', name: 'Nguyễn Văn An', email: 'an.nguyen@student.edu', status: 'Đang học' },
      { id: '4', name: 'Trần Thị Bình', email: 'binh.tran@student.edu', status: 'Đang học' }
    ])
    const [showAddStudent, setShowAddStudent] = useState(false)
    const [newStudent, setNewStudent] = useState({ name: '', email: '' })

    const handleAddStudent = () => {
      if (newStudent.name.trim() && newStudent.email.trim()) {
        const student = {
          id: String(Date.now()),
          name: newStudent.name.trim(),
          email: newStudent.email.trim(),
          status: 'Đang học' as const
        }
        setStudents(prev => [...prev, student])
        setNewStudent({ name: '', email: '' })
        setShowAddStudent(false)
        
        // Cập nhật số học viên trong lớp
        setClasses(prev => prev.map(c => 
          c.id === classItem.id 
            ? { ...c, students: c.students + 1 }
            : c
        ))
      }
    }

    const handleRemoveStudent = (studentId: string) => {
      setStudents(prev => prev.filter(s => s.id !== studentId))
      
      // Cập nhật số học viên trong lớp
      setClasses(prev => prev.map(c => 
        c.id === classItem.id 
          ? { ...c, students: Math.max(0, c.students - 1) }
          : c
      ))
    }

    return (
      <>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 grid place-items-center text-white">
              <Users size={16} />
            </div>
            <div>
              <div className="font-medium">Quản lý Học viên</div>
              <div className="text-xs text-gray-500">{classItem.name}</div>
            </div>
          </div>
          <button className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center" onClick={() => setOpenManageStudents(null)}>
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-blue-600" />
                <span className="text-sm font-medium text-blue-600">Trong lớp</span>
              </div>
              <div className="text-2xl font-bold text-blue-700">{classItem.students}</div>
            </div>
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <Users size={16} className="text-green-600" />
                <span className="text-sm font-medium text-green-600">Sĩ số tối đa</span>
              </div>
              <div className="text-2xl font-bold text-green-700">{classItem.maxStudents}</div>
            </div>
            <div className="p-4 rounded-lg bg-orange-50 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <Plus size={16} className="text-orange-600" />
                <span className="text-sm font-medium text-orange-600">Có thể thêm</span>
              </div>
              <div className="text-2xl font-bold text-orange-700">{classItem.maxStudents - classItem.students}</div>
            </div>
          </div>

          {/* Student List */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users size={16} className="text-blue-600" />
                <span className="font-medium">Học viên trong lớp</span>
                <span className="text-blue-600 font-medium">{students.length}/{classItem.maxStudents}</span>
              </div>
              <button 
                onClick={() => setShowAddStudent(true)}
                disabled={students.length >= classItem.maxStudents}
                className="h-8 px-3 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                + Thêm học viên
              </button>
            </div>

            {/* Add Student Form */}
            {showAddStudent && (
              <div className="p-3 border rounded-lg bg-blue-50 mb-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Tên học viên</label>
                    <input
                      value={newStudent.name}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full h-8 rounded-md border px-2 text-sm"
                      placeholder="Nhập tên học viên"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">Email</label>
                    <input
                      value={newStudent.email}
                      onChange={(e) => setNewStudent(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full h-8 rounded-md border px-2 text-sm"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button 
                    onClick={handleAddStudent}
                    className="h-8 px-3 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700"
                  >
                    Thêm
                  </button>
                  <button 
                    onClick={() => {
                      setShowAddStudent(false)
                      setNewStudent({ name: '', email: '' })
                    }}
                    className="h-8 px-3 rounded-md border bg-white text-sm hover:bg-gray-50"
                  >
                    Hủy
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2 max-h-60 overflow-y-auto">
              {students.map((student) => (
                <div key={student.id} className="flex items-center gap-3 p-3 border rounded-lg bg-white">
                  <div className="h-8 w-8 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-medium">
                    {student.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{student.name}</div>
                    <div className="text-xs text-gray-500">{student.email}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-1 rounded-full bg-green-50 text-green-700 text-xs font-medium">
                      {student.status}
                    </span>
                    <button 
                      onClick={() => handleRemoveStudent(student.id)}
                      className="h-6 w-6 rounded-md bg-red-100 text-red-600 hover:bg-red-200 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <div className="text-sm text-gray-600">Tổng cộng: {students.length} học viên trong lớp</div>
          <button className="h-9 px-4 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenManageStudents(null)}>
            Đóng
          </button>
        </div>
      </>
    )
  }

  function AssignInstructorModal({ classItem }: { classItem: Class }) {
    const [instructors, setInstructors] = useState([
      { id: '1', name: 'Nguyễn Văn A', specialization: 'Java Programming', email: 'a.nguyen@education.vn', assigned: false },
      { id: '2', name: 'Trần Thị B', specialization: 'Web Development', email: 'b.tran@education.vn', assigned: false },
      { id: '3', name: 'Lê Văn C', specialization: 'Database Management', email: 'c.le@education.vn', assigned: false }
    ])
    const [assignedInstructor, setAssignedInstructor] = useState(classItem.instructor)
    
    // Tìm ID của giảng viên hiện tại được phân công
    const getCurrentAssignedId = () => {
      const currentInstructor = instructors.find(i => i.name === classItem.instructor)
      return currentInstructor ? currentInstructor.id : ''
    }
    
    const [assignedInstructorId, setAssignedInstructorId] = useState(getCurrentAssignedId())

    // Đồng bộ trạng thái khi modal mở
    useEffect(() => {
      const currentId = getCurrentAssignedId()
      setAssignedInstructorId(currentId)
      setAssignedInstructor(classItem.instructor)
      
      // Cập nhật trạng thái assigned cho giảng viên hiện tại
      setInstructors(prev => prev.map(i => ({
        ...i,
        assigned: i.id === currentId
      })))
    }, [classItem.instructor])

    const handleAssignInstructor = (instructorId: string) => {
      const instructor = instructors.find(i => i.id === instructorId)
      if (instructor) {
        // Cập nhật ID giảng viên được phân công trước
        setAssignedInstructorId(instructorId)
        
        // Cập nhật giảng viên được phân công
        setAssignedInstructor(instructor.name)
        
        // Cập nhật trạng thái giảng viên - chỉ giảng viên được chọn là assigned
        setInstructors(prev => prev.map(i => ({
          ...i,
          assigned: i.id === instructorId
        })))
        
        // Cập nhật thông tin lớp học
        setClasses(prev => prev.map(c => 
          c.id === classItem.id 
            ? { 
                ...c, 
                instructor: instructor.name,
                instructorInitial: instructor.name.charAt(0).toUpperCase()
              }
            : c
        ))
      }
    }

    const handleUnassignInstructor = () => {
      // Reset ID giảng viên được phân công trước
      setAssignedInstructorId('')
      
      // Cập nhật giảng viên được phân công
      setAssignedInstructor('Chưa phân công')
      
      // Cập nhật trạng thái giảng viên - tất cả đều không được phân công
      setInstructors(prev => prev.map(i => ({
        ...i,
        assigned: false
      })))
      
      // Cập nhật thông tin lớp học
      setClasses(prev => prev.map(c => 
        c.id === classItem.id 
          ? { 
              ...c, 
              instructor: 'Chưa phân công',
              instructorInitial: '?'
            }
          : c
      ))
    }

    return (
      <>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-purple-500 to-violet-500 grid place-items-center text-white">
              <GraduationCap size={16} />
            </div>
            <div>
              <div className="font-medium">Phân công Giảng viên - {classItem.name}</div>
              <div className="text-xs text-gray-500">Chọn giảng viên phụ trách lớp học này</div>
              <div className="text-xs text-gray-500">Giảng viên hiện tại: {assignedInstructor}</div>
            </div>
          </div>
          <button className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center" onClick={() => setOpenAssignInstructor(null)}>
            <X size={16} />
          </button>
        </div>
        <div className="p-4 space-y-4">
          {/* Instructor List */}
          <div>
            <h3 className="text-sm font-medium mb-3">Danh sách Giảng viên</h3>
            <div className="space-y-3">
              {instructors.map((instructor) => (
                <div key={instructor.id} className={`flex items-center gap-3 p-3 border rounded-lg ${instructor.id === assignedInstructorId ? 'border-purple-300 bg-purple-50' : 'border-gray-200 bg-white'}`}>
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium ${instructor.id === assignedInstructorId ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                    {instructor.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-medium">{instructor.name}</div>
                    <div className="text-xs text-gray-500">{instructor.specialization}</div>
                    <div className="text-xs text-gray-500">{instructor.email}</div>
                  </div>
                  <div className="flex gap-2">
                    {instructor.id === assignedInstructorId ? (
                      <>
                        <button className="px-3 py-1 rounded-md bg-purple-100 text-purple-700 text-xs font-medium">
                          Đã phân công
                        </button>
                        <button 
                          onClick={handleUnassignInstructor}
                          className="px-3 py-1 rounded-md bg-red-100 text-red-700 text-xs font-medium hover:bg-red-200"
                        >
                          Hủy phân công
                        </button>
                      </>
                    ) : (
                      <button 
                        onClick={() => handleAssignInstructor(instructor.id)}
                        className="px-3 py-1 rounded-md bg-gray-800 text-white text-xs font-medium hover:bg-gray-700"
                      >
                        Phân công
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Assignment Summary */}
          <div className="p-3 bg-gray-50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Tóm tắt phân công</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <div>Lớp học: {classItem.name}</div>
              <div>Chương trình: {classItem.program}</div>
              <div>Giảng viên được phân công: {assignedInstructor}</div>
            </div>
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-between">
          <button className="h-9 px-4 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenAssignInstructor(null)}>
            Đóng
          </button>
          <button className="h-9 px-4 rounded-md bg-purple-600 text-white hover:bg-purple-700">
            Hoàn thành
          </button>
        </div>
      </>
    )
  }

  function CreateEditForm({ editing }: { editing?: Class | null }) {
    const [errors, setErrors] = useState<{name?: string; program?: string; startDate?: string; schedule?: string; location?: string; maxStudents?: string}>({})
    
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
            students: editing?.students ?? 0, // Giữ nguyên số học viên hiện tại khi chỉnh sửa
            maxStudents: Number(form.get('maxStudents') || 0),
            instructor: editing?.instructor ?? 'Chưa phân công', // Giữ nguyên giảng viên hiện tại
            instructorInitial: editing?.instructorInitial ?? '?',
            status: (String(form.get('status') || 'Chuẩn bị') as Class['status'])
          }
          
          const newErrors: typeof errors = {}
          
          // Validation
          if (!payload.name || payload.name.trim().length < 3) {
            newErrors.name = 'Tên lớp học tối thiểu 3 ký tự'
          }
          if (!payload.program) {
            newErrors.program = 'Vui lòng chọn chương trình'
          }
          if (!payload.startDate) {
            newErrors.startDate = 'Vui lòng chọn ngày bắt đầu'
          }
          if (!payload.schedule || payload.schedule.trim().length < 5) {
            newErrors.schedule = 'Lịch học tối thiểu 5 ký tự'
          }
          if (!payload.location || payload.location.trim().length < 2) {
            newErrors.location = 'Địa điểm tối thiểu 2 ký tự'
          }
          if (!payload.maxStudents || payload.maxStudents < 1) {
            newErrors.maxStudents = 'Sĩ số tối đa phải lớn hơn 0'
          }
          
          setErrors(newErrors)
          
          if (Object.keys(newErrors).length > 0) return
          
          setClasses(prev => editing ? prev.map(x => x.id === editing.id ? payload : x) : [payload, ...prev])
          editing ? setOpenEdit(null) : setOpenCreate(false)
        }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div>
            <div className="font-medium">{editing ? 'Chỉnh sửa Lớp học' : 'Tạo lớp học mới'}</div>
            {editing && <div className="text-xs text-gray-500">Cập nhật thông tin lớp học {editing.name}.</div>}
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
                <label className="block text-xs text-gray-600 mb-1">Tên lớp học *</label>
                <input name="name" defaultValue={editing?.name} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.name ? 'border-red-500' : ''}`} placeholder="Lập trình Java Cơ bản - K15" />
                {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chương trình học *</label>
                <select name="program" defaultValue={editing?.program} required className={`w-full h-9 rounded-md border px-2 text-sm ${errors.program ? 'border-red-500' : ''}`}>
                  <option value="">Chọn chương trình</option>
                  <option>Công nghệ Thông tin</option>
                  <option>Digital Marketing</option>
                  <option>Thiết kế Đồ họa</option>
                  <option>Kinh doanh</option>
                </select>
                {errors.program && <div className="text-xs text-red-600 mt-1">{errors.program}</div>}
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
                <textarea name="description" defaultValue={editing?.description} className="w-full h-20 rounded-md border px-3 py-2 text-sm" placeholder="Khóa học Java dành cho người mới bắt đầu" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ngày bắt đầu *</label>
                <input name="startDate" type="date" defaultValue={editing?.startDate} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.startDate ? 'border-red-500' : ''}`} />
                {errors.startDate && <div className="text-xs text-red-600 mt-1">{errors.startDate}</div>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ngày kết thúc</label>
                <input name="endDate" type="date" className="w-full h-9 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Lịch học *</label>
                <input name="schedule" defaultValue={editing?.schedule} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.schedule ? 'border-red-500' : ''}`} placeholder="Thứ 2, 4, 6 - 19:00-21:30" />
                {errors.schedule && <div className="text-xs text-red-600 mt-1">{errors.schedule}</div>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Địa điểm *</label>
                <input name="location" defaultValue={editing?.location} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.location ? 'border-red-500' : ''}`} placeholder="Phòng A101" />
                {errors.location && <div className="text-xs text-red-600 mt-1">{errors.location}</div>}
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Sĩ số tối đa *</label>
                <input name="maxStudents" type="number" defaultValue={editing?.maxStudents ?? 30} required className={`w-full h-9 rounded-md border px-3 text-sm ${errors.maxStudents ? 'border-red-500' : ''}`} />
                {errors.maxStudents && <div className="text-xs text-red-600 mt-1">{errors.maxStudents}</div>}
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
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => editing ? setOpenEdit(null) : setOpenCreate(false)}>Hủy</button>
          <button type="submit" className="h-9 px-3 rounded-md bg-green-600 text-white hover:bg-green-700">{editing ? 'Cập nhật' : 'Tạo lớp học'}</button>
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
                      <div className="absolute right-0 mt-1 w-48 rounded-lg border bg-white shadow-lg z-[70]">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenEdit(c) }}>
                          <Edit size={14} />
                          Chỉnh sửa
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenManageStudents(c) }}>
                          <UserCheck size={14} />
                          Quản lý học viên
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenAssignInstructor(c) }}>
                          <GraduationCap size={14} />
                          Phân công giảng viên
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

      {/* Manage Students Modal */}
      <Modal open={!!openManageStudents} onClose={() => setOpenManageStudents(null)}>
        {openManageStudents && <ManageStudentsModal classItem={openManageStudents} />}
      </Modal>

      {/* Assign Instructor Modal */}
      <Modal open={!!openAssignInstructor} onClose={() => setOpenAssignInstructor(null)}>
        {openAssignInstructor && <AssignInstructorModal classItem={openAssignInstructor} />}
      </Modal>
    </div>
  )
}