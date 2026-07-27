# 📄 TÀI LIỆU YÊU CẦU & HƯỚNG DẪN TÍCH HỢP CHO DEV BACKEND (BE INTEGRATION SPEC)

Tài liệu này dành riêng cho **Team Dev Backend (BE)** nhằm cung cấp bức tranh toàn cảnh về **Luồng Đặt Lịch ➔ Thanh Toán Ví ➔ Tư Vấn ➔ Lập Phác Đồ ➔ Tái Khám Miễn Phí**, cùng chi tiết quy tắc nghiệp vụ (Business Rules), danh sách API Endpoints, Cấu trúc Database Entity và Bảng Chuyển Đổi Trạng Thái (Status Machine).

---

## 1. 📌 Tổng Quan Kiến Trúc & Luồng Nghiệp Vụ (Business Flow & Gates)

```
[Khách Hàng Đặt Lịch] ──▶ [BE: Booking PENDING, isPaid: false]
                                 │
                                 ▼
                     [Khách Hàng Gọi API Trừ Ví: POST /bookings/:id/pay]
                                 │
               ┌─────────────────┴─────────────────┐
               ▼                                   ▼
   [Ví Đủ Tiền (>= Fee)]                [Ví Không Đủ Tiền]
               │                                   │
               ▼                                   ▼
[Cộng Ledger: CONSULTATION_PAYMENT]      [BE Ném Lỗi HTTP 400]
[Booking Status: PENDING, isPaid: true]  ["Số dư ví không đủ"]
               │
               ▼
 [Bác Sĩ Duyệt: CONFIRMED (Yêu cầu isPaid === true hoặc isFollowUp === true)]
               │
               ▼
[Bác Sĩ Bắt Đầu: IN_PROGRESS] ──▶ [Bác Sĩ Tạo Phác Đồ: POST /treatments]
               │                                   │
               ▼                                   ▼
[Bác Sĩ Complete: COMPLETED] ◄──── [Khách Hàng Kích Hoạt Phác Đồ: ACTIVE]
                                                   │
                                                   ▼
                                [Khách Hàng Đặt Lịch Tái Khám]
                                [BE Check: Phác Đồ Active với Bác Sĩ trong Window]
                                [BE Trả về: isFollowUp = true, feeChargedVnd = 0đ]
```

---

## 2. ⚡ 4 Quy Tắc Nghiệp Vụ Bắt Buộc Backend Phải Thực Thi (Business Rules)

### 🔴 Quy Tắc 1: Ràng Buộc Thanh Toán Qua Ví (`Wallet Gate & Status Machine`)

- **Status Machine:** `PENDING` ➔ `CONFIRMED` ➔ `IN_PROGRESS` ➔ `COMPLETED` | `CANCELLED`. **Không dùng status `PAID`**.
- **Booking ca hẹn:** Bắt buộc 100% dùng Ví `Wallet` (`POST /bookings/:id/pay`). Không dùng VNPay hay Chuyển khoản cho booking.
- **Thanh toán thành công:** BE trừ `Wallet.balanceVnd`, ghi 1 dòng `Transaction` với `type = CONSULTATION_PAYMENT`, `consultationId = booking.id`, `status = COMPLETED`, cập nhật `booking.isPaid = true` và giữ nguyên trạng thái `PENDING`.
- **Ràng buộc Confirm:** Bác sĩ chỉ được phép bấm `CONFIRMED` khi ca hẹn có `isPaid === true` hoặc `isFollowUp === true`. Nếu chưa trả ví ➔ BE ném lỗi `HTTP 400: "Yêu cầu khách hàng thanh toán ca hẹn trước khi duyệt"`.

### 🟢 Quy Tắc 2: Tái Khám Miễn Phí (`Free Re-booking Gate`)

- Khi Khách hàng tạo Booking mới với Expert X:
  - BE kiểm tra xem Khách hàng đó **đang có Phác đồ điều trị `ACTIVE` với Expert X và ngày hẹn thuộc `[startDate, endDate]`** hay không.
  - **Nếu CÓ Phác đồ Active:** BE tự động đặt `booking.isFollowUp = true`, `feeChargedVnd = 0` (Miễn phí tư vấn tái khám) và chuyển ca hẹn thành trạng thái sẵn sàng duyệt mà không trừ tiền Ví.

### 🟡 Quy Tắc 3: Hoàn Tiền Ví Khi Hủy Ca (`Wallet Refund Rule`)

- Khi Ca hẹn ở trạng thái `PENDING` hoặc `CONFIRMED` bị Hủy (`PATCH /bookings/:id/cancel` từ Khách hàng hoặc Bác sĩ):
  - **Nếu Ca hẹn đã được thanh toán (`feeChargedVnd > 0`):** BE tự động **hoàn lại tiền vào Ví** (`Wallet.balanceVnd += amount`) và ghi dòng `Transaction` với `type = REFUND`, `consultationId = booking.id`.

### 🟣 Quy Tắc 4: Rule-Engine Sinh Routine & Chỉnh Sửa Phác Đồ

- Khi Bác sĩ gọi `POST /treatments`, BE dùng **Rule-Engine** lọc danh sách Sản phẩm dựa theo `targetIngredients` do Bác sĩ chỉ định, sau đó tự động phân bổ thành các bước Skincare Sáng/Tối (`amSteps`, `pmSteps`).

---

## 3. 📋 DANH SÁCH API ENDPOINTS BE CẦN MỞ (API SPECIFICATION)

### 3.1 Nhóm API Ví Thanh Toán (`Wallet Controller`)

| Method | Endpoint                  | Auth     | Yêu Cầu Xử Lý BE                                                     | Response Body                                                           |
| ------ | ------------------------- | -------- | -------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| `GET`  | `/wallet/me`              | Customer | Lấy số dư ví khách hàng hiện tại                                     | `{ id: string, userId: string, balanceVnd: number, isActive: boolean }` |
| `POST` | `/bookings/:id/pay`       | Customer | Trừ tiền ví cho ca hẹn (Chuyển `isPaid: true`, giữ status `PENDING`) | `{ id: string, balanceVnd: number, isPaid: true }`                      |
| `POST` | `/wallet/top-up`          | Customer | Nạp tiền vào ví                                                      | `{ id: string, balanceVnd: number }`                                    |
| `GET`  | `/wallet/me/transactions` | Customer | Lấy danh sách lịch sử giao dịch ví                                   | Array of `Transaction`                                                  |

### 3.2 Nhóm API Phác Đồ Điều Trị (`Treatments Controller`)

| Method  | Endpoint                                 | Auth              | Yêu Cầu Xử Lý BE                                            | Response Body                      |
| ------- | ---------------------------------------- | ----------------- | ----------------------------------------------------------- | ---------------------------------- |
| `GET`   | `/treatments`                            | Customer / Expert | Lấy danh sách phác đồ da (Filter: `customerId`, `expertId`) | Array of `TreatmentPlan`           |
| `GET`   | `/treatments/:id`                        | Auth              | Chi tiết 1 phác đồ                                          | Object `TreatmentPlan`             |
| `POST`  | `/treatments`                            | Expert            | Bác sĩ lập phác đồ mới cho bệnh nhân                        | Object `TreatmentPlan` mới         |
| `PATCH` | `/treatments/:id/phases/:phaseId/active` | Expert            | Chuyển đổi / Kích hoạt Phase điều trị                       | Object `TreatmentPlan` đã cập nhật |

---

## 4. 🔑 THÔNG TIN TEST & TẮT MOCK TRÊN FRONTEND

### 4.1 Tài Khoản Kiểm Thử Ngầm Định

- **Bác Sĩ Da Liễu:** ID `seed-expert-d1-derma` (Dr. Nguyen Van An) / Mật khẩu: `Password123!`
- **Khách Hàng:** ID `user_customer_demo` (Customer normal111) / Mật khẩu: `Password123!`

### 4.2 Bật/Tắt Mock Trên Frontend

Trong tệp `.env.local` của `capstone-fe`:

- `NEXT_PUBLIC_USE_MOCK_API=true`: Chạy Mock API local.
- `NEXT_PUBLIC_USE_MOCK_API=false`: Tắt Mock, gọi trực tiếp API Backend NestJS (`http://localhost:3000`).
