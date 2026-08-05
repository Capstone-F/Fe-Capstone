import { ApiError } from "@/core/api/errors";

/**
 * A survey completed by an earlier attempt is not a user-facing failure — the
 * backend rejects a second complete with 400 "already completed".
 */
export function isAlreadyCompletedError(error: unknown): boolean {
  if (!(error instanceof ApiError)) return false;
  return (
    error.status === 400 &&
    error.message.toLowerCase().includes("already completed")
  );
}

/** The session no longer exists (deleted or belongs to another customer). */
export function isSessionGoneError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

const NETWORK_MESSAGE =
  "Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng và thử lại.";
const EXPIRED_SESSION_MESSAGE =
  "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
const SURVEY_NOT_FOUND_MESSAGE =
  "Không tìm thấy phiên khảo sát. Hãy bắt đầu bài test mới.";

/**
 * Translate the survey endpoints' known backend errors into Vietnamese.
 *
 * The backend registers no global exception filter, so `ApiError.message` is
 * Nest's raw English text (or axios's "Network Error"). Never surface it to the
 * customer: recognised cases get a translation, everything else gets the
 * caller's Vietnamese fallback. Translation happens here at display time only —
 * the raw message stays on the error so `isAlreadyCompletedError` keeps working.
 */
function translateApiError(error: ApiError): string | null {
  // No status means the request never reached the backend (network / timeout).
  if (error.status === undefined) return NETWORK_MESSAGE;

  const message = error.message.toLowerCase();

  if (error.status === 400) {
    if (message.includes("at least one answer")) {
      return "Hãy trả lời ít nhất một câu hỏi trước khi hoàn tất.";
    }
    if (message.includes("already completed")) {
      return "Bài test này đã được hoàn tất trước đó.";
    }
    return null;
  }

  if (error.status === 404) return SURVEY_NOT_FOUND_MESSAGE;
  if (error.status === 401 || error.status === 403) {
    return EXPIRED_SESSION_MESSAGE;
  }

  return null;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (error instanceof ApiError) return translateApiError(error) ?? fallback;
  // Plain Errors here are thrown by our own hooks and already carry Vietnamese copy.
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
