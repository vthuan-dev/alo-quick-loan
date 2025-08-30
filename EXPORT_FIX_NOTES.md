# Sửa Lỗi Export API

## Vấn Đề Đã Gặp

### Lỗi: `"loans.map is not a function"` và Response: `{"format":"csv","data":[],"count":0}`

**Nguyên nhân:**
- Có **2 endpoint export trùng nhau** tại URL `/api/admin/loans/export`:
  1. `admin-loan.controller.ts` với `@Controller('api/admin/loans')` + `@Get('export')`
  2. `admin.controller.ts` với `@Controller('api/admin')` + `@Get('loans/export')`

- Endpoint đầu tiên đang trả về format object với cấu trúc:
  ```javascript
  {
    format: 'csv',
    data: [...],
    count: 0
  }
  ```

- Frontend mong đợi array trực tiếp nhưng nhận được object

## Giải Pháp Đã Áp Dụng

### 1. Xóa Endpoint Trùng Lặp
- Comment out endpoint export trong `admin-loan.controller.ts`
- Comment out method `exportApplications` trong `admin-loan.service.ts`
- Xóa import `ExportLoansDto` không cần thiết

### 2. Cập Nhật Frontend
- Thêm logic xử lý response có thể là array hoặc object
- Kiểm tra và extract data từ object nếu cần

### 3. Sử Dụng Endpoint Đúng
- Chỉ sử dụng endpoint trong `admin.controller.ts` và `admin.service.ts`
- Endpoint này trả về array trực tiếp như mong đợi

## Kiểm Tra Sau Khi Sửa

### API Response Mong Đợi:
```json
[
  {
    "_id": "...",
    "loanApplicationId": "loan_xxx",
    "fullName": "...",
    "phoneNumber": "...",
    // ... other fields
  }
]
```

### Frontend Logic:
```javascript
// Xử lý response có thể là array hoặc object
let loans = response;
if (response && typeof response === 'object' && !Array.isArray(response)) {
  loans = (response as any).data || (response as any).loans || [];
}
```

## Lưu Ý

1. **Tránh Endpoint Trùng Lặp**: Luôn kiểm tra route conflicts khi thêm endpoint mới
2. **Consistent Response Format**: Đảm bảo tất cả API trả về format nhất quán
3. **Frontend Resilience**: Code frontend nên xử lý được nhiều format response khác nhau

## Test

Để test sau khi sửa:
1. Chạy backend: `npm run start:dev`
2. Truy cập admin dashboard
3. Nhấn "Xuất báo cáo"
4. Chọn khoảng thời gian và nhấn "Xuất Excel"
5. Kiểm tra file Excel được tạo thành công
