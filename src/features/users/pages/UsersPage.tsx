// src/features/users/pages/UsersPage.tsx
import { useEffect, useMemo, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
import { ShieldOff, ShieldCheck, MoreHorizontal, Plus, Search, ChevronDown, Eye, Pencil } from 'lucide-react'
import CreateUserModal from '../components/CreateUserModal'

import { listUserViews, getRoleStats } from '../../../shared/api/userViews'
import { getCentersLite } from '../../../shared/api/centers'
import { getRoles } from '../../../shared/api/roles'
import { createUser } from '../../../shared/api/users'

import type { UserViewDto, RoleCode } from '../../../shared/types/userView'
import type { CenterLiteDto } from '../../../shared/types/centers'
import type { RoleDto } from '../../../shared/types/role'

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
    const [openView, setOpenView] = useState<UserViewDto | null>(null)
    const [openEdit, setOpenEdit] = useState<UserViewDto | null>(null)
    const [query, setQuery] = useState('')
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)

    // dropdown data
    const [centers, setCenters] = useState<CenterLiteDto[]>([])
    const [roles, setRoles] = useState<RoleDto[]>([])

    // filters ('' = Tất cả)
    const [selectedCenterId, setSelectedCenterId] = useState<number | ''>('') // dùng center lite
    const [selectedRoleCode, setSelectedRoleCode] = useState<RoleCode | ''>('')

    // listing & stats
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [users, setUsers] = useState<UserViewDto[]>([])
    const [roleStats, setRoleStats] = useState<Record<string, number>>({})

    // client-side pagination (tạm)
    const [page, setPage] = useState(1)
    const pageSize = 5

    const toast = useToast()
    const { can } = usePermission()

    // Load dropdowns (roles, centers lite) 1 lần khi mount
    useEffect(() => {
        (async () => {
            try {
                const [r, c] = await Promise.all([getRoles(true), getCentersLite()])
                // Xử lý different data formats
                let rolesData = [];
                if (Array.isArray(r.data)) {
                    rolesData = r.data;
                } else if (r.data && typeof r.data === 'object') {
                    // Có thể data nằm trong property khác
                    const dataObj = r.data as any;
                    if (Array.isArray(dataObj.roles)) {
                        rolesData = dataObj.roles;
                    } else if (Array.isArray(dataObj.data)) {
                        rolesData = dataObj.data;
                    } else if (Array.isArray(dataObj.items)) {
                        rolesData = dataObj.items;
                    } else {
                        console.log('[DEBUG] Unknown data structure, keys:', Object.keys(dataObj));
                        rolesData = [];
                    }
                }

                const centersData = Array.isArray(c.data) ? c.data : []

                setRoles(rolesData)
                setCenters(centersData)
            } catch (e: any) {
                console.error('[DROPDOWN LOAD ERR]', e?.response?.status, e?.response?.data)
                toast.error('Lỗi', 'Không tải được danh sách vai trò/trung tâm')
            }
        })()
    }, [])

    // Fetch list (server-side filter) rồi áp thêm rule “phải có assignment ở center đã chọn”
    const fetchUsers = async () => {
        setLoading(true)
        setError(null)
        try {
            const params: { centerId?: number; roleCode?: string; q?: string } = {}
            if (selectedCenterId !== '') params.centerId = Number(selectedCenterId)
            if (selectedRoleCode !== '') params.roleCode = String(selectedRoleCode)
            if (query.trim()) params.q = query.trim()

            const res = await listUserViews(params)
            let data = Array.isArray(res.data) ? (res.data as UserViewDto[]) : []

            // BẢO ĐẢM: nếu đang lọc theo center, chỉ giữ user có assignment CENTER tại center đó
            if (selectedCenterId !== '') {
                const cid = Number(selectedCenterId)
                data = data.filter(u =>
                    u.assignments?.some(a => a.scope === 'CENTER' && a.centerId === cid)
                )
            }

            setUsers(data)
        } catch (e: any) {
            console.error('GET /api/user-views failed', {
                status: e?.response?.status,
                data: e?.response?.data,
                url: e?.config?.url,
            })
            setError(e?.response?.data?.message || 'Tải danh sách người dùng thất bại')
        } finally {
            setLoading(false)
        }
    }

    const fetchRoleStats = async () => {
        try {
            const params: { centerId?: number } = {}
            if (selectedCenterId !== '') params.centerId = Number(selectedCenterId)
            const res = await getRoleStats(params)
            setRoleStats((res.data as Record<string, number>) || {})
        } catch (e: any) {
            console.error('[ROLE STATS ERR]', e?.response?.status, e?.response?.data)
            // không chặn UI
        }
    }

    // gọi ngay khi mount & mỗi khi filter đổi
    useEffect(() => {
        fetchUsers()
        fetchRoleStats()
        setPage(1)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedCenterId, selectedRoleCode])

    // debounce search 300ms
    useEffect(() => {
        const t = setTimeout(() => {
            fetchUsers()
            fetchRoleStats()
            setPage(1)
        }, 300)
        return () => clearTimeout(t)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query])

    // client-side pagination tạm thời
    const totalPages = Math.max(1, Math.ceil(users.length / pageSize))
    const pageUsers = useMemo(
        () => users.slice((page - 1) * pageSize, page * pageSize),
        [users, page]
    )

    // Cards thống kê
    const totalActive = users.filter(u => u.active).length
    const lecturerCount = roleStats['LECTURER'] ?? 0
    const academicStaffCount = roleStats['ACADEMIC_STAFF'] ?? 0

    return (
        <div className="space-y-6">
            {/* Header + button */}
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

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Tổng Người dùng', value: String(users.length) },
                    { label: 'Đang hoạt động', value: String(totalActive) },
                    { label: 'Giảng viên', value: String(lecturerCount) },
                    { label: 'Giáo vụ', value: String(academicStaffCount) },
                ].map((s) => (
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
                        await createUser(payload)
                        toast.success('Đã tạo người dùng', 'Người dùng mới đã được thêm vào danh sách')
                        await fetchUsers()
                        await fetchRoleStats()
                    } catch (e: any) {
                        console.error('[CREATE USER ERR]', e?.response?.status, e?.response?.data)
                        const msg = e?.response?.data?.message || e?.message || 'Tạo người dùng thất bại (kiểm tra quyền & dữ liệu)'
                        toast.error('Lỗi', msg)
                    }
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

                {/* Center filter (lite, chỉ active centers) */}
                <div className="relative w-full sm:w-auto md:w-64">
                    <select
                        value={selectedCenterId}
                        onChange={(e) => setSelectedCenterId(e.target.value === '' ? '' : Number(e.target.value))}
                        className="appearance-none w-full bg-[#f3f3f5] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả trung tâm ({centers.length})</option>
                        {centers.map(c => (
                            <option key={c.centerId} value={c.centerId}>{c.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                </div>

                {/* Role filter */}
                <div className="relative w-full sm:w-auto md:w-64">
                    <select
                        value={selectedRoleCode}
                        onChange={(e) => setSelectedRoleCode(e.target.value as RoleCode | '')}
                        className="appearance-none w-full bg-[#f3f3f5] rounded-lg px-4 py-2 text-sm focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">Tất cả vai trò ({roles.length})</option>
                        {roles.map(r => (
                            <option key={r.roleId} value={r.code}>{r.name}</option>
                        ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none" />
                </div>
            </div>

            {/* Table */}
            <section className="bg-white border border-gray-200 rounded-2xl p-6">
                <div>
                    <h3 className="text-base font-medium text-gray-900">Danh sách Người dùng</h3>
                    <p className="text-sm text-[#717182] mt-1">
                        {loading ? 'Đang tải...' : error ? error : `Xem và quản lý tất cả người dùng trong hệ thống (${users.length} kết quả)`}
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
                        {pageUsers.map((u) => {
                            // danh sách badge ưu tiên assignment theo center filter (nếu có)
                            const cid = selectedCenterId === '' ? null : Number(selectedCenterId)
                            const centerAssignments = cid
                                ? u.assignments.filter(a => a.scope === 'CENTER' && a.centerId === cid)
                                : u.assignments

                            const badges = (centerAssignments.length > 0 ? centerAssignments : u.assignments).slice(0, 2)

                            return (
                                <div key={u.userId} className="grid grid-cols-12 gap-4 items-center px-6 py-4 border-b border-gray-200">
                                    {/* Thông tin cơ bản */}
                                    <div className="col-span-3">
                                        <p className="font-medium text-gray-900">{u.fullName}</p>
                                        <p className="text-[#717182]">{u.email}</p>
                                        <p className="text-[#717182]">{u.phone}</p>
                                    </div>

                                    {/* Vai trò & Trung tâm */}
                                    <div className="col-span-3 flex flex-col gap-1.5">
                                        {u.assignments.length === 0 ? (
                                            <span className="text-xs font-medium self-start px-2 py-0.5 rounded-md bg-gray-100 text-gray-600">—</span>
                                        ) : (
                                            <>
                                                {badges.map((a, i) => (
                                                    <span
                                                        key={`${u.userId}-${a.roleId}-${a.centerId ?? 'global'}-${i}`}
                                                        className="text-xs font-medium self-start px-2 py-0.5 rounded-md bg-gray-100 text-gray-700"
                                                        title={`${a.roleName} • ${a.scope === 'GLOBAL' ? 'Toàn hệ thống' : (a.centerName || '—')}`}
                                                    >
                                                        {a.roleName} • {a.scope === 'GLOBAL' ? 'Toàn hệ thống' : (a.centerName || '—')}
                                                    </span>
                                                ))}
                                                {(centerAssignments.length > 0 ? centerAssignments : u.assignments).length > 2 && (
                                                    <span className="text-xs text-[#717182]">
                                                        +{(centerAssignments.length > 0 ? centerAssignments : u.assignments).length - 2} vai trò nữa
                                                    </span>
                                                )}
                                            </>
                                        )}
                                    </div>

                                    {/* Chuyên môn */}
                                    <div className="col-span-2">
                                        <p className="text-gray-900">{u.specialty ?? '—'}</p>
                                    </div>

                                    {/* Trạng thái */}
                                    <div className="col-span-2">
                                        <span className={`text-xs font-medium self-start px-2 py-0.5 rounded-md ${u.active ? 'bg-[#dcfce7] text-[#016630]' : 'bg-[#f3f4f6] text-[#1e2939]'}`}>
                                            {u.active ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </div>

                                    {/* Menu */}
                                    <div className="col-span-2 flex justify-end">
                                        <div className="relative">
                                            <button
                                                className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                                                onClick={() => setOpenMenuId((prev) => (prev === u.userId ? null : u.userId))}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {openMenuId === u.userId && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                    <div className="absolute right-0 mt-2 w-52 rounded-lg border bg-white shadow-lg z-20">
                                                        <button
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={() => { setOpenMenuId(null); setOpenView(u) }}
                                                        >
                                                            <Eye size={16} /> Xem chi tiết
                                                        </button>
                                                        {can('users:update') && (
                                                            <button
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                                                onClick={() => { setOpenMenuId(null); setOpenEdit(u) }}
                                                            >
                                                                <Pencil size={16} /> Chỉnh sửa
                                                            </button>
                                                        )}
                                                        <button
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={() => {
                                                                setOpenMenuId(null)
                                                                const action = u.active ? 'Vô hiệu hóa' : 'Kích hoạt'
                                                                if (confirm(`${action} ${u.fullName}?`)) {
                                                                    // TODO: gọi API toggle active khi có
                                                                    setUsers(prev => prev.map(x => x.userId === u.userId ? { ...x, active: !u.active } : x))
                                                                    toast.success(`${action} thành công`)
                                                                }
                                                            }}
                                                        >
                                                            {u.active ? (<><ShieldOff size={16} /> Vô hiệu hóa</>) : (<><ShieldCheck size={16} /> Kích hoạt</>)}
                                                        </button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Pagination */}
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

                    {totalPages >= 2 && (
                        <button
                            className={`w-9 h-9 flex items-center justify-center rounded-lg ${page === 2 ? 'bg-white border border-gray-200' : 'text-gray-900'}`}
                            onClick={() => setPage(2)}
                        >
                            2
                        </button>
                    )}

                    <button
                        disabled={page === totalPages}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-lg disabled:opacity-50"
                    >
                        <span>Next</span>
                        <ChevronDown className="w-4 h-4 -rotate-90" />
                    </button>
                </nav>
            </section>

            {/* View modal */}
            <Modal open={!!openView} onClose={() => setOpenView(null)}>
                {openView && (
                    <div>
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="font-medium">Thông tin người dùng</div>
                            <button className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => setOpenView(null)}>×</button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                            <div><div className="text-gray-500 text-xs">Họ tên</div><div>{openView.fullName}</div></div>
                            <div><div className="text-gray-500 text-xs">Email</div><div>{openView.email}</div></div>
                            <div><div className="text-gray-500 text-xs">SĐT</div><div>{openView.phone}</div></div>
                            <div className="col-span-2">
                                <div className="text-gray-500 text-xs">Vai trò</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {openView.assignments.map((a, i) => (
                                        <span key={`${a.roleId}-${a.centerId ?? 'global'}-${i}`} className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                            {a.roleName} • {a.scope === 'GLOBAL' ? 'Toàn hệ thống' : (a.centerName || '—')}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div><div className="text-gray-500 text-xs">Chuyên môn</div><div>{openView.specialty ?? '—'}</div></div>
                            <div><div className="text-gray-500 text-xs">Trạng thái</div><div>{openView.active ? 'Hoạt động' : 'Không hoạt động'}</div></div>
                        </div>
                        <div className="px-4 py-3 border-t flex items-center justify-end">
                            <button className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenView(null)}>Đóng</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Edit modal (demo) */}
            <Modal open={!!openEdit} onClose={() => setOpenEdit(null)}>
                {openEdit && (
                    <form
                        onSubmit={(e) => {
                            e.preventDefault()
                            // TODO: gọi API update khi có
                            setOpenEdit(null)
                            toast.success('Đã lưu thay đổi (demo)')
                        }}
                    >
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="font-medium">Chỉnh sửa người dùng</div>
                            <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => setOpenEdit(null)}>×</button>
                        </div>
                        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Họ và tên</label>
                                <input defaultValue={openEdit.fullName} className="w-full h-9 rounded-md border px-3 text-sm" />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Chuyên môn</label>
                                <input defaultValue={openEdit.specialty ?? ''} className="w-full h-9 rounded-md border px-3 text-sm" />
                            </div>
                        </div>
                        <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                            <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenEdit(null)}>Hủy</button>
                            <button type="submit" className="h-9 px-3 rounded-md bg-gray-900 text-white hover:bg-black">Lưu thay đổi</button>
                        </div>
                    </form>
                )}
            </Modal>
        </div>
    )
}