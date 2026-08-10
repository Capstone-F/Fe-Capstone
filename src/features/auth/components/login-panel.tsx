"use client";

import {
  Sparkles,
  ShieldCheck,
  ArrowRight,
  HeartPulse,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";

import { Button } from "@/shared/components/ui/button";
import { Spinner } from "@/shared/components/ui/spinner";
import { Input } from "@/shared/components/ui/input";
import { FormController } from "@/shared/components/form/form-controller";

import { authApi } from "../api/auth.api";
import { authMock } from "../api/auth.mock";
import { tokenStorage } from "../utils/token-storage";
import { useSession } from "../hooks/useSession";
import { appConfig } from "@/lib/env";
import {
  authFormSchema,
  type AuthFormValues,
} from "../schemas/auth-form.schema";
import { guestSurveyStorage } from "@/features/survey/lib/guest-survey-storage";
import { treatmentApi } from "@/features/treatment/api/treatment.api";

type LoginPanelProps = {
  redirectTo: string;
};

function getRoleBasedRedirectPath(roles: string[], fallback?: string): string {
  if (
    roles.includes("app_admin") ||
    roles.includes("staff") ||
    roles.includes("clinic_manager")
  ) {
    return "/dashboard/experts";
  }
  if (roles.includes("expert")) {
    return "/expert";
  }
  return fallback && fallback !== "/" ? fallback : "/";
}

export function LoginPanel({ redirectTo }: LoginPanelProps) {
  const router = useRouter();
  const session = useSession();

  useEffect(() => {
    if (session.data) {
      const roles: string[] = session.data.roles || [];
      const target = getRoleBasedRedirectPath(roles, redirectTo);
      router.replace(target);
    }
  }, [router, redirectTo, session.data]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authFormSchema),
    defaultValues: {
      mode: "login",
      email: "",
      password: "",
      name: "",
    },
  });
  const mode = useWatch({ control: form.control, name: "mode" });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (values: AuthFormValues) => {
    const guestSurvey = guestSurveyStorage.get();
    try {
      let tokenData;
      if (appConfig.useMockApi) {
        if (mode === "login") {
          tokenData = await authMock.loginDirect(values.email);
          toast.success("Đăng nhập thành công (Mock)!");
        } else {
          tokenData = await authMock.registerDirect(
            values.email,
            values.name.trim(),
          );
          toast.success("Đăng ký thành công (Mock)!");
        }
      } else {
        if (mode === "login") {
          const res = await authApi.loginDirect(
            values.email,
            values.password,
            guestSurvey?.guestToken,
          );
          tokenData = res.data;
          toast.success("Đăng nhập thành công!");
        } else {
          const res = await authApi.registerDirect(
            values.email,
            values.password,
            values.name.trim(),
            guestSurvey?.guestToken,
          );
          tokenData = res.data;
          toast.success("Đăng ký thành công!");
        }
      }

      if (tokenData && tokenData.accessToken) {
        tokenStorage.setAccessToken(tokenData.accessToken);
        tokenStorage.setRefreshToken(tokenData.refreshToken);
      }

      if (guestSurvey && !appConfig.useMockApi) {
        try {
          if (guestSurvey.guestToken) {
            await treatmentApi.claimSurveySession(guestSurvey.guestToken);
          }
          guestSurveyStorage.clear();
          toast.success("Đã lưu kết quả khảo sát vào tài khoản.");
        } catch (claimErr) {
          console.warn(
            "Claim survey error, attempting fallback recommendation check:",
            claimErr,
          );
          try {
            const recommendation =
              await treatmentApi.fetchLatestRecommendations();
            if (
              recommendation.data?.customerSurveyId === guestSurvey.surveyId
            ) {
              guestSurveyStorage.clear();
              toast.success("Đã lưu kết quả khảo sát vào tài khoản.");
            } else {
              toast.warning(
                "Đăng nhập thành công nhưng chưa liên kết xong khảo sát guest. Dữ liệu guest vẫn được giữ để thử lại.",
              );
            }
          } catch {
            toast.warning(
              "Đăng nhập thành công nhưng chưa liên kết xong khảo sát guest. Dữ liệu guest vẫn được giữ để thử lại.",
            );
          }
        }
      }

      // The cached session was resolved before the new token existed. Use the
      // authenticated response so role-based redirects work on the first login.
      const roles: string[] =
        tokenData.user?.roles ?? session.data?.roles ?? [];
      const targetPath = getRoleBasedRedirectPath(roles, redirectTo);

      router.replace(targetPath);
      router.refresh();
    } catch (error: unknown) {
      console.error(error);
      const e = error as Error;
      const msg =
        e?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F5] text-[#2C3E35] selection:bg-[#E2EBE6]">
      {/* Subtle organic background gradient accents */}
      <div className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[#EBF2EE] opacity-80 blur-3xl" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#F5EFE6] opacity-70 blur-3xl" />
      </div>

      {/* Header / Brand Logo */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C3E35] text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="h-4.5 w-4.5 text-[#E0F2E9]" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[#2C3E35]">
            Glow
            <span className="font-sans font-light text-[#5C7468]">Scan</span>
          </span>
        </Link>
        <Link
          href="/"
          className="text-xs font-medium text-[#5C7468] underline-offset-4 hover:text-[#2C3E35] hover:underline"
        >
          Quay lại trang chủ
        </Link>
      </header>

      {/* Main Content: Split layout inspired by Curology */}
      <main className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-8 sm:px-8 md:grid-cols-12 md:py-16">
        {/* Left Column: Brand & Medical Value Proposition */}
        <div className="space-y-8 md:col-span-7 lg:col-span-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D5E2DC] bg-white/80 px-3.5 py-1.5 text-xs font-medium text-[#3A5246] shadow-2xs backdrop-blur-xs">
            <HeartPulse className="h-3.5 w-3.5 text-[#2C3E35]" />
            <span>Chăm sóc da cá nhân hóa chuẩn y khoa</span>
          </div>

          <div className="space-y-4">
            <h1 className="font-serif text-4xl leading-[1.18] font-bold tracking-tight sm:text-5xl lg:text-[54px]">
              Hành trình làn da khỏe đẹp của bạn bắt đầu từ đây.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-[#5C7468] sm:text-lg">
              Phân tích chuyên sâu theo 16 loại da Baumann. Được thiết kế bởi
              đội ngũ bác sĩ da liễu hàng đầu để mang lại công thức phù hợp nhất
              cho riêng bạn.
            </p>
          </div>

          {/* Value points */}
          <div className="space-y-3.5 border-t border-[#E8EFEB] pt-2">
            <div className="flex items-center gap-3 text-sm text-[#3A5246]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E2EBE6] text-[#2C3E35]">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>
                Phác đồ chăm sóc cá nhân hóa theo từng biến đổi của da
              </span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#3A5246]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E2EBE6] text-[#2C3E35]">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Kết nối trực tiếp cùng Bác sĩ & Chuyên gia da liễu</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-[#3A5246]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E2EBE6] text-[#2C3E35]">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Bảo mật dữ liệu tuyệt đối theo tiêu chuẩn y khoa</span>
            </div>
          </div>
        </div>

        {/* Right Column: Clean Login Box */}
        <div className="md:col-span-5 lg:col-span-5 lg:col-start-8">
          <div className="relative overflow-hidden rounded-[28px] border border-[#E0E8E4] bg-white p-8 shadow-xl shadow-[#2C3E35]/5 sm:p-10">
            {/* Top decorative badge inside card */}
            <div className="mb-6 space-y-2">
              <h2 className="font-serif text-2xl font-bold text-[#2C3E35]">
                Đăng nhập hoặc Đăng ký
              </h2>
              <p className="text-sm text-[#6A8275]">
                Tiếp tục để truy cập hồ sơ da liễu và phác đồ điều trị của bạn.
              </p>
            </div>

            {/* Toggle tabs */}
            <div className="mb-5 flex border-b border-[#E0E8E4]">
              <button
                type="button"
                onClick={() => form.setValue("mode", "login")}
                className={`flex-1 border-b-2 pb-2.5 text-sm font-bold transition-colors ${
                  mode === "login"
                    ? "border-[#2C3E35] text-[#2C3E35]"
                    : "border-transparent text-[#6A8275] hover:text-[#2C3E35]"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => {
                  form.setValue("mode", "register");
                  const storedName = guestSurveyStorage.get()?.baseProfile.name;
                  if (storedName && !form.getValues("name")) {
                    form.setValue("name", storedName);
                  }
                }}
                className={`flex-1 border-b-2 pb-2.5 text-sm font-bold transition-colors ${
                  mode === "register"
                    ? "border-[#2C3E35] text-[#2C3E35]"
                    : "border-transparent text-[#6A8275] hover:text-[#2C3E35]"
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            <form
              onSubmit={form.handleSubmit(handleSubmit)}
              className="space-y-4"
              noValidate
            >
              {mode === "register" && (
                <FormController
                  control={form.control}
                  name="name"
                  label="Họ và tên"
                >
                  {(field) => (
                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Nhập họ và tên..."
                      autoComplete="name"
                      className="h-11 rounded-xl border-[#E0E8E4] text-sm focus-visible:ring-[#2C3E35]"
                      aria-invalid={Boolean(form.formState.errors.name)}
                    />
                  )}
                </FormController>
              )}

              <FormController
                control={form.control}
                name="email"
                label="Địa chỉ Email"
              >
                {(field) => (
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    placeholder="name@example.com"
                    autoComplete="email"
                    className="h-11 rounded-xl border-[#E0E8E4] text-sm focus-visible:ring-[#2C3E35]"
                    aria-invalid={Boolean(form.formState.errors.email)}
                  />
                )}
              </FormController>

              <FormController
                control={form.control}
                name="password"
                label="Mật khẩu"
              >
                {(field) => (
                  <div className="relative">
                    <Input
                      {...field}
                      id={field.name}
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      autoComplete={
                        mode === "login" ? "current-password" : "new-password"
                      }
                      className="h-11 rounded-xl border-[#E0E8E4] pr-10 text-sm focus-visible:ring-[#2C3E35]"
                      aria-invalid={Boolean(form.formState.errors.password)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-[#6A8275] transition-colors hover:text-[#2C3E35] focus:outline-hidden"
                      tabIndex={-1}
                      aria-label={
                        showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4.5 w-4.5" />
                      ) : (
                        <Eye className="h-4.5 w-4.5" />
                      )}
                    </button>
                  </div>
                )}
              </FormController>

              <Button
                type="submit"
                disabled={form.formState.isSubmitting}
                className="group relative mt-2 h-12 w-full rounded-xl bg-[#2C3E35] px-6 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#3A5246] hover:shadow-lg active:scale-[0.99]"
              >
                {form.formState.isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="text-white" />
                    <span>Đang xử lý...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>
                      {mode === "login" ? "Đăng nhập ngay" : "Tạo tài khoản"}
                    </span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            {/* Helper notes */}
            <div className="mt-8 border-t border-[#F0F4F2] pt-6 text-center">
              <p className="text-xs leading-relaxed text-[#7A9284]">
                Khi nhấn tiếp tục, bạn đồng ý với{" "}
                <Link href="#" className="underline hover:text-[#2C3E35]">
                  Điều khoản dịch vụ
                </Link>{" "}
                và{" "}
                <Link href="#" className="underline hover:text-[#2C3E35]">
                  Chính sách bảo mật
                </Link>{" "}
                của GlowScan.
              </p>
            </div>
          </div>

          {/* Security badge below card */}
          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-[#6A8275]">
            <ShieldCheck className="h-4 w-4 text-[#4E7D63]" />
            <span>Mã hóa bảo mật 256-bit • Tiêu chuẩn y khoa</span>
          </div>
        </div>
      </main>
    </div>
  );
}
