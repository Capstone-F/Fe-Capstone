import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function proxy(request: NextRequest) {
  const devBypassAuth =
    process.env.NODE_ENV !== "production" &&
    process.env.NEXT_PUBLIC_DEV_BYPASS_AUTH === "true";
  const hasSession = Boolean(request.cookies.get("sid")?.value);
  const { pathname, search } = request.nextUrl;

  if (devBypassAuth) {
    if (pathname === "/login") {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }

    return NextResponse.next();
  }

  if (pathname === "/login" && hasSession) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/scan") ||
      pathname.startsWith("/survey")) &&
    !hasSession
  ) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirectTo", `${pathname}${search}`);

    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/scan/:path*",
    "/scan",
    "/survey/:path*",
    "/survey",
    "/login",
  ],
};
