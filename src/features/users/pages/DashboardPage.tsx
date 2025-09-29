import { useState, useEffect } from 'react'
import { 
  Building2, Users, Shield, Activity, TrendingUp, TrendingDown, 
  UserPlus, Settings, BookOpen, Sparkles, Zap, Star
} from 'lucide-react'

export default function DashboardPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('7 ngày qua')
  const [isLoaded, setIsLoaded] = useState(false)
  
  useEffect(() => {
    setIsLoaded(true)
  }, [])
  
  const stats = [
    { 
      label: 'Tổng số Trung tâm', 
      value: '12', 
      sub: '8 đang hoạt động', 
      change: '+2 tháng này',
      changeType: 'positive',
      icon: Building2,
      iconColor: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      glowColor: 'shadow-blue-200'
    },
    { 
      label: 'Người dùng đang hoạt động', 
      value: '1,847', 
      sub: '+12% so với tháng trước', 
      change: '+156 tuần này',
      changeType: 'positive',
      icon: Users,
      iconColor: 'from-green-500 to-emerald-500',
      bgGradient: 'from-green-50 to-emerald-50',
      glowColor: 'shadow-green-200'
    },
    { 
      label: 'Vai trò được định nghĩa', 
      value: '8', 
      sub: 'Giáo vụ, Giảng viên, Quản lý...', 
      change: null,
      changeType: 'neutral',
      icon: Shield,
      iconColor: 'from-purple-500 to-violet-500',
      bgGradient: 'from-purple-50 to-violet-50',
      glowColor: 'shadow-purple-200'
    },
    { 
      label: 'Hoạt động hôm nay', 
      value: '342', 
      sub: 'Đăng nhập trong 24h qua', 
      change: '-8% so với hôm qua',
      changeType: 'negative',
      icon: Activity,
      iconColor: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      glowColor: 'shadow-orange-200'
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
    <div className={`space-y-8 transition-all duration-1000 ${isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      {/* Animated Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-purple-600/5 to-pink-600/5 rounded-2xl"></div>
        <div className="relative flex items-center justify-between p-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
                <Sparkles className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                  Tổng quan
                </h1>
                <p className="text-sm text-gray-600 mt-1 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="h-11 rounded-xl border-0 bg-white/80 backdrop-blur-sm px-4 text-sm font-medium shadow-lg ring-1 ring-gray-200/50 focus:ring-2 focus:ring-blue-500/20 focus:outline-none transition-all duration-200"
              >
                <option>7 ngày qua</option>
                <option>30 ngày qua</option>
                <option>3 tháng qua</option>
                <option>1 năm qua</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Modern Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, index) => {
          const IconComponent = s.icon
          return (
            <div 
              key={s.label} 
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${s.bgGradient} p-6 border border-white/20 backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:shadow-2xl ${s.glowColor} hover:shadow-xl`}
              style={{
                animationDelay: `${index * 100}ms`,
                animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none'
              }}
            >
              {/* Animated background pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-2xl"></div>
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/10 to-transparent rounded-full blur-xl"></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className="text-xs text-gray-600 font-semibold uppercase tracking-wide">{s.label}</div>
                  <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${s.iconColor} grid place-items-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <IconComponent size={18} />
                  </div>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2 group-hover:text-gray-800 transition-colors">{s.value}</div>
                <div className="text-sm text-gray-600 mb-4">{s.sub}</div>
                {s.change && (
                  <div className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-300 ${
                    s.changeType === 'positive' ? 'text-green-700 bg-green-100 hover:bg-green-200' :
                    s.changeType === 'negative' ? 'text-red-700 bg-red-100 hover:bg-red-200' :
                    'text-gray-700 bg-gray-100 hover:bg-gray-200'
                  }`}>
                    {s.changeType === 'positive' ? <TrendingUp size={12} /> : 
                     s.changeType === 'negative' ? <TrendingDown size={12} /> : null}
                    {s.change}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </section>

      {/* Modern Quick Actions */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/50 p-8 border border-gray-200/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-500" />
                Thao tác nhanh
              </h3>
              <p className="text-sm text-gray-600">Các chức năng thường dùng với hiệu ứng đẹp mắt</p>
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {quickActions.map((action, index) => {
              const IconComponent = action.icon
              return (
                <button
                  key={action.label}
                  className="group relative overflow-hidden flex flex-col items-center gap-4 p-6 rounded-2xl bg-white/80 backdrop-blur-sm border border-gray-200/50 hover:border-gray-300/50 hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                  style={{
                    animationDelay: `${index * 150}ms`,
                    animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                  }}
                >
                  {/* Hover effect background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className={`h-14 w-14 rounded-2xl ${action.color} grid place-items-center text-white group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                    <IconComponent size={24} />
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900 transition-colors">{action.label}</span>
                  
                  {/* Shine effect */}
                  <div className="absolute inset-0 -top-2 -left-2 w-8 h-8 bg-gradient-to-br from-white/60 to-transparent rounded-full opacity-0 group-hover:opacity-100 group-hover:animate-pulse transition-opacity duration-300"></div>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Modern Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activities */}
        <div className="lg:col-span-2 relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 border border-gray-200/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/3 via-purple-500/3 to-pink-500/3"></div>
          <div className="relative z-10">
            <div className="px-8 py-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Hoạt động gần đây
                  </h3>
                  <p className="text-sm text-gray-600">Các thay đổi và hoạt động mới nhất với hiệu ứng đẹp</p>
                </div>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-semibold px-4 py-2 rounded-lg hover:bg-blue-50 transition-all duration-200">
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100/50">
              {activities.map((a, index) => {
                const IconComponent = a.icon
                return (
                  <div 
                    key={a.title} 
                    className="group flex items-start gap-4 px-8 py-6 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white/50 transition-all duration-300 hover:shadow-sm"
                    style={{
                      animationDelay: `${index * 100}ms`,
                      animation: isLoaded ? 'fadeInLeft 0.6s ease-out forwards' : 'none'
                    }}
                  >
                    <div className={`h-12 w-12 rounded-2xl ${a.color} grid place-items-center text-white flex-shrink-0 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg`}>
                      <IconComponent size={20} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">{a.title}</div>
                      <div className="text-sm text-gray-600 mt-1">{a.desc}</div>
                    </div>
                    <div className="text-xs text-gray-500 flex-shrink-0 bg-gray-100 px-2 py-1 rounded-full">{a.time}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Modern Recent Users */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 border border-gray-200/50 backdrop-blur-sm">
          <div className="absolute inset-0 bg-gradient-to-b from-green-500/3 to-blue-500/3"></div>
          <div className="relative z-10">
            <div className="px-6 py-6 border-b border-gray-100/50">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Người dùng mới
                  </h3>
                  <p className="text-sm text-gray-600">Đăng ký gần đây với hiệu ứng đẹp</p>
                </div>
                <button className="text-sm text-green-600 hover:text-green-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-green-50 transition-all duration-200">
                  Xem tất cả
                </button>
              </div>
            </div>
            <div className="divide-y divide-gray-100/50">
              {recentUsers.map((user, index) => (
                <div 
                  key={index} 
                  className="group flex items-center gap-4 px-6 py-5 hover:bg-gradient-to-r hover:from-gray-50/50 hover:to-white/50 transition-all duration-300 hover:shadow-sm"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: isLoaded ? 'fadeInRight 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 text-white grid place-items-center text-sm font-bold group-hover:scale-110 transition-transform duration-300 shadow-lg">
                    {user.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">{user.name}</div>
                    <div className="text-xs text-gray-600 mt-1">{user.role} • {user.center}</div>
                  </div>
                  <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{user.time}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modern System Status */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-white to-gray-50/30 p-8 border border-gray-200/50 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 via-blue-500/5 to-purple-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
                Trạng thái hệ thống
              </h3>
              <p className="text-sm text-gray-600">Tình trạng hoạt động của các dịch vụ với hiệu ứng real-time</p>
            </div>
            <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-xl">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="font-semibold">Tất cả hoạt động bình thường</span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Building2, label: 'Trung tâm', status: 'Hoạt động bình thường', color: 'from-green-500 to-emerald-500' },
              { icon: Users, label: 'Người dùng', status: 'Hoạt động bình thường', color: 'from-blue-500 to-cyan-500' },
              { icon: BookOpen, label: 'Lớp học', status: 'Hoạt động bình thường', color: 'from-purple-500 to-violet-500' }
            ].map((service, index) => {
              const IconComponent = service.icon
              return (
                <div 
                  key={service.label}
                  className="group relative overflow-hidden flex items-center gap-4 p-6 rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200/50 hover:shadow-lg transition-all duration-300 hover:scale-105"
                  style={{
                    animationDelay: `${index * 200}ms`,
                    animation: isLoaded ? 'fadeInUp 0.6s ease-out forwards' : 'none'
                  }}
                >
                  <div className={`h-12 w-12 rounded-2xl bg-gradient-to-br ${service.color} grid place-items-center text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                    <IconComponent size={20} />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 group-hover:text-gray-800 transition-colors">{service.label}</div>
                    <div className="text-xs text-green-600 font-medium flex items-center gap-1 mt-1">
                      <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse"></div>
                      {service.status}
                    </div>
                  </div>
                  
                  {/* Animated pulse effect */}
                  <div className="absolute top-2 right-2 h-2 w-2 rounded-full bg-green-500 animate-ping opacity-75"></div>
                </div>
              )
            })}
          </div>
        </div>
      </section>
    </div>
  )
}


