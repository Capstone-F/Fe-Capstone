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

export interface MobileTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: unknown;
}

// Convention names matching core refresh handlers
export interface LoginRequestDto {
  username?: string;
  email?: string;
  password?: string;
}

export type LoginResponse = MobileTokenResponse;

export interface RefreshTokenRequestDto {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type UserProfile = SessionUser;
