import React, { useState, useEffect } from 'react'
import { User, Lock, Bell, Monitor, Shield, Save, Phone, Mail, User2, Eye, EyeOff, Check, Settings } from 'lucide-react'

type TabType = 'profile' | 'security' | 'notifications' | 'appearance' | 'privacy'

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('profile')

  const [formData, setFormData] = useState({
    fullName: 'Nguyễn Văn Admin',
    email: 'admin@education.edu.vn',
    phone: '',
    bio: ''
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    classReminders: true,
    assignmentDeadlines: true,
    systemUpdates: false
  })

  const [appearanceSettings, setAppearanceSettings] = useState({
    theme: 'light',
    fontSize: 'medium'
  })

  // Load settings from localStorage on component mount
  useEffect(() => {
    // Load appearance settings
    const savedAppearance = localStorage.getItem('appearanceSettings')
    if (savedAppearance) {
      const parsed = JSON.parse(savedAppearance)
      setAppearanceSettings(parsed)
      
      // Apply saved settings
      if (parsed.theme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      
      const fontSizeMap = {
        small: '14px',
        medium: '16px',
        large: '18px'
      }
      document.documentElement.style.fontSize = fontSizeMap[parsed.fontSize as keyof typeof fontSizeMap]
    }

    // Load notification settings
    const savedNotifications = localStorage.getItem('notificationSettings')
    if (savedNotifications) {
      const parsed = JSON.parse(savedNotifications)
      setNotificationSettings(parsed)
    }

    // Load profile data
    const savedProfile = localStorage.getItem('profileData')
    if (savedProfile) {
      const parsed = JSON.parse(savedProfile)
      setFormData(parsed)
    }
  }, [])

  const tabs = [
    { id: 'profile' as TabType, label: 'Hồ sơ', icon: User },
    { id: 'security' as TabType, label: 'Bảo mật', icon: Lock },
    { id: 'notifications' as TabType, label: 'Thông báo', icon: Bell },
    { id: 'appearance' as TabType, label: 'Giao diện', icon: Monitor },
    { id: 'privacy' as TabType, label: 'Riêng tư', icon: Shield },
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordData(prev => ({ ...prev, [field]: value }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }))
  }

  const toggleNotification = (setting: keyof typeof notificationSettings) => {
    setNotificationSettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }))
  }

  const handleSave = () => {
    // Validate form data
    if (!formData.fullName.trim()) {
      alert('Vui lòng nhập họ và tên')
      return
    }
    if (!formData.email.trim()) {
      alert('Vui lòng nhập email')
      return
    }
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      alert('Email không hợp lệ')
      return
    }
    
    // Save to localStorage
    localStorage.setItem('profileData', JSON.stringify(formData))
    
    // Simulate API call
    console.log('Saving profile data:', formData)
    alert('Đã lưu thông tin cá nhân thành công!')
  }

  const handlePasswordUpdate = () => {
    // Validate password data
    if (!passwordData.currentPassword.trim()) {
      alert('Vui lòng nhập mật khẩu hiện tại')
      return
    }
    if (!passwordData.newPassword.trim()) {
      alert('Vui lòng nhập mật khẩu mới')
      return
    }
    if (passwordData.newPassword.length < 8) {
      alert('Mật khẩu mới phải có ít nhất 8 ký tự')
      return
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      alert('Mật khẩu xác nhận không khớp')
      return
    }
    
    // Simulate API call
    console.log('Updating password:', passwordData)
    alert('Đã cập nhật mật khẩu thành công!')
    
    // Clear password fields
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }

  const handleSaveNotifications = () => {
    // Save to localStorage
    localStorage.setItem('notificationSettings', JSON.stringify(notificationSettings))
    
    // Simulate API call
    console.log('Saving notification settings:', notificationSettings)
    alert('Đã lưu cài đặt thông báo thành công!')
  }

  const handleAppearanceChange = (field: keyof typeof appearanceSettings, value: string) => {
    setAppearanceSettings(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleApplyAppearance = () => {
    // Apply theme changes
    if (appearanceSettings.theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    // Apply font size changes
    const fontSizeMap = {
      small: '14px',
      medium: '16px',
      large: '18px'
    }
    document.documentElement.style.fontSize = fontSizeMap[appearanceSettings.fontSize as keyof typeof fontSizeMap]
    
    // Save to localStorage
    localStorage.setItem('appearanceSettings', JSON.stringify(appearanceSettings))
    
    // Simulate API call
    console.log('Applying appearance settings:', appearanceSettings)
    alert('Đã áp dụng cài đặt giao diện thành công!')
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Cài đặt</h1>
        <p className="text-xs text-gray-500 mt-1">Quản lý cài đặt tài khoản và tùy chọn hệ thống của bạn</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex space-x-6">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-2 px-1 border-b-2 font-medium text-sm transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50 rounded-t-lg'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 rounded-t-lg'
                }`}
              >
                <IconComponent size={14} />
                {tab.label}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="max-w-4xl">
        {activeTab === 'profile' && (
          <div className="space-y-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Thông tin cá nhân</h3>
                <p className="text-xs text-gray-500 mt-1">Cập nhật thông tin hồ sơ và chi tiết liên hệ của bạn</p>
              </div>

              {/* User Info Card */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-500 text-white grid place-items-center text-lg font-bold shadow-md">
                    N
                  </div>
                  <div className="flex-1">
                    <h4 className="text-lg font-bold text-gray-900 mb-1">{formData.fullName}</h4>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        Super Admin
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Mail size={12} className="text-gray-400" />
                      {formData.email}
                    </p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Họ và tên</label>
                    <input
                      type="text"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập họ và tên"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập email"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Số điện thoại</label>
                  <div className="relative">
                    <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-300 pl-9 pr-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Giới thiệu</label>
                  <textarea
                    value={formData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    rows={3}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors resize-none"
                    placeholder="Viết vài dòng giới thiệu về bản thân..."
                  />
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-start pt-3 border-t border-gray-200">
              <button
                onClick={handleSave}
                className="inline-flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <Save size={14} />
                Lưu thay đổi
              </button>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-6">
            {/* Change Password Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">Đổi mật khẩu</h3>
              </div>
              <p className="text-xs text-gray-500">Cập nhật mật khẩu để bảo mật tài khoản của bạn</p>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu hiện tại</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPasswords.current ? 'text' : 'password'}
                      value={passwordData.currentPassword}
                      onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-300 pl-9 pr-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('current')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.current ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Mật khẩu mới</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPasswords.new ? 'text' : 'password'}
                      value={passwordData.newPassword}
                      onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-300 pl-9 pr-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('new')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.new ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type={showPasswords.confirm ? 'text' : 'password'}
                      value={passwordData.confirmPassword}
                      onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                      className="w-full h-9 rounded-md border border-gray-300 pl-9 pr-9 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Nhập lại mật khẩu mới"
                    />
                    <button
                      type="button"
                      onClick={() => togglePasswordVisibility('confirm')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPasswords.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                {/* Update Button */}
                <div className="pt-2">
                  <button
                    onClick={handlePasswordUpdate}
                    className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
                  >
                    <Lock size={14} />
                    Cập nhật mật khẩu
                  </button>
                </div>
              </div>
            </div>

            {/* Security Tips Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Shield size={16} className="text-gray-600" />
                <h3 className="text-lg font-bold text-gray-900">Mẹo bảo mật</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">
                    Sử dụng mật khẩu dài ít nhất 8 ký tự với sự kết hợp của chữ hoa, chữ thường, số và ký tự đặc biệt
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">
                    Không sử dụng thông tin cá nhân dễ đoán như tên, ngày sinh hoặc số điện thoại
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">
                    Thay đổi mật khẩu định kỳ và không sử dụng lại mật khẩu cũ
                  </p>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={12} className="text-green-600" />
                  </div>
                  <p className="text-xs text-gray-600">
                    Không chia sẻ mật khẩu với bất kỳ ai và luôn đăng xuất sau khi sử dụng
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Cài đặt thông báo</h3>
              <p className="text-xs text-gray-500 mt-1">Quản lý cách bạn nhận thông báo từ hệ thống</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              {/* Email Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Thông báo qua email</h4>
                  <p className="text-xs text-gray-500 mt-1">Nhận thông báo quan trọng qua email</p>
                </div>
                <button
                  onClick={() => toggleNotification('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.emailNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Push Notifications */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Thông báo đẩy</h4>
                  <p className="text-xs text-gray-500 mt-1">Hiển thị thông báo trên trình duyệt</p>
                </div>
                <button
                  onClick={() => toggleNotification('pushNotifications')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.pushNotifications ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.pushNotifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Class Reminders */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Nhắc nhở lớp học</h4>
                  <p className="text-xs text-gray-500 mt-1">Thông báo trước giờ học 15 phút</p>
                </div>
                <button
                  onClick={() => toggleNotification('classReminders')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.classReminders ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.classReminders ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* Assignment Deadlines */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Hạn nộp bài tập</h4>
                  <p className="text-xs text-gray-500 mt-1">Nhắc nhở về các bài tập sắp hết hạn</p>
                </div>
                <button
                  onClick={() => toggleNotification('assignmentDeadlines')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.assignmentDeadlines ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.assignmentDeadlines ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              {/* System Updates */}
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-gray-900">Cập nhật hệ thống</h4>
                  <p className="text-xs text-gray-500 mt-1">Thông báo về tính năng và cập nhật mới</p>
                </div>
                <button
                  onClick={() => toggleNotification('systemUpdates')}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationSettings.systemUpdates ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationSettings.systemUpdates ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-start pt-3 border-t border-gray-200">
              <button
                onClick={handleSaveNotifications}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <Save size={14} />
                Lưu cài đặt
              </button>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Giao diện</h3>
              <p className="text-xs text-gray-500 mt-1">Tùy chỉnh giao diện và ngôn ngữ hiển thị</p>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
              {/* Theme Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Chủ đề</label>
                <select 
                  value={appearanceSettings.theme}
                  onChange={(e) => handleAppearanceChange('theme', e.target.value)}
                  className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="light">Sáng</option>
                  <option value="dark">Tối</option>
                  <option value="auto">Tự động</option>
                </select>
              </div>

              {/* Language Selection - Disabled */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Ngôn ngữ</label>
                <select 
                  disabled
                  className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm bg-gray-100 cursor-not-allowed"
                >
                  <option value="vi">Tiếng Việt</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Chức năng đổi ngôn ngữ đang được phát triển</p>
              </div>

              {/* Font Size Selection */}
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-2">Kích thước chữ</label>
                <select 
                  value={appearanceSettings.fontSize}
                  onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
                  className="w-full h-9 rounded-md border border-gray-300 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="small">Nhỏ</option>
                  <option value="medium">Trung bình</option>
                  <option value="large">Lớn</option>
                </select>
              </div>
            </div>

            {/* Apply Button */}
            <div className="flex justify-start pt-3 border-t border-gray-200">
              <button 
                onClick={handleApplyAppearance}
                className="inline-flex items-center gap-2 px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-all duration-200 font-semibold shadow-md hover:shadow-lg"
              >
                <Settings size={14} />
                Áp dụng thay đổi
              </button>
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Riêng tư</h3>
              <p className="text-xs text-gray-500 mt-1">Cài đặt quyền riêng tư và bảo mật dữ liệu</p>
            </div>
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Shield size={20} className="text-green-600" />
              </div>
              <h4 className="text-sm font-semibold text-gray-900 mb-1">Chức năng đang phát triển</h4>
              <p className="text-xs text-gray-600">Tính năng riêng tư sẽ sớm được cập nhật</p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
