"use client";

import React, { useState, useRef } from "react";
import {
  Upload,
  FileImage,
  ArrowRight,
  Download,
  Percent,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/shared/components/ui/card";

interface ImageStats {
  name: string;
  originalSize: number; // in bytes
  compressedSize: number; // in bytes
  compressionRatio: number; // percentage
  duration: number; // time taken in ms
}

export default function UploadTestPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [originalPreview, setOriginalPreview] = useState<string | null>(null);
  const [webpPreview, setWebpPreview] = useState<string | null>(null);
  const [webpDataUrl, setWebpDataUrl] = useState<string | null>(null);
  const [quality, setQuality] = useState<number>(0.8);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [stats, setStats] = useState<ImageStats | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = 2;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      alert("Vui lòng tải lên một file ảnh hợp lệ (PNG, JPG, JPEG)!");
      return;
    }
    setSelectedFile(file);
    setStats(null);
    setWebpPreview(null);
    setWebpDataUrl(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setOriginalPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const convertToWebP = () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    const startTime = performance.now();

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        setIsProcessing(false);
        alert("Không thể khởi tạo Canvas Context.");
        return;
      }

      // Draw original image on canvas
      ctx.drawImage(img, 0, 0);

      // Export canvas as WebP Data URL
      try {
        const dataUrl = canvas.toDataURL("image/webp", quality);
        const base64Content = dataUrl.split(",")[1];
        const compressedSize = atob(base64Content).length;

        const endTime = performance.now();
        const duration = Math.round(endTime - startTime);
        const ratio = Math.round(
          ((selectedFile.size - compressedSize) / selectedFile.size) * 100,
        );

        setWebpDataUrl(dataUrl);
        setWebpPreview(dataUrl);
        setStats({
          name: selectedFile.name.replace(/\.[^/.]+$/, "") + ".webp",
          originalSize: selectedFile.size,
          compressedSize: compressedSize,
          compressionRatio: ratio,
          duration,
        });
      } catch (error) {
        console.error(error);
        alert("Nén ảnh thất bại.");
      }
      setIsProcessing(false);
    };

    img.onerror = () => {
      setIsProcessing(false);
      alert("Không thể đọc file ảnh.");
    };

    // Load original file as Image source
    img.src = URL.createObjectURL(selectedFile);
  };

  const downloadWebP = () => {
    if (!webpDataUrl || !stats) return;
    const link = document.createElement("a");
    link.href = webpDataUrl;
    link.download = stats.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container mx-auto flex max-w-4xl flex-col gap-6 p-4 py-8">
      <div className="flex flex-col gap-1.5 text-center">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">
          Công Cụ Nén & Chuyển Định Dạng WebP
        </h1>
        <p className="text-muted-foreground text-sm">
          Chuyển đổi hình ảnh trực tiếp ở Client-side sang WebP để tối ưu dung
          lượng trước khi upload lên Cloud.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
        {/* Left Column: Upload and Quality config */}
        <div className="flex flex-col gap-6 md:col-span-5">
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">
                1. Chọn hình ảnh
              </CardTitle>
              <CardDescription className="text-xs">
                Hỗ trợ các định dạng phổ biến như PNG, JPG, JPEG
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-5">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={triggerFileInput}
                className={`flex min-h-[160px] cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 text-center transition-all ${
                  isDragOver
                    ? "border-primary bg-primary/5"
                    : "hover:border-slate-350 border-slate-200 bg-slate-50/50 hover:bg-slate-50"
                }`}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
                <div className="mb-2 rounded-lg bg-white p-2.5 text-slate-500 shadow-xs">
                  <Upload className="h-5 w-5" />
                </div>
                {selectedFile ? (
                  <div className="flex flex-col items-center">
                    <span className="max-w-[200px] truncate text-xs font-bold text-slate-800">
                      {selectedFile.name}
                    </span>
                    <span className="text-muted-foreground mt-0.5 text-[10px]">
                      {formatSize(selectedFile.size)}
                    </span>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-semibold text-slate-700">
                      Kéo thả ảnh hoặc click để chọn
                    </p>
                    <p className="mt-1 text-[10px] text-slate-400">
                      Ảnh tối đa 5MB để nén mượt mà
                    </p>
                  </div>
                )}
              </div>

              {selectedFile && (
                <div className="flex flex-col gap-4 border-t border-slate-100 pt-4">
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-semibold text-slate-700">
                        Chất lượng WebP (Quality):
                      </span>
                      <span className="text-primary font-mono font-bold">
                        {Math.round(quality * 100)}%
                      </span>
                    </div>
                    <div className="py-2">
                      <input
                        type="range"
                        min="0.1"
                        max="1.0"
                        step="0.05"
                        value={quality}
                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                        className="accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
                      />
                    </div>
                  </div>

                  <Button
                    onClick={convertToWebP}
                    disabled={isProcessing}
                    className="w-full rounded-xl text-xs font-bold"
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="mr-2 h-4.5 w-4.5 animate-spin" />
                        Đang nén & convert...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4.5 w-4.5" />
                        Bắt đầu xử lý WebP
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Stats Card */}
          {stats && (
            <Card className="animate-fade-in border-green-200 bg-green-50/10 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-1.5 text-sm font-bold text-green-800">
                  <Sparkles className="h-4.5 w-4.5 text-green-600" />
                  Kết quả tối ưu dung lượng
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-xs">
                <div className="flex justify-between border-b border-slate-100/50 pb-2">
                  <span className="text-slate-500">Nguyên bản:</span>
                  <span className="font-bold text-slate-700">
                    {formatSize(stats.originalSize)}
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-100/50 pb-2">
                  <span className="text-slate-500">Sau khi nén:</span>
                  <span className="font-bold text-green-700">
                    {formatSize(stats.compressedSize)}
                  </span>
                </div>
                <div className="flex justify-between rounded-lg border-b border-slate-100/50 bg-green-500/10 p-1.5 pb-2">
                  <span className="font-semibold text-green-800">
                    Dung lượng giảm được:
                  </span>
                  <span className="flex items-center font-black text-green-800">
                    <Percent className="mr-0.5 h-3.5 w-3.5" />
                    {stats.compressionRatio}%
                  </span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Thời gian xử lý:</span>
                  <span>{stats.duration} ms</span>
                </div>
                <Button
                  onClick={downloadWebP}
                  variant="outline"
                  className="mt-2 w-full rounded-xl border-green-200 text-xs font-semibold text-green-700 hover:bg-green-50"
                >
                  <Download className="mr-2 h-4 w-4" />
                  Tải ảnh nén .webp
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column: Previews */}
        <div className="flex flex-col gap-6 md:col-span-7">
          <Card className="flex-1 border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-base font-bold">
                2. So sánh ảnh trực quan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-6">
              {!originalPreview ? (
                <div className="flex min-h-[300px] flex-col items-center justify-center text-slate-400">
                  <FileImage className="mb-2 h-12 w-12" />
                  <p className="text-xs">Chưa có hình ảnh nào được chọn</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Original Image */}
                  <div className="flex flex-col gap-2">
                    <span className="block text-center text-xs font-bold text-slate-700">
                      Ảnh gốc (Original)
                    </span>
                    <div className="relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={originalPreview}
                        alt="Original source preview"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  </div>

                  {/* Compressed WebP Image */}
                  <div className="flex flex-col gap-2">
                    <span className="text-primary block text-center text-xs font-bold">
                      Ảnh nén (WebP Output)
                    </span>
                    <div className="border-primary/20 relative flex aspect-square items-center justify-center overflow-hidden rounded-xl border bg-slate-100">
                      {webpPreview ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={webpPreview}
                          alt="WebP converted preview"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1.5 p-4 text-center text-slate-400">
                          <ArrowRight className="h-6 w-6 animate-pulse" />
                          <p className="text-[10px]">
                            Bấm nút &quot;Bắt đầu xử lý WebP&quot; để tạo bản
                            nén
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
