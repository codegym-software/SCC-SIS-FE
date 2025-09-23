import React from 'react'

export default function DashboardPage() {
  const stats = [
    { label: 'Tổng số Trung tâm', value: '12', sub: '8 đang hoạt động' },
    { label: 'Người dùng đang hoạt động', value: '1,847', sub: '+12% so với tháng trước' },
    { label: 'Vai trò được định nghĩa', value: '8', sub: 'Giáo vụ, Giảng viên, Quản lý...' },
    { label: 'Hoạt động hôm nay', value: '342', sub: 'Đăng nhập trong 24h qua' },
  ]

  const activities = [
    { title: 'Tạo Trung tâm mới', desc: 'Trung tâm Hà Nội 3 đã được thêm vào hệ thống', time: '2 giờ trước', color: 'bg-sky-500' },
    { title: 'Thêm người dùng', desc: '15 giảng viên mới được thêm vào hệ thống', time: '4 giờ trước', color: 'bg-emerald-500' },
    { title: 'Cập nhật vai trò', desc: 'Gán quyền "Quản lý lớp học" cho vai trò Giảng viên', time: '6 giờ trước', color: 'bg-violet-500' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Tổng quan</h1>
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4">
            <div className="text-xs text-gray-500 mb-3">{s.label}</div>
            <div className="text-2xl font-semibold mb-1">{s.value}</div>
            <div className="text-xs text-gray-500">{s.sub}</div>
          </div>
        ))}
      </section>

      <section className="grid grid-cols-1 gap-4">
        <div className="rounded-lg border bg-white">
          <div className="px-4 py-3 border-b">
            <div className="font-medium text-sm">Hoạt động gần đây</div>
            <div className="text-xs text-gray-500">Các thay đổi và hoạt động mới nhất của bạn</div>
          </div>
          <div className="divide-y">
            {activities.map((a) => (
              <div key={a.title} className="flex items-start gap-3 px-4 py-4">
                <span className={`h-6 w-6 rounded-full ${a.color} inline-flex items-center justify-center text-white text-[10px] font-semibold`}>
                  ●
                </span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{a.title}</div>
                  <div className="text-xs text-gray-500">{a.desc}</div>
                </div>
                <div className="text-xs text-gray-400">{a.time}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}


