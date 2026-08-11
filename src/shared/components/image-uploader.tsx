"use client";

import React, { useRef, useState } from "react";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Upload, X, Loader2 } from "lucide-react";
import { apiClient } from "@/core/api/client";
import { API_ENDPOINTS } from "@/core/api/endpoints";
import { Button } from "@/shared/components/ui/button";

interface ImageUploaderProps {
  value?: string;
  onChange: (url: string) => void;
  disabled?: boolean;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/heic",
  "image/heif",
];

export function ImageUploader({
  value,
  onChange,
  disabled = false,
}: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processUpload = async (file: File) => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error(
        "Định dạng file không hỗ trợ. Vui lòng chọn ảnh JPEG, PNG, WebP hoặc GIF.",
      );
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Dung lượng ảnh vượt quá giới hạn 5MB.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<{ url: string }>(
        API_ENDPOINTS.UPLOADS.IMAGE,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      const uploadedUrl = response.data?.url;
      if (uploadedUrl) {
        onChange(uploadedUrl);
        toast.success("Tải ảnh lên thành công!");
      }
    } catch (err: unknown) {
      const axiosErr = err as AxiosError<{ message?: string }>;
      toast.error(
        axiosErr.response?.data?.message ||
          "Tải ảnh thất bại. Vui lòng thử lại.",
      );
    } finally {
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      void processUpload(file);
    }
    // Reset file input value so selecting same file triggers onChange
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled || uploading) return;

    const file = e.dataTransfer.files?.[0];
    if (file) {
      void processUpload(file);
    }
  };

  const handleRemove = () => {
    onChange("");
  };

  return (
    <div className="w-full space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/heic,image/heif"
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled || uploading}
      />

      {value ? (
        <div className="group relative flex items-center gap-4 overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-slate-800 dark:bg-slate-900/50">
          <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={value}
              alt="Ảnh sản phẩm"
              className="h-full w-full object-cover"
            />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-slate-700 dark:text-slate-300">
              {value}
            </p>
            <p className="mt-0.5 text-[11px] text-slate-400">
              Đã tải lên thành công qua R2 Storage
            </p>
            <div className="mt-2 flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-7 px-2.5 text-xs"
                onClick={() => fileInputRef.current?.click()}
                disabled={disabled || uploading}
              >
                Thay đổi ảnh
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:hover:bg-rose-950/30"
                onClick={handleRemove}
                disabled={disabled || uploading}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Xóa
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => {
            if (!disabled && !uploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative cursor-pointer rounded-xl border-2 border-dashed p-6 text-center transition-all ${
            isDragOver
              ? "border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20"
              : "border-slate-200 hover:border-emerald-500/60 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-900/40"
          } ${disabled || uploading ? "cursor-not-allowed opacity-60" : ""}`}
        >
          <div className="flex flex-col items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-slate-800">
              {uploading ? (
                <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
              ) : (
                <Upload className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              )}
            </div>

            <div>
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {uploading
                  ? "Đang tải ảnh lên Cloud Storage..."
                  : "Kéo thả ảnh vào đây hoặc bấm để chọn tệp"}
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Hỗ trợ JPEG, PNG, WebP, GIF, HEIC (Tối đa 5MB)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
