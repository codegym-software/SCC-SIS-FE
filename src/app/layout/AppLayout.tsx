import React from 'react'

type AppLayoutProps = {
  children: React.ReactNode
}

import { NavLink } from 'react-router-dom'

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white hidden md:flex md:flex-col">
          <div className="px-4 py-5 border-b">
            <div className="text-xs text-gray-500 mb-2">Hệ thống Giáo dục Số</div>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center text-sm font-medium">NV</div>
              <div>
                <div className="text-sm font-medium">Nguyễn Văn Admin</div>
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
              Tổng quan
            </NavLink>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              Quản lý Người dùng
            </NavLink>
            <NavLink
              to="/centers"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              Quản lý Trung tâm
            </NavLink>
            <NavLink
              to="/roles"
              className={({ isActive }) =>
                `flex items-center gap-2 px-2 py-2 rounded-md text-sm ${isActive ? 'bg-gray-100 text-gray-900 font-medium' : 'hover:bg-gray-50'}`
              }
            >
              Vai trò & Phân quyền
            </NavLink>
          </nav>

          <div className="mt-auto border-t p-3">
            <a className="block w-full text-left text-sm px-2 py-2 rounded-md hover:bg-gray-50" href="#">Cài đặt</a>
            <button className="mt-2 w-full text-left text-sm px-2 py-2 rounded-md hover:bg-gray-50">Đăng xuất</button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 flex flex-col">
          <header className="h-14 border-b bg-white flex items-center justify-between px-4">
            <div className="text-sm text-gray-600">Xin chào, <span className="font-medium">Nguyễn Văn Admin</span></div>
          </header>
          <main className="p-4 md:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </div>
  )
}


