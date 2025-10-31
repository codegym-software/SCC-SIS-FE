// src/features/centers/pages/CentersPage.tsx
import React, { useMemo, useState, useEffect, useRef } from 'react'
import { useToast } from '../../../shared/hooks/useToast'
import { usePermission } from '../../../shared/components/PermissionProvider'
import { Building2, Eye, MoreHorizontal, Users2, MapPin, Phone, Mail, Globe, Pencil, Power } from 'lucide-react'
import ConfirmDialog from '../../../shared/components/ConfirmDialog'

// Lấy type từ shared/types (không lấy từ API)
import type { CenterDto, CreateCenterDto, UpdateCenterDto } from '../../../shared/types/centers'

// Chỉ import HÀM từ API
import {
    listAllCenters,
    createCenter,
    updateCenter,
    deactivateCenter,
    reactivateCenter,
} from '../../../shared/api/centers'

type Center = {
    id: number
    name: string
    code: string
    email: string
    phone: string
    establishedDate?: string
    description?: string
    addressLine: string
    province: string
    district: string
    ward: string
    active: boolean
    createdAt: string
    updatedAt?: string
    createdBy?: number | null
    updatedBy?: number | null
    deletedAt?: string | null
}

function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50">
            <div className="fixed inset-0 bg-black/30" onClick={onClose} />
            <div className="fixed inset-0 flex items-start justify-center pt-12 px-4">
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
    const [centers, setCenters] = useState<Center[]>([])
    const [loading, setLoading] = useState(true)
    const [query, setQuery] = useState('')
    const [statusFilter, setStatusFilter] = useState('Tất cả trạng thái')
    const [openModal, setOpenModal] = useState(false)
    const [editing, setEditing] = useState<Center | null>(null)
    const [confirmDialog, setConfirmDialog] = useState<{
        open: boolean
        center: Center | null
    }>({ open: false, center: null })
    const [viewingCenter, setViewingCenter] = useState<Center | null>(null)
    const [openMenuId, setOpenMenuId] = useState<number | null>(null)

    // Province dropdown states
    const [provinceQuery, setProvinceQuery] = useState('')
    const [selectedProvince, setSelectedProvince] = useState('')
    const [showProvinceDropdown, setShowProvinceDropdown] = useState(false)

    // District dropdown states
    const [districtQuery, setDistrictQuery] = useState('')
    const [selectedDistrict, setSelectedDistrict] = useState('')
    const [showDistrictDropdown, setShowDistrictDropdown] = useState(false)

    // Ward dropdown states
    const [wardQuery, setWardQuery] = useState('')
    const [selectedWard, setSelectedWard] = useState('')
    const [showWardDropdown, setShowWardDropdown] = useState(false)

    // Ref for auto focus
    const nameInputRef = useRef<HTMLInputElement>(null)

    // Validation states
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)

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
    ].sort()

    const filteredProvinces = vietnamProvinces.filter(province =>
        province.toLowerCase().includes(provinceQuery.toLowerCase())
    )

    // Common districts/counties in Vietnam
    const vietnamDistricts = [
        'Quận 1', 'Quận 2', 'Quận 3', 'Quận 4', 'Quận 5', 'Quận 6', 'Quận 7', 'Quận 8', 'Quận 9', 'Quận 10',
        'Quận 11', 'Quận 12', 'Quận Bình Thạnh', 'Quận Tân Bình', 'Quận Tân Phú', 'Quận Phú Nhuận',
        'Quận Gò Vấp', 'Quận Bình Tân', 'Quận Thủ Đức',
        'Quận Ba Đình', 'Quận Hoàn Kiếm', 'Quận Hai Bà Trưng', 'Quận Đống Đa', 'Quận Tây Hồ', 'Quận Cầu Giấy',
        'Quận Thanh Xuân', 'Quận Hoàng Mai', 'Quận Long Biên', 'Quận Nam Từ Liêm', 'Quận Bắc Từ Liêm', 'Quận Hà Đông',
        'Quận Hải Châu', 'Quận Thanh Khê', 'Quận Sơn Trà', 'Quận Ngũ Hành Sơn', 'Quận Liên Chiểu', 'Quận Cẩm Lệ',
        'Quận Hồng Bàng', 'Quận Ngô Quyền', 'Quận Lê Chân', 'Quận Kiến An', 'Quận Dương Kinh',
        'Huyện Bình Chánh', 'Huyện Nhà Bè', 'Huyện Hóc Môn', 'Huyện Củ Chi', 'Huyện Cần Giờ',
        'Huyện Gia Lâm', 'Huyện Đông Anh', 'Huyện Sóc Sơn', 'Huyện Thanh Trì', 'Huyện Thường Tín',
        'Huyện Phúc Thọ', 'Huyện Đan Phượng', 'Huyện Hoài Đức', 'Huyện Quốc Oai', 'Huyện Thạch Thất',
        'Huyện Chương Mỹ', 'Huyện Thanh Oai', 'Huyện Mỹ Đức', 'Huyện Ứng Hòa', 'Huyện Ba Vì',
        'Thành phố Thủ Dầu Một', 'Thành phố Biên Hòa', 'Thành phố Vũng Tàu', 'Thành phố Phan Thiết',
        'Thành phố Nha Trang', 'Thành phố Đà Lạt', 'Thành phố Buôn Ma Thuột', 'Thành phố Pleiku',
        'Thành phố Quy Nhon', 'Thành phố Huế', 'Thành phố Vinh', 'Thành phố Nam Định',
        'Thành phố Thái Nguyên', 'Thành phố Hạ Long', 'Thành phố Bắc Ninh', 'Thành phố Việt Trì'
    ].sort()

    const filteredDistricts = vietnamDistricts.filter(district =>
        district.toLowerCase().includes(districtQuery.toLowerCase())
    )

    // Common wards in Vietnam
    const vietnamWards = [
        'Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8',
        'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15',
        'Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cô Giang', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh',
        'Phường Đa Kao', 'Phường Nguyễn Cư Trinh', 'Phường Nguyễn Thái Bình', 'Phường Phạm Ngũ Lão',
        'Phường Tân Định', 'Phường Bùi Thị Xuân', 'Phường Đống Đa', 'Phường Hàng Bài', 'Phường Hàng Bồ',
        'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống',
        'Phường Lý Thái Tổ', 'Phường Phan Chu Trinh', 'Phường Tràng Tiền', 'Phường Trúc Bạch',
        'Phường Cửa Nam', 'Phường Cửa Đông', 'Phường Đức Giang', 'Phường Gia Thụy', 'Phường Long Biên',
        'Phường Ngọc Lâm', 'Phường Phúc Đông', 'Phường Phúc Lợi', 'Phường Sài Đồng', 'Phường Thạch Bàn',
        'Phường Thượng Thanh', 'Phường Việt Hưng', 'Phường Bồ Đề', 'Phường Thống Nhất', 'Phường Thành Công',
        'Xã An Phú', 'Xã Bình An', 'Xã Đông Thạnh', 'Xã Hòa Phú', 'Xã Tân Thạnh', 'Xã Thới An',
        'Xã Xuân Thới Đông', 'Xã Xuân Thới Sơn', 'Xã Xuân Thới Thượng', 'Xã Lê Minh Xuân',
        'Xã Tân Kiên', 'Xã Tân Nhựt', 'Xã Tân Quý Tây', 'Xã Vĩnh Lộc A', 'Xã Vĩnh Lộc B',
        'Xã Phạm Văn Hai', 'Xã Phong Phú', 'Xã An Phú Tây', 'Xã Hưng Long', 'Xã Nhơn Đức',
        'Xã Phú Xuân', 'Xã Quy Đức', 'Xã Tân An Hội', 'Xã Tân Phú Trung', 'Xã Phú Hòa Đông',
        'Thị trấn Tân Túc', 'Thị trấn Bến Lức', 'Thị trấn Cần Đước', 'Thị trấn Cần Giuộc',
        'Thị trấn Châu Thành', 'Thị trấn Đức Hòa', 'Thị trấn Mộc Hóa', 'Thị trấn Tân Hưng',
        'Thị trấn Tân Thạnh', 'Thị trấn Thủ Thừa', 'Thị trấn Vĩnh Hưng'
    ].sort()

    const filteredWards = vietnamWards.filter(ward =>
        ward.toLowerCase().includes(wardQuery.toLowerCase())
    )

    // Convert API response to internal Center type (coalesce null -> undefined)
    const mapCenterFromAPI = (apiCenter: CenterDto): Center => ({
        id: apiCenter.centerId,
        name: apiCenter.name,
        code: apiCenter.code,
        email: apiCenter.email,
        phone: apiCenter.phone,
        establishedDate: apiCenter.establishedDate ?? undefined,
        description: apiCenter.description ?? undefined,
        addressLine: apiCenter.addressLine,
        province: apiCenter.province,
        district: apiCenter.district,
        ward: apiCenter.ward,
        active: apiCenter.active,
        createdAt: apiCenter.createdAt,
        updatedAt: apiCenter.updatedAt ?? undefined,
        createdBy: apiCenter.createdBy ?? null,
        updatedBy: apiCenter.updatedBy ?? null,
        deletedAt: apiCenter.deletedAt ?? null,
    })

    // Load centers from API
    const loadCenters = async () => {
        try {
            setLoading(true)
            const response = await listAllCenters()
            const centersData = (response.data as CenterDto[]).map(mapCenterFromAPI)
            setCenters(centersData)
        } catch (error) {
            console.error('Failed to load centers:', error)
            toast.error('Lỗi tải dữ liệu', 'Không thể tải danh sách trung tâm')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCenters()
    }, [])

    // Auto focus on modal open
    useEffect(() => {
        if (openModal && !editing && nameInputRef.current) {
            setTimeout(() => {
                nameInputRef.current?.focus()
            }, 100)
        }
    }, [openModal, editing])

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (openModal && e.ctrlKey && e.key === 'Enter') {
                e.preventDefault()
                const form = document.querySelector('form')
                if (form) form.requestSubmit()
            }
        }
        if (openModal) {
            document.addEventListener('keydown', handleKeyDown)
            return () => document.removeEventListener('keydown', handleKeyDown)
        }
    }, [openModal])

    // Validation
    const validateEmail = (email: string): string | null => {
        if (!email) return 'Email là bắt buộc'
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) return 'Email không hợp lệ'
        return null
    }

    const validatePhone = (phone: string): string | null => {
        if (!phone) return 'Số điện thoại là bắt buộc'
        const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/
        if (!phoneRegex.test(phone.replace(/[-\s]/g, ''))) return 'Số điện thoại không hợp lệ'
        return null
    }

    const validateCode = (code: string): string | null => {
        if (!code) return 'Mã trung tâm là bắt buộc'
        if (code.length < 2 || code.length > 10) return 'Mã trung tâm phải từ 2-10 ký tự'
        if (!/^[A-Z0-9]+$/.test(code)) return 'Mã trung tâm chỉ chứa chữ hoa và số'
        if (!editing && centers.some(c => c.code.toLowerCase() === code.toLowerCase())) {
            return 'Mã trung tâm đã tồn tại'
        }
        return null
    }

    const validateName = (name: string): string | null => {
        if (!name) return 'Tên trung tâm là bắt buộc'
        if (name.length < 3) return 'Tên trung tâm phải ít nhất 3 ký tự'
        if (name.length > 100) return 'Tên trung tâm không được quá 100 ký tự'
        return null
    }

    const validateRequired = (value: string, fieldName: string): string | null => {
        if (!value.trim()) return `${fieldName} là bắt buộc`
        return null
    }

    const validateAllFields = (formData: any): Record<string, string> => {
        const errors: Record<string, string> = {}
        const nameError = validateName(formData.name)
        if (nameError) errors.name = nameError
        const codeError = validateCode(formData.code)
        if (codeError) errors.code = codeError
        const emailError = validateEmail(formData.email)
        if (emailError) errors.email = emailError
        const phoneError = validatePhone(formData.phone)
        if (phoneError) errors.phone = phoneError
        const addressError = validateRequired(formData.addressLine, 'Địa chỉ')
        if (addressError) errors.addressLine = addressError
        const provinceError = validateRequired(formData.province, 'Tỉnh/Thành phố')
        if (provinceError) errors.province = provinceError
        const districtError = validateRequired(formData.district, 'Quận/Huyện')
        if (districtError) errors.district = districtError
        const wardError = validateRequired(formData.ward, 'Phường/Xã')
        if (wardError) errors.ward = wardError
        return errors
    }

    // Clear errors when user starts typing
    const clearFieldError = (fieldName: string) => {
        if (validationErrors[fieldName]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev }
                delete newErrors[fieldName]
                return newErrors
            })
        }
    }

    const filtered = useMemo(() => {
        let result = centers.filter((c) =>
            c.name.toLowerCase().includes(query.toLowerCase()) ||
            c.code.toLowerCase().includes(query.toLowerCase())
        )
        if (statusFilter !== 'Tất cả trạng thái') {
            if (statusFilter === 'Hoạt động') result = result.filter(c => c.active)
            else if (statusFilter === 'Không hoạt động') result = result.filter(c => !c.active)
        }
        return result
    }, [centers, query, statusFilter])

    async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        setIsSubmitting(true)
        setValidationErrors({})

        const form = new FormData(e.currentTarget)

        const formData = {
            name: String(form.get('name') || '').trim(),
            code: String(form.get('code') || '').trim().toUpperCase(),
            email: String(form.get('email') || '').trim().toLowerCase(),
            phone: String(form.get('phone') || '').trim(),
            addressLine: String(form.get('addressLine') || '').trim(),
            province: String(form.get('province') || '').trim(),
            district: String(form.get('district') || '').trim(),
            ward: String(form.get('ward') || '').trim(),
        }

        const errors = validateAllFields(formData)
        if (Object.keys(errors).length > 0) {
            setValidationErrors(errors)
            setIsSubmitting(false)
            toast.error('Lỗi validation', 'Vui lòng kiểm tra lại thông tin đã nhập')
            return
        }

        // Payload cho create/update
        const basePayload = {
            ...formData,
            establishedDate: form.get('establishedDate') ? String(form.get('establishedDate')) : undefined,
            description: form.get('description') ? String(form.get('description')) : undefined,
        }

        try {
            if (editing) {
                const updatePayload: UpdateCenterDto = { ...basePayload }
                await updateCenter(editing.id, updatePayload)
                toast.success('Cập nhật thành công!', `Trung tâm ${formData.name} đã được cập nhật`)
            } else {
                const createPayload: CreateCenterDto = { ...basePayload }
                await createCenter(createPayload)
                toast.success('Tạo thành công!', `Trung tâm ${formData.name} đã được thêm vào hệ thống`)
            }

            await loadCenters()
            setOpenModal(false)
            setEditing(null)
            setSelectedProvince('')
            setProvinceQuery('')
            setSelectedDistrict('')
            setDistrictQuery('')
            setSelectedWard('')
            setWardQuery('')
            setValidationErrors({})
        } catch (error: any) {
            console.error('Failed to save center:', error)
            if (error.response?.status === 400) {
                const apiError = error.response.data
                if (apiError.field) {
                    setValidationErrors({ [apiError.field]: apiError.message })
                } else {
                    toast.error('Dữ liệu không hợp lệ', apiError.message || 'Vui lòng kiểm tra lại thông tin')
                }
            } else if (error.response?.status === 409) {
                toast.error('Trùng lặp dữ liệu', 'Mã trung tâm hoặc tên đã tồn tại trong hệ thống')
            } else {
                const errorMessage = error.response?.data?.message || error.message || 'Không thể kết nối đến server'
                toast.error('Lỗi hệ thống', errorMessage)
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    function openCreate() {
        setEditing(null)
        setSelectedProvince('')
        setProvinceQuery('')
        setSelectedDistrict('')
        setDistrictQuery('')
        setSelectedWard('')
        setWardQuery('')
        setValidationErrors({})
        setIsSubmitting(false)
        setOpenModal(true)
    }

    function openEdit(center: Center) {
        setEditing(center)
        setSelectedProvince(center.province)
        setProvinceQuery(center.province)
        setSelectedDistrict(center.district)
        setDistrictQuery(center.district)
        setSelectedWard(center.ward)
        setWardQuery(center.ward)
        setValidationErrors({})
        setIsSubmitting(false)
        setOpenModal(true)
    }

    async function toggleDisable(center: Center) {
        try {
            const action = center.active ? 'Vô hiệu hóa' : 'Kích hoạt'
            if (center.active) await deactivateCenter(center.id)
            else await reactivateCenter(center.id)
            await loadCenters()
            toast.success(`${action} thành công`, `${center.name} đã được cập nhật`)
        } catch (error) {
            console.error('Failed to toggle center status:', error)
            toast.error('Lỗi cập nhật', 'Không thể cập nhật trạng thái trung tâm')
        }
    }

    function handleDisableClick(center: Center) {
        if (center.active) {
            // Hiển thị confirm dialog màu đỏ khi vô hiệu hóa
            setConfirmDialog({ open: true, center })
        } else {
            // Kích hoạt không cần confirm
            toggleDisable(center)
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-3">
                    <div>
                        <h1 className="text-lg font-semibold">Quản lý Trung tâm</h1>
                        <p className="text-xs text-gray-500">Quản lý thông tin các trung tâm trong hệ thống</p>
                    </div>
                </div>
                {can('centers:create') && (
                    <button className="inline-flex items-center gap-2 rounded-md bg-gray-900 text-white text-sm px-3 py-2 hover:bg-black focus:ring-2 focus:ring-gray-300" onClick={openCreate}>
                        + Thêm Trung tâm mới
                    </button>
                )}
            </div>

            {/* Stats */}
            <section className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2"><Building2 size={16} /> Tổng số Trung tâm</div>
                    <div className="mt-3 text-2xl font-semibold">{centers.length}</div>
                    <div className="text-xs text-emerald-600 mt-1">+2 tháng này</div>
                </div>
                <div className="rounded-lg border bg-white p-4">
                    <div className="text-xs text-gray-500 flex items-center gap-2"><Eye size={16} /> Đang hoạt động</div>
                    <div className="mt-3 text-2xl font-semibold">{centers.filter(c => c.active).length}</div>
                    <div className="text-xs text-gray-500 mt-1">Trung tâm hoạt động</div>
                </div>
            </section>

            <div className="rounded-lg border bg-white">
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="text-sm text-gray-500">Đang tải dữ liệu...</div>
                    </div>
                )}
                {!loading && (
                    <>
                        <div className="px-4 py-3 border-b grid grid-cols-1 md:grid-cols-3 gap-2">
                            <input
                                className="h-9 rounded-md border px-3 text-sm outline-none focus:ring-2 focus:ring-gray-200"
                                placeholder="Tìm theo tên hoặc mã trung tâm..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                            />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="h-9 rounded-md border px-2 text-sm"
                            >
                                <option>Tất cả trạng thái</option>
                                <option>Hoạt động</option>
                                <option>Không hoạt động</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-12 gap-4 px-4 py-3 text-xs text-gray-500 border-b">
                            <div className="col-span-3">Tên Trung tâm</div>
                            <div className="col-span-3">Địa chỉ</div>
                            <div className="col-span-3">Liên hệ</div>
                            <div className="col-span-2">Trạng thái</div>
                            <div className="col-span-1"></div>
                        </div>

                        <div className="divide-y">
                            {filtered.map((c) => (
                                <div key={c.id} className="grid grid-cols-12 gap-4 px-4 py-4 items-center">
                                    <div className="col-span-12 md:col-span-3">
                                        <div className="flex items-start gap-3">
                                            <div>
                                                <div className="text-sm font-medium">{c.name}</div>
                                                <div className="text-xs text-gray-500">Mã: {c.code}</div>
                                                <div className="text-xs text-gray-500">Tạo: 2024-01-15</div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 text-sm">
                                        <div className="flex items-center gap-2 text-gray-700"><MapPin size={14} /> {c.addressLine}</div>
                                        <div className="text-xs text-gray-500">{[c.ward, c.district, c.province].filter(Boolean).join(', ')}</div>
                                    </div>
                                    <div className="col-span-12 md:col-span-3 text-sm">
                                        <div className="flex items-center gap-2"><Phone size={14} /> {c.phone}</div>
                                        <div className="flex items-center gap-2 text-xs text-gray-600"><Mail size={14} /> {c.email}</div>
                                    </div>
                                    <div className="col-span-6 md:col-span-2">
                                        <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs whitespace-nowrap ${c.active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'}`}>
                                            {c.active ? 'Hoạt động' : 'Không hoạt động'}
                                        </span>
                                    </div>
                                    <div className="col-span-6 md:col-span-1 flex justify-end">
                                        <div className="relative">
                                            <button
                                                className="h-8 w-8 rounded-md border bg-white hover:bg-gray-50 inline-flex items-center justify-center"
                                                onClick={() => setOpenMenuId((prev) => (prev === c.id ? null : c.id))}
                                            >
                                                <MoreHorizontal size={16} />
                                            </button>
                                            {openMenuId === c.id && (
                                                <>
                                                    <div className="fixed inset-0 z-10" onClick={() => setOpenMenuId(null)} />
                                                    <div className="absolute right-0 mt-2 w-40 rounded-lg border bg-white shadow-lg z-20">
                                                        <button
                                                            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                                                            onClick={() => { setOpenMenuId(null); setViewingCenter(c) }}
                                                        >
                                                            <Eye size={14} />
                                                            <span>Xem chi tiết</span>
                                                        </button>
                                                        {can('centers:update') && (
                                                            <button 
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" 
                                                                onClick={() => { setOpenMenuId(null); openEdit(c) }}
                                                            >
                                                                <Pencil size={14} />
                                                                <span>Chỉnh sửa</span>
                                                            </button>
                                                        )}
                                                        {can('centers:disable') && (
                                                            <button 
                                                                className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 flex items-center gap-2" 
                                                                onClick={() => {
                                                                    setOpenMenuId(null)
                                                                    handleDisableClick(c)
                                                                }}
                                                            >
                                                                <Power size={14} />
                                                                <span>{c.active ? 'Vô hiệu hóa' : 'Kích hoạt'}</span>
                                                            </button>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* View Center Detail Modal */}
            <Modal open={!!viewingCenter} onClose={() => setViewingCenter(null)}>
                {viewingCenter && (
                    <div>
                        <div className="px-4 py-3 border-b flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div>
                                    <div className="font-semibold">{viewingCenter.name}</div>
                                    <div className="text-xs text-gray-500">Mã: {viewingCenter.code}</div>
                                </div>
                            </div>
                            <button
                                type="button"
                                className="h-8 w-8 rounded hover:bg-gray-100 flex items-center justify-center"
                                onClick={() => setViewingCenter(null)}
                            >
                                ×
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Thông tin cơ bản */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <div className="h-5 w-5 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                                            <Building2 size={12} />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900">Thông tin cơ bản</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Tên trung tâm</label>
                                            <div className="text-sm font-medium">{viewingCenter.name}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Mã trung tâm</label>
                                            <div className="text-sm font-mono bg-gray-50 px-2 py-1 rounded">{viewingCenter.code}</div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Trạng thái</label>
                                            <span className={`inline-flex items-center h-6 px-2 rounded-full text-xs ${viewingCenter.active
                                                ? 'bg-emerald-50 text-emerald-700'
                                                : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                {viewingCenter.active ? 'Hoạt động' : 'Không hoạt động'}
                                            </span>
                                        </div>
                                        {viewingCenter.establishedDate && (
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Ngày thành lập</label>
                                                <div className="text-sm">{new Date(viewingCenter.establishedDate).toLocaleDateString('vi-VN')}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <div className="h-5 w-5 rounded-lg bg-green-50 text-green-600 grid place-items-center">
                                            <Phone size={12} />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900">Thông tin liên hệ</h3>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Số điện thoại</label>
                                            <div className="text-sm flex items-center gap-2">
                                                <Phone size={14} className="text-gray-400" />
                                                {viewingCenter.phone}
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-xs text-gray-500 mb-1">Email</label>
                                            <div className="text-sm flex items-center gap-2">
                                                <Mail size={14} className="text-gray-400" />
                                                {viewingCenter.email}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Địa chỉ */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                    <div className="h-5 w-5 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
                                        <MapPin size={12} />
                                    </div>
                                    <h3 className="text-sm font-medium text-gray-900">Địa chỉ</h3>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <div className="text-sm font-medium mb-2">{viewingCenter.addressLine}</div>
                                    <div className="text-xs text-gray-600">
                                        {[viewingCenter.ward, viewingCenter.district, viewingCenter.province].filter(Boolean).join(', ')}
                                    </div>
                                </div>
                            </div>

                            {/* Mô tả */}
                            {viewingCenter.description && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                        <div className="h-5 w-5 rounded-lg bg-orange-50 text-orange-600 grid place-items-center">
                                            <Globe size={12} />
                                        </div>
                                        <h3 className="text-sm font-medium text-gray-900">Mô tả</h3>
                                    </div>

                                    <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-4">
                                        {viewingCenter.description}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between rounded-b-lg">
                            <div className="text-xs text-gray-500">
                                Chi tiết trung tâm - {viewingCenter.name}
                            </div>
                            <div className="flex items-center gap-2">
                                {can('centers:update') && (
                                    <button
                                        className="h-8 px-3 rounded-md bg-gray-900 text-white hover:bg-black text-sm"
                                        onClick={() => {
                                            setViewingCenter(null)
                                            openEdit(viewingCenter)
                                        }}
                                    >
                                        Chỉnh sửa
                                    </button>
                                )}
                                <button
                                    className="h-8 px-3 rounded-md border bg-white hover:bg-gray-50 text-sm"
                                    onClick={() => setViewingCenter(null)}
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </Modal>

            <Modal open={openModal} onClose={() => {
                setOpenModal(false)
                setSelectedProvince('')
                setProvinceQuery('')
                setSelectedDistrict('')
                setDistrictQuery('')
                setSelectedWard('')
                setWardQuery('')
                setValidationErrors({})
                setIsSubmitting(false)
                setEditing(null)
            }}>
                <form onSubmit={onSubmit}>
                    <div className="px-4 py-3 border-b flex items-center justify-between">
                        <div>
                            <div className="font-medium">{editing ? 'Sửa Trung tâm' : 'Tạo Trung tâm mới'}</div>
                            <div className="text-xs text-gray-500 mt-1">Nhập thông tin để tạo một trung tâm mới trong hệ thống.</div>
                        </div>
                        <button type="button" className="h-8 w-8 rounded hover:bg-gray-100" onClick={() => {
                            setOpenModal(false)
                            setSelectedProvince('')
                            setProvinceQuery('')
                            setSelectedDistrict('')
                            setDistrictQuery('')
                            setSelectedWard('')
                            setWardQuery('')
                            setEditing(null)
                        }}>×</button>
                    </div>
                    <div className="p-4 space-y-4">
                        {/* Thông tin cơ bản */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <h3 className="text-xs font-medium text-gray-900">Thông tin cơ bản</h3>
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Tên trung tâm *</label>
                                    <input
                                        ref={nameInputRef}
                                        name="name"
                                        defaultValue={editing?.name}
                                        required
                                        onChange={() => clearFieldError('name')}
                                        className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.name ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                        placeholder="Trung tâm Hà Nội 2"
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
                                        onChange={(e) => {
                                            e.target.value = e.target.value.toUpperCase()
                                            clearFieldError('code')
                                        }}
                                        className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.code ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                        placeholder="HN02"
                                    />
                                    {validationErrors.code && (
                                        <div className="text-xs text-red-600 mt-1">{validationErrors.code}</div>
                                    )}
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 mb-1">Ngày thành lập</label>
                                    <input name="establishedDate" type="date" defaultValue={editing?.establishedDate} className="w-full h-8 rounded-md border px-2 text-xs text-gray-700" />
                                </div>
                            </div>
                        </div>

                        {/* Thông tin địa chỉ */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <div className="h-5 w-5 rounded-lg bg-green-50 text-green-600 grid place-items-center">
                                    <MapPin size={12} />
                                </div>
                                <h3 className="text-xs font-medium text-gray-900">Thông tin địa chỉ</h3>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Địa chỉ đầy đủ *</label>
                                <input
                                    name="addressLine"
                                    defaultValue={editing?.addressLine}
                                    required
                                    onChange={() => clearFieldError('addressLine')}
                                    className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.addressLine ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    placeholder="123 Nguyễn Du, Phường Bùi Thị Xuân, Quận Hai Bà Trưng"
                                />
                                {validationErrors.addressLine && (
                                    <div className="text-xs text-red-600 mt-1">{validationErrors.addressLine}</div>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div className="relative">
                                    <label className="block text-xs text-gray-600 mb-1">Tỉnh/Thành phố *</label>
                                    <input
                                        name="province"
                                        type="text"
                                        value={selectedProvince || editing?.province || ''}
                                        onChange={(e) => {
                                            setSelectedProvince(e.target.value)
                                            setProvinceQuery(e.target.value)
                                            setShowProvinceDropdown(true)
                                            clearFieldError('province')
                                        }}
                                        onFocus={() => setShowProvinceDropdown(true)}
                                        onBlur={() => setTimeout(() => setShowProvinceDropdown(false), 200)}
                                        placeholder="Nhập hoặc chọn tỉnh/thành phố"
                                        required
                                        className={`w-full h-8 rounded-md border px-2 text-xs ${validationErrors.province ? 'border-red-500 bg-red-50' : 'border-gray-300'}`}
                                    />
                                    {showProvinceDropdown && (
                                        <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                                            {filteredProvinces.length > 0 ? (
                                                filteredProvinces.map((province) => (
                                                    <div
                                                        key={province}
                                                        className="px-2 py-1 text-xs hover:bg-gray-100 cursor-pointer"
                                                        onClick={() => {
                                                            setSelectedProvince(province)
                                                            setProvinceQuery(province)
                                                            setShowProvinceDropdown(false)
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
                                        name="district"
                                        type="text"
                                        value={selectedDistrict || editing?.district || ''}
                                        onChange={(e) => {
                                            setSelectedDistrict(e.target.value)
                                            setDistrictQuery(e.target.value)
                                            setShowDistrictDropdown(true)
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
                                                            setSelectedDistrict(district)
                                                            setDistrictQuery(district)
                                                            setShowDistrictDropdown(false)
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
                                        name="ward"
                                        type="text"
                                        value={selectedWard || editing?.ward || ''}
                                        onChange={(e) => {
                                            setSelectedWard(e.target.value)
                                            setWardQuery(e.target.value)
                                            setShowWardDropdown(true)
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
                                                            setSelectedWard(ward)
                                                            setWardQuery(ward)
                                                            setShowWardDropdown(false)
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

                        {/* Thông tin liên hệ */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 pb-2 border-b border-gray-100">
                                <div className="h-5 w-5 rounded-lg bg-blue-50 text-blue-600 grid place-items-center">
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
                                <textarea name="description" defaultValue={editing?.description} className="w-full h-16 rounded-md border px-2 py-1 text-xs resize-none" placeholder="Mô tả ngắn gọn về trung tâm..."></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="px-4 py-3 border-t flex items-center justify-end gap-2">
                        <button type="button" className="h-9 px-3 rounded-md border bg-white hover:bg-gray-50" onClick={() => {
                            setOpenModal(false)
                            setSelectedProvince('')
                            setProvinceQuery('')
                            setSelectedDistrict('')
                            setDistrictQuery('')
                            setSelectedWard('')
                            setWardQuery('')
                            setEditing(null)
                        }}>Hủy</button>
                        <button
                            type="submit"
                            className="h-9 px-3 rounded-md bg-gray-900 text-white hover:bg-black disabled:opacity-50 flex items-center gap-2"
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
            </Modal>

            {/* Confirm Dialog for deactivating center */}
            {confirmDialog.center && (
                <ConfirmDialog
                    open={confirmDialog.open}
                    onClose={() => setConfirmDialog({ open: false, center: null })}
                    onConfirm={async () => {
                        if (confirmDialog.center) {
                            await toggleDisable(confirmDialog.center)
                        }
                    }}
                    title="Xác nhận vô hiệu hóa trung tâm"
                    description={`Bạn có chắc chắn muốn vô hiệu hóa trung tâm "${confirmDialog.center.name}"?\n\nLưu ý: Tất cả vai trò trung tâm của người dùng tại trung tâm này sẽ bị hủy gán.`}
                    confirmText="Vô hiệu hóa"
                    cancelText="Hủy"
                    variant="danger"
                />
            )}
        </div>
    )
}
