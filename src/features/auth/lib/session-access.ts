export function shouldRedirectToLogin({
  isLoading,
  hasSession,
}: {
  isLoading: boolean;
  hasSession: boolean;
}) {
  return !isLoading && !hasSession;
}
