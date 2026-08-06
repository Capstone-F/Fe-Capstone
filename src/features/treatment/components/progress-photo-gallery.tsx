"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  Lock,
  SlidersHorizontal,
  Sparkles,
  Upload,
} from "lucide-react";
import { toast } from "sonner";
import {
  useCreateProgressPhoto,
  useTreatmentEvents,
  useTreatmentPlans,
} from "@/features/treatments/hooks/useTreatments";
import { Button } from "@/shared/components/ui/button";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80";

function getSafeImageUrl(url?: string): string {
  if (!url || typeof url !== "string") return FALLBACK_IMAGE;
  if (url.startsWith("file://")) return FALLBACK_IMAGE;
  return url;
}

export function ProgressPhotoGallery() {
  const { data: treatmentPlans, isLoading: isPlansLoading } =
    useTreatmentPlans("customer");
  const activeTreatment = treatmentPlans?.[0];
  const treatmentId = activeTreatment?.id;
  const isTreatmentActive =
    activeTreatment && activeTreatment.status === "ACTIVE";

  const { data: events, isLoading: isEventsLoading } = useTreatmentEvents(
    treatmentId || "",
    "PROGRESS_PHOTO",
  );

  const createPhotoMutation = useCreateProgressPhoto();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [note, setNote] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [beforeIndex, setBeforeIndex] = useState(0);
  const [afterIndex, setAfterIndex] = useState(1);
  const [sliderPos, setSliderPos] = useState(50);

  const photos = (events || []).map((evt, idx) => ({
    id: evt.id,
    index: idx,
    date: evt.createdAt,
    url: getSafeImageUrl(evt.photoUrl || undefined),
    title: evt.title || `Ảnh tiến trình mốc ${idx + 1}`,
    notes: evt.note || undefined,
  }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setIsModalOpen(true);
    }
  };

  const handleUploadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !treatmentId) {
      toast.error("Vui lòng chọn ảnh và phác đồ điều trị hoạt động.");
      return;
    }

    createPhotoMutation.mutate(
      {
        treatmentId,
        file: selectedFile,
        title: title.trim() || `Ảnh tiến trình mốc ${photos.length + 1}`,
        note: note.trim() || undefined,
      },
      {
        onSuccess: () => {
          toast.success("Đã đăng tải ảnh tiến trình da mới thành công!");
          setSelectedFile(null);
          setPreviewUrl(null);
          setTitle("");
          setNote("");
          setIsModalOpen(false);
        },
        onError: (err) => {
          toast.error(
            (err as Error)?.message ||
              "Không thể tải ảnh lên. Vui lòng thử lại.",
          );
        },
      },
    );
  };

  const isLoading = isPlansLoading || isEventsLoading;

  if (isLoading) {
    return (
      <div className="flex h-64 w-full items-center justify-center rounded-3xl border border-slate-200 bg-white">
        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
        <span className="ml-2 text-xs text-slate-500">
          Đang tải tiến trình da...
        </span>
      </div>
    );
  }

  // Lock state if treatment is missing or not active
  if (!isTreatmentActive) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-xs">
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
          <Lock className="h-6 w-6" />
        </div>
        <h4 className="text-base font-bold text-slate-900">
          So Sánh Tiến Trình Da Chưa Khởi Tạo
        </h4>
        <p className="mt-1.5 max-w-md text-xs leading-relaxed text-slate-500">
          Tính năng theo dõi & so sánh tiến trình da bằng hình ảnh được gắn liền
          với{" "}
          <span className="font-semibold text-slate-800">
            Liệu trình Điều trị Khách hàng với Bác sĩ
          </span>
          . Bạn cần có 1 phác đồ điều trị hoạt động để ghi nhận ảnh tiến trình.
        </p>
      </div>
    );
  }

  const beforePhoto = photos[beforeIndex] || photos[0];
  const afterPhoto =
    photos[afterIndex] || photos[photos.length - 1] || photos[0];

  return (
    <div className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Sparkles className="h-5 w-5 text-amber-500" />
            So Sánh Tiến Trình Da Theo Liệu Trình
          </h3>
          <p className="text-xs text-slate-500">
            Hình ảnh ghi nhận theo từng mốc điều trị với Bác sĩ phụ trách.
          </p>
        </div>

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="user"
          onChange={handleFileChange}
          className="hidden"
        />

        <Button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 rounded-xl bg-[#6b5cf6] text-xs font-bold text-white shadow-xs hover:bg-[#5a4ae5]"
        >
          <Camera className="h-4 w-4" />
          Thêm Ảnh Tiến Trình Mới
        </Button>
      </div>

      {photos.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 p-12 text-center">
          <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-600">
            <ImageIcon className="h-6 w-6" />
          </div>
          <h4 className="text-sm font-bold text-slate-800">
            Chưa Có Ảnh Tiến Trình
          </h4>
          <p className="mt-1 max-w-sm text-xs text-slate-500">
            Tải lên ảnh chụp khuôn mặt mốc ban đầu (Baseline) để Bác sĩ và bạn
            cùng theo dõi hiệu quả điều trị.
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 rounded-xl bg-[#2C3E35] text-xs font-bold text-white hover:bg-[#3A5246]"
          >
            <Upload className="mr-1.5 h-4 w-4" />
            Tải Ảnh Chụp Mặt Ngay
          </Button>
        </div>
      ) : (
        <>
          {/* Split Slider View — Standardized 1:1 Aspect ratio or contained box */}
          <div className="relative h-80 w-full overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-inner select-none sm:h-[420px]">
            {/* After Image (Background) */}
            {afterPhoto && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Image
                  unoptimized
                  src={getSafeImageUrl(afterPhoto.url)}
                  alt={afterPhoto.title}
                  fill
                  className="object-contain"
                />
                <span className="absolute right-3 bottom-3 rounded-lg bg-slate-900/90 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                  Sau: {afterPhoto.title} (
                  {new Date(afterPhoto.date).toLocaleDateString("vi-VN")})
                </span>
              </div>
            )}

            {/* Before Image (Clipped Foreground) */}
            {beforePhoto && (
              <div
                className="absolute inset-0 overflow-hidden border-r border-amber-400"
                style={{ width: `${sliderPos}%` }}
              >
                <div className="relative flex h-full w-full items-center justify-center bg-slate-950">
                  <Image
                    unoptimized
                    src={getSafeImageUrl(beforePhoto.url)}
                    alt={beforePhoto.title}
                    fill
                    className="object-contain"
                  />
                  <span className="absolute bottom-3 left-3 rounded-lg bg-amber-600/95 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-md">
                    Trước: {beforePhoto.title} (
                    {new Date(beforePhoto.date).toLocaleDateString("vi-VN")})
                  </span>
                </div>
              </div>
            )}

            {/* Divider Bar & Handle */}
            <div
              className="absolute top-0 bottom-0 w-1 cursor-ew-resize bg-white shadow-lg"
              style={{ left: `${sliderPos}%` }}
            >
              <div className="absolute top-1/2 flex h-9 w-9 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-800 shadow-lg">
                <SlidersHorizontal className="h-4 w-4" />
              </div>
            </div>

            {/* Range Input */}
            <input
              type="range"
              min="0"
              max="100"
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
            />
          </div>

          {/* Selector Controls */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-amber-700 uppercase">
                Mốc Trước (Before / Baseline):
              </label>
              <select
                value={beforeIndex}
                onChange={(e) => setBeforeIndex(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-amber-500"
              >
                {photos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.title} — {new Date(p.date).toLocaleDateString("vi-VN")}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold tracking-wider text-blue-700 uppercase">
                Mốc Sau (After / Tái khám):
              </label>
              <select
                value={afterIndex}
                onChange={(e) => setAfterIndex(Number(e.target.value))}
                className="rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-blue-500"
              >
                {photos.map((p, idx) => (
                  <option key={p.id} value={idx}>
                    {p.title} — {new Date(p.date).toLocaleDateString("vi-VN")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Photos Grid Gallery */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            <h4 className="text-xs font-bold tracking-wider text-slate-700 uppercase">
              Danh Sách Ảnh Trong Phác Đồ ({photos.length} ảnh)
            </h4>

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {photos.map((p, idx) => {
                const isBefore = idx === beforeIndex;
                const isAfter = idx === afterIndex;

                return (
                  <div
                    key={p.id}
                    className={`group relative flex flex-col overflow-hidden rounded-2xl border p-2 transition-all ${
                      isBefore
                        ? "border-amber-500 bg-amber-50/50 shadow-xs"
                        : isAfter
                          ? "border-blue-500 bg-blue-50/50 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300"
                    }`}
                  >
                    <div className="relative h-32 w-full overflow-hidden rounded-xl bg-slate-900">
                      <Image
                        unoptimized
                        src={p.url}
                        alt={p.title}
                        fill
                        className="object-cover"
                      />
                      {(isBefore || isAfter) && (
                        <span
                          className={`absolute top-2 left-2 rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white ${
                            isBefore ? "bg-amber-600" : "bg-blue-600"
                          }`}
                        >
                          {isBefore ? "BEFORE" : "AFTER"}
                        </span>
                      )}
                    </div>

                    <div className="mt-2 flex flex-col gap-0.5">
                      <span className="truncate text-xs font-bold text-slate-800">
                        {p.title}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(p.date).toLocaleDateString("vi-VN")}
                      </span>
                    </div>

                    <div className="mt-2 flex gap-1">
                      <button
                        type="button"
                        onClick={() => setBeforeIndex(idx)}
                        className={`flex-1 rounded-lg py-1 text-[10px] font-bold ${
                          isBefore
                            ? "bg-amber-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Chọn Before
                      </button>
                      <button
                        type="button"
                        onClick={() => setAfterIndex(idx)}
                        className={`flex-1 rounded-lg py-1 text-[10px] font-bold ${
                          isAfter
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                        }`}
                      >
                        Chọn After
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}

      {/* Photo Upload Confirmation Modal */}
      {isModalOpen && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md space-y-4 rounded-3xl bg-white p-6 shadow-xl">
            <h4 className="text-base font-bold text-slate-900">
              Đăng Tải Ảnh Tiến Trình Mới
            </h4>

            <div className="relative h-56 w-full overflow-hidden rounded-2xl border border-slate-200 bg-slate-900">
              <Image
                unoptimized
                src={previewUrl}
                alt="Preview"
                fill
                className="object-contain"
              />
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Tên mốc ảnh theo dõi:
                </label>
                <input
                  type="text"
                  placeholder="VD: Tuần 3 - Sau 3 tuần dùng Retinol"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700">
                  Ghi chú tiến trình da (Tùy chọn):
                </label>
                <input
                  type="text"
                  placeholder="VD: Vùng má giảm đỏ 80%, không xuất hiện mụn mới"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl"
                >
                  Hủy
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={createPhotoMutation.isPending}
                  className="rounded-xl bg-[#6b5cf6] font-bold text-white hover:bg-[#5a4ae5]"
                >
                  {createPhotoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Lưu Ảnh Tiến Trình"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
