export function hasRole(
  roles: string[] | undefined | null,
  targetRole: string,
): boolean {
  if (!roles || !Array.isArray(roles)) return false;
  const target = targetRole.toLowerCase();
  return roles.some((r) => {
    if (typeof r !== "string") return false;
    const lower = r.toLowerCase();
    return (
      lower === target ||
      lower === `role_${target}` ||
      lower === `${target}_role`
    );
  });
}

export function isManagementRole(roles: string[] | undefined | null): boolean {
  return hasRole(roles, "app_admin") || hasRole(roles, "staff");
}

export function isClinicManagerRole(
  roles: string[] | undefined | null,
): boolean {
  return hasRole(roles, "clinic_manager");
}

export function isExpertRole(roles: string[] | undefined | null): boolean {
  return hasRole(roles, "expert");
}

export function getRoleBasedRedirectPath(
  roles: string[] | undefined | null,
  fallback?: string,
): string {
  if (hasRole(roles, "clinic_manager")) {
    return "/clinic/experts";
  }
  if (hasRole(roles, "staff")) {
    return "/staff";
  }
  if (hasRole(roles, "app_admin")) {
    return "/dashboard/experts";
  }
  if (isExpertRole(roles)) {
    return "/expert";
  }
  if (fallback && fallback !== "/" && fallback !== "/login") {
    return fallback;
  }
  return "/";
}
