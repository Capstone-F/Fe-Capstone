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

export type StartLoginInput = {
  redirectTo?: string;
  idpHint?: "google";
};
