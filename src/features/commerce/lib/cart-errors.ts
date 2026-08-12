import { toast } from "sonner";
import { ApiError } from "@/core/api/errors";

export function showAddToCartError(error: unknown): void {
  if (
    error instanceof ApiError &&
    /cannot mix .* and .* items/i.test(error.message)
  ) {
    toast.error(
      "Giỏ hàng đang chứa sản phẩm từ kết quả khảo sát. Hãy hoàn tất hoặc xóa giỏ hiện tại trước khi mua sản phẩm khác.",
      {
        action: {
          label: "Xem giỏ hàng",
          onClick: () => window.location.assign("/cart"),
        },
      },
    );
    return;
  }

  if (
    error instanceof ApiError &&
    /product variant .* not found/i.test(error.message)
  ) {
    toast.error("Sản phẩm này hiện không còn khả dụng.");
    return;
  }

  toast.error("Không thể thêm vào giỏ hàng. Vui lòng thử lại.");
}
