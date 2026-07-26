# 📄 BÁO CÁO HỦY MOCK & HƯỚNG DẪN TÍCH HỢP TƯƠNG LAI (HANDOFF & BE INTEGRATION GUIDE)

Tài liệu này tổng hợp toàn bộ ngữ cảnh công việc đã triển khai trên Frontend (nhánh `feat/expert-acp-booking`), danh sách các Endpoint & Field yêu cầu Backend (BE) cung cấp, hướng dẫn chuyển đổi từ **Mock API ➔ Real Backend**, và thông tin tài khoản test ngầm định.

---

## 1. 📌 Tóm Tắt Các Tính Năng Đã Hoàn Thành Trên Frontend

1. **Sidebar Layout Chuẩn Cho Bác Sĩ (`(expert)` App Route):**
   - Đã chuyển giao diện Bác sĩ sang dạng Sidebar Layout chuyên nghiệp (Shadcn UI `SidebarProvider`), tích hợp menu Ca tư vấn, Phác đồ điều trị, Lịch khám và nút **Đăng Xuất (Logout)** ở chân Sidebar.
2. **Thanh Toán Đặt Lịch Bằng Ví Nội Bộ (`Wallet & Top-up Modal`):**
   - Quản lý số dư Ví (`balanceVnd`) & Lịch sử giao dịch.
   - Đặt lịch khám bắt buộc trừ tiền Ví. Bổ sung Modal Nạp Tiền Ví (`WalletTopUpModal`) khi số dư không đủ.
3. **Stepper Wizard 4 Bước Lập Phác Đồ & Tự Động Lưu Nháp (Draft Protection):**
   - Bác sĩ lập Phác đồ 4 bước (Tổng quan ➔ Chọn Active Ingredients ➔ Lọc Sản phẩm tương thích ➔ Rule-Engine sinh Routine Sáng/Tối & Tinh chỉnh).
   - Tự động lưu bản nháp vào `LocalStorage` (`glowscan_draft_treatment_[customerId]`). Khôi phục 100% dữ liệu nếu mất mạng/F5.
4. **Phác Đồ Da & Nút Tái Khám Miễn Phí 0đ (Customer View):**
   - Giao diện Khách hàng xem Phác đồ active kèm **Ribbon Badge `PHÁC ĐỒ ACTIVE`**.
   - Nút **`🔁 Đặt Lịch Tái Khám (Miễn Phí 0đ)`** giúp Khách hàng đã mua Phác đồ tái khám không mất phí tư vấn.
5. **Lớp Đệm Adapter Shield (`treatment.mapper.ts`):**
   - Lớp Mapper biến đổi dữ liệu an toàn, chống crash/vỡ UI dù BE có trả thừa hay thiếu field.

---

## 2. 🔄 HƯỚNG DẪN TẮT MOCK & NỐI DATABASE THẬT (REAL BE)

Để chuyển hệ thống từ chạy Mock sang kết nối thẳng tới Backend Database thật, bạn chỉ cần thay đổi **1 dòng cấu hình biến môi trường**:

### Tệp cấu hình: `.env.local` (trong thư mục `capstone-fe`)

```env
# 🔴 Cấu hình chạy Mock (Hiện tại):
NEXT_PUBLIC_USE_MOCK_API=true

# 🟢 Cấu hình Nối Database Thật (Khi BE đã push code):
NEXT_PUBLIC_USE_MOCK_API=false
```

👉 **Sau khi sửa `NEXT_PUBLIC_USE_MOCK_API=false`**, hãy lưu tệp và F5 (Refresh) lại trình duyệt. Tất cả các API call (`/wallets/me`, `/bookings/:id/pay`, `/treatments`) sẽ lập tức gọi trực tiếp tới Backend local (`http://localhost:3000` hoặc `/api/be/...`).

---

## 3. 📋 DANH SÁCH API & FIELDS BE CẦN CUNG CẤP (BE GAP AUDIT REPORT)

Dưới đây là danh sách chi tiết các Endpoint và Cấu trúc Field mà Frontend kỳ vọng Backend sẽ trả về:

### 3.1 Nhóm API Ví Thanh Toán (`Wallet`)

| Method | Endpoint Yêu Cầu           | Mục Đích                       | Field Cần Trả Về Trong Response                                                                   |
| ------ | -------------------------- | ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `GET`  | `/wallets/me`              | Lấy số dư ví khách hàng        | `{ id: string, userId: string, balanceVnd: number, isActive: boolean }`                           |
| `POST` | `/bookings/:id/pay`        | Trừ tiền ví thanh toán booking | `{ id: string, balanceVnd: number }` (Ném lỗi HTTP 400 nếu số dư không đủ)                        |
| `POST` | `/wallets/top-up`          | Nạp tiền vào ví                | Body: `{ amountVnd: number }` ➔ Trả về: Wallet mới đã cập nhật số dư                              |
| `GET`  | `/wallets/me/transactions` | Lấy lịch sử giao dịch ví       | Array of `{ id, amountVnd, type: 'CONSULTATION_PAYMENT'\|'TOP_UP'\|'REFUND', status, createdAt }` |

### 3.2 Nhóm API Phác Đồ Điều Trị (`Treatments`)

| Method  | Endpoint Yêu Cầu                         | Mục Đích                       | Field Cần Trả Về Trong Response                                                         |
| ------- | ---------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------- |
| `GET`   | `/treatments?customerId=...`             | Danh sách phác đồ da của khách | Array of `TreatmentPlan` (Xem cấu trúc bên dưới)                                        |
| `GET`   | `/treatments/:id`                        | Chi tiết 1 phác đồ             | Object `TreatmentPlan`                                                                  |
| `POST`  | `/treatments`                            | Bác sĩ tạo phác đồ mới         | Body: `{ customerId, title, totalFeeVnd, phases: [...] }` ➔ Trả về: `TreatmentPlan` mới |
| `PATCH` | `/treatments/:id/phases/:phaseId/active` | Kích hoạt Phase mới            | Trả về: `TreatmentPlan` đã cập nhật status Phase                                        |

### 3.3 Cấu Trúc JSON Mẫu Backend Cần Trả Về (`TreatmentPlan` Interface)

```json
{
  "id": "tp_123456",
  "customerId": "user_customer_demo",
  "customerName": "normal111",
  "expertId": "seed-expert-d1-derma",
  "expertName": "Dr. Nguyen Van An",
  "title": "Phác đồ điều trị mụn & phục hồi da",
  "totalFeeVnd": 1200000,
  "status": "ACTIVE",
  "currentPhaseNumber": 1,
  "createdAt": "2026-07-26T15:00:00.000Z",
  "updatedAt": "2026-07-26T15:00:00.000Z",
  "phases": [
    {
      "id": "phase_1",
      "phaseNumber": 1,
      "title": "Giai đoạn 1: Giảm viêm & Cấp ẩm phục hồi",
      "durationWeeks": 2,
      "status": "ACTIVE",
      "notes": "Tuần 1-2 tập trung phục hồi màng ẩm da.",
      "targetIngredients": [
        {
          "id": "ing_1",
          "name": "Salicylic Acid (BHA)",
          "category": "Exfoliant"
        },
        {
          "id": "ing_2",
          "name": "Niacinamide (Vitamin B3)",
          "category": "Barrier"
        }
      ],
      "amSteps": [
        {
          "id": "step_am_1",
          "order": 1,
          "timeOfDay": "AM",
          "stepName": "Sữa rửa mặt dịu nhẹ",
          "productName": "GlowScan Gentle Cleanser",
          "frequencyPreset": "Hàng ngày",
          "instructionPreset": "Thoa mỏng toàn mặt"
        }
      ],
      "pmSteps": [
        {
          "id": "step_pm_1",
          "order": 1,
          "timeOfDay": "PM",
          "stepName": "Serum BHA 2%",
          "productName": "GlowScan Salicylic Clearing Solution",
          "frequencyPreset": "Cách ngày",
          "instructionPreset": "Dùng 2-3 giọt"
        }
      ]
    }
  ]
}
```

---

## 4. 🔑 THÔNG TIN TÀI KHOẢN TEST & SETUP SWAGGER LOCAL

### 4.1 Tài Khoản Kiểm Thử Ngầm Định (Test Credentials)

| Vai Trò (Role)     | Username / ID                              | Mật Khẩu (Default) | Mục Đích Test                                                                            |
| ------------------ | ------------------------------------------ | ------------------ | ---------------------------------------------------------------------------------------- |
| **Bác Sĩ Da Liễu** | `seed-expert-d1-derma` (Dr. Nguyen Van An) | `Password123!`     | Đăng nhập Portal `/expert`, duyệt ca hẹn, bấm **"Lập Phác Đồ Điều Trị"**                 |
| **Khách Hàng**     | `user_customer_demo` (Customer normal111)  | `Password123!`     | Đặt lịch khám `/booking`, thanh toán Ví `/booking/[id]/checkout`, xem Phác đồ `/profile` |

### 4.2 Địa Chỉ Swagger & Kiểm Thử API Local (BE Swagger URLs)

- **Swagger Docs:** `http://localhost:3000/api/docs` hoặc `http://localhost:3000/docs` (Khi chạy Backend local NestJS).
- **Kiểm thử cURL kiểm tra Ví local:**

  ```bash
  # 1. Lấy số dư ví hiện tại:
  curl -X GET http://localhost:3000/wallets/me -H "Cookie: sid=<your_session_id>"

  # 2. Thanh toán ca hẹn bằng ví:
  curl -X POST http://localhost:3000/bookings/booking_123/pay \
    -H "Content-Type: application/json" \
    -d '{"amountVnd": 200000}'
  ```

---

## 🚀 QUY TRÌNH HÀNH ĐỘNG KHI BE BẮT ĐẦU PUSH CODE:

1. **Bước 1:** Pull code mới từ nhánh BE về.
2. **Bước 2:** Vào `.env.local` của Frontend, đổi `NEXT_PUBLIC_USE_MOCK_API=false`.
3. **Bước 3:** Đăng nhập tài khoản Bác sĩ `Dr. Nguyen Van An` hoặc Khách hàng `normal111`.
4. **Bước 4:** Thử luồng Đặt lịch ➔ Trừ Ví ➔ Lập Phác đồ. Nếu BE trả khác tên field, chỉ cần sửa nhẹ trong file mapper `treatment.mapper.ts` mà **không cần đụng tới bất kỳ UI component nào**!
