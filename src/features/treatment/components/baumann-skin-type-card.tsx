"use client";

import Link from "next/link";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import type { UserProfile } from "@/features/profile/types/profile.types";
import { BaumannSkinTypePanel } from "./baumann-skin-type-panel";

/**
 * The Baumann skin profile, moved out of /profile (ADR-053) so the skin picture sits
 * next to the routine it drives. Rendered both as the /care skin-type tab and inside
 * the no-routine empty state — a customer who has not bought a plan yet still has a
 * skin type to read and correct, and /care is now its only home.
 */
export function BaumannSkinTypeCard({
  profile,
}: {
  profile?: UserProfile | null;
}) {
  return (
    <Card className="border-slate-200 shadow-2xs">
      <CardHeader className="border-b border-slate-100 p-6">
        <CardTitle className="text-lg font-bold text-slate-900">
          Hồ Sơ Loại Da Baumann
        </CardTitle>
        <CardDescription className="text-xs">
          Bốn trục đặc tính da của bạn. Bấm &quot;Chỉnh sửa&quot; nếu muốn cập
          nhật lại.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 p-6">
        {profile ? (
          <BaumannSkinTypePanel profile={profile} />
        ) : (
          <p className="text-muted-foreground text-center text-xs">
            Đang tải hồ sơ da...
          </p>
        )}

        {profile?.baumannCode && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="block text-xs font-bold text-slate-700">
                Tuyến Bã Nhờn
              </span>
              <p className="text-xs leading-relaxed text-slate-600">
                {profile.baumannCode.includes("O")
                  ? "Oily (Da Dầu): Tuyến bã nhờn hoạt động mạnh, có khuynh hướng bóng dầu vùng chữ T và dễ bít tắc tạo mụn đầu đen."
                  : "Dry (Da Khô): Thiếu hụt lượng dầu tự nhiên bảo vệ da, dễ gây cảm giác khô căng sau khi rửa mặt."}
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="block text-xs font-bold text-slate-700">
                Mức Độ Nhạy Cảm
              </span>
              <p className="text-xs leading-relaxed text-slate-600">
                {profile.baumannCode.includes("S")
                  ? "Sensitive (Da Nhạy Cảm): Dễ đỏ, ngứa hoặc mẩn rát khi gặp thay đổi thời tiết hoặc các hoạt chất điều trị mạnh (Retinol, AHA)."
                  : "Resistant (Da Khỏe): Hàng rào bảo vệ da vững chắc, ít khi kích ứng, thích hợp với nhiều nồng độ treatment cao."}
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="block text-xs font-bold text-slate-700">
                Sắc Tố
              </span>
              <p className="text-xs leading-relaxed text-slate-600">
                {profile.baumannCode.includes("P")
                  ? "Pigmented (Tăng Sắc Tố): Dễ bị thâm sau mụn, dễ hình thành tàn nhang và sạm nám khi tiếp xúc với tia cực tím."
                  : "Non-pigmented (Không Sắc Tố): Ít bị thâm sạm, da có khuynh hướng đều màu và phục hồi sắc tố nhanh hơn."}
              </p>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
              <span className="block text-xs font-bold text-slate-700">
                Độ Đàn Hồi
              </span>
              <p className="text-xs leading-relaxed text-slate-600">
                {profile.baumannCode.includes("W")
                  ? "Wrinkled (Nhăn): Cần bổ sung chất chống oxy hóa và collagen sớm để chống chảy sệ và nếp nhăn đuôi mắt."
                  : "Tight (Căng): Độ đàn hồi tự nhiên rất tốt, hàng rào bảo vệ vững vàng trước các dấu hiệu tuổi tác."}
              </p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-4">
          <Link href="/scan?view=plan">
            <Button className="rounded-xl bg-[#6b5cf6] px-6 text-xs font-bold text-white shadow-md hover:bg-[#5a4ae5]">
              🎉 Xem Phác Đồ & Mua Combo (Giảm 10%)
            </Button>
          </Link>
          <Link href="/scan?mode=restart">
            <Button
              variant="outline"
              className="rounded-xl border-slate-300 px-6 text-xs font-bold text-slate-700 hover:bg-slate-50"
            >
              Bắt Đầu Khảo Sát / Quét Da Lại
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
