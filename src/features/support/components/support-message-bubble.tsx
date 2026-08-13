"use client";

import React from "react";
import { Headphones } from "lucide-react";
import {
  SupportMessageResponseDto,
  SupportMessageSenderRole,
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
      }
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
          <div className="group relative flex items-center gap-3 bg-white dark:bg-slate-800 rounded-xl p-2 pr-4 border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden w-[260px]">
            {message.metadata.imageUrl ? (
              <img src={message.metadata.imageUrl} alt="" className="h-14 w-14 rounded-lg object-cover bg-white" />
            ) : (
              <div className="h-14 w-14 rounded-lg bg-slate-100" />
            )}
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate text-slate-800 dark:text-slate-100">{message.metadata.productName}</p>
              <p className="text-xs text-emerald-600 font-bold mt-1">
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(message.metadata.priceVnd)}
              </p>
            </div>
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center gap-3 backdrop-blur-[2px]">
              <Link
                href={`/products/${message.metadata.productId}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center h-8 px-3 rounded-full bg-white text-slate-700 hover:bg-slate-100 hover:text-slate-900 border-0 text-sm font-medium transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                Chi tiết
              </Link>
              <Button
                size="sm"
                className="h-8 rounded-full bg-emerald-600 text-white hover:bg-emerald-700 border-0"
                onClick={() => handleAddToCart(message.metadata!.productVariantId)}
                disabled={addToCartMutation.isPending}
              >
                <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
                Vào giỏ
              </Button>
            </div>
          </div>
        ) : (
          <p className="leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
          </p>
        )}
      </div>
    </div>
  );
}
