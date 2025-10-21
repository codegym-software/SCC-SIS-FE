# Hướng dẫn sử dụng tính năng Giảng dạy & Tương tác

## 📋 Tổng quan

Tính năng "Giảng dạy & Tương tác" cung cấp các công cụ quản lý lớp học toàn diện, bao gồm:

- **Tiến độ Module**: Quản lý việc bắt đầu và kết thúc các module học
- **Nhật ký Lớp học**: Ghi lại tiến độ, thông báo và ghi chú về lớp học
- **Điểm danh**: Theo dõi sự có mặt của học viên
- **Quản lý điểm thi**: Ghi nhận và quản lý điểm số của học viên

## 🚀 Cách truy cập

1. Đăng nhập vào hệ thống
2. Trong menu sidebar, chọn **"Giảng dạy & Tương tác"**
3. Chọn lớp học cần quản lý từ dropdown

## 📚 Tiến độ Module

### Chức năng chính:
- **Xem danh sách module**: Hiển thị tất cả module trong chương trình học
- **Bắt đầu module**: Nhấn nút "Bắt đầu" để bắt đầu module mới
- **Kết thúc module**: Nhấn nút "Kết thúc" khi hoàn thành module
- **Theo dõi tiến độ**: Xem phần trăm hoàn thành của module đang học

### Trạng thái module:
- 🔴 **Chưa bắt đầu**: Module chưa được bắt đầu
- 🔵 **Đang học**: Module đang được giảng dạy
- 🟢 **Hoàn thành**: Module đã kết thúc

### Cách sử dụng:
1. Chọn lớp học từ dropdown
2. Chuyển sang tab "Tiến độ Module"
3. Nhấn "Bắt đầu" để bắt đầu module
4. Nhấn "Kết thúc" để hoàn thành module

## 📝 Nhật ký Lớp học

### Chức năng chính:
- **Tạo nhật ký mới**: Ghi lại các hoạt động trong lớp học
- **Tìm kiếm nhật ký**: Tìm kiếm theo tiêu đề hoặc nội dung
- **Lọc theo loại**: Lọc nhật ký theo loại (Tiến độ học tập, Bài tập, Thông báo, Khác)
- **Xem lịch sử**: Xem tất cả nhật ký đã tạo

### Loại nhật ký:
- 📚 **Tiến độ học tập**: Ghi lại tiến độ học tập của học viên
- 📋 **Bài tập**: Thông báo về bài tập và deadline
- 📢 **Thông báo**: Các thông báo quan trọng cho lớp học
- 📄 **Khác**: Các ghi chú khác

### Cách tạo nhật ký:
1. Chuyển sang tab "Nhật ký Lớp học"
2. Nhấn nút "+ Viết Nhật ký mới"
3. Điền thông tin:
   - Tiêu đề nhật ký
   - Nội dung chi tiết
   - Loại nhật ký
   - Ngày và giờ
   - Module liên quan (tùy chọn)
4. Nhấn "Tạo Nhật ký"

## 👥 Điểm danh

### Chức năng chính:
- **Chọn ngày điểm danh**: Chọn ngày cần điểm danh
- **Đánh dấu trạng thái**: Có mặt, Vắng mặt, Đi muộn, Có phép
- **Thêm ghi chú**: Ghi chú cho từng học viên
- **Xem thống kê**: Xem số lượng học viên theo từng trạng thái

### Trạng thái điểm danh:
- ✅ **Có mặt**: Học viên có mặt đúng giờ
- ❌ **Vắng mặt**: Học viên không có mặt
- ⏰ **Đi muộn**: Học viên đến muộn
- 📋 **Có phép**: Học viên vắng mặt có phép

### Cách điểm danh:
1. Từ trang "Quản lý Lớp học", nhấn "Điểm danh" trong menu actions
2. Chọn ngày điểm danh
3. Đánh dấu trạng thái cho từng học viên
4. Thêm ghi chú nếu cần
5. Nhấn "Lưu điểm danh"

## 📊 Quản lý điểm thi

### Chức năng chính:
- **Thêm điểm mới**: Ghi nhận điểm của học viên
- **Chỉnh sửa điểm**: Cập nhật điểm đã có
- **Xóa điểm**: Xóa điểm không cần thiết
- **Tính điểm trung bình**: Tự động tính điểm trung bình của lớp

### Loại điểm:
- 📝 **Kiểm tra**: Điểm kiểm tra thường xuyên
- 📋 **Giữa kỳ**: Điểm thi giữa kỳ
- 📄 **Cuối kỳ**: Điểm thi cuối kỳ
- 📚 **Bài tập**: Điểm bài tập và dự án

### Cách thêm điểm:
1. Từ trang "Quản lý Lớp học", nhấn "Quản lý điểm thi" trong menu actions
2. Nhấn nút "+ Thêm điểm"
3. Điền thông tin:
   - Chọn học viên
   - Loại điểm
   - Điểm số và điểm tối đa
   - Ngày thi
   - Ghi chú (tùy chọn)
4. Nhấn "Thêm điểm"

## 🔧 Cấu hình API

### Endpoints cần thiết:

#### Classes
- `GET /api/classes` - Lấy danh sách lớp học
- `GET /api/classes/{id}/enrollments` - Lấy danh sách học viên trong lớp

#### Modules
- `GET /api/classes/{id}/modules` - Lấy danh sách module của lớp
- `POST /api/classes/{id}/modules/{moduleId}/start` - Bắt đầu module
- `POST /api/classes/{id}/modules/{moduleId}/complete` - Kết thúc module

#### Class Logs
- `GET /api/classes/{id}/logs` - Lấy nhật ký lớp học
- `POST /api/classes/{id}/logs` - Tạo nhật ký mới

#### Attendance
- `GET /api/classes/{id}/attendance?date={date}` - Lấy điểm danh theo ngày
- `POST /api/classes/{id}/attendance` - Lưu điểm danh

#### Scores
- `GET /api/classes/{id}/scores` - Lấy danh sách điểm
- `POST /api/classes/{id}/scores` - Thêm điểm mới
- `PUT /api/classes/{id}/scores/{scoreId}` - Cập nhật điểm
- `DELETE /api/classes/{id}/scores/{scoreId}` - Xóa điểm

## 🎨 Giao diện

### Responsive Design:
- Tương thích với mọi thiết bị (desktop, tablet, mobile)
- Layout linh hoạt và dễ sử dụng
- Màu sắc nhất quán với hệ thống

### Components chính:
- `TeachingInteractionPage`: Trang chính với tab navigation
- `ModuleProgressTab`: Quản lý tiến độ module
- `ClassLogTab`: Quản lý nhật ký lớp học
- `AttendanceModal`: Modal điểm danh
- `ScoresModal`: Modal quản lý điểm thi

## 🚨 Xử lý lỗi

### Lỗi thường gặp:
- **Lỗi tải dữ liệu**: Kiểm tra kết nối API và quyền truy cập
- **Lỗi lưu dữ liệu**: Kiểm tra validation và format dữ liệu
- **Lỗi không tìm thấy**: Kiểm tra ID và quyền truy cập

### Debug:
- Mở Developer Tools để xem lỗi console
- Kiểm tra Network tab để xem request/response
- Kiểm tra API endpoints có hoạt động đúng không

## 📱 Mobile Support

Tất cả tính năng đều được tối ưu cho mobile:
- Touch-friendly buttons
- Responsive modals
- Swipe gestures
- Optimized layouts

## 🔐 Bảo mật

- Tất cả API calls đều có authentication
- Kiểm tra quyền truy cập trước khi thực hiện actions
- Validate dữ liệu đầu vào
- Error handling an toàn

## 📈 Performance

- Lazy loading cho các component lớn
- Debounced search
- Optimized re-renders
- Efficient state management

## 🆘 Hỗ trợ

Nếu gặp vấn đề, hãy:
1. Kiểm tra console logs
2. Kiểm tra network requests
3. Liên hệ team phát triển
4. Tạo issue trên GitHub repository