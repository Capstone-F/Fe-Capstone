# Frontend Folder Structure & Coding Conventions Guide

Tài liệu này là **Quy chuẩn Code & Cấu trúc Frontend (Coding Conventions)** bắt buộc dành cho tất cả các thành viên phát triển dự án.

> **Mục tiêu**:
>
> - **Dễ đọc & Dễ tìm**: Tổ chức theo từng `feature`, tìm file nào biết ngay nằm ở đâu.
> - **Tái sử dụng cao (Reusability)**: Phân định rõ code dùng riêng cho 1 feature và code dùng chung toàn app trong `shared/` hoặc `types/`.
> - **Tách biệt trách nhiệm (Separation of Concerns)**: Không trộn API call, TanStack Query, UI layout, Mapper, Constant và Type trong cùng 1 file.

---

## 1. Nguyên Tắc Vàng (Core Principles)

1. **Rule "Dùng 1 vs Dùng 2+"**:
   - Nếu code (component, hook, type, utils) chỉ dùng cho **1 feature** $\rightarrow$ Để trong `src/features/<feature-name>/`.
   - Nếu code dùng cho **từ 2 feature trở lên** hoặc **toàn app** $\rightarrow$ Đưa ra `src/shared/` hoặc `src/types/`.
2. **Quy tắc đặt tên File & Thư mục (Naming Conventions)**:
   - **Tên file & folder**: Sử dụng `kebab-case` (ví dụ: `product-card.tsx`, `use-products.ts`, `category-mapper.ts`).
   - **React Component**: Sử dụng `PascalCase` (ví dụ: `ProductCard`, `ProductsPage`).
   - **Function & Variable**: Sử dụng `camelCase` (ví dụ: `formatVnd`, `isPendingPaymentStatus`).
3. **Tuyệt đối không trộn lẫn trách nhiệm**:
   - Component UI **không** tự viết `fetch()` hay `axios.get()`.
   - File `api` **không** chứa `useQuery` hay React State.
   - Hook **không** chứa mã HTML JSX.

---

## 2. Cấu Trúc Tổng Thể Thư Mục `src/`

```text
src/
├── app/                       # Next.js App Router (Chỉ chứa Route Entry Points & Layouts)
│   ├── (admin)/               # Layout & Route dành cho Admin (/dashboard)
│   ├── (auth)/                # Layout & Route Đăng nhập / Phân quyền (/login, /unauthorized)
│   ├── (expert)/              # Layout & Route dành cho Chuyên gia Da liễu (/expert)
│   ├── (expert-manager)/      # Layout & Route dành cho Quản lý Chuyên gia (/expert-manager)
│   ├── (landing)/             # Layout & Route Trang chủ Landing Page (/)
│   ├── (shop)/                # Layout & Route Cửa hàng Mỹ phẩm (/products, /cart, /checkout...)
│   ├── (staff)/               # Layout & Route dành cho Nhân viên (/staff)
│   ├── (tools)/               # Tools nội bộ Dev (/upload)
│   ├── (user-portal)/         # Layout & Route Cổng Khách hàng (/profile, /experts, /appointments...)
│   ├── scan/                  # Route Soi da AI (/scan)
│   ├── survey/                # Route Khảo sát da (/survey)
│   ├── api/                   # Backend API Route Handlers (/api/be/[...path])
│   ├── globals.css
│   ├── layout.tsx
│   └── not-found.tsx
│
├── features/                  # Quản lý code theo từng Tính năng (Feature-Driven Architecture)
│   ├── auth/
│   ├── booking/
│   ├── commerce/
│   ├── experts/
│   ├── landing/
│   ├── profile/
│   ├── scan/
│   ├── survey/
│   └── treatment/
│
├── shared/                    # Code tái sử dụng toàn app (Shared Module)
│   ├── components/            # UI Components tái sử dụng (ui/, layout/, providers...)
│   ├── hooks/                 # Custom Hooks tái sử dụng (useDebounce, useMobile...)
│   └── utils/                 # Utility Functions (formatVnd, formatDate...)
│
├── config/                    # Cấu hình tĩnh toàn ứng dụng (locales, siteConfig...)
├── lib/                       # Khởi tạo thư viện bên thứ 3 (query-client, utils...)
└── types/                     # TypeScript Types Global (api.ts, domain.ts, auth.ts...)
```

---

## 3. Quy Chuẩn & Hướng Dẫn Từng Thư Mục Trong `src/features/<feature>/`

Mỗi feature bắt buộc phải có đầy đủ 7 thư mục chuẩn sau (nếu chưa có code, tạo sẵn file `.gitkeep`):

```text
src/features/<feature-name>/
├── api/                       # Gọi HTTP Client & API Endpoints
├── components/                # UI Components phụ trợ của feature
├── constants/                 # Hằng số, Enum, Mock data, Options
├── hooks/                     # Custom Hooks (TanStack Query / State)
├── mapper/                    # Transform DTO <-> Domain Model
├── pages/                     # Màn hình chính (Page View Component)
└── types/                     # TypeScript Types / DTOs của feature
```

---

### 3.1. Thư mục `api/` (API Layer)

- **Nên làm gì**:
  - Chỉ chứa các hàm thuần async/await gọi endpoint HTTP (thông qua `fetch`, `axios` hoặc client helper `@/lib/api`).
  - Trả về Promise nhận DTO hoặc Data.
- **KHÔNG NÊN làm gì**:
  - Không import React, không dùng React State.
  - Không bọc `useQuery` hay `useMutation` ở đây.
- **Code mẫu chuẩn (`src/features/experts/api/experts-client.ts`)**:

```typescript
import type { Expert } from "@/types/domain";

export async function fetchExpertsApi(): Promise<Expert[]> {
  const res = await fetch("/api/be/experts");
  if (!res.ok) throw new Error("Không thể tải danh sách chuyên gia");
  return res.json();
}

export async function fetchExpertDetailApi(id: string): Promise<Expert> {
  const res = await fetch(`/api/be/experts/${id}`);
  if (!res.ok) throw new Error("Không thể tải thông tin chuyên gia");
  return res.json();
}
```

---

### 3.2. Thư mục `hooks/` (Data & State Layer)

- **Nên làm gì**:
  - Chứa các custom hook kết nối `api/` với **TanStack Query** (`useQuery`, `useMutation`).
  - Xử lý cache key (`queryKeys`), refetching, invalidation, toast thông báo.
- **KHÔNG NÊN làm gì**:
  - Không viết trực tiếp logic `fetch()` bên trong hook (gọi hàm từ `api/`).
  - Không trả về thẻ JSX.
- **Code mẫu chuẩn (`src/features/experts/hooks/use-experts.ts`)**:

```typescript
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query/keys";
import { fetchExpertsApi, fetchExpertDetailApi } from "../api/experts-client";

export function useExperts() {
  return useQuery({
    queryKey: queryKeys.experts.list(),
    queryFn: () => fetchExpertsApi(),
  });
}

export function useExpertDetail(id: string) {
  return useQuery({
    queryKey: queryKeys.experts.detail(id),
    queryFn: () => fetchExpertDetailApi(id),
    enabled: !!id,
  });
}
```

---

### 3.3. Thư mục `types/` (Data Contracts Layer)

- **Nên làm gì**:
  - Định nghĩa kiểu dữ liệu Input/Output, Payload Request, DTO Response riêng của feature đó.
- **Code mẫu chuẩn (`src/features/experts/types/expert.ts`)**:

```typescript
export interface CreateExpertInput {
  name: string;
  title: string;
  clinic: string;
  fee: number;
  specialties: string[];
}

export interface ExpertFilterQuery {
  specialty?: string;
  minFee?: number;
  maxFee?: number;
}
```

---

### 3.4. Thư mục `mapper/` (Data Transformation Layer)

- **Nên làm gì**:
  - Biến đổi dữ liệu từ Backend DTO thô sang kiểu dữ liệu mượt mà ở Frontend (nếu khác nhau).
  - Convert status code, format nhãn label, map icon.
- **Code mẫu chuẩn (`src/features/experts/mapper/expert-mapper.ts`)**:

```typescript
import type { Expert } from "@/types/domain";

export function mapExpertSpecialtiesLabel(specialties: string[]): string {
  if (!specialties || specialties.length === 0) return "Chuyên khoa chung";
  return specialties.join(" • ");
}
```

---

### 3.5. Thư mục `constants/` (Static Config & Options Layer)

- **Nên làm gì**:
  - Khai báo hằng số dùng lại nhiều lần trong feature: danh sách Tab, Filter options, Badge status color, nhãn hiển thị.
- **Code mẫu chuẩn (`src/features/experts/constants/expert-options.ts`)**:

```typescript
export className SPECIALTY_OPTIONS = [
  { label: "Tất cả chuyên khoa", value: "ALL" },
  { label: "Điều trị mụn trứng cá", value: "ACNE" },
  { label: "Phục hồi da nhạy cảm", value: "SENSITIVE" },
  { label: "Trẻ hóa & Chống lão hóa", value: "ANTI_AGING" },
] as const;
```

---

### 3.6. Thư mục `components/` (UI Sub-components Layer)

- **Nên làm gì**:
  - Chứa các Component UI nhỏ phục vụ riêng cho feature này (Card, Skeleton, FilterBar, ItemRow...).
  - Nhận `props`, gọi hook từ `hooks/` nếu cần, và render JSX mượt mà.
- **Code mẫu chuẩn (`src/features/experts/components/expert-card.tsx`)**:

```typescript
import React from "react";
import Link from "next/link";
import type { Expert } from "@/types/domain";
import { Button } from "@/shared/components/ui/button";

interface ExpertCardProps {
  expert: Expert;
}

export function ExpertCard({ expert }: ExpertCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      <h3 className="font-bold text-slate-900">{expert.name}</h3>
      <p className="text-muted-foreground text-xs">{expert.title}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-primary font-bold">{expert.fee.toLocaleString("vi-VN")} đ</span>
        <Link href={`/experts/${expert.id}`}>
          <Button size="sm">Đặt lịch hẹn</Button>
        </Link>
      </div>
    </div>
  );
}
```

---

### 3.7. Thư mục `pages/` (Page View Layer)

- **Nên làm gì**:
  - Chứa trang giao diện hoàn chỉnh (Page View Component).
  - Lắp ráp các `components/`, gọi `hooks/`, xử lý state chuyển trang và hiển thị Layout.
- **Code mẫu chuẩn (`src/features/experts/pages/experts-page.tsx`)**:

```typescript
"use client";

import React from "react";
import { useExperts } from "../hooks/use-experts";
import { ExpertCard } from "../components/expert-card";

export function ExpertsPage() {
  const { data: experts, isLoading } = useExperts();

  if (isLoading) return <div>Đang tải danh sách chuyên gia...</div>;

  return (
    <div className="mx-auto max-w-5xl flex flex-col gap-6">
      <h1 className="text-2xl font-bold">Danh sách Chuyên gia Da liễu</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {experts?.map((expert) => (
          <ExpertCard key={expert.id} expert={expert} />
        ))}
      </div>
    </div>
  );
}
```

- **Mối quan hệ với `src/app/`**:
  Nhiệm vụ của `src/app/` (Next.js App Router) chỉ là file route mỏng nhẹ import `ExpertsPage`:

```typescript
// File: src/app/(main)/(user-portal)/experts/page.tsx
import { ExpertsPage } from "@/features/experts/pages/experts-page";

export default function Page() {
  return <ExpertsPage />;
}
```

---

## 4. Hướng Dẫn Thư Mục Dùng Chung (`src/shared/` & `src/types/`)

### 4.1. Thư mục `src/types/` (Global Types)

Chứa toàn bộ Type hợp đồng (Contracts) toàn dự án:

- **[`src/types/api.ts`](file:///Users/gbzun/Desktop/SU26/Fe-Capstone/src/types/api.ts)**: Chứa type response từ Server (`ServerResponse<T>`, `PaginatedResponse<T>`, `QueryParams`).
- **[`src/types/domain.ts`](file:///Users/gbzun/Desktop/SU26/Fe-Capstone/src/types/domain.ts)**: Chứa các Entity Models chính (`User`, `Product`, `Order`, `Expert`, `Booking`).

> 💡 **Quy tắc**: Nếu type thuộc về 2 feature trở lên, hãy đưa vào `src/types/domain.ts` hoặc `src/types/api.ts`.

### 4.2. Thư mục `src/shared/components/` (Reusable UI Components)

- **`src/shared/components/ui/`**: Các UI primitives từ Base UI / Tailwind (Button, Card, Dialog, Input, Select, Badge, Skeleton, Sonner...).
- **`src/shared/components/layout/`**: Header, Footer, Navbar chung của toàn ứng dụng (`Navbar`, `Footer`, `ShopNavbar`, `SiteHeader`).

### 4.3. Thư mục `src/shared/utils/` (Utility Functions)

Chứa các hàm thuần (pure functions) xử lý chuỗi, ngày tháng, tiền tệ:

- **`formatVnd(amount: number)`**: Định dạng số tiền VND.
- **`formatDate(isoString: string)`**: Định dạng ngày tháng hiển thị Tiếng Việt.

---

## 5. Bảng So Sánh Nên Làm (Do's) & Không Nên Làm (Don'ts)

| Hạng mục           | ❌ Không nên làm (Don't)                                                 | ✅ Nên làm (Do)                                                            |
| :----------------- | :----------------------------------------------------------------------- | :------------------------------------------------------------------------- |
| **API Call**       | Viết `fetch()` trực tiếp trong Component JSX hoặc trong custom hook.     | Tách riêng hàm `apiClient` vào thư mục `features/<feature>/api/`.          |
| **TanStack Query** | Khai báo `useQuery` rải rác trực tiếp trong file UI Component.           | Gom tất cả `useQuery`, `useMutation` vào `features/<feature>/hooks/`.      |
| **Hardcoded Data** | Hardcode danh sách options, status label Tiếng Việt trực tiếp trong JSX. | Tách hằng số ra file `features/<feature>/constants/`.                      |
| **Reusability**    | Copy-paste code từ feature A sang feature B.                             | Chuyển code đó ra `src/shared/` hoặc `src/types/` để import chung.         |
| **Imports**        | Import tương đối dài ngoằn: `../../../../components/ui/button`.          | Dùng alias `@/`: `import { Button } from "@/shared/components/ui/button"`. |

---

## 6. Checklist Tự Kiểm Tra Trước Khi Mở Pull Request (PR Review Checklist)

Mỗi khi làm xong 1 tính năng hoặc mở PR, hãy tự check:

- [ ] File API đã được đặt trong `src/features/<feature>/api/` chưa?
- [ ] Hook TanStack Query đã nằm trong `src/features/<feature>/hooks/` chưa?
- [ ] Component màn hình chính đã được đưa vào `src/features/<feature>/pages/` chưa?
- [ ] Các type dùng chung cho Server đã import từ `@/types/api` hoặc `@/types/domain` chưa?
- [ ] Đã chạy `npx tsc --noEmit` và **0 lỗi** type chưa?
