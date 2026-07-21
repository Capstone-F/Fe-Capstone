import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import type { Route } from "next";

import { LoginPanel } from "@/features/auth/components/login-panel";
import { sanitizeRedirectPath } from "@/shared/utils/safe-redirect";
import { appConfig } from "@/lib/env";

export type LoginPageProps = {
  searchParams: Promise<{
    redirectTo?: string;
  }>;
};

export async function LoginPage({ searchParams }: LoginPageProps) {
  const { redirectTo } = await searchParams;
  const targetRedirect = sanitizeRedirectPath(redirectTo);

  if (appConfig.devBypassAuth) {
    redirect(targetRedirect as Route);
  }

  const cookieStore = await cookies();

  if (cookieStore.has("sid")) {
    redirect(targetRedirect as Route);
  }

  return <LoginPanel redirectTo={targetRedirect} />;
}
