import React from 'react'
import type { Role } from '../model/types'

interface RoleDetailModalProps {
    open: boolean
    onClose: () => void
    role: Role | null
}

export default function RoleDetailModal({ open, onClose, role }: RoleDetailModalProps) {
    if (!open || !role) return null

    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
                <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border max-h-[85vh] overflow-auto">
                    <div>
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="font-medium">Thông tin vai trò</div>
                            <button className="h-8 w-8 rounded hover:bg-gray-100" onClick={onClose}>×</button>
                        </div>
                        <div className="p-4 grid grid-cols-2 gap-4 text-sm">
                            <div><div className="text-gray-500 text-xs">Tên vai trò</div><div>{role.name}</div></div>
                            <div><div className="text-gray-500 text-xs">Mã vai trò</div><div>{role.code}</div></div>
                            <div className="col-span-2">
                                <div className="text-gray-500 text-xs">Quyền hạn</div>
                                <div className="flex flex-wrap gap-1 mt-1">
                                    {role.permissionNamesPreview?.map((p, i) => (
                                        <span key={`${role.roleId}-${p}-${i}`} className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-100 text-gray-700">
                                            {p}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div><div className="text-gray-500 text-xs">Người dùng</div><div>{role.userCount}</div></div>
                            <div><div className="text-gray-500 text-xs">Trạng thái</div><div>{role.active ? 'Hoạt động' : 'Không hoạt động'}</div></div>
                            <div className="col-span-2"><div className="text-gray-500 text-xs">Ngày tạo</div><div>{new Date(role.createdAt).toLocaleDateString('vi-VN')}</div></div>
                            {role.updatedAt && (
                                <div className="col-span-2"><div className="text-gray-500 text-xs">Ngày cập nhật</div><div>{new Date(role.updatedAt).toLocaleDateString('vi-VN')}</div></div>
                            )}
                        </div>
                        <div className="px-4 py-3 border-t flex items-center justify-end">
                            <button className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={onClose}>Đóng</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}