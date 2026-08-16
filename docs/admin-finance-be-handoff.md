# 📄 YÊU CẦU BACKEND — DÒNG TIỀN & NHẬT KÝ CHO ADMIN (ADMIN FINANCE BE SPEC)

Tài liệu này dành cho **Team Dev Backend (BE)**. Mục tiêu: bổ sung các endpoint cho phép
**platform admin** xem được dòng tiền ở mức giao dịch (transaction-level), thay vì chỉ
xem số tổng hợp trên dashboard như hiện tại.

**Bối cảnh FE:** FE đang xây màn `/dashboard/finance` (Dòng tiền & Đối soát) và
`/dashboard/activity` (Nhật ký hoạt động) bằng cách **ghép tạm** các endpoint sẵn có.
Cách ghép tạm này chạy được nhưng có 3 chỗ **không thể làm đúng nếu thiếu BE** — nêu ở
mục 2. FE không chờ BE để ship phase 1; các endpoint dưới đây sẽ thay thế phần ghép tạm.

**Ngày viết:** 16/08/2026
**Liên quan:** `capstone-fe/docs/superpowers/specs/2026-08-16-admin-finance-visibility-design.md`

---

## 1. 🔴 Bug cần sửa trước (không liên quan tính năng mới)

> **Doanh thu phác đồ điều trị (treatment plan) đang không xuất hiện trong bất kỳ metric
> nào của `GET /admin/dashboard`, trong khi hoa hồng thu từ nó thì có.**

Xác nhận từ product owner (16/08/2026): **hoa hồng nền tảng được thu trên cả
`TREATMENT_PLAN_PAYMENT`, không chỉ `CONSULTATION_PAYMENT`.**

Hệ quả:

1. **Tổng tiền vào (inflow) trên dashboard admin đang bị thiếu** đúng bằng toàn bộ doanh
   thu phác đồ. `/treatments/:id/pay` là endpoint đang chạy thật, tiền có thật, nhưng
   admin không thấy ở đâu cả.
2. **Không thể tính được số tiền sàn đang nợ phòng khám.** Công thức tự nhiên
   `consultationFees − consultationRefunds − platformCommission` bị sai vì trừ phần hoa
   hồng thu trên doanh thu phác đồ ra khỏi một tử số không chứa doanh thu phác đồ → luôn
   thấp hơn thực tế, và **âm** khi doanh thu phác đồ lớn.

Vì lý do (2), FE đã **bỏ hẳn** ô "Về phòng khám" trên màn dòng tiền thay vì hiển thị số
ước tính sai. Ô đó sẽ chỉ xuất hiện lại khi có BE.

### Fix đề xuất (nhỏ, ưu tiên cao)

Thêm 2 field vào `metrics` **và** vào từng phần tử của `trend[]` trong response của
`GET /admin/dashboard`, đặt cạnh các field consultation đang có:

```ts
metrics: {
  // ...các field hiện tại...
  consultationFeesCollectedVnd: number;
  consultationRefundsVnd: number;
  treatmentPaymentsCollectedVnd: number; // MỚI
  treatmentRefundsVnd: number; // MỚI
  platformCommissionRevenueVnd: number;
}

trend: Array<{
  // ...các field hiện tại...
  treatmentPaymentsCollectedVnd: number; // MỚI
  treatmentRefundsVnd: number; // MỚI
}>;
```

Nguồn dữ liệu: cùng bảng `transactions`, lọc `type = 'TREATMENT_PLAN_PAYMENT'` (và
`REFUND` có `treatmentId IS NOT NULL` cho phần hoàn tiền) — tức là chỉ thêm điều kiện vào
query tổng hợp sẵn có.

**Chỉ riêng fix này đã đủ để inflow đúng và số nợ phòng khám tính được một cách trung
thực**, kể cả khi chưa làm mục 3.

---

## 2. Ba khoảng trống hiện tại

| Vấn đề                                                             | Nguyên nhân                                                                                                                       | Endpoint giải quyết                |
| ------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Admin không xem được giao dịch ở mức dòng                          | Không có endpoint transaction toàn sàn. `/clinic/transactions` bị scope theo `clinicId` của chính người gọi, admin không gọi được | `GET /admin/transactions` §3.1     |
| Không biết đang nợ / đang giữ escrow bao nhiêu cho từng phòng khám | Chỉ có số tổng toàn sàn trên dashboard                                                                                            | `GET /admin/clinics/balances` §3.2 |
| Nhật ký hoạt động bị chặn ở 10 dòng, không lọc / không phân trang  | `/admin/dashboard` trả `recentActivity` cứng 10 phần tử                                                                           | `GET /admin/activity` §3.3         |

---

## 3. Đặc tả Endpoint

### Quy ước chung

- **Guard:** tất cả yêu cầu role `app_admin` (giống `/admin/clinic-withdrawals`).
- **Phân trang:** giữ đúng convention đang dùng — query `page` (mặc định `1`), `limit`
  (mặc định `20`, tối đa `100`); response `{ items, total, page, limit }`.
- **Tiền tệ:** số nguyên VND. Nếu cột là `bigint` thì trả **string** (đúng như
  `/admin/clinic-withdrawals` đang trả `amountVnd` dạng string) — FE đã có helper parse
  cả hai kiểu, chỉ cần **nhất quán trong cùng một endpoint**.
- **Thời gian:** ISO 8601 UTC. Các tham số `from` / `to` nhận `YYYY-MM-DD`, hiểu theo
  timezone `Asia/Ho_Chi_Minh`, `from` lấy từ 00:00:00 và `to` lấy đến 23:59:59.999.

---

### 3.1 `GET /admin/transactions` — 🔥 Ưu tiên P0

Chính là `/clinic/transactions` **bỏ ràng buộc một phòng khám**, cộng thêm bộ lọc theo
đối tác. Nên tái sử dụng lại service sẵn có, chỉ thay điều kiện `clinicId = :myClinicId`
thành `clinicId = :filter` (optional).

#### Query params

| Param          | Kiểu              | Bắt buộc | Ghi chú                         |
| -------------- | ----------------- | -------- | ------------------------------- |
| `search`       | string            | không    | Tìm trong `note`, `externalRef` |
| `type`         | TransactionType   | không    | Bỏ trống = tất cả               |
| `status`       | TransactionStatus | không    |                                 |
| `clinicId`     | uuid              | không    | Lọc theo 1 phòng khám           |
| `userId`       | uuid              | không    | Khách hàng liên quan            |
| `expertId`     | uuid              | không    |                                 |
| `orderId`      | uuid              | không    |                                 |
| `from` / `to`  | `YYYY-MM-DD`      | không    | Lọc theo `createdAt`            |
| `minAmountVnd` | number            | không    |                                 |
| `maxAmountVnd` | number            | không    |                                 |
| `page`         | number            | không    | mặc định 1                      |
| `limit`        | number            | không    | mặc định 20, tối đa 100         |

#### Response

```jsonc
{
  "items": [
    {
      "id": "uuid",
      "type": "COMMISSION",
      "status": "COMPLETED",
      "amountVnd": "45000",
      "clinicId": "uuid | null",
      "clinicName": "Phòng khám Quận 1 | null", // JOIN sẵn, tránh N+1 phía FE
      "userId": "uuid | null",
      "userName": "Nguyễn Văn A | null", // JOIN sẵn
      "orderId": "uuid | null",
      "consultationId": "uuid | null",
      "treatmentId": "uuid | null",
      "withdrawalId": "uuid | null",
      "expertId": "uuid | null",
      "externalRef": "string | null",
      "note": "string | null",
      "createdAt": "2026-08-16T03:12:44.000Z",
    },
  ],
  "total": 1284,
  "page": 1,
  "limit": 20,
}
```

> ⚠️ **`clinicName` / `userName` join sẵn ở BE là yêu cầu, không phải nice-to-have.**
> Nếu chỉ trả id, FE buộc phải tải toàn bộ danh bạ phòng khám + user để hiển thị tên —
> đúng vấn đề đang phải làm tạm ở phase 1.

#### Bổ sung: `GET /admin/transactions/export`

Nhận **cùng bộ query params** (trừ `page` / `limit`), trả `text/csv`, giống hệt
`/clinic/transactions/export` đang có. Có endpoint này thì FE bỏ được phần tự sinh CSV ở
client.

#### Ghi chú triển khai

- Cần confirm giúp: **danh sách đầy đủ `TransactionType` enum**. FE hiện chỉ biết 7 giá
  trị từ màn clinic (`CONSULTATION_PAYMENT`, `TREATMENT_PLAN_PAYMENT`, `REFUND`,
  `ESCROW_RELEASE`, `COMMISSION`, `WITHDRAWAL`, `WITHDRAWAL_REVERSAL`) và nghi ngờ còn
  các type phía commerce/ví (`TOP_UP`, `PRODUCT_PURCHASE`...). FE cần đủ enum để dựng
  dropdown lọc và gán màu badge.
- Đề xuất index: `(createdAt DESC)`, `(clinicId, createdAt DESC)`, `(type, createdAt DESC)`.
- Bảng `transactions` đã có sẵn `orderId`, `consultationId`, `treatmentId`, `userId`,
  `externalRef`, `note` → **không cần đổi schema** cho endpoint này.
- FE hiện đang ghép tạm bằng cách gọi `/admin/clinic-withdrawals` và
  `/admin/order-cancellations`, kéo 5 trang đầu rồi chặn ở 500 dòng — cách này **ngầm giả
  định** hai endpoint đó mặc định sắp theo `createdAt DESC`. Nhờ BE xác nhận giúp thứ tự
  mặc định thật sự của hai endpoint này, và lý tưởng nhất là bổ sung một tham số `sort`
  tường minh — vì nếu thứ tự mặc định là tăng dần, màn dòng tiền hiện đang hiển thị các
  bản ghi **cũ nhất** thay vì mới nhất.

---

### 3.2 `GET /admin/clinics/balances` — Ưu tiên P1

Bản admin của `/clinic/wallet`: số dư từng phòng khám. Đây là endpoint **đóng lại được
bức tranh dòng tiền** — có nó thì ô "Về phòng khám" ở §1 quay lại thành số đo thật.

#### Query params

| Param      | Kiểu   | Ghi chú                             |
| ---------- | ------ | ----------------------------------- |
| `clinicId` | uuid   | không bắt buộc, lọc 1 phòng khám    |
| `search`   | string | không bắt buộc, tìm theo tên clinic |
| `page`     | number | mặc định 1                          |
| `limit`    | number | mặc định 20                         |

#### Response

```jsonc
{
  "items": [
    {
      "clinicId": "uuid",
      "clinicName": "Phòng khám Quận 1",
      "balanceVnd": "12500000", // khả dụng, rút được
      "heldEscrowVnd": "3200000", // đang giữ, chưa rút được
      "pendingWithdrawalsVnd": "5000000", // đã trừ khỏi khả dụng, chờ admin duyệt
      "commissionEarnedVnd": "1450000", // hoa hồng sàn đã thu TỪ phòng khám này
      "lastPayoutAt": "2026-08-10T04:00:00.000Z | null",
    },
  ],
  "total": 12,
  "page": 1,
  "limit": 20,
}
```

`commissionEarnedVnd` là field quan trọng nhất ở đây — hiện tại hoa hồng **chỉ có số tổng
toàn sàn**, không bóc tách được theo phòng khám.

---

### 3.3 `GET /admin/activity` — Ưu tiên P2

Gỡ trần 10 dòng của `recentActivity` và đưa các bộ lọc về phía server.

#### Query params

| Param         | Kiểu         | Ghi chú                                          |
| ------------- | ------------ | ------------------------------------------------ |
| `type`        | string[]     | Lọc nhiều loại, VD `?type=ORDER&type=WITHDRAWAL` |
| `from` / `to` | `YYYY-MM-DD` |                                                  |
| `actorId`     | uuid         | Lọc theo người thực hiện                         |
| `page`        | number       | mặc định 1                                       |
| `limit`       | number       | mặc định 20                                      |

#### Response

```jsonc
{
  "items": [
    {
      "id": "uuid",
      "type": "WITHDRAWAL_PAID",
      "title": "Duyệt rút tiền phòng khám",
      "description": "Phòng khám Quận 1 — chuyển khoản VCB",
      "amountVnd": 5000000,
      "actorId": "uuid | null", // MỚI so với shape hiện tại
      "actorName": "Admin Trung | null", // MỚI
      "entityId": "uuid | null", // MỚI — id của bản ghi gốc, để FE deep-link
      "occurredAt": "2026-08-16T03:12:44.000Z",
    },
  ],
  "total": 843,
  "page": 1,
  "limit": 20,
}
```

3 field `actorId` / `actorName` / `entityId` là phần thêm so với shape hiện tại:

- `actorId` + `actorName`: sau này lên được **audit trail** ("ai duyệt lệnh rút này", "ai
  đổi % hoa hồng") mà không cần thêm endpoint mới.
- `entityId`: hiện `recentActivity[].id` không đảm bảo là id của bản ghi gốc, nên FE
  không dám deep-link tới trang chi tiết. Có `entityId` thì link được.

---

## 4. Thứ tự đề xuất

| Ưu tiên | Việc                                               | Ước lượng | Mở khoá                                         |
| ------- | -------------------------------------------------- | --------- | ----------------------------------------------- |
| **P0**  | §1 — thêm 2 field treatment vào `/admin/dashboard` | Rất nhỏ   | Sửa số inflow đang sai; tính được nợ phòng khám |
| **P0**  | §3.1 — `GET /admin/transactions` (+ export)        | Vừa       | Sổ cái thật cho admin; bỏ được toàn bộ ghép tạm |
| **P1**  | §3.2 — `GET /admin/clinics/balances`               | Vừa       | Escrow + hoa hồng theo từng phòng khám          |
| **P2**  | §3.3 — `GET /admin/activity`                       | Vừa       | Nhật ký đầy đủ, có lọc                          |

Làm P0 §1 trước cũng được vì nó độc lập và rất rẻ.

---

## 5. Tiêu chí nghiệm thu (FE sẽ kiểm bằng đúng các bước này)

**§1 — treatment metrics**

- [ ] `GET /admin/dashboard?range=30d` trả về `metrics.treatmentPaymentsCollectedVnd` và
      `metrics.treatmentRefundsVnd`.
- [ ] Mỗi phần tử `trend[]` có đủ 2 field tương ứng.
- [ ] Tổng `trend[].treatmentPaymentsCollectedVnd` **khớp** với
      `metrics.treatmentPaymentsCollectedVnd` trong cùng kỳ.

**§3.1 — transactions**

- [ ] Gọi không kèm filter → trả về giao dịch của **nhiều phòng khám khác nhau** (chứng
      minh đã bỏ scope).
- [ ] `?clinicId=X` trả ra đúng tập con mà tài khoản clinic manager của X nhìn thấy qua
      `/clinic/transactions`.
- [ ] `?type=COMMISSION&from=&to=` cho tổng `amountVnd` **khớp**
      `metrics.platformCommissionRevenueVnd` của cùng kỳ trên dashboard.
- [ ] `clinicName` / `userName` có giá trị, không phải null khi id tồn tại.
- [ ] `/export` trả `Content-Type: text/csv` và số dòng khớp với `total`.

**§3.2 — balances**

- [ ] `balanceVnd` / `heldEscrowVnd` / `pendingWithdrawalsVnd` của một phòng khám **khớp
      từng số** với `GET /clinic/wallet` khi đăng nhập bằng chính clinic manager đó.
- [ ] Tổng `pendingWithdrawalsVnd` khớp tổng các lệnh `REQUESTED` trong
      `/admin/clinic-withdrawals`.

**§3.3 — activity**

- [ ] `?limit=50` trả nhiều hơn 10 dòng.
- [ ] `?type=A&type=B` lọc đúng.
- [ ] `total` phản ánh số bản ghi thật, không phải độ dài trang.

---

## 6. Ghi chú cho FE (để BE biết phía bên kia đang làm gì)

Phase 1 (đang làm, **không chờ BE**) ghép tạm bằng:

- `GET /admin/dashboard` → số tổng hợp
- `GET /admin/clinic-withdrawals` (kéo hết trang, chặn ở 500 dòng) → bóc tách theo phòng khám
- `GET /admin/order-cancellations` → dòng tiền hoàn cho khách

Các hạn chế đang được **ghi rõ trên giao diện** (chặn 500 dòng, lọc ngày ở client, nhật
ký 10 dòng, ô "Về phòng khám" không tính được) — nên khi BE lên, phần việc FE chủ yếu là
**gỡ bỏ** chứ không phải viết thêm.
