import React from 'react';
import { Building2, MapPin, Phone, Mail, Calendar, Users2, X } from 'lucide-react';

type Center = {
  id: number;
  name: string;
  code: string;
  email: string;
  phone: string;
  establishedDate?: string;
  description?: string;
  addressLine: string;
  province: string;
  district: string;
  ward: string;
  active: boolean;
  createdAt: string;
  updatedAt?: string;
  createdBy?: number | null;
  updatedBy?: number | null;
  deletedAt?: string | null;
};

interface CenterViewProps {
  open?: boolean;
  onClose?: () => void;
  center: Center;
  onEdit?: () => void;
}

const CenterView: React.FC<CenterViewProps> = ({ open = true, onClose, center, onEdit }) => {
  if (!open) return null;
  return (
    <div>
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-white">
            <Building2 size={16} />
          </div>
          <div>
            <div className="font-medium">Chi tiết Trung tâm</div>
            <div className="text-xs text-gray-500">{center.name}</div>
          </div>
        </div>
        <button
          className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
          onClick={onClose}
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Thông tin cơ bản */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="h-5 w-5 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
              <Building2 size={12} />
            </div>
            <h3 className="text-xs font-medium text-gray-900">Thông tin cơ bản</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tên trung tâm</label>
              <div className="text-sm font-medium">{center.name}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Mã trung tâm</label>
              <div className="text-sm font-medium">{center.code}</div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Trạng thái</label>
              <span
                className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                  center.active
                    ? 'bg-green-50 text-green-700 border border-green-200'
                    : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {center.active ? 'Hoạt động' : 'Không hoạt động'}
              </span>
            </div>
            {center.establishedDate && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ngày thành lập</label>
                <div className="text-sm">{new Date(center.establishedDate).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
          </div>
          {center.description && (
            <div>
              <label className="block text-xs text-gray-600 mb-1">Mô tả</label>
              <div className="text-sm text-gray-700">{center.description}</div>
            </div>
          )}
        </div>

        {/* Địa chỉ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="h-5 w-5 rounded-lg bg-green-50 text-green-600 grid place-items-center">
              <MapPin size={12} />
            </div>
            <h3 className="text-xs font-medium text-gray-900">Địa chỉ</h3>
          </div>
          <div className="space-y-2">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Địa chỉ chi tiết</label>
              <div className="text-sm">{center.addressLine}</div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Tỉnh/Thành phố</label>
                <div className="text-sm">{center.province}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Quận/Huyện</label>
                <div className="text-sm">{center.district}</div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Phường/Xã</label>
                <div className="text-sm">{center.ward}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin liên hệ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="h-5 w-5 rounded-lg bg-purple-50 text-purple-600 grid place-items-center">
              <Phone size={12} />
            </div>
            <h3 className="text-xs font-medium text-gray-900">Thông tin liên hệ</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Số điện thoại</label>
              <div className="flex items-center gap-2">
                <Phone size={14} className="text-gray-500" />
                <span className="text-sm">{center.phone}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email</label>
              <div className="flex items-center gap-2">
                <Mail size={14} className="text-gray-500" />
                <span className="text-sm">{center.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Thông tin hệ thống */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="h-5 w-5 rounded-lg bg-gray-50 text-gray-600 grid place-items-center">
              <Calendar size={12} />
            </div>
            <h3 className="text-xs font-medium text-gray-900">Thông tin hệ thống</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ngày tạo</label>
              <div className="text-sm">{new Date(center.createdAt).toLocaleDateString('vi-VN')}</div>
            </div>
            {center.updatedAt && (
              <div>
                <label className="block text-xs text-gray-600 mb-1">Ngày cập nhật</label>
                <div className="text-sm">{new Date(center.updatedAt).toLocaleDateString('vi-VN')}</div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
        <button
          className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50"
          onClick={onClose}
        >
          Đóng
        </button>
        {onEdit && (
          <button
            className="h-9 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700"
            onClick={onEdit}
          >
            Chỉnh sửa
          </button>
        )}
      </div>
    </div>
  );
};

export default CenterView;
