import React, { useEffect, useMemo, useState } from "react";
import { X, Plus, Calendar, ChevronDown } from "lucide-react";

import { getRoles } from "../../../shared/api/roles";
// ⬇️ dùng LITE thay vì full
import { getCentersLite } from "../../../shared/api/centers";
import type { RoleDto } from "../../../shared/types/role";
// ⬇️ dùng CenterLiteDto
import type { CenterLiteDto } from "../../../shared/types/centers";

interface CreateUserModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: any) => void;
}

type Row = {
  id: string;
  roleId: number | "";
  centerId: number | "" | "__ALL__" | null; // null = GLOBAL; "__ALL__" = tất cả trung tâm
};

const ALL_CENTERS_VALUE = "__ALL__" as const;
const genders = ["Nam", "Nữ", "Khác"] as const;

export default function CreateUserModal({ open, onClose, onSubmit }: CreateUserModalProps) {
  const [formData, setFormData] = useState({
    fullName: "Nguyễn Văn A",
    email: "email@education.vn",
    phone: "090xxxxxxx",
    dateOfBirth: "",
    gender: "Nam",
    idCard: "123456789012",
    startDate: "",
    specialization: "Giáo dục",
    experience: "5 năm",
    address: "123 Đường ABC, Phường XYZ, Quận QWE",
    city: "TP.HCM",
    district: "Quận 1",
    ward: "Phường ABC",
    educationLevel: "Đại học",
    notes: "Thông tin bổ sung...",
  });

  const [rows, setRows] = useState<Row[]>([{ id: "1", roleId: "", centerId: "" }]);

  const [rolesData, setRolesData] = useState<RoleDto[]>([]);
  // ⬇️ dùng CenterLiteDto
  const [centersData, setCentersData] = useState<CenterLiteDto[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(false);

  useEffect(() => {
    if (!open) return;
    setLoadingMeta(true);
    Promise.all([getRoles(true), getCentersLite()])
      .then(([rolesRes, centersRes]) => {
        setRolesData(rolesRes.data || []);
        setCentersData(centersRes.data || []);
      })
      .catch((err) => {
        console.error("[CreateUserModal] Load roles/centers failed:", err);
        alert("Tải dữ liệu vai trò/trung tâm thất bại");
      })
      .finally(() => setLoadingMeta(false));
  }, [open]);

  const getRoleById = (roleId?: number | "") => rolesData.find((r) => r.roleId === roleId);
  const isGlobalRole = (roleId?: number | "") => getRoleById(roleId)?.scope === "GLOBAL";
  const isCenterScopedRole = (roleId?: number | "") => getRoleById(roleId)?.scope === "CENTER";

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const addRole = () => {
    if (rows.some((r) => isGlobalRole(r.roleId))) return;
    setRows((prev) => [...prev, { id: String(Date.now()), roleId: "", centerId: "" }]);
  };

  const removeRole = (id: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const handleRowChange = (index: number, field: "roleId" | "centerId", value: string) => {
    setRows((prev) =>
      prev.map((r, i) => {
        if (i !== index) return r;
        if (field === "roleId") {
          const newRoleId = value ? Number(value) : "";
          if (isGlobalRole(newRoleId)) {
            return { ...r, roleId: newRoleId, centerId: null };
          }
          return { ...r, roleId: newRoleId, centerId: "" };
        } else {
          if (value === "" || value === ALL_CENTERS_VALUE) {
            return { ...r, centerId: value as "" | "__ALL__" };
          }
          return { ...r, centerId: Number(value) };
        }
      })
    );
  };

  const addDisabled = useMemo(() => {
    if (rows.some((r) => isGlobalRole(r.roleId))) return true;
    const roleIds = new Set(
      rows.filter((r) => r.roleId && isCenterScopedRole(r.roleId)).map((r) => r.roleId as number)
    );
    return roleIds.size >= 3;
  }, [rows, rolesData]);

  const mapGender = (g: string) => (g === "Nam" ? "male" : g === "Nữ" ? "female" : undefined);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (rows.some((r) => !r.roleId)) {
      alert("Vui lòng chọn vai trò hợp lệ");
      return;
    }

    const hasGlobal = rows.some((r) => isGlobalRole(r.roleId));
    if (hasGlobal) {
      if (rows.length !== 1) {
        alert("Vai trò độc quyền (GLOBAL) không được đi kèm vai trò khác.");
        return;
      }
      if (rows[0].centerId !== null) {
        alert("Vai trò GLOBAL phải để Trung tâm = (Không áp dụng)");
        return;
      }
    } else {
      if (
        rows.some(
          (r) =>
            !isCenterScopedRole(r.roleId) ||
            (r.centerId !== ALL_CENTERS_VALUE && typeof r.centerId !== "number")
        )
      ) {
        alert("Vui lòng chọn Trung tâm cho vai trò center-scoped");
        return;
      }
      const distinctRoleIds = new Set(rows.map((r) => r.roleId as number));
      if (distinctRoleIds.size > 3) {
        alert("Tối đa 3 loại vai trò center-scoped khác nhau");
        return;
      }
    }

    // Expand "__ALL__" thành toàn bộ centers (lite)
    const expanded: { roleId: number; centerId: number | null }[] = [];
    for (const r of rows) {
      const roleId = r.roleId as number;
      if (isGlobalRole(roleId)) {
        expanded.push({ roleId, centerId: null });
        continue;
      }
      if (r.centerId === ALL_CENTERS_VALUE) {
        expanded.push(...centersData.map((c) => ({ roleId, centerId: c.centerId })));
      } else {
        expanded.push({ roleId, centerId: r.centerId as number });
      }
    }
    const uniq = new Map<string, { roleId: number; centerId: number | null }>();
    expanded.forEach((x) => uniq.set(`${x.roleId}::${x.centerId ?? "null"}`, x));
    const rolesDto = Array.from(uniq.values());

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dateOfBirth || undefined,
      gender: mapGender(formData.gender),
      nationalIdNo: formData.idCard || undefined,
      startDate: formData.startDate || undefined,
      specialty: formData.specialization || undefined,
      experience: formData.experience || undefined,
      addressLine: formData.address || undefined,
      province: formData.city || undefined,
      district: formData.district || undefined,
      ward: formData.ward || undefined,
      educationLevel: formData.educationLevel || undefined,
      note: formData.notes || undefined,
      roles: rolesDto,
    };

    onSubmit(payload);
    onClose();
  };


  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
        <div className="bg-white rounded-xl shadow-lg w-full max-w-4xl relative flex flex-col max-h-[85vh] overflow-auto">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Tạo Người dùng mới</h2>
              <p className="text-sm text-[#717182] mt-1">
                Nhập thông tin để tạo tài khoản người dùng mới.
              </p>
            </div>
            <button className="text-gray-400 hover:text-gray-600" onClick={onClose}>
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body */}
          <div className="p-6 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Basic Information */}
              <fieldset>
                <legend className="text-sm font-medium text-[#717182] mb-4">
                  Thông tin cơ bản
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium mb-1">
                      Họ và tên *
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      value={formData.fullName}
                      onChange={(e) => handleInputChange("fullName", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Nguyễn Văn A"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="email@education.vn"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Số điện thoại *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="090xxxxxxx"
                    />
                  </div>
                  <div className="relative">
                    <label htmlFor="dateOfBirth" className="block text-sm font-medium mb-1">
                      Ngày sinh
                    </label>
                    <input
                      type="date"
                      id="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Calendar className="w-3.5 h-3.5 absolute right-3 top-9 text-gray-400 pointer-events-none" />
                  </div>
                  <div className="relative">
                    <label htmlFor="gender" className="block text-sm font-medium mb-1">
                      Giới tính
                    </label>
                    <select
                      id="gender"
                      value={formData.gender}
                      onChange={(e) => handleInputChange("gender", e.target.value)}
                      className="appearance-none w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    >
                      {genders.map((gender) => (
                        <option key={gender} value={gender}>
                          {gender}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-3 top-9 opacity-50 pointer-events-none" />
                  </div>
                  <div>
                    <label htmlFor="idCard" className="block text-sm font-medium mb-1">
                      Số CMND/CCCD
                    </label>
                    <input
                      type="text"
                      id="idCard"
                      value={formData.idCard}
                      onChange={(e) => handleInputChange("idCard", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="123456789012"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Role and Center */}
              <fieldset>
                <div className="flex justify-between items-center mb-4">
                  <legend className="text-sm font-medium text-[#717182]">
                    Vai trò và trung tâm
                  </legend>
                  <button
                    type="button"
                    onClick={addRole}
                    disabled={addDisabled}
                    className={`flex items-center gap-2 text-sm font-medium border border-gray-200 px-3 py-1.5 rounded-lg ${addDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50"
                      }`}
                  >
                    <Plus className="w-4 h-4" />
                    <span>Thêm vai trò</span>
                  </button>
                </div>

                {rows.map((row, index) => {
                  const role = getRoleById(row.roleId);
                  const roleIsGlobal = isGlobalRole(row.roleId);
                  const roleIsCenter = isCenterScopedRole(row.roleId);

                  return (
                    <div
                      key={row.id}
                      className="border border-gray-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4 mb-4"
                    >
                      <div className="relative">
                        <label className="block text-sm font-medium mb-1">Vai trò *</label>
                        <select
                          disabled={loadingMeta}
                          value={row.roleId || ""}
                          onChange={(e) => handleRowChange(index, "roleId", e.target.value)}
                          className="appearance-none w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          <option value="">Chọn vai trò</option>
                          {rolesData.map((r) => (
                            <option key={r.roleId} value={r.roleId}>
                              {r.name}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-9 opacity-50 pointer-events-none" />
                      </div>

                      <div className="relative">
                        <label className="block text-sm font-medium mb-1">
                          Trung tâm {roleIsCenter ? "*" : ""}
                        </label>
                        <select
                          disabled={loadingMeta || roleIsGlobal || !role}
                          value={
                            roleIsGlobal ? "" : row.centerId === null ? "" : (row.centerId as any) || ""
                          }
                          onChange={(e) => handleRowChange(index, "centerId", e.target.value)}
                          className="appearance-none w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        >
                          {!roleIsCenter && <option value="">(Không áp dụng)</option>}
                          {roleIsCenter && <option value="">Chọn trung tâm</option>}
                          {roleIsCenter && (
                            <option value={ALL_CENTERS_VALUE}>Tất cả trung tâm</option>
                          )}
                          {roleIsCenter &&
                            centersData.map((c) => (
                              <option key={c.centerId} value={c.centerId}>
                                {c.name}
                              </option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-9 opacity-50 pointer-events-none" />
                      </div>

                      {rows.length > 1 && (
                        <div className="md:col-span-2 flex justify-end">
                          <button
                            type="button"
                            onClick={() => removeRole(row.id)}
                            className="text-red-500 hover:text-red-700 text-sm"
                          >
                            Xóa vai trò
                          </button>
                        </div>
                      )}

                      {role && (
                        <div className="md:col-span-2 text-xs text-gray-500">
                          {roleIsGlobal
                            ? "Vai trò GLOBAL: không cần trung tâm, và không được đi kèm vai trò khác."
                            : roleIsCenter
                              ? "Vai trò CENTER-scoped: bắt buộc chọn trung tâm. Có thể thêm nhiều trung tâm; tối đa 3 loại vai trò khác nhau."
                              : ""}
                        </div>
                      )}
                    </div>
                  );
                })}
              </fieldset>

              {/* Work Information */}
              <fieldset>
                <legend className="text-sm font-medium text-[#717182] mb-4">
                  Thông tin công việc
                </legend>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                  <div className="relative">
                    <label htmlFor="startDate" className="block text-sm font-medium mb-1">
                      Ngày bắt đầu
                    </label>
                    <input
                      type="date"
                      id="startDate"
                      value={formData.startDate}
                      onChange={(e) => handleInputChange("startDate", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                    <Calendar className="w-3.5 h-3.5 absolute right-3 top-9 text-gray-400 pointer-events-none" />
                  </div>
                  <div>
                    <label htmlFor="specialization" className="block text-sm font-medium mb-1">
                      Chuyên môn
                    </label>
                    <input
                      type="text"
                      id="specialization"
                      value={formData.specialization}
                      onChange={(e) => handleInputChange("specialization", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="Giáo dục"
                    />
                  </div>
                  <div>
                    <label htmlFor="experience" className="block text-sm font-medium mb-1">
                      Kinh nghiệm
                    </label>
                    <input
                      type="text"
                      id="experience"
                      value={formData.experience}
                      onChange={(e) => handleInputChange("experience", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="5 năm"
                    />
                  </div>
                </div>
              </fieldset>

              {/* Address */}
              <fieldset>
                <legend className="text-sm font-medium text-[#717182] mb-4">
                  Địa chỉ & thông tin khác
                </legend>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium mb-1">
                      Địa chỉ
                    </label>
                    <input
                      type="text"
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                      placeholder="123 Đường ABC, Phường XYZ, Quận QWE"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium mb-1">
                        Tỉnh/Thành phố
                      </label>
                      <input
                        type="text"
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="TP.HCM"
                      />
                    </div>
                    <div>
                      <label htmlFor="district" className="block text-sm font-medium mb-1">
                        Quận/Huyện
                      </label>
                      <input
                        type="text"
                        id="district"
                        value={formData.district}
                        onChange={(e) => handleInputChange("district", e.target.value)}
                        className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Quận 1"
                      />
                    </div>
                    <div>
                      <label htmlFor="ward" className="block text-sm font-medium mb-1">
                        Phường/Xã
                      </label>
                      <input
                        type="text"
                        id="ward"
                        value={formData.ward}
                        onChange={(e) => handleInputChange("ward", e.target.value)}
                        className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Phường ABC"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-4">
                    <div>
                      <label htmlFor="educationLevel" className="block text-sm font-medium mb-1">
                        Trình độ học vấn
                      </label>
                      <input
                        type="text"
                        id="educationLevel"
                        value={formData.educationLevel}
                        onChange={(e) => handleInputChange("educationLevel", e.target.value)}
                        className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Đại học"
                      />
                    </div>
                    <div className="md:col-span-2">
                      <label htmlFor="notes" className="block text-sm font-medium mb-1">
                        Ghi chú
                      </label>
                      <input
                        type="text"
                        id="notes"
                        value={formData.notes}
                        onChange={(e) => handleInputChange("notes", e.target.value)}
                        className="w-full bg-[#f3f3f5] border-transparent rounded-lg p-2.5 text-sm placeholder:text-[#717182] focus:ring-2 focus:ring-blue-500 focus:outline-none"
                        placeholder="Thông tin bổ sung..."
                      />
                    </div>
                  </div>
                </div>
              </fieldset>
            </form>
          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-200 mt-auto flex justify-end gap-4">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium border border-gray-200 rounded-lg hover:bg-gray-100"
            >
              Hủy
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="px-6 py-2 text-sm font-medium text-white bg-[#030213] rounded-lg hover:bg-black"
            >
              Tạo Người dùng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
