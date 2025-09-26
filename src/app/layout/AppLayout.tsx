import React from 'react'
import { Home, Building2, Users2, Shield, BookOpen, GraduationCap, Settings, LogOut } from 'lucide-react'
import { keycloak } from '../../keycloak'

type AppLayoutProps = {
  children: React.ReactNode
}

import { NavLink } from 'react-router-dom'

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white hidden md:flex md:flex-col sticky top-0 h-screen overflow-y-auto">
          <div className="px-4 py-5 border-b">
            <div className="text-xs text-gray-500 mb-2">Hệ thống Giáo dục Số</div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">NV</div>
              <div>
                <div className="text-sm font-medium">Nguyễn Quang Hưng </div>
                <div className="text-xs text-gray-500">Super Admin</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-2 py-3 space-y-1">
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              <Home size={16} /> Tổng quan
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              <Users2 size={16} /> Quản lý Người dùng
            </NavLink>
            <NavLink
              to="/centers"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              <Building2 size={16} /> Quản lý Trung tâm
            </NavLink>
            <NavLink
              to="/roles"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              <Shield size={16} /> Vai trò & Phân quyền
            </NavLink>
            <NavLink
              to="/programs"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              <BookOpen size={16} /> Chương trình & Module
            </NavLink>
            <NavLink
              to="/classes"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              <GraduationCap size={16} /> Quản lý Lớp học
            </NavLink>
          </nav>

          <div className="mt-auto border-t p-3 sticky bottom-0 bg-white">
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `block w-full text-left text-sm px-2 py-2 rounded-md flex items-center gap-2 ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              <Settings size={16} /> Cài đặt
            </NavLink>
            <button
              onClick={() => keycloak.logout({ redirectUri: window.location.origin })}
              className="mt-2 w-full text-left text-sm px-2 py-2 rounded-md hover:bg-gray-50 flex items-center gap-2"
            >
              <LogOut size={16} /> Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-white flex items-center justify-between px-4">
            <div className="text-sm text-gray-600">Xin chào, <span className="font-medium">Nguyễn Quang Hưng</span></div>
          </header>
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}
