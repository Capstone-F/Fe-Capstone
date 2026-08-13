import { publicApiClient } from "@/core/api/client";
import { getApiAuthHandlers } from "@/core/api/auth-handlers";
import { API_ENDPOINTS } from "@/core/api/endpoints";

export type CommerceEventType =
  | "PRODUCT_VIEWED"
  | "ADDED_TO_CART"
  | "CHECKOUT_STARTED";

export type CommerceEventSource = "CATALOG" | "SURVEY";

interface StoredSession {
  id: string;
  lastActiveAt: number;
}

interface TrackOptions {
  eventType: CommerceEventType;
  source?: CommerceEventSource;
  productId?: string;
  productVariantId?: string;
}

const STORAGE_KEY = "glowscan_commerce_analytics_session_v1";
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;

function readSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const parsed = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) ?? "null",
    ) as StoredSession | null;
    if (!parsed?.id || !Number.isFinite(parsed.lastActiveAt)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function getCommerceAnalyticsSessionId(): string {
  const now = Date.now();
  const stored = readSession();
  const session =
    stored && now - stored.lastActiveAt <= SESSION_TIMEOUT_MS
      ? { ...stored, lastActiveAt: now }
      : { id: crypto.randomUUID(), lastActiveAt: now };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  return session.id;
}

export function trackCommerceEvent(options: TrackOptions): void {
  if (typeof window === "undefined") return;
  const event = {
    eventId: crypto.randomUUID(),
    sessionId: getCommerceAnalyticsSessionId(),
    eventType: options.eventType,
    source: options.source ?? "CATALOG",
    productId: options.productId,
    productVariantId: options.productVariantId,
    path: window.location.pathname,
    occurredAt: new Date().toISOString(),
  };

  const accessToken = getApiAuthHandlers()?.getAccessToken();
  void publicApiClient
    .post(
      API_ENDPOINTS.ANALYTICS.COMMERCE_EVENTS,
      { events: [event] },
      accessToken
        ? { headers: { Authorization: `Bearer ${accessToken}` } }
        : undefined,
    )
    .catch(() => undefined);
}
