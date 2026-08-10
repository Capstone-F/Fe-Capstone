"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  ScanLine,
} from "lucide-react";
import { normalizeApiError } from "@/core/api/errors";
import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "./treatment-context";

import { useSession } from "@/features/auth/hooks/useSession";
import { useRouter } from "next/navigation";
import { Lock, LogIn } from "lucide-react";

const MAX_FACE_IMAGE_BYTES = 5 * 1024 * 1024;
const ACCEPTED_FACE_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
]);
const ACCEPTED_FACE_IMAGE_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".gif",
  ".heic",
  ".heif",
];

function validateFaceImage(file: File): string | null {
  const lowerName = file.name.toLowerCase();
  const hasAcceptedExtension = ACCEPTED_FACE_IMAGE_EXTENSIONS.some(
    (extension) => lowerName.endsWith(extension),
  );
  if (!ACCEPTED_FACE_IMAGE_TYPES.has(file.type) && !hasAcceptedExtension) {
    return "Chỉ hỗ trợ ảnh JPEG, PNG, WebP, GIF, HEIC hoặc HEIF.";
  }
  if (file.size > MAX_FACE_IMAGE_BYTES) {
    return "Ảnh khuôn mặt không được vượt quá 5 MB.";
  }
  return null;
}

function getFaceScanError(error: unknown): string {
  const apiError = normalizeApiError(error);
  if (apiError.status === 400) {
    return "Ảnh không hợp lệ hoặc phiên khảo sát đã hoàn tất. Vui lòng chọn ảnh khác.";
  }
  if (apiError.status === 401) {
    return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại để tiếp tục.";
  }
  if (apiError.status === 404) {
    return "Không tìm thấy phiên khảo sát. Vui lòng quay lại và làm khảo sát mới.";
  }
  if (apiError.status === 503) {
    return "Dịch vụ phân tích ảnh đang tạm gián đoạn. Bạn có thể bỏ qua và tiếp tục.";
  }
  return (
    apiError.message || "Không thể phân tích ảnh lúc này. Vui lòng thử lại."
  );
}

type SurveyFaceScanProps = {
  isCompleting: boolean;
  errorMessage: string | null;
  onBack: () => void;
  onComplete: () => void;
};

export function SurveyFaceScan({
  isCompleting,
  errorMessage,
  onBack,
  onComplete,
}: SurveyFaceScanProps) {
  const router = useRouter();
  const sessionQuery = useSession();
  const isAuthenticated = Boolean(sessionQuery.data);

  const { state, scanSurveyFace } = useTreatment();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const previewUrl = localPreviewUrl || state.faceImageUrl;

  useEffect(() => {
    return () => {
      if (localPreviewUrl) URL.revokeObjectURL(localPreviewUrl);
    };
  }, [localPreviewUrl]);

  const uploadFile = async (file: File) => {
    const validationError = validateFaceImage(file);
    if (validationError) {
      setSelectedFile(null);
      setLocalPreviewUrl(null);
      setScanError(validationError);
      return;
    }

    setSelectedFile(file);
    setLocalPreviewUrl(URL.createObjectURL(file));
    setScanError(null);
    setIsScanning(true);
    try {
      await scanSurveyFace(file);
    } catch (error) {
      setScanError(getFaceScanError(error));
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) void uploadFile(file);
  };

  const isUploaded = Boolean(state.faceImageUrl && state.faceScannedAt);
  const isBusy = isScanning || isCompleting;

  // Guest view: Show lock banner requiring login for face scan
  if (!isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-4 py-6 duration-300">
        <div className="space-y-6 pb-8">
          <div className="space-y-2 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-700 uppercase">
              <Lock className="h-3.5 w-3.5" />
              Tính Năng Dành Cho Thành Viên
            </span>
            <h2 className="font-heading text-2xl font-extrabold text-[#131336] sm:text-3xl">
              Quét & Phân Tích Khuôn Mặt AI
            </h2>
            <p className="mx-auto max-w-lg text-xs leading-relaxed text-slate-600 sm:text-sm">
              Thuật toán AI sẽ quét phân tích ảnh bề mặt da mặt để bổ sung thêm
              dữ liệu phân tích thị giác y khoa.
            </p>
          </div>

          <div className="space-y-5 rounded-[32px] border border-indigo-100 bg-gradient-to-b from-indigo-50/80 via-white to-white p-6 text-center shadow-xl backdrop-blur-xl sm:p-8">
            <div className="relative mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-[#6b5cf6] shadow-lg shadow-[#6b5cf6]/30">
              <Camera className="h-10 w-10 text-white" />
              <div className="absolute -right-2 -bottom-2 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-amber-400 text-slate-900 shadow-md">
                <Lock className="h-4 w-4" />
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-[#131336]">
                Yêu Cầu Đăng Nhập Để Sử Dụng Camera / Tải Ảnh
              </h3>
              <p className="mx-auto max-w-md text-xs leading-relaxed text-slate-600 sm:text-sm">
                Tính năng phân tích hình ảnh AI yêu cầu tạo tài khoản để bảo mật
                dữ liệu sinh trắc học và lưu giữ hình ảnh trong hồ sơ cá nhân.
              </p>
            </div>

            <div className="flex justify-center pt-2">
              <Button
                type="button"
                onClick={() => router.push("/login?redirectTo=/scan")}
                className="h-12 gap-2 rounded-2xl bg-[#6b5cf6] px-6 text-xs font-bold text-white shadow-md hover:bg-[#5a4ae5]"
              >
                <LogIn className="h-4 w-4" />
                Đăng Nhập / Đăng Ký Để Quét Da AI
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 left-0 z-10 mt-2 w-full border-t border-slate-100 bg-white/90 py-4 backdrop-blur-md">
          <div className="flex w-full items-center justify-between gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={onBack}
              className="h-12 flex-1 rounded-2xl text-xs font-bold text-slate-700"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Quay lại
            </Button>
            <Button
              type="button"
              onClick={onComplete}
              className="h-12 flex-[2] rounded-2xl bg-[#6b5cf6] text-xs font-bold text-white shadow-lg hover:bg-[#5a4ae5]"
            >
              <span>Bỏ qua bước này & Xem kết quả</span>
              <ArrowRight className="ml-1.5 h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col justify-between px-4 py-6 duration-300">
      <div className="space-y-6 pb-8">
        <div className="space-y-2 text-center">
          <span className="rounded-full bg-[#6b5cf6]/10 px-3.5 py-1 text-xs font-bold text-[#6b5cf6] uppercase">
            Bước bổ sung (Tùy chọn)
          </span>
          <h2 className="font-heading text-2xl font-extrabold text-[#131336] sm:text-3xl">
            Tải Ảnh Phân Tích Khuôn Mặt AI
          </h2>
          <p className="mx-auto max-w-lg text-xs leading-relaxed text-slate-600 sm:text-sm">
            Thuật toán AI sẽ quét các tín hiệu trên khuôn mặt để bổ sung thêm dữ
            liệu khi xếp hạng sản phẩm kê đơn.
          </p>
        </div>

        <div className="overflow-hidden rounded-[32px] border border-white/80 bg-white/90 p-5 shadow-xl backdrop-blur-xl">
          <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-slate-100 sm:aspect-[16/9]">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Ảnh khuôn mặt phân tích da"
                fill
                unoptimized
                className="object-contain"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-400">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#6b5cf6]/10 text-[#6b5cf6]">
                  <Camera className="h-7 w-7" />
                </div>
                <p className="text-xs font-semibold text-slate-600">
                  Chụp chính diện khuôn mặt trong điều kiện ánh sáng tốt
                </p>
              </div>
            )}

            {/* Laser scanning animation */}
            {isScanning && (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-950/70 text-xs font-bold text-white backdrop-blur-xs">
                <ScanLine className="h-8 w-8 animate-pulse text-[#6b5cf6]" />
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin text-[#6b5cf6]" />
                  Đang quét và trích xuất nhãn da AI...
                </span>
              </div>
            )}
          </div>

          <div className="space-y-4 pt-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => cameraInputRef.current?.click()}
                className="h-12 gap-2 rounded-2xl text-xs font-bold"
              >
                <Camera className="h-4 w-4 text-[#6b5cf6]" />
                Chụp trực tiếp
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                onClick={() => galleryInputRef.current?.click()}
                className="h-12 gap-2 rounded-2xl text-xs font-bold"
              >
                <ImagePlus className="h-4 w-4 text-[#6b5cf6]" />
                Chọn ảnh từ máy
              </Button>
            </div>

            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="user"
              onChange={handleFileChange}
              className="hidden"
            />
            <input
              ref={galleryInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif,.heic,.heif"
              onChange={handleFileChange}
              className="hidden"
            />

            {scanError && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-xs font-semibold text-red-700">
                <p>{scanError}</p>
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isBusy}
                    onClick={() => void uploadFile(selectedFile)}
                    className="mt-2 gap-2 text-xs font-bold text-red-700 hover:bg-red-100"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Thử lại
                  </Button>
                )}
              </div>
            )}

            {isUploaded && !isScanning && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 text-left text-xs text-emerald-800 shadow-xs">
                <div className="flex items-center gap-2 font-bold">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Đã tải ảnh & phân tích thành công
                </div>
                {state.faceLabels.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {state.faceLabels.map((label) => (
                      <span
                        key={label.code}
                        className="flex items-center gap-1 rounded-full border border-emerald-300 bg-white px-3 py-1 text-[11px] font-bold text-emerald-900 shadow-xs"
                      >
                        <Sparkles className="h-3 w-3 text-emerald-600" />
                        {label.vietnameseNormalized || label.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            <p className="text-center text-[10px] text-slate-400">
              Hỗ trợ JPG, PNG, WebP, GIF, HEIC; tối đa 5 MB.
            </p>
          </div>
        </div>

        {(errorMessage || state.dynamicError) && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-left text-xs font-semibold text-red-700">
            {errorMessage || state.dynamicError}
          </div>
        )}
      </div>

      {/* Bottom Footer Actions */}
      <div className="sticky bottom-0 left-0 z-10 mt-2 w-full border-t border-slate-100 bg-white/90 py-4 backdrop-blur-md">
        <div className="flex w-full items-center justify-between gap-4">
          <Button
            type="button"
            variant="outline"
            disabled={isBusy}
            onClick={onBack}
            className="h-12 flex-1 rounded-2xl text-xs font-bold text-slate-700"
          >
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Quay lại
          </Button>
          <Button
            type="button"
            disabled={isBusy}
            onClick={onComplete}
            className="h-12 flex-[2] rounded-2xl bg-[#6b5cf6] text-xs font-bold text-white shadow-lg hover:bg-[#5a4ae5]"
          >
            {isCompleting ? (
              <Loader2 className="mx-auto h-5 w-5 animate-spin" />
            ) : isUploaded ? (
              <>
                <span>Xem Kết Quả Khảo Sát</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            ) : (
              <>
                <span>Bỏ qua & Xem Kết Quả</span>
                <ArrowRight className="ml-1.5 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
