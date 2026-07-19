import { NextRequest, NextResponse } from "next/server";

import {
  getOperationsApiHeaders,
  OperationsSessionMissingError,
} from "@/lib/operations-api-auth";

export const runtime = "nodejs";

const apiUrl =
  process.env.RAMA_API_INTERNAL_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000/api/v1";

const routes = [
  { method: "GET", pattern: /^evidence\/queue$/ },
  { method: "POST", pattern: /^evidence\/[0-9a-f-]+\/(reviews|publish|expire|corrections|supersede)$/i },
  { method: "GET", pattern: /^ingestion\/sources$/ },
  { method: "GET", pattern: /^ingestion\/resolution-queue$/ },
  { method: "POST", pattern: /^ingestion\/partner-file$/ },
  { method: "POST", pattern: /^ingestion\/resolution-queue\/[0-9a-f-]+\/resolve$/i },
  { method: "GET", pattern: /^catalogue-index\/status$/ },
  { method: "POST", pattern: /^catalogue-index\/reconcile$/ },
] as const;

type RouteContext = { params: Promise<{ path: string[] }> };

const proxy = async (request: NextRequest, context: RouteContext): Promise<NextResponse> => {
  const { path: segments } = await context.params;
  const path = segments.join("/");
  if (!routes.some((route) => route.method === request.method && route.pattern.test(path))) {
    return NextResponse.json({ code: "OPERATIONS_ROUTE_FORBIDDEN" }, { status: 404 });
  }

  if (request.method !== "GET") {
    const origin = request.headers.get("origin");
    const fetchSite = request.headers.get("sec-fetch-site");
    const exactOrigin = origin ? new URL(origin).origin === request.nextUrl.origin : false;
    if (!exactOrigin && fetchSite !== "same-origin") {
      return NextResponse.json({ code: "OPERATIONS_ORIGIN_FORBIDDEN" }, { status: 403 });
    }
  }

  try {
    const authHeaders = await getOperationsApiHeaders();
    const headers = new Headers(authHeaders);
    let body: string | undefined;
    if (request.method !== "GET") {
      body = await request.text();
      if (Buffer.byteLength(body, "utf8") > 1_048_576 * 10) { // 10MB to allow CSVs
        return NextResponse.json({ code: "OPERATIONS_BODY_TOO_LARGE" }, { status: 413 });
      }
      headers.set("content-type", "application/json");
    }
    const upstream = await fetch(`${apiUrl}/${path}`, {
      method: request.method,
      headers,
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(path === "catalogue-index/reconcile" ? 120_000 : 10_000),
    });
    return new NextResponse(await upstream.arrayBuffer(), {
      status: upstream.status,
      headers: {
        "content-type": upstream.headers.get("content-type") ?? "application/json; charset=utf-8",
        "cache-control": "no-store",
      },
    });
  } catch (error) {
    if (error instanceof OperationsSessionMissingError) {
      return NextResponse.json({ code: "OPERATIONS_SESSION_REQUIRED" }, { status: 401 });
    }
    return NextResponse.json(
      { code: "OPERATIONS_UPSTREAM_UNAVAILABLE", message: "The operations API is unavailable." },
      { status: 502 },
    );
  }
};

export const GET = proxy;
export const POST = proxy;
