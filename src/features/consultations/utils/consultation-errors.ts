import { ApiError } from "@/core/api/errors";

export function getBookingWorkspaceError(reason: unknown): string {
  if (reason instanceof ApiError) {
    if (reason.status === 404) {
      return "Không tìm thấy ca tư vấn này. Ca có thể đã bị xóa hoặc đường dẫn không còn hợp lệ.";
    }
    if (reason.status === 403) {
      return "Bạn không có quyền truy cập ca tư vấn này.";
    }
  }

  // Don't leak raw error messages to the UI — log for debugging only.
  if (reason instanceof Error) {
    console.warn("[BookingWorkspace]", reason);
  }
  return "Không thể tải thông tin ca tư vấn.";
}

export function getConsultationConnectionError(
  reason: unknown,
  channel: "video" | "chat",
): string {
  const channelLabel = channel === "video" ? "phòng video" : "trò chuyện";

  if (reason instanceof ApiError) {
    if (
      reason.status === 503 &&
      /zego|server_secret|app_id/i.test(reason.message)
    ) {
      return `Chưa thể mở ${channelLabel} vì máy chủ local chưa cấu hình ZEGO_APP_ID và ZEGO_SERVER_SECRET.`;
    }
    if (reason.status === 404) {
      return "Không tìm thấy ca tư vấn tương ứng với đường dẫn này.";
    }
    if (reason.status === 403) {
      return `Bạn không có quyền mở ${channelLabel} của ca tư vấn này.`;
    }
  }

  // Don't leak raw error messages to the UI — log for debugging only.
  if (reason) {
    console.warn(`[ConsultationConnection:${channel}]`, reason);
  }
  return `Không thể mở ${channelLabel}. Vui lòng thử lại.`;
}
