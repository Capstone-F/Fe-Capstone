import type { NextRequest } from "next/server";

import { appConfig } from "@/lib/env";

const hopByHopHeaders = new Set([
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
  const upstreamUrl = new URL(pathSegments.join("/"), normalizedBase);
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

  const body = ["GET", "HEAD"].includes(request.method)
    ? undefined
    : await request.arrayBuffer();

  const response = await fetch(
    buildUpstreamUrl(path ?? [], request.nextUrl.search),
    {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      redirect: "manual",
    },
  );

  return new Response(response.body, {
    status: response.status,
    headers: response.headers,
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
