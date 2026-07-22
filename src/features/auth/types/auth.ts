export type SessionUser = {
  id: string;
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
