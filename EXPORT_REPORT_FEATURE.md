# Chức Năng Xuất Báo Cáo Excel

## Tổng Quan
Chức năng xuất báo cáo Excel cho phép admin xuất dữ liệu khoản vay theo nhiều khoảng thời gian khác nhau với đầy đủ thông tin chi tiết của từng khách hàng.

## Tính Năng

### 1. Chọn Khoảng Thời Gian
- **Hôm nay**: Xuất báo cáo các khoản vay được tạo trong ngày hôm nay
- **7 ngày qua**: Xuất báo cáo các khoản vay trong 7 ngày gần nhất
- **30 ngày qua**: Xuất báo cáo các khoản vay trong 30 ngày gần nhất
- **Tùy chọn**: Cho phép chọn ngày bắt đầu và kết thúc tùy ý

### 2. Thông Tin Trong Báo Cáo
Báo cáo Excel bao gồm các thông tin sau:

#### Thông Tin Cá Nhân
- Mã khoản vay
- Họ và tên
- Số điện thoại
- Giới tính
- Ngày sinh
- CMND/CCCD
- Thương hiệu điện thoại
- Địa chỉ

#### Thông Tin Liên Hệ
- Số điện thoại người thân
- Số điện thoại công ty

#### Thông Tin Ngân Hàng
- Số tài khoản ngân hàng
- Tên ngân hàng

#### Chi Tiết Khoản Vay
- Số tiền vay
- Kỳ hạn vay (ngày)
- Số tiền trả hàng ngày
- Tổng số tiền phải trả

#### Trạng Thái & Ghi Chú
- Trạng thái xử lý
- Ghi chú
- Bước hiện tại
- Ngày tạo
- Ngày cập nhật

## Cách Sử Dụng

### 1. Truy Cập Dashboard
1. Đăng nhập vào hệ thống admin
2. Vào trang Dashboard
3. Nhấn nút "Xuất báo cáo" ở góc trên bên phải

### 2. Chọn Khoảng Thời Gian
1. Chọn một trong các tùy chọn:
   - Hôm nay
   - 7 ngày qua
   - 30 ngày qua
   - Tùy chọn

2. Nếu chọn "Tùy chọn":
   - Nhập ngày bắt đầu
   - Nhập ngày kết thúc

### 3. Xuất Báo Cáo
1. Nhấn nút "Xuất Excel"
2. Hệ thống sẽ tải dữ liệu và tạo file Excel
3. File sẽ được tải về máy với tên: `bao-cao-khoan-vay-[khoang-thoi-gian]-[ngay-gio].xlsx`

## API Endpoints

### GET /api/admin/loans/export
Xuất dữ liệu khoản vay theo bộ lọc

**Query Parameters:**
- `startDate` (optional): Ngày bắt đầu (format: YYYY-MM-DD)
- `endDate` (optional): Ngày kết thúc (format: YYYY-MM-DD)
- `status` (optional): Trạng thái khoản vay
- `phoneNumber` (optional): Số điện thoại
- `fullName` (optional): Họ tên

**Headers:**
- `Authorization: Bearer <token>`
- `x-admin-api-key: <admin-api-key>`

**Response:**
```json
[
  {
    "_id": "string",
    "loanApplicationId": "string",
    "fullName": "string",
    "phoneNumber": "string",
    "gender": "MALE|FEMALE|OTHER",
    "dob": "date",
    "identityNumber": "string",
    "phoneBrand": "string",
    "location": "string",
    "relativePhone": "string",
    "companyPhone": "string",
    "bankAccount": "string",
    "bankName": "string",
    "loanAmount": "number",
    "loanTerm": "number",
    "dailyPayment": "number",
    "totalRepayment": "number",
    "status": "string",
    "notes": "string",
    "currentStep": "number",
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

## Cấu Trúc File Excel

### Sheet: "Báo cáo khoản vay"
- Cột A: Mã khoản vay
- Cột B: Họ và tên
- Cột C: Số điện thoại
- Cột D: Giới tính
- Cột E: Ngày sinh
- Cột F: CMND/CCCD
- Cột G: Thương hiệu điện thoại
- Cột H: Địa chỉ
- Cột I: Số điện thoại người thân
- Cột J: Số điện thoại công ty
- Cột K: Số tài khoản ngân hàng
- Cột L: Tên ngân hàng
- Cột M: Số tiền vay
- Cột N: Kỳ hạn vay (ngày)
- Cột O: Số tiền trả hàng ngày
- Cột P: Tổng số tiền phải trả
- Cột Q: Trạng thái
- Cột R: Ghi chú
- Cột S: Bước hiện tại
- Cột T: Ngày tạo
- Cột U: Ngày cập nhật

## Lưu Ý

1. **Quyền Truy Cập**: Chỉ admin có quyền `loan:read` mới có thể xuất báo cáo
2. **Giới Hạn Dữ Liệu**: Không có giới hạn số lượng bản ghi xuất
3. **Định Dạng File**: File Excel (.xlsx) với encoding UTF-8
4. **Tên File**: Tự động đặt tên theo khoảng thời gian và thời gian xuất
5. **Xử Lý Lỗi**: Hiển thị thông báo lỗi nếu không có dữ liệu hoặc lỗi kết nối

## Troubleshooting

### Lỗi Thường Gặp

1. **"Không tìm thấy token đăng nhập"**
   - Đăng nhập lại vào hệ thống admin

2. **"Không có dữ liệu để xuất báo cáo"**
   - Kiểm tra lại khoảng thời gian đã chọn
   - Đảm bảo có dữ liệu khoản vay trong khoảng thời gian đó

3. **"Không thể xuất báo cáo"**
   - Kiểm tra kết nối mạng
   - Thử lại sau vài phút

### Hỗ Trợ
Nếu gặp vấn đề, vui lòng liên hệ:
- Email: support@15s.com
- Hotline: 0815.320.648
