"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import {
  Camera,
  ImagePlus,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import { normalizeApiError } from "@/core/api/errors";
import { Button } from "@/shared/components/ui/button";
import { useTreatment } from "./treatment-context";

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

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 py-6 sm:py-10">
      <div className="space-y-3 text-center">
        <span className="text-sm font-bold text-[#6b5cf6]">Bước tùy chọn</span>
        <h2 className="font-heading text-2xl font-bold text-[#131336] sm:text-3xl">
          Thêm ảnh khuôn mặt hiện tại
        </h2>
        <p className="mx-auto max-w-xl text-sm leading-6 text-[#131336]/70 sm:text-base">
          Ảnh giúp hệ thống bổ sung tín hiệu khi xếp hạng sản phẩm. Kết quả này
          không thay thế chẩn đoán y khoa và không làm thay đổi loại da Baumann.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-lg border border-slate-200 bg-white">
        <div className="relative aspect-[4/3] w-full bg-slate-100 sm:aspect-[16/9]">
          {previewUrl ? (
            <Image
              src={previewUrl}
              alt="Ảnh khuôn mặt dùng để hỗ trợ phân tích da"
              fill
              unoptimized
              className="object-contain"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-slate-500">
              <Camera className="h-10 w-10" aria-hidden="true" />
              <p className="text-sm">
                Chụp chính diện trong điều kiện đủ sáng.
              </p>
            </div>
          )}
          {isScanning && (
            <div className="absolute inset-0 flex items-center justify-center gap-2 bg-slate-950/60 text-sm font-semibold text-white">
              <Loader2 className="h-5 w-5 animate-spin" />
              Đang tải ảnh và phân tích...
            </div>
          )}
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => cameraInputRef.current?.click()}
              className="h-11 gap-2"
            >
              <Camera className="h-4 w-4" />
              Chụp ảnh
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => galleryInputRef.current?.click()}
              className="h-11 gap-2"
            >
              <ImagePlus className="h-4 w-4" />
              Chọn từ thiết bị
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
            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              <p>{scanError}</p>
              {selectedFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isBusy}
                  onClick={() => void uploadFile(selectedFile)}
                  className="mt-2 gap-2 text-red-700 hover:bg-red-100 hover:text-red-800"
                >
                  <RefreshCw className="h-4 w-4" />
                  Tải lại ảnh
                </Button>
              )}
            </div>
          )}

          {isUploaded && !isScanning && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <div className="flex items-center gap-2 font-semibold">
                <ShieldCheck className="h-4 w-4" />
                Đã thêm ảnh vào khảo sát
              </div>
              {state.faceLabels.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {state.faceLabels.map((label) => (
                    <span
                      key={label.code}
                      className="rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-medium"
                    >
                      {label.vietnameseNormalized || label.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}

          <p className="text-center text-xs text-slate-500">
            JPEG, PNG, WebP, GIF, HEIC hoặc HEIF; tối đa 5 MB.
          </p>
        </div>
      </div>

      {(errorMessage || state.dynamicError) && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
          {errorMessage || state.dynamicError}
        </div>
      )}

      <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
        <Button
          type="button"
          variant="ghost"
          disabled={isBusy}
          onClick={onBack}
          className="h-12 sm:min-w-32"
        >
          Quay lại
        </Button>
        <Button
          type="button"
          disabled={isBusy}
          onClick={onComplete}
          className="h-12 bg-[#6b5cf6] px-8 font-bold text-white hover:bg-[#5a4ae5] sm:min-w-56"
        >
          {isCompleting ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : isUploaded ? (
            "Phân tích kết quả"
          ) : (
            "Bỏ qua và phân tích"
          )}
        </Button>
      </div>
    </div>
  );
}
