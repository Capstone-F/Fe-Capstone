# Frontend Folder Structure Guide

Tài liệu này thống nhất cách tổ chức code frontend cho các thành viên trong team.

Mục tiêu:

- Giữ code theo từng `feature` để dễ tìm, dễ sửa, dễ tách trách nhiệm.
- Phân biệt rõ code chỉ dùng trong một feature và code dùng chung toàn app.
- Hạn chế để logic business, API call, component, và constant trộn lẫn ở nhiều nơi.

## 1. Nguyên tắc chung

- Mỗi feature tự quản lý phần code của nó trong `src/features/<feature-name>`.
- Chỉ đưa code ra `shared` khi code đó thật sự được tái sử dụng bởi nhiều feature hoặc toàn app.
- Ưu tiên đặt code gần nơi sử dụng nhất.
- Không đặt API call, TanStack Query hook, mapper, và UI component chung một file.

## 2. Cấu trúc đề xuất trong `src`

```text
src/
  app/
  features/
    auth/
    booking/
    commerce/
    experts/
    profile/
    treatment/
  shared/
    components/
    hooks/
    utils/
  components/
  hooks/
  lib/
  types/
```

## 3. Cấu trúc chuẩn cho một feature

Mỗi feature nên đi theo cấu trúc sau:

```text
src/features/<feature-name>/
  components/
  api/
  hooks/
  mapper/
  types/
  constants/
  pages/
```

Ví dụ:

```text
src/features/experts/
  components/
    expert-card.tsx
    expert-card-skeleton.tsx
  api/
    experts-client.ts
  hooks/
    use-experts.ts
  mapper/
    expert-mapper.ts
  types/
    expert.ts
  constants/
    expert-options.ts
  pages/
    experts-page.tsx
    expert-detail-page.tsx
```

## 4. Trách nhiệm của từng folder trong feature

### `components/`

Chứa component chỉ phục vụ cho feature đó.

Ví dụ:

- `ExpertCard`
- `BookingSummary`
- `TreatmentFlow`

Không nên đặt ở đây:

- helper format
- API call
- shared component dùng cho nhiều feature

### `api/`

Chỉ xử lý việc gọi API.

Bao gồm:

- định nghĩa endpoint
- hàm gọi `fetch` hoặc `apiJson`
- xử lý request/response ở mức client

Không nên đặt ở đây:

- `useQuery`, `useMutation`
- UI state
- mapper phức tạp nếu có thể tách riêng

Ví dụ hiện tại của repo:

- `src/features/experts/api/experts-client.ts`
- `src/features/booking/api/booking-client.ts`

### `hooks/`

Chứa custom hook của feature.

Bao gồm:

- `useQuery`, `useMutation`
- hook kết hợp API với TanStack Query
- hook xử lý state riêng của feature

Ví dụ:

- `useExperts`
- `useCreateBooking`
- `useProfile`

### `mapper/`

Folder này là optional, chỉ tạo khi feature có nhu cầu map dữ liệu.

Dùng cho:

- map response từ backend sang model frontend
- normalize data
- convert enum, status, label

Nếu logic map còn nhỏ và chỉ có 1 chỗ dùng, có thể để tạm trong file `api`. Khi logic bắt đầu dài hoặc có thể tái dùng, tách ra `mapper/`.

### `types/`

Chứa type chỉ thuộc phạm vi của feature.

Ví dụ:

- request payload
- response model
- filter type
- form value type

Nếu type dùng chung cho nhiều feature hoặc toàn app, khi đó mới cân nhắc đưa ra khu vực shared chung.

### `constants/`

Chứa các constant dùng lại trong feature.

Ví dụ:

- label
- status text
- badge color
- filter options
- tab config

Không nên hard-code lặp lại các giá trị này trong nhiều component.

### `pages/`

Chứa toàn bộ các trang màn hình (Page Views) thuộc phạm vi của feature đó.

Ví dụ:

- `src/features/experts/pages/experts-page.tsx`
- `src/features/experts/pages/expert-detail-page.tsx`
- `src/features/booking/pages/booking-page.tsx`
- `src/features/commerce/pages/products-page.tsx`

Lưu ý mối quan hệ với `src/app`:

- Thư mục `pages/` trong `feature` giữ toàn bộ UI layout, state, và logic của màn hình đó.
- Thư mục `src/app/` (Next.js App Router) đóng vai trò làm routing entry point mỏng gọn, nhập (import) và render component từ `src/features/<feature-name>/pages/`.

## 5. `shared/` trong `src`

Tạo `src/shared` để chứa những thứ dùng chung ở nhiều feature hoặc toàn app.

```text
src/shared/
  components/
  hooks/
  utils/
```

### `src/shared/components/`

Chứa component tái sử dụng.

Ví dụ:

- common empty state
- reusable filter bar
- section header
- loading block

Lưu ý:

- nếu component chỉ dùng cho một feature, giữ nó trong `src/features/<feature>/components`
- chỉ đưa vào `shared` khi đã có nhu cầu dùng chung thật sự

### `src/shared/utils/`

Chứa utility dùng chung toàn app.

Ví dụ:

- `formatTime`
- `formatCurrency`
- `formatDate`
- `buildQueryString`

### `src/shared/hooks/`

Chứa hook dùng chung.

Ví dụ:

- `useDebounce`
- `useErrorBoundary`
- `usePagination`

## 6. Khi nào để ở feature, khi nào để ở shared

Đặt trong `feature` khi:

- code chỉ phục vụ một màn hình hoặc một domain
- logic đang gắn chặt với data của feature đó
- chưa có nhu cầu tái sử dụng rõ ràng

Đặt trong `shared` khi:

- dùng lại từ 2 feature trở lên
- không phụ thuộc mạnh vào domain cụ thể
- có thể hiểu và dùng độc lập

Rule đơn giản:

- dùng riêng cho `experts` thì để trong `src/features/experts`
- dùng chung cho `experts`, `booking`, `profile` thì chuyển sang `src/shared`

## 7. Áp dụng cho repo hiện tại

Repo hiện tại đã có nền tảng theo hướng feature-based, ví dụ:

- `src/features/experts/api/experts-client.ts`
- `src/features/experts/hooks/use-experts.ts`
- `src/features/booking/api/booking-client.ts`
- `src/features/booking/hooks/use-booking.ts`

Các phần nên áp dụng dần từ bây giờ:

- feature mới tạo theo đúng cấu trúc `components`, `api`, `hooks`, `mapper`, `types`, `constants`
- code dùng chung mới nên đưa vào `src/shared`
- không cần ép di chuyển toàn bộ code cũ ngay lập tức
- khi sửa feature cũ, ưu tiên refactor dần theo guideline này

## 8. Quy ước review code

Khi tạo PR, nên tự check nhanh:

- API call đã nằm trong `api/` chưa?
- TanStack Query hook đã nằm trong `hooks/` chưa?
- type của feature đã nằm trong `types/` chưa?
- constant như label, color, option đã tách ra `constants/` chưa?
- code này thực sự là shared hay vẫn chỉ thuộc một feature?

## 9. Kết luận

Từ thời điểm này, team frontend nên follow guideline sau:

- Code theo feature trước.
- Shared chỉ dùng cho phần tái sử dụng thật sự.
- Không trộn UI, API, hook, type, mapper, constant trong cùng một chỗ.
- Refactor dần khi chạm vào code cũ, không cần migrate toàn bộ trong một lần.
