# 🗺️ QUY TRÌNH TƯ VẤN, VÍ THANH TOÁN & PHÁC ĐỒ ĐIỀU TRỊ (MASTER INTEGRATION & PLANNING SPEC)

Tài liệu này là **Kế Hoạch & Thông Số Kỹ Thuật Master** dành cho cả **Team Dev Backend (BE)** và **Team Dev Frontend (FE)** nhằm tích hợp luồng **Đặt Lịch Khám ➔ Thanh Toán Ví ➔ Tư Vấn ➔ Lập Phác Đồ ➔ Sinh Routine qua Rule-Engine ➔ Tái Khám Miễn Phí (0đ)**.

---

## 1. 📊 Sơ Đồ Luồng Tổng Thể (Master Sequence Diagram)

```mermaid
flowchart TD
    %% Subgraph Khách Hàng - Đặt Lịch & Ví
    subgraph S1 [Chặng 1: Đặt Lịch & Thanh Toán Ví]
        A[Khách hàng tìm Chuyên gia & Chọn Slot] --> B[Tạo Ca Hẹn - Status: PENDING]
        B --> C{Kiểm Tra Số Dư Ví GlowScan}
        C -- Đủ số dư --> D[Thanh toán trừ ví CONSULTATION_PAYMENT]
        C -- Thiếu số dư --> E[Hiện Modal Nạp Ví TopUpModal]
        E --> D
        D --> F[Ca Hẹn Sẵn Sàng Duyệt - Status: PAID]
    end

    %% Subgraph Bác Sĩ - Duyệt & Tư Vấn
    subgraph S2 [Chặng 2: Tư Vấn & Lập Phác Đồ]
        F --> G[Bác sĩ duyệt - Status: CONFIRMED]
        G --> H[Bác sĩ bắt đầu ca khám - Status: IN_PROGRESS]
        H --> I[Bác sĩ bấm Lập Phác Đồ Điều Trị]
        I --> J[Wizard 4 Bước: Chọn Ingredients -> Lọc Sản phẩm -> Rule-Engine gen Routine]
        J --> K[Bác sĩ Tinh chỉnh & Kích hoạt Phase 1 - Status: ACTIVE]
        H --> L[Bác sĩ Hoàn thành ca khám - Status: COMPLETED]
    end

    %% Subgraph Khách Hàng - Nhận Routine & Tái Khám
    subgraph S3 [Chặng 3: Theo Dõi & Tái Khám Miễn Phí]
        K --> M[Khách hàng xem Phác Đồ & Routine AM/PM trên App]
        M --> N[Check-in Skincare Hàng Ngày]
        M --> O[Nút Đặt Lịch Tái Khám với Bác sĩ đó]
        O --> P[Ca Hẹn Tái Khám: Booking Fee = 0đ]
        P --> H
    end

    classDef primary fill:#ecfdf5,stroke:#059669,stroke-width:2px;
    classDef warning fill:#fffbeb,stroke:#d97706,stroke-width:2px;
    classDef accent fill:#f5f3ff,stroke:#7c3aed,stroke-width:2px;

    class A,B,D,F primary;
    class C,E,J warning;
    class I,K,M,O,P accent;
```

---

## 2. ⚡ 4 Quy Tắc Nghiệp Vụ Bắt Buộc Backend Phải Thực Thi (Business Rules & Gates)

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

## 3. 📋 DANH SÁCH API ENDPOINTS CHUẨN BACKEND CẦN MỞ

### 3.1 Nhóm API Ví Thanh Toán (`Wallet Controller`)

| Method | Endpoint                   | Auth     | Yêu Cầu Xử Lý BE                                                 | Response Body                                                           |
| ------ | -------------------------- | -------- | ---------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `GET`  | `/wallets/me`              | Customer | Lấy số dư ví khách hàng hiện tại                                 | `{ id: string, userId: string, balanceVnd: number, isActive: boolean }` |
| `POST` | `/bookings/:id/pay`        | Customer | Trừ tiền ví cho ca hẹn (Giao dịch Nguyên tử / Transaction Block) | `{ id: string, balanceVnd: number, status: 'PAID' }`                    |
| `POST` | `/wallets/top-up`          | Customer | Nạp tiền vào ví                                                  | `{ id: string, balanceVnd: number }`                                    |
| `GET`  | `/wallets/me/transactions` | Customer | Lấy danh sách lịch sử giao dịch ví                               | Array of `Transaction`                                                  |

### 3.2 Nhóm API Phác Đồ Điều Trị (`Treatments Controller`)

| Method  | Endpoint                                 | Auth              | Yêu Cầu Xử Lý BE                                            | Response Body                      |
| ------- | ---------------------------------------- | ----------------- | ----------------------------------------------------------- | ---------------------------------- |
| `GET`   | `/treatments`                            | Customer / Expert | Lấy danh sách phác đồ da (Filter: `customerId`, `expertId`) | Array of `TreatmentPlan`           |
| `GET`   | `/treatments/:id`                        | Auth              | Chi tiết 1 phác đồ                                          | Object `TreatmentPlan`             |
| `POST`  | `/treatments`                            | Expert            | Bác sĩ lập phác đồ mới cho bệnh nhân                        | Object `TreatmentPlan` mới         |
| `PATCH` | `/treatments/:id/phases/:phaseId/active` | Expert            | Chuyển đổi / Kích hoạt Phase điều trị                       | Object `TreatmentPlan` đã cập nhật |

---

## 4. 🗄️ CẤU TRÚC JSON `TreatmentPlan` MẪU CHUẨN BE & FE

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

## 5. 🛡️ QUẢN LÝ STATE & KHẢ NĂNG KHÁNG LỖI MẠNG (OFFLINE RESILIENCE)

### 5.1 Cấu Trúc Quản Lý Trạng Thái

| Phạm Vi State        | Công Nghệ Sử Dụng                     | Mục Đích Quản Lý                                    | Chiến Lược Lưu Trữ (Persistence)                                            |
| -------------------- | ------------------------------------- | --------------------------------------------------- | --------------------------------------------------------------------------- |
| **Server State**     | React Query (`@tanstack/react-query`) | Sync ca hẹn, số dư ví, phác đồ điều trị             | Invalidate cache tự động + Optimistic Updates                               |
| **Form Draft State** | Zustand / Local State                 | Form lập phác đồ 4 bước của Bác sĩ                  | Auto-save ngầm vào `LocalStorage` (`glowscan_draft_treatment_[customerId]`) |
| **Adapter Shield**   | `treatment.mapper.ts`                 | Lớp đệm an toàn chống vỡ UI khi BE thừa/thiếu field | Fallback mặc định an toàn cho tất cả field                                  |

### 5.2 Sơ Đồ Khôi Phục Bản Nháp Khi Mất Kết Nối Mạng (Draft Protection Flow)

```
[Bác sĩ nhập Wizard Bước 1 -> 4] ──(Auto Save)──▶ [LocalStorage: glowscan_draft_treatment]
                                                               │
     ┌─────────────────────────────────────────────────────────┘
     ▼
(Nguồn mạng rớt / Trình duyệt bị F5 đột ngột)
     │
     ▼
[Bác sĩ mở lại trang] ──(Auto Read)──▶ [Toast: Khôi phục bản nháp 100% dữ liệu đã nhập]
```

---

## 🔑 6. THÔNG TIN TEST & HƯỚNG DẪN NỐI BE THẬT

### 6.1 Tài Khoản Kiểm Thử Ngầm Định

- **Bác Sĩ Da Liễu:** ID `seed-expert-d1-derma` (Dr. Nguyen Van An) / Mật khẩu: `Password123!`
- **Khách Hàng:** ID `user_customer_demo` (Customer normal111) / Mật khẩu: `Password123!`

### 6.2 Tắt Mock & Nối Database Thật Trên Frontend

Trong tệp `.env.local` của `capstone-fe`:

- `NEXT_PUBLIC_USE_MOCK_API=true`: Chạy Mock API local.
- `NEXT_PUBLIC_USE_MOCK_API=false`: Tắt Mock, gọi trực tiếp API Backend NestJS (`http://localhost:3000`).
