const fallbackError = {
  title: "The auth flow did not complete.",
  description:
    "The frontend reached the auth error route, but the backend did not supply a known reason code. Restart the login flow and inspect the backend auth logs if it happens again.",
};

const authErrors: Record<string, typeof fallbackError> = {
  missing_params: {
    title: "Keycloak callback was missing required parameters.",
    description:
      "The backend did not receive both `code` and `state` from Keycloak. This usually means the flow was interrupted or the callback URL is misconfigured.",
  },
  state_mismatch: {
    title: "CSRF state validation failed.",
    description:
      "The session stored by the backend no longer matches the `state` coming back from Keycloak. Restart the login flow and verify cookies are not being dropped.",
  },
  exchange_failed: {
    title: "Backend token exchange with Keycloak failed.",
    description:
      "NestJS reached the callback route but could not exchange the authorization code for a session. Check Keycloak client settings and BE env values.",
  },
};

export function getAuthErrorContent(reason?: string) {
  if (!reason) {
    return fallbackError;
  }

  return authErrors[reason] ?? fallbackError;
}
