# 📄 TÀI LIỆU YÊU CẦU & HƯỚNG DẪN TÍCH HỢP CHO DEV BACKEND (BE INTEGRATION SPEC)

Tài liệu này dành riêng cho **Team Dev Backend (BE)** nhằm cung cấp bức tranh toàn cảnh về **Luồng Đặt Lịch ➔ Thanh Toán Ví ➔ Tư Vấn ➔ Lập Phác Đồ ➔ Tái Khám Miễn Phí**, cùng chi tiết quy tắc nghiệp vụ (Business Rules), danh sách API Endpoints, Cấu trúc Database Entity và Bảng Chuyển Đổi Trạng Thái (Status Machine).

---

## 1. 📌 Tổng Quan Kiến Trúc & Luồng Nghiệp Vụ (Business Flow & Gates)

```
[Khách Hàng Đặt Lịch] ──▶ [BE: Booking PENDING]
                                 │
                                 ▼
                     [Khách Hàng Gọi API Trừ Ví]
                                 │
               ┌─────────────────┴─────────────────┐
               ▼                                   ▼
   [Ví Đủ Tiền (>= Fee)]                [Ví Không Đủ Tiền]
               │                                   │
               ▼                                   ▼
[Cộng Ledger: CONSULTATION_PAYMENT]      [BE Ném Lỗi HTTP 400]
[Booking Status: PAID / PENDING]         ["Số dư ví không đủ"]
               │
               ▼
 [Bác Sĩ Duyệt: CONFIRMED]
               │
               ▼
[Bác Sĩ Bắt Đầu: IN_PROGRESS] ──▶ [Bác Sĩ Tạo Phác Đồ: POST /treatments]
               │                                   │
               ▼                                   ▼
[Bác Sĩ Complete: COMPLETED] ◄──── [Khách Hàng Mua Phác Đồ: ACTIVE]
                                                   │
                                                   ▼
                                [Khách Hàng Đặt Lịch Tái Khám]
                                [BE Check: Phác Đồ Active với Bác Sĩ]
                                [BE Set Fee = 0đ (Miễn Phí)]
```

---

## 2. ⚡ 4 Quy Tắc Nghiệp Vụ Bắt Buộc Backend Phải Thực Thi (Business Rules)

### 🔴 Quy Tắc 1: Ràng Buộc Thanh Toán Qua Ví (`Wallet Gate`)

- **Booking ca hẹn:** Bắt buộc 100% dùng Ví `Wallet` (`POST /bookings/:id/pay`). Không dùng VNPay hay Chuyển khoản.
- **Thanh toán thành công:** BE trừ `Wallet.balanceVnd`, ghi 1 dòng `Transaction` với `type = CONSULTATION_PAYMENT`, `consultationId = booking.id`, `status = COMPLETED`.
- **Ràng buộc Confirm:** Bác sĩ chỉ được phép bấm `CONFIRMED` khi ca hẹn đã thanh toán (`PAID`). Nếu ca hẹn chưa thanh toán mà Bác sĩ bấm Confirm ➔ BE trả lỗi `HTTP 400: "Yêu cầu khách hàng thanh toán ca hẹn trước khi duyệt"`.

### 🟢 Quy Tắc 2: Tái Khám Miễn Phí (`Free Re-booking Gate`)

- Khi Khách hàng tạo Booking mới với Expert X:
  - BE kiểm tra xem Khách hàng đó **đang có Phác đồ điều trị `ACTIVE` với Expert X** hay không.
  - **Nếu CÓ Phác đồ Active:** BE tự động đặt `booking.amount = 0` (Miễn phí tư vấn tái khám) và chuyển ca hẹn thành trạng thái sẵn sàng mà không trừ tiền Ví.
  - **Nếu KHÔNG có Phác đồ Active:** BE lấy `expert.consultationFee` làm phí đặt lịch tiêu chuẩn.

### 🟡 Quy Tắc 3: Hoàn Tiền Ví Khi Hủy Ca (`Wallet Refund Rule`)

- Khi Ca hẹn ở trạng thái `PENDING` hoặc `CONFIRMED` bị Hủy (`PATCH /bookings/:id/cancel` từ Khách hàng hoặc Bác sĩ):
  - **Nếu Ca hẹn đã được thanh toán:** BE tự động **hoàn lại tiền vào Ví** (`Wallet.balanceVnd += amount`) và ghi dòng `Transaction` với `type = REFUND`, `consultationId = booking.id`.

### 🟣 Quy Tắc 4: Rule-Engine Sinh Routine & Chỉnh Sửa Phác Đồ

- Khi Bác sĩ gọi `POST /treatments`, BE dùng **Rule-Engine** lọc danh sách Sản phẩm dựa theo `targetIngredients` do Bác sĩ chỉ định, sau đó tự động phân bổ thành các bước Skincare Sáng/Tối (`amSteps`, `pmSteps`).
- Bác sĩ có quyền tùy chỉnh tần suất (`frequencyPreset`) và liều lượng (`instructionPreset`) cho từng bước.

---

## 3. 📋 DANH SÁCH API ENDPOINTS BE CẦN MỞ (API SPECIFICATION)

### 3.1 Nhóm API Ví Thanh Toán (`Wallet Controller`)

| Method | Endpoint                   | Auth     | Yêu Cầu Xử Lý BE                                                 | Response Body                                                           |
| ------ | -------------------------- | -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `GET`  | `/wallets/me`              | Customer | Lấy số dư ví khách hàng hiện tại                                 | `{ id: string, userId: string, balanceVnd: number, isActive: boolean }` |
| `POST` | `/bookings/:id/pay`        | Customer | Trừ tiền ví cho ca hẹn (Giao dịch Nguyên tử / Transaction Block) | `{ id: string, balanceVnd: number, status: 'PAID' }`                    |
| `POST` | `/wallets/top-up`          | Customer | Nạp tiền vào ví (Demo / VNPay)                                   | `{ id: string, balanceVnd: number }`                                    |
| `GET`  | `/wallets/me/transactions` | Customer | Lấy danh sách lịch sử giao dịch ví                               | Array of `Transaction`                                                  |

### 3.2 Nhóm API Phác Đồ Điều Trị (`Treatments Controller`)

| Method  | Endpoint                                 | Auth              | Yêu Cầu Xử Lý BE                                            | Response Body                      |
| ------- | ---------------------------------------- | ----------------- | ----------------------------------------------------------- | ---------------------------------- |
| `GET`   | `/treatments`                            | Customer / Expert | Lấy danh sách phác đồ da (Filter: `customerId`, `expertId`) | Array of `TreatmentPlan`           |
| `GET`   | `/treatments/:id`                        | Auth              | Chi tiết 1 phác đồ                                          | Object `TreatmentPlan`             |
| `POST`  | `/treatments`                            | Expert            | Bác sĩ lập phác đồ mới cho bệnh nhân                        | Object `TreatmentPlan` mới         |
| `PATCH` | `/treatments/:id/phases/:phaseId/active` | Expert            | Chuyển đổi / Kích hoạt Phase điều trị                       | Object `TreatmentPlan` đã cập nhật |

---

## 4. 🗄️ QUAN HỆ DATABASE & CẤU TRÚC JSON MẪU (DATABASE ENTITIES & DTO)

### 4.1 Quan Hệ Các Bảng Database (ERD / Relations)

- `User` ── 1:1 ── `Wallet` ── 1:N ── `Transaction` (`consultationId`)
- `Customer` ── 1:N ── `ConsultationRequest` (Booking)
- `Customer` ── 1:N ── `TreatmentPlan` ── 1:N ── `TreatmentPhase` ── 1:N ── `RoutineStep`

### 4.2 Cấu Trúc JSON `TreatmentPlan` Mẫu FE Mong Muốn Trả Về

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

## 5. 🔄 BẢNG CHUYỂN ĐỔI TRẠNG THÁI (STATUS MACHINE)

### 5.1 Vòng Đời Ca Hẹn Khám (`ConsultationRequest`)

`PENDING` ➔ `PAID` ➔ `CONFIRMED` ➔ `IN_PROGRESS` ➔ `COMPLETED` (Hoặc ➔ `CANCELLED` + Refund Ví).

### 5.2 Vòng Đời Phác Đồ Điều Trị (`TreatmentPlan`)

`DRAFT` ➔ `PENDING_PAYMENT` ➔ `ACTIVE` ➔ `COMPLETED` / `CANCELLED`.

---

## 🔑 6. THÔNG TIN TEST & TẮT MOCK TRÊN FRONTEND

### 6.1 Tài Khoản Kiểm Thử Ngầm Định

- **Bác Sĩ Da Liễu:** ID `seed-expert-d1-derma` (Dr. Nguyen Van An) / Mật khẩu: `Password123!`
- **Khách Hàng:** ID `user_customer_demo` (Customer normal111) / Mật khẩu: `Password123!`

### 6.2 Bật/Tắt Mock Trên Frontend

Trong tệp `.env.local` của `capstone-fe`:

- `NEXT_PUBLIC_USE_MOCK_API=true`: Chạy Mock API local.
- `NEXT_PUBLIC_USE_MOCK_API=false`: Tắt Mock, gọi trực tiếp API Backend NestJS (`http://localhost:3000`).
