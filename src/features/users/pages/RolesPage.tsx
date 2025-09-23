import React from 'react'

export default function RolesPage() {
  const stats = [
    { label: 'Tổng vai trò', value: '8' },
    { label: 'Đang hoạt động', value: '6' },
    { label: 'Tổng quyền', value: '42' },
    { label: 'Nhóm quyền', value: '12' },
  ]

  const roles = [
    {
      name: 'Giáo vụ',
      desc: 'Quản trị học vụ và lớp học',
      permissions: ['Quản lý lớp học', 'Quản lý người dùng', 'Xem báo cáo'],
      members: 12,
      status: 'Hoạt động',
    },
    {
      name: 'Giảng viên',
      desc: 'Quản lý nội dung và điểm danh',
      permissions: ['Điểm danh', 'Quản lý chương trình', 'Nhập điểm'],
      members: 45,
      status: 'Hoạt động',
    },
    {
      name: 'Quản lý đào tạo',
      desc: 'Xây dựng chương trình và phân công',
      permissions: ['Quản lý chương trình', 'Phân quyền', 'Xem báo cáo'],
      members: 6,
      status: 'Hoạt động',
    },
    {
      name: 'Trợ giảng',
      desc: 'Hỗ trợ giảng dạy và học viên',
      permissions: ['Điểm danh', 'Xem lớp học'],
      members: 14,
      status: 'Không hoạt động',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Quản lý Vai trò & Phân quyền</h1>
          <p className="text-xs text-gray-500">Tạo, chỉnh sửa vai trò và gán quyền trong hệ thống</p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black">
          <span>+ Tạo vai trò mới</span>
        </button>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4">
            <div className="text-xs text-gray-500 mb-3">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      <section className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex gap-2 w-full md:max-w-xl">
            <input
              className="flex-1 h-9 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
              placeholder="Tìm theo tên vai trò..."
            />
            <select className="h-9 rounded-md border px-2 text-sm">
              <option>Tất cả trạng thái</option>
              <option>Hoạt động</option>
              <option>Không hoạt động</option>
            </select>
          </div>
        </div>

        <div className="divide-y">
          <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs text-gray-500">
            <div className="col-span-4">Vai trò</div>
            <div className="col-span-4">Quyền</div>
            <div className="col-span-2">Thành viên</div>
            <div className="col-span-2 text-right">Trạng thái</div>
          </div>

          {roles.map((r) => (
            <div key={r.name} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
              <div className="col-span-12 md:col-span-4">
                <div className="text-sm font-medium">{r.name}</div>
                <div className="text-xs text-gray-500">{r.desc}</div>
              </div>
              <div className="col-span-12 md:col-span-4 flex flex-wrap gap-1">
                {r.permissions.map((p) => (
                  <span key={p} className="px-2 py-1 rounded-full bg-gray-100 text-gray-700 text-xs">
                    {p}
                  </span>
                ))}
              </div>
              <div className="col-span-6 md:col-span-2 text-sm">{r.members}</div>
              <div className="col-span-6 md:col-span-2 text-right">
                <span
                  className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${
                    r.status === 'Hoạt động'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {r.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-500">Hiển thị 1–4 trong 8 vai trò</div>
          <div className="flex items-center gap-1">
            <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50">Previous</button>
            <button className="h-8 px-3 rounded-md border bg-gray-900 text-white">1</button>
            <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50">2</button>
            <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50">Next</button>
          </div>
        </div>
      </section>
    </div>
  )
}


