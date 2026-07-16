export type SessionUser = {
  id: string;
  keycloakSub: string;
  email: string | null;
  name: string | null;
  provider: string;
  roles: string[];
  clinicId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthStatus = {
  authenticated: boolean;
};

export const DEV_BYPASS_SESSION_USER: SessionUser = {
  id: "dev-session-user",
  keycloakSub: "dev-bypass-sub",
  email: "designer@glowscan.local",
  name: "Design Review Mode",
  provider: "dev-bypass",
  roles: ["Customer"],
  clinicId: null,
  isActive: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};
