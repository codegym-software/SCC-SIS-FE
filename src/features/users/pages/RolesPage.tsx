import React, { useMemo, useState } from 'react'
import { Shield, Users2, Settings, UserPlus } from 'lucide-react'

type Role = {
  id: string
  name: string
  desc: string
  permissions: string[]
  members: number
  status: 'Hoạt động' | 'Không hoạt động'
  createdAt: string
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

export default function RolesPage() {
  const [query, setQuery] = useState('')
  const [tab, setTab] = useState<'permissions' | 'roles' | 'assign'>('roles')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [assignQuery, setAssignQuery] = useState('')
  const [assignFilter, setAssignFilter] = useState('Tất cả vai trò')

  const PERMISSIONS: Record<string, string[]> = {
    'Trung tâm': ['centers.view', 'centers.create', 'centers.edit', 'centers.delete'],
    'Người dùng': ['users.view', 'users.create', 'users.edit', 'users.delete'],
    'Vai trò': ['roles.view', 'roles.create', 'roles.edit', 'roles.assign'],
    'Lớp học': ['classes.view', 'classes.create', 'classes.manage'],
  }
  const [roles, setRoles] = useState<Role[]>([
    { id: '1', name: 'Giáo vụ', desc: 'Quản trị học vụ và lớp học', permissions: ['classes.view','users.view','users.edit','centers.view','roles.view'], members: 15, status: 'Hoạt động', createdAt: '2024-01-10' },
    { id: '2', name: 'Giảng viên', desc: 'Quản lý nội dung và điểm danh', permissions: ['classes.view','classes.manage'], members: 45, status: 'Hoạt động', createdAt: '2024-01-10' },
    { id: '3', name: 'Trưởng phòng', desc: 'Quản lý bộ phận và nhân sự', permissions: ['roles.view','roles.edit','users.view','users.edit','centers.view'], members: 8, status: 'Hoạt động', createdAt: '2024-01-10' },
    { id: '4', name: 'Quản lý trung tâm', desc: 'Quản lý toàn bộ hoạt động tại trung tâm', permissions: ['centers.view','centers.create','centers.edit','centers.delete','users.view','users.create','users.edit','users.delete','classes.view','classes.create','classes.manage'], members: 3, status: 'Hoạt động', createdAt: '2024-01-10' },
  ])
  const [openCreate, setOpenCreate] = useState(false)
  const [openEdit, setOpenEdit] = useState<Role | null>(null)
  const [openDelete, setOpenDelete] = useState<Role | null>(null)

  const stats = useMemo(() => ([
    { label: 'Tổng vai trò', value: String(roles.length) },
    { label: 'Đang hoạt động', value: String(roles.filter(r=>r.status==='Hoạt động').length) },
    { label: 'Tổng quyền', value: String(roles.reduce((s,r)=> s + r.permissions.length, 0)) },
    { label: 'Nhóm quyền', value: '12' },
  ]), [roles])

  const filtered = useMemo(() => roles.filter(r => r.name.toLowerCase().includes(query.toLowerCase())), [roles, query])

  type Assignment = { id: string; user: string; email: string; role: string; center: string; date: string; by: string }
  const [assignments] = useState<Assignment[]>([
    { id: 'a1', user: 'Nguyễn Văn An', email: 'an.nguyen@education.vn', role: 'Giáo vụ', center: 'Trung tâm Hà Nội 1', date: '2024-01-15', by: 'Super Admin' },
    { id: 'a2', user: 'Trần Thị Bình', email: 'binh.tran@education.vn', role: 'Giảng viên', center: 'Trung tâm Hà Nội 1', date: '2024-02-01', by: 'Nguyễn Văn An' },
    { id: 'a3', user: 'Lê Văn Chinh', email: 'chinh.le@education.vn', role: 'Trưởng phòng', center: 'Trung tâm TP.HCM 1', date: '2024-01-20', by: 'Super Admin' },
  ])
  const filteredAssignments = useMemo(() => assignments.filter(a => {
    const matchesText = (a.user + a.email).toLowerCase().includes(assignQuery.toLowerCase())
    const matchesRole = assignFilter === 'Tất cả vai trò' || a.role === assignFilter
    return matchesText && matchesRole
  }), [assignments, assignQuery, assignFilter])

  function CreateEditForm({ editing }: { editing?: Role | null }) {
    const [errors, setErrors] = useState<{name?: string; permissions?: string}>({})
    const [selected, setSelected] = useState<Set<string>>(new Set(editing?.permissions || []))
    function togglePermission(key: string) {
      setSelected(prev => {
        const next = new Set(prev)
        if (next.has(key)) next.delete(key); else next.add(key)
        return next
      })
    }
    return (
      <form
        onSubmit={(e)=>{
          e.preventDefault()
          const form = new FormData(e.currentTarget as HTMLFormElement)
          const payload: Role = {
            id: editing?.id ?? String(Date.now()),
            name: String(form.get('name')||''),
            desc: String(form.get('desc')||''),
            permissions: Array.from(selected),
            members: editing?.members ?? 0,
            status: (String(form.get('status')||'Hoạt động') as Role['status']),
            createdAt: editing?.createdAt ?? new Date().toISOString().slice(0,10)
          }
          // validations
          const newErrors: typeof errors = {}
          if (!payload.name || payload.name.trim().length < 3) newErrors.name = 'Tên vai trò tối thiểu 3 ký tự'
          const nameExists = roles.some(r=> r.name.toLowerCase() === payload.name.toLowerCase() && r.id !== editing?.id)
          if (nameExists) newErrors.name = 'Tên vai trò đã tồn tại'
          if (payload.permissions.length === 0) newErrors.permissions = 'Chọn ít nhất 1 quyền'
          setErrors(newErrors)
          if (Object.keys(newErrors).length > 0) return
          setRoles(prev => editing ? prev.map(x=>x.id===editing.id? payload : x) : [payload, ...prev])
          editing ? setOpenEdit(null) : setOpenCreate(false)
        }}
      >
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-medium">{editing ? 'Chỉnh sửa vai trò' : 'Tạo vai trò mới'}</div>
          <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={()=> editing ? setOpenEdit(null) : setOpenCreate(false)}>×</button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tên vai trò *</label>
            <input name="name" defaultValue={editing?.name} className={`w-full h-9 rounded-md border px-3 text-sm ${errors.name?'border-red-500':''}`} placeholder="Giáo vụ" />
            {errors.name && <div className="text-xs text-red-600 mt-1">{errors.name}</div>}
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
            <select name="status" defaultValue={editing?.status ?? 'Hoạt động'} className="w-full h-9 rounded-md border px-2 text-sm">
              <option>Hoạt động</option>
              <option>Không hoạt động</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
            <input name="desc" defaultValue={editing?.desc} className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Mô tả vai trò" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-2">Phân quyền</label>
            {Object.entries(PERMISSIONS).map(([group, items])=>{
              const count = items.filter(k=>selected.has(k)).length
              return (
                <div key={group} className="mb-3 rounded-xl border border-gray-200">
                  <div className="px-3 py-2 text-sm font-medium flex items-center justify-between">
                    <span>{group}</span>
                    <span className="text-xs text-gray-500">{count}/{items.length}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 p-3">
                    {items.map(key=> (
                      <label key={key} className={`rounded-lg border ${selected.has(key)?'border-indigo-500 ring-2 ring-indigo-100':'border-gray-200'} bg-white p-3 flex items-start gap-2 cursor-pointer`}>
                        <input type="checkbox" className="mt-0.5" checked={selected.has(key)} onChange={()=>togglePermission(key)} />
                        <div>
                          <div className="text-sm font-medium">{key}</div>
                          <div className="text-xs text-gray-500">Mô tả quyền {key}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )
            })}
            {errors.permissions && <div className="text-xs text-red-600 mt-1">{errors.permissions}</div>}
          </div>
        </div>
        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
          <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={()=> editing ? setOpenEdit(null) : setOpenCreate(false)}>Hủy</button>
          <button type="submit" className="h-9 px-3 rounded-md bg-indigo-600 text-white hover:bg-indigo-700">{editing ? 'Lưu thay đổi' : 'Tạo vai trò'}</button>
        </div>
      </form>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-white">
            <Shield size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Vai trò & Phân quyền</h1>
            <p className="text-xs text-gray-500">Tạo, chỉnh sửa vai trò và gán quyền trong hệ thống</p>
          </div>
        </div>
        {/* Nút tạo vai trò mới ở header đã bỏ để tránh trùng lặp */}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="text-xs text-gray-500 mb-3">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4">
        <button onClick={()=>setTab('permissions')} className={`px-4 h-9 rounded-full text-sm inline-flex items-center gap-2 ${tab==='permissions'?'bg-gray-900 text-white':'bg-white border'}`}><Settings size={14}/> Quyền hạn</button>
        <button onClick={()=>setTab('roles')} className={`px-4 h-9 rounded-full text-sm inline-flex items-center gap-2 ${tab==='roles'?'bg-gray-900 text-white':'bg-white border'}`}><Shield size={14}/> Vai trò</button>
        <button onClick={()=>setTab('assign')} className={`px-4 h-9 rounded-full text-sm inline-flex items-center gap-2 ${tab==='assign'?'bg-gray-900 text-white':'bg-white border'}`}><Users2 size={14}/> Phân quyền</button>
      </div>

      {/* Top action button removed per request */}

      {/* Roles tab content */}
      {tab==='roles' && (
      <section className="rounded-2xl border border-gray-200 bg-white">
        {/* Header card */}
        <div className="px-3 py-3 border-b flex items-start gap-2">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0">
            <Shield size={16} />
          </div>
          <div>
            <div className="text-sm font-medium">Danh sách Vai trò</div>
            <div className="text-xs text-gray-500">Xem và quản lý tất cả các vai trò trong hệ thống ( {roles.length} vai trò )</div>
          </div>
          <div className="ml-auto">
            <button onClick={()=>setOpenCreate(true)} className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 text-white text-xs px-2.5 py-1.5 hover:bg-indigo-700">
              <UserPlus size={16}/> <span>Tạo vai trò mới</span>
            </button>
          </div>
        </div>
        <div className="px-3 py-2 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 w-full md:max-w-xl">
            <input
              value={query}
              onChange={(e)=>setQuery(e.target.value)}
              className="flex-1 h-8 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Tìm theo tên vai trò..."
            />
            <select className="h-8 rounded-md border px-2 text-sm">
              <option>Tất cả trạng thái</option>
              <option>Hoạt động</option>
              <option>Không hoạt động</option>
            </select>
          </div>
        </div>

        {/* Header columns */}
        <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
          <div className="col-span-4">Vai trò</div>
          <div className="col-span-4">Quyền hạn</div>
          <div className="col-span-2">Người dùng</div>
          <div className="col-span-2">Ngày tạo</div>
        </div>
        <div className="divide-y">
          {filtered.map((r) => (
            <div key={r.id} className="px-3 py-3 pr-12 grid grid-cols-12 gap-3 items-center border-t first:border-t-0 relative">
                <div className="col-span-12 md:col-span-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 grid place-items-center text-white flex-shrink-0">
                      <Shield size={16} />
                    </div>
                    <div>
                      <div className="text-sm font-medium">{r.name}</div>
                      <div className="text-xs text-gray-500">{r.desc}</div>
                    </div>
                  </div>
                </div>
                <div className="col-span-12 md:col-span-4">
                  <div className="flex flex-wrap gap-1.5">
                  {r.permissions.slice(0,4).map((p) => (
                    <span key={p} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 text-[11px]">{p}</span>
                  ))}
                  {r.permissions.length>4 && (
                    <span className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-[11px]">+{r.permissions.length-4} khác</span>
                  )}
                  </div>
                  <div className="text-[11px] text-gray-500 mt-1">Tổng: {r.permissions.length} quyền</div>
                </div>
                <div className="col-span-6 md:col-span-2 text-sm flex items-center gap-1">
                  <Users2 size={14} className="text-gray-500"/> {r.members}
                </div>
                <div className="col-span-6 md:col-span-2 text-sm text-gray-700">{new Date(r.createdAt).toLocaleDateString('vi-VN')}</div>
                {/* Actions aligned to far right without taking grid width */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 z-50">
                  <div className="relative z-50">
                    <button className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center" onClick={()=> setOpenMenuId(prev=> prev===r.id? null : r.id)}>⋯</button>
                    {openMenuId===r.id && (
                      <>
                        <div className="fixed inset-0 z-40" onClick={()=>setOpenMenuId(null)} />
                        <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg z-50">
                          <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{ setOpenMenuId(null); setOpenEdit(r)}}>Chỉnh sửa</button>
                          <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={()=>{ setOpenMenuId(null); setOpenDelete(r)}}>Xóa vai trò</button>
                        </div>
                      </>
                    )}
                  </div>
                </div>
            </div>
          ))}
        </div>
      </section>
      )}

      {/* Permissions tab content */}
      {tab==='permissions' && (
        <section className="rounded-2xl border border-gray-200 bg-white">
          <div className="px-3 py-3 border-b flex items-start gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0">
              <Shield size={16} />
            </div>
            <div>
              <div className="text-sm font-medium">Danh sách Quyền hạn</div>
              <div className="text-xs text-gray-500">Tất cả các quyền có thể được cấp trong hệ thống ({Object.values(PERMISSIONS).reduce((s,a)=>s+a.length,0)} quyền)</div>
            </div>
          </div>

          {/* Permission groups */}
          <div className="p-3 space-y-6">
            {Object.entries(PERMISSIONS).map(([group, items])=> (
              <div key={group}>
                <div className="text-sm font-medium mb-2">{group}</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {items.map((key)=> (
                    <div key={key} className="rounded-xl border border-gray-200">
                      <div className="px-3 py-3 flex items-start gap-2">
                        <div className="h-7 w-7 rounded-lg bg-blue-50 text-blue-600 grid place-items-center flex-shrink-0">
                          <Shield size={14}/>
                        </div>
                        <div>
                          <div className="text-sm font-medium">{key}</div>
                          <div className="text-xs text-gray-500">Mô tả quyền {key}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Assign tab content */}
      {tab==='assign' && (
        <section className="rounded-2xl border border-gray-200 bg-white">
          <div className="px-3 py-3 border-b flex items-start gap-2">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-500 grid place-items-center text-white flex-shrink-0">
              <Users2 size={16} />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">Phân quyền Người dùng</div>
              <div className="text-xs text-gray-500">Quản lý vai trò được gán cho từng người dùng</div>
            </div>
            <button className="inline-flex items-center gap-2 rounded-md bg-emerald-600 text-white text-sm px-3 py-2 hover:bg-emerald-700">Gán vai trò</button>
          </div>
          <div className="px-3 py-2 border-b flex items-center gap-2">
            <input value={assignQuery} onChange={(e)=>setAssignQuery(e.target.value)} className="flex-1 h-8 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200" placeholder="Tìm kiếm theo tên hoặc email..." />
            <select className="h-8 rounded-md border px-2 text-sm" value={assignFilter} onChange={(e)=>setAssignFilter(e.target.value)}>
              <option>Tất cả vai trò</option>
              <option>Giáo vụ</option>
              <option>Giảng viên</option>
              <option>Trưởng phòng</option>
            </select>
          </div>
          <div className="p-3">
            <div className="rounded-xl border border-gray-200">
              <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
                <div className="col-span-4">Người dùng</div>
                <div className="col-span-2">Vai trò</div>
                <div className="col-span-3">Trung tâm</div>
                <div className="col-span-1">Ngày gán</div>
                <div className="col-span-1">Được gán bởi</div>
                <div className="col-span-1"></div>
              </div>
              <div className="divide-y">
                {filteredAssignments.map(a => (
                  <div key={a.id} className="px-3 py-3 grid grid-cols-12 gap-3 items-center relative">
                    <div className="col-span-4 flex items-center gap-3">
                      <div className="h-8 w-8 rounded-xl bg-indigo-50 text-indigo-700 grid place-items-center">{a.user.split(' ').pop()?.[0]}</div>
                      <div>
                        <div className="text-sm font-medium">{a.user}</div>
                        <div className="text-xs text-gray-500">{a.email}</div>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 border border-purple-100 text-[11px]">{a.role}</span>
                    </div>
                    <div className="col-span-3 text-sm">{a.center}</div>
                    <div className="col-span-1 text-sm">{new Date(a.date).toLocaleDateString('vi-VN')}</div>
                    <div className="col-span-1 text-sm">{a.by}</div>
                    <div className="col-span-1 flex justify-end">
                      <div className="relative z-50">
                        <button className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center" onClick={()=> setOpenMenuId(prev=> prev===a.id? null : a.id)}>⋯</button>
                        {openMenuId===a.id && (
                          <>
                            <div className="fixed inset-0 z-40" onClick={()=>setOpenMenuId(null)} />
                            <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg z-50">
                              <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50" onClick={()=>{ setOpenMenuId(null)}}>Chỉnh sửa</button>
                              <button className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50" onClick={()=>{ setOpenMenuId(null)}}>Hủy gán</button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Create */}
      <Modal open={openCreate} onClose={()=>setOpenCreate(false)}>
        <CreateEditForm />
      </Modal>

      {/* Edit */}
      <Modal open={!!openEdit} onClose={()=>setOpenEdit(null)}>
        {openEdit && <CreateEditForm editing={openEdit} />}
      </Modal>

      {/* Delete confirm */}
      <Modal open={!!openDelete} onClose={()=>setOpenDelete(null)}>
        {openDelete && (
          <div>
            <div className="px-4 py-3 border-b font-medium">Xóa vai trò</div>
            <div className="p-4 text-sm">Bạn có chắc muốn xóa vai trò “{openDelete.name}”?</div>
            <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
              <button className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={()=>setOpenDelete(null)}>Hủy</button>
              <button className="h-9 px-3 rounded-md bg-red-600 text-white hover:bg-red-700" onClick={()=>{ setRoles(prev=>prev.filter(x=>x.id!==openDelete.id)); setOpenDelete(null) }}>Xóa</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}


