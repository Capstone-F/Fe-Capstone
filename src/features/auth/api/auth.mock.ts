import type {
  SessionUser,
  MobileTokenResponse,
  AuthStatus,
} from "../types/auth.types";

let currentMockUser: SessionUser = {
  id: "staff-dev-id",
  email: "staff@glowscan.vn",
  name: "Nhân viên GlowScan (Staff Dev)",
  provider: "local",
  roles: ["staff"],
  clinicId: null,
  isActive: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

export const authMock = {
  getSession: async (): Promise<SessionUser> => {
    return currentMockUser;
  },

  getAuthStatus: async (): Promise<AuthStatus> => {
    return { authenticated: true };
  },

  loginDirect: async (
    username: string,
    _guestToken?: string,
  ): Promise<MobileTokenResponse> => {
    void _guestToken;
    const lower = username.toLowerCase();
    const isStaff = lower.includes("staff");
    const isAdmin = lower.includes("admin");
    const isExpert = lower.includes("expert");

    const roles: string[] = isStaff
      ? ["staff"]
      : isAdmin
        ? ["app_admin"]
        : isExpert
          ? ["expert"]
          : ["staff"]; // Default to staff in dev mode for testing Staff flow

    currentMockUser = {
      id: isStaff ? "staff-dev-id" : "dev-user-id",
      email: username,
      name: isStaff ? "Nhân viên Vận hành (Staff)" : "Dev User",
      provider: "local",
      roles,
      clinicId: null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return {
      accessToken: "mock-access-token",
      refreshToken: "mock-refresh-token",
      expiresIn: 3600,
      user: {
        id: currentMockUser.id,
        username,
        email: username,
        roles,
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
        roles: ["staff"],
      },
    };
  },
};
