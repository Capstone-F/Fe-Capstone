"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Filter,
  RefreshCw,
  UserCheck,
  Map,
  LocateFixed,
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
import { formatVnd } from "@/shared/utils/format";
import useDebounce from "@/shared/hooks/useDebounce";
import {
  buildExpertDiscoveryLabel,
  EXPERT_DISCOVERY_STORAGE_KEY,
  hasExpertDiscoverySelection,
  type ExpertDiscoverySelection,
} from "@/features/experts/lib/expert-discovery";
import { calculateHaversineDistanceKm } from "@/features/experts/lib/geo";

const EMPTY_DISCOVERY_SELECTION: ExpertDiscoverySelection = {
  provinceCode: null,
  provinceName: null,
  wardCode: null,
  wardName: null,
};

const MAX_FEE_OPTIONS = [
  { value: "300000", label: "Đến 300.000 đ" },
  { value: "500000", label: "Đến 500.000 đ" },
  { value: "750000", label: "Đến 750.000 đ" },
  { value: "1000000", label: "Đến 1.000.000 đ" },
  { value: "all", label: "Không giới hạn" },
];

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
  const [maxFee, setMaxFee] = useState("500000");

  const [hoveredExpertId, setHoveredExpertId] = useState<string | null>(null);
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);
  const [showMobileMap, setShowMobileMap] = useState(false);
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
    minRating: minRating > 0 ? minRating : undefined,
    maxFee: maxFee !== "all" ? Number(maxFee) : undefined,
  };

  const { data: experts, isLoading } = useExperts(filters, !session.isLoading);
  const { data: specialties } = useSpecialties(!session.isLoading);
  const displayedExperts = useMemo(() => {
    if (!experts) return [];
    if (
      geolocation.status !== "granted" ||
      geolocation.lat === null ||
      geolocation.lng === null
    ) {
      return experts;
    }

    const origin = { lat: geolocation.lat, lng: geolocation.lng };

    return experts
      .map((expert) => {
        const clinic = expert.clinicLocation;
        if (
          !clinic ||
          clinic.latitude === null ||
          clinic.longitude === null ||
          !Number.isFinite(clinic.latitude) ||
          !Number.isFinite(clinic.longitude)
        ) {
          return { ...expert, distance: undefined };
        }

        return {
          ...expert,
          distance: calculateHaversineDistanceKm(origin, {
            lat: clinic.latitude,
            lng: clinic.longitude,
          }),
        };
      })
      .filter(
        (expert) =>
          expert.distance !== undefined && expert.distance <= maxDistance,
      );
  }, [experts, geolocation, maxDistance]);
  const t = {
    title: "Mạng lưới Chuyên gia da liễu",
    subtitle:
      "Tìm kiếm và đặt lịch tư vấn trực tuyến cùng đội ngũ chuyên gia da liễu hàng đầu.",
    filtersTitle: "Bộ lọc tùy chọn",
    reset: "Đặt lại",
    searchLabel: "Tìm kiếm",
    searchPlaceholder: "Tên chuyên gia, trung tâm...",
    specialtyLabel: "Chuyên môn",
    allSpecialties: "Tất cả chuyên môn",
    maxFeeLabel: "Phí tư vấn tối đa (đ)",
    maxDistanceLabel: "Khoảng cách tối đa",
    minRatingLabel: "Xếp hạng tối thiểu",
    all: "Tất cả",
    distanceLabel: "Khoảng cách:",
    feeLabel: "Phí tư vấn",
    book: "Đặt lịch tư vấn",
    emptyTitle: "Không tìm thấy chuyên gia phù hợp",
    emptyHint: "Thử nới lỏng các bộ lọc tìm kiếm của bạn.",
    emptyAction: "Xóa bộ lọc",
  };

  const handleReset = () => {
    setSearch("");
    setSpecialty("Tất cả");
    setMaxDistance(15);
    setMinRating(0);
    setMaxFee("all");
    setSelectedExpertId(null);
  };

  const selectedLocationLabel = hasExpertDiscoverySelection(discoverySelection)
    ? buildExpertDiscoveryLabel(discoverySelection)
    : "Chưa chọn địa chỉ ưu tiên";

  const geolocationHint =
    geolocation.status === "granted"
      ? "Đang lọc chuyên gia theo GPS hiện tại của bạn."
      : geolocation.status === "loading"
        ? "Đang lấy vị trí GPS hiện tại..."
        : geolocation.status === "denied"
          ? "Bạn đã từ chối GPS. Danh sách hiển thị nhưng không sắp xếp theo khoảng cách."
          : geolocation.status === "unsupported"
            ? "Trình duyệt này không hỗ trợ GPS. Danh sách hiển thị không theo khoảng cách."
            : "Bật GPS để xem khoảng cách đến từng chuyên gia.";

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
      return `${distance.toFixed(1)} km`;
    }

    if (geolocation.status === "loading" || geolocation.status === "idle") {
      return "Đang cập nhật GPS";
    }

    return "Không dùng GPS";
  };

  if (session.isLoading) {
    return (
      <div className="text-muted-foreground mx-auto flex max-w-4xl flex-col items-center justify-center p-12 text-center">
        <div className="border-primary mb-3 h-8 w-8 animate-spin rounded-full border-b-2"></div>
        Đang tải mạng lưới chuyên gia...
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl min-w-0 flex-col gap-6 px-4 sm:px-0">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          {t.title}
        </h2>
        <p className="text-muted-foreground text-sm">{t.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        {/* Filters Sidebar Card */}
        <Card className="border-slate-200 shadow-sm md:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-100 p-4">
            <div className="flex items-center gap-2 text-sm font-bold">
              <Filter className="text-primary h-4 w-4" />
              {t.filtersTitle}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="text-muted-foreground hover:text-primary h-8 px-2 text-xs"
            >
              <RefreshCw className="mr-1 h-3 w-3" />
              {t.reset}
            </Button>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 p-4">
            {/* Search Input */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="search"
                className="text-xs font-semibold text-slate-700"
              >
                {t.searchLabel}
              </Label>
              <div className="relative">
                <Search className="text-muted-foreground absolute top-2.5 left-2.5 h-4 w-4" />
                <Input
                  id="search"
                  placeholder={t.searchPlaceholder}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9"
                />
              </div>
            </div>

            {/* Specialty Dropdown */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t.specialtyLabel}
              </Label>
              <Select
                value={specialty}
                onValueChange={(val) => setSpecialty(val || "Tất cả")}
              >
                <SelectTrigger className="w-full text-sm">
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
              <Label className="text-xs font-semibold text-slate-700">
                Tỉnh / Thành phố
              </Label>
              <Select
                value={
                  discoverySelection.provinceCode
                    ? String(discoverySelection.provinceCode)
                    : "all"
                }
                onValueChange={(val) =>
                  handleProvinceChange(val === "all" ? null : val)
                }
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue>
                    {discoverySelection.provinceName ?? "Tất cả tỉnh thành"}
                  </SelectValue>
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
                <Label className="text-xs font-semibold text-slate-700">
                  Phường / Xã
                </Label>
                <Select
                  value={
                    discoverySelection.wardCode
                      ? String(discoverySelection.wardCode)
                      : "all"
                  }
                  onValueChange={(val) =>
                    handleWardChange(val === "all" ? null : val)
                  }
                >
                  <SelectTrigger className="w-full text-sm">
                    <SelectValue>
                      {discoverySelection.wardName ?? "Tất cả phường xã"}
                    </SelectValue>
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

            {/* Max Fee Filter */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t.maxFeeLabel}
              </Label>
              <Select
                value={maxFee}
                onValueChange={(value) => setMaxFee(value ?? "all")}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue>
                    {MAX_FEE_OPTIONS.find((option) => option.value === maxFee)
                      ?.label ?? "Không giới hạn"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {MAX_FEE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Max Distance Slider */}
            <div className="flex flex-col gap-1.5">
              <Label className="flex justify-between text-xs font-semibold text-slate-700">
                <span>{t.maxDistanceLabel}</span>
                <span className="text-primary font-bold">{maxDistance} km</span>
              </Label>
              <input
                type="range"
                min="1"
                max="25"
                value={maxDistance}
                onChange={(e) => setMaxDistance(Number(e.target.value))}
                className="accent-primary h-1.5 w-full cursor-pointer appearance-none rounded-lg bg-slate-200"
              />
            </div>

            {/* Min Rating Filter */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t.minRatingLabel}
              </Label>
              <Select
                value={String(minRating)}
                onValueChange={(value) => setMinRating(Number(value))}
              >
                <SelectTrigger className="w-full text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Tất cả xếp hạng</SelectItem>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <SelectItem key={star} value={String(star)}>
                      Từ {star} sao
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Experts List & Map Split View */}
        <div className="flex flex-col gap-4 md:col-span-3">
          {/* Location Bar & Map Preview Toggle */}
          <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-[#2C3E35]" />
              <div>
                <span className="block text-xs font-bold text-slate-800">
                  Khu vực ưu tiên của bạn
                </span>
                <span className="text-xs text-slate-500">
                  {selectedLocationLabel}
                </span>
                <span className="mt-0.5 block text-[11px] text-slate-500">
                  {geolocationHint}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:flex-nowrap">
              <Button
                variant="outline"
                size="sm"
                onClick={requestPreciseLocation}
                className="rounded-xl text-xs font-semibold"
              >
                <LocateFixed className="mr-1.5 h-3.5 w-3.5" />
                Cập nhật GPS
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowMobileMap(!showMobileMap)}
                className="flex items-center gap-1.5 rounded-xl border-[#2C3E35] text-xs font-semibold text-[#2C3E35] hover:bg-[#E0F2E9]/30 lg:hidden"
              >
                <Map className="h-3.5 w-3.5" />
                {showMobileMap ? "Xem danh sách" : "Xem bản đồ"}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">
            {/* Left Column: Experts List */}
            <div
              className={`flex flex-col gap-4 lg:col-span-7 ${showMobileMap ? "hidden lg:flex" : "flex"}`}
            >
              {isLoading ? (
                <div className="flex flex-col gap-4">
                  {Array.from({ length: 4 }).map((_, index) => (
                    <ExpertCardSkeleton key={index} />
                  ))}
                </div>
              ) : displayedExperts.length > 0 ? (
                <div className="flex flex-col gap-4">
                  {displayedExperts.map((exp, idx) => (
                    <Card
                      key={exp.id}
                      onMouseEnter={() => setHoveredExpertId(exp.id)}
                      onMouseLeave={() => setHoveredExpertId(null)}
                      className={`flex min-w-0 flex-col justify-between overflow-hidden border-slate-200 shadow-xs transition-colors duration-200 hover:border-[#2C3E35]/40 ${
                        hoveredExpertId === exp.id ||
                        selectedExpertId === exp.id
                          ? "border-[#2C3E35] ring-1 ring-[#2C3E35]/10"
                          : ""
                      }`}
                    >
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[9px] font-bold text-slate-700 uppercase">
                                Hạng {idx + 1}
                              </span>
                              <span className="text-primary bg-primary/10 rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase">
                                {exp.title}
                              </span>
                            </div>
                            <CardTitle className="mt-1.5 text-base font-bold text-slate-900">
                              {exp.name}
                            </CardTitle>
                          </div>
                          <div className="flex shrink-0 items-center gap-1 rounded-md bg-yellow-500/10 px-2 py-0.5 text-xs font-bold text-yellow-600">
                            <Star className="h-3 w-3 fill-current" />
                            <span>{exp.rating}</span>
                          </div>
                        </div>
                        <CardDescription className="mt-1 flex items-center gap-1 text-xs">
                          <MapPin className="text-muted-foreground h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{exp.clinic}</span>
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="flex-1 p-4 pt-1 pb-2">
                        <p className="text-muted-foreground line-clamp-2 text-xs leading-relaxed">
                          {exp.bio}
                        </p>
                        <div className="mt-3 flex flex-wrap gap-1">
                          {exp.specialties.map((s) => (
                            <span
                              key={s}
                              className="rounded bg-slate-100 px-2 py-0.5 text-[9px] font-medium text-slate-600"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                        <div className="mt-3 flex flex-col gap-1 border-t border-slate-100 pt-3 text-xs sm:flex-row sm:items-center sm:justify-between">
                          <span className="text-muted-foreground">
                            {t.distanceLabel}
                          </span>
                          <span className="font-semibold text-slate-700 sm:text-right">
                            {formatDistance(exp.distance)}
                          </span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex flex-col items-stretch gap-3 rounded-b-xl border-t border-slate-100 bg-slate-50/50 p-4 pt-2 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                            {t.feeLabel}
                          </span>
                          <span className="text-sm font-bold text-slate-800">
                            {formatVnd(exp.fee)}
                          </span>
                        </div>
                        <div className="flex w-full items-center gap-2 sm:w-auto">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedExpertId(exp.id);
                              setShowMobileMap(true);
                            }}
                            className="flex-1 rounded-lg text-xs font-semibold sm:flex-none"
                          >
                            Định vị
                          </Button>
                          <Link
                            href={`/experts/${exp.id}`}
                            className="flex-1 sm:flex-none"
                          >
                            <Button
                              size="sm"
                              className="w-full rounded-lg bg-[#2C3E35] text-xs font-semibold text-white hover:bg-[#3d574a] sm:w-auto"
                            >
                              {t.book}
                            </Button>
                          </Link>
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={UserCheck}
                  title={t.emptyTitle}
                  description={t.emptyHint}
                  action={{ label: t.emptyAction, onClick: handleReset }}
                />
              )}
            </div>

            {/* Right Column: clinic locations */}
            <div
              className={`sticky top-6 w-full lg:col-span-5 lg:block ${showMobileMap ? "block" : "hidden"}`}
            >
              <div className="h-[500px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#FAF8F5] shadow-xs">
                <ExpertClinicMap
                  experts={displayedExperts}
                  userLocation={
                    geolocation.status === "granted" &&
                    geolocation.lat !== null &&
                    geolocation.lng !== null
                      ? { lat: geolocation.lat, lng: geolocation.lng }
                      : null
                  }
                  selectedExpertId={selectedExpertId}
                  hoveredExpertId={hoveredExpertId}
                  onSelectExpert={setSelectedExpertId}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
