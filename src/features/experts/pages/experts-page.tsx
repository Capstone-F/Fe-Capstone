"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  MapPin,
  Star,
  Filter,
  RefreshCw,
  UserCheck,
} from "lucide-react";
import {
  useExperts,
  useSpecialties,
} from "@/features/experts/hooks/use-experts";
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
import { vi } from "@/config/locales/vi";
import { EmptyState } from "@/shared/components/ui/empty-state";
import { ExpertCardSkeleton } from "@/features/experts/components/expert-card-skeleton";

export function ExpertsPage() {
  const [search, setSearch] = useState("");
  const [specialty, setSpecialty] = useState("Tất cả");
  const [maxDistance, setMaxDistance] = useState<number>(15);
  const [minRating, setMinRating] = useState<number>(0);
  const [maxFee, setMaxFee] = useState<number>(500000);

  const filters = {
    search: search || undefined,
    specialty: specialty !== "Tất cả" ? specialty : undefined,
    maxDistance,
    minRating: minRating > 0 ? minRating : undefined,
    maxFee,
  };

  const { data: experts, isLoading } = useExperts(filters);
  const { data: specialties } = useSpecialties();
  const t = vi.userPortal.expertsPage;

  const handleReset = () => {
    setSearch("");
    setSpecialty("Tất cả");
    setMaxDistance(15);
    setMinRating(0);
    setMaxFee(500000);
  };

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
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
                  className="pl-8 text-sm"
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
                <SelectTrigger className="text-sm">
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

            {/* Max Fee Input */}
            <div className="flex flex-col gap-1.5">
              <Label
                htmlFor="maxFee"
                className="text-xs font-semibold text-slate-700"
              >
                {t.maxFeeLabel}
              </Label>
              <Input
                id="maxFee"
                type="number"
                step="50000"
                min="100000"
                max="1000000"
                value={maxFee}
                onChange={(e) => setMaxFee(Number(e.target.value))}
                className="text-sm"
              />
              <span className="text-muted-foreground text-right text-[10px]">
                {maxFee.toLocaleString("vi-VN")} đ
              </span>
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

            {/* Min Rating Stars Filter */}
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs font-semibold text-slate-700">
                {t.minRatingLabel}
              </Label>
              <div className="flex gap-1">
                {[0, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    type="button"
                    variant={minRating === star ? "default" : "outline"}
                    size="sm"
                    onClick={() => setMinRating(star)}
                    className="h-8 flex-1 px-1 text-xs"
                  >
                    {star === 0 ? t.all : `${star}★`}
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Experts List */}
        <div className="flex flex-col gap-4 md:col-span-3">
          {isLoading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <ExpertCardSkeleton key={index} />
              ))}
            </div>
          ) : experts && experts.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {experts.map((exp) => (
                <Card
                  key={exp.id}
                  className="hover:border-primary/40 flex flex-col justify-between border-slate-200 shadow-xs transition-colors"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-primary bg-primary/10 rounded-md px-2 py-0.5 text-[10px] font-bold tracking-wider uppercase">
                          {exp.title}
                        </span>
                        <CardTitle className="mt-1 text-base font-bold text-slate-900">
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
                    <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3 text-xs">
                      <span className="text-muted-foreground">
                        {t.distanceLabel}
                      </span>
                      <span className="font-semibold text-slate-700">
                        {exp.distance} km
                      </span>
                    </div>
                  </CardContent>
                  <CardFooter className="flex items-center justify-between rounded-b-xl border-t border-slate-100 bg-slate-50/50 p-4 pt-2">
                    <div>
                      <span className="text-muted-foreground block text-[10px] font-semibold uppercase">
                        {t.feeLabel}
                      </span>
                      <span className="text-sm font-bold text-slate-800">
                        {exp.fee.toLocaleString("vi-VN")} đ
                      </span>
                    </div>
                    <Link href={`/experts/${exp.id}`}>
                      <Button
                        size="sm"
                        className="rounded-lg text-xs font-semibold"
                      >
                        {t.book}
                      </Button>
                    </Link>
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
      </div>
    </div>
  );
}
