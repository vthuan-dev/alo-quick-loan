# Sửa Lỗi Route Order - Vấn Đề Cuối Cùng

## Vấn Đề Thực Sự

### Lỗi Server: `CastError: Cast to ObjectId failed for value "export"`

**Nguyên nhân:**
- Route `@Get('loans/export')` đứng sau route `@Get('loans/:id')`
- NestJS match route `:id` trước và coi "export" như một ID
- Dẫn đến lỗi `CastError` khi cố gắng cast "export" thành ObjectId

## Giải Pháp

### 1. Thay Đổi Thứ Tự Route
```typescript
// ❌ SAI - Route pattern trước route cụ thể
@Get('loans/:id')
@Get('loans/export')

// ✅ ĐÚNG - Route cụ thể trước route pattern
@Get('loans/export')
@Get('loans/:id')
```

### 2. Route Order Rules trong NestJS
1. **Route cụ thể** phải đứng trước **route pattern**
2. Route pattern như `:id`, `:slug` sẽ match bất kỳ string nào
3. Nếu route cụ thể đứng sau, sẽ không bao giờ được gọi

### 3. Code Sau Khi Sửa
```typescript
// Loan Management
@Get('loans')
async getAllLoans() { ... }

// Export loans for report - MUST be before :id route
@Get('loans/export')
async exportLoans() { ... }

@Get('loans/:id')
async getLoanById() { ... }
```

## Test

### 1. Build Backend
```bash
npm run build
```

### 2. Test API
```bash
node test-export-with-token.js
```

### 3. Expected Response
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

## Lưu Ý Quan Trọng

1. **Route Order**: Luôn đặt route cụ thể trước route pattern
2. **Pattern Matching**: `:id` sẽ match bất kỳ string nào
3. **Debugging**: Kiểm tra server logs để thấy route nào được match
4. **Best Practice**: Sử dụng prefix cụ thể cho các route đặc biệt

## Kết Quả

✅ Route export được match đúng  
✅ Không còn lỗi `CastError`  
✅ API trả về array trực tiếp  
✅ Frontend có thể xử lý dữ liệu  
✅ Chức năng xuất Excel hoạt động bình thường
