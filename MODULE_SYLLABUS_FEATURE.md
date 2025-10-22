# Tính năng Quản lý Đề cương Module

## Mô tả

Tính năng cho phép Quản lý đào tạo (Training Manager) đính kèm và quản lý đề cương chi tiết (syllabus) cho từng module học.

## Các chức năng chính

### 1. Xem chi tiết Module

- Truy cập: Trang **Chương trình & Module** → Tab **Module** → Click vào menu hành động (3 chấm) → Chọn **Xem chi tiết**
- Hiển thị:
    - Thông tin cơ bản của module (Lĩnh vực, Số tín chỉ, Thời lượng, Trạng thái, Điều kiện tiên quyết)
    - Danh sách đề cương đã tải lên

### 2. Tải lên đề cương

- Click nút **"Tải lên đề cương"** ở góc phải trên
- Chọn file từ máy tính
- Hỗ trợ các định dạng:
    - **PDF** (.pdf)
    - **Word** (.doc, .docx)
    - **PowerPoint** (.ppt, .pptx)
    - **Excel** (.xls, .xlsx)
- Giới hạn kích thước: **50MB**

### 3. Quản lý file đề cương

Mỗi file đề cương hiển thị:

- 📄 Icon theo loại file
- **Tên file**: Tên đầy đủ của file
- **Loại file**: PDF, DOCX, XLSX, v.v.
- **Kích thước**: Tính bằng KB hoặc MB
- **Người tải lên**: Tên người dùng đã upload
- **Ngày tải lên**: Ngày giờ tải lên file
- **Hành động**:
    - 🔽 **Tải xuống**: Download file về máy
    - 🗑️ **Xóa**: Xóa file (có xác nhận)

## Giao diện

### Thông tin Module

```
┌─────────────────────────────────────────────────────┐
│ 📄 Lập trình Java Cơ bản           Mã: JAVA101      │
├─────────────────────────────────────────────────────┤
│ Thông tin Module                                     │
│ ┌───────────────┬───────────────┐                   │
│ │ Lĩnh vực      │ Số tín chỉ    │                   │
│ │ Kỹ thuật      │ 3 tín chỉ     │                   │
│ ├───────────────┼───────────────┤                   │
│ │ Thời lượng    │ Trạng thái    │                   │
│ │ 12 tuần       │ 🟢 Hoạt động  │                   │
│ └───────────────┴───────────────┘                   │
└─────────────────────────────────────────────────────┘
```

### Danh sách Đề cương

```
┌─────────────────────────────────────────────────────┐
│ 📤 Đề cương chi tiết          [Tải lên đề cương]   │
├─────────────────────────────────────────────────────┤
│ ℹ️ Lưu ý: Hỗ trợ PDF, Word, PowerPoint, Excel      │
│   Kích thước tối đa: 50MB                           │
├─────────────────────────────────────────────────────┤
│ 📄 Giáo trình Java Cơ bản - Tuần 1-4.pdf          │
│    PDF • 2.5 MB • Nguyễn Văn A • 19/12/2024 10:30  │
│                                         [⬇] [🗑️]    │
├─────────────────────────────────────────────────────┤
│ 📝 Bài tập thực hành OOP.docx                      │
│    DOCX • 856 KB • Trần Thị B • 15/12/2024 14:20   │
│                                         [⬇] [🗑️]    │
└─────────────────────────────────────────────────────┘
```

## Cấu trúc File

### Component chính

```
src/features/users/pages/programs/
├── ProgramsPage.tsx              # Trang chính
├── modules-list.tsx              # Danh sách modules
└── components/
    └── ModuleDetailModal.tsx     # Modal chi tiết module & quản lý đề cương
```

### Types

```typescript
type SyllabusFile = {
    id: string;
    fileName: string; // Tên file
    fileType: string; // Loại file (PDF, DOCX, ...)
    fileSize: number; // Kích thước (bytes)
    uploadedBy: string; // Người tải lên
    uploadedAt: string; // Ngày giờ tải lên (ISO string)
    downloadUrl?: string; // URL để download
};

type Module = {
    id: string;
    name: string; // Tên module
    moduleId: string; // Mã module
    field: string; // Lĩnh vực
    credits: number; // Số tín chỉ
    duration: string; // Thời lượng
    prerequisite: string; // Điều kiện tiên quyết
    syllabus: 'Có' | 'Chưa có';
    status: 'Hoạt động' | 'Tạm dừng' | 'Hoàn thành';
    description?: string; // Mô tả
};
```

## API Integration (Cần implement)

### 1. Lấy danh sách file đề cương

```typescript
GET /api/modules/{moduleId}/syllabus
Response: SyllabusFile[]
```

### 2. Upload file đề cương

```typescript
POST /api/modules/{moduleId}/syllabus
Content-Type: multipart/form-data
Body: { file: File }
Response: SyllabusFile
```

### 3. Xóa file đề cương

```typescript
DELETE / api / modules / { moduleId } / syllabus / { fileId };
Response: {
    success: boolean;
}
```

### 4. Download file đề cương

```typescript
GET / api / modules / { moduleId } / syllabus / { fileId } / download;
Response: File(binary);
```

## Validation

### Upload File

- ✅ Chỉ chấp nhận: PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX
- ✅ Kích thước tối đa: 50MB
- ✅ Hiển thị thông báo lỗi nếu không hợp lệ

### Xóa File

- ✅ Yêu cầu xác nhận trước khi xóa
- ✅ Hiển thị thông báo thành công/lỗi

## Toast Messages

### Thành công

- ✅ "Đã tải lên file {fileName}"
- ✅ "Đã xóa file {fileName}"
- ✅ "Đang tải file {fileName}"

### Lỗi

- ❌ "Kích thước file không được vượt quá 50MB"
- ❌ "Chỉ hỗ trợ file PDF, Word, Excel, PowerPoint"
- ❌ "Không thể tải lên file. Vui lòng thử lại."
- ❌ "Không thể xóa file. Vui lòng thử lại."

## Responsive Design

- ✅ Desktop: Hiển thị đầy đủ thông tin
- ✅ Mobile: Layout điều chỉnh cho màn hình nhỏ
- ✅ Scroll: Danh sách file có scroll khi quá nhiều

## Future Enhancements

- [ ] Preview file PDF trực tiếp trong modal
- [ ] Phân quyền upload/xóa theo role
- [ ] Version control cho file đề cương
- [ ] Tag/category cho file
- [ ] Tìm kiếm file theo tên
- [ ] Sắp xếp file theo ngày/tên/kích thước
- [ ] Bulk upload nhiều file cùng lúc
- [ ] Lịch sử thay đổi file

## Testing Checklist

- [ ] Upload file hợp lệ
- [ ] Upload file vượt quá 50MB
- [ ] Upload file không đúng định dạng
- [ ] Download file
- [ ] Xóa file
- [ ] Hiển thị danh sách file
- [ ] Format hiển thị kích thước file
- [ ] Format hiển thị ngày giờ
- [ ] Responsive trên mobile
- [ ] Toast notifications
