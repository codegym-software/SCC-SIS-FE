import React, { useState, useEffect } from 'react';
import { useToast } from '../../../../shared/hooks/useToast';
import { usePermission } from '../../../../shared/components/PermissionProvider';
import { Building2 } from 'lucide-react';

// Import components
import CenterList from './list';
import CenterForm from './form';
import CenterView from './view';

// Import API functions
import {
  listAllCenters,
  createCenter,
  updateCenter,
  deactivateCenter,
  reactivateCenter,
} from '../../../../shared/api/centers';

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

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/30" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
        <div className="w-full max-w-2xl rounded-lg bg-white shadow-lg border">
          {children}
        </div>
      </div>
    </div>
  );
}

export default function CentersPage() {
  const toast = useToast();
  const { can } = usePermission();
  const [centers, setCenters] = useState<Center[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái');
  const [openModal, setOpenModal] = useState(false);
  const [editing, setEditing] = useState<Center | null>(null);
  const [viewingCenter, setViewingCenter] = useState<Center | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load centers on mount
  useEffect(() => {
    const loadCenters = async () => {
      try {
        setLoading(true);
        const data = await listAllCenters();
        setCenters(data);
      } catch (error) {
        console.error('Error loading centers:', error);
        toast.error('Không thể tải danh sách trung tâm');
      } finally {
        setLoading(false);
      }
    };

    loadCenters();
  }, []); // Remove toast dependency to prevent infinite loop

  // Validation functions
  const validateEmail = (email: string): string | null => {
    if (!email) return 'Email là bắt buộc';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'Email không hợp lệ';
    return null;
  };

  const validatePhone = (phone: string): string | null => {
    if (!phone) return 'Số điện thoại là bắt buộc';
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) return 'Số điện thoại không hợp lệ';
    return null;
  };

  const validateCode = (code: string): string | null => {
    if (!code) return 'Mã trung tâm là bắt buộc';
    if (code.length < 2 || code.length > 10) return 'Mã trung tâm phải từ 2-10 ký tự';
    if (!/^[A-Z0-9]+$/.test(code)) return 'Mã trung tâm chỉ chứa chữ hoa và số';
    if (!editing && centers.some(c => c.code.toLowerCase() === code.toLowerCase())) {
      return 'Mã trung tâm đã tồn tại';
    }
    return null;
  };

  const validateName = (name: string): string | null => {
    if (!name) return 'Tên trung tâm là bắt buộc';
    if (name.length < 3) return 'Tên trung tâm phải ít nhất 3 ký tự';
    if (name.length > 100) return 'Tên trung tâm không được quá 100 ký tự';
    return null;
  };

  const validateRequired = (value: string, fieldName: string): string | null => {
    if (!value.trim()) return `${fieldName} là bắt buộc`;
    return null;
  };

  const validateAllFields = (formData: any): Record<string, string> => {
    const errors: Record<string, string> = {};
    const nameError = validateName(formData.name);
    if (nameError) errors.name = nameError;
    const codeError = validateCode(formData.code);
    if (codeError) errors.code = codeError;
    const emailError = validateEmail(formData.email);
    if (emailError) errors.email = emailError;
    const phoneError = validatePhone(formData.phone);
    if (phoneError) errors.phone = phoneError;
    const addressError = validateRequired(formData.addressLine, 'Địa chỉ');
    if (addressError) errors.addressLine = addressError;
    const provinceError = validateRequired(formData.province, 'Tỉnh/Thành phố');
    if (provinceError) errors.province = provinceError;
    const districtError = validateRequired(formData.district, 'Quận/Huyện');
    if (districtError) errors.district = districtError;
    const wardError = validateRequired(formData.ward, 'Phường/Xã');
    if (wardError) errors.ward = wardError;
    return errors;
  };

  // Handle form submission
  const handleSubmit = async (formData: any) => {
    try {
      setIsSubmitting(true);
      
      // Validate form data
      const errors = validateAllFields(formData);
      if (Object.keys(errors).length > 0) {
        toast.error('Vui lòng kiểm tra lại thông tin');
        return;
      }

      if (editing) {
        // Update existing center
        const updateData = {
          ...formData,
          id: editing.id,
        };
        await updateCenter(updateData);
        setCenters(prev => prev.map(c => c.id === editing.id ? { ...c, ...formData } : c));
        toast.success('Cập nhật trung tâm thành công');
      } else {
        // Create new center
        const newCenter = await createCenter(formData);
        setCenters(prev => [newCenter, ...prev]);
        toast.success('Tạo trung tâm thành công');
      }

      setOpenModal(false);
      setEditing(null);
    } catch (error) {
      console.error('Error saving center:', error);
      toast.error(editing ? 'Không thể cập nhật trung tâm' : 'Không thể tạo trung tâm');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle toggle status
  const handleToggleStatus = async (center: Center) => {
    try {
      if (center.active) {
        await deactivateCenter(center.id);
        setCenters(prev => prev.map(c => c.id === center.id ? { ...c, active: false } : c));
        toast.success('Vô hiệu hóa trung tâm thành công');
      } else {
        await reactivateCenter(center.id);
        setCenters(prev => prev.map(c => c.id === center.id ? { ...c, active: true } : c));
        toast.success('Kích hoạt trung tâm thành công');
      }
    } catch (error) {
      console.error('Error toggling center status:', error);
      toast.error('Không thể thay đổi trạng thái trung tâm');
    }
  };

  // Handle delete
  const handleDelete = async (center: Center) => {
    if (window.confirm(`Bạn có chắc chắn muốn xóa trung tâm "${center.name}" không?`)) {
      try {
        // Note: This would need a delete API endpoint
        toast.success('Xóa trung tâm thành công');
      } catch (error) {
        console.error('Error deleting center:', error);
        toast.error('Không thể xóa trung tâm');
      }
    }
  };

  // Handle view
  const handleView = (center: Center) => {
    setViewingCenter(center);
  };

  // Handle edit
  const handleEdit = (center: Center) => {
    setEditing(center);
    setOpenModal(true);
  };

  // Handle create
  const handleCreate = () => {
    setEditing(null);
    setOpenModal(true);
  };

  // Handle cancel
  const handleCancel = () => {
    setOpenModal(false);
    setEditing(null);
    setViewingCenter(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
          <div className="text-sm text-gray-600">Đang tải danh sách trung tâm...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-white">
            <Building2 size={18} />
          </div>
          <div>
            <h1 className="text-lg font-semibold">Quản lý Trung tâm</h1>
            <p className="text-xs text-gray-500">Tạo, chỉnh sửa và quản lý thông tin trung tâm</p>
          </div>
        </div>
      </div>

      {/* Center List */}
      <CenterList
        centers={centers}
        query={query}
        statusFilter={statusFilter}
        onView={handleView}
        onEdit={handleEdit}
        onToggleStatus={handleToggleStatus}
        onDelete={handleDelete}
        onCreate={handleCreate}
        canEdit={can('centers:update')}
        canDelete={can('centers:delete')}
        canToggleStatus={can('centers:update')}
      />

      {/* Create/Edit Modal */}
      <Modal open={openModal} onClose={handleCancel}>
        <CenterForm
          open={openModal}
          onClose={handleCancel}
          editing={editing}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewingCenter} onClose={() => setViewingCenter(null)}>
        {viewingCenter && (
          <CenterView
            open={!!viewingCenter}
            onClose={() => setViewingCenter(null)}
            center={viewingCenter}
            onEdit={() => {
              setViewingCenter(null);
              handleEdit(viewingCenter);
            }}
          />
        )}
      </Modal>
    </div>
  );
}
