# Hướng dẫn Quản lý Ngân hàng Môn học (Module)

## Tổng quan

Tính năng quản lý module cho phép Quản lý đào tạo tìm kiếm, lọc, tạo mới, chỉnh sửa và xóa các module học trong hệ thống.

## Các chức năng chính

### 1. Xem danh sách Module

- Truy cập: **Chương trình & Module** → Tab **Module**
- Hiển thị:
    - Tên module và mã module
    - Lĩnh vực (Kỹ thuật, Lập trình, Thiết kế, Kinh doanh)
    - Thời lượng và số tín chỉ
    - Trạng thái (Hoạt động, Tạm dừng, Hoàn thành)
    - Có/chưa có giáo trình

### 2. Tìm kiếm Module

- **Thanh tìm kiếm**: Tìm theo tên module, mã module, hoặc lĩnh vực
- Tìm kiếm real-time khi bạn gõ
- Kết quả hiển thị ngay lập tức

### 3. Lọc Module

Có 2 bộ lọc:

#### Lọc theo Lĩnh vực

- Tất cả lĩnh vực (mặc định)
- Kỹ thuật
- Lập trình
- Thiết kế
- Kinh doanh

#### Lọc theo Trạng thái

- Tất cả trạng thái (mặc định)
- Hoạt động
- Tạm dừng
- Hoàn thành

### 4. Tạo Module mới

**Cách thực hiện:**

1. Click nút **"Tạo module mới"** ở góc phải trên
2. Điền thông tin:
    - **Tên Module** \* (bắt buộc): Ví dụ "Lập trình Java Cơ bản"
    - **Mã Module** \* (bắt buộc): Ví dụ "JAVA101"
    - **Lĩnh vực** \* (bắt buộc): Chọn từ dropdown
    - **Số tín chỉ** \* (bắt buộc): Số nguyên > 0
    - **Thời lượng** \* (bắt buộc): Ví dụ "4 tháng", "12 tuần"
    - **Trạng thái**: Mặc định "Hoạt động"
    - **Điều kiện tiên quyết**: Để trống hoặc nhập "Không" nếu không có
    - **Đề cương**: "Có" hoặc "Chưa có"
3. Click **"Tạo mới"**

**Validation:**

- Tất cả trường có dấu (\*) là bắt buộc
- Số tín chỉ phải > 0
- Mã module không được trùng

### 5. Chỉnh sửa Module

**Cách thực hiện:**

1. Click menu 3 chấm (⋮) bên cạnh module
2. Chọn **"Chỉnh sửa"**
3. Form sẽ hiển thị với dữ liệu hiện tại
4. Chỉnh sửa các trường cần thiết
5. Click **"Cập nhật"**

**Lưu ý:**

- Mã module không thể thay đổi sau khi tạo
- Các trường khác đều có thể chỉnh sửa

### 6. Xóa Module

**Cách thực hiện:**

1. Click menu 3 chấm (⋮) bên cạnh module
2. Chọn **"Xóa"**
3. Xác nhận trong hộp thoại
4. Module sẽ bị xóa khỏi hệ thống

**Cảnh báo:**

- Hành động này không thể hoàn tác
- Nên kiểm tra kỹ trước khi xóa

### 7. Xem chi tiết Module

**Cách thực hiện:**

1. Click menu 3 chấm (⋮) bên cạnh module
2. Chọn **"Xem chi tiết"**
3. Modal hiển thị:
    - Thông tin đầy đủ về module
    - Danh sách đề cương đã tải lên
    - Chức năng upload/download/xóa file đề cương

## Phân trang

- Mỗi trang hiển thị tối đa 5 module
- Sử dụng nút **Previous** / **Next** để chuyển trang
- Hoặc click vào số trang cụ thể

## Giao diện

### Danh sách Module

```
┌─────────────────────────────────────────────────────────────┐
│ Danh sách Module (15 module)          [Tạo module mới]     │
├─────────────────────────────────────────────────────────────┤
│ [Tìm kiếm module...]  [Lĩnh vực ▼]  [Trạng thái ▼]        │
├─────────────────────────────────────────────────────────────┤
│ Module              │ Danh mục │ Thời gian │ Tín chỉ │ ... │
├─────────────────────────────────────────────────────────────┤
│ Lập trình Java Cơ bản                                       │
│ ID: JAVA101                                                  │
│ 🔵 Lập trình  ✅ Có giáo trình                              │
│                      6 tháng     4 tín chỉ   🟢 Hoạt động [⋮]│
├─────────────────────────────────────────────────────────────┤
│ ...                                                          │
└─────────────────────────────────────────────────────────────┘
```

### Form Tạo/Sửa Module

```
┌─────────────────────────────────────────────────────┐
│ 💾 Tạo Module mới                              [×]  │
│    Thêm module mới vào hệ thống                     │
├─────────────────────────────────────────────────────┤
│ Tên Module *                                        │
│ [_____________________________________________]     │
│                                                     │
│ Mã Module *                                         │
│ [_____________________________________________]     │
│                                                     │
│ Lĩnh vực *              │ Số tín chỉ *             │
│ [Chọn lĩnh vực ▼]      │ [___]                    │
│                                                     │
│ Thời lượng *            │ Trạng thái               │
│ [_____________]         │ [Hoạt động ▼]           │
│                                                     │
│ Điều kiện tiên quyết                               │
│ [_____________________________________________]     │
│                                                     │
│ Đề cương                                           │
│ [Chưa có ▼]                                        │
│                                                     │
├─────────────────────────────────────────────────────┤
│                              [Hủy]  [💾 Tạo mới]   │
└─────────────────────────────────────────────────────┘
```

## Workflows thường dùng

### Workflow 1: Tìm một module cụ thể

1. Vào tab **Module**
2. Gõ tên hoặc mã module vào thanh tìm kiếm
3. Kết quả hiển thị ngay lập tức

### Workflow 2: Xem tất cả module Lập trình

1. Vào tab **Module**
2. Chọn **"Lập trình"** ở dropdown Lĩnh vực
3. Danh sách chỉ hiển thị các module thuộc lĩnh vực Lập trình

### Workflow 3: Thêm module mới và upload đề cương

1. Click **"Tạo module mới"**
2. Điền đầy đủ thông tin
3. Click **"Tạo mới"**
4. Sau khi tạo, tìm module vừa tạo trong danh sách
5. Click menu 3 chấm → **"Xem chi tiết"**
6. Click **"Tải lên đề cương"**
7. Chọn file PDF/Word từ máy tính
8. File sẽ được tải lên và hiển thị trong danh sách

### Workflow 4: Cập nhật thông tin module

1. Tìm module cần sửa (dùng tìm kiếm hoặc lọc)
2. Click menu 3 chấm → **"Chỉnh sửa"**
3. Sửa các thông tin cần thiết
4. Click **"Cập nhật"**
5. Module sẽ được cập nhật với thông tin mới

### Workflow 5: Tạm dừng một module

1. Tìm module cần tạm dừng
2. Click menu 3 chấm → **"Chỉnh sửa"**
3. Thay đổi Trạng thái từ "Hoạt động" → "Tạm dừng"
4. Click **"Cập nhật"**

## Tích hợp API (Cần implement)

### 1. Lấy danh sách module

```typescript
GET /api/modules
Query params:
  - search?: string
  - field?: string
  - status?: string
  - page?: number
  - limit?: number
Response: {
  items: Module[],
  total: number,
  page: number,
  limit: number
}
```

### 2. Tạo module mới

```typescript
POST /api/modules
Body: {
  name: string,
  moduleId: string,
  field: string,
  credits: number,
  duration: string,
  prerequisite?: string,
  syllabus?: 'Có' | 'Chưa có',
  status?: 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành'
}
Response: Module
```

### 3. Cập nhật module

```typescript
PUT / api / modules / { id };
Body: Partial<Module>;
Response: Module;
```

### 4. Xóa module

```typescript
DELETE / api / modules / { id };
Response: {
    success: boolean;
}
```

### 5. Lấy chi tiết module

```typescript
GET / api / modules / { id };
Response: Module;
```

## Types

```typescript
type Module = {
    id: string;
    name: string; // Tên module
    moduleId: string; // Mã module (không đổi được)
    field: string; // Lĩnh vực
    credits: number; // Số tín chỉ
    duration: string; // Thời lượng
    prerequisite: string; // Điều kiện tiên quyết
    syllabus: 'Có' | 'Chưa có';
    status: 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành';
};
```

## Validation Rules

### Tên Module

- Bắt buộc
- Không được để trống
- Không giới hạn độ dài

### Mã Module

- Bắt buộc
- Không được để trống
- Không được trùng với module khác
- Không thể sửa sau khi tạo

### Lĩnh vực

- Bắt buộc
- Phải chọn từ danh sách: Kỹ thuật, Lập trình, Thiết kế, Kinh doanh

### Số tín chỉ

- Bắt buộc
- Phải là số nguyên
- Phải lớn hơn 0

### Thời lượng

- Bắt buộc
- Format tự do (ví dụ: "4 tháng", "12 tuần", "80 giờ")

### Điều kiện tiên quyết

- Không bắt buộc
- Mặc định là "Không"

### Đề cương

- Không bắt buộc
- Mặc định là "Chưa có"

### Trạng thái

- Không bắt buộc
- Mặc định là "Hoạt động"

## Toast Messages

### Thành công

- ✅ "Đã tạo module mới thành công"
- ✅ "Đã cập nhật module thành công"
- ✅ "Đã xóa module thành công"

### Lỗi

- ❌ "Tên module là bắt buộc"
- ❌ "Mã module là bắt buộc"
- ❌ "Lĩnh vực là bắt buộc"
- ❌ "Số tín chỉ phải lớn hơn 0"
- ❌ "Thời lượng là bắt buộc"
- ❌ "Mã module đã tồn tại"
- ❌ "Không thể xóa module đang được sử dụng"

## Tips & Best Practices

### 1. Đặt tên Module

- Sử dụng tên rõ ràng, dễ hiểu
- Ví dụ tốt: "Lập trình Java Cơ bản", "Thiết kế UI/UX"
- Tránh: "Module 1", "ABC123"

### 2. Đặt mã Module

- Sử dụng quy ước cố định: `{FIELD}{NUMBER}`
- Ví dụ: JAVA101, WEB201, DES301
- Giúp dễ phân loại và quản lý

### 3. Quản lý điều kiện tiên quyết

- Luôn ghi rõ module nào cần học trước
- Giúp học viên lên lộ trình học hợp lý

### 4. Sử dụng tìm kiếm và lọc

- Tìm kiếm nhanh theo tên/mã
- Lọc theo lĩnh vực để tổ chức tốt hơn
- Lọc theo trạng thái để quản lý module đang hoạt động

### 5. Phân loại lĩnh vực đúng

- Đảm bảo module được phân vào đúng lĩnh vực
- Giúp tìm kiếm và báo cáo chính xác

## Troubleshooting

### Không tìm thấy module

- Kiểm tra bộ lọc có đang bật không
- Thử xóa từ khóa tìm kiếm và reset filter
- Kiểm tra module có bị xóa không

### Không thể tạo module mới

- Kiểm tra tất cả trường bắt buộc đã điền chưa
- Kiểm tra mã module có bị trùng không
- Kiểm tra số tín chỉ có > 0 không

### Không thể cập nhật module

- Kiểm tra quyền truy cập
- Đảm bảo module không bị khóa
- Kiểm tra validation các trường

### Module không hiển thị sau khi tạo

- Kiểm tra bộ lọc trạng thái
- Thử refresh lại trang
- Kiểm tra module có được tạo thành công không

## Future Enhancements

- [ ] Import/Export module từ Excel
- [ ] Duplicate module để tạo nhanh
- [ ] Lịch sử thay đổi module
- [ ] Gán module vào chương trình
- [ ] Quản lý phiên bản module
- [ ] Template module mẫu
- [ ] Bulk actions (xóa/cập nhật nhiều)
- [ ] Advanced filters (theo tín chỉ, thời lượng)
