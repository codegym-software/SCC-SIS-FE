import React, { useMemo, useState } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'

type Center = {
  id: string
  name: string
  code: string
  address: string
  phone: string
  status: 'Hoạt động' | 'Không hoạt động'
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute inset-0 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border">
          {children}
        </div>
      </div>
    </div>
  )
}

export default function CentersPage() {
  const toast = useToast()
  const { can } = usePermission()
  const [centers, setCenters] = useState<Center[]>([
    { id: '1', name: 'Trung tâm Hà Nội 1', code: 'HN1', address: '123 Đường A, Hà Nội', phone: '024-1234-5678', status: 'Hoạt động' },
    { id: '2', name: 'Trung tâm TP.HCM 1', code: 'HCM1', address: '456 Đường B, TP.HCM', phone: '028-2345-6789', status: 'Hoạt động' },
    { id: '3', name: 'Trung tâm Đà Nẵng', code: 'DN1', address: '789 Đường C, Đà Nẵng', phone: '0236-345-678', status: 'Không hoạt động' },
  ])
  const [query, setQuery] = useState('')
  const [openModal, setOpenModal] = useState(false)
  const [editing, setEditing] = useState<Center | null>(null)

  const filtered = useMemo(
    () => centers.filter((c) => c.name.toLowerCase().includes(query.toLowerCase()) || c.code.toLowerCase().includes(query.toLowerCase())),
    [centers, query]
  )

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = new FormData(e.currentTarget)
    const payload: Center = {
      id: editing?.id ?? String(Date.now()),
      name: String(form.get('name') || ''),
      code: String(form.get('code') || ''),
      address: String(form.get('address') || ''),
      phone: String(form.get('phone') || ''),
      status: (String(form.get('status') || 'Hoạt động') as Center['status']) ?? 'Hoạt động',
    }
    setCenters((prev) => {
      const exists = prev.some((c) => c.id === payload.id)
      return exists ? prev.map((c) => (c.id === payload.id ? payload : c)) : [payload, ...prev]
    })
    setOpenModal(false)
    setEditing(null)
  }

  function openCreate() {
    setEditing(null)
    setOpenModal(true)
  }

  function openEdit(center: Center) {
    setEditing(center)
    setOpenModal(true)
  }

  function toggleDisable(center: Center) {
    setCenters((prev) => prev.map((c) => (c.id === center.id ? { ...c, status: c.status === 'Hoạt động' ? 'Không hoạt động' : 'Hoạt động' } : c)))
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold">Quản lý Trung tâm</h1>
          <p className="text-xs text-gray-500">Xem, tạo mới, chỉnh sửa hoặc vô hiệu hóa Trung tâm</p>
        </div>
        {can('centers:create') && (
          <button className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black focus:ring-2 focus:ring-gray-300" onClick={openCreate}>
            + Tạo Trung tâm mới
          </button>
        )}
      </div>

      <div className="rounded-lg border bg-white">
        <div className="px-4 py-3 border-b grid grid-cols-1 md:grid-cols-3 gap-2">
          <input
            className="h-9 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
            placeholder="Tìm theo tên hoặc mã trung tâm..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select className="h-9 rounded-md border px-2 text-sm">
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Không hoạt động</option>
          </select>
        </div>

        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs text-gray-500 border-b">
          <div className="col-span-4">Trung tâm</div>
          <div className="col-span-3">Địa chỉ</div>
          <div className="col-span-3">Liên hệ</div>
          <div className="col-span-2 text-right">Trạng thái</div>
        </div>

        <div className="divide-y">
          {filtered.map((c) => (
            <div key={c.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
              <div className="col-span-12 md:col-span-4">
                <div className="text-sm font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">Mã: {c.code}</div>
              </div>
              <div className="col-span-12 md:col-span-3 text-sm">{c.address}</div>
              <div className="col-span-12 md:col-span-3 text-sm">{c.phone}</div>
              <div className="col-span-12 md:col-span-2 flex items-center justify-end gap-2">
                <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${c.status === 'Hoạt động' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>{c.status}</span>
                {can('centers:update') && (
                  <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm" onClick={() => openEdit(c)}>Sửa</button>
                )}
                {can('centers:disable') && (
                  <button
                    className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm"
                    onClick={() => {
                      const action = c.status === 'Hoạt động' ? 'Vô hiệu hóa' : 'Kích hoạt'
                      if (confirm(`${action} ${c.name}?`)) {
                        toggleDisable(c)
                        toast.success(`${action} thành công`, `${c.name} đã được cập nhật`)
                      }
                    }}
                  >
                    {c.status === 'Hoạt động' ? 'Vô hiệu hóa' : 'Kích hoạt'}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal open={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={onSubmit}>
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <div className="font-medium">{editing ? 'Sửa Trung tâm' : 'Tạo Trung tâm mới'}</div>
            <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => setOpenModal(false)}>×</button>
          </div>
          <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tên Trung tâm *</label>
              <input name="name" defaultValue={editing?.name} required className="w-full h-9 rounded-md border px-3 text-sm" placeholder="Trung tâm Hà Nội 1" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Mã *</label>
              <input name="code" defaultValue={editing?.code} required className="w-full h-9 rounded-md border px-3 text-sm" placeholder="HN1" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs text-gray-600 mb-1">Địa chỉ *</label>
              <input name="address" defaultValue={editing?.address} required className="w-full h-9 rounded-md border px-3 text-sm" placeholder="123 Đường A, Quận B, TP.C" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Số điện thoại</label>
              <input name="phone" defaultValue={editing?.phone} className="w-full h-9 rounded-md border px-3 text-sm" placeholder="024-1234-5678" />
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
              <select name="status" defaultValue={editing?.status ?? 'Hoạt động'} className="w-full h-9 rounded-md border px-2 text-sm">
                <option>Hoạt động</option>
                <option>Không hoạt động</option>
              </select>
            </div>
          </div>
          <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
            <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => setOpenModal(false)}>Hủy</button>
            <button
              type="submit"
              className="h-9 px-3 rounded-md bg-gray-900 text-white hover:bg-black focus:ring-2 focus:ring-gray-300"
              onClick={() => toast.success(editing ? 'Đã lưu thay đổi' : 'Đã tạo Trung tâm')}
            >
              {editing ? 'Lưu thay đổi' : 'Tạo Trung tâm'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}


