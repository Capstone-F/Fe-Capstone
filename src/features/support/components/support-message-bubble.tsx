"use client";

import Image from "next/image";
import React from "react";
import { Headphones } from "lucide-react";
import {
  SupportMessageResponseDto,
  SupportMessageSenderRole,
  ProductMessageMetadata,
} from "../types/support.types";
import { useAddToCart } from "@/features/commerce/hooks/useCart";
import { Button } from "@/shared/components/ui/button";
import { ShoppingCart, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

interface SupportMessageBubbleProps {
  message: SupportMessageResponseDto;
  customerName?: string | null;
  assignedStaffName?: string | null;
}

export function SupportMessageBubble({
  message,
  assignedStaffName,
}: SupportMessageBubbleProps) {
  const isCustomer = message.senderRole === SupportMessageSenderRole.CUSTOMER;
  const isSystem = message.senderRole === SupportMessageSenderRole.SYSTEM;
  const addToCartMutation = useAddToCart();

  const handleAddToCart = (productVariantId: string) => {
    addToCartMutation.mutate(
      { productVariantId, quantity: 1 },
      {
        onSuccess: () => toast.success("Đã thêm vào giỏ hàng"),
        onError: () => toast.error("Có lỗi xảy ra khi thêm vào giỏ hàng"),
      },
    );
  };

  if (isSystem) {
    return (
      <div className="my-2 flex justify-center">
        <span className="rounded-full bg-slate-200/80 px-3 py-1 text-[11px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400">
          {message.content}
        </span>
      </div>
    );
  }

  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={`flex w-full flex-col ${
        isCustomer ? "items-end" : "items-start"
      }`}
    >
      <div className="mb-1 flex items-center gap-1.5 px-1 text-[10px] text-slate-400">
        {!isCustomer && (
          <div className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400">
            <Headphones className="h-2.5 w-2.5" />
          </div>
        )}
        <span className="font-medium text-slate-500 dark:text-slate-400">
          {isCustomer
            ? "Bạn"
            : assignedStaffName || "Nhân viên hỗ trợ GlowScan"}
        </span>
        <span>•</span>
        <span>{formattedTime}</span>
      </div>

      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs shadow-xs ${
          isCustomer
            ? "rounded-br-xs bg-emerald-600 font-normal text-white"
            : "rounded-bl-xs border border-slate-200/90 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
        }`}
      >
        {message.metadata?.type === "product" ? (
          (() => {
            const pm = message.metadata as unknown as ProductMessageMetadata;
            return (
              <div className="group relative flex w-[260px] items-center gap-3 overflow-hidden rounded-xl border border-slate-100 bg-white p-2 pr-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
                {pm.imageUrl ? (
                  <Image
                    src={pm.imageUrl}
                    alt=""
                    width={56}
                    height={56}
                    className="h-14 w-14 rounded-lg bg-white object-cover"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-lg bg-slate-100" />
                )}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                    {pm.productName}
                  </p>
                  <p className="mt-1 text-xs font-bold text-emerald-600">
                    {new Intl.NumberFormat("vi-VN", {
                      style: "currency",
                      currency: "VND",
                    }).format(pm.priceVnd)}
                  </p>
                </div>

                {/* Hover Overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-3 bg-black/60 opacity-0 backdrop-blur-[2px] transition-opacity duration-200 group-hover:opacity-100">
                  <Link
                    href={`/products/${pm.productId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-8 items-center rounded-full border-0 bg-white px-3 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900"
                  >
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" />
                    Chi tiết
                  </Link>
                  <Button
                    size="sm"
                    className="h-8 rounded-full border-0 bg-emerald-600 text-white hover:bg-emerald-700"
                    onClick={() => handleAddToCart(pm.productVariantId)}
                    disabled={addToCartMutation.isPending}
                  >
                    <ShoppingCart className="mr-1.5 h-3.5 w-3.5" />
                    Vào giỏ
                  </Button>
                </div>
              </div>
            );
          })()
        ) : (
          <p className="leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}
