"use client";

import { useMemo, useState } from "react";
import {
  AlertTriangle,
  Boxes,
  PackageCheck,
  PackageX,
  RefreshCw,
} from "lucide-react";

import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/shared/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useStockInventory } from "../hooks/useStock";
import type { InventoryItemDto } from "../types/stock.types";

const warningPriority: Record<
  NonNullable<InventoryItemDto["stockWarning"]>,
  number
> = {
  OUT_OF_STOCK: 0,
  LOW: 1,
};

function StockWarningBadge({ item }: { item: InventoryItemDto }) {
  if (!item.stockWarning || !item.warningMessage) {
    return (
      <Badge
        variant="outline"
        className="border-emerald-200 bg-emerald-50 text-emerald-700"
      >
        <PackageCheck /> Đủ hàng
      </Badge>
    );
  }

  const outOfStock = item.stockWarning === "OUT_OF_STOCK";
  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant={outOfStock ? "destructive" : "outline"}
            className={cn(
              !outOfStock &&
                "border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100",
            )}
          />
        }
      >
        {outOfStock ? <PackageX /> : <AlertTriangle />}
        {outOfStock ? "Hết hàng" : "Sắp hết"}
      </TooltipTrigger>
      <TooltipContent className="max-w-72 text-center">
        {item.warningMessage}
      </TooltipContent>
    </Tooltip>
  );
}

function InventoryMobileCard({ item }: { item: InventoryItemDto }) {
  return (
    <article
      className={cn(
        "rounded-2xl border p-4 sm:hidden",
        item.stockWarning === "OUT_OF_STOCK" && "border-red-200 bg-red-50/40",
        item.stockWarning === "LOW" && "border-amber-200 bg-amber-50/40",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {item.productName}
          </p>
          <p className="mt-0.5 font-mono text-xs text-slate-500">{item.sku}</p>
        </div>
        <StockWarningBadge item={item} />
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Hoạt chất</p>
          <p className="mt-1 line-clamp-2">
            {item.activeIngredients.length
              ? item.activeIngredients.join(", ")
              : "Chưa cập nhật"}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-xs text-slate-500">Tồn kho</p>
          <p
            className={cn(
              "text-xl font-bold text-slate-900",
              item.stockWarning === "OUT_OF_STOCK" && "text-red-700",
              item.stockWarning === "LOW" && "text-amber-700",
            )}
          >
            {item.stockQuantity}
          </p>
        </div>
      </div>
      {item.warningMessage && (
        <p className="mt-3 border-t pt-3 text-xs font-medium text-slate-700">
          {item.warningMessage}
        </p>
      )}
    </article>
  );
}

export function InventoryWarningTable() {
  const inventory = useStockInventory();
  const [warningsOnly, setWarningsOnly] = useState(false);

  const sortedItems = useMemo(() => {
    const items = [...(inventory.data ?? [])];
    return items
      .filter((item) => !warningsOnly || item.stockWarning !== null)
      .sort((left, right) => {
        const leftPriority = left.stockWarning
          ? warningPriority[left.stockWarning]
          : 2;
        const rightPriority = right.stockWarning
          ? warningPriority[right.stockWarning]
          : 2;
        return (
          leftPriority - rightPriority ||
          left.productName.localeCompare(right.productName, "vi")
        );
      });
  }, [inventory.data, warningsOnly]);

  const warningCount =
    inventory.data?.filter((item) => item.stockWarning !== null).length ?? 0;

  return (
    <Card className="overflow-hidden rounded-3xl border-slate-200/90 shadow-sm">
      <CardHeader className="gap-4 border-b border-slate-100 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="flex items-center gap-2 text-base">
            <Boxes className="h-5 w-5 text-emerald-700" /> Tồn kho hiện tại
          </CardTitle>
          <CardDescription className="mt-1 text-xs">
            Theo dõi sản phẩm sắp hết để chủ động lập phiếu nhập kho.
          </CardDescription>
        </div>
        <Button
          type="button"
          variant={warningsOnly ? "default" : "outline"}
          size="sm"
          aria-pressed={warningsOnly}
          onClick={() => setWarningsOnly((current) => !current)}
          className="w-full rounded-xl sm:w-auto"
        >
          <AlertTriangle className="mr-1.5 h-4 w-4" /> Cần nhập kho
          <Badge
            variant="secondary"
            className="ml-2 min-w-6 bg-white/80 text-slate-800"
          >
            {warningCount}
          </Badge>
        </Button>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        {inventory.isLoading ? (
          <div className="space-y-3" aria-label="Đang tải tồn kho">
            {[0, 1, 2].map((index) => (
              <Skeleton key={index} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        ) : inventory.isError ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-red-200 bg-red-50/50 p-6 text-center">
            <PackageX className="h-8 w-8 text-red-500" />
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Không thể tải dữ liệu tồn kho
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Vui lòng kiểm tra kết nối và thử lại.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => void inventory.refetch()}
            >
              <RefreshCw className="mr-1.5 h-4 w-4" /> Thử lại
            </Button>
          </div>
        ) : sortedItems.length === 0 ? (
          <div className="flex min-h-40 flex-col items-center justify-center gap-2 rounded-2xl border border-dashed p-6 text-center">
            <PackageCheck className="h-8 w-8 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-900">
              {warningsOnly
                ? "Không có sản phẩm cần nhập kho"
                : "Chưa có dữ liệu tồn kho"}
            </p>
            <p className="text-xs text-slate-500">
              {warningsOnly
                ? "Tất cả sản phẩm hiện đang cao hơn ngưỡng cảnh báo."
                : "Dữ liệu sẽ xuất hiện khi hệ thống có biến thể sản phẩm."}
            </p>
          </div>
        ) : (
          <>
            <div className="space-y-3 sm:hidden">
              {sortedItems.map((item) => (
                <InventoryMobileCard key={item.productVariantId} item={item} />
              ))}
            </div>
            <div className="hidden sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Sản phẩm</TableHead>
                    <TableHead>Hoạt chất</TableHead>
                    <TableHead className="text-right">Tồn kho</TableHead>
                    <TableHead className="text-right">Trạng thái</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedItems.map((item) => (
                    <TableRow
                      key={item.productVariantId}
                      className={cn(
                        item.stockWarning === "OUT_OF_STOCK" && "bg-red-50/50",
                        item.stockWarning === "LOW" && "bg-amber-50/50",
                      )}
                    >
                      <TableCell>
                        <p className="max-w-72 truncate font-semibold text-slate-900">
                          {item.productName}
                        </p>
                        <p className="mt-0.5 font-mono text-xs text-slate-500">
                          {item.sku}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-80 text-xs whitespace-normal text-slate-600">
                        {item.activeIngredients.length
                          ? item.activeIngredients.join(", ")
                          : "Chưa cập nhật"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "text-right text-base font-bold",
                          item.stockWarning === "OUT_OF_STOCK" &&
                            "text-red-700",
                          item.stockWarning === "LOW" && "text-amber-700",
                        )}
                      >
                        {item.stockQuantity}
                      </TableCell>
                      <TableCell className="text-right">
                        <StockWarningBadge item={item} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
