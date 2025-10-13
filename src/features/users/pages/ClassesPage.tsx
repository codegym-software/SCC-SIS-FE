import React, { useMemo, useState, useEffect } from 'react'
import { BookOpen, Users, Calendar, MapPin, User, Search, Edit, UserCheck, GraduationCap, X, Plus, MoreHorizontal } from 'lucide-react'
import { getClasses, getPrograms, createClass, updateClass, type ClassResponse, type ClassLiteResponse, type CreateClassRequest, type UpdateClassRequest } from '../../../shared/api/classes'
import { useToast } from '../../../shared/hooks/useToast'

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

  // API states
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [classes, setClasses] = useState<Class[]>([])
  const [programs, setPrograms] = useState<{ id: number, name: string }[]>([])

  const toast = useToast()

  // Load classes from API
  const loadClasses = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await getClasses()
      const classesData: Class[] = (response.data as ClassResponse[]).map(cls => ({
        id: String(cls.classId),
        name: cls.name,
        description: cls.description || 'Chưa có mô tả',
        program: cls.programName,
        startDate: new Date(cls.startDate).toLocaleDateString('vi-VN'),
        schedule: 'Chưa cập nhật', // API chưa có schedule field
        location: cls.room || 'Chưa cập nhật',
        students: 0, // API chưa có students count - sẽ được cập nhật từ API khác
        maxStudents: cls.capacity,
        instructor: 'Chưa phân công', // API chưa có instructor info - sẽ được cập nhật từ API khác
        instructorInitial: '?',
        status: cls.status === 'PLANNED' ? 'Chuẩn bị' :
          cls.status === 'ONGOING' ? 'Đang học' :
            cls.status === 'FINISHED' ? 'Hoàn thành' : 'Tạm dừng'
      }))
      setClasses(classesData)
    } catch (err: any) {
      console.error('Failed to load classes:', err)
      setError(err?.response?.data?.message || 'Không thể tải danh sách lớp học')
      toast.error('Lỗi', 'Không thể tải danh sách lớp học')
    } finally {
      setLoading(false)
    }
  }

  // Load programs from API
  const loadPrograms = async () => {
    try {
      const response = await getPrograms()
      setPrograms(response.data || [])
    } catch (err: any) {
      console.error('Failed to load programs:', err)
    }
  }

  // Initial load
  useEffect(() => {
    loadClasses()
    loadPrograms()
  }, [])

  const stats = useMemo(() => [
    {
      label: 'Tổng Lớp học',
      value: String(classes.length)
    },
    {
      label: 'Đang hoạt động',
      value: String(classes.filter(c => c.status === 'Đang học').length)
    },
    {
      label: 'Tổng Học viên',
      value: String(classes.reduce((sum, c) => sum + c.students, 0))
    },
    {
      label: 'Giảng viên',
      value: '3'
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
    const [errors, setErrors] = useState<{ name?: string; program?: string; startDate?: string; schedule?: string; location?: string; maxStudents?: string }>({})

    return (
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          const form = new FormData(e.currentTarget as HTMLFormElement)

          const formData = {
            name: String(form.get('name') || ''),
            description: String(form.get('description') || ''),
            program: String(form.get('program') || ''),
            startDate: String(form.get('startDate') || ''),
            endDate: String(form.get('endDate') || ''),
            schedule: String(form.get('schedule') || ''),
            location: String(form.get('location') || ''),
            maxStudents: Number(form.get('maxStudents') || 0),
            status: String(form.get('status') || 'Chuẩn bị')
          }

          const newErrors: typeof errors = {}

          // Validation
          if (!formData.name || formData.name.trim().length < 3) {
            newErrors.name = 'Tên lớp học tối thiểu 3 ký tự'
          }
          if (!formData.program) {
            newErrors.program = 'Vui lòng chọn chương trình'
          }
          if (!formData.startDate) {
            newErrors.startDate = 'Vui lòng chọn ngày bắt đầu'
          }
          if (!formData.schedule || formData.schedule.trim().length < 5) {
            newErrors.schedule = 'Lịch học tối thiểu 5 ký tự'
          }
          if (!formData.location || formData.location.trim().length < 2) {
            newErrors.location = 'Địa điểm tối thiểu 2 ký tự'
          }
          if (!formData.maxStudents || formData.maxStudents < 1) {
            newErrors.maxStudents = 'Sĩ số tối đa phải lớn hơn 0'
          }

          setErrors(newErrors)

          if (Object.keys(newErrors).length > 0) return

          try {
            if (editing) {
              // Update existing class
              const updatePayload: UpdateClassRequest = {
                name: formData.name,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                room: formData.location,
                capacity: formData.maxStudents
              }
              await updateClass(Number(editing.id), updatePayload)
              toast.success('Thành công', 'Đã cập nhật lớp học')
            } else {
              // Create new class
              const createPayload: CreateClassRequest = {
                programId: 1, // TODO: Get from selected program
                name: formData.name,
                description: formData.description,
                startDate: formData.startDate,
                endDate: formData.endDate || undefined,
                room: formData.location,
                capacity: formData.maxStudents
              }
              await createClass(createPayload)
              toast.success('Thành công', 'Đã tạo lớp học mới')
            }

            // Reload classes list
            await loadClasses()
            editing ? setOpenEdit(null) : setOpenCreate(false)
          } catch (err: any) {
            console.error('Failed to save class:', err)
            toast.error('Lỗi', err?.response?.data?.message || 'Không thể lưu lớp học')
          }
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
                  {programs.map(program => (
                    <option key={program.id} value={program.name}>{program.name}</option>
                  ))}
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
        <button onClick={() => setOpenCreate(true)} className="inline-flex items-center gap-2 rounded-md bg-[#030213] text-white text-sm px-4 py-2 hover:bg-black focus:ring-2 focus:ring-gray-300">
          + Tạo Lớp học mới
        </button>
      </div>

      {/* Stats */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-6">
            <p className="text-sm font-medium text-gray-900">{s.label}</p>
            <p className={`text-3xl font-bold mt-8 ${s.label === 'Đang hoạt động' ? 'text-[#00a63e]' : 'text-gray-900'}`}>
              {s.value}
            </p>
          </div>
        ))}
      </section>

      {/* Search and Filter */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-[#f3f3f5] border-transparent rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Tìm kiếm lớp học..."
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="appearance-none h-9 bg-[#f3f3f5] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
        >
          <option>Tất cả trạng thái</option>
          <option>Chuẩn bị</option>
          <option>Đang học</option>
          <option>Hoàn thành</option>
          <option>Tạm dừng</option>
        </select>
      </div>

      {/* Classes List */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <div>
          <h3 className="text-base font-medium text-gray-900">Danh sách Lớp học</h3>
          <p className="text-sm text-[#717182] mt-1">
            {loading ? 'Đang tải...' : error ? error : `Quản lý tất cả lớp học trong hệ thống (${filtered.length} kết quả)`}
          </p>
        </div>

        <div className="mt-6 -mx-6">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div className="col-span-3">Lớp học</div>
            <div className="col-span-2">Chương trình</div>
            <div className="col-span-2">Thời gian</div>
            <div className="col-span-1">Địa điểm</div>
            <div className="col-span-1">Học viên</div>
            <div className="col-span-1">Giảng viên</div>
            <div className="col-span-1">Trạng thái</div>
            <div className="col-span-1 text-right"></div>
          </div>

          <div className="text-sm">
            {filtered.map((c) => (
              <div key={c.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200">
                {/* Thông tin cơ bản */}
                <div className="col-span-3">
                  <p className="font-medium text-gray-900">{c.name}</p>
                  <p className="text-[#717182] text-sm">{c.description}</p>
                </div>

                {/* Chương trình */}
                <div className="col-span-2">
                  <span className="text-xs font-medium self-start px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                    {c.program}
                  </span>
                </div>

                {/* Thời gian */}
                <div className="col-span-2">
                  <p className="text-gray-900">{c.startDate}</p>
                  {c.schedule !== 'Chưa cập nhật' && (
                    <p className="text-[#717182] text-sm">{c.schedule}</p>
                  )}
                </div>

                {/* Địa điểm */}
                <div className="col-span-1">
                  <p className="text-gray-900">{c.location !== 'Chưa cập nhật' ? c.location : '—'}</p>
                </div>

                {/* Học viên */}
                <div className="col-span-1">
                  <p className="text-gray-900">{c.students}/{c.maxStudents}</p>
                </div>

                {/* Giảng viên */}
                <div className="col-span-1">
                  {c.instructor !== 'Chưa phân công' ? (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-xs font-medium">
                        {c.instructorInitial}
                      </div>
                      <span className="text-gray-900 text-sm">{c.instructor}</span>
                    </div>
                  ) : (
                    <span className="text-gray-500">Chưa phân công</span>
                  )}
                </div>

                {/* Trạng thái */}
                <div className="col-span-1">
                  <span className={`text-xs font-medium self-start px-2 py-0.5 rounded-md ${c.status === 'Đang học' ? 'bg-[#dcfce7] text-[#016630]' :
                    c.status === 'Chuẩn bị' ? 'bg-blue-50 text-blue-700' :
                      c.status === 'Hoàn thành' ? 'bg-green-50 text-green-700' :
                        'bg-[#f3f4f6] text-[#1e2939]'
                    }`}>
                    {c.status}
                  </span>
                </div>

                {/* Menu */}
                <div className="col-span-1 flex justify-end">
                  <div className="relative">
                    <button
                      className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                      onClick={() => setOpenMenuId(openMenuId === c.id ? null : c.id)}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === c.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-white shadow-lg z-20">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenEdit(c) }}>
                            <Edit size={16} />
                            Chỉnh sửa
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenManageStudents(c) }}>
                            <UserCheck size={16} />
                            Quản lý học viên
                          </button>
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenAssignInstructor(c) }}>
                            <GraduationCap size={16} />
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

        </div>

        {/* Pagination */}
        <nav className="flex justify-center items-center gap-2 mt-8 text-sm font-medium">
          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg opacity-50">
            <MoreHorizontal className="w-4 h-4 rotate-90" />
            <span>Previous</span>
          </button>

          <button className="w-9 h-9 flex items-center justify-center rounded-lg border bg-white border-gray-200">
            1
          </button>

          <button className="w-9 h-9 flex items-center justify-center rounded-lg text-gray-900">
            2
          </button>

          <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg">
            <span>Next</span>
            <MoreHorizontal className="w-4 h-4 -rotate-90" />
          </button>
        </nav>
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