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

  return reason instanceof Error
    ? reason.message
    : "Không thể tải thông tin ca tư vấn.";
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

  if (reason instanceof Error && reason.message) return reason.message;
  return `Không thể mở ${channelLabel}.`;
}
