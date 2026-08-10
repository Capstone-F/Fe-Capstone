import type {
  SessionUser,
  MobileTokenResponse,
  AuthStatus,
} from "../types/auth.types";

export const authMock = {
  getSession: async (): Promise<SessionUser> => {
    return {
      id: "dev-user-id",
      email: "dev@glowscan.local",
      name: "Dev User",
      provider: "local",
      roles: ["CUSTOMER"],
      clinicId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },

  getAuthStatus: async (): Promise<AuthStatus> => {
    return { authenticated: true };
  },

  loginDirect: async (
    username: string,
    _guestToken?: string,
  ): Promise<MobileTokenResponse> => {
    void _guestToken;
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresIn: 3600,
      user: {
        id: "dev-user-id",
        username,
        email: "dev@glowscan.local",
      },
    };
  },

  registerDirect: async (
    email: string,
    name: string,
    _guestToken?: string,
  ): Promise<MobileTokenResponse> => {
    void _guestToken;
    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresIn: 3600,
      user: {
        id: "dev-user-id",
        username: email,
        email,
        name,
      },
    };
  },
};
