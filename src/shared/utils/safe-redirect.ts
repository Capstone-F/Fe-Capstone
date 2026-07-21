const defaultRedirect = "/dashboard";

export function sanitizeRedirectPath(value?: string) {
  if (!value) {
    return defaultRedirect;
  }

  if (!value.startsWith("/") || value.startsWith("//")) {
    return defaultRedirect;
  }

  return value;
}
