import { isAxiosError } from "axios";

type AuthAction = "login" | "register";

const FALLBACK_MESSAGES: Record<AuthAction, string> = {
  login: "Đăng nhập thất bại. Vui lòng thử lại.",
  register: "Đăng ký thất bại. Vui lòng thử lại.",
};

export function getAuthErrorMessage(
  error: unknown,
  action: AuthAction,
): string {
  if (!isAxiosError(error)) {
    return FALLBACK_MESSAGES[action];
  }

  if (!error.response) {
    return "Không thể kết nối đến hệ thống. Vui lòng kiểm tra mạng và thử lại.";
  }

  const status = error.response.status;

  if (status === 401) {
    return action === "login"
      ? "Email hoặc mật khẩu không chính xác."
      : "Không thể xác thực tài khoản vừa đăng ký. Vui lòng thử đăng nhập lại.";
  }

  if (status === 409) {
    return "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác.";
  }

  if (status === 400 || status === 422) {
    return action === "login"
      ? "Thông tin đăng nhập chưa hợp lệ. Vui lòng kiểm tra lại."
      : "Thông tin đăng ký chưa hợp lệ. Vui lòng kiểm tra lại.";
  }

  if (status === 429) {
    return "Bạn thao tác quá nhanh. Vui lòng đợi một lát rồi thử lại.";
  }

  if (status >= 500) {
    return "Hệ thống đang tạm thời gián đoạn. Vui lòng thử lại sau.";
  }

  return FALLBACK_MESSAGES[action];
}
