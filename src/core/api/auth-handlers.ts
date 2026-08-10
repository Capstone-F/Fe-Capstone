export interface ApiAuthHandlers {
  getAccessToken: () => string | undefined;
  getGuestToken?: () => string | undefined;
  refreshAccessToken: () => Promise<string>;
  onSessionExpired: () => void;
}

let authHandlers: ApiAuthHandlers | null = null;

export const configureApiAuth = (handlers: ApiAuthHandlers): void => {
  authHandlers = handlers;
};

export const getApiAuthHandlers = (): ApiAuthHandlers | null => authHandlers;
