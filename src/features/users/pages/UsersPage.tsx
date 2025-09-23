import React, { useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'

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

export default function UsersPage() {
  const [openCreate, setOpenCreate] = useState(false)
  const toast = useToast()
  const { can } = usePermission()
  const stats = [
    { label: 'Tổng Người dùng', value: '6' },
    { label: 'Đang hoạt động', value: '5' },
    { label: 'Giảng viên', value: '3' },
    { label: 'Giáo vụ', value: '2' },
  ]

  const users = [
    { name: 'Nguyễn Văn An', email: 'an.nguyen@education.vn', phone: '0901234567', role: 'Giáo vụ', center: 'Trung tâm Hà Nội 1', major: 'Giáo dục', exp: '5 năm', status: 'Hoạt động' },
    { name: 'Trần Thị Bình', email: 'binh.tran@education.vn', phone: '0902345678', role: 'Giảng viên', center: 'Trung tâm HN 1', major: 'Toán học', exp: '3 năm', status: 'Hoạt động' },
    { name: 'Lê Văn Chinh', email: 'chinh.le@education.vn', phone: '0903456789', role: 'Quản lý đào tạo', center: 'Trung tâm TP.HCM 1', major: 'Khoa học máy tính', exp: '10 năm', status: 'Hoạt động' },
    { name: 'Phạm Thị Dung', email: 'dung.pham@education.vn', phone: '0904567890', role: 'Giảng viên', center: 'Trung tâm Đà Nẵng', major: 'Ngôn ngữ lập trình', exp: '2 năm', status: 'Không hoạt động' },
    { name: 'Hoàng Minh Tuấn', email: 'tuan.hoang@education.vn', phone: '0905678901', role: 'Giảng viên', center: 'Trung tâm HN 1', major: 'Thiết kế đồ họa', exp: '6 năm', status: 'Hoạt động' },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Quản lý Người dùng</h1>
          <p className="text-xs text-gray-500">Quản lý tài khoản người dùng trong hệ thống</p>
        </div>
        {can('users:create') && (
          <button
            className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black focus:ring-2 focus:ring-gray-300"
            onClick={() => setOpenCreate(true)}
          >
            + Thêm Người dùng mới
          </button>
        )}
      </div>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-lg border bg-white p-4">
            <div className="text-xs text-gray-500 mb-3">{s.label}</div>
            <div className="text-2xl font-semibold">{s.value}</div>
          </div>
        ))}
      </section>

      {/* Create User Modal */}
      <Modal open={openCreate} onClose={() => setOpenCreate(false)}>
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <div className="font-medium">Tạo Người dùng mới</div>
          <button className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => setOpenCreate(false)}>×</button>
        </div>
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="col-span-2 text-xs text-gray-500">Nhập thông tin để tạo tài khoản người dùng mới.</div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Họ và tên *</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Nguyễn Văn A" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Email *</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="email@education.vn" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Số điện thoại *</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="090xxxxxxx" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Số CMND/CCCD</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="123456789012" />
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Ngày sinh</label>
            <input type="date" className="w-full h-9 rounded-md border px-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Giới tính</label>
            <select className="w-full h-9 rounded-md border px-2 text-sm">
              <option>Nam</option>
              <option>Nữ</option>
              <option>Khác</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Vai trò *</label>
            <select className="w-full h-9 rounded-md border px-2 text-sm">
              <option>Chọn vai trò</option>
              <option>Giảng viên</option>
              <option>Giáo vụ</option>
              <option>Quản lý đào tạo</option>
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Trung tâm *</label>
            <select className="w-full h-9 rounded-md border px-2 text-sm">
              <option>Chọn trung tâm</option>
              <option>Trung tâm Hà Nội 1</option>
              <option>Trung tâm TP.HCM 1</option>
            </select>
          </div>

          <div>
            <label className="block text-xs text-gray-600 mb-1">Ngày bắt đầu</label>
            <input type="date" className="w-full h-9 rounded-md border px-3 text-sm" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Chuyên môn</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Giáo dục" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Kinh nghiệm</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="5 năm" />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs text-gray-600 mb-1">Địa chỉ</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="123 Đường ABC, Quận XYZ, Thành phố" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Tỉnh/Thành phố</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="TP.HCM" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Quận/Huyện</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Quận 1" />
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Phường/Xã</label>
            <input className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Phường ABC" />
          </div>
        </div>
        <div className="sticky bottom-0 bg-white px-4 py-3 border-t flex items-center justify-end gap-2">
          <button className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenCreate(false)}>Hủy</button>
          <button
            className="h-9 px-3 rounded-md bg-gray-900 text-white hover:bg-black focus:ring-2 focus:ring-gray-300"
            onClick={() => {
              setOpenCreate(false)
              toast.success('Đã tạo người dùng', 'Người dùng mới đã được thêm vào danh sách')
            }}
          >
            Tạo Người dùng
          </button>
        </div>
      </Modal>

      <section className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b grid grid-cols-1 md:grid-cols-3 gap-2">
          <input className="h-9 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200" placeholder="Tìm kiếm theo tên hoặc email..." />
          <select className="h-9 rounded-md border px-2 text-sm">
            <option>Tất cả trung tâm</option>
          </select>
          <select className="h-9 rounded-md border px-2 text-sm">
            <option>Tất cả vai trò</option>
          </select>
        </div>

        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs text-gray-500 border-b">
          <div className="col-span-4">Người dùng</div>
          <div className="col-span-3">Vai trò & Trung tâm</div>
          <div className="col-span-3">Chuyên môn</div>
          <div className="col-span-2 text-right">Trạng thái</div>
        </div>

        <div className="divide-y">
          {users.map((u) => (
            <div key={u.email} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
              <div className="col-span-12 md:col-span-4">
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-gray-500">{u.email}</div>
                <div className="text-xs text-gray-500">{u.phone}</div>
              </div>
              <div className="col-span-12 md:col-span-3">
                <div className="flex flex-wrap gap-1">
                  <span className="px-2 py-1 rounded-full bg-amber-50 text-amber-700 text-xs">{u.role}</span>
                </div>
                <div className="text-xs text-gray-500">{u.center}</div>
              </div>
              <div className="col-span-12 md:col-span-3">
                <div className="text-sm">{u.major}</div>
                <div className="text-xs text-gray-500">{u.exp}</div>
              </div>
              <div className="col-span-12 md:col-span-2 text-right">
                <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${u.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{u.status}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between px-4 py-3 border-t text-sm">
          <div className="text-gray-500">Hiển thị 1–5 trong 6 người dùng</div>
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


