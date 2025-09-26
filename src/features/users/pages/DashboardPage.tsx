import { useState } from 'react'
import { 
  Building2, Users, Shield, Activity, TrendingUp, TrendingDown, 
  UserPlus, Settings, BookOpen
} from 'lucide-react'

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7 ngày qua')
  
  const stats = [
    { 
      label: 'Tổng số Trung tâm', 
      value: '12', 
      sub: '8 đang hoạt động', 
      change: '+2 tháng này',
      changeType: 'positive',
      icon: Building2,
      iconColor: 'from-blue-500 to-cyan-500'
    },
    { 
      label: 'Người dùng đang hoạt động', 
      value: '1,847', 
      sub: '+12% so với tháng trước', 
      change: '+156 tuần này',
      changeType: 'positive',
      icon: Users,
      iconColor: 'from-green-500 to-emerald-500'
    },
    { 
      label: 'Vai trò được định nghĩa', 
      value: '8', 
      sub: 'Giáo vụ, Giảng viên, Quản lý...', 
      change: null,
      changeType: 'neutral',
      icon: Shield,
      iconColor: 'from-purple-500 to-violet-500'
    },
    { 
      label: 'Hoạt động hôm nay', 
      value: '342', 
      sub: 'Đăng nhập trong 24h qua', 
      change: '-8% so với hôm qua',
      changeType: 'negative',
      icon: Activity,
      iconColor: 'from-orange-500 to-amber-500'
    },
  ]

  const activities = [
    { 
      title: 'Tạo Trung tâm mới', 
      desc: 'Trung tâm Hà Nội 3 đã được thêm vào hệ thống', 
      time: '2 giờ trước', 
      color: 'bg-sky-500',
      icon: Building2,
      type: 'center'
    },
    { 
      title: 'Thêm người dùng', 
      desc: '15 giảng viên mới được thêm vào hệ thống', 
      time: '4 giờ trước', 
      color: 'bg-emerald-500',
      icon: UserPlus,
      type: 'user'
    },
    { 
      title: 'Cập nhật vai trò', 
      desc: 'Gán quyền "Quản lý lớp học" cho vai trò Giảng viên', 
      time: '6 giờ trước', 
      color: 'bg-violet-500',
      icon: Settings,
      type: 'role'
    },
    { 
      title: 'Tạo lớp học mới', 
      desc: 'Lớp "Lập trình Java Cơ bản - K15" đã được tạo', 
      time: '8 giờ trước', 
      color: 'bg-blue-500',
      icon: BookOpen,
      type: 'class'
    },
  ]

  const quickActions = [
    { label: 'Tạo Trung tâm mới', icon: Building2, color: 'bg-blue-500', href: '/centers' },
    { label: 'Thêm Người dùng', icon: UserPlus, color: 'bg-green-500', href: '/users' },
    { label: 'Quản lý Vai trò', icon: Shield, color: 'bg-purple-500', href: '/roles' },
    { label: 'Tạo Lớp học', icon: BookOpen, color: 'bg-orange-500', href: '/classes' },
  ]

  const recentUsers = [
    { name: 'Nguyễn Văn A', role: 'Giảng viên', center: 'Trung tâm Hà Nội', time: '5 phút trước', avatar: 'N' },
    { name: 'Trần Thị B', role: 'Giáo vụ', center: 'Trung tâm TP.HCM', time: '12 phút trước', avatar: 'T' },
    { name: 'Lê Văn C', role: 'Quản lý', center: 'Trung tâm Đà Nẵng', time: '1 giờ trước', avatar: 'L' },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tổng quan</h1>
          <p className="text-sm text-gray-500 mt-1">Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn</p>
        </div>
        <div className="flex items-center gap-2">
          <select 
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="h-9 rounded-md border px-3 text-sm bg-white"
          >
            <option>7 ngày qua</option>
            <option>30 ngày qua</option>
            <option>3 tháng qua</option>
            <option>1 năm qua</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s) => {
          const IconComponent = s.icon
          return (
            <div key={s.label} className="rounded-xl border border-gray-200 bg-white p-6 relative overflow-hidden">
              <div className="flex items-start justify-between mb-4">
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
                <div className={`h-8 w-8 rounded-lg bg-gradient-to-br ${s.iconColor} grid place-items-center text-white`}>
                  <IconComponent size={16} />
                </div>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-2">{s.value}</div>
              <div className="text-sm text-gray-600 mb-3">{s.sub}</div>
              {s.change && (
                <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                  s.changeType === 'positive' ? 'text-green-700 bg-green-50' :
                  s.changeType === 'negative' ? 'text-red-700 bg-red-50' :
                  'text-gray-700 bg-gray-50'
                }`}>
                  {s.changeType === 'positive' ? <TrendingUp size={12} /> : 
                   s.changeType === 'negative' ? <TrendingDown size={12} /> : null}
                  {s.change}
                </div>
              )}
            </div>
          )
        })}
      </section>

      {/* Quick Actions */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Thao tác nhanh</h3>
            <p className="text-sm text-gray-500">Các chức năng thường dùng</p>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const IconComponent = action.icon
            return (
              <button
                key={action.label}
                className="flex flex-col items-center gap-3 p-4 rounded-lg border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 group"
              >
                <div className={`h-12 w-12 rounded-xl ${action.color} grid place-items-center text-white group-hover:scale-105 transition-transform`}>
                  <IconComponent size={20} />
                </div>
                <span className="text-sm font-medium text-gray-700">{action.label}</span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities */}
        <div className="lg:col-span-2 rounded-xl border border-gray-200 bg-white">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Hoạt động gần đây</h3>
                <p className="text-sm text-gray-500">Các thay đổi và hoạt động mới nhất</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {activities.map((a) => {
              const IconComponent = a.icon
              return (
                <div key={a.title} className="flex items-start gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className={`h-10 w-10 rounded-xl ${a.color} grid place-items-center text-white flex-shrink-0`}>
                    <IconComponent size={18} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-gray-900">{a.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{a.desc}</div>
                  </div>
                  <div className="text-xs text-gray-400 flex-shrink-0">{a.time}</div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Recent Users */}
        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Người dùng mới</h3>
                <p className="text-sm text-gray-500">Đăng ký gần đây</p>
              </div>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">Xem tất cả</button>
            </div>
          </div>
          <div className="divide-y divide-gray-100">
            {recentUsers.map((user, index) => (
              <div key={index} className="flex items-center gap-3 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 grid place-items-center text-sm font-medium">
                  {user.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.role} • {user.center}</div>
                </div>
                <div className="text-xs text-gray-400">{user.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Status */}
      <section className="rounded-xl border border-gray-200 bg-white p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Trạng thái hệ thống</h3>
            <p className="text-sm text-gray-500">Tình trạng hoạt động của các dịch vụ</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-600">
            <div className="h-2 w-2 rounded-full bg-green-500"></div>
            Tất cả hoạt động bình thường
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
            <div className="h-8 w-8 rounded-lg bg-green-500 grid place-items-center text-white">
              <Building2 size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Trung tâm</div>
              <div className="text-xs text-green-600">Hoạt động bình thường</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
            <div className="h-8 w-8 rounded-lg bg-green-500 grid place-items-center text-white">
              <Users size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Người dùng</div>
              <div className="text-xs text-green-600">Hoạt động bình thường</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-green-50">
            <div className="h-8 w-8 rounded-lg bg-green-500 grid place-items-center text-white">
              <BookOpen size={16} />
            </div>
            <div>
              <div className="text-sm font-medium text-gray-900">Lớp học</div>
              <div className="text-xs text-green-600">Hoạt động bình thường</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}


