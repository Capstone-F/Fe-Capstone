"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Sparkles,
  MapPin,
  ChevronRight,
  TrendingUp,
  UserCheck,
  Brain,
  HelpCircle,
  FileText,
  Scan,
  UserCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "@/features/auth/hooks/use-session";
import { useProfile } from "@/features/profile/hooks/use-profile";
import {
  useCategories,
  useProducts,
  useProductSuggestions,
} from "@/features/commerce/hooks/use-products";
import { useAddToCart } from "@/features/commerce/hooks/use-cart";
import { primaryVariant } from "@/features/commerce/mapper/variant";
import { ProductCard } from "@/features/commerce/components/product-card";
import { ProductCardSkeleton } from "@/features/commerce/components/product-card-skeleton";
import {
  getCategoryIcon,
  getCategoryLabel,
} from "@/features/commerce/mapper/category-mapper";
import { Button } from "@/shared/components/ui/button";
import { Product } from "@/types/domain";

export function ShopHomePage() {
  const router = useRouter();
  const session = useSession();
  const { data: profile } = useProfile();
  const { data: categories, isLoading: isCategoriesLoading } = useCategories();
  const addToCart = useAddToCart();

  const user = session.data;
  const isAuthenticated = !!user;

  // Fetch product suggestions if authenticated and has baumann code
  const hasSkinProfile = !!profile?.baumannCode;
  const { data: recommendedProducts, isLoading: isRecsLoading } =
    useProductSuggestions(6, isAuthenticated && hasSkinProfile);

  // Fetch newest products
  const { data: newestProductsResponse, isLoading: isNewestLoading } =
    useProducts({
      page: 1,
      limit: 6,
    });
  const newestProducts = newestProductsResponse?.products ?? [];

  const handleAdd = (product: Product) => {
    const variant = primaryVariant(product);
    if (!variant) return;
    addToCart.mutate(
      { productVariantId: variant.id },
      {
        onSuccess: () => toast.success(`Đã thêm vào giỏ: ${product.name}`),
        onError: () => toast.error("Không thể thêm sản phẩm vào giỏ hàng"),
      },
    );
  };

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* 1. Personalized Header / Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-[#2C3E35] p-6 text-white shadow-sm md:p-8 lg:p-12">
        <div className="absolute -top-12 -right-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />
        <div className="absolute -bottom-12 -left-12 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-12 md:items-center">
          <div className="space-y-4 md:col-span-8">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2">
                  <UserCircle2 className="h-5 w-5 text-[#E0F2E9]" />
                  <span className="text-xs font-bold tracking-widest text-[#E0F2E9] uppercase">
                    Thành viên GlowScan
                  </span>
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Xin chào, {profile?.name || user.name || "bạn thân mến"}!
                </h1>
                {hasSkinProfile ? (
                  <p className="max-w-xl text-sm text-[#E0F2E9] md:text-base">
                    Da của bạn thuộc nhóm phân loại:{" "}
                    <span className="rounded-lg bg-[#E0F2E9]/20 px-2 py-0.5 font-mono text-base font-bold text-white">
                      {profile.baumannCode}
                    </span>{" "}
                    {profile.oilyDryScore !== undefined && (
                      <span>— Điểm da: {profile.oilyDryScore}/100</span>
                    )}
                  </p>
                ) : (
                  <p className="max-w-xl text-sm text-[#E0F2E9]/90">
                    Bạn chưa thực hiện phân tích da. Hãy quét da ngay để nhận
                    phác đồ routine cá nhân hóa và các gợi ý sản phẩm phù hợp.
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-[#E0F2E9]" />
                  <span className="text-xs font-bold tracking-widest text-[#E0F2E9] uppercase">
                    Chào mừng bạn đến với GlowScan
                  </span>
                </div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-white sm:text-3xl lg:text-4xl">
                  Phân tích da thông minh bằng AI
                </h1>
                <p className="max-w-xl text-sm text-[#E0F2E9]/95 md:text-base">
                  Quét khuôn mặt, chuẩn đoán 7 thông số thẩm mỹ và nhận gợi ý
                  sản phẩm chuẩn xác chống xung đột hoạt chất.
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-3 pt-2">
              {isAuthenticated ? (
                hasSkinProfile ? (
                  <>
                    <Link href="/scan">
                      <Button className="rounded-xl bg-[#E0F2E9] font-bold text-[#2C3E35] hover:bg-[#c5e6d6]">
                        <Scan className="mr-1.5 h-4 w-4" />
                        Quét lại da AI
                      </Button>
                    </Link>
                    <Link href="/care">
                      <Button
                        variant="ghost"
                        className="rounded-xl border border-white/20 text-white hover:bg-white/10"
                      >
                        Nhật ký chăm sóc
                      </Button>
                    </Link>
                  </>
                ) : (
                  <Link href="/scan">
                    <Button className="rounded-xl bg-[#E0F2E9] font-bold text-[#2C3E35] hover:bg-[#c5e6d6]">
                      <Scan className="mr-1.5 h-4 w-4" />
                      Quét da ngay bây giờ
                    </Button>
                  </Link>
                )
              ) : (
                <>
                  <Link href="/login">
                    <Button className="rounded-xl bg-[#E0F2E9] font-bold text-[#2C3E35] hover:bg-[#c5e6d6]">
                      Đăng nhập / Đăng ký
                    </Button>
                  </Link>
                  <Link href="/survey">
                    <Button
                      variant="ghost"
                      className="rounded-xl border border-white/20 text-white hover:bg-white/10"
                    >
                      Làm thử khảo sát
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="hidden md:col-span-4 md:flex md:justify-end">
            <div className="relative flex h-44 w-44 flex-col items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
              <Brain className="h-10 w-10 text-[#E0F2E9]" />
              <div className="text-xs font-semibold text-white/90">
                100% Khách quan & Khoa học
              </div>
              <span className="text-[10px] text-white/60">
                Dựa trên bảng phân loại Baumann
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Category Navigation */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold tracking-tight text-slate-900">
            Danh mục sản phẩm
          </h2>
          <Link
            href="/products"
            className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            Tất cả sản phẩm
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {isCategoriesLoading ? (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-20 animate-pulse rounded-2xl bg-slate-200"
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-6">
            {categories?.map((cat) => {
              const icon = getCategoryIcon(cat.name);
              return (
                <button
                  key={cat.id}
                  onClick={() => router.push(`/products?categoryId=${cat.id}`)}
                  className="group hover:border-primary/40 flex flex-col items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-xs transition-all hover:bg-[#FAF8F5]"
                >
                  <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#FAF8F5] transition-colors group-hover:bg-white">
                    {icon ? (
                      <Image
                        src={icon}
                        alt={getCategoryLabel(cat.name)}
                        width={24}
                        height={24}
                        className="object-contain"
                      />
                    ) : (
                      <Brain className="h-5 w-5 text-slate-500" />
                    )}
                  </div>
                  <span className="group-hover:text-primary line-clamp-1 text-xs font-bold text-slate-700 transition-colors">
                    {getCategoryLabel(cat.name)}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {/* 3. Promotions/Banners Carousel */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="rounded bg-yellow-500/10 px-2 py-0.5 text-[10px] font-bold text-yellow-700">
                ƯU ĐÃI THÀNH VIÊN
              </span>
              <h3 className="font-heading text-base font-bold text-slate-800">
                Giảm 10% đơn hàng đầu tiên
              </h3>
              <p className="text-muted-foreground text-xs leading-normal">
                Nhập mã{" "}
                <span className="font-mono font-bold text-[#2C3E35]">
                  GLOWNEW
                </span>{" "}
                tại trang thanh toán.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-600">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
        </div>

        <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-xs transition-all hover:shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <span className="rounded bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                CHUYÊN GIA ĐỒNG HÀNH
              </span>
              <h3 className="font-heading text-base font-bold text-slate-800">
                Tư vấn trực tiếp 1-1
              </h3>
              <p className="text-muted-foreground text-xs leading-normal">
                Đặt lịch hẹn online với đội ngũ Bác sĩ da liễu giàu kinh nghiệm.
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>
        </div>
      </section>

      {/* 4. Personalized Recommendations (if profile has Baumann skin type) */}
      {isAuthenticated && hasSkinProfile && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                Dành riêng cho làn da {profile.baumannCode} của bạn
              </h2>
              <p className="text-muted-foreground text-xs">
                Sản phẩm được gợi ý bởi AI theo phác đồ điều trị của bạn
              </p>
            </div>
            <Link
              href="/products?section=recommended"
              className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
            >
              Xem tất cả
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>

          {isRecsLoading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {Array.from({ length: 6 }).map((_, index) => (
                <ProductCardSkeleton key={index} />
              ))}
            </div>
          ) : recommendedProducts && recommendedProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {recommendedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={handleAdd}
                  isAdding={addToCart.isPending || session.isLoading}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
              Chưa tìm thấy sản phẩm phù hợp. Thử quét da lại để làm mới gợi ý.
            </div>
          )}
        </section>
      )}

      {/* 5. New Products Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h2 className="text-lg font-bold tracking-tight text-slate-900">
              Sản phẩm mới cập nhật
            </h2>
            <p className="text-muted-foreground text-xs">
              Các sản phẩm chăm sóc da chính hãng mới nhất tại GlowScan
            </p>
          </div>
          <Link
            href="/products?section=newest"
            className="text-primary flex items-center gap-1 text-xs font-semibold hover:underline"
          >
            Xem tất cả
            <ChevronRight className="h-3 w-3" />
          </Link>
        </div>

        {isNewestLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, index) => (
              <ProductCardSkeleton key={index} />
            ))}
          </div>
        ) : newestProducts.length > 0 ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {newestProducts.slice(0, 6).map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={handleAdd}
                isAdding={addToCart.isPending || session.isLoading}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-8 text-center text-slate-500">
            Không có sản phẩm nào.
          </div>
        )}
      </section>

      {/* 6. Expert Consulting Banner */}
      <section className="px-1">
        <Link href="/experts">
          <div className="group hover:border-primary/40 flex cursor-pointer flex-row items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs transition-all hover:bg-[#FAF8F5] sm:p-6">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <MapPin className="h-6 w-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-bold text-slate-800 sm:text-base">
                Cần chuyên gia da liễu tư vấn trực tiếp?
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm">
                Tìm bác sĩ da liễu hoặc đối tác phòng khám GlowScan gần bạn
                nhất.
              </p>
            </div>
            <ChevronRight className="group-hover:text-primary h-5 w-5 text-slate-400 transition-colors" />
          </div>
        </Link>
      </section>

      {/* 7. Skincare Tips Card (Similar to mobile ShopSkincareTipCard) */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
        <div className="flex items-start gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Brain className="h-5 w-5" />
          </div>
          <div className="space-y-1.5">
            <h3 className="text-sm font-bold text-slate-800">
              Lời khuyên Skincare hàng ngày từ Bác sĩ
            </h3>
            <p className="text-muted-foreground text-xs leading-relaxed">
              Tránh bôi đồng thời cả **Vitamin C** tinh khiết và **Retinol**
              cùng một buổi tối nếu da bạn nhạy cảm. Hãy chia ra Vitamin C cho
              buổi sáng (để tăng hiệu quả chống nắng) và Retinol cho buổi tối
              (để thúc đẩy tái tạo tế bào).
            </p>
            <div className="flex items-center gap-4 pt-1 text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Kiến thức y khoa
              </span>
              <span className="flex items-center gap-1">
                <HelpCircle className="h-3 w-3" />
                Được kiểm chứng
              </span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
