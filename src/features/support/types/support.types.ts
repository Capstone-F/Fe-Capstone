export enum SupportSessionStatus {
  OPEN = "OPEN",
  ACTIVE = "ACTIVE",
  CLOSED = "CLOSED",
}

export enum SupportMessageSenderRole {
  CUSTOMER = "CUSTOMER",
  STAFF = "STAFF",
  SYSTEM = "SYSTEM",
}

export interface SupportSessionResponseDto {
  id: string;
  customerUserId: string;
  customerName: string | null;
  status: SupportSessionStatus;
  subject: string | null;
  assignedStaffUserId: string | null;
  assignedStaffName: string | null;
  assignedAt: string | null;
  messageCount: number;
  customerLastReadSeq: number;
  staffLastReadSeq: number;
  lastMessageAt: string | null;
  lastMessagePreview: string | null;
  closedByUserId: string | null;
  closedAt: string | null;
  closeReason: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedSupportSessionsDto {
  items: SupportSessionResponseDto[];
  total: number;
  page: number;
  limit: number;
}

export interface ListSupportSessionsQueryDto {
  status?: SupportSessionStatus;
  assigned?: "me" | "unassigned" | "any";
  page?: number;
  limit?: number;
}

export interface SupportMessageResponseDto {
  id: string;
  sessionId: string;
  seq: number;
  senderUserId: string;
  senderRole: SupportMessageSenderRole;
  content: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}

export interface SupportMessagesPageDto {
  items: SupportMessageResponseDto[];
  lastSeq: number;
  hasMore: boolean;
}

export interface CreateSupportSessionDto {
  subject?: string;
}

export interface SendSupportMessageDto {
  content: string;
  metadata?: Record<string, unknown> | null;
}

export interface MarkSupportReadDto {
  lastReadSeq: number;
}

export interface CloseSupportSessionDto {
  reason?: string;
}

export interface ProductMessageMetadata {
  type: "product";
  productId: string;
  productVariantId: string;
  productName: string;
  priceVnd: number;
  imageUrl: string | null;
}
