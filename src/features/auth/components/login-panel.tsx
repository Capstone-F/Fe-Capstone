"use client";

import { Sparkles, ShieldCheck, ArrowRight, HeartPulse, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition, useEffect } from "react";
import { toast } from "sonner";

import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Spinner } from "@/shared/components/ui/spinner";

import { startLogin } from "../api/auth-client";

type LoginPanelProps = {
  redirectTo: string;
};

export function LoginPanel({ redirectTo }: LoginPanelProps) {
  const router = useRouter();
  const [activeProvider, setActiveProvider] = useState<"keycloak" | "google">(
    "keycloak",
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    const token = localStorage.getItem("glowscan_access_token");
    if (token) {
      router.replace(redirectTo as any);
    }
  }, [router, redirectTo]);

  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (mode === "login") {
        await loginDirect(email, password);
        toast.success("Đăng nhập thành công!");
      } else {
        if (!name.trim()) {
          toast.error("Vui lòng nhập họ và tên.");
          setIsSubmitting(false);
          return;
        }
        await registerDirect(email, password, name.trim());
        toast.success("Đăng ký thành công!");
      }
      // Redirect to target path
      window.location.href = redirectTo || "/";
    } catch (error: any) {
      console.error(error);
      const msg = error?.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  function handleLogin(provider: "keycloak" | "google") {
    setActiveProvider(provider);

    startTransition(async () => {
      try {
        await startLogin({
          redirectTo,
          idpHint: provider === "google" ? "google" : undefined,
        });
      } catch (error) {
        console.error(error);
        toast.error("Không thể khởi tạo phiên đăng nhập. Vui lòng thử lại.");
      }
    });
  }

  return (
    <div className="relative min-h-screen w-full bg-[#FAF8F5] text-[#2C3E35] selection:bg-[#E2EBE6]">
      {/* Subtle organic background gradient accents */}
      <div className="pointer-events-none absolute top-0 left-0 -z-10 h-full w-full overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] h-[600px] w-[600px] rounded-full bg-[#EBF2EE] blur-3xl opacity-80" />
        <div className="absolute bottom-[-10%] left-[-5%] h-[500px] w-[500px] rounded-full bg-[#F5EFE6] blur-3xl opacity-70" />
      </div>

      {/* Header / Brand Logo */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6 sm:px-8">
        <Link href="/" className="group flex items-center gap-2.5 select-none">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#2C3E35] text-white shadow-sm transition-transform duration-300 group-hover:scale-105">
            <Sparkles className="h-4.5 w-4.5 text-[#E0F2E9]" />
          </div>
          <span className="font-serif text-xl font-bold tracking-tight text-[#2C3E35]">
            Glow<span className="font-sans font-light text-[#5C7468]">Scan</span>
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
      <main className="mx-auto grid max-w-6xl gap-12 px-6 py-8 md:grid-cols-12 md:py-16 sm:px-8 items-center">
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
              Phân tích chuyên sâu theo 16 loại da Baumann. Được thiết kế bởi đội ngũ bác sĩ da liễu hàng đầu để mang lại công thức phù hợp nhất cho riêng bạn.
            </p>
          </div>

          {/* Value points */}
          <div className="space-y-3.5 pt-2 border-t border-[#E8EFEB]">
            <div className="flex items-center gap-3 text-sm text-[#3A5246]">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E2EBE6] text-[#2C3E35]">
                <CheckCircle2 className="h-3.5 w-3.5" />
              </div>
              <span>Phác đồ chăm sóc cá nhân hóa theo từng biến đổi của da</span>
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
            <div className="flex border-b border-[#E0E8E4] mb-5">
              <button
                type="button"
                onClick={() => setMode("login")}
                className={`flex-1 pb-2.5 text-sm font-bold border-b-2 transition-colors ${
                  mode === "login"
                    ? "border-[#2C3E35] text-[#2C3E35]"
                    : "border-transparent text-[#6A8275] hover:text-[#2C3E35]"
                }`}
              >
                Đăng nhập
              </button>
              <button
                type="button"
                onClick={() => setMode("register")}
                className={`flex-1 pb-2.5 text-sm font-bold border-b-2 transition-colors ${
                  mode === "register"
                    ? "border-[#2C3E35] text-[#2C3E35]"
                    : "border-transparent text-[#6A8275] hover:text-[#2C3E35]"
                }`}
              >
                Đăng ký tài khoản
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "register" && (
                <div className="space-y-1.5">
                  <Label htmlFor="reg-name" className="text-xs font-bold text-[#2C3E35]">
                    Họ và tên
                  </Label>
                  <Input
                    id="reg-name"
                    placeholder="Nhập họ và tên..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-xl border-[#E0E8E4] focus-visible:ring-[#2C3E35] text-sm"
                    required
                  />
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="login-email" className="text-xs font-bold text-[#2C3E35]">
                  Địa chỉ Email
                </Label>
                <Input
                  id="login-email"
                  type="email"
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-11 rounded-xl border-[#E0E8E4] focus-visible:ring-[#2C3E35] text-sm"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="login-password" className="text-xs font-bold text-[#2C3E35]">
                  Mật khẩu
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 rounded-xl border-[#E0E8E4] focus-visible:ring-[#2C3E35] text-sm"
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="group relative h-12 w-full rounded-xl bg-[#2C3E35] px-6 text-sm font-bold text-white shadow-md transition-all duration-200 hover:bg-[#3A5246] hover:shadow-lg active:scale-[0.99] mt-2"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Spinner className="text-white" />
                    <span>Đang xử lý...</span>
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <span>{mode === "login" ? "Đăng nhập ngay" : "Tạo tài khoản"}</span>
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </Button>
            </form>

            <div className="relative my-6 text-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-[#F0F4F2]"></div>
              </div>
              <span className="relative bg-white px-3.5 text-[11px] font-bold text-[#7A9284] uppercase tracking-wider">
                Hoặc kết nối bằng IDP
              </span>
            </div>

            <div className="space-y-3">
              {/* Keycloak / GlowScan ID */}
              <Button
                type="button"
                className="group relative h-11 w-full rounded-xl border border-[#D5E2DC] bg-[#FAF8F5] px-6 text-xs font-bold text-[#2C3E35] transition-all duration-200 hover:bg-[#F5F8F6] active:scale-[0.99]"
                onClick={() => handleLogin("keycloak")}
                disabled={isPending || isSubmitting}
              >
                <span className="flex items-center justify-center gap-2">
                  <span>Kết nối với GlowScan ID (Keycloak)</span>
                  <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                </span>
                {isPending && activeProvider === "keycloak" && (
                  <span className="absolute right-4 flex items-center">
                    <Spinner className="text-[#2C3E35]" />
                  </span>
                )}
              </Button>

              {/* Google */}
              <Button
                type="button"
                className="relative h-11 w-full rounded-xl border border-[#D5E2DC] bg-[#FAF8F5] px-6 text-xs font-bold text-[#2C3E35] transition-all duration-200 hover:bg-[#F5F8F6] active:scale-[0.99]"
                onClick={() => handleLogin("google")}
                disabled={isPending || isSubmitting}
              >
                <span className="flex items-center justify-center gap-2.5">
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Kết nối với Google</span>
                </span>
                {isPending && activeProvider === "google" && (
                  <span className="absolute right-4 flex items-center">
                    <Spinner className="text-[#2C3E35]" />
                  </span>
                )}
              </Button>
            </div>

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

