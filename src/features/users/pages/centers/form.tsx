import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Phone, Mail, Globe, Building2 } from 'lucide-react';

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

interface CenterFormProps {
  open?: boolean;
  onClose?: () => void;
  editing?: Center | null;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const CenterForm: React.FC<CenterFormProps> = ({ 
  open = true,
  onClose,
  editing, 
  onSubmit, 
  onCancel, 
  isSubmitting = false 
}) => {
  if (!open) return null;
  // Province dropdown states
  const [provinceQuery, setProvinceQuery] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [showProvinceDropdown, setShowProvinceDropdown] = useState(false);

  // District dropdown states
  const [districtQuery, setDistrictQuery] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showDistrictDropdown, setShowDistrictDropdown] = useState(false);

  // Ward dropdown states
  const [wardQuery, setWardQuery] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [showWardDropdown, setShowWardDropdown] = useState(false);

  // Ref for auto focus
  const nameInputRef = useRef<HTMLInputElement>(null);

  // Validation states
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Vietnam provinces and cities
  const vietnamProvinces = [
    'An Giang', 'Bà Rịa - Vũng Tàu', 'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh',
    'Bến Tre', 'Bình Định', 'Bình Dương', 'Bình Phước', 'Bình Thuận', 'Cà Mau',
    'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên', 'Đồng Nai', 'Đồng Tháp',
    'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương', 'Hậu Giang',
    'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
    'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An',
    'Ninh Bình', 'Ninh Thuận', 'Phú Thọ', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi',
    'Quảng Ninh', 'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình',
    'Thái Nguyên', 'Thanh Hóa', 'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh',
    'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái',
    'Hà Nội', 'TP. Hồ Chí Minh', 'Đà Nẵng', 'Hải Phòng', 'Cần Thơ'
  ].sort();

  // Initialize form data
  useEffect(() => {
    if (editing) {
      setSelectedProvince(editing.province);
      setProvinceQuery(editing.province);
      setSelectedDistrict(editing.district);
      setDistrictQuery(editing.district);
      setSelectedWard(editing.ward);
      setWardQuery(editing.ward);
    }
  }, [editing]);

  // Auto focus on name input
  useEffect(() => {
    if (nameInputRef.current) {
      nameInputRef.current.focus();
    }
  }, []);

  // Clear errors when user starts typing
  const clearFieldError = (fieldName: string) => {
    if (validationErrors[fieldName]) {
      setValidationErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    }
  };

  // Filter functions
  const filteredProvinces = vietnamProvinces.filter(province =>
    province.toLowerCase().includes(provinceQuery.toLowerCase())
  );

  const filteredDistricts = selectedProvince ? [
    'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8',
    'Quận 9', 'Quận 10', 'Quận 11', 'Quận 12', 'Thủ Đức', 'Gò Vấp', 'Bình Thạnh',
    'Tân Bình', 'Tân Phú', 'Phú Nhuận', 'Quận Bình Tân', 'Quận Hóc Môn', 'Quận Củ Chi',
    'Quận Bình Chánh', 'Quận Nhà Bè', 'Quận Cần Giờ'
  ].filter(district =>
    district.toLowerCase().includes(districtQuery.toLowerCase())
  ) : [];

  const filteredWards = selectedDistrict ? [
    'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6',
    'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12'
  ].filter(ward =>
    ward.toLowerCase().includes(wardQuery.toLowerCase())
  ) : [];

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const form = new FormData(e.currentTarget as HTMLFormElement);
        const formData = {
          name: form.get('name'),
          code: form.get('code'),
          email: form.get('email'),
          phone: form.get('phone'),
          addressLine: form.get('addressLine'),
          province: selectedProvince,
          district: selectedDistrict,
          ward: selectedWard,
          description: form.get('description'),
          establishedDate: form.get('establishedDate'),
        };
        onSubmit(formData);
      }}
    >
      <div className="px-4 py-3 border-b flex items-center justify-between">
        <div className="font-medium">{editing ? 'Chỉnh sửa Trung tâm' : 'Tạo Trung tâm mới'}</div>
        <button
          type="button"
          className="h-8 w-8 rounded hover:bg-gray-100"
          onClick={onCancel}
        >
          ×
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Tên trung tâm *</label>
              <input
                ref={nameInputRef}
                name="name"
                defaultValue={editing?.name}
                required
                onChange={() => clearFieldError('name')}
                className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="Trung tâm Giáo dục ABC"
              />
              {validationErrors.name && (
                <div className="text-xs text-red-600 mt-1">{validationErrors.name}</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Mã trung tâm *</label>
              <input
                name="code"
                defaultValue={editing?.code}
                required
                onChange={() => clearFieldError('code')}
                className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="ABC001"
              />
              {validationErrors.code && (
                <div className="text-xs text-red-600 mt-1">{validationErrors.code}</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Ngày thành lập</label>
              <input
                name="establishedDate"
                type="date"
                defaultValue={editing?.establishedDate}
                className="w-full h-8 rounded-md border px-2 text-xs"
              />
            </div>
          </div>
        </div>

        {/* Địa chỉ */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="h-5 w-5 rounded-lg bg-green-50 text-green-600 grid place-items-center">
              <MapPin size={12} />
            </div>
            <h3 className="text-xs font-medium text-gray-900">Địa chỉ</h3>
          </div>
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Địa chỉ chi tiết *</label>
              <input
                name="addressLine"
                defaultValue={editing?.addressLine}
                required
                onChange={() => clearFieldError('addressLine')}
                className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.addressLine ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="123 Đường ABC, Phường XYZ"
              />
              {validationErrors.addressLine && (
                <div className="text-xs text-red-600 mt-1">{validationErrors.addressLine}</div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="relative">
                <label className="block text-xs text-gray-600 mb-1">Tỉnh/Thành phố *</label>
                <input
                  value={provinceQuery}
                  onChange={(e) => {
                    setProvinceQuery(e.target.value);
                    setShowProvinceDropdown(true);
                  }}
                  onFocus={() => setShowProvinceDropdown(true)}
                  onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 200)}
                  placeholder="Nhập hoặc chọn tỉnh/thành phố"
                  required
                  className="w-full h-8 rounded-md border px-2 text-xs"
                />
                {showProvinceDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredProvinces.length > 0 ? (
                      filteredProvinces.map((province) => (
                        <div
                          key={province}
                          className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedProvince(province);
                            setProvinceQuery(province);
                            setShowProvinceDropdown(false);
                          }}
                        >
                          {province}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-gray-500">Không tìm thấy tỉnh/thành phố</div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="block text-xs text-gray-600 mb-1">Quận/Huyện *</label>
                <input
                  value={districtQuery}
                  onChange={(e) => {
                    setDistrictQuery(e.target.value);
                    setShowDistrictDropdown(true);
                  }}
                  onFocus={() => setShowDistrictDropdown(true)}
                  onBlur={() => setTimeout(() => setShowDistrictDropdown(false), 200)}
                  placeholder="Nhập hoặc chọn quận/huyện"
                  required
                  className="w-full h-8 rounded-md border px-2 text-xs"
                />
                {showDistrictDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredDistricts.length > 0 ? (
                      filteredDistricts.map((district) => (
                        <div
                          key={district}
                          className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedDistrict(district);
                            setDistrictQuery(district);
                            setShowDistrictDropdown(false);
                          }}
                        >
                          {district}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-gray-500">Không tìm thấy quận/huyện</div>
                    )}
                  </div>
                )}
              </div>
              <div className="relative">
                <label className="block text-xs text-gray-600 mb-1">Phường/Xã *</label>
                <input
                  value={wardQuery}
                  onChange={(e) => {
                    setWardQuery(e.target.value);
                    setShowWardDropdown(true);
                  }}
                  onFocus={() => setShowWardDropdown(true)}
                  onBlur={() => setTimeout(() => setShowWardDropdown(false), 200)}
                  placeholder="Nhập hoặc chọn phường/xã"
                  required
                  className="w-full h-8 rounded-md border px-2 text-xs"
                />
                {showWardDropdown && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                    {filteredWards.length > 0 ? (
                      filteredWards.map((ward) => (
                        <div
                          key={ward}
                          className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                          onClick={() => {
                            setSelectedWard(ward);
                            setWardQuery(ward);
                            setShowWardDropdown(false);
                          }}
                        >
                          {ward}
                        </div>
                      ))
                    ) : (
                      <div className="px-2 py-1 text-xs text-gray-500">Không tìm thấy phường/xã</div>
                    )}
                  </div>
                )}
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
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-gray-600 mb-1">Số điện thoại *</label>
              <input
                name="phone"
                defaultValue={editing?.phone}
                required
                type="tel"
                onChange={() => clearFieldError('phone')}
                className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.phone ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="024-3943-1234"
              />
              {validationErrors.phone && (
                <div className="text-xs text-red-600 mt-1">{validationErrors.phone}</div>
              )}
            </div>
            <div>
              <label className="block text-xs text-gray-600 mb-1">Email *</label>
              <input
                name="email"
                type="email"
                defaultValue={editing?.email}
                required
                onChange={() => clearFieldError('email')}
                className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.email ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                placeholder="contact@education.vn"
              />
              {validationErrors.email && (
                <div className="text-xs text-red-600 mt-1">{validationErrors.email}</div>
              )}
            </div>
          </div>
        </div>

        {/* Mô tả */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
            <div className="h-5 w-5 rounded-lg bg-orange-50 text-orange-600 grid place-items-center">
              <Globe size={12} />
            </div>
            <h3 className="text-xs font-medium text-gray-900">Mô tả</h3>
          </div>
          <div>
            <label className="block text-xs text-gray-600 mb-1">Mô tả trung tâm</label>
            <textarea 
              name="description" 
              defaultValue={editing?.description} 
              className="w-full h-16 rounded-md border px-2 py-1 text-xs resize-none" 
              placeholder="Mô tả ngắn gọn về trung tâm..."
            />
          </div>
        </div>
      </div>

      <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
        <button 
          type="button" 
          className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" 
          onClick={onCancel}
        >
          Hủy
        </button>
        <button
          type="submit"
          className="h-9 px-3 rounded-md bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
          disabled={isSubmitting}
        >
          {isSubmitting && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          {isSubmitting
            ? (editing ? 'Đang cập nhật...' : 'Đang tạo...')
            : (editing ? 'Lưu thay đổi' : 'Tạo Trung tâm')
          }
        </button>
      </div>
    </form>
  );
};

export default CenterForm;
