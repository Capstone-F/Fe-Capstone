import "axios";

declare module "axios" {
  interface AxiosRequestConfig {
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    preferGuestAuth?: boolean;
  }

  interface InternalAxiosRequestConfig {
    _retry?: boolean;
    skipAuth?: boolean;
    skipAuthRefresh?: boolean;
    preferGuestAuth?: boolean;
  }
}
