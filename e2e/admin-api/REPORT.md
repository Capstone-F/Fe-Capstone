# Admin test plan — kết quả chạy TC-ADM-01..13

**Ngày chạy:** 13/08/2026
**Đối tượng test:** BE API trực tiếp (không qua Next BFF, không mở browser).
**Kết quả cuối: 13/13 PASS.**

Suite được chạy trên hai môi trường vì container docker đang chạy là bản cũ:

| Môi trường                                           | Lệnh                                                           | Kết quả                                              |
| ---------------------------------------------------- | -------------------------------------------------------------- | ---------------------------------------------------- |
| Container docker `capstone-be-api` (:3001, image cũ) | `pnpm test:admin-api`                                          | **11 PASS / 2 BLOCKED** — TC-12/13 chết vì route 404 |
| BE chạy từ source hiện tại trên host (:3002)         | `ADMIN_API_BASE_URL=http://localhost:3002 pnpm test:admin-api` | **13 PASS / 0 FAIL**                                 |

Kết luận: **source BE đúng, cả 13 TC chạy được**. Cái hỏng là image docker + Dockerfile (xem BE-1).

Lệnh dựng BE trên host (không sửa file nào trong `Be-Capstone`, chỉ override env vì `.env` trỏ tên
service docker):

```bash
cd Be-Capstone
npm ci --ignore-scripts          # node_modules trên host thiếu @aws-sdk/client-s3, @types/multer
PORT=3002 \
DATABASE_URL="postgresql://admin:admin@localhost:5432/be-capstone" \
REDIS_URL="redis://localhost:6379" \
KEYCLOAK_INTERNAL_URL="http://127.0.0.1:8080" \
KEYCLOAK_HEALTH_URL="http://127.0.0.1:9000/health/ready" \
npm run start:dev
```

> Suite này chỉ kiểm chứng **BE contract** mà màn admin dựa vào. Nó không click UI.
> Xem mục "Gap FE" bên dưới cho phần giao diện.

---

## 0. Hai điểm khác với bản kế hoạch gốc

| Kế hoạch ghi                               | Thực tế                                                                                                                                                                                                                                                                                                  |
| ------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `glowscan-admin / P@ssw0rd`                | Sai. Đúng là **`glowscan-admin / admin`** (`KEYCLOAK_DEV_ADMIN_PASSWORD` mặc định `admin`). `P@ssw0rd` là mật khẩu của expert/clinic-manager trong seed.                                                                                                                                                 |
| TC-12/13 cần "thanh toán sandbox" thủ công | Không cần. `PAYMENT_PROVIDER` đang là `vnpay`, và `GET /payments/vnpay/return` **không** settle — chỉ redirect. Suite tự ký một IPN hợp lệ (HMAC-SHA512 với `VNP_HASH_SECRET`) rồi gọi `GET /payments/vnpay/ipn`, đúng đường mà VNPay thật đi. Đơn lên PAID → trừ kho → tạo đơn GHN, hoàn toàn headless. |

---

## 1. Kết quả theo từng case

| Case                                    | Kết quả              | Ghi chú                                                                                                                                                                                                                                                                                                           |
| --------------------------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| TC-ADM-01 — Đăng nhập & profile         | **PASS**             | `roles=["app_admin"]`, `clinicId=null`; `PATCH /users/me` đổi tên và đọc lại đúng.                                                                                                                                                                                                                                |
| TC-ADM-02 — Users & RBAC                | **PASS**             | Phân trang đúng; tạo staff 201 (có `keycloakSub` → Keycloak đã tạo); `PATCH roles` replace đúng; disable/enable đúng cả 2 chiều.                                                                                                                                                                                  |
| TC-ADM-03 — Clinic lifecycle            | **PASS**             | `DELETE` chỉ set `isActive=false`, row còn; `GET /clinics` public ẩn clinic inactive; `PATCH isActive=true` đưa lại vào list public.                                                                                                                                                                              |
| TC-ADM-04 — Onboard expert              | **PASS**             | User expert + profile + `PUT consultation-fee` 450k + block Mon 09–12 + avatar + hiện trong `GET /experts?clinicId=`. Tạo `clinic_manager` cùng clinic cũng OK.                                                                                                                                                   |
| TC-ADM-05 — Maintain expert             | **PASS** (1 lưu ý)   | Sửa specialization/bio OK; `PATCH endHour=13` OK; thêm rồi xoá block thứ Ba OK (`DELETE` trả 204). **Lưu ý:** `sessionLengthHours` gửi lên được nhận nhưng **không có trong response** → không đọc lại được qua API (xem BE-2).                                                                                   |
| TC-ADM-06 — Survey question bank        | **PASS**             | Tạo/sửa/`PUT options`/soft-delete đúng; sau `DELETE` vẫn `GET` được nhưng biến mất khỏi `?activeOnly=true`.                                                                                                                                                                                                       |
| TC-ADM-07 — Combo discount              | **PASS**             | `PATCH {percent:15, minSubtotalVnd:300000}` persist. Suite **tự khôi phục giá trị cũ** ở teardown nên không phá demo.                                                                                                                                                                                             |
| TC-ADM-08 — Wallet                      | **PASS**             | Tự tạo ví 0đ nếu chưa có; top-up 500k cộng đúng; số tiền < 1000đ bị chặn 400.                                                                                                                                                                                                                                     |
| TC-ADM-09 — QA cheat                    | **PASS**             | Ghi đè `fullName`/`age`/allergy đúng; thay 2 đáp án survey đúng (label `ACNE`, `ACNE_TREATMENT`). Cần customer **đã có survey** — suite tự tạo bằng `POST /surveys` trong setup.                                                                                                                                  |
| TC-ADM-10 — Catalog + kho               | **PASS**             | Onboard SKU + gắn ảnh variant; batch 20 → adjust 18; phiếu nhập create → sửa qty → submit → confirm ra `CONFIRMED` + `stockBatchId`.                                                                                                                                                                              |
| TC-ADM-11 — Support chat                | **PASS**             | Admin thấy session trong queue `status=OPEN&assigned=unassigned`, claim → `ACTIVE` gán đúng `adminUserId`, gửi tin (`senderRole=STAFF`), read, close → `CLOSED`.                                                                                                                                                  |
| TC-ADM-12 — Handover + GHN              | **PASS** (trên host) | Đơn GHN tạo được thật; `awaitingHandover=true` list đúng đơn; `POST handover` stamp `handedOverAt` + `handedOverByUserId` và đẩy `providerStatus=picked`, delivery → `SHIPPED`; `advance {steps:10}` chạy tới `DELIVERED`, order cũng `DELIVERED`. **BLOCKED trên container docker :3001** (route 404, xem BE-1). |
| TC-ADM-13 — Hủy đơn + hoàn ví + restock | **PASS** (trên host) | `REQUESTED` với `requestedByActor=STAFF`; advance → `AWAITING_RETURN` + `refundedAt`; ví cộng đúng **subtotal − discount** (không hoàn ship); `confirm-return` với `goodQuantity=expectedQuantity` → restock; advance cuối → `COMPLETED`. **BLOCKED trên container docker :3001** (xem BE-1).                     |

Lưu ý TC-13: `ORDER_CANCELLATION_CRON_ENABLED` đang bật (mặc định `true`) chứ không phải `false` như kế hoạch ghi. Suite vẫn xanh vì `advanceUntil()` đọc trạng thái trước rồi mới advance, nên cron chạy trước cũng không làm sai kết quả.

---

## 2. Phát hiện phía BE (chỉ báo cáo, không sửa)

### BE-1 — Image docker của BE đang chạy là bản cũ, và build lại thì hỏng (BLOCKER)

Container `capstone-be-api` (up 11h) **thiếu hẳn** nhóm route mới:

- `/admin/deliveries`, `/admin/deliveries/{id}/advance|force-status|create-ghn-order`
- `/admin/orders/{orderId}/handover`
- `/admin/order-cancellations*`
- `/orders/{id}/cancel`

Kiểm chứng: `docker exec capstone-be-api ls dist/commerce` không có `orders-admin.controller.js` / `order-cancellations.*`, và `dist/delivery` không tồn tại. Trong khi đó source `Be-Capstone/src` **có đủ** các controller này và đã đăng ký trong module.

Chạy `docker compose up -d --build` để cập nhật thì **build fail**:

```
npm error path /app/node_modules/better-sqlite3
npm error command sh -c prebuild-install || node-gyp rebuild --release
npm error prebuild-install warn install socket hang up
npm error gyp ERR! find Python  ... You need to install the latest version of Python.
```

Chuỗi nguyên nhân: `better-sqlite3@^12.9.0` là **devDependency trực tiếp** của BE; Dockerfile chạy `npm ci` (cài cả devDeps); prebuild tải binary thất bại (network) → fallback `node-gyp` → `node:20-alpine` không có Python/toolchain → fail. Fail này **lặp lại**, không phải một lần.

Hệ quả: **không chạy được TC-12/13 với workflow full-docker cho tới khi Dockerfile được sửa.** Đã xác nhận
source không có lỗi — chạy cùng source đó trên host thì 13/13 xanh.

Hướng xử lý (BE-side, chưa làm):

1. Sửa Dockerfile thành `npm ci --omit=dev`, hoặc thêm `python3 make g++` vào stage builder.
2. Đẩy `better-sqlite3` ra khỏi `devDependencies` nếu chỉ dùng cho test cục bộ.

Phụ: `node_modules` trên host của `Be-Capstone` cũng đang thiếu `@aws-sdk/client-s3` và `@types/multer`
(9 lỗi TS khi `start:dev`), phải `npm ci --ignore-scripts` mới build được.

### BE-2 — `ExpertResponseDto` không trả `sessionLengthHours` và `userId` _(đã verify lại trên source mới)_

`UpdateExpertDto` / `CreateExpertDto` nhận `sessionLengthHours`, DB lưu, nhưng response của `POST /experts`, `PATCH /experts/:id`, `GET /experts/:id` **không có field này** (cũng không có `userId`). Màn admin không thể hiển thị lại độ dài ca tư vấn sau khi lưu, và không map được expert ↔ user account từ response.

### BE-3 — `SurveyResponseDto.answers[]` chỉ có `questionId`, không có `questionCode`

Admin cheat gửi lên theo `questionCode` nhưng đọc về chỉ có `questionId`, nên UI phải gọi thêm `/admin/survey-questions` để đối chiếu. Không phải bug, nhưng là một round-trip thừa nếu FE làm màn hiển thị đáp án.

### BE-4 — `GET /delivery/districts` trả `null` cho một số province sandbox

Province `2002 - "Hà Nội 02"` (decoy của GHN sandbox) trả `null` thay vì mảng rỗng. Nếu FE lấy province đầu tiên trong list rồi `.map()` sẽ crash. Suite đã phải quét qua nhiều province để tìm bộ province/district/ward giao được — FE nên phòng thủ tương tự.

---

## 3. Gap phía FE (việc cần bổ sung)

| Gap                                                                  | Chi tiết                                                                                                                                                                                                                                                                                                              | Liên quan            |
| -------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| **FE-1 — Không có gì cho giao hàng/handover**                        | `src/core/api/endpoints.ts` không có `/admin/deliveries*` lẫn `/admin/orders/:id/handover`; không có feature slice, không có màn hình, không có mục nav. Đây là gap lớn nhất.                                                                                                                                         | TC-ADM-12            |
| ~~**FE-2 — Thiếu endpoint expert fee & availability**~~              | **ĐÃ VÁ** — xem mục 6.                                                                                                                                                                                                                                                                                                | TC-ADM-04, TC-ADM-05 |
| **FE-3 — Admin nav thiếu lối vào kho và support**                    | `siteConfig.dashboard.navMain` có 7 mục, không có "Onboard sản phẩm", "Phiếu nhập kho", "Hỗ trợ khách hàng". Các màn này chỉ tồn tại dưới `(staff)` (`/staff/catalog`, `/staff/stock-imports`, `/staff/support-chat`). Admin gõ URL thì vào được (layout staff không chặn role) nhưng không có đường đi từ dashboard. | TC-ADM-10, TC-ADM-11 |
| **FE-4 — Trang `/dashboard/products` tồn tại nhưng không được link** | `src/app/(admin)/dashboard/products/page.tsx` + `ProductsManagementView` đã có và gọi API thật, nhưng không có trong `navMain`.                                                                                                                                                                                       | TC-ADM-10            |

---

## 3b. FE-2 — đã vá (13/08)

Vá xong gap fee + availability, và trong lúc vá phát hiện thêm **một bug thật đang có trên nhánh main**:

> **Nút "Sửa phí tư vấn" và "Đổi phòng khám" đang gọi sai id.** Bảng trong
> `expert-management-view.tsx` liệt kê **user account** (`useAdminUsers({role:"expert"})`), nhưng handler
> gọi `PUT /experts/{u.id}/consultation-fee` và `PATCH /experts/{u.id}` — trong khi BE nhận **expert
> profile id**. Hai id này khác nhau ⇒ thao tác không bao giờ trúng đúng chuyên gia. Ngoài ra hai handler
> đó `import("@/core/api/client")` động ngay trong hàm và hardcode path, trái convention của repo.

Đã làm:

| File                                                           | Nội dung                                                                                                                     |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `src/core/api/endpoints.ts`                                    | Thêm `EXPERTS.CONSULTATION_FEE`, `EXPERTS.AVAILABILITY`, `EXPERTS.AVAILABILITY_DETAIL`                                       |
| `src/features/admin/types/expert-admin.types.ts`               | _(mới)_ `AdminExpertProfile`, `ExpertAvailabilityBlock`, payload types, hằng giờ làm việc, nhãn thứ trong tuần               |
| `src/features/admin/api/admin-experts.api.ts`                  | _(mới)_ wrapper Axios thuần: `listProfiles`, `updateConsultationFee`, `updateExpert`, `get/create/update/deleteAvailability` |
| `src/features/admin/hooks/useAdminExperts.ts`                  | _(mới)_ TanStack Query hooks + invalidate                                                                                    |
| `src/features/admin/components/expert-availability-dialog.tsx` | _(mới)_ dialog quản lý khung giờ: liệt kê theo thứ, thêm khung, sửa giờ kết thúc inline, xoá                                 |
| `src/features/admin/components/expert-management-view.tsx`     | Sửa id cho fee/clinic, bỏ dynamic import, thêm mục menu "Khung giờ tư vấn", disable nút khi chưa resolve được hồ sơ          |
| `src/lib/query/keys.ts`                                        | Thêm `expertAvailability(expertProfileId)`                                                                                   |

**Cách map user → expert profile:** vì BE-2 (`ExpertResponseDto` không có `userId`), FE phải ghép qua
**email** (`useExpertProfilesByEmail`). Nếu BE bổ sung `userId` vào DTO thì bỏ được chỗ ghép này —
đó là cách sửa đúng về lâu dài.

Verify: `pnpm check` (lint + typecheck + build) xanh; `pnpm test:admin-api` vẫn **13/13** sau khi sửa.
Chưa click tay trên UI.

## 4. Cấu trúc suite

```
Fe-Capstone/
  playwright.admin-api.config.ts     # testDir e2e/admin-api, baseURL :3001, không webServer/browser
  e2e/admin-api/
    admin.spec.ts                    # 13 test() = 13 TC, chạy theo thứ tự trên 1 worker
    cases/tc-adm-01..13-*.ts         # thân từng case, mỗi bước là 1 test.step -> PASS/FAIL từng bước
    helpers/api.ts                   # HTTP client (bearer, lỗi kèm body)
    helpers/fixtures.ts              # tạo customer, đảm bảo tồn kho, tạo đơn đã thanh toán
    helpers/vnpay.ts                 # ký IPN VNPay (đọc VNP_HASH_SECRET từ Be-Capstone/.env, chỉ đọc)
    helpers/ctx.ts, helpers/types.ts
```

Ghi chú vận hành:

- **An toàn dữ liệu:** mọi entity tạo mới đều có hậu tố timestamp nên chạy lại nhiều lần không đụng nhau; customer là tài khoản mới mỗi lần chạy (không đụng seed); combo discount được khôi phục ở teardown; không xoá cứng gì.
- **Không đụng gate FE:** `e2e/` đã nằm trong `exclude` của `tsconfig.json`; `pnpm lint` và `pnpm typecheck` vẫn sạch. Suite được typecheck riêng ở chế độ strict.
- **Chạy lẻ 1 case:** `pnpm test:admin-api --grep "TC-ADM-04"`.
- Suite cố tình **không dùng `mode: "serial"`** — serial sẽ skip mọi case sau case fail đầu tiên, làm mất verdict của các case còn lại. Đổi lại, Playwright restart worker sau mỗi test fail, nên các id dùng chung được resolve trong `beforeAll` (hook này chạy lại) thay vì để lại từ case trước.

---

## 5. Chưa nằm trong suite

- Upload ảnh thật qua `POST /uploads/images` (cần R2). Suite dùng URL `https://placehold.co/400`, đúng như kế hoạch cho phép.
- Nhánh cancel/reject của phiếu nhập kho (kế hoạch ghi trùng bộ staff nên bỏ qua).
- `POST /admin/deliveries/:id/force-status` (nhánh `returned` / `delivery_fail`) — ngoài phạm vi happy path của TC-12. Đáng làm sau vì delivery `RETURNED` sẽ sinh cancellation `SYSTEM`, là nhánh chưa ai test.
- Toàn bộ UI admin. Nếu cần cover, đó là một suite Playwright browser riêng, nên làm sau khi vá xong FE-1..FE-4.
