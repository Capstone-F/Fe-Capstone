import type { NextRequest } from "next/server";

import { appConfig } from "@/lib/env";

const hopByHopHeaders = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
]);

function buildUpstreamUrl(pathSegments: string[], search: string) {
  const normalizedBase = appConfig.backendApiUrl.endsWith("/")
    ? appConfig.backendApiUrl
    : `${appConfig.backendApiUrl}/`;

  // Translate /auth/me to /users/me to match BE canonical profile endpoint
  const targetSegments =
    pathSegments.length === 2 &&
    pathSegments[0] === "auth" &&
    pathSegments[1] === "me"
      ? ["users", "me"]
      : pathSegments;

  const upstreamUrl = new URL(targetSegments.join("/"), normalizedBase);
  upstreamUrl.search = search;

  return upstreamUrl;
}

async function proxyRequest(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  const headers = new Headers(request.headers);

  for (const header of hopByHopHeaders) {
    headers.delete(header);
  }

  const upstreamUrl = buildUpstreamUrl(path ?? [], request.nextUrl.search);
  if (upstreamUrl.hostname.endsWith(".ngrok-free.app")) {
    headers.set("ngrok-skip-browser-warning", "true");
  }

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  const response = await fetch(upstreamUrl, {
    method: request.method,
    headers,
    body,
    cache: "no-store",
    redirect: "manual",
  });

  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("content-encoding");
  responseHeaders.delete("content-length");

  return new Response(response.body, {
    status: response.status,
    headers: responseHeaders,
  });
}

export const dynamic = "force-dynamic";

export function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export function PUT(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export function PATCH(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}

export function OPTIONS(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxyRequest(request, context);
}
