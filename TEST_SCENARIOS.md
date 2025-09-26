# 🧪 Test Scenarios - Center Soft Delete Feature

## 🚀 Khởi động Frontend

```bash
cd SCC-SIS-FE
npm install
npm run dev
```

## 📋 Test Cases

### 1. **UI Display Tests**

#### 1.1 Trang Centers hiển thị đúng
- [ ] Hiển thị danh sách centers
- [ ] Hiển thị trạng thái "Hoạt động" / "Không hoạt động"
- [ ] Stats hiển thị đúng (tổng centers, centers active, tổng học viên)
- [ ] Filter theo trạng thái hoạt động
- [ ] Search theo tên/mã center

#### 1.2 Modal Create/Edit
- [ ] Mở modal tạo center mới
- [ ] Form validation: required fields
- [ ] Hiển thị thông tin khi edit center
- [ ] Hiển thị metadata (ngày tạo, cập nhật, trạng thái) khi edit

### 2. **Functionality Tests**

#### 2.1 CRUD Operations
- [ ] ✅ **Create**: Tạo center mới thành công
- [ ] ✅ **Read**: Load danh sách centers từ API
- [ ] ✅ **Update**: Cập nhật thông tin center
- [ ] ❌ **Delete**: Không có delete cứng

#### 2.2 Soft Delete Operations
- [ ] 🔄 **Deactivate**: Vô hiệu hóa center (status: active → inactive)
- [ ] 🔄 **Activate**: Kích hoạt lại center (status: inactive → active)
- [ ] 👁️ **View**: Chỉ hiển thị centers active cho user thường
- [ ] 👑 **Admin View**: Super Admin xem được tất cả centers

### 3. **Permission Tests**

#### 3.1 User Permissions
- [ ] `centers:read` - Xem danh sách centers active
- [ ] `centers:create` - Hiển thị nút "Thêm center mới"
- [ ] `centers:update` - Hiển thị menu "Chỉnh sửa"
- [ ] `centers:disable` - Hiển thị menu "Vô hiệu hóa"/"Kích hoạt"

#### 3.2 Super Admin Permissions
- [ ] `centers:admin` - Xem tất cả centers (bao gồm inactive)
- [ ] Filter theo trạng thái (All/Active/Inactive)

### 4. **Integration Tests**

#### 4.1 API Integration
- [ ] Gọi API `GET /api/centers` thành công
- [ ] Gọi API `POST /api/centers` để tạo center
- [ ] Gọi API `PUT /api/centers/{id}` để cập nhật
- [ ] Gọi API `PATCH /api/centers/{id}/deactivate`
- [ ] Gọi API `PATCH /api/centers/{id}/activate`

#### 4.2 Error Handling
- [ ] Hiển thị toast error khi API fail
- [ ] Hiển thị loading state
- [ ] Validation error từ backend
- [ ] Network error handling

### 5. **Edge Cases**

#### 5.1 Data Edge Cases
- [ ] Danh sách trống (không có centers)
- [ ] Centers có dữ liệu null/undefined
- [ ] Tên center rất dài
- [ ] Ký tự đặc biệt trong tên/mã

#### 5.2 User Actions
- [ ] Click nhanh nhiều lần (debounce)
- [ ] Đóng modal khi đang submit
- [ ] Refresh trang sau khi thao tác
- [ ] Back/Forward browser

## 🎯 Test Steps chi tiết

### Test Case: Vô hiệu hóa Center

1. **Chuẩn bị**: Đăng nhập với tài khoản có quyền `centers:disable`
2. **Thực hiện**:
   - Vào trang Centers
   - Click vào menu "..." của một center đang hoạt động
   - Click "Vô hiệu hóa"
   - Confirm trong dialog
3. **Kỳ vọng**:
   - Hiển thị toast "Vô hiệu hóa thành công"
   - Center không còn xuất hiện trong danh sách (với user thường)
   - Stats "Đang hoạt động" giảm đi 1
   - Super Admin vẫn thấy center với status "Không hoạt động"

### Test Case: Kích hoạt lại Center

1. **Chuẩn bị**: Đăng nhập Super Admin, có ít nhất 1 center inactive
2. **Thực hiện**:
   - Vào trang Centers 
   - Filter "Không hoạt động"
   - Click menu "..." của center inactive
   - Click "Kích hoạt"
   - Confirm trong dialog
3. **Kỳ vọng**:
   - Hiển thị toast "Kích hoạt thành công"
   - Center xuất hiện lại trong danh sách active
   - Stats cập nhật chính xác

## 🔧 Debug Tools

### Browser DevTools
- **Network tab**: Kiểm tra API calls
- **Console**: Xem error logs
- **Application tab**: Kiểm tra localStorage, sessionStorage

### API Testing
- **VS Code REST Client**: Sử dụng file `test-centers-api.http`
- **Postman**: Import requests từ curl commands
- **Browser Network**: Inspect request/response

## 🚨 Common Issues

### Authentication Issues
- Kiểm tra JWT token có hợp lệ
- Verify user permissions trong token claims
- Keycloak server có đang chạy

### API Issues
- Backend server có đang chạy (port 8080)
- Database migration đã chạy
- CORS configuration đúng

### Frontend Issues
- Node modules đã install
- Environment variables đúng
- API base URL chính xác
