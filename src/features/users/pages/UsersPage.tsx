// src/features/users/pages/UsersPage.tsx
import React, { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
import { Eye, Pencil, ShieldOff, ShieldCheck, MoreHorizontal, Plus, Search, ChevronDown } from 'lucide-react'
import CreateUserModal from '../components/CreateUserModal'

// ==== THÊM 2 DÒNG NÀY (đường dẫn tương đối) ====
import { listUsers, createUser } from '../../../shared/api/users'
import { getProfile } from '../../../shared/api/auth'
import type { UserDto } from '../../../shared/types/user'

// UI user type để giữ nguyên render hiện tại
type UIUser = {
  id: string
  name: string
  email: string
  phone: string
  role: string
  center: string
  major: string
  exp: string
  status: 'Hoạt động' | 'Không hoạt động'
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function UsersPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const [openView, setOpenView] = useState<UIUser | null>(null)
  const [openEdit, setOpenEdit] = useState<UIUser | null>(null)
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const toast = useToast()
  const { can } = usePermission()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [users, setUsers] = useState<UIUser[]>([])

  // map BE -> UI (tạm chưa có role/center chi tiết)
  const adaptUser = (u: UserDto): UIUser => ({
    id: String(u.userId),
    name: u.fullName,
    email: u.email,
    phone: u.phone,
    role: '—',
    center: '—',
    major: '—',
    exp: '—',
    status: u.active ? 'Hoạt động' : 'Không hoạt động'
  })

  // ==== LOG PROFILE KHI MOUNT (để biết token/subject) ====
  useEffect(() => {
    getProfile()
      .then(res => {
        console.log('[PROFILE]', res.data)
      })
      .catch(err => {
        console.error('[PROFILE ERR]', err?.response?.status, err?.response?.data)
      })
  }, [])

  // ==== FETCH USERS CÓ LOG & FALLBACK ====
  async function fetchUsers(centerId?: number) {
    setLoading(true)
    setError(null)
    try {
      console.log('[FETCH] GET /api/users', { centerId })
      const res = await listUsers(centerId)
      const data = Array.isArray(res.data) ? (res.data as UserDto[]) : []
      console.log('[FETCH OK] count =', data.length)
      setUsers(data.map(adaptUser))
    } catch (e: any) {
      console.error('GET /api/users failed', {
        status: e?.response?.status,
        data: e?.response?.data,
        url: e?.config?.url,
        baseURL: (e?.config as any)?.baseURL,
      })

      const status = e?.response?.status
      if (status === 401) {
        setError('Bạn chưa đăng nhập hoặc token không hợp lệ (401)')
      } else if (status === 403 && centerId == null) {
        // Nếu đang gọi toàn hệ thống mà không phải SA -> 403 → fallback thử center=1
        try {
          console.warn('[FETCH] fallback centerId=1 (test quyền non-SA)')
          const res2 = await listUsers(1)
          const data2 = Array.isArray(res2.data) ? (res2.data as UserDto[]) : []
          console.log('[FETCH fallback OK] count =', data2.length)
          setUsers(data2.map(adaptUser))
          setError('Bạn không có quyền xem toàn hệ thống. Đang hiển thị theo centerId=1.')
          return
        } catch (e2: any) {
          console.error('Fallback centerId=1 cũng lỗi', {
            status: e2?.response?.status,
            data: e2?.response?.data,
          })
          setError('Bạn không có quyền xem dữ liệu này (403).')
        }
      } else {
        setError(e?.response?.data?.message || 'Tải danh sách người dùng thất bại')
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Mặc định thử gọi toàn hệ thống (SA sẽ OK, non-SA sẽ 403 và fallback)
    fetchUsers()
  }, [])

  const filtered = useMemo(
    () => users.filter(u => (u.name + u.email).toLowerCase().includes(query.toLowerCase())),
    [users, query]
  )
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageUsers = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page])

  // Stats động 2 số đầu
  const stats = [
    { label: 'Tổng Người dùng', value: String(users.length) },
    { label: 'Đang hoạt động', value: String(users.filter(u => u.status === 'Hoạt động').length) },
    { label: 'Giảng viên', value: '—' },
    { label: 'Giáo vụ', value: '—' },
  ]

  return (
    <div className="space-y-6">
      {/* header & button giữ nguyên */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Quản lý Người dùng</h1>
          <p className="text-xs text-gray-500">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        {can('users:create') && (
          <button
            className="inline-flex items-center gap-2 rounded-md bg-[#030213] text-white text-sm px-4 py-2 hover:bg-black focus:ring-2 focus:ring-gray-300"
            onClick={() => setOpenCreate(true)}
          >
            <Plus className="w-4 h-4" />
            Thêm Người dùng mới
          </button>
        )}
      </div>

      {/* stats giữ nguyên */}
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

      {/* Create User Modal */}
      <CreateUserModal
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onSubmit={async (payload) => {
          try {
            console.log('[CREATE USER] payload =', payload)
            await createUser(payload)
            toast.success('Đã tạo người dùng', 'Người dùng mới đã được thêm vào danh sách')
            await fetchUsers()
          } catch (e: any) {
            console.error('[CREATE USER ERR]', e?.response?.status, e?.response?.data)
            const msg = e?.response?.data?.message || e?.message || 'Tạo người dùng thất bại (kiểm tra quyền & dữ liệu)'
            toast.error('Lỗi', msg)
          }
        }}
      />

      {/* Filters giữ nguyên */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 mb-6 flex flex-wrap items-center gap-4">
        <div className="relative flex-grow">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            value={query}
            onChange={(e) => { setQuery(e.target.value); setPage(1) }}
            className="w-full bg-[#f3f3f5] border-transparent rounded-lg pl-10 pr-4 py-2 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
            placeholder="Tìm kiếm theo tên hoặc email..."
          />
        </div>
        <div className="flex items-center justify-between bg-[#f3f3f5] rounded-lg px-4 py-2 w-full sm:w-auto md:w-52 text-sm">
          <span>Tất cả trung tâm</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </div>
        <div className="flex items-center justify-between bg-[#f3f3f5] rounded-lg px-4 py-2 w-full sm:w-auto md:w-52 text-sm">
          <span>Tất cả vai trò</span>
          <ChevronDown className="w-4 h-4 opacity-50" />
        </div>
      </div>

      {/* Table giữ nguyên UI */}
      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <div>
          <h3 className="text-base font-medium text-gray-900">Danh sách Người dùng</h3>
          <p className="text-sm text-[#717182] mt-1">
            {loading ? 'Đang tải...' : error ? error : `Xem và quản lý tất cả người dùng trong hệ thống (${filtered.length} kết quả)`}
          </p>
        </div>
        <div className="mt-6 -mx-6">
          <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-200 text-sm font-medium text-gray-500">
            <div className="col-span-3">Người dùng</div>
            <div className="col-span-3">Vai trò & Trung tâm</div>
            <div className="col-span-2">Chuyên môn</div>
            <div className="col-span-2">Trạng thái</div>
            <div className="col-span-2 text-right"></div>
          </div>

          <div className="text-sm">
            {pageUsers.map((u) => (
              <div key={u.id} className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200">
                <div className="col-span-3">
                  <p className="font-medium text-gray-900">{u.name}</p>
                  <p className="text-[#717182]">{u.email}</p>
                  <p className="text-[#717182]">{u.phone}</p>
                </div>
                <div className="col-span-3 flex flex-col gap-1.5">
                  <span className={`text-xs font-medium self-start px-2 py-0.5 rounded-md bg-gray-100 text-gray-600`}>
                    {u.role}
                  </span>
                  <p className="text-xs text-[#717182]">{u.center}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-900">{u.major}</p>
                  <p className="text-xs text-[#717182]">{u.exp}</p>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium self-start px-2 py-0.5 rounded-md ${u.status === 'Hoạt động'
                      ? 'bg-[#dcfce7] text-[#016630]'
                      : 'bg-[#f3f4f6] text-[#1e2939]'
                    }`}>
                    {u.status}
                  </span>
                </div>
                <div className="col-span-2 flex justify-end">
                  <div className="relative">
                    <button
                      className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                      onClick={() => setOpenMenuId((prev) => (prev === u.id ? null : u.id))}
                    >
                      <MoreHorizontal size={16} />
                    </button>
                    {openMenuId === u.id && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                        <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-white shadow-lg z-20">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenView(u) }}><Eye size={16} /> Xem chi tiết</button>
                          {can('users:update') && (
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={() => { setOpenMenuId(null); setOpenEdit(u) }}><Pencil size={16} /> Chỉnh sửa</button>
                          )}
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={() => {
                              setOpenMenuId(null)
                              const action = u.status === 'Hoạt động' ? 'Vô hiệu hóa' : 'Kích hoạt'
                              if (confirm(`${action} ${u.name}?`)) {
                                // TODO: gọi API toggle active khi có
                                setUsers(prev => prev.map(x => x.id === u.id ? { ...x, status: u.status === 'Hoạt động' ? 'Không hoạt động' : 'Hoạt động' } : x))
                                toast.success(`${action} thành công`)
                              }
                            }}
                          >
                            {u.status === 'Hoạt động' ? (<><ShieldOff size={16} /> Vô hiệu hóa</>) : (<><ShieldCheck size={16} /> Kích hoạt</>)}
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

        {/* Pagination giữ nguyên */}
        <nav className="flex justify-center items-center gap-2 mt-8 text-sm font-medium">
          <button
            disabled={page === 1}
            onClick={() => setPage(p => Math.max(1, p - 1))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg opacity-50 disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            <span>Previous</span>
          </button>
          <button
            className={`w-9 h-9 flex items-center justify-center rounded-lg border ${page === 1 ? 'bg-white border-gray-200' : 'text-gray-900'}`}
            onClick={() => setPage(1)}
          >
            1
          </button>
          {Math.max(1, Math.ceil(filtered.length / pageSize)) >= 2 && (
            <button
              className={`w-9 h-9 flex items-center justify-center rounded-lg ${page === 2 ? 'bg-white border border-gray-200' : 'text-gray-900'}`}
              onClick={() => setPage(2)}
            >
              2
            </button>
          )}
          <button
            disabled={page === Math.max(1, Math.ceil(filtered.length / pageSize))}
            onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(filtered.length / pageSize)), p + 1))}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </nav>
      </section>

      {/* View & Edit modal giữ nguyên */}
      {/* ... (không đổi phần còn lại) ... */}
    </div>
  )
}
