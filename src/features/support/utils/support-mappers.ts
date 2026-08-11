import {
  SupportSessionStatus,
  SupportMessageSenderRole,
} from "../types/support.types";

export const SUPPORT_STATUS_LABELS: Record<SupportSessionStatus, string> = {
  [SupportSessionStatus.OPEN]: "Chờ nhận",
  [SupportSessionStatus.ACTIVE]: "Đang hỗ trợ",
  [SupportSessionStatus.CLOSED]: "Đã hoàn thành",
};

export const SUPPORT_SENDER_ROLE_LABELS: Record<
  SupportMessageSenderRole,
  string
> = {
  [SupportMessageSenderRole.CUSTOMER]: "Khách hàng",
  [SupportMessageSenderRole.STAFF]: "Nhân viên hỗ trợ",
  [SupportMessageSenderRole.SYSTEM]: "Hệ thống",
};

export function getSupportStatusLabel(status: SupportSessionStatus): string {
  return SUPPORT_STATUS_LABELS[status] || status;
}

export function getSupportSenderRoleLabel(
  role: SupportMessageSenderRole,
): string {
  return SUPPORT_SENDER_ROLE_LABELS[role] || role;
}
