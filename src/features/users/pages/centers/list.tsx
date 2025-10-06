import { Building2, MapPin, Phone, Mail, Users2 } from 'lucide-react';
import { useMemo } from 'react';
import CenterActions from './components/actions';

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

interface CenterListProps {
  centers: Center[];
  query: string;
  statusFilter: string;
  onView: (center: Center) => void;
  onEdit: (center: Center) => void;
  onToggleStatus: (center: Center) => void;
  onDelete: (center: Center) => void;
  onCreate: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  canToggleStatus?: boolean;
}

const CenterList: React.FC<CenterListProps> = ({ 
  centers, 
  query, 
  statusFilter, 
  onView, 
  onEdit, 
  onToggleStatus, 
  onDelete, 
  onCreate,
  canEdit = true,
  canDelete = true,
  canToggleStatus = true
}) => {
  const filtered = useMemo(() => {
    let result = centers.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase()) ||
      c.code.toLowerCase().includes(query.toLowerCase())
    );
    if (statusFilter !== 'Tất cả trạng thái') {
      if (statusFilter === 'Hoạt động') result = result.filter(c => c.active);
      else if (statusFilter === 'Không hoạt động') result = result.filter(c => !c.active);
    }
    return result;
  }, [centers, query, statusFilter]);

  return (
    <section className="rounded-2xl border border-gray-200 bg-white">
      {/* Header card */}
      <div className="px-3 py-3 border-b flex items-start gap-2">
        <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-white flex-shrink-0">
          <Building2 size={16} />
        </div>
        <div>
          <div className="text-sm font-medium">Danh sách Trung tâm</div>
          <div className="text-xs text-gray-500">
            Quản lý tất cả trung tâm trong hệ thống ({centers.length} trung tâm)
          </div>
        </div>
        <div className="ml-auto">
          <button
            onClick={onCreate}
            className="inline-flex items-center gap-1.5 rounded-md bg-blue-600 text-white text-xs px-2.5 py-1.5 hover:bg-blue-700"
          >
            <Building2 size={16} /> <span>Tạo trung tâm mới</span>
          </button>
        </div>
      </div>

      <div className="px-3 py-2 border-b flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div className="flex gap-2 w-full md:max-w-xl">
          <input
            value={query}
            onChange={(e) => {
              // This will be handled by parent component
            }}
            className="flex-1 h-8 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-blue-200"
            placeholder="Tìm kiếm trung tâm..."
            readOnly
          />
          <select
            value={statusFilter}
            onChange={(e) => {
              // This will be handled by parent component
            }}
            className="h-8 rounded-md border px-2 text-sm"
            disabled
          >
            <option>Tất cả trạng thái</option>
            <option>Hoạt động</option>
            <option>Không hoạt động</option>
          </select>
        </div>
      </div>

      {/* Header columns */}
      <div className="px-3 py-2 border-b text-xs text-gray-500 grid grid-cols-12 gap-3">
        <div className="col-span-4">Trung tâm</div>
        <div className="col-span-3">Địa chỉ</div>
        <div className="col-span-2">Liên hệ</div>
        <div className="col-span-2">Trạng thái</div>
        <div className="col-span-1"></div>
      </div>

      <div className="divide-y">
        {filtered.map((center) => (
          <div
            key={center.id}
            className="px-3 py-3 pr-12 grid grid-cols-12 gap-3 items-center border-t first:border-t-0 relative"
          >
            <div className="col-span-12 md:col-span-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-500 grid place-items-center text-white flex-shrink-0">
                  <Building2 size={16} />
                </div>
                <div>
                  <div className="text-sm font-medium">{center.name}</div>
                  <div className="text-xs text-gray-500">Mã: {center.code}</div>
                  {center.description && (
                    <div className="text-xs text-gray-500 mt-1 line-clamp-1">
                      {center.description}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="col-span-12 md:col-span-3">
              <div className="flex items-center gap-1 text-sm">
                <MapPin size={14} className="text-gray-500" />
                <span className="line-clamp-1">
                  {center.addressLine}, {center.ward}, {center.district}, {center.province}
                </span>
              </div>
            </div>
            <div className="col-span-12 md:col-span-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-sm">
                  <Phone size={14} className="text-gray-500" />
                  <span>{center.phone}</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Mail size={14} className="text-gray-500" />
                  <span className="line-clamp-1">{center.email}</span>
                </div>
              </div>
            </div>
            <div className="col-span-6 md:col-span-2">
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
            <div className="col-span-6 md:col-span-1">
              <div className="absolute right-3 top-1/2 -translate-y-1/2 z-40">
                <CenterActions
                  center={center}
                  onView={() => onView(center)}
                  onEdit={() => onEdit(center)}
                  onToggleStatus={() => onToggleStatus(center)}
                  onDelete={() => onDelete(center)}
                  canEdit={canEdit}
                  canDelete={canDelete}
                  canToggleStatus={canToggleStatus}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="px-3 py-3 border-t flex items-center justify-between text-sm text-gray-500">
        <div>
          Hiển thị 1 - {Math.min(10, filtered.length)} trong số {filtered.length} kết quả
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">
            Previous
          </button>
          <button className="h-8 px-3 rounded-md bg-blue-600 text-white text-sm">1</button>
          <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">2</button>
          <button className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm">Next</button>
        </div>
      </div>
    </section>
  );
};

export default CenterList;
