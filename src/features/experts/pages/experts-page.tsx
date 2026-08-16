"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Filter,
  RefreshCw,
  UserCheck,
  LocateFixed,
  Sparkles,
  Navigation,
} from "lucide-react";
import {
  useExperts,
  useSpecialties,
} from "@/features/experts/hooks/useExperts";
import {
  useProvinceWards,
  useProvinces,
} from "@/features/experts/hooks/useProvinces";
import { useSession } from "@/features/auth/hooks/useSession";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Label } from "@/shared/components/ui/label";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ExpertCardSkeleton } from "@/features/experts/components/expert-card-skeleton";
import { ExpertClinicMap } from "@/features/experts/components/expert-clinic-map";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/shared/components/ui/carousel";
import { CurrencyInput } from "@/shared/components/form/currency-input";
import { formatVnd } from "@/shared/utils/format";
import useDebounce from "@/shared/hooks/useDebounce";
import {
  buildExpertDiscoveryLabel,
  EXPERT_DISCOVERY_STORAGE_KEY,
  hasExpertDiscoverySelection,
  type ExpertDiscoverySelection,
} from "@/features/experts/lib/expert-discovery";

const EMPTY_DISCOVERY_SELECTION: ExpertDiscoverySelection = {
  provinceCode: null,
  provinceName: null,
  wardCode: null,
  wardName: null,
};

type GeolocationState = {
  status: "idle" | "loading" | "granted" | "denied" | "unsupported";
  lat: number | null;
  lng: number | null;
};

function readDiscoverySelection(): ExpertDiscoverySelection {
  if (typeof window === "undefined") {
    return EMPTY_DISCOVERY_SELECTION;
  }

  const raw = window.sessionStorage.getItem(EXPERT_DISCOVERY_STORAGE_KEY);

  if (!raw) {
    return EMPTY_DISCOVERY_SELECTION;
  }

  try {
    const parsed = JSON.parse(raw) as ExpertDiscoverySelection;
    return {
      provinceCode: parsed.provinceCode ?? null,
      provinceName: parsed.provinceName ?? null,
      wardCode: parsed.wardCode ?? null,
      wardName: parsed.wardName ?? null,
    };
  } catch {
    return EMPTY_DISCOVERY_SELECTION;
  }
}

export function ExpertsPage() {
  const session = useSession();
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search.trim(), 350);
  const [specialty, setSpecialty] = useState("Tất cả");
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxFee, setMaxFee] = useState("2000000");

  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [carouselIndex, setCarouselIndex] = useState(0);
  const mapSectionRef = useRef<HTMLElement>(null);
  const [discoverySelection, setDiscoverySelection] =
    useState<ExpertDiscoverySelection>(readDiscoverySelection);
  const [geolocation, setGeolocation] = useState<GeolocationState>({
    status: "idle",
    lat: null,
    lng: null,
  });

  const isAuthenticated = Boolean(session.data);
  const { data: provinces } = useProvinces();
  const { data: wards } = useProvinceWards(discoverySelection.provinceCode);

  function persistDiscoverySelection(next: ExpertDiscoverySelection) {
    setDiscoverySelection(next);
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        EXPERT_DISCOVERY_STORAGE_KEY,
        JSON.stringify(next),
      );
    }
  }

  function requestPreciseLocation() {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setGeolocation({ status: "unsupported", lat: null, lng: null });
      return;
    }

    setGeolocation((current) => ({ ...current, status: "loading" }));

    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setGeolocation({
          status: "granted",
          lat: coords.latitude,
          lng: coords.longitude,
        });
      },
      () => {
        setGeolocation({ status: "denied", lat: null, lng: null });
      },
      {
        enableHighAccuracy: true,
        timeout: 10_000,
        maximumAge: 300_000,
      },
    );
  }

  useEffect(() => {
    if (isAuthenticated) {
      const timer = window.setTimeout(() => {
        requestPreciseLocation();
      }, 0);

      return () => window.clearTimeout(timer);
    }
  }, [isAuthenticated]);

  const filters = {
    search: debouncedSearch || undefined,
    specialty: specialty !== "Tất cả" ? specialty : undefined,
    maxDistance: geolocation.status === "granted" ? maxDistance : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    maxFee:
      maxFee !== "" && Number(maxFee) > 0 && Number(maxFee) <= 5000000
        ? Number(maxFee)
        : undefined,
    lat: geolocation.lat ?? undefined,
    lng: geolocation.lng ?? undefined,
    provinceName: discoverySelection.provinceName ?? undefined,
  };

  const { data: experts, isLoading } = useExperts(filters, !session.isLoading);
  const { data: specialties } = useSpecialties(!session.isLoading);

  useEffect(() => {
    if (!carouselApi || !experts?.length) return;

    const syncSelection = () => {
      const index = carouselApi.selectedScrollSnap();
      setCarouselIndex(index);
      setSelectedExpertId(experts[index]?.id ?? null);
    };

    syncSelection();
    carouselApi.on("select", syncSelection);
    carouselApi.on("reInit", syncSelection);
    return () => {
      carouselApi.off("select", syncSelection);
      carouselApi.off("reInit", syncSelection);
    };
  }, [carouselApi, experts]);

  const t = {
    title: "Mạng lưới Chuyên gia Da liễu",
    subtitle:
      "Tìm kiếm và đặt lịch tư vấn trực tuyến 1-1 cùng đội ngũ chuyên gia da liễu hàng đầu.",
    filtersTitle: "Bộ lọc tìm kiếm",
    reset: "Đặt lại",
    searchLabel: "Tìm kiếm",
    searchPlaceholder: "Nhập tên chuyên gia, phòng khám...",
    specialtyLabel: "Chuyên môn",
    allSpecialties: "Tất cả chuyên môn",
    maxFeeLabel: "Phí tư vấn tối đa (đ)",
    maxDistanceLabel: "Khoảng cách tối đa",
    minRatingLabel: "Đánh giá tối thiểu",
    all: "Tất cả",
    distanceLabel: "Khoảng cách:",
    feeLabel: "Phí tư vấn",
    book: "Đặt lịch tư vấn",
    emptyTitle: "Không tìm thấy chuyên gia phù hợp",
    emptyHint: "Thử thay đổi hoặc đặt lại bộ lọc tìm kiếm của bạn.",
    emptyAction: "Xóa bộ lọc",
  };

  const selectedExpert = experts?.find((e) => e.id === selectedExpertId);

  const handleReset = () => {
    setSearch("");
    setSpecialty("Tất cả");
    setMaxDistance(15);
    setMinRating(0);
    setMaxFee("2000000");
    setSelectedExpertId(null);
    persistDiscoverySelection(EMPTY_DISCOVERY_SELECTION);
  };

  const selectedLocationLabel = hasExpertDiscoverySelection(discoverySelection)
    ? buildExpertDiscoveryLabel(discoverySelection)
    : "Chưa chọn địa chỉ ưu tiên";

  const geolocationHint =
    geolocation.status === "granted"
      ? "Đang lọc chuyên gia theo GPS hiện tại của bạn."
      : geolocation.status === "loading"
        ? "Đang định vị vị trí GPS..."
        : geolocation.status === "denied"
          ? "Đã tắt GPS. Hiển thị danh sách mặc định."
          : geolocation.status === "unsupported"
            ? "Trình duyệt không hỗ trợ GPS."
            : "Bật GPS để sắp xếp theo khoảng cách gần nhất.";

  const handleProvinceChange = (value: string | null) => {
    if (!value) {
      persistDiscoverySelection(EMPTY_DISCOVERY_SELECTION);
      return;
    }

    const provinceCode = Number(value);
    const province = provinces?.find((item) => item.code === provinceCode);

    persistDiscoverySelection({
      provinceCode,
      provinceName: province?.name ?? null,
      wardCode: null,
      wardName: null,
    });
  };

  const handleWardChange = (value: string | null) => {
    if (!value) {
      persistDiscoverySelection({
        ...discoverySelection,
        wardCode: null,
        wardName: null,
      });
      return;
    }

    const wardCode = Number(value);
    const ward = wards?.find((item) => item.code === wardCode);

    persistDiscoverySelection({
      ...discoverySelection,
      wardCode,
      wardName: ward?.name ?? null,
    });
  };

  const formatDistance = (distance?: number) => {
    if (geolocation.status === "granted" && distance !== undefined) {
      return `${Number(distance).toFixed(2).replace(".", ",")} km`;
    }
    if (geolocation.status === "loading") {
      return "Đang định vị...";
    }
    return "Chưa cấp GPS";
  };

  const focusClinic = (expertId: string) => {
    const index = experts?.findIndex((expert) => expert.id === expertId) ?? -1;
    setSelectedExpertId(expertId);
    if (index >= 0) carouselApi?.scrollTo(index);
    mapSectionRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (session.isLoading) {
    return (
      <div className="container mx-auto flex max-w-7xl flex-col items-center justify-center px-4 py-16 text-center text-slate-500">
        <div className="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-[#2C3E35] border-t-transparent"></div>
        <p className="text-xs font-medium">Đang tải mạng lưới chuyên gia...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto flex max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 md:py-12">
      {/* Page Header Banner */}
      <div className="flex flex-col gap-2 border-b border-slate-200/80 pb-6 dark:border-slate-800">
        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#D5E2DC] bg-[#E2EBE6]/60 px-3.5 py-1 text-xs font-bold text-[#2C3E35]">
          <Sparkles className="h-3.5 w-3.5 text-[#2C3E35]" />
          <span>Đội ngũ Bác sĩ & Chuyên gia GlowScan</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl dark:text-white">
          {t.title}
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[#5C7468] dark:text-slate-400">
          {t.subtitle}
        </p>
      </div>

      <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-12">
        {/* Filters Sidebar Card */}
        <Card className="overflow-hidden rounded-3xl border border-t-4 border-slate-200/90 border-t-[#2C3E35] bg-white shadow-xl shadow-slate-200/30 md:col-span-4 lg:col-span-4 dark:border-slate-800 dark:bg-slate-900">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-5 dark:border-slate-800">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900 dark:text-white">
              <Filter className="h-4 w-4 text-[#2C3E35] dark:text-emerald-400" />
              <span>{t.filtersTitle}</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2 text-xs font-semibold text-[#2C3E35] hover:bg-[#E2EBE6] dark:text-emerald-400 dark:hover:bg-emerald-950"
            >
              <RefreshCw className="mr-1.5 h-3 w-3" />
              {t.reset}
            </Button>
          </CardHeader>

          <CardContent className="flex flex-col gap-5 p-5">
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="search"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t.searchLabel}
              </Label>
              <div className="relative">
                <Search className="absolute top-2.5 left-3 h-4 w-4 text-slate-400" />
                <Input
                  id="search"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="rounded-xl border-slate-200 pl-9 text-xs dark:border-slate-800"
                />
              </div>
            </div>

            {/* Specialty Dropdown */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.specialtyLabel}
              </Label>
              <Select
                value={specialty}
                onValueChange={(val) => setSpecialty(val || "Tất cả")}
              >
                <SelectTrigger className="rounded-xl border-slate-200 text-xs dark:border-slate-800">
                  <SelectValue placeholder="Chọn chuyên khoa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tất cả">{t.allSpecialties}</SelectItem>
                  {specialties?.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Province Filter */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Tỉnh / Thành phố
              </Label>
              <Select
                value={
                  discoverySelection.provinceCode
                    ? String(discoverySelection.provinceCode)
                    : "all"
                }
                items={{
                  all: "Tất cả tỉnh thành",
                  ...Object.fromEntries(
                    (provinces ?? []).map((p) => [String(p.code), p.name]),
                  ),
                }}
                onValueChange={(val) =>
                  handleProvinceChange(val === "all" ? null : val)
                }
              >
                <SelectTrigger className="rounded-xl border-slate-200 text-xs dark:border-slate-800">
                  <SelectValue placeholder="Tất cả tỉnh thành" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tất cả tỉnh thành</SelectItem>
                  {provinces?.map((province) => (
                    <SelectItem
                      key={province.code}
                      value={String(province.code)}
                    >
                      {province.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Ward Filter */}
            {discoverySelection.provinceCode && (
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Phường / Xã
                </Label>
                <Select
                  value={
                    discoverySelection.wardCode
                      ? String(discoverySelection.wardCode)
                      : "all"
                  }
                  items={{
                    all: "Tất cả phường xã",
                    ...Object.fromEntries(
                      (wards ?? []).map((w) => [String(w.code), w.name]),
                    ),
                  }}
                  onValueChange={(val) =>
                    handleWardChange(val === "all" ? null : val)
                  }
                >
                  <SelectTrigger className="rounded-xl border-slate-200 text-xs dark:border-slate-800">
                    <SelectValue placeholder="Tất cả phường xã" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả phường xã</SelectItem>
                    {(wards ?? []).map((ward) => (
                      <SelectItem key={ward.code} value={String(ward.code)}>
                        {ward.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* Max Fee Input */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="maxFee"
                className="text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                {t.maxFeeLabel}
              </Label>
              <CurrencyInput
                id="maxFee"
                value={maxFee}
                onValueChange={setMaxFee}
                maxLength={11}
                className="rounded-xl border-slate-200 text-xs dark:border-slate-800"
              />
            </div>

            {/* Max Distance Slider */}
            <div className="flex flex-col gap-2">
              <Label className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                <span>{t.maxDistanceLabel}</span>
                <span className="font-extrabold text-[#2C3E35] dark:text-emerald-400">
                  {maxDistance} km
                </span>
              </Label>
              <input
                type="range"
                min="1"
                max="50"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-slate-200 accent-[#2C3E35] dark:bg-slate-800"
              />
            </div>

            {/* Min Rating Stars Filter */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {t.minRatingLabel}
              </Label>
              <div className="flex gap-1.5">
                {[0, 3, 4, 5].map((star) => {
                  const isSelected = minRating === star;
                  return (
                    <Button
                      key={star}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setMinRating(star)}
                      className={`h-8 flex-1 rounded-xl text-xs font-bold transition-all ${
                        isSelected
                          ? "border-[#2C3E35] bg-[#2C3E35] text-white hover:bg-[#3A5246]"
                          : "border-slate-200 text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:text-slate-300"
                      }`}
                    >
                      {star === 0 ? t.all : `${star}★`}
                    </Button>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="min-w-0 space-y-6 md:col-span-8 lg:col-span-8">
          <div className="flex flex-col gap-3 rounded-3xl border border-slate-200/90 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#E2EBE6] text-[#2C3E35] dark:bg-emerald-950 dark:text-emerald-400">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <span className="block text-xs font-bold text-slate-900 dark:text-white">
                  Khu vực ưu tiên của bạn
                </span>
                <span className="text-xs text-slate-600 dark:text-slate-400">
                  {selectedLocationLabel}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-400">
                  {geolocationHint}
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={requestPreciseLocation}
              className="self-end rounded-xl border-slate-200 text-xs font-bold hover:bg-slate-50 sm:self-auto"
            >
              <LocateFixed className="mr-1.5 h-3.5 w-3.5 text-[#2C3E35]" />
              Bật GPS
            </Button>
          </div>

          {isLoading ? (
            <div className="grid gap-4 sm:grid-cols-2">
              {Array.from({ length: 2 }).map((_, index) => (
                <ExpertCardSkeleton key={index} />
              ))}
            </div>
          ) : experts && experts.length > 0 ? (
            <>
              <Carousel
                setApi={setCarouselApi}
                opts={{ align: "start", loop: false }}
                className="w-full"
              >
                <CarouselContent className="items-stretch">
                  {experts.map((exp, idx) => (
                    <CarouselItem
                      key={exp.id}
                      className="flex basis-[92%] sm:basis-1/2 xl:basis-1/3"
                    >
                      <Card
                        onFocus={() => setSelectedExpertId(exp.id)}
                        onMouseEnter={() => setSelectedExpertId(exp.id)}
                        className={`group flex h-full w-full flex-col overflow-hidden rounded-2xl border bg-white shadow-xs transition-all hover:shadow-md dark:bg-slate-900 ${
                          selectedExpertId === exp.id
                            ? "border-[#2C3E35] ring-1 ring-[#2C3E35]/20"
                            : "border-slate-200/90 dark:border-slate-800"
                        }`}
                      >
                        <CardHeader className="p-5 pb-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <span className="rounded-full bg-[#E2EBE6] px-2.5 py-0.5 text-[10px] font-bold text-[#2C3E35] uppercase">
                                Chuyên gia {idx + 1}
                              </span>
                              <CardTitle className="mt-2 truncate text-base font-bold">
                                <Link
                                  href={`/experts/${exp.id}`}
                                  className="transition-colors hover:text-emerald-700 hover:underline dark:hover:text-emerald-400"
                                >
                                  {exp.name}
                                </Link>
                              </CardTitle>
                            </div>
                            <div className="flex shrink-0 items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                              <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                              {exp.rating}
                            </div>
                          </div>
                          <CardDescription className="mt-2 flex items-start gap-1.5 text-xs">
                            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-600" />
                            <span className="line-clamp-2">{exp.clinic}</span>
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 p-5 pt-1 pb-3">
                          <p className="line-clamp-3 text-xs leading-relaxed text-slate-600 dark:text-slate-300">
                            {exp.bio || "Chưa cập nhật giới thiệu chuyên gia."}
                          </p>
                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {exp.specialties.map((item) => (
                              <span
                                key={item}
                                className="rounded-lg bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300"
                              >
                                {item}
                              </span>
                            ))}
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t pt-3 text-xs">
                            <span className="text-slate-400">
                              {t.distanceLabel}
                            </span>
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              {formatDistance(exp.distance)}
                            </span>
                          </div>
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch gap-3 border-t bg-slate-50/70 p-4 dark:bg-slate-800/40">
                          <div className="flex items-end justify-between gap-2">
                            <div>
                              <span className="block text-[10px] font-bold text-slate-400 uppercase">
                                {t.feeLabel}
                              </span>
                              <span className="text-base font-extrabold text-[#2C3E35] dark:text-emerald-400">
                                {formatVnd(exp.fee)}
                              </span>
                            </div>
                            <Link href={`/experts/${exp.id}`}>
                              <Button size="sm" className="text-xs font-bold">
                                {t.book}
                              </Button>
                            </Link>
                          </div>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => focusClinic(exp.id)}
                            className="w-full text-xs font-bold"
                          >
                            <Navigation className="mr-1.5 h-3.5 w-3.5" />
                            Xem vị trí phòng khám
                          </Button>
                        </CardFooter>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="left-2 z-10 bg-white/95 shadow-md" />
                <CarouselNext className="right-2 z-10 bg-white/95 shadow-md" />
              </Carousel>

              <div className="flex items-center justify-center gap-1.5 sm:hidden">
                {experts.map((expert, index) => (
                  <button
                    key={expert.id}
                    type="button"
                    aria-label={`Đến chuyên gia ${index + 1}`}
                    onClick={() => carouselApi?.scrollTo(index)}
                    className={`h-2 rounded-full transition-all ${
                      index === carouselIndex
                        ? "w-6 bg-[#2C3E35]"
                        : "w-2 bg-slate-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-xs text-slate-500">
                  {carouselIndex + 1}/{experts.length}
                </span>
              </div>

              <section ref={mapSectionRef} className="scroll-mt-6 space-y-3">
                <div>
                  <h2 className="text-base font-bold text-slate-950 dark:text-white">
                    Vị trí phòng khám
                  </h2>
                  <p className="text-xs text-slate-500">
                    {selectedExpert
                      ? `Đang xem ${selectedExpert.clinic}`
                      : "Chọn một chuyên gia để xem vị trí phòng khám."}
                  </p>
                </div>
                <div className="h-[430px] w-full overflow-hidden rounded-3xl border border-slate-200 bg-slate-50 shadow-sm sm:h-[520px]">
                  <ExpertClinicMap
                    experts={experts}
                    userLocation={
                      geolocation.lat !== null && geolocation.lng !== null
                        ? { lat: geolocation.lat, lng: geolocation.lng }
                        : null
                    }
                    selectedExpertId={selectedExpertId}
                    onSelectExpert={(expertId) => {
                      setSelectedExpertId(expertId);
                      const index = experts.findIndex(
                        (expert) => expert.id === expertId,
                      );
                      if (index >= 0) carouselApi?.scrollTo(index);
                    }}
                  />
                </div>
              </section>
            </>
          ) : (
            <EmptyState
              icon={UserCheck}
              title={t.emptyTitle}
              description={t.emptyHint}
              action={{ label: t.emptyAction, onClick: handleReset }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
