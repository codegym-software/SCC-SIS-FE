import React, { useMemo, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
import { Eye, Pencil, ShieldOff, ShieldCheck, MoreHorizontal, Plus, Search, ChevronDown } from 'lucide-react'
import CreateUserModal from '../components/CreateUserModal'

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-3xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

type User = {
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

export default function UsersPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const [openView, setOpenView] = useState<User | null>(null)
  const [openEdit, setOpenEdit] = useState<User | null>(null)
  const [query, setQuery] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [page, setPage] = useState(1)
  const pageSize = 5
  const toast = useToast()
  const { can } = usePermission()
  const stats = [
    { label: 'Tổng Người dùng', value: '6' },
    { label: 'Đang hoạt động', value: '5' },
    { label: 'Giảng viên', value: '3' },
    { label: 'Giáo vụ', value: '2' },
  ]

  const [users, setUsers] = useState<User[]>([
    { id: '1', name: 'Nguyễn Văn An', email: 'an.nguyen@education.vn', phone: '0901234567', role: 'Giáo vụ', center: 'Trung tâm Hà Nội 1', major: 'Giáo dục', exp: '5 năm', status: 'Hoạt động' },
    { id: '2', name: 'Trần Thị Bình', email: 'binh.tran@education.vn', phone: '0902345678', role: 'Giảng viên', center: 'Trung tâm HN 1', major: 'Toán học', exp: '3 năm', status: 'Hoạt động' },
    { id: '3', name: 'Lê Văn Chinh', email: 'chinh.le@education.vn', phone: '0903456789', role: 'Quản lý đào tạo', center: 'Trung tâm TP.HCM 1', major: 'Khoa học máy tính', exp: '10 năm', status: 'Hoạt động' },
    { id: '4', name: 'Phạm Thị Dung', email: 'dung.pham@education.vn', phone: '0904567890', role: 'Giảng viên', center: 'Trung tâm Đà Nẵng', major: 'Ngôn ngữ lập trình', exp: '2 năm', status: 'Không hoạt động' },
    { id: '5', name: 'Hoàng Minh Tuấn', email: 'tuan.hoang@education.vn', phone: '0905678901', role: 'Giảng viên', center: 'Trung tâm HN 1', major: 'Thiết kế đồ họa', exp: '6 năm', status: 'Hoạt động' },
    { id: '6', name: 'Phạm Văn A', email: 'a.pham@education.vn', phone: '0906789012', role: 'Giảng viên', center: 'Trung tâm HN 2', major: 'Vật lý', exp: '4 năm', status: 'Hoạt động' },
  ])

  const filtered = useMemo(() => users.filter(u => (u.name + u.email).toLowerCase().includes(query.toLowerCase())), [users, query])
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const pageUsers = useMemo(() => filtered.slice((page-1)*pageSize, page*pageSize), [filtered, page])

  return (
    <div className="space-y-6">
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
        onSubmit={(userData) => {
          toast.success('Đã tạo người dùng', 'Người dùng mới đã được thêm vào danh sách')
        }}
      />

      {/* Filters */}
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

      <section className="bg-white border border-gray-200 rounded-2xl p-6">
        <div>
          <h3 className="text-base font-medium text-gray-900">Danh sách Người dùng</h3>
          <p className="text-sm text-[#717182] mt-1">Xem và quản lý tất cả người dùng trong hệ thống ({filtered.length} kết quả)</p>
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
                  <span className={`text-xs font-medium self-start px-2 py-0.5 rounded-md ${
                    u.role === 'Giáo vụ' ? 'bg-[#fef9c2] text-[#894b00]' :
                    u.role === 'Giảng viên' ? 'bg-[#dcfce7] text-[#016630]' :
                    u.role === 'Quản lý đào tạo' ? 'bg-[#dbeafe] text-[#193cb8]' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {u.role}
                  </span>
                  <p className="text-xs text-[#717182]">{u.center}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-900">{u.major}</p>
                  <p className="text-xs text-[#717182]">{u.exp}</p>
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium self-start px-2 py-0.5 rounded-md ${
                    u.status === 'Hoạt động' 
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
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={()=>{ setOpenMenuId(null); setOpenView(u) }}><Eye size={16}/> Xem chi tiết</button>
                          {can('users:update') && (
                            <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" onClick={()=>{ setOpenMenuId(null); setOpenEdit(u) }}><Pencil size={16}/> Chỉnh sửa</button>
                          )}
                          <button
                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                            onClick={()=>{
                              setOpenMenuId(null)
                              const action = u.status === 'Hoạt động' ? 'Vô hiệu hóa' : 'Kích hoạt'
                              if(confirm(`${action} ${u.name}?`)){
                                setUsers(prev=>prev.map(x=>x.id===u.id?{...x,status: u.status==='Hoạt động'?'Không hoạt động':'Hoạt động'}:x))
                                toast.success(`${action} thành công`)
                              }
                            }}
                          >
                            {u.status === 'Hoạt động' ? (<><ShieldOff size={16}/> Vô hiệu hóa</>) : (<><ShieldCheck size={16}/> Kích hoạt</>)}
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
          <button 
            disabled={page===1} 
            onClick={()=>setPage(p=>Math.max(1,p-1))} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg opacity-50 disabled:opacity-50"
          >
            <ChevronDown className="w-4 h-4 rotate-90" />
            <span>Previous</span>
          </button>
          <button 
            className={`w-9 h-9 flex items-center justify-center rounded-lg border ${page===1?'bg-white border-gray-200':'text-gray-900'}`} 
            onClick={()=>setPage(1)}
          >
            1
          </button>
          {totalPages>=2 && (
            <button 
              className={`w-9 h-9 flex items-center justify-center rounded-lg ${page===2?'bg-white border border-gray-200':'text-gray-900'}`} 
              onClick={()=>setPage(2)}
            >
              2
            </button>
          )}
          <button 
            disabled={page===totalPages} 
            onClick={()=>setPage(p=>Math.min(totalPages,p+1))} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg disabled:opacity-50"
          >
            <span>Next</span>
            <ChevronDown className="w-4 h-4 -rotate-90" />
          </button>
        </nav>
      </section>
      {/* View detail modal */}
      <Modal open={!!openView} onClose={()=>setOpenView(null)}>
        {openView && (
          <div>
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-medium">Thông tin người dùng</div>
              <button className="h-8 w-8 rounded hover:bg-gray-100" onClick={()=>setOpenView(null)}>×</button>
            </div>
            <div className="p-4 grid grid-cols-2 gap-4 text-sm">
              <div><div className="text-gray-500 text-xs">Họ tên</div><div>{openView.name}</div></div>
              <div><div className="text-gray-500 text-xs">Email</div><div>{openView.email}</div></div>
              <div><div className="text-gray-500 text-xs">SĐT</div><div>{openView.phone}</div></div>
              <div><div className="text-gray-500 text-xs">Vai trò</div><div>{openView.role}</div></div>
              <div><div className="text-gray-500 text-xs">Trung tâm</div><div>{openView.center}</div></div>
              <div><div className="text-gray-500 text-xs">Chuyên môn</div><div>{openView.major}</div></div>
              <div><div className="text-gray-500 text-xs">Kinh nghiệm</div><div>{openView.exp}</div></div>
              <div><div className="text-gray-500 text-xs">Trạng thái</div><div>{openView.status}</div></div>
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-end">
              <button className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={()=>setOpenView(null)}>Đóng</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit modal */}
      <Modal open={!!openEdit} onClose={()=>setOpenEdit(null)}>
        {openEdit && (
          <form
            onSubmit={(e)=>{
              e.preventDefault()
              const form = new FormData(e.currentTarget as HTMLFormElement)
              const updated: User = {
                ...openEdit,
                name: String(form.get('name')||openEdit.name),
                role: String(form.get('role')||openEdit.role),
                center: String(form.get('center')||openEdit.center),
                major: String(form.get('major')||openEdit.major),
                exp: String(form.get('exp')||openEdit.exp),
              }
              setUsers(prev=>prev.map(x=>x.id===updated.id?updated:x))
              setOpenEdit(null)
              toast.success('Đã lưu thay đổi')
            }}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <div className="font-medium">Chỉnh sửa người dùng</div>
              <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={()=>setOpenEdit(null)}>×</button>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Họ và tên</label>
                <input name="name" defaultValue={openEdit.name} className="w-full h-9 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Vai trò</label>
                <input name="role" defaultValue={openEdit.role} className="w-full h-9 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Trung tâm</label>
                <input name="center" defaultValue={openEdit.center} className="w-full h-9 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Chuyên môn</label>
                <input name="major" defaultValue={openEdit.major} className="w-full h-9 rounded-md border px-3 text-sm" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Kinh nghiệm</label>
                <input name="exp" defaultValue={openEdit.exp} className="w-full h-9 rounded-md border px-3 text-sm" />
              </div>
            </div>
            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
              <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={()=>setOpenEdit(null)}>Hủy</button>
              <button type="submit" className="h-9 px-3 rounded-md bg-gray-900 text-white hover:bg-black">Lưu thay đổi</button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}


